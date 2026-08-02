import { lstat, readFile, readdir, realpath } from "node:fs/promises";
import path from "node:path";
import type { CalibrationData } from "../../evals/types";
import { observedInstalledTreeReceipt } from "../dependency-closure";
import {
  assertSafeComponent,
  canonicalJsonSha256,
  dirtyRepositoryPaths,
  findRepositoryRoot,
  gitHead,
  isPathInside,
  isSafeComponent,
  isSafeRepositoryPath,
  readGitBlob,
  resolveContainedExistingPath,
  resolveRealCommit,
  sha256,
} from "../integrity";
import {
  GAUNTLET_DIMENSIONS,
  GAUNTLET_VALIDATOR_PATH,
  type CandidateBinding,
  type GauntletIteration,
  type GauntletManifest,
  type Variant,
} from "../types";
import {
  dependencyTreeMatchesCurrentHost,
  hasCompleteBinding,
  isIsoTimestamp,
  isNonEmptyString,
  isRecord,
  isSha256,
  isUnboundIteration002Candidate,
  readJson,
  receiptComplete,
  resolveContainedRegularDirectory,
  resolveWebRoot,
  type IterationLedger,
} from "./common";

const CANONICAL_RESUME_PROMPT = "web/prompts/resume_v2.txt";
const CANONICAL_RENDERER_PREFIXES = [
  "web/components/workspace/report/",
  "web/lib/reports/",
];

export function unboundCandidateAllowed(status: GauntletIteration["status"]) {
  return status === "baseline_pending" || status === "pending";
}

export class UnknownGauntletIterationError extends Error {}

function validateBindingShape(binding: unknown, variant: Variant, ledgerName: string) {
  const issues: string[] = [];
  if (!isRecord(binding)) return [`${ledgerName}: ${variant} binding is missing`];
  if (!isNonEmptyString(binding.ref)) issues.push(`${ledgerName}: ${variant} ref is missing`);
  if (!["deployed_baseline", "not_deployed"].includes(String(binding.deploymentStatus))) {
    issues.push(`${ledgerName}: ${variant} deploymentStatus is invalid`);
  }
  return issues;
}

function validateIterationShape(iteration: GauntletIteration, ledgerName: string) {
  const issues: string[] = [];
  if (!isRecord(iteration) || iteration.schemaVersion !== "2") {
    return [`${ledgerName}: schemaVersion must be 2`];
  }
  if (!isSafeComponent(iteration.id)) issues.push(`${ledgerName}: id is unsafe`);
  if (!isNonEmptyString(iteration.label)) issues.push(`${ledgerName}: label is missing`);
  if (!isIsoTimestamp(iteration.createdAt)) issues.push(`${ledgerName}: createdAt must be an ISO timestamp`);
  if (!["baseline_pending", "pending", "collecting", "complete"].includes(iteration.status)) {
    issues.push(`${ledgerName}: status is invalid`);
  }
  issues.push(...validateBindingShape(iteration.production, "production", ledgerName));
  issues.push(...validateBindingShape(iteration.candidate, "candidate", ledgerName));
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
  } else if (iteration.critic.verdict === "pending") {
    if (iteration.critic.reviewer !== null
      || iteration.critic.reviewedAt !== null
      || iteration.critic.artifact !== null) {
      issues.push(`${ledgerName}: pending critic record may not claim reviewer evidence`);
    }
  } else if (!isNonEmptyString(iteration.critic.reviewer)
    || !isIsoTimestamp(iteration.critic.reviewedAt)
    || !receiptComplete(iteration.critic.artifact)) {
    issues.push(`${ledgerName}: decided critic record requires reviewer, timestamp, and artifact receipt`);
  }
  if (iteration.status === "complete" && iteration.critic.verdict !== "pass") {
    issues.push(`${ledgerName}: complete iteration requires a passing critic verdict`);
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
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw) as unknown;
    } catch (error) {
      issues.push(`${entry.name}: invalid JSON: ${(error as Error).message}`);
      continue;
    }
    if (!isRecord(parsed)) {
      issues.push(`${entry.name}: schemaVersion must be 2`);
      continue;
    }
    const iteration = parsed as unknown as GauntletIteration;
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
  iterationStatus: GauntletIteration["status"],
  repositoryAvailable = true,
) {
  if (!isRecord(binding)) return [`${variant} binding is missing or malformed`];
  if (variant === "candidate" && isUnboundIteration002Candidate(binding)) {
    return unboundCandidateAllowed(iterationStatus)
      ? []
      : [`candidate binding may not remain unbound when the iteration is ${iterationStatus}`];
  }
  if (!hasCompleteBinding(binding)) return [`${variant} binding is partial or malformed`];
  const issues: string[] = [];
  if (variant === "production" && binding.deploymentStatus !== "deployed_baseline") {
    issues.push("production binding must identify the deployed baseline");
  }
  if (variant === "candidate" && binding.deploymentStatus !== "not_deployed") {
    issues.push("candidate binding may not claim baseline deployment");
  }
  if (!repositoryAvailable) {
    if (iterationStatus === "complete") {
      issues.push(`${variant} binding cannot be verified because Git metadata is unavailable on this host`);
    }
    return issues;
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
        readGitBlob(repositoryRoot, dependency.packageLock.productionCommit, dependency.packageLock.path),
        readGitBlob(repositoryRoot, dependency.packageLock.candidateCommit, dependency.packageLock.path),
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
      if (dependencyTreeMatchesCurrentHost(dependency.installedTree)) {
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
      else if (fixture.path !== testCase.resumePath) {
        issues.push(`${testCase.id} path does not match calibration fixture ${testCase.fixtureId}`);
      }
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
      iteration.status,
      repositoryAvailable,
    ),
    validateBindingAgainstRepository(
      repositoryRoot,
      iteration.candidate,
      "candidate",
      iteration.status,
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
