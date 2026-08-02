import { existsSync } from "node:fs";
import { lstat, mkdir, readFile, readdir, realpath, writeFile } from "node:fs/promises";
import path from "node:path";
import { runAllChecks } from "../evals/checks";
import type { CalibrationData, ErrorCode } from "../evals/types";
import { observedInstalledTreeReceipt } from "./dependency-closure";
import {
  assertSafeComponent,
  artifactFileReceipts,
  canonicalJsonSha256,
  dirtyRepositoryPaths,
  findRepositoryRoot,
  gitCommitParents,
  gitDiffPaths,
  gitFileIntroductionCommits,
  gitHead,
  hashArtifactTree,
  isFullGitSha,
  isAncestorCommit,
  isPathInside,
  isSafeComponent,
  isSafeRepositoryPath,
  listGitTree,
  readGitObjects,
  readGitBlob,
  resolveContainedExistingPath,
  resolveRealCommit,
  sha256,
} from "./integrity";
import {
  GAUNTLET_CAPTURE_CONTRACT,
  GAUNTLET_FINALIZED_CAPTURE_STATEMENT,
  GAUNTLET_FINALIZER_PATH,
  GAUNTLET_RUNTIME_CLOSURE_PATHS,
  GAUNTLET_VALIDATOR_PATH,
  GAUNTLET_DIMENSIONS,
  type BlindArtifactBinding,
  type BlindJudgment,
  type BlindMapping,
  type BlindPacket,
  type CandidateBinding,
  type CaseProgress,
  type CaseVariantInspection,
  type ContentReceipt,
  type DependencyClosureReceipt,
  type DimensionProgress,
  type GauntletCase,
  type GauntletAnchor,
  type GauntletDimension,
  type GauntletIteration,
  type GauntletManifest,
  type GauntletOutputArtifact,
  type GauntletProgressSnapshot,
  type GateStatus,
  type IterationLedgerSummary,
  type JourneyRun,
  type ReferenceAssessment,
  type ReportFinalizationReceipt,
  type RequiredJourney,
  type RuntimeClosureReceipt,
  type SourceAudit,
  type Variant,
} from "./types";

const SOURCE_INTEGRITY_CODES = new Set<ErrorCode>([
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

const CANONICAL_RESUME_PROMPT = "web/prompts/resume_v2.txt";
const CANONICAL_RENDERER_PREFIXES = [
  "web/components/workspace/report/",
  "web/lib/reports/",
];
const JOURNEY_FRESHNESS_MS = 48 * 60 * 60 * 1000;
const LEGACY_CAPTURE_ITERATION = Object.freeze({
  id: "iteration-001",
  createdAt: "2026-07-31T15:44:00.000Z",
  productionCommit: "53ae48cc41df97c6d8dcaebb5bfc458b080bf581",
  candidateCommit: "3a85bb583458bbab9c74648a6106f5b87ada3dc6",
  ledgerSha256: "da27e27513ccf53df10fbe2d247dd5a3606ea48b1693cffa919f0d51525ca9d2",
  outputSetSha256: "5db7f164600985d61e7a7246d5fadd953fd48f0bce1fcb1ca63c33cbb7f14c1d",
});
const LEGACY_CAPTURE_OUTPUT_SHA256: Readonly<Record<string, string>> = Object.freeze({
  "candidate/data-science-senior-elite": "f3504e162032144e55c20df97ab0b104c570fd5f36b154bfa793be0dfda953c1",
  "candidate/finance-senior-weak": "0b9950e1beedc55f352169eae7382f5d7d4f3b147faf770f61017103cda8fda4",
  "candidate/hr-director-foundation": "bbe452e461442556a82674972633358f3d69347ff75c74837f61b3a607f2f421",
  "candidate/marketing-vp-elite": "d8fbba280895d6b877b4785c183383e11f5a1b5141ec8b9decad5e67d6758601",
  "candidate/operations-entry-weak": "f288856d4c14664461a8f033383d6a208c34bf7da8f98d7355dddefcb318fee4",
  "candidate/product-entry-elite": "441290a2dbc802c26be10dca8d97850dd92b3cdffa85f44acd01e2bb4faa1fc7",
  "candidate/project-management-vp-strong": "64400f7baf2ccf5d63aec46c140611ab3c21282a08c616fb6b6e8a9c1f9149c3",
  "candidate/sales-mid-foundation": "7e17acd50dd96d5455ed721a2c526ff639dcacc78e826bb9c68836060f323057",
  "candidate/software-engineering-mid-strong": "a846346ac99564ed755a2edcbe9a8ab22c8e5b6d5d654dc32d34e2552581640d",
  "candidate/staff-ml-elite": "379ebdeed628ed05fd5b796ff8be6dd9777c2946d019167ff63bb7dcd27e354c",
  "candidate/ux-director-strong": "33a3d03a815bda9f752f75295d1e77c6e3cf359e1ad285bb457c4f06b84580f1",
  "candidate/vp-talent-elite": "44991385116cca97ab7e543b7c19114635d581dde5b852b685003e7166a4a27d",
  "production/data-science-senior-elite": "2ac02de28f5f4450e88d1f5a500f9f25b1d8a308d09a427aa23149456e457d69",
  "production/finance-senior-weak": "b22ee5304f450283e11a1176a540ac15fd2fbd1ec66b0f189f2c4ac384c9bc72",
  "production/hr-director-foundation": "6956415323edbb007dd9b0a3c3c29e9eefe2fa3226bf02b815d01a13942ceeb2",
  "production/marketing-vp-elite": "fd7dd2390702cca5365db99dad3afb5bd53d5228adbab8ce7ab9221a99e4ca77",
  "production/operations-entry-weak": "f9437a3f0938e67d4955be09ade45a21b7e4818088e9e20f2d4520a17ee4a68a",
  "production/product-entry-elite": "749747bae8daf78afd2bb285464832fbe32994c2f478ab73f41e3ba828ce9367",
  "production/project-management-vp-strong": "cf34e817947bc301360175e38a75d02c5f48da3bacb7d0064791ecf3936aef11",
  "production/sales-mid-foundation": "2a63cc9b6e876deed42e93e695c142e8b71540fcf16897e098dbe434b9ce0442",
  "production/software-engineering-mid-strong": "315b24b9eb78585fe16e4e2549f8fe5b85e63bffccb89bb327c4bfc2b051cd5e",
  "production/staff-ml-elite": "96ae9d4ed2ec5d2b22fd28d7f15f1a06191db8de93dcc9d5448ee127b7fb8909",
  "production/ux-director-strong": "2c5088d8db82d6a87a6d4fff0667fdfc4fe81aa993d7910744816fafa346a6ba",
  "production/vp-talent-elite": "cafe677a529a2928a35c6169f0851a50068968e38ea23fba7e0254ac8f6e19d4",
});

type FrozenLegacyOutputRecord = Readonly<{
  filePath: string;
  raw: Buffer;
  sha256: string;
}>;

type LegacyCaptureSnapshot = Readonly<Record<Variant, readonly FrozenLegacyOutputRecord[]>>;

type LegacyCaptureAuthorization =
  | Readonly<{ authorized: false; claimed: boolean; snapshot: null }>
  | Readonly<{ authorized: true; claimed: true; snapshot: LegacyCaptureSnapshot }>;

export type GauntletProgressIntegrityHooks = Readonly<{
  afterLegacySnapshot?: () => void | Promise<void>;
}>;

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
  sealValid: boolean;
  gitAnchorValid: boolean;
  anchorCommit: string | null;
  evidenceCommit: string | null;
  repositoryAvailable: boolean;
  dataIssues: string[];
};

type IterationLedger = {
  iteration: GauntletIteration;
  raw: string;
  sha256: string;
  filePath: string;
};

export class UnknownGauntletIterationError extends Error {}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isSha256(value: unknown): value is string {
  return typeof value === "string" && /^[a-f0-9]{64}$/i.test(value);
}

function isIsoTimestamp(value: unknown): value is string {
  return isNonEmptyString(value) && !Number.isNaN(Date.parse(value));
}

function isSafeFixtureId(value: unknown): value is string {
  return typeof value === "string" && /^[a-z0-9][a-z0-9_-]*$/.test(value);
}

function hasExactKeys(value: Record<string, unknown>, keys: string[]) {
  return Object.keys(value).sort().join("\0") === [...keys].sort().join("\0");
}

function captureRuntimeReceiptIssues(input: {
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

function timestampInsideIteration(timestamp: string, iteration: GauntletIteration) {
  const instant = Date.parse(timestamp);
  const lower = Date.parse(iteration.createdAt);
  const upper = iteration.seal ? Date.parse(iteration.seal.sealedAt) : Date.now() + 5 * 60 * 1000;
  return instant >= lower && instant <= upper;
}

function receiptComplete(value: unknown): value is ContentReceipt {
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
  const baseComplete = isFullGitSha(binding.commit)
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

function receiptMatches(left: ContentReceipt | null, right: ContentReceipt | null) {
  return left?.path === right?.path && left?.sha256 === right?.sha256;
}

function bindingsMatch(expected: CandidateBinding, actual: CandidateBinding) {
  return expected.commit === actual.commit
    && expected.model === actual.model
    && receiptMatches(expected.resumePrompt, actual.resumePrompt)
    && receiptMatches(expected.renderer, actual.renderer)
    && canonicalJsonSha256(expected.runtimeClosure ?? null)
      === canonicalJsonSha256(actual.runtimeClosure ?? null)
    && canonicalJsonSha256(expected.dependencyClosure ?? null)
      === canonicalJsonSha256(actual.dependencyClosure ?? null);
}

function resolveWebRoot(explicitRoot?: string) {
  if (explicitRoot) return path.resolve(explicitRoot);
  const cwd = process.cwd();
  return existsSync(path.join(cwd, "gauntlet")) ? cwd : path.join(cwd, "web");
}

async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await readFile(filePath, "utf8")) as T;
}

function validateIterationShape(iteration: GauntletIteration, ledgerName: string) {
  const issues: string[] = [];
  if (!isRecord(iteration) || iteration.schemaVersion !== "2") {
    return [`${ledgerName}: schemaVersion must be 2`];
  }
  if (!isSafeComponent(iteration.id)) issues.push(`${ledgerName}: id is unsafe`);
  if (!isNonEmptyString(iteration.label)) issues.push(`${ledgerName}: label is missing`);
  if (!isIsoTimestamp(iteration.createdAt)) issues.push(`${ledgerName}: createdAt must be an ISO timestamp`);
  if (!["baseline_pending", "collecting", "complete"].includes(iteration.status)) {
    issues.push(`${ledgerName}: status is invalid`);
  }
  if (!isRecord(iteration.builder)
    || !isNonEmptyString(iteration.builder.change)
    || !isNonEmptyString(iteration.builder.claim)) {
    issues.push(`${ledgerName}: builder change and claim are required`);
  }
  if (!isRecord(iteration.critic)
    || !["pending", "pass", "fail"].includes(iteration.critic.verdict)
    || !isNonEmptyString(iteration.critic.rationale)
    || !isNonEmptyString(iteration.critic.remainingGap)) {
    issues.push(`${ledgerName}: critic verdict, rationale, and remaining gap are required`);
  }
  if (iteration.status === "complete" && !iteration.seal) {
    issues.push(`${ledgerName}: a complete iteration requires an evidence seal`);
  }
  if (iteration.status !== "complete" && iteration.seal) {
    issues.push(`${ledgerName}: only a complete iteration may be sealed`);
  }
  if (iteration.seal && (!isIsoTimestamp(iteration.seal.sealedAt)
    || !isSha256(iteration.seal.caseSetSha256)
    || !isSha256(iteration.seal.artifactSetSha256))) {
    issues.push(`${ledgerName}: seal is incomplete`);
  }
  if (iteration.seal && isIsoTimestamp(iteration.createdAt) && isIsoTimestamp(iteration.seal.sealedAt)
    && Date.parse(iteration.seal.sealedAt) < Date.parse(iteration.createdAt)) {
    issues.push(`${ledgerName}: seal predates iteration creation`);
  }
  if (iteration.previous && (!isSafeComponent(iteration.previous.iterationId)
    || !isSha256(iteration.previous.ledgerSha256))) {
    issues.push(`${ledgerName}: previous ledger receipt is invalid`);
  }
  return issues;
}

async function resolveContainedRegularDirectory(root: string, relativePath: string, label: string) {
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

async function enumerateIterationLedgers(webRoot: string) {
  const issues: string[] = [];
  const directoryReal = await resolveContainedRegularDirectory(
    webRoot,
    "gauntlet/iterations",
    "gauntlet/iterations",
  );
  const entries = await readdir(directoryReal, { withFileTypes: true });
  const ledgers: IterationLedger[] = [];

  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    if (!entry.name.endsWith(".json")) continue;
    const id = entry.name.slice(0, -5);
    if (!isSafeComponent(id)) {
      issues.push(`unsafe iteration ledger filename: ${entry.name}`);
      continue;
    }
    if (entry.isSymbolicLink() || !entry.isFile()) {
      issues.push(`${entry.name}: iteration ledger must be a regular file`);
      continue;
    }
    const filePath = path.join(directoryReal, entry.name);
    const fileReal = await realpath(filePath);
    if (!isPathInside(directoryReal, fileReal)) {
      issues.push(`${entry.name}: iteration ledger escapes the ledger directory`);
      continue;
    }
    const raw = await readFile(fileReal, "utf8");
    let iteration: GauntletIteration;
    try {
      iteration = JSON.parse(raw) as GauntletIteration;
    } catch (error) {
      issues.push(`${entry.name}: invalid JSON: ${(error as Error).message}`);
      continue;
    }
    issues.push(...validateIterationShape(iteration, entry.name));
    if (iteration.id !== id) issues.push(`${entry.name}: id does not match filename`);
    ledgers.push({ iteration, raw, sha256: sha256(raw), filePath: fileReal });
  }

  for (let index = 0; index < ledgers.length; index += 1) {
    const current = ledgers[index];
    const previous = ledgers[index - 1];
    if (!previous && current.iteration.previous !== null) {
      issues.push(`${path.basename(current.filePath)}: first ledger must not name a previous iteration`);
    }
    if (previous && (current.iteration.previous?.iterationId !== previous.iteration.id
      || current.iteration.previous.ledgerSha256 !== previous.sha256)) {
      issues.push(`${path.basename(current.filePath)}: previous ledger receipt is stale or broken`);
    }
  }
  return { ledgers, issues };
}

export function caseSetSha256(manifest: GauntletManifest) {
  return canonicalJsonSha256({
    target: manifest.target,
    competitorReferences: manifest.competitorReferences,
    requiredJourneys: manifest.requiredJourneys,
    cases: manifest.cases,
  });
}

export function currentCandidateCleanlinessIssue(
  variant: Variant,
  commit: string,
  head: string,
  dirtyPaths: string,
) {
  if (variant !== "candidate" || commit !== head || dirtyPaths.trim().length === 0) return null;
  return "candidate runtime, capture harness, or dependency inputs are dirty relative to the bound HEAD commit";
}

export function bindingPathsForCleanliness(binding: CandidateBinding) {
  return Array.from(new Set([
    binding.resumePrompt?.path,
    binding.renderer?.path,
    ...(binding.runtimeClosure?.files.map((entry) => entry.path) ?? []),
    binding.dependencyClosure?.packageLock.path,
  ].filter((entry): entry is string => Boolean(entry))));
}

async function validateBindingAgainstRepository(
  repositoryRoot: string,
  binding: CandidateBinding,
  variant: Variant,
  repositoryAvailable = true,
) {
  const issues: string[] = [];
  const hasAnyValue = Boolean(binding.commit
    || binding.model
    || binding.resumePrompt
    || binding.renderer
    || binding.runtimeClosure
    || binding.dependencyClosure);
  if (!hasAnyValue) return issues;
  if (!hasCompleteBinding(binding)) return [`${variant} binding is partial or malformed`];
  if (!repositoryAvailable) {
    return [`${variant} binding cannot be verified because Git metadata is unavailable on this host`];
  }
  const commit = binding.commit!;
  const resumePrompt = binding.resumePrompt!;
  const renderer = binding.renderer!;
  if (resumePrompt.path !== CANONICAL_RESUME_PROMPT) {
    issues.push(`${variant} resume prompt must use ${CANONICAL_RESUME_PROMPT}`);
  }
  if (!CANONICAL_RENDERER_PREFIXES.some((prefix) => renderer.path.startsWith(prefix))) {
    issues.push(`${variant} renderer is not in a canonical report-renderer path`);
  }
  try {
    await resolveRealCommit(repositoryRoot, commit);
    const [promptBlob, rendererBlob] = await Promise.all([
      readGitBlob(repositoryRoot, commit, resumePrompt.path),
      readGitBlob(repositoryRoot, commit, renderer.path),
    ]);
    if (sha256(promptBlob) !== resumePrompt.sha256) {
      issues.push(`${variant} prompt receipt does not match the bound commit`);
    }
    if (sha256(rendererBlob) !== renderer.sha256) {
      issues.push(`${variant} renderer receipt does not match the bound commit`);
    }
    if (binding.runtimeClosure) {
      const closureBlobs = await Promise.all(binding.runtimeClosure.files.map(async (receipt) => ({
        receipt,
        bytes: await readGitBlob(repositoryRoot, commit, receipt.path),
      })));
      for (const { receipt, bytes } of closureBlobs) {
        if (sha256(bytes) !== receipt.sha256) {
          issues.push(`${variant} runtime-closure receipt is stale for ${receipt.path}`);
        }
      }
      if (!binding.runtimeClosure.files.some((receipt) => receipt.path === GAUNTLET_VALIDATOR_PATH)) {
        issues.push(`${variant} runtime closure does not bind the report validator`);
      }
    }
    if (binding.dependencyClosure) {
      const dependency = binding.dependencyClosure;
      const [committedLock, productionLock, candidateLock, worktreeLock] = await Promise.all([
        readGitBlob(repositoryRoot, commit, dependency.packageLock.path),
        readGitBlob(
          repositoryRoot,
          dependency.packageLock.productionCommit,
          dependency.packageLock.path,
        ),
        readGitBlob(
          repositoryRoot,
          dependency.packageLock.candidateCommit,
          dependency.packageLock.path,
        ),
        readFile(await resolveContainedExistingPath(repositoryRoot, dependency.packageLock.path)),
      ]);
      if (sha256(committedLock) !== dependency.packageLock.sha256) {
        issues.push(`${variant} dependency lock receipt does not match the bound commit`);
      }
      if (sha256(productionLock) !== dependency.packageLock.productionSha256
        || sha256(candidateLock) !== dependency.packageLock.candidateSha256) {
        issues.push(`${variant} production or candidate dependency-lock receipt is stale`);
      }
      if (sha256(worktreeLock) !== dependency.packageLock.worktreeSha256) {
        issues.push(`${variant} dependency lock receipt does not match the capture worktree`);
      }
      const sameInstalledPlatform = dependencyTreeMatchesCurrentHost(dependency.installedTree);
      if (sameInstalledPlatform) {
        const hiddenLockPath = path.join(repositoryRoot, dependency.hiddenLock.path);
        const [repositoryReal, hiddenLockReal, hiddenLockStats] = await Promise.all([
          realpath(repositoryRoot),
          realpath(hiddenLockPath),
          lstat(hiddenLockPath),
        ]);
        if (!isPathInside(repositoryReal, hiddenLockReal)
          || hiddenLockStats.isSymbolicLink()
          || !hiddenLockStats.isFile()) {
          throw new Error("hidden dependency lock must be a regular file inside the repository");
        }
        const hiddenLock = await readFile(hiddenLockReal);
        if (sha256(hiddenLock) !== dependency.hiddenLock.sha256) {
          issues.push(`${variant} hidden dependency-lock receipt does not match the installed tree`);
        }
        const installedTree = await observedInstalledTreeReceipt({
          nodeModulesPath: path.join(repositoryRoot, "web/node_modules"),
          hiddenLockBytes: hiddenLock,
          candidateLockBytes: candidateLock,
        });
        if (installedTree.packageCount !== dependency.installedTree.packageCount
          || installedTree.sha256 !== dependency.installedTree.sha256) {
          issues.push(`${variant} installed dependency-tree receipt is stale or incomplete`);
        }
      }
    }
    const head = await gitHead(repositoryRoot);
    if (commit === head) {
      const dirty = await dirtyRepositoryPaths(repositoryRoot, bindingPathsForCleanliness(binding));
      const dirtyIssue = currentCandidateCleanlinessIssue(variant, commit, head, dirty);
      if (dirtyIssue) issues.push(dirtyIssue);
    }
  } catch (error) {
    issues.push(`${variant} binding is not a real inspectable Git commit: ${(error as Error).message}`);
  }
  return issues;
}

export async function loadGauntletDefinition(explicitWebRoot?: string, requestedIterationId?: string) {
  const webRoot = resolveWebRoot(explicitWebRoot);
  let repositoryRoot: string;
  let repositoryAvailable = true;
  try {
    repositoryRoot = await findRepositoryRoot(webRoot);
  } catch {
    repositoryRoot = path.resolve(webRoot, "..");
    repositoryAvailable = false;
  }
  const manifestPath = await resolveContainedExistingPath(webRoot, "gauntlet/manifest.json");
  const manifest = await readJson<GauntletManifest>(manifestPath);
  assertSafeComponent(manifest.activeIterationId, "activeIterationId");
  if (requestedIterationId !== undefined) assertSafeComponent(requestedIterationId, "iteration selector");
  const enumeration = await enumerateIterationLedgers(webRoot);
  const selectedId = requestedIterationId ?? manifest.activeIterationId;
  const selected = enumeration.ledgers.find((ledger) => ledger.iteration.id === selectedId);
  if (!selected) throw new UnknownGauntletIterationError(`Unknown gauntlet iteration: ${selectedId}`);
  const calibration = repositoryAvailable
    ? await readJson<CalibrationData>(await resolveContainedExistingPath(
      repositoryRoot,
      "tests/fixtures/calibration.json",
    ))
    : null;
  return {
    webRoot,
    repositoryRoot,
    manifest,
    iteration: selected.iteration,
    iterationLedgerSha256: selected.sha256,
    ledgers: enumeration.ledgers,
    calibration,
    repositoryAvailable,
    enumerationIssues: enumeration.issues,
  };
}

export async function validateGauntletDefinition(explicitWebRoot?: string, requestedIterationId?: string) {
  const definition = await loadGauntletDefinition(explicitWebRoot, requestedIterationId);
  const { repositoryRoot, repositoryAvailable, manifest, iteration, calibration } = definition;
  const issues = [...definition.enumerationIssues];

  if (manifest.schemaVersion !== "1") issues.push("manifest schemaVersion must be 1");
  if (manifest.cases.length !== manifest.target.caseCount) {
    issues.push(`manifest has ${manifest.cases.length} cases; target requires ${manifest.target.caseCount}`);
  }
  if (manifest.target.caseCount !== 12
    || manifest.target.minimumPreferenceRate !== 0.7
    || manifest.target.minimumPreferredCases !== 9
    || manifest.target.maxInventedFacts !== 0
    || manifest.target.maxCriticalJourneyFailures !== 0) {
    issues.push("non-negotiable quality bar must remain 12 cases, 70%/9 wins, zero inventions, and zero critical journey failures");
  }
  const calculatedMinimum = Math.ceil(manifest.target.caseCount * manifest.target.minimumPreferenceRate);
  if (manifest.target.minimumPreferredCases !== calculatedMinimum) {
    issues.push(`minimumPreferredCases must be ${calculatedMinimum} for the configured rate and case count`);
  }
  if (GAUNTLET_DIMENSIONS.some((dimension) => !manifest.target.dimensions.includes(dimension))
    || manifest.target.dimensions.length !== GAUNTLET_DIMENSIONS.length) {
    issues.push("target dimensions must be trust, specificity, and actionability");
  }
  if (manifest.competitorReferences.length < 2) issues.push("at least two public competitor references are required");
  for (const reference of manifest.competitorReferences) {
    if (!isSafeComponent(reference.id)) issues.push(`unsafe competitor reference id: ${reference.id}`);
    if (reference.accountCreated !== false || reference.sameResumeOutputsAvailable !== false) {
      issues.push(`${reference.id} must not imply an account or same-resume output exists`);
    }
    if (!reference.url.startsWith("https://")) issues.push(`${reference.id} must use an https URL`);
  }

  const caseIds = new Set<string>();
  const fixtureIds = new Set<string>();
  const resumePaths = new Set<string>();
  const fixtureById = new Map((calibration?.fixtures ?? []).map((fixture) => [fixture.id, fixture]));
  for (const testCase of manifest.cases) {
    if (!isSafeComponent(testCase.id)) issues.push(`unsafe case id: ${testCase.id}`);
    if (caseIds.has(testCase.id)) issues.push(`duplicate case id: ${testCase.id}`);
    if (fixtureIds.has(testCase.fixtureId)) issues.push(`duplicate fixture id: ${testCase.fixtureId}`);
    if (resumePaths.has(testCase.resumePath)) issues.push(`duplicate resume path: ${testCase.resumePath}`);
    caseIds.add(testCase.id);
    fixtureIds.add(testCase.fixtureId);
    resumePaths.add(testCase.resumePath);
    if (testCase.provenance !== "synthetic") {
      issues.push(`${testCase.id} must be synthetic until public/redaction provenance is documented`);
    }
    const fixture = fixtureById.get(testCase.fixtureId);
    if (repositoryAvailable) {
      if (!fixture) issues.push(`${testCase.id} references missing calibration fixture ${testCase.fixtureId}`);
      else if (fixture.path !== testCase.resumePath) issues.push(`${testCase.id} path does not match calibration fixture ${testCase.fixtureId}`);
    }
    const repositoryPath = `tests/resumes/${testCase.resumePath}`;
    if (!isSafeRepositoryPath(repositoryPath)) issues.push(`${testCase.id} resume path is unsafe`);
    else if (repositoryAvailable) {
      try {
        await resolveContainedExistingPath(repositoryRoot, repositoryPath);
      } catch (error) {
        issues.push(`${testCase.id} resume file is invalid: ${(error as Error).message}`);
      }
    }
  }

  const journeyIds = new Set<string>();
  for (const journey of manifest.requiredJourneys) {
    if (!isSafeComponent(journey.id)) issues.push(`unsafe journey id: ${journey.id}`);
    if (journeyIds.has(journey.id)) issues.push(`duplicate journey id: ${journey.id}`);
    journeyIds.add(journey.id);
  }
  const requiredViewportSet = new Set(manifest.requiredJourneys.map((journey) => journey.viewport));
  if (!requiredViewportSet.has("desktop") || !requiredViewportSet.has("mobile")) {
    issues.push("required journeys must cover desktop and mobile");
  }

  if (iteration.seal?.caseSetSha256 !== undefined
    && iteration.seal.caseSetSha256 !== caseSetSha256(manifest)) {
    issues.push(`${iteration.id}: case-set seal does not match the current gauntlet definition`);
  }
  const [productionBindingIssues, candidateBindingIssues] = await Promise.all([
    validateBindingAgainstRepository(
      repositoryRoot,
      iteration.production,
      "production",
      repositoryAvailable,
    ),
    validateBindingAgainstRepository(
      repositoryRoot,
      iteration.candidate,
      "candidate",
      repositoryAvailable,
    ),
  ]);
  issues.push(...productionBindingIssues, ...candidateBindingIssues);
  if (iteration.status === "complete"
    && (!hasCompleteBinding(iteration.production) || !hasCompleteBinding(iteration.candidate))) {
    issues.push(`${iteration.id}: complete iterations require both repository-bound variants`);
  }
  return { ...definition, issues };
}

async function readJsonDirectory<T>(artifactRoot: string, relativeDirectory: string, issues: string[]) {
  const records: Array<{ filePath: string; raw: string; value: T }> = [];
  const directory = path.join(artifactRoot, relativeDirectory);
  if (!existsSync(directory)) return records;
  const directoryReal = await resolveContainedRegularDirectory(
    artifactRoot,
    relativeDirectory,
    relativeDirectory,
  );
  const entries = await readdir(directoryReal, { withFileTypes: true });
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    if (!entry.name.endsWith(".json")) continue;
    const component = entry.name.slice(0, -5);
    if (!isSafeComponent(component) || entry.isSymbolicLink() || !entry.isFile()) {
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
  return records;
}

async function resolveArtifactRoot(webRoot: string, iterationId: string, issues: string[]) {
  assertSafeComponent(iterationId, "iteration id");
  const baseReal = await resolveContainedRegularDirectory(
    webRoot,
    "gauntlet/artifacts",
    "gauntlet/artifacts",
  );
  const candidate = path.join(baseReal, iterationId);
  if (!existsSync(candidate)) return candidate;
  const stats = await lstat(candidate);
  if (stats.isSymbolicLink() || !stats.isDirectory()) {
    issues.push(`${iterationId}: artifact root must be a regular directory`);
    return candidate;
  }
  const candidateReal = await realpath(candidate);
  if (!isPathInside(baseReal, candidateReal)) issues.push(`${iterationId}: artifact root escapes gauntlet/artifacts`);
  return candidateReal;
}

type GitAnchorValidation = {
  valid: boolean;
  anchorCommit: string | null;
  evidenceCommit: string | null;
  issues: string[];
};

function repositoryPathForAbsolute(repositoryRoot: string, absolutePath: string) {
  const relative = path.relative(repositoryRoot, absolutePath).split(path.sep).join("/");
  if (!isSafeRepositoryPath(relative)) throw new Error(`path is outside the repository: ${absolutePath}`);
  return relative;
}

function anchoredReceiptValid(value: unknown) {
  return isRecord(value)
    && hasExactKeys(value, ["path", "sha256", "gitBlobOid"])
    && isSafeRepositoryPath(value.path)
    && isSha256(value.sha256)
    && typeof value.gitBlobOid === "string"
    && /^[a-f0-9]{40,64}$/.test(value.gitBlobOid);
}

async function evidenceCommitReceipts(input: {
  repositoryRoot: string;
  artifactRoot: string;
  ledgerPath: string;
  evidenceCommit: string;
}) {
  const artifactRepositoryRoot = repositoryPathForAbsolute(input.repositoryRoot, input.artifactRoot);
  const ledgerRepositoryPath = repositoryPathForAbsolute(input.repositoryRoot, input.ledgerPath);
  const [currentArtifacts, artifactEntries, ledgerEntries] = await Promise.all([
    artifactFileReceipts(input.artifactRoot),
    listGitTree(input.repositoryRoot, input.evidenceCommit, artifactRepositoryRoot),
    listGitTree(input.repositoryRoot, input.evidenceCommit, ledgerRepositoryPath),
  ]);
  if (ledgerEntries.length !== 1 || ledgerEntries[0].path !== ledgerRepositoryPath) {
    throw new Error("evidence commit does not contain the exact iteration ledger");
  }
  const regularEntries = [...ledgerEntries, ...artifactEntries];
  if (regularEntries.some((entry) => entry.type !== "blob"
    || !["100644", "100755"].includes(entry.mode))) {
    throw new Error("evidence commit contains a symlink, submodule, or non-regular evidence entry");
  }
  const artifactEntryByPath = new Map(artifactEntries.map((entry) => [entry.path, entry]));
  const currentRepositoryReceipts = currentArtifacts.map((receipt) => ({
    path: `${artifactRepositoryRoot}/${receipt.path}`,
    sha256: receipt.sha256,
  }));
  if (artifactEntries.length !== currentRepositoryReceipts.length
    || currentRepositoryReceipts.some((receipt) => !artifactEntryByPath.has(receipt.path))) {
    throw new Error("current artifact file set does not exactly match the evidence commit tree");
  }
  const objects = await readGitObjects(
    input.repositoryRoot,
    regularEntries.map((entry) => entry.objectId),
  );
  const artifacts = currentRepositoryReceipts.map((receipt) => {
    const entry = artifactEntryByPath.get(receipt.path)!;
    const blob = objects.get(entry.objectId);
    if (!blob || sha256(blob) !== receipt.sha256) {
      throw new Error(`${receipt.path} differs from its evidence-commit blob`);
    }
    return { ...receipt, gitBlobOid: entry.objectId };
  }).sort((left, right) => left.path.localeCompare(right.path));
  const ledgerEntry = ledgerEntries[0];
  const ledgerRaw = await readFile(input.ledgerPath);
  const ledgerBlob = objects.get(ledgerEntry.objectId);
  if (!ledgerBlob || !ledgerRaw.equals(ledgerBlob)) {
    throw new Error("current iteration ledger differs from its evidence-commit blob");
  }
  return {
    artifactRepositoryRoot,
    ledger: {
      path: ledgerRepositoryPath,
      sha256: sha256(ledgerRaw),
      gitBlobOid: ledgerEntry.objectId,
    },
    artifacts,
  };
}

export async function buildGauntletAnchorRecord(
  explicitWebRoot?: string,
  requestedIterationId?: string,
  evidenceCommitOverride?: string,
) {
  const definition = await validateGauntletDefinition(explicitWebRoot, requestedIterationId);
  const { repositoryRoot, webRoot, iteration } = definition;
  if (definition.issues.length > 0) {
    throw new Error(`Gauntlet definition is invalid:\n- ${definition.issues.join("\n- ")}`);
  }
  if (iteration.status !== "complete" || !iteration.seal) {
    throw new Error("Only a complete sealed iteration can receive a Git anchor");
  }
  const evidenceCommit = evidenceCommitOverride ?? await gitHead(repositoryRoot);
  await resolveRealCommit(repositoryRoot, evidenceCommit);
  const artifactRoot = await resolveArtifactRoot(webRoot, iteration.id, []);
  const ledgerPath = await resolveContainedExistingPath(
    webRoot,
    `gauntlet/iterations/${iteration.id}.json`,
  );
  const receipts = await evidenceCommitReceipts({
    repositoryRoot,
    artifactRoot,
    ledgerPath,
    evidenceCommit,
  });
  const relativeArtifacts = receipts.artifacts.map((receipt) => ({
    path: receipt.path.slice(receipts.artifactRepositoryRoot.length + 1),
    sha256: receipt.sha256,
  }));
  const artifactSetSha256 = canonicalJsonSha256(relativeArtifacts);
  if (artifactSetSha256 !== iteration.seal.artifactSetSha256) {
    throw new Error("evidence commit artifact tree does not match the iteration seal");
  }
  return {
    schemaVersion: "1",
    iterationId: iteration.id,
    evidenceCommit,
    ledger: receipts.ledger,
    artifactSetSha256,
    artifacts: receipts.artifacts,
  } satisfies GauntletAnchor;
}

export async function writeGauntletAnchor(
  explicitWebRoot?: string,
  requestedIterationId?: string,
) {
  const record = await buildGauntletAnchorRecord(explicitWebRoot, requestedIterationId);
  const webRoot = resolveWebRoot(explicitWebRoot);
  const anchorsPath = path.join(webRoot, "gauntlet/anchors");
  if (!existsSync(anchorsPath)) await mkdir(anchorsPath);
  const anchorsRoot = await resolveContainedRegularDirectory(webRoot, "gauntlet/anchors", "gauntlet/anchors");
  const outputPath = path.join(anchorsRoot, `${record.iterationId}.json`);
  await writeFile(outputPath, `${JSON.stringify(record, null, 2)}\n`, { flag: "wx" });
  return { record, outputPath };
}

async function validateGitAnchor(input: {
  repositoryRoot: string;
  webRoot: string;
  iteration: GauntletIteration;
  ledgerSha256: string;
  artifactRoot: string;
}): Promise<GitAnchorValidation> {
  const issues: string[] = [];
  let anchorCommit: string | null = null;
  let evidenceCommit: string | null = null;
  try {
    const anchorsRoot = await resolveContainedRegularDirectory(
      input.webRoot,
      "gauntlet/anchors",
      "gauntlet/anchors",
    );
    const anchorPath = path.join(anchorsRoot, `${input.iteration.id}.json`);
    const anchorStats = await lstat(anchorPath);
    if (anchorStats.isSymbolicLink() || !anchorStats.isFile()) {
      throw new Error("anchor must be a regular file");
    }
    const anchorRaw = await readFile(anchorPath, "utf8");
    const anchor = JSON.parse(anchorRaw) as GauntletAnchor;
    if (!isRecord(anchor)
      || !hasExactKeys(anchor, [
        "schemaVersion",
        "iterationId",
        "evidenceCommit",
        "ledger",
        "artifactSetSha256",
        "artifacts",
      ])
      || anchor.schemaVersion !== "1"
      || anchor.iterationId !== input.iteration.id
      || !isFullGitSha(anchor.evidenceCommit)
      || !anchoredReceiptValid(anchor.ledger)
      || !isSha256(anchor.artifactSetSha256)
      || !Array.isArray(anchor.artifacts)
      || anchor.artifacts.length === 0
      || !anchor.artifacts.every(anchoredReceiptValid)) {
      throw new Error("anchor record shape is invalid");
    }
    evidenceCommit = anchor.evidenceCommit;
    const anchorRepositoryPath = repositoryPathForAbsolute(input.repositoryRoot, anchorPath);
    const introductions = await gitFileIntroductionCommits(input.repositoryRoot, anchorRepositoryPath);
    if (introductions.length !== 1) {
      throw new Error("anchor must have exactly one immutable Git introduction commit");
    }
    [anchorCommit] = introductions;
    const introducedAnchor = await readGitBlob(
      input.repositoryRoot,
      anchorCommit,
      anchorRepositoryPath,
    );
    if (sha256(introducedAnchor) !== sha256(anchorRaw)) {
      throw new Error("current anchor differs from its immutable introduction blob");
    }
    const parents = await gitCommitParents(input.repositoryRoot, anchorCommit);
    if (parents.length !== 1 || parents[0] !== anchor.evidenceCommit) {
      throw new Error("anchor introduction commit must directly follow its named evidence commit");
    }
    const [changedPaths, addedPaths, anchorEntries] = await Promise.all([
      gitDiffPaths(input.repositoryRoot, anchor.evidenceCommit, anchorCommit),
      gitDiffPaths(input.repositoryRoot, anchor.evidenceCommit, anchorCommit, "A"),
      listGitTree(input.repositoryRoot, anchorCommit, anchorRepositoryPath),
    ]);
    if (changedPaths.length !== 1
      || changedPaths[0] !== anchorRepositoryPath
      || addedPaths.length !== 1
      || addedPaths[0] !== anchorRepositoryPath
      || anchorEntries.length !== 1
      || anchorEntries[0].path !== anchorRepositoryPath
      || anchorEntries[0].type !== "blob"
      || !["100644", "100755"].includes(anchorEntries[0].mode)) {
      throw new Error(`anchor introduction commit must add only ${anchorRepositoryPath} as a regular file`);
    }
    if (!await isAncestorCommit(input.repositoryRoot, anchorCommit, await gitHead(input.repositoryRoot))) {
      throw new Error("anchor introduction commit is not in the current Git history");
    }
    const ledgerPath = await resolveContainedExistingPath(
      input.webRoot,
      `gauntlet/iterations/${input.iteration.id}.json`,
    );
    const receipts = await evidenceCommitReceipts({
      repositoryRoot: input.repositoryRoot,
      artifactRoot: input.artifactRoot,
      ledgerPath,
      evidenceCommit: anchor.evidenceCommit,
    });
    if (anchor.ledger.path !== receipts.ledger.path
      || anchor.ledger.sha256 !== receipts.ledger.sha256
      || anchor.ledger.gitBlobOid !== receipts.ledger.gitBlobOid
      || anchor.ledger.sha256 !== input.ledgerSha256) {
      throw new Error("ledger does not match its Git anchor receipt");
    }
    const anchorArtifactPaths = anchor.artifacts.map((receipt) => receipt.path);
    if (new Set(anchorArtifactPaths).size !== anchorArtifactPaths.length
      || anchorArtifactPaths.some((entry, index) => index > 0 && anchorArtifactPaths[index - 1].localeCompare(entry) >= 0)
      || canonicalJsonSha256(anchor.artifacts) !== canonicalJsonSha256(receipts.artifacts)) {
      throw new Error("artifact receipts are unsorted, duplicated, missing, extra, or stale");
    }
    const artifactPrefix = `${receipts.artifactRepositoryRoot}/`;
    if (anchor.artifacts.some((receipt) => !receipt.path.startsWith(artifactPrefix))) {
      throw new Error("anchor contains an artifact outside the selected iteration root");
    }
    const relativeArtifacts = anchor.artifacts.map((receipt) => ({
      path: receipt.path.slice(artifactPrefix.length),
      sha256: receipt.sha256,
    }));
    const artifactSetSha256 = canonicalJsonSha256(relativeArtifacts);
    if (artifactSetSha256 !== anchor.artifactSetSha256
      || artifactSetSha256 !== input.iteration.seal?.artifactSetSha256) {
      throw new Error("Git-anchored artifact tree does not match the iteration seal");
    }
  } catch (error) {
    issues.push(`${input.iteration.id}: Git anchor invalid: ${(error as Error).message}`);
  }
  return {
    valid: issues.length === 0,
    anchorCommit,
    evidenceCommit,
    issues,
  };
}

function finalizationReceiptValid(value: unknown): value is ReportFinalizationReceipt {
  if (!isRecord(value)
    || !hasExactKeys(value, [
      "status",
      "forceGrounding",
      "rawReportSha256",
      "effectiveReportSha256",
      "validator",
    ])
    || !isSha256(value.rawReportSha256)
    || !isSha256(value.effectiveReportSha256)) return false;
  if (value.status === "unfinalized_raw") {
    return value.forceGrounding === false
      && value.validator === null
      && value.rawReportSha256 === value.effectiveReportSha256;
  }
  if (value.status !== "finalized"
    || value.forceGrounding !== true
    || !isRecord(value.validator)
    || !hasExactKeys(value.validator, ["commit", "path", "sha256", "gitBlobOid"])) return false;
  return isFullGitSha(value.validator.commit)
    && value.validator.path === GAUNTLET_VALIDATOR_PATH
    && isSha256(value.validator.sha256)
    && typeof value.validator.gitBlobOid === "string"
    && /^[a-f0-9]{40,64}$/.test(value.validator.gitBlobOid);
}

function hasLegacyCaptureIdentity(iteration: GauntletIteration) {
  return iteration.id === LEGACY_CAPTURE_ITERATION.id
    && iteration.createdAt === LEGACY_CAPTURE_ITERATION.createdAt
    && iteration.production.commit === LEGACY_CAPTURE_ITERATION.productionCommit
    && iteration.candidate.commit === LEGACY_CAPTURE_ITERATION.candidateCommit;
}

async function authorizeLegacyCapture(input: {
  iteration: GauntletIteration,
  ledgerSha256: string,
  artifactRoot: string,
}): Promise<LegacyCaptureAuthorization> {
  const claimed = hasLegacyCaptureIdentity(input.iteration);
  if (!claimed || input.ledgerSha256 !== LEGACY_CAPTURE_ITERATION.ledgerSha256) {
    return { authorized: false, claimed, snapshot: null };
  }
  try {
    const outputsDirectory = await resolveContainedRegularDirectory(
      input.artifactRoot,
      "outputs",
      "outputs",
    );
    const outputEntries = await readdir(outputsDirectory, { withFileTypes: true });
    const expectedOutputNames = ["candidate", "production"];
    const actualOutputNames = outputEntries.map((entry) => entry.name).sort();
    if (actualOutputNames.length !== expectedOutputNames.length
      || actualOutputNames.some((name, index) => name !== expectedOutputNames[index])
      || outputEntries.some((entry) => entry.isSymbolicLink() || !entry.isDirectory())) {
      return { authorized: false, claimed: true, snapshot: null };
    }
    const receipts: Array<{ path: string; sha256: string }> = [];
    const snapshot: Record<Variant, FrozenLegacyOutputRecord[]> = {
      candidate: [],
      production: [],
    };
    for (const variant of ["candidate", "production"] as const) {
      const relativeDirectory = `outputs/${variant}`;
      const directory = await resolveContainedRegularDirectory(
        input.artifactRoot,
        relativeDirectory,
        relativeDirectory,
      );
      const entries = await readdir(directory, { withFileTypes: true });
      const expectedNames = Object.keys(LEGACY_CAPTURE_OUTPUT_SHA256)
        .filter((key) => key.startsWith(`${variant}/`))
        .map((key) => `${key.slice(variant.length + 1)}.json`)
        .sort();
      const actualNames = entries.map((entry) => entry.name).sort();
      if (actualNames.length !== expectedNames.length
        || actualNames.some((name, index) => name !== expectedNames[index])) {
        return { authorized: false, claimed: true, snapshot: null };
      }
      for (const entry of entries) {
        if (!entry.isFile() || entry.isSymbolicLink()) {
          return { authorized: false, claimed: true, snapshot: null };
        }
        const filePath = path.join(directory, entry.name);
        const fileReal = await realpath(filePath);
        if (!isPathInside(directory, fileReal)) {
          return { authorized: false, claimed: true, snapshot: null };
        }
        const caseId = entry.name.slice(0, -5);
        const raw = await readFile(fileReal);
        const digest = sha256(raw);
        if (LEGACY_CAPTURE_OUTPUT_SHA256[`${variant}/${caseId}`] !== digest) {
          return { authorized: false, claimed: true, snapshot: null };
        }
        receipts.push({ path: `${relativeDirectory}/${entry.name}`, sha256: digest });
        snapshot[variant].push({
          filePath: fileReal,
          raw: Buffer.from(raw),
          sha256: digest,
        });
      }
    }
    receipts.sort((left, right) => left.path.localeCompare(right.path));
    if (receipts.length !== Object.keys(LEGACY_CAPTURE_OUTPUT_SHA256).length
      || canonicalJsonSha256(receipts) !== LEGACY_CAPTURE_ITERATION.outputSetSha256) {
      return { authorized: false, claimed: true, snapshot: null };
    }
    return {
      authorized: true,
      claimed: true,
      snapshot: {
        candidate: Object.freeze([...snapshot.candidate]),
        production: Object.freeze([...snapshot.production]),
      },
    };
  } catch {
    return { authorized: false, claimed: true, snapshot: null };
  }
}

function parseFrozenLegacyOutputRecords(
  records: readonly FrozenLegacyOutputRecord[],
  issues: string[],
) {
  const parsed: Array<{
    filePath: string;
    raw: Buffer;
    value: GauntletOutputArtifact;
  }> = [];
  for (const record of records) {
    try {
      parsed.push({
        filePath: record.filePath,
        raw: record.raw,
        value: JSON.parse(record.raw.toString("utf8")) as GauntletOutputArtifact,
      });
    } catch (error) {
      issues.push(
        `${path.relative(process.cwd(), record.filePath)} is not valid JSON: ${(error as Error).message}`,
      );
    }
  }
  return parsed;
}

function isExactLegacyCaptureArtifact(value: Record<string, unknown>, legacyCaptureAuthorized: boolean) {
  if (!legacyCaptureAuthorized
    || value.captureContract !== undefined
    || value.reportMode !== undefined
    || value.finalization !== undefined
    || !isRecord(value.binding)) return false;
  return (value.binding.runtimeClosure === undefined || value.binding.runtimeClosure === null)
    && (value.binding.dependencyClosure === undefined || value.binding.dependencyClosure === null);
}

function validateOutputEnvelope(
  value: unknown,
  variant: Variant,
  iteration: GauntletIteration,
  legacyCaptureAuthorized: boolean,
  knownCaseIds: Set<string>,
) {
  const issues: string[] = [];
  if (!isRecord(value)) return ["artifact must be an object"];
  if (value.schemaVersion !== "2") issues.push("schemaVersion must be 2");
  if (value.iterationId !== iteration.id) issues.push(`iterationId must be ${iteration.id}`);
  if (!isSafeComponent(value.caseId) || !knownCaseIds.has(value.caseId)) issues.push("caseId is unsafe or absent from the manifest");
  if (value.variant !== variant) issues.push(`variant must be ${variant}`);
  if (!isRecord(value.binding) || !hasCompleteBinding(value.binding as unknown as CandidateBinding)) {
    issues.push("binding is missing or incomplete");
  }
  const hasRuntimeClosure = isRecord(value.binding)
    && value.binding.runtimeClosure !== undefined
    && value.binding.runtimeClosure !== null;
  const hasDependencyClosure = isRecord(value.binding)
    && value.binding.dependencyClosure !== undefined
    && value.binding.dependencyClosure !== null;
  const legacyCapture = isExactLegacyCaptureArtifact(
    value,
    legacyCaptureAuthorized,
  );
  if (!isRecord(value.generation)) {
    issues.push("generation receipt is missing");
  } else {
    if (!isFullGitSha(value.generation.sourceCommit)) issues.push("generation.sourceCommit must be a full Git SHA");
    if (!receiptComplete(value.generation.sanitizedOutput)) issues.push("generation.sanitizedOutput receipt is invalid");
    if (!isNonEmptyString(value.generation.runId)) issues.push("generation.runId is required");
    if (!isSafeFixtureId(value.generation.fixtureId)) issues.push("generation.fixtureId is unsafe");
    if (!isIsoTimestamp(value.generation.generatedAt)) issues.push("generation.generatedAt must be an ISO timestamp");
    if (!isNonEmptyString(value.generation.model)) issues.push("generation.model is required");
    if (!isSha256(value.generation.canonicalPromptSha256)) issues.push("generation.canonicalPromptSha256 is required");
    if (!isSha256(value.generation.reportSha256)) issues.push("generation.reportSha256 is required");
  }
  if (!legacyCapture) {
    const expectedMode = variant === "candidate"
      ? "candidate_commit_finalized"
      : "historical_raw_unfinalized";
    if (value.captureContract !== GAUNTLET_CAPTURE_CONTRACT) {
      issues.push(`captureContract must be ${GAUNTLET_CAPTURE_CONTRACT}`);
    }
    if (value.reportMode !== expectedMode) {
      issues.push(`${variant} reportMode must be ${expectedMode}`);
    }
    if (!finalizationReceiptValid(value.finalization)) {
      issues.push("finalization receipt is missing or invalid");
    } else if (variant === "candidate" && value.finalization.status !== "finalized") {
      issues.push("candidate report must be finalized before capture");
    } else if (variant === "production" && value.finalization.status !== "unfinalized_raw") {
      issues.push("production historical baseline must remain raw");
    }
    if (variant === "candidate" && !hasRuntimeClosure) {
      issues.push("finalized candidate capture requires a complete runtime closure");
    }
    if (variant === "production" && hasRuntimeClosure) {
      issues.push("historical raw production capture may not claim the candidate runtime closure");
    }
    if (!hasDependencyClosure) {
      issues.push(`${variant} finalized-v1 capture requires a dependency closure`);
    }
  }
  if (!isRecord(value.fixture) || !hasExactKeys(value.fixture, ["sha256"]) || !isSha256(value.fixture.sha256)) {
    issues.push("fixture receipt is missing or invalid");
  }
  if (!isSha256(value.reportSha256)) issues.push("reportSha256 must be a SHA-256");
  if (!isRecord(value.report)) issues.push("report must be an object");
  if (!isRecord(value.presentation)) issues.push("presentation receipt is missing");
  else {
    if (value.presentation.kind !== "rendered_report") issues.push("presentation.kind must be rendered_report");
    if (!isFullGitSha(value.presentation.rendererCommit)) issues.push("presentation.rendererCommit must be a full Git SHA");
    if (!receiptComplete(value.presentation.renderer)) issues.push("presentation.renderer receipt is invalid");
    if (!isIsoTimestamp(value.presentation.capturedAt)) issues.push("presentation.capturedAt must be an ISO timestamp");
    if (!isNonEmptyString(value.presentation.route)
      || !value.presentation.route.startsWith("/")
      || value.presentation.route.startsWith("//")) issues.push("presentation.route must be an application path");
    if (!isRecord(value.presentation.viewport)
      || !Number.isInteger(value.presentation.viewport.width)
      || !Number.isInteger(value.presentation.viewport.height)
      || Number(value.presentation.viewport.width) < 320
      || Number(value.presentation.viewport.height) < 480) {
      issues.push("presentation.viewport must contain a usable integer width and height");
    }
    if (!isNonEmptyString(value.presentation.visibleText) || value.presentation.visibleText.length < 200) {
      issues.push("presentation.visibleText must contain the user-visible report");
    }
    if (!isSha256(value.presentation.visibleTextSha256)) issues.push("presentation.visibleTextSha256 is required");
    if (!isRecord(value.presentation.screenshot)
      || !isSafeRepositoryPath(value.presentation.screenshot.path)
      || !isSha256(value.presentation.screenshot.sha256)) {
      issues.push("presentation screenshot path and SHA-256 are required");
    }
    if (!legacyCapture || value.presentation.captureReceipt !== undefined) {
      issues.push(...captureRuntimeReceiptIssues({
        value: value.presentation.captureReceipt,
        variant,
        caseId: value.caseId,
        bindingCommit: isRecord(value.binding) ? value.binding.commit : null,
        reportSha256: value.reportSha256,
      }));
    }
  }
  return issues;
}

async function validateSanitizedGenerationSource(
  repositoryRoot: string,
  artifact: GauntletOutputArtifact,
  testCase: GauntletCase,
  manifest: GauntletManifest,
) {
  const issues: string[] = [];
  const generation = artifact.generation;
  if (!/^web\/gauntlet\/sources\/[a-z0-9][a-z0-9-]*\.json$/.test(generation.sanitizedOutput.path)) {
    return ["sanitized generation source must be a committed web/gauntlet/sources JSON artifact"];
  }
  try {
    await resolveRealCommit(repositoryRoot, generation.sourceCommit);
    const sourceBlob = await readGitBlob(
      repositoryRoot,
      generation.sourceCommit,
      generation.sanitizedOutput.path,
    );
    if (sha256(sourceBlob) !== generation.sanitizedOutput.sha256) {
      return ["sanitized generation source receipt does not match the committed blob"];
    }
    const source = JSON.parse(sourceBlob.toString("utf8")) as unknown;
    if (!isRecord(source)
      || !hasExactKeys(source, ["schemaVersion", "kind", "sourceRun", "selection", "results"])
      || source.schemaVersion !== "1"
      || source.kind !== "historical-live-eval-synthetic-subset"
      || !isRecord(source.sourceRun)
      || !isRecord(source.selection)
      || !Array.isArray(source.results)) {
      return ["sanitized generation source has an invalid or over-broad envelope"];
    }
    const sourceRun = source.sourceRun;
    const selection = source.selection;
    if (!hasExactKeys(sourceRun, [
      "fullRunSha256",
      "runId",
      "generatedAt",
      "executionMode",
      "model",
      "reasoningEffort",
      "promptVersion",
      "canonicalPromptSha256",
      "contractVersion",
    ])
      || !isSha256(sourceRun.fullRunSha256)
      || sourceRun.executionMode !== "live"
      || !isNonEmptyString(sourceRun.reasoningEffort)
      || !isNonEmptyString(sourceRun.promptVersion)
      || sourceRun.contractVersion !== "v2") {
      issues.push("sanitized generation source metadata is incomplete");
    }
    if (!hasExactKeys(selection, ["caseCount", "provenance", "excludedResultCount"])
      || selection.caseCount !== manifest.target.caseCount
      || selection.provenance !== "synthetic-only"
      || selection.excludedResultCount !== 11) {
      issues.push("sanitized generation selection is not the exact synthetic-only corpus");
    }
    const expectedCases = new Map(manifest.cases.map((entry) => [entry.id, entry.fixtureId]));
    const seen = new Set<string>();
    let selectedReport: unknown;
    for (const result of source.results) {
      if (!isRecord(result)
        || !hasExactKeys(result, ["caseId", "fixtureId", "status", "report"])
        || !isSafeComponent(result.caseId)
        || !isSafeFixtureId(result.fixtureId)
        || result.status !== "PASS"
        || !isRecord(result.report)
        || expectedCases.get(result.caseId) !== result.fixtureId
        || seen.has(result.caseId)) {
        issues.push("sanitized generation results contain an invalid, duplicate, private, or unknown entry");
        continue;
      }
      seen.add(result.caseId);
      if (result.caseId === testCase.id) selectedReport = result.report;
    }
    if (source.results.length !== manifest.target.caseCount
      || seen.size !== manifest.target.caseCount
      || [...expectedCases.keys()].some((caseId) => !seen.has(caseId))) {
      issues.push("sanitized generation result set does not exactly match the 12-case manifest");
    }
    if (sourceRun.runId !== generation.runId
      || sourceRun.generatedAt !== generation.generatedAt
      || sourceRun.model !== generation.model
      || sourceRun.canonicalPromptSha256 !== generation.canonicalPromptSha256) {
      issues.push("generation receipt does not match sanitized source-run metadata");
    }
    if (generation.fixtureId !== testCase.fixtureId) {
      issues.push("generation fixtureId does not match the manifest case");
    }
    if (generation.model !== artifact.binding.model) {
      issues.push("generation model does not match the iteration binding");
    }
    const selectedRawReportSha256 = selectedReport === undefined
      ? null
      : canonicalJsonSha256(selectedReport);
    const effectiveReportSha256 = canonicalJsonSha256(artifact.report);
    if (artifact.finalization) {
      if (selectedRawReportSha256 === null
        || generation.reportSha256 !== selectedRawReportSha256
        || artifact.finalization.rawReportSha256 !== selectedRawReportSha256
        || artifact.finalization.effectiveReportSha256 !== artifact.reportSha256
        || effectiveReportSha256 !== artifact.reportSha256) {
        issues.push("raw or effective report receipt does not match the finalized output artifact");
      }
    } else if (generation.reportSha256 !== artifact.reportSha256
      || selectedRawReportSha256 !== artifact.reportSha256
      || effectiveReportSha256 !== artifact.reportSha256) {
      issues.push("selected sanitized report does not match the output artifact");
    }
    const prompt = await readGitBlob(
      repositoryRoot,
      artifact.binding.commit!,
      artifact.binding.resumePrompt!.path,
    );
    if (sha256(prompt.toString("utf8").trim()) !== generation.canonicalPromptSha256) {
      issues.push("canonical trimmed prompt receipt does not match the bound prompt");
    }
  } catch (error) {
    issues.push(`sanitized generation source is not inspectable: ${(error as Error).message}`);
  }
  return issues;
}

async function validateOutputReceipts(
  repositoryRoot: string,
  artifactRoot: string,
  artifact: GauntletOutputArtifact,
  testCase: GauntletCase,
  variant: Variant,
  iteration: GauntletIteration,
  manifest: GauntletManifest,
) {
  const issues: string[] = [];
  const expectedFixturePath = `tests/resumes/${testCase.resumePath}`;
  if (artifact.reportSha256 !== canonicalJsonSha256(artifact.report)) issues.push("report receipt does not match report JSON");
  if (artifact.presentation.visibleTextSha256 !== sha256(artifact.presentation.visibleText)) {
    issues.push("visible-text receipt does not match the presentation");
  }
  if (artifact.presentation.rendererCommit !== artifact.binding.commit) {
    issues.push("presentation renderer commit does not match the output binding");
  }
  if (!receiptMatches(artifact.presentation.renderer, artifact.binding.renderer)) {
    issues.push("presentation renderer receipt does not match the output binding");
  }
  if (Date.parse(artifact.presentation.capturedAt) < Date.parse(artifact.generation.generatedAt)) {
    issues.push("presentation was captured before its report was generated");
  }
  if (!timestampInsideIteration(artifact.presentation.capturedAt, iteration)) {
    issues.push("presentation capture falls outside the iteration window");
  }
  if (artifact.finalization) {
    if (artifact.finalization.rawReportSha256 !== artifact.generation.reportSha256) {
      issues.push("finalization raw-report receipt does not match immutable generation evidence");
    }
    if (artifact.finalization.effectiveReportSha256 !== artifact.reportSha256) {
      issues.push("finalization effective-report receipt does not match the captured artifact");
    }
    if (artifact.finalization.status === "unfinalized_raw") {
      if (variant !== "production" || artifact.reportSha256 !== artifact.generation.reportSha256) {
        issues.push("only the production baseline may retain an unfinalized raw report");
      }
    } else {
      const validator = artifact.finalization.validator;
      if (variant !== "candidate"
        || validator.commit !== artifact.binding.commit
        || validator.path !== GAUNTLET_VALIDATOR_PATH) {
        issues.push("candidate finalizer is not bound to the candidate validator commit");
      }
      const closureValidator = artifact.binding.runtimeClosure?.files
        .find((receipt) => receipt.path === GAUNTLET_VALIDATOR_PATH);
      if (!artifact.binding.runtimeClosure || !closureValidator
        || closureValidator.sha256 !== validator.sha256) {
        issues.push("candidate finalizer validator is absent from the runtime closure");
      }
      try {
        const [validatorBlob, validatorEntries] = await Promise.all([
          readGitBlob(repositoryRoot, validator.commit, validator.path),
          listGitTree(repositoryRoot, validator.commit, validator.path),
        ]);
        if (sha256(validatorBlob) !== validator.sha256) {
          issues.push("candidate finalizer validator hash does not match its commit");
        }
        if (validatorEntries.length !== 1
          || validatorEntries[0].path !== validator.path
          || validatorEntries[0].type !== "blob"
          || validatorEntries[0].objectId !== validator.gitBlobOid) {
          issues.push("candidate finalizer validator Git blob receipt is stale");
        }
      } catch (error) {
        issues.push(`candidate finalizer validator is not inspectable: ${(error as Error).message}`);
      }
    }
  }
  try {
    const fixture = await readGitBlob(repositoryRoot, artifact.generation.sourceCommit, expectedFixturePath);
    if (sha256(fixture) !== artifact.fixture.sha256) issues.push("fixture receipt does not match the bound commit");
  } catch (error) {
    issues.push(`fixture receipt is not inspectable at the bound commit: ${(error as Error).message}`);
  }
  issues.push(...await validateSanitizedGenerationSource(repositoryRoot, artifact, testCase, manifest));
  const expectedScreenshotPrefix = `presentations/${variant}/${testCase.id}.`;
  if (!artifact.presentation.screenshot.path.startsWith(expectedScreenshotPrefix)) {
    issues.push("presentation screenshot path does not match its case and variant");
    return issues;
  }
  try {
    const screenshotPath = await resolveContainedExistingPath(artifactRoot, artifact.presentation.screenshot.path);
    if (sha256(await readFile(screenshotPath)) !== artifact.presentation.screenshot.sha256) {
      issues.push("presentation screenshot hash does not match");
    }
  } catch (error) {
    issues.push(`presentation screenshot is not safely inspectable: ${(error as Error).message}`);
  }
  return issues;
}

async function loadOutputArtifacts(
  repositoryRoot: string,
  artifactRoot: string,
  variant: Variant,
  iteration: GauntletIteration,
  legacyCaptureAuthorized: boolean,
  frozenLegacyRecords: readonly FrozenLegacyOutputRecord[] | null,
  manifest: GauntletManifest,
  issues: string[],
) {
  const output = new Map<string, LoadedArtifact>();
  const caseById = new Map(manifest.cases.map((testCase) => [testCase.id, testCase]));
  const records = legacyCaptureAuthorized && frozenLegacyRecords
    ? parseFrozenLegacyOutputRecords(frozenLegacyRecords, issues)
    : await readJsonDirectory<GauntletOutputArtifact>(artifactRoot, `outputs/${variant}`, issues);
  for (const record of records) {
    const artifactSha256 = sha256(record.raw);
    const artifactIssues = validateOutputEnvelope(
      record.value,
      variant,
      iteration,
      legacyCaptureAuthorized,
      new Set(caseById.keys()),
    );
    if (artifactIssues.length > 0) {
      issues.push(...artifactIssues.map((issue) => `${path.basename(record.filePath)}: ${issue}`));
      continue;
    }
    const artifact = record.value;
    const testCase = caseById.get(artifact.caseId)!;
    if (path.basename(record.filePath) !== `${artifact.caseId}.json`) {
      issues.push(`${path.basename(record.filePath)}: filename does not match caseId`);
      continue;
    }
    if (output.has(artifact.caseId)) {
      issues.push(`duplicate ${variant} artifact for ${artifact.caseId}`);
      continue;
    }
    if (!bindingsMatch(iteration[variant], artifact.binding)) {
      issues.push(`${variant} artifact ${artifact.caseId} does not match the iteration binding`);
      continue;
    }
    const receiptIssues = await validateOutputReceipts(
      repositoryRoot,
      artifactRoot,
      artifact,
      testCase,
      variant,
      iteration,
      manifest,
    );
    if (receiptIssues.length > 0) {
      issues.push(...receiptIssues.map((issue) => `${path.basename(record.filePath)}: ${issue}`));
      continue;
    }
    output.set(artifact.caseId, { artifact, sha256: artifactSha256 });
  }
  return output;
}

export function blindArtifactBinding(loaded: LoadedArtifact): BlindArtifactBinding {
  const artifact = loaded.artifact;
  return {
    artifactSha256: loaded.sha256,
    reportSha256: artifact.reportSha256,
    fixtureSha256: artifact.fixture.sha256,
    generationSourceSha256: artifact.generation.sanitizedOutput.sha256,
    canonicalPromptSha256: artifact.generation.canonicalPromptSha256,
    promptSha256: artifact.binding.resumePrompt!.sha256,
    rendererSha256: artifact.binding.renderer!.sha256,
    visibleTextSha256: artifact.presentation.visibleTextSha256,
    screenshotSha256: artifact.presentation.screenshot.sha256,
    ...(artifact.finalization
      ? { finalizationSha256: canonicalJsonSha256(artifact.finalization) }
      : {}),
  };
}

function validBlindArtifactBinding(value: unknown): value is BlindArtifactBinding {
  return isRecord(value) && [
    value.artifactSha256,
    value.reportSha256,
    value.fixtureSha256,
    value.generationSourceSha256,
    value.canonicalPromptSha256,
    value.promptSha256,
    value.rendererSha256,
    value.visibleTextSha256,
    value.screenshotSha256,
  ].every(isSha256)
    && (value.finalizationSha256 === undefined || isSha256(value.finalizationSha256));
}

function artifactBindingsMatch(left: BlindArtifactBinding, right: BlindArtifactBinding) {
  return canonicalJsonSha256(left) === canonicalJsonSha256(right);
}

async function loadMapping(
  artifactRoot: string,
  iteration: GauntletIteration,
  manifest: GauntletManifest,
  candidateOutputs: Map<string, LoadedArtifact>,
  productionOutputs: Map<string, LoadedArtifact>,
  issues: string[],
) {
  const filePath = path.join(artifactRoot, "operator/mapping.json");
  if (!existsSync(filePath)) return null;
  try {
    const safePath = await resolveContainedExistingPath(artifactRoot, "operator/mapping.json");
    const mapping = await readJson<BlindMapping>(safePath);
    if (mapping.schemaVersion !== "2" || mapping.iterationId !== iteration.id || !isRecord(mapping.cases)) {
      issues.push("operator/mapping.json does not match the selected iteration");
      return null;
    }
    const knownCases = new Set(manifest.cases.map((testCase) => testCase.id));
    for (const [caseId, entry] of Object.entries(mapping.cases)) {
      const candidate = candidateOutputs.get(caseId);
      const production = productionOutputs.get(caseId);
      if (!knownCases.has(caseId)
        || !isSha256(entry?.packetSha256)
        || !isRecord(entry?.labels)
        || !["candidate", "production"].includes(entry.labels.A)
        || !["candidate", "production"].includes(entry.labels.B)
        || entry.labels.A === entry.labels.B
        || !isRecord(entry.artifacts)
        || !validBlindArtifactBinding(entry.artifacts.candidate)
        || !validBlindArtifactBinding(entry.artifacts.production)
        || !candidate
        || !production
        || !artifactBindingsMatch(entry.artifacts.candidate, blindArtifactBinding(candidate))
        || !artifactBindingsMatch(entry.artifacts.production, blindArtifactBinding(production))) {
        issues.push(`operator/mapping.json has a stale or invalid entry for ${caseId}`);
        return null;
      }
    }
    return mapping;
  } catch (error) {
    issues.push(`operator/mapping.json is invalid: ${(error as Error).message}`);
    return null;
  }
}

async function validateBlindPacketAssets(
  artifactRoot: string,
  packet: BlindPacket,
  mappingEntry: BlindMapping["cases"][string],
) {
  const issues: string[] = [];
  if (packet.resume.sha256 !== sha256(packet.resume.text)
    || packet.resume.sha256 !== mappingEntry.artifacts.candidate.fixtureSha256
    || packet.resume.sha256 !== mappingEntry.artifacts.production.fixtureSha256) {
    issues.push("resume receipt does not match the packet text and bound fixture pair");
  }
  for (const label of ["A", "B"] as const) {
    const presentation = packet.variants?.[label];
    const mappedVariant = mappingEntry.labels[label];
    const binding = mappingEntry.artifacts[mappedVariant];
    if (presentation?.kind !== "rendered_report"
      || !isNonEmptyString(presentation.visibleText)
      || presentation.visibleText.length < 200
      || presentation.visibleTextSha256 !== sha256(presentation.visibleText)
      || presentation.visibleTextSha256 !== binding.visibleTextSha256
      || !isNonEmptyString(presentation.route)
      || !isRecord(presentation.viewport)
      || !Number.isInteger(presentation.viewport.width)
      || !Number.isInteger(presentation.viewport.height)
      || presentation.viewport.width < 320
      || presentation.viewport.height < 480) {
      issues.push(`variant ${label} is missing or stale rendered-presentation evidence`);
      continue;
    }
    const screenshot = presentation.screenshot;
    if (!screenshot
      || !isSafeRepositoryPath(screenshot.path)
      || !isSha256(screenshot.sha256)
      || screenshot.sha256 !== binding.screenshotSha256) {
      issues.push(`variant ${label} is missing or stale screenshot evidence`);
      continue;
    }
    try {
      const resolved = await resolveContainedExistingPath(path.join(artifactRoot, "packets"), screenshot.path);
      if (sha256(await readFile(resolved)) !== screenshot.sha256) {
        issues.push(`variant ${label} screenshot hash does not match`);
      }
    } catch (error) {
      issues.push(`variant ${label} screenshot is not safely inspectable: ${(error as Error).message}`);
    }
  }
  return issues;
}

function validDimensionRecord(value: unknown, accepted: Set<string>, requireNarrative = false) {
  if (!isRecord(value)) return false;
  return GAUNTLET_DIMENSIONS.every((dimension) => requireNarrative
    ? isNonEmptyString(value[dimension])
    : accepted.has(String(value[dimension])));
}

async function loadBlindJudgments(
  artifactRoot: string,
  iteration: GauntletIteration,
  manifest: GauntletManifest,
  mapping: BlindMapping | null,
  issues: string[],
) {
  const output = new Map<string, ResolvedBlindJudgment>();
  const knownCases = new Set(manifest.cases.map((testCase) => testCase.id));
  const records = await readJsonDirectory<BlindJudgment>(artifactRoot, "judgments", issues);
  const accepted = new Set(["A", "B", "tie"]);
  for (const { filePath, value } of records) {
    const label = path.basename(filePath);
    if (value?.schemaVersion !== "2"
      || value.iterationId !== iteration.id
      || !knownCases.has(value.caseId)
      || path.basename(filePath) !== `${value.caseId}.json`
      || !isNonEmptyString(value.reviewer)
      || !isIsoTimestamp(value.reviewedAt)
      || !timestampInsideIteration(value.reviewedAt, iteration)
      || !validDimensionRecord(value.preferences, accepted)
      || !validDimensionRecord(value.rationale, new Set(), true)) {
      issues.push(`${label}: blind judgment is incomplete or invalid`);
      continue;
    }
    const mappingEntry = mapping?.cases[value.caseId];
    const packetRelative = `packets/${value.caseId}.json`;
    if (!mappingEntry || !existsSync(path.join(artifactRoot, packetRelative))) {
      issues.push(`${label}: no current packet and unblinding entry exist for this judgment`);
      continue;
    }
    let packetRaw: string;
    let packet: BlindPacket;
    try {
      const packetPath = await resolveContainedExistingPath(artifactRoot, packetRelative);
      packetRaw = await readFile(packetPath, "utf8");
      packet = JSON.parse(packetRaw) as BlindPacket;
    } catch (error) {
      issues.push(`${label}: blind packet is invalid: ${(error as Error).message}`);
      continue;
    }
    if (packet.schemaVersion !== "2" || packet.iterationId !== iteration.id || packet.caseId !== value.caseId) {
      issues.push(`${label}: blind packet does not match this judgment`);
      continue;
    }
    const packetIssues = await validateBlindPacketAssets(artifactRoot, packet, mappingEntry);
    if (packetIssues.length > 0) {
      issues.push(...packetIssues.map((issue) => `${label}: ${issue}`));
      continue;
    }
    const packetHash = sha256(packetRaw);
    const judgmentsBindArtifacts = isRecord(value.artifacts)
      && validBlindArtifactBinding(value.artifacts.candidate)
      && validBlindArtifactBinding(value.artifacts.production)
      && artifactBindingsMatch(value.artifacts.candidate, mappingEntry.artifacts.candidate)
      && artifactBindingsMatch(value.artifacts.production, mappingEntry.artifacts.production);
    if (packetHash !== mappingEntry.packetSha256
      || value.packetSha256 !== packetHash
      || !judgmentsBindArtifacts) {
      issues.push(`${label}: judgment is stale for the current output pair or blind packet`);
      continue;
    }
    if (output.has(value.caseId)) {
      issues.push(`duplicate blind judgment for ${value.caseId}`);
      continue;
    }
    output.set(value.caseId, {
      caseId: value.caseId,
      reviewer: value.reviewer,
      reviewedAt: value.reviewedAt,
      rationale: value.rationale,
      preferences: Object.fromEntries(GAUNTLET_DIMENSIONS.map((dimension) => {
        const preference = value.preferences[dimension];
        return [dimension, preference === "tie" ? "tie" : mappingEntry.labels[preference]];
      })) as Record<GauntletDimension, Variant | "tie">,
    });
  }
  return output;
}

async function loadSourceAudits(
  artifactRoot: string,
  iteration: GauntletIteration,
  candidateOutputs: Map<string, LoadedArtifact>,
  issues: string[],
) {
  const output = new Map<string, SourceAudit>();
  const records = await readJsonDirectory<SourceAudit>(artifactRoot, "source-audits", issues);
  for (const { filePath, value } of records) {
    const candidate = candidateOutputs.get(value?.caseId);
    const factsValid = Array.isArray(value?.inventedFacts) && value.inventedFacts.every((fact) => isRecord(fact)
      && isNonEmptyString(fact.claim) && isNonEmptyString(fact.reason));
    if (value?.schemaVersion !== "2"
      || value.iterationId !== iteration.id
      || path.basename(filePath) !== `${value.caseId}.json`
      || !candidate
      || candidate.sha256 !== value.candidateArtifactSha256
      || !isNonEmptyString(value.auditor)
      || !isIsoTimestamp(value.auditedAt)
      || !timestampInsideIteration(value.auditedAt, iteration)
      || !factsValid
      || !isNonEmptyString(value.notes)) {
      issues.push(`${path.basename(filePath)}: source audit is invalid or stale`);
      continue;
    }
    if (output.has(value.caseId)) issues.push(`duplicate source audit for ${value.caseId}`);
    else output.set(value.caseId, value);
  }
  return output;
}

async function loadReferenceAssessments(
  artifactRoot: string,
  iteration: GauntletIteration,
  manifest: GauntletManifest,
  candidateOutputs: Map<string, LoadedArtifact>,
  issues: string[],
) {
  const output = new Map<string, ReferenceAssessment>();
  const knownReferences = new Set(manifest.competitorReferences.map((reference) => reference.id));
  const acceptedVerdicts = new Set(["meets_or_beats", "trails", "inconclusive"]);
  const records = await readJsonDirectory<ReferenceAssessment>(artifactRoot, "reference-assessments", issues);
  for (const { filePath, value } of records) {
    const candidate = candidateOutputs.get(value?.caseId);
    let valid = value?.schemaVersion === "2"
      && value.iterationId === iteration.id
      && path.basename(filePath) === `${value.caseId}.json`
      && Boolean(candidate)
      && candidate?.sha256 === value.candidateArtifactSha256
      && isNonEmptyString(value.assessor)
      && isIsoTimestamp(value.assessedAt)
      && timestampInsideIteration(value.assessedAt, iteration)
      && isRecord(value.dimensions);
    if (valid) {
      valid = GAUNTLET_DIMENSIONS.every((dimension) => {
        const assessment = value.dimensions[dimension];
        return isRecord(assessment)
          && acceptedVerdicts.has(String(assessment.verdict))
          && Array.isArray(assessment.referenceIds)
          && assessment.referenceIds.length > 0
          && assessment.referenceIds.every((id) => knownReferences.has(String(id)))
          && isNonEmptyString(assessment.evidence);
      });
    }
    if (!valid) issues.push(`${path.basename(filePath)}: reference assessment is invalid or stale`);
    else if (output.has(value.caseId)) issues.push(`duplicate reference assessment for ${value.caseId}`);
    else output.set(value.caseId, value);
  }
  return output;
}

async function validateJourneyEvidenceAsset(artifactRoot: string, journeyId: string, evidence: JourneyRun["evidence"][number]) {
  if (!isSafeRepositoryPath(evidence.path)
    || !evidence.path.startsWith(`journeys/evidence/${journeyId}-`)
    || !isSha256(evidence.sha256)) return "journey evidence path or hash is invalid";
  try {
    const filePath = await resolveContainedExistingPath(artifactRoot, evidence.path);
    if (sha256(await readFile(filePath)) !== evidence.sha256) return "journey evidence hash does not match";
  } catch (error) {
    return `journey evidence is not safely inspectable: ${(error as Error).message}`;
  }
  return null;
}

async function loadJourneys(
  artifactRoot: string,
  iteration: GauntletIteration,
  manifest: GauntletManifest,
  issues: string[],
) {
  const output = new Map<string, JourneyRun>();
  const journeyById = new Map(manifest.requiredJourneys.map((journey) => [journey.id, journey]));
  const records = await readJsonDirectory<JourneyRun>(artifactRoot, "journeys", issues);
  for (const { filePath, value } of records) {
    const journey = journeyById.get(value?.journeyId);
    let valid = value?.schemaVersion === "2"
      && value.iterationId === iteration.id
      && path.basename(filePath) === `${value.journeyId}.json`
      && Boolean(journey)
      && value.candidateCommit === iteration.candidate.commit
      && value.journeyDefinitionSha256 === canonicalJsonSha256(journey)
      && value.viewport === journey?.viewport
      && value.completed === true
      && isIsoTimestamp(value.testedAt)
      && isNonEmptyString(value.entryPath) && value.entryPath.startsWith("/") && !value.entryPath.startsWith("//")
      && isNonEmptyString(value.finalPath) && value.finalPath.startsWith("/") && !value.finalPath.startsWith("//")
      && Array.isArray(value.steps) && value.steps.length > 0
      && value.steps.every((step) => isRecord(step)
        && isNonEmptyString(step.label)
        && ["pass", "fail"].includes(step.status)
        && isNonEmptyString(step.evidence))
      && Array.isArray(value.evidence)
      && Array.isArray(value.criticalFailures)
      && value.criticalFailures.every((failure) => isRecord(failure)
        && isNonEmptyString(failure.title)
        && isNonEmptyString(failure.evidence))
      && isNonEmptyString(value.notes);
    if (valid) {
      const testedAt = Date.parse(value.testedAt);
      const lowerBound = Date.parse(iteration.createdAt);
      const upperBound = iteration.seal ? Date.parse(iteration.seal.sealedAt) : Date.now();
      valid = testedAt >= lowerBound
        && testedAt <= upperBound
        && upperBound - testedAt <= JOURNEY_FRESHNESS_MS;
    }
    if (valid) {
      const kinds = new Set(value.evidence.map((item) => item.kind));
      valid = ["screenshot", "dom", "console", "interaction"].every((kind) => kinds.has(kind as JourneyRun["evidence"][number]["kind"]));
    }
    if (valid) {
      const evidencePaths = new Set<string>();
      for (const item of value.evidence) {
        if (evidencePaths.has(item.path)) {
          valid = false;
          break;
        }
        evidencePaths.add(item.path);
        const assetIssue = await validateJourneyEvidenceAsset(artifactRoot, value.journeyId, item);
        if (assetIssue) {
          issues.push(`${path.basename(filePath)}: ${assetIssue}`);
          valid = false;
        }
      }
    }
    if (valid && value.steps.some((step) => step.status === "fail") && value.criticalFailures.length === 0) valid = false;
    if (!valid) issues.push(`${path.basename(filePath)}: journey receipt is stale, incomplete, or invalid`);
    else if (output.has(value.journeyId)) issues.push(`duplicate journey receipt for ${value.journeyId}`);
    else output.set(value.journeyId, value);
  }
  return output;
}

async function runAutomatedChecks(
  repositoryRoot: string,
  manifest: GauntletManifest,
  calibration: CalibrationData | null,
  candidateOutputs: Map<string, LoadedArtifact>,
  issues: string[],
) {
  const checks = new Map<string, AutomatedCheck>();
  if (!calibration) {
    if (candidateOutputs.size > 0) {
      issues.push("automated checks cannot run because repository calibration data is unavailable on this host");
    }
    return checks;
  }
  const fixtures = new Map(calibration.fixtures.map((fixture) => [fixture.id, fixture]));
  await Promise.all(manifest.cases.map(async (testCase) => {
    const loaded = candidateOutputs.get(testCase.id);
    const fixture = fixtures.get(testCase.fixtureId);
    if (!loaded || !fixture) return;
    try {
      const resume = await readGitBlob(
        repositoryRoot,
        loaded.artifact.generation.sourceCommit,
        `tests/resumes/${testCase.resumePath}`,
      );
      if (sha256(resume) !== loaded.artifact.fixture.sha256) {
        throw new Error("generation-bound fixture receipt is stale");
      }
      const result = runAllChecks({
        output: loaded.artifact.report,
        resumeText: resume.toString("utf8"),
        fixture,
        globalBanned: calibration.global_banned_phrases,
        globalDiscouraged: calibration.global_discouraged_phrases,
        expectedContractVersion: calibration.contract_version,
      });
      checks.set(testCase.id, {
        caseId: testCase.id,
        errors: result.errors,
        sourceIntegrityErrors: result.errors.filter((error) => SOURCE_INTEGRITY_CODES.has(error.code)),
      });
    } catch (error) {
      issues.push(`automated checks failed for ${testCase.id}: ${(error as Error).message}`);
    }
  }));
  return checks;
}

async function loadEvidence(
  definition: Awaited<ReturnType<typeof validateGauntletDefinition>>,
  integrityHooks?: GauntletProgressIntegrityHooks,
): Promise<LoadedEvidence> {
  const {
    webRoot,
    repositoryRoot,
    repositoryAvailable,
    manifest,
    iteration,
    iterationLedgerSha256,
    calibration,
  } = definition;
  const dataIssues = [...definition.issues];
  const artifactRoot = await resolveArtifactRoot(webRoot, iteration.id, dataIssues);
  const completeLedgers = definition.ledgers.filter((ledger) => ledger.iteration.status === "complete");
  const anchorResults = await Promise.all(completeLedgers.map(async (ledger) => {
    try {
      const ledgerArtifactRoot = ledger.iteration.id === iteration.id
        ? artifactRoot
        : await resolveArtifactRoot(webRoot, ledger.iteration.id, dataIssues);
      return {
        iterationId: ledger.iteration.id,
        validation: await validateGitAnchor({
          repositoryRoot,
          webRoot,
          iteration: ledger.iteration,
          ledgerSha256: ledger.sha256,
          artifactRoot: ledgerArtifactRoot,
        }),
      };
    } catch (error) {
      return {
        iterationId: ledger.iteration.id,
        validation: {
          valid: false,
          anchorCommit: null,
          evidenceCommit: null,
          issues: [`${ledger.iteration.id}: Git anchor invalid: ${(error as Error).message}`],
        } satisfies GitAnchorValidation,
      };
    }
  }));
  for (const result of anchorResults) dataIssues.push(...result.validation.issues);
  const selectedAnchor = anchorResults.find((result) => result.iterationId === iteration.id)?.validation;
  const legacyAuthorization = await authorizeLegacyCapture({
    iteration,
    ledgerSha256: iterationLedgerSha256,
    artifactRoot,
  });
  if (legacyAuthorization.authorized) {
    await integrityHooks?.afterLegacySnapshot?.();
  }
  if (legacyAuthorization.claimed && !legacyAuthorization.authorized) {
    dataIssues.push(
      `${iteration.id}: legacy capture fingerprint does not match the immutable ledger and 24-artifact allowlist`,
    );
  }
  const [candidateOutputs, productionOutputs] = await Promise.all([
    loadOutputArtifacts(
      repositoryRoot,
      artifactRoot,
      "candidate",
      iteration,
      legacyAuthorization.authorized,
      legacyAuthorization.snapshot?.candidate ?? null,
      manifest,
      dataIssues,
    ),
    loadOutputArtifacts(
      repositoryRoot,
      artifactRoot,
      "production",
      iteration,
      legacyAuthorization.authorized,
      legacyAuthorization.snapshot?.production ?? null,
      manifest,
      dataIssues,
    ),
  ]);
  const legacyCaptureIteration = legacyAuthorization.authorized;
  if (!legacyCaptureIteration
    && (candidateOutputs.size > 0 || productionOutputs.size > 0)
    && iteration.baselineStatement !== GAUNTLET_FINALIZED_CAPTURE_STATEMENT) {
    dataIssues.push(
      `${iteration.id}: baselineStatement must equal the exact finalized-v1 raw-source and commit-bound finalization disclosure`,
    );
  }
  if (!legacyCaptureIteration && (candidateOutputs.size > 0 || productionOutputs.size > 0)) {
    const archiveIdentities = (outputs: Map<string, LoadedArtifact>) => new Map(
      [...outputs.values()].map((loaded) => {
        const identity = loaded.artifact.presentation.captureReceipt!.archiveIdentity;
        return [canonicalJsonSha256(identity), identity] as const;
      }),
    );
    const candidateIdentities = archiveIdentities(candidateOutputs);
    const productionIdentities = archiveIdentities(productionOutputs);
    if (candidateOutputs.size !== manifest.target.caseCount || candidateIdentities.size !== 1) {
      dataIssues.push(
        `${iteration.id}: candidate capture set must share exactly one archive identity across all ${manifest.target.caseCount} cases`,
      );
    }
    if (productionOutputs.size !== manifest.target.caseCount || productionIdentities.size !== 1) {
      dataIssues.push(
        `${iteration.id}: production capture set must share exactly one archive identity across all ${manifest.target.caseCount} cases`,
      );
    }
    if (candidateIdentities.size === 1 && productionIdentities.size === 1) {
      const candidateNonce = [...candidateIdentities.values()][0].nonce;
      const productionNonce = [...productionIdentities.values()][0].nonce;
      if (candidateNonce === productionNonce) {
        dataIssues.push(`${iteration.id}: candidate and production archive nonces must differ`);
      }
    }
  }
  for (const testCase of manifest.cases) {
    const candidate = candidateOutputs.get(testCase.id);
    const production = productionOutputs.get(testCase.id);
    if (candidate && production
      && canonicalJsonSha256(candidate.artifact.generation)
        !== canonicalJsonSha256(production.artifact.generation)) {
      dataIssues.push(`${testCase.id}: candidate and production do not share the same immutable generation receipt`);
    }
    if (candidate && production && !legacyCaptureIteration) {
      const candidateArtifact = candidate.artifact;
      const productionArtifact = production.artifact;
      const candidateDependencies = candidateArtifact.binding.dependencyClosure;
      const productionDependencies = productionArtifact.binding.dependencyClosure;
      if (candidateArtifact.captureContract !== GAUNTLET_CAPTURE_CONTRACT
        || productionArtifact.captureContract !== GAUNTLET_CAPTURE_CONTRACT
        || candidateArtifact.reportMode !== "candidate_commit_finalized"
        || productionArtifact.reportMode !== "historical_raw_unfinalized") {
        dataIssues.push(`${testCase.id}: finalized-v1 report modes are missing or inconsistent`);
      }
      if (!candidateDependencies
        || !productionDependencies
        || canonicalJsonSha256(candidateDependencies) !== canonicalJsonSha256(productionDependencies)
        || candidateDependencies.packageLock.productionCommit !== productionArtifact.binding.commit
        || candidateDependencies.packageLock.candidateCommit !== candidateArtifact.binding.commit) {
        dataIssues.push(`${testCase.id}: production and candidate do not share one commit-bound dependency closure`);
      }
      if (candidateArtifact.binding.commit === productionArtifact.binding.commit
        || candidateArtifact.binding.renderer?.sha256 === productionArtifact.binding.renderer?.sha256) {
        dataIssues.push(`${testCase.id}: finalized-v1 must compare a different candidate commit and renderer`);
      }
      if (!candidateArtifact.binding.runtimeClosure?.files.some(
        (receipt) => receipt.path === GAUNTLET_VALIDATOR_PATH,
      ) || !candidateArtifact.binding.runtimeClosure?.files.some(
        (receipt) => receipt.path === GAUNTLET_FINALIZER_PATH,
      )) {
        dataIssues.push(`${testCase.id}: candidate runtime closure omits its validator or finalizer`);
      }
    }
  }
  const mapping = await loadMapping(
    artifactRoot,
    iteration,
    manifest,
    candidateOutputs,
    productionOutputs,
    dataIssues,
  );
  const [automatedChecks, blindJudgments, sourceAudits, referenceAssessments, journeys] = await Promise.all([
    runAutomatedChecks(repositoryRoot, manifest, calibration, candidateOutputs, dataIssues),
    loadBlindJudgments(artifactRoot, iteration, manifest, mapping, dataIssues),
    loadSourceAudits(artifactRoot, iteration, candidateOutputs, dataIssues),
    loadReferenceAssessments(artifactRoot, iteration, manifest, candidateOutputs, dataIssues),
    loadJourneys(artifactRoot, iteration, manifest, dataIssues),
  ]);

  let sealValid = false;
  if (iteration.status === "complete" && iteration.seal) {
    try {
      const artifactSetSha256 = await hashArtifactTree(artifactRoot);
      sealValid = artifactSetSha256 === iteration.seal.artifactSetSha256;
      if (!sealValid) dataIssues.push(`${iteration.id}: artifact-set seal is stale; evidence changed after sealing`);
    } catch (error) {
      dataIssues.push(`${iteration.id}: artifact-set seal cannot be verified: ${(error as Error).message}`);
    }
  }
  if (iteration.status === "baseline_pending" && (
    candidateOutputs.size > 0
    || productionOutputs.size > 0
    || blindJudgments.size > 0
    || sourceAudits.size > 0
    || referenceAssessments.size > 0
    || journeys.size > 0
  )) {
    dataIssues.push(`${iteration.id}: pending baseline may not contain evaluation evidence`);
  }
  return {
    candidateOutputs,
    productionOutputs,
    automatedChecks,
    blindJudgments,
    sourceAudits,
    referenceAssessments,
    journeys,
    sealValid,
    gitAnchorValid: selectedAnchor?.valid ?? false,
    anchorCommit: selectedAnchor?.anchorCommit ?? null,
    evidenceCommit: selectedAnchor?.evidenceCommit ?? null,
    repositoryAvailable,
    dataIssues,
  };
}

function statusForCoverage(count: number, total: number, failures = 0): GateStatus {
  if (failures > 0) return "fail";
  return count === total ? "pass" : "pending";
}

function summarizeBlindDimensions(manifest: GauntletManifest, evidence: LoadedEvidence): DimensionProgress[] {
  return GAUNTLET_DIMENSIONS.map((dimension) => {
    let candidateWins = 0;
    let productionWins = 0;
    let ties = 0;
    for (const judgment of evidence.blindJudgments.values()) {
      const preference = judgment.preferences[dimension];
      if (preference === "candidate") candidateWins += 1;
      else if (preference === "production") productionWins += 1;
      else ties += 1;
    }
    const reviewed = candidateWins + productionWins + ties;
    const complete = reviewed === manifest.target.caseCount;
    const rate = complete ? candidateWins / manifest.target.caseCount : null;
    return {
      dimension,
      candidateWins,
      productionWins,
      ties,
      reviewed,
      rate,
      targetWins: manifest.target.minimumPreferredCases,
      status: complete ? candidateWins >= manifest.target.minimumPreferredCases ? "pass" : "fail" : "pending",
    };
  });
}

function summarizeReferenceDimensions(manifest: GauntletManifest, evidence: LoadedEvidence): DimensionProgress[] {
  return GAUNTLET_DIMENSIONS.map((dimension) => {
    let candidateWins = 0;
    let productionWins = 0;
    let ties = 0;
    for (const assessment of evidence.referenceAssessments.values()) {
      const verdict = assessment.dimensions[dimension].verdict;
      if (verdict === "meets_or_beats") candidateWins += 1;
      else if (verdict === "trails") productionWins += 1;
      else ties += 1;
    }
    const reviewed = candidateWins + productionWins + ties;
    const complete = reviewed === manifest.target.caseCount;
    const rate = complete ? candidateWins / manifest.target.caseCount : null;
    return {
      dimension,
      candidateWins,
      productionWins,
      ties,
      reviewed,
      rate,
      targetWins: manifest.target.minimumPreferredCases,
      status: complete ? candidateWins >= manifest.target.minimumPreferredCases ? "pass" : "fail" : "pending",
    };
  });
}

function combineGateStatuses(gates: Array<{ status: GateStatus }>): GateStatus {
  if (gates.some((gate) => gate.status === "fail")) return "fail";
  if (gates.every((gate) => gate.status === "pass")) return "pass";
  return "pending";
}

function iterationSummaries(
  ledgers: IterationLedger[],
  selectedIterationId: string,
  activeIterationId: string,
): IterationLedgerSummary[] {
  return [...ledgers].reverse().map((ledger) => ({
    id: ledger.iteration.id,
    label: ledger.iteration.label,
    createdAt: ledger.iteration.createdAt,
    status: ledger.iteration.status,
    criticVerdict: ledger.iteration.critic.verdict,
    ledgerSha256: ledger.sha256,
    selected: ledger.iteration.id === selectedIterationId,
    active: ledger.iteration.id === activeIterationId,
  }));
}

function inspectVariant(testCase: GauntletCase, loaded: LoadedArtifact | undefined): CaseVariantInspection | null {
  if (!loaded) return null;
  const artifact = loaded.artifact;
  return {
    variant: artifact.variant,
    binding: artifact.binding,
    generation: artifact.generation,
    artifactSha256: loaded.sha256,
    fixtureSha256: artifact.fixture.sha256,
    reportSha256: artifact.reportSha256,
    presentation: {
      route: artifact.presentation.route,
      viewport: artifact.presentation.viewport,
      visibleText: testCase.provenance === "synthetic"
        ? artifact.presentation.visibleText
        : "Presentation withheld because this case is not synthetic.",
      visibleTextSha256: artifact.presentation.visibleTextSha256,
      screenshotSha256: artifact.presentation.screenshot.sha256,
    },
  };
}

export function summarizeGauntletProgress(
  manifest: GauntletManifest,
  iteration: GauntletIteration,
  evidence: LoadedEvidence,
  context?: { iterationLedgerSha256?: string; ledgers?: IterationLedger[] },
): GauntletProgressSnapshot {
  const total = manifest.target.caseCount;
  const pairedCaseIds = new Set(manifest.cases
    .filter((testCase) => evidence.candidateOutputs.has(testCase.id) && evidence.productionOutputs.has(testCase.id))
    .map((testCase) => testCase.id));
  const reportContractFailures = [...evidence.automatedChecks.values()].filter((check) => check.errors.length > 0).length;
  const automatedSourceIntegrityViolations = [...evidence.automatedChecks.values()]
    .reduce((count, check) => count + check.sourceIntegrityErrors.length, 0);
  const manuallyInventedFacts = evidence.sourceAudits.size === 0
    ? null
    : [...evidence.sourceAudits.values()].reduce((count, audit) => count + audit.inventedFacts.length, 0);
  const completedJourneys = evidence.journeys.size;
  const criticalJourneyFailures = evidence.journeys.size === 0
    ? null
    : [...evidence.journeys.values()].reduce((count, journey) => count + journey.criticalFailures.length, 0);
  const dimensions = summarizeBlindDimensions(manifest, evidence);
  const referenceDimensions = summarizeReferenceDimensions(manifest, evidence);
  const bindingsComplete = evidence.repositoryAvailable
    && hasCompleteBinding(iteration.candidate)
    && hasCompleteBinding(iteration.production);
  const criticStatus: GateStatus = iteration.critic.verdict === "pass"
    ? "pass"
    : iteration.critic.verdict === "fail" ? "fail" : "pending";
  const sealStatus: GateStatus = iteration.status === "complete"
    ? evidence.sealValid ? "pass" : "fail"
    : "pending";
  const gitAnchorStatus: GateStatus = iteration.status === "complete"
    ? evidence.gitAnchorValid ? "pass" : "fail"
    : "pending";
  const completeEvidenceReady = bindingsComplete
    && pairedCaseIds.size === total
    && evidence.automatedChecks.size === total
    && reportContractFailures === 0
    && dimensions.every((dimension) => dimension.status === "pass")
    && referenceDimensions.every((dimension) => dimension.status === "pass")
    && automatedSourceIntegrityViolations === 0
    && manuallyInventedFacts === 0
    && evidence.sourceAudits.size === total
    && completedJourneys === manifest.requiredJourneys.length
    && criticalJourneyFailures === 0
    && criticStatus === "pass"
    && evidence.sealValid
    && evidence.gitAnchorValid
    && evidence.dataIssues.length === 0;

  const gates = [
    {
      id: "case-set",
      label: "Twelve-case synthetic corpus",
      status: manifest.cases.length === total ? "pass" as const : "fail" as const,
      detail: `${manifest.cases.length}/${total} configured from existing eval fixtures`,
    },
    {
      id: "candidate-binding",
      label: "Real commit and canonical source receipts",
      status: bindingsComplete ? "pass" as const : "pending" as const,
      detail: bindingsComplete
        ? "Both variants resolve to real commits with prompt and renderer receipts"
        : evidence.repositoryAvailable
          ? "Commit, model, canonical prompt, or renderer receipt is still missing"
          : "Git metadata is unavailable on this host; no repository-bound result is claimed",
    },
    {
      id: "paired-outputs",
      label: "Paired rendered presentations",
      status: statusForCoverage(pairedCaseIds.size, total),
      detail: `${pairedCaseIds.size}/${total} production/candidate report plus rendered-presentation pairs are present`,
    },
    {
      id: "report-contract",
      label: "Automated report contract",
      status: statusForCoverage(evidence.automatedChecks.size, total, reportContractFailures),
      detail: reportContractFailures > 0
        ? `${reportContractFailures} candidate reports have blocking eval errors`
        : `${evidence.automatedChecks.size}/${total} candidate reports checked`,
    },
    ...dimensions.map((dimension) => ({
      id: `blind-${dimension.dimension}`,
      label: `Blind ${dimension.dimension} preference`,
      status: dimension.status,
      detail: dimension.rate === null
        ? `${dimension.reviewed}/${total} reviewed; target ${dimension.targetWins} candidate wins`
        : `${dimension.candidateWins}/${total} candidate wins (${Math.round(dimension.rate * 100)}%)`,
    })),
    ...referenceDimensions.map((dimension) => ({
      id: `reference-${dimension.dimension}`,
      label: `Public-reference ${dimension.dimension}`,
      status: dimension.status,
      detail: dimension.rate === null
        ? `${dimension.reviewed}/${total} assessed; target ${dimension.targetWins} meets-or-beats verdicts`
        : `${dimension.candidateWins}/${total} meets or beats the inspected public bar`,
    })),
    {
      id: "source-integrity",
      label: "Zero invented facts",
      status: automatedSourceIntegrityViolations > 0 || (manuallyInventedFacts ?? 0) > 0
        ? "fail" as const
        : evidence.automatedChecks.size === total && evidence.sourceAudits.size === total ? "pass" as const : "pending" as const,
      detail: automatedSourceIntegrityViolations > 0 || (manuallyInventedFacts ?? 0) > 0
        ? `${automatedSourceIntegrityViolations} automated source violations; ${manuallyInventedFacts ?? 0} human-confirmed inventions`
        : `${evidence.sourceAudits.size}/${total} human source audits; ${evidence.automatedChecks.size}/${total} automated checks`,
    },
    {
      id: "journeys",
      label: "Fresh critical desktop/mobile journeys",
      status: (criticalJourneyFailures ?? 0) > manifest.target.maxCriticalJourneyFailures
        ? "fail" as const
        : completedJourneys === manifest.requiredJourneys.length ? "pass" as const : "pending" as const,
      detail: criticalJourneyFailures === null
        ? `0/${manifest.requiredJourneys.length} fresh journey receipts imported; failure count unavailable`
        : `${completedJourneys}/${manifest.requiredJourneys.length} complete; ${criticalJourneyFailures} critical failures`,
    },
    {
      id: "critic-verdict",
      label: "Independent critic verdict",
      status: criticStatus,
      detail: `${iteration.critic.verdict}: ${iteration.critic.rationale}`,
    },
    {
      id: "iteration-seal",
      label: "Immutable iteration seal",
      status: sealStatus,
      detail: sealStatus === "pass"
        ? "Ledger case set and complete artifact tree match their sealed hashes"
        : iteration.status === "complete" ? "Complete iteration seal is stale or invalid" : "Iteration has not been completed and sealed",
    },
    {
      id: "git-anchor",
      label: "Git-backed evidence anchor",
      status: gitAnchorStatus,
      detail: gitAnchorStatus === "pass"
        ? `Evidence commit ${evidence.evidenceCommit} is pinned by immutable anchor commit ${evidence.anchorCommit}`
        : iteration.status === "complete"
          ? "Complete ledger and every evidence file must match a dedicated post-evidence Git anchor"
          : evidence.repositoryAvailable
            ? "Incomplete iterations do not require a Git anchor"
            : "Git metadata is unavailable on this host; this incomplete iteration remains unverified",
    },
    {
      id: "completion-record",
      label: "Complete record is earned",
      status: iteration.status === "complete"
        ? completeEvidenceReady ? "pass" as const : "fail" as const
        : "pending" as const,
      detail: iteration.status === "complete"
        ? completeEvidenceReady
          ? "Every required gate was complete when this immutable record was sealed"
          : "Ledger says complete, but one or more required gates are absent, failing, or stale"
        : "Iteration remains an explicitly incomplete record",
    },
    {
      id: "evidence-integrity",
      label: "Evidence integrity",
      status: evidence.dataIssues.length > 0
        ? "fail" as const
        : evidence.sealValid ? "pass" as const : "pending" as const,
      detail: evidence.dataIssues.length > 0
        ? `${evidence.dataIssues.length} invalid, stale, unsafe, or mismatched evidence records`
        : evidence.sealValid
          ? "No stale hashes, unsafe paths, mismatched bindings, or malformed records detected"
          : "No sealed evidence tree exists to verify yet",
    },
  ];

  const cases: CaseProgress[] = manifest.cases.map((testCase) => {
    const judgment = evidence.blindJudgments.get(testCase.id);
    return {
      id: testCase.id,
      role: testCase.role,
      seniority: testCase.seniority,
      quality: testCase.quality,
      pairedOutputs: pairedCaseIds.has(testCase.id),
      blindReviewed: Boolean(judgment),
      automatedChecked: evidence.automatedChecks.has(testCase.id),
      sourceAudited: evidence.sourceAudits.has(testCase.id),
      referenceAssessed: evidence.referenceAssessments.has(testCase.id),
      blindVerdict: judgment ? {
        reviewer: judgment.reviewer,
        reviewedAt: judgment.reviewedAt,
        preferences: judgment.preferences,
        rationale: judgment.rationale,
      } : null,
      candidate: inspectVariant(testCase, evidence.candidateOutputs.get(testCase.id)),
      production: inspectVariant(testCase, evidence.productionOutputs.get(testCase.id)),
    };
  });

  const baselineGaps: string[] = [];
  if (!evidence.repositoryAvailable) {
    baselineGaps.push("Git metadata is unavailable on this host; run strict validation in the protected repository before treating evidence as verified.");
  }
  if (!bindingsComplete) baselineGaps.push("Bind production and candidate to real commits plus canonical prompt and renderer receipts.");
  if (pairedCaseIds.size < total) baselineGaps.push(`Import ${total - pairedCaseIds.size} remaining production/candidate report and rendered-presentation pairs.`);
  if (evidence.blindJudgments.size < total) baselineGaps.push(`Complete ${total - evidence.blindJudgments.size} remaining blind reviews.`);
  if (evidence.sourceAudits.size < total) baselineGaps.push(`Complete ${total - evidence.sourceAudits.size} remaining human source audits.`);
  if (evidence.referenceAssessments.size < total) baselineGaps.push(`Complete ${total - evidence.referenceAssessments.size} remaining structured public-reference assessments.`);
  if (completedJourneys < manifest.requiredJourneys.length) baselineGaps.push(`Import ${manifest.requiredJourneys.length - completedJourneys} remaining fresh cold-visitor journey receipts.`);
  if (iteration.critic.verdict !== "pass") baselineGaps.push(`Critic remaining gap: ${iteration.critic.remainingGap}`);
  if (!evidence.sealValid) baselineGaps.push("Complete and seal the immutable evidence tree before treating this iteration as a result.");
  if (iteration.status === "complete" && !evidence.gitAnchorValid) {
    baselineGaps.push("Commit the sealed ledger and evidence, then add its immutable post-evidence Git anchor in a separate commit.");
  }
  baselineGaps.push("Same-resume Teal and Jobscan outputs are unavailable because no competitor account was created; external evidence is limited to their inspected public artifacts.");
  baselineGaps.push(...evidence.dataIssues);

  return {
    generatedAt: new Date().toISOString(),
    manifest,
    iteration,
    iterationLedgerSha256: context?.iterationLedgerSha256 ?? "unsealed-test-snapshot",
    iterations: iterationSummaries(context?.ledgers ?? [], iteration.id, manifest.activeIterationId),
    overallStatus: combineGateStatuses(gates),
    configuredCases: manifest.cases.length,
    pairedOutputCases: pairedCaseIds.size,
    blindReviewedCases: evidence.blindJudgments.size,
    sourceAuditedCases: evidence.sourceAudits.size,
    referenceAssessedCases: evidence.referenceAssessments.size,
    automatedCheckedCases: evidence.automatedChecks.size,
    reportContractFailures,
    automatedSourceIntegrityViolations,
    manuallyInventedFacts,
    criticalJourneyFailures,
    completedJourneys,
    dimensions,
    referenceDimensions,
    cases,
    gates,
    baselineGaps,
    dataIssues: evidence.dataIssues,
  };
}

export async function getGauntletProgress(
  explicitWebRoot?: string,
  requestedIterationId?: string,
  integrityHooks?: GauntletProgressIntegrityHooks,
) {
  const { definition, evidence } = await loadValidatedGauntletEvidence(
    explicitWebRoot,
    requestedIterationId,
    integrityHooks,
  );
  return summarizeGauntletProgress(definition.manifest, definition.iteration, evidence, {
    iterationLedgerSha256: definition.iterationLedgerSha256,
    ledgers: definition.ledgers,
  });
}

export async function loadValidatedGauntletEvidence(
  explicitWebRoot?: string,
  requestedIterationId?: string,
  integrityHooks?: GauntletProgressIntegrityHooks,
) {
  const definition = await validateGauntletDefinition(explicitWebRoot, requestedIterationId);
  const evidence = await loadEvidence(definition, integrityHooks);
  return { definition, evidence };
}

export function journeyDefinitionSha256(journey: RequiredJourney) {
  return canonicalJsonSha256(journey);
}
