import { existsSync } from "node:fs";
import { lstat, readFile, realpath } from "node:fs/promises";
import path from "node:path";
import {
  GAUNTLET_RUNTIME_CLOSURE_PATHS,
  GAUNTLET_VALIDATOR_PATH,
  type CandidateBinding,
  type ContentReceipt,
  type DependencyClosureReceipt,
  type FinalizationValidatorReceipt,
  type GauntletIteration,
  type GauntletManifest,
  type RuntimeClosureReceipt,
} from "../../lib/gauntlet/types";
import {
  APPROVED_CASE_FIXTURES,
  CAPTURE_HARNESS_PATHS,
  PROMPT_PATH,
  RENDERER_PATH,
  assertApprovedCaptureManifest,
  canonicalJsonSha256,
  serialize,
  sha256,
  type SanitizedHistoricalSource,
} from "./contracts";
import { dependencyClosureFor } from "./repository-dependencies";
import { parseCommittedRunnerAttestation } from "./runner-attestation";
import {
  execFileBuffer,
  gitText,
  readGitBlob,
  resolveCommit,
} from "./repository-git";

const SOURCE_PATH = /^web\/gauntlet\/sources\/[a-z0-9][a-z0-9-]*\.json$/;
const RUNNER_RECEIPT_PATH = /^web\/gauntlet\/runner-receipts\/[a-z0-9][a-z0-9-]*\.json$/;
const SAFE_COMPONENT = /^[a-z0-9][a-z0-9-]{0,63}$/;
const SHA256 = /^[a-f0-9]{64}$/;
const MAX_SOURCE_AGE_MS = 48 * 60 * 60 * 1000;

export type CapturePlan = {
  repositoryRoot: string;
  manifest: GauntletManifest;
  iterationId: string;
  productionCommit: string;
  candidateCommit: string;
  sourceCommit: string;
  sourcePath: string;
  source: SanitizedHistoricalSource;
  sourceBytes: Buffer;
  production: CandidateBinding;
  candidate: CandidateBinding;
  candidateValidator: FinalizationValidatorReceipt;
  dependencyClosure: DependencyClosureReceipt;
  fixtureBytes: Map<string, Buffer>;
};

export async function loadApprovedFixtureBytes(
  manifest: GauntletManifest,
  readFixture: (repositoryPath: string) => Promise<Buffer>,
) {
  assertApprovedCaptureManifest(manifest);
  const fixtureBytes = new Map<string, Buffer>();
  for (const testCase of manifest.cases) {
    const bytes = await readFixture(`tests/resumes/${testCase.resumePath}`);
    const approved = APPROVED_CASE_FIXTURES.find((entry) => entry.caseId === testCase.id);
    if (!approved || sha256(bytes) !== approved.fixtureSha256) {
      throw new Error(`fixture bytes do not match the locked synthetic source: ${testCase.id}`);
    }
    fixtureBytes.set(testCase.id, bytes);
  }
  return fixtureBytes;
}

async function assertAncestor(repositoryRoot: string, ancestor: string, descendant: string, label: string) {
  try {
    await execFileBuffer("git", ["-C", repositoryRoot, "merge-base", "--is-ancestor", ancestor, descendant], repositoryRoot);
  } catch {
    throw new Error(label);
  }
}

function validateSanitizedSource(source: SanitizedHistoricalSource, manifest: GauntletManifest) {
  if (source.schemaVersion !== "1" || source.kind !== "historical-live-eval-synthetic-subset") {
    throw new Error("sanitized source envelope is invalid");
  }
  const run = source.sourceRun;
  if (!SHA256.test(run.fullRunSha256)
    || !SHA256.test(run.canonicalPromptSha256)
    || !run.runId
    || !run.generatedAt
    || !Number.isFinite(Date.parse(run.generatedAt))
    || run.executionMode !== "live"
    || !run.model
    || !run.reasoningEffort
    || !run.promptVersion
    || run.contractVersion !== "v2"
    || !run.runnerReceipt
    || !RUNNER_RECEIPT_PATH.test(run.runnerReceipt.path)
    || !SHA256.test(run.runnerReceipt.sha256)
    || !/^[a-f0-9]{40}$/.test(run.runnerReceipt.runnerCommit)
    || !Number.isFinite(Date.parse(run.runnerReceipt.issuedAt))) {
    throw new Error("sanitized source run receipt is invalid");
  }
  if (source.selection.caseCount !== manifest.cases.length
    || source.selection.provenance !== "synthetic-only"
    || !Number.isInteger(source.selection.excludedResultCount)
    || source.selection.excludedResultCount < 0) {
    throw new Error("sanitized source selection receipt is invalid");
  }
  const expected = new Map(manifest.cases.map((entry) => [entry.id, entry.fixtureId]));
  const seen = new Set<string>();
  for (const result of source.results) {
    if (result.status !== "PASS"
      || expected.get(result.caseId) !== result.fixtureId
      || seen.has(result.caseId)
      || !result.report
      || typeof result.report !== "object"
      || Array.isArray(result.report)) {
      throw new Error("sanitized source contains an unknown, duplicate, non-PASS, or malformed result");
    }
    seen.add(result.caseId);
  }
  if (source.results.length !== manifest.cases.length
    || seen.size !== expected.size
    || [...expected.keys()].some((caseId) => !seen.has(caseId))) {
    throw new Error("sanitized source does not contain the exact manifest case set");
  }
}

export function assertFreshSourceForIteration(
  source: SanitizedHistoricalSource,
  iteration: GauntletIteration,
  now = Date.now(),
) {
  const iterationStartedAt = Date.parse(iteration.createdAt);
  const sourceGeneratedAt = Date.parse(source.sourceRun.generatedAt);
  if (!Number.isFinite(iterationStartedAt)
    || !Number.isFinite(sourceGeneratedAt)
    || !Number.isFinite(now)
    || sourceGeneratedAt < iterationStartedAt
    || sourceGeneratedAt > now
    || now - sourceGeneratedAt > MAX_SOURCE_AGE_MS) {
    throw new Error("sanitized source must be generated during the active iteration and within 48 hours of capture");
  }
}

export function assertCaptureLedgerReady(
  iteration: GauntletIteration,
  iterationId: string,
  candidateCommit: string,
) {
  if (iteration.schemaVersion !== "2" || iteration.id !== iterationId) {
    throw new Error("active iteration ledger identity is invalid");
  }
  if (iteration.status !== "collecting"
    || !iteration.candidate.ref
    || iteration.candidate.deploymentStatus !== "not_deployed"
    || iteration.candidate.commit !== candidateCommit) {
    throw new Error("active iteration must be collecting and bound to the explicit candidate commit");
  }
}

export async function runtimeClosureFor(repositoryRoot: string, commit: string): Promise<RuntimeClosureReceipt> {
  const files = await Promise.all(GAUNTLET_RUNTIME_CLOSURE_PATHS.map(async (repositoryPath) => ({
    path: repositoryPath,
    sha256: sha256(await readGitBlob(repositoryRoot, commit, repositoryPath)),
  })));
  return { files, sha256: canonicalJsonSha256(files) };
}

export async function assertCandidateHarnessMatchesWorktree(input: {
  repositoryRoot: string;
  candidateCommit: string;
}) {
  const closurePaths = new Set<string>(GAUNTLET_RUNTIME_CLOSURE_PATHS);
  const receipts = [];
  for (const repositoryPath of CAPTURE_HARNESS_PATHS) {
    if (!closurePaths.has(repositoryPath)) {
      throw new Error(`capture harness is not part of the candidate runtime closure: ${repositoryPath}`);
    }
    const currentPath = path.join(input.repositoryRoot, repositoryPath);
    const stats = await lstat(currentPath);
    if (!stats.isFile() || stats.isSymbolicLink()) {
      throw new Error(`capture harness path must be a regular file: ${repositoryPath}`);
    }
    const [candidateBytes, worktreeBytes] = await Promise.all([
      readGitBlob(input.repositoryRoot, input.candidateCommit, repositoryPath),
      readFile(currentPath),
    ]);
    if (!candidateBytes.equals(worktreeBytes)) {
      throw new Error(`current capture harness differs from candidate commit: ${repositoryPath}`);
    }
    receipts.push({ path: repositoryPath, sha256: sha256(candidateBytes) });
  }
  return { files: receipts, sha256: canonicalJsonSha256(receipts) };
}

async function validatorReceiptFor(repositoryRoot: string, commit: string): Promise<FinalizationValidatorReceipt> {
  const bytes = await readGitBlob(repositoryRoot, commit, GAUNTLET_VALIDATOR_PATH);
  const gitBlobOid = await gitText(repositoryRoot, ["rev-parse", `${commit}:${GAUNTLET_VALIDATOR_PATH}`]);
  if (!/^[a-f0-9]{40,64}$/.test(gitBlobOid)) throw new Error("candidate validator Git blob id is invalid");
  return {
    commit,
    path: GAUNTLET_VALIDATOR_PATH,
    sha256: sha256(bytes),
    gitBlobOid,
  };
}

async function bindingFor(
  repositoryRoot: string,
  commit: string,
  identity: Pick<CandidateBinding, "ref" | "deploymentStatus">,
  source: SanitizedHistoricalSource,
  includeRuntimeClosure: boolean,
): Promise<CandidateBinding> {
  const [prompt, renderer] = await Promise.all([
    readGitBlob(repositoryRoot, commit, PROMPT_PATH),
    readGitBlob(repositoryRoot, commit, RENDERER_PATH),
  ]);
  if (sha256(prompt.toString("utf8").trim()) !== source.sourceRun.canonicalPromptSha256) {
    throw new Error(`canonical prompt at ${commit} does not match the fresh source receipt`);
  }
  return {
    ...identity,
    commit,
    model: source.sourceRun.model,
    resumePrompt: { path: PROMPT_PATH, sha256: sha256(prompt) },
    renderer: { path: RENDERER_PATH, sha256: sha256(renderer) },
    runtimeClosure: includeRuntimeClosure ? await runtimeClosureFor(repositoryRoot, commit) : null,
  };
}

type CompleteProductionBinding = CandidateBinding & {
  commit: string;
  model: string;
  resumePrompt: ContentReceipt;
  renderer: ContentReceipt;
};

function assertCompleteProductionBinding(
  binding: CandidateBinding,
): asserts binding is CompleteProductionBinding {
  if (!binding.ref
    || binding.deploymentStatus !== "deployed_baseline"
    || typeof binding.commit !== "string"
    || typeof binding.model !== "string"
    || !binding.resumePrompt
    || !binding.renderer
    || binding.resumePrompt.path !== PROMPT_PATH
    || binding.renderer.path !== RENDERER_PATH
    || !SHA256.test(binding.resumePrompt.sha256)
    || !SHA256.test(binding.renderer.sha256)) {
    throw new Error("active iteration production binding is incomplete");
  }
}

async function verifiedProductionBindingFor(
  repositoryRoot: string,
  binding: CompleteProductionBinding,
): Promise<CandidateBinding> {
  const [prompt, renderer] = await Promise.all([
    readGitBlob(repositoryRoot, binding.commit, PROMPT_PATH),
    readGitBlob(repositoryRoot, binding.commit, RENDERER_PATH),
  ]);
  if (sha256(prompt) !== binding.resumePrompt.sha256
    || sha256(renderer) !== binding.renderer.sha256) {
    throw new Error("active iteration production binding does not match its Git commit");
  }
  return {
    ...binding,
    runtimeClosure: null,
  };
}

export async function createCapturePlan(input: {
  repositoryRoot: string;
  manifestPath: string;
  iterationId: string;
  candidateCommit: string;
  sourceCommit: string;
  sourcePath: string;
}): Promise<CapturePlan> {
  const repositoryRoot = await realpath(input.repositoryRoot);
  const discovered = await gitText(repositoryRoot, ["rev-parse", "--show-toplevel"]);
  if (await realpath(discovered) !== repositoryRoot) throw new Error("--repository-root must be the Git toplevel");
  if (!SAFE_COMPONENT.test(input.iterationId)) throw new Error("iteration id is unsafe");
  if (!SOURCE_PATH.test(input.sourcePath)) throw new Error("source path must be a web/gauntlet/sources JSON file");
  const iterationSourcePath = `web/gauntlet/sources/${input.iterationId}.json`;
  if (input.sourcePath !== iterationSourcePath) {
    throw new Error(`source path must be bound to the active iteration: ${iterationSourcePath}`);
  }

  const expectedManifest = path.join(repositoryRoot, "web/gauntlet/manifest.json");
  if (await realpath(input.manifestPath) !== await realpath(expectedManifest)) {
    throw new Error("capture must use the repository's canonical Gauntlet manifest");
  }
  const manifestBytes = await readFile(expectedManifest);
  const committedManifest = await readGitBlob(
    repositoryRoot,
    input.sourceCommit,
    "web/gauntlet/manifest.json",
  );
  if (!manifestBytes.equals(committedManifest)) {
    throw new Error("canonical manifest must match the source commit");
  }
  const manifest = JSON.parse(committedManifest.toString("utf8")) as GauntletManifest;
  assertApprovedCaptureManifest(manifest);
  if (manifest.activeIterationId !== input.iterationId) {
    throw new Error("capture iteration must be the manifest's active iteration");
  }
  const iterationRepositoryPath = `web/gauntlet/iterations/${input.iterationId}.json`;
  const iterationPath = path.join(repositoryRoot, iterationRepositoryPath);
  const iterationStats = await lstat(iterationPath);
  if (!iterationStats.isFile() || iterationStats.isSymbolicLink()) {
    throw new Error("active iteration ledger must be a regular file");
  }
  const [iterationBytes, committedIteration] = await Promise.all([
    readFile(iterationPath),
    readGitBlob(repositoryRoot, input.sourceCommit, iterationRepositoryPath),
  ]);
  if (!iterationBytes.equals(committedIteration)) {
    throw new Error("active iteration ledger must match the source commit");
  }
  const iteration = JSON.parse(committedIteration.toString("utf8")) as GauntletIteration;
  assertCaptureLedgerReady(iteration, input.iterationId, input.candidateCommit);
  assertCompleteProductionBinding(iteration.production);
  const productionCommit = iteration.production.commit;
  await Promise.all([
    resolveCommit(repositoryRoot, productionCommit),
    resolveCommit(repositoryRoot, input.candidateCommit),
    resolveCommit(repositoryRoot, input.sourceCommit),
  ]);
  if (input.candidateCommit === productionCommit) throw new Error("candidate commit must differ from production");
  await assertAncestor(repositoryRoot, productionCommit, input.candidateCommit, "candidate commit must descend from production");
  await assertAncestor(repositoryRoot, input.candidateCommit, input.sourceCommit, "source commit must include the candidate commit");

  const sourceBytes = await readGitBlob(repositoryRoot, input.sourceCommit, input.sourcePath);
  const source = JSON.parse(sourceBytes.toString("utf8")) as SanitizedHistoricalSource;
  validateSanitizedSource(source, manifest);
  assertFreshSourceForIteration(source, iteration);
  const expectedRunnerReceiptPath = `web/gauntlet/runner-receipts/${input.iterationId}.json`;
  if (source.sourceRun.runnerReceipt.path !== expectedRunnerReceiptPath
    || source.sourceRun.runnerReceipt.runnerCommit !== input.candidateCommit) {
    throw new Error("runner attestation is not bound to the active iteration and candidate commit");
  }
  const runnerReceiptBytes = await readGitBlob(
    repositoryRoot,
    input.sourceCommit,
    expectedRunnerReceiptPath,
  );
  if (sha256(runnerReceiptBytes) !== source.sourceRun.runnerReceipt.sha256) {
    throw new Error("runner attestation receipt does not match the source commit");
  }
  const runnerAttestation = parseCommittedRunnerAttestation(
    runnerReceiptBytes,
    source.sourceRun.fullRunSha256,
    manifest.target.caseCount,
  ).receipt;
  if (runnerAttestation.runId !== source.sourceRun.runId
    || runnerAttestation.generatedAt !== source.sourceRun.generatedAt
    || runnerAttestation.model !== source.sourceRun.model
    || runnerAttestation.canonicalPromptSha256 !== source.sourceRun.canonicalPromptSha256
    || runnerAttestation.runnerCommit !== input.candidateCommit
    || runnerAttestation.issuedAt !== source.sourceRun.runnerReceipt.issuedAt) {
    throw new Error("runner attestation metadata does not match the sanitized source");
  }

  const [productionBinding, candidateBinding, candidateValidator, dependencyClosure] = await Promise.all([
    verifiedProductionBindingFor(repositoryRoot, iteration.production),
    bindingFor(
      repositoryRoot,
      input.candidateCommit,
      {
        ref: iteration.candidate.ref,
        deploymentStatus: iteration.candidate.deploymentStatus,
      },
      source,
      true,
    ),
    validatorReceiptFor(repositoryRoot, input.candidateCommit),
    dependencyClosureFor({
      repositoryRoot,
      productionCommit,
      candidateCommit: input.candidateCommit,
      nodeModulesPath: path.join(repositoryRoot, "web/node_modules"),
    }),
    assertCandidateHarnessMatchesWorktree({
      repositoryRoot,
      candidateCommit: input.candidateCommit,
    }),
  ]);
  const production: CandidateBinding = { ...productionBinding, dependencyClosure };
  const candidate: CandidateBinding = { ...candidateBinding, dependencyClosure };
  const fixtureBytes = await loadApprovedFixtureBytes(
    manifest,
    (repositoryPath) => readGitBlob(repositoryRoot, input.sourceCommit, repositoryPath),
  );
  return {
    repositoryRoot,
    manifest,
    iterationId: input.iterationId,
    productionCommit,
    candidateCommit: input.candidateCommit,
    sourceCommit: input.sourceCommit,
    sourcePath: input.sourcePath,
    source,
    sourceBytes,
    production,
    candidate,
    candidateValidator,
    dependencyClosure,
    fixtureBytes,
  };
}

export async function assertCaptureOutputTarget(repositoryRoot: string, iterationId: string, outputPath: string) {
  const repositoryReal = await realpath(repositoryRoot);
  const artifactsPath = path.join(repositoryReal, "web/gauntlet/artifacts");
  const artifactStats = await lstat(artifactsPath);
  if (artifactStats.isSymbolicLink() || !artifactStats.isDirectory()) {
    throw new Error("web/gauntlet/artifacts must be a regular directory");
  }
  const artifactsReal = await realpath(artifactsPath);
  const relativeArtifacts = path.relative(repositoryReal, artifactsReal);
  if (relativeArtifacts.startsWith("..") || path.isAbsolute(relativeArtifacts)) {
    throw new Error("web/gauntlet/artifacts escapes the repository");
  }
  const expected = path.join(artifactsReal, iterationId);
  if (path.resolve(outputPath) !== expected) {
    throw new Error(`output must be web/gauntlet/artifacts/${iterationId}`);
  }
  if (existsSync(expected)) throw new Error("capture output already exists; refusing to overwrite evidence");
  return expected;
}

export function safeCapturePlanSummary(plan: CapturePlan) {
  return {
    iterationId: plan.iterationId,
    productionCommit: plan.productionCommit,
    candidateCommit: plan.candidateCommit,
    sourceCommit: plan.sourceCommit,
    sourcePath: plan.sourcePath,
    sourceSha256: sha256(plan.sourceBytes),
    productionFinalization: "unfinalized_raw",
    candidateFinalization: "validateResumeModelPayload(forceGrounding=true)",
    candidateRuntimeClosure: plan.candidate.runtimeClosure,
    dependencyClosure: plan.dependencyClosure,
    candidateValidator: plan.candidateValidator,
    cases: plan.manifest.cases.map((entry) => entry.id),
    journeys: plan.manifest.requiredJourneys.map((entry) => entry.id),
    reportSetSha256: canonicalJsonSha256(plan.source.results.map((result) => ({
      caseId: result.caseId,
      reportSha256: canonicalJsonSha256(result.report),
    }))),
    write: false,
  };
}

export function sanitizedSourceBytes(source: SanitizedHistoricalSource) {
  return Buffer.from(serialize(source));
}
