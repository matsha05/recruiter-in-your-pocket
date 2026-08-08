import { existsSync } from "node:fs";
import { lstat, readFile, readdir, realpath } from "node:fs/promises";
import path from "node:path";
import type { ErrorCode } from "../../evals/types";
import {
  canonicalJsonSha256,
  isFullGitSha,
  isPathInside,
  isSafeRepositoryPath,
  resolveContainedExistingPath,
  sha256,
} from "../integrity";
import {
  GAUNTLET_RUNTIME_CLOSURE_PATHS,
  type CandidateBinding,
  type ContentReceipt,
  type DependencyClosureReceipt,
  type GauntletDimension,
  type GauntletIteration,
  type GauntletOutputArtifact,
  type JourneyRun,
  type ReferenceAssessment,
  type RuntimeClosureReceipt,
  type SourceAudit,
  type Variant,
} from "../types";

export const SOURCE_INTEGRITY_CODES = new Set<ErrorCode>([
  "E_EVIDENCE_NOT_VERBATIM",
  "E_REWRITE_ORIGINAL_NOT_VERBATIM",
  "E_REWRITE_INVENTED_SPECIFIC",
  "E_REWRITE_OWNERSHIP_INFLATION",
  "E_REWRITE_OUTCOME_INFLATION",
  "E_REWRITE_SOURCE_DRIFT",
  "E_REWRITE_DROPPED_EVIDENCE",
  "E_FIX_ALREADY_SATISFIED",
  "E_FIX_EVIDENCE_MISMATCH",
  "E_BIGGEST_GAP_NOT_VERBATIM",
  "E_BIGGEST_GAP_CONTRADICTS_SOURCE",
]);

export const JOURNEY_FRESHNESS_MS = 48 * 60 * 60 * 1000;
export const ITERATION_002_CANDIDATE_REF = "codex/gauntlet-iteration-002";

export type LoadedArtifact = {
  artifact: GauntletOutputArtifact;
  sha256: string;
};

export type AutomatedCheck = {
  caseId: string;
  errors: Array<{ code: ErrorCode; message: string }>;
  sourceIntegrityErrors: Array<{ code: ErrorCode; message: string }>;
};

export type ResolvedBlindJudgment = {
  caseId: string;
  reviewer: string;
  reviewedAt: string;
  preferences: Record<GauntletDimension, Variant | "tie">;
  rationale: Record<GauntletDimension, string>;
};

export type LoadedEvidence = {
  candidateOutputs: Map<string, LoadedArtifact>;
  productionOutputs: Map<string, LoadedArtifact>;
  automatedChecks: Map<string, AutomatedCheck>;
  blindJudgments: Map<string, ResolvedBlindJudgment>;
  sourceAudits: Map<string, SourceAudit>;
  referenceAssessments: Map<string, ReferenceAssessment>;
  journeys: Map<string, JourneyRun>;
  criticValid: boolean;
  sealValid: boolean;
  gitAnchorValid: boolean;
  anchorCommit: string | null;
  evidenceCommit: string | null;
  repositoryAvailable: boolean;
  dataIssues: string[];
};

export type IterationLedger = {
  iteration: GauntletIteration;
  raw: string;
  sha256: string;
  filePath: string;
};

export function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function isSha256(value: unknown): value is string {
  return typeof value === "string" && /^[a-f0-9]{64}$/i.test(value);
}

export function isIsoTimestamp(value: unknown): value is string {
  return isNonEmptyString(value) && !Number.isNaN(Date.parse(value));
}

export function isSafeFixtureId(value: unknown): value is string {
  return typeof value === "string" && /^[a-z0-9][a-z0-9_-]*$/.test(value);
}

export function hasExactKeys(value: Record<string, unknown>, keys: string[]) {
  return Object.keys(value).sort().join("\0") === [...keys].sort().join("\0");
}

export function captureRuntimeReceiptIssues(input: {
  value: unknown;
  variant: Variant;
  caseId: unknown;
  bindingCommit: unknown;
  reportSha256: unknown;
}) {
  const issues: string[] = [];
  if (!isRecord(input.value)
    || !hasExactKeys(input.value, ["archiveIdentity", "renderedReport"])) {
    return ["presentation.captureReceipt is missing or malformed"];
  }
  const archive = input.value.archiveIdentity;
  const rendered = input.value.renderedReport;
  if (!isRecord(archive)
    || !hasExactKeys(archive, ["schemaVersion", "nonce", "variant", "commit"])
    || archive.schemaVersion !== "1"
    || typeof archive.nonce !== "string"
    || !/^[a-f0-9]{48}$/.test(archive.nonce)
    || archive.variant !== input.variant
    || !isFullGitSha(archive.commit)
    || archive.commit !== input.bindingCommit) {
    issues.push("presentation capture archive identity is invalid or does not match the bound variant commit");
  }
  if (!isRecord(rendered)
    || !hasExactKeys(rendered, [
      "schemaVersion",
      "nonce",
      "variant",
      "commit",
      "caseId",
      "component",
      "reportSha256",
    ])
    || rendered.schemaVersion !== "1"
    || rendered.nonce !== (isRecord(archive) ? archive.nonce : null)
    || rendered.variant !== input.variant
    || rendered.commit !== input.bindingCommit
    || rendered.caseId !== input.caseId
    || rendered.component !== "ReportStream"
    || !isSha256(rendered.reportSha256)
    || rendered.reportSha256 !== input.reportSha256) {
    issues.push("presentation rendered-report receipt does not match the exact ReportStream artifact");
  }
  return issues;
}

export function timestampInsideIteration(timestamp: string, iteration: GauntletIteration) {
  const instant = Date.parse(timestamp);
  const lower = Date.parse(iteration.createdAt);
  const upper = iteration.seal ? Date.parse(iteration.seal.sealedAt) : Date.now() + 5 * 60 * 1000;
  return instant >= lower && instant <= upper;
}

export function receiptComplete(value: unknown): value is ContentReceipt {
  return isRecord(value) && isSafeRepositoryPath(value.path) && isSha256(value.sha256);
}

function runtimeClosureComplete(value: unknown): value is RuntimeClosureReceipt {
  if (!isRecord(value)
    || !hasExactKeys(value, ["files", "sha256"])
    || !Array.isArray(value.files)
    || !isSha256(value.sha256)
    || value.files.length !== GAUNTLET_RUNTIME_CLOSURE_PATHS.length
    || !value.files.every(receiptComplete)) return false;
  const expectedPaths = [...GAUNTLET_RUNTIME_CLOSURE_PATHS];
  const actualPaths = value.files.map((entry) => entry.path);
  return actualPaths.every((entry, index) => entry === expectedPaths[index])
    && new Set(actualPaths).size === actualPaths.length
    && canonicalJsonSha256(value.files) === value.sha256;
}

function dependencyClosureComplete(value: unknown): value is DependencyClosureReceipt {
  if (!isRecord(value)
    || !hasExactKeys(value, ["packageLock", "hiddenLock", "installedTree"])
    || !isRecord(value.packageLock)
    || !hasExactKeys(value.packageLock, [
      "path",
      "sha256",
      "productionCommit",
      "productionSha256",
      "candidateCommit",
      "candidateSha256",
      "worktreeSha256",
    ])
    || value.packageLock.path !== "web/package-lock.json"
    || !isFullGitSha(value.packageLock.productionCommit)
    || !isFullGitSha(value.packageLock.candidateCommit)
    || ![
      value.packageLock.sha256,
      value.packageLock.productionSha256,
      value.packageLock.candidateSha256,
      value.packageLock.worktreeSha256,
    ].every(isSha256)
    || new Set([
      value.packageLock.sha256,
      value.packageLock.productionSha256,
      value.packageLock.candidateSha256,
      value.packageLock.worktreeSha256,
    ]).size !== 1
    || !isRecord(value.hiddenLock)
    || !hasExactKeys(value.hiddenLock, ["path", "sha256"])
    || value.hiddenLock.path !== "web/node_modules/.package-lock.json"
    || !isSha256(value.hiddenLock.sha256)
    || !isRecord(value.installedTree)
    || !hasExactKeys(value.installedTree, ["platform", "arch", "packageCount", "sha256"])
    || typeof value.installedTree.platform !== "string"
    || !/^[a-z0-9_-]+$/.test(value.installedTree.platform)
    || typeof value.installedTree.arch !== "string"
    || !/^[A-Za-z0-9_-]+$/.test(value.installedTree.arch)
    || !Number.isInteger(value.installedTree.packageCount)
    || Number(value.installedTree.packageCount) < 1
    || !isSha256(value.installedTree.sha256)) return false;
  return true;
}

export function dependencyTreeMatchesCurrentHost(
  installedTree: Pick<DependencyClosureReceipt["installedTree"], "platform" | "arch">,
) {
  return installedTree.platform === process.platform && installedTree.arch === process.arch;
}

export function hasCompleteBinding(binding: CandidateBinding) {
  if (!isRecord(binding)) return false;
  const baseComplete = isNonEmptyString(binding.ref)
    && ["deployed_baseline", "not_deployed"].includes(String(binding.deploymentStatus))
    && isFullGitSha(binding.commit)
    && isNonEmptyString(binding.model)
    && receiptComplete(binding.resumePrompt)
    && receiptComplete(binding.renderer);
  if (!baseComplete) return false;
  const runtimeComplete = binding.runtimeClosure === undefined
    || binding.runtimeClosure === null
    || runtimeClosureComplete(binding.runtimeClosure);
  const dependenciesComplete = binding.dependencyClosure === undefined
    || binding.dependencyClosure === null
    || dependencyClosureComplete(binding.dependencyClosure);
  return runtimeComplete && dependenciesComplete;
}

export function isUnboundIteration002Candidate(binding: CandidateBinding) {
  return isRecord(binding)
    && binding.ref === ITERATION_002_CANDIDATE_REF
    && binding.deploymentStatus === "not_deployed"
    && binding.commit === null
    && binding.model === null
    && binding.resumePrompt === null
    && binding.renderer === null
    && (binding.runtimeClosure === undefined || binding.runtimeClosure === null)
    && (binding.dependencyClosure === undefined || binding.dependencyClosure === null);
}

export function receiptMatches(left: ContentReceipt | null, right: ContentReceipt | null) {
  return left?.path === right?.path && left?.sha256 === right?.sha256;
}

export function bindingsMatch(expected: CandidateBinding, actual: CandidateBinding) {
  return expected.ref === actual.ref
    && expected.deploymentStatus === actual.deploymentStatus
    && expected.commit === actual.commit
    && expected.model === actual.model
    && receiptMatches(expected.resumePrompt, actual.resumePrompt)
    && receiptMatches(expected.renderer, actual.renderer)
    && canonicalJsonSha256(expected.runtimeClosure ?? null)
      === canonicalJsonSha256(actual.runtimeClosure ?? null)
    && canonicalJsonSha256(expected.dependencyClosure ?? null)
      === canonicalJsonSha256(actual.dependencyClosure ?? null);
}

export function resolveWebRoot(explicitRoot?: string) {
  if (explicitRoot) return path.resolve(explicitRoot);
  const cwd = process.cwd();
  return existsSync(path.join(cwd, "gauntlet")) ? cwd : path.join(cwd, "web");
}

export async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await readFile(filePath, "utf8")) as T;
}

export async function resolveContainedRegularDirectory(root: string, relativePath: string, label: string) {
  const candidate = path.join(root, relativePath);
  const stats = await lstat(candidate);
  if (stats.isSymbolicLink() || !stats.isDirectory()) {
    throw new Error(`${label} must be a regular directory inside its approved root`);
  }
  try {
    return await resolveContainedExistingPath(root, relativePath);
  } catch (error) {
    throw new Error(`${label} escapes its approved root: ${(error as Error).message}`);
  }
}

export async function readJsonDirectory<T>(artifactRoot: string, relativeDirectory: string, issues: string[]) {
  const records: Array<{ filePath: string; raw: string; value: T }> = [];
  const directory = path.join(artifactRoot, relativeDirectory);
  if (!existsSync(directory)) return records;
  try {
    const directoryReal = await resolveContainedRegularDirectory(
      artifactRoot,
      relativeDirectory,
      relativeDirectory,
    );
    const entries = await readdir(directoryReal, { withFileTypes: true });
    for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
      if (!entry.name.endsWith(".json")) continue;
      const component = entry.name.slice(0, -5);
      if (!/^[a-z0-9][a-z0-9_-]*$/.test(component) || entry.isSymbolicLink() || !entry.isFile()) {
        issues.push(`${path.relative(process.cwd(), path.join(directory, entry.name))}: unsafe evidence filename or file type`);
        continue;
      }
      const filePath = path.join(directoryReal, entry.name);
      const fileReal = await realpath(filePath);
      if (!isPathInside(directoryReal, fileReal)) {
        issues.push(`${entry.name}: evidence file escapes its directory`);
        continue;
      }
      const raw = await readFile(fileReal, "utf8");
      try {
        records.push({ filePath: fileReal, raw, value: JSON.parse(raw) as T });
      } catch (error) {
        issues.push(`${path.relative(process.cwd(), fileReal)} is not valid JSON: ${(error as Error).message}`);
      }
    }
  } catch (error) {
    issues.push(`${relativeDirectory}: evidence directory is unsafe or unreadable: ${(error as Error).message}`);
  }
  return records;
}

export async function resolveArtifactRoot(webRoot: string, iterationId: string, issues: string[]) {
  if (!/^[a-z0-9][a-z0-9_-]*$/.test(iterationId)) throw new Error("iteration id is unsafe");
  const base = path.join(webRoot, "gauntlet/artifacts");
  if (!existsSync(base)) return path.join(base, iterationId);
  let baseReal: string;
  try {
    baseReal = await resolveContainedRegularDirectory(
      webRoot,
      "gauntlet/artifacts",
      "gauntlet/artifacts",
    );
  } catch (error) {
    issues.push(`gauntlet/artifacts is unsafe: ${(error as Error).message}`);
    return path.join(webRoot, "gauntlet/__invalid_artifact_root__");
  }
  const candidate = path.join(baseReal, iterationId);
  if (!existsSync(candidate)) return candidate;
  const stats = await lstat(candidate);
  if (stats.isSymbolicLink() || !stats.isDirectory()) {
    issues.push(`${iterationId}: artifact root must be a regular directory`);
    return path.join(baseReal, "__invalid_artifact_root__");
  }
  const candidateReal = await realpath(candidate);
  if (!isPathInside(baseReal, candidateReal)) {
    issues.push(`${iterationId}: artifact root escapes gauntlet/artifacts`);
    return path.join(baseReal, "__invalid_artifact_root__");
  }
  return candidateReal;
}
