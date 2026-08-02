import { execFile, spawn, type ChildProcess } from "node:child_process";
import { createServer } from "node:net";
import { existsSync } from "node:fs";
import { cp, lstat, mkdir, mkdtemp, readFile, realpath, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  GAUNTLET_RUNTIME_CLOSURE_PATHS,
  GAUNTLET_VALIDATOR_PATH,
  type CandidateBinding,
  type DependencyClosureReceipt,
  type FinalizationValidatorReceipt,
  type GauntletManifest,
  type RuntimeClosureReceipt,
} from "../../lib/gauntlet/types";
import { observedInstalledTreeReceipt } from "../../lib/gauntlet/dependency-closure";
import {
  AGREED_RUN_RECEIPT,
  APPROVED_CASE_FIXTURES,
  CAPTURE_HARNESS_PATHS,
  HIDDEN_PACKAGE_LOCK_PATH,
  NETWORK_GUARD_PATH,
  PACKAGE_LOCK_PATH,
  assertApprovedCaptureManifest,
  PROMPT_PATH,
  PRODUCTION_COMMIT,
  RENDERER_PATH,
  canonicalJsonSha256,
  serialize,
  sha256,
  type SanitizedHistoricalSource,
} from "./contracts";

const FULL_GIT_SHA = /^[a-f0-9]{40}$/;
const SOURCE_PATH = /^web\/gauntlet\/sources\/[a-z0-9][a-z0-9-]*\.json$/;
const SAFE_COMPONENT = /^[a-z0-9][a-z0-9-]{0,63}$/;

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

function execFileBuffer(command: string, args: string[], cwd: string, maxBuffer = 32 * 1024 * 1024) {
  return new Promise<Buffer>((resolve, reject) => {
    execFile(command, args, { cwd, encoding: "buffer", maxBuffer }, (error, stdout, stderr) => {
      if (error) {
        const detail = Buffer.isBuffer(stderr) ? stderr.toString("utf8").trim() : String(stderr).trim();
        reject(new Error(detail || `${command} exited with an error`));
        return;
      }
      resolve(Buffer.isBuffer(stdout) ? stdout : Buffer.from(stdout));
    });
  });
}

export async function gitText(repositoryRoot: string, args: string[]) {
  return (await execFileBuffer("git", ["-C", repositoryRoot, ...args], repositoryRoot)).toString("utf8").trim();
}

export async function resolveCommit(repositoryRoot: string, commit: string) {
  if (!FULL_GIT_SHA.test(commit)) throw new Error("commit must be a full lowercase 40-character SHA");
  const resolved = await gitText(repositoryRoot, ["rev-parse", "--verify", `${commit}^{commit}`]);
  if (resolved !== commit) throw new Error(`commit does not resolve exactly: ${commit}`);
  return commit;
}

export async function readGitBlob(repositoryRoot: string, commit: string, repositoryPath: string) {
  if (!/^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(repositoryPath)
    || repositoryPath.includes("..")
    || repositoryPath.startsWith("/")) {
    throw new Error(`unsafe repository path: ${repositoryPath}`);
  }
  await resolveCommit(repositoryRoot, commit);
  const tree = await execFileBuffer(
    "git",
    ["-C", repositoryRoot, "ls-tree", "-z", commit, "--", repositoryPath],
    repositoryRoot,
  );
  const records = tree.toString("utf8").split("\0").filter(Boolean);
  const match = records.length === 1
    ? /^(100644|100755) blob [a-f0-9]{40,64}\t(.+)$/.exec(records[0])
    : null;
  if (!match || match[2] !== repositoryPath) {
    throw new Error(`Git path must be one regular 100644/100755 blob: ${repositoryPath}`);
  }
  return execFileBuffer("git", ["-C", repositoryRoot, "show", `${commit}:${repositoryPath}`], repositoryRoot);
}

/**
 * Inspectable verifier for the exact lock bytes and the filesystem npm will
 * actually execute. The installed-tree receipt cannot be forged from the
 * hidden lock alone.
 */
export async function verifyOfflineDependencyClosure(input: {
  productionCommit: string;
  candidateCommit: string;
  productionLockBytes: Buffer;
  candidateLockBytes: Buffer;
  worktreeLockBytes: Buffer;
  hiddenLockBytes: Buffer;
  nodeModulesPath: string;
}): Promise<DependencyClosureReceipt> {
  if (!FULL_GIT_SHA.test(input.productionCommit) || !FULL_GIT_SHA.test(input.candidateCommit)) {
    throw new Error("dependency closure commits must be full lowercase Git SHAs");
  }
  if (!input.productionLockBytes.equals(input.candidateLockBytes)
    || !input.candidateLockBytes.equals(input.worktreeLockBytes)) {
    throw new Error("production, candidate, and worktree package-lock.json bytes must be identical");
  }
  const packageLockSha256 = sha256(input.candidateLockBytes);
  const installedTree = await observedInstalledTreeReceipt({
    nodeModulesPath: input.nodeModulesPath,
    candidateLockBytes: input.candidateLockBytes,
    hiddenLockBytes: input.hiddenLockBytes,
  });
  return {
    packageLock: {
      path: PACKAGE_LOCK_PATH,
      sha256: packageLockSha256,
      productionCommit: input.productionCommit,
      productionSha256: sha256(input.productionLockBytes),
      candidateCommit: input.candidateCommit,
      candidateSha256: packageLockSha256,
      worktreeSha256: sha256(input.worktreeLockBytes),
    },
    hiddenLock: {
      path: HIDDEN_PACKAGE_LOCK_PATH,
      sha256: sha256(input.hiddenLockBytes),
    },
    installedTree: {
      platform: process.platform,
      arch: process.arch,
      packageCount: installedTree.packageCount,
      sha256: installedTree.sha256,
    },
  };
}

export async function dependencyClosureFor(input: {
  repositoryRoot: string;
  productionCommit: string;
  candidateCommit: string;
  nodeModulesPath: string;
}): Promise<DependencyClosureReceipt> {
  const suppliedNodeModulesStats = await lstat(input.nodeModulesPath);
  if (!suppliedNodeModulesStats.isDirectory() || suppliedNodeModulesStats.isSymbolicLink()) {
    throw new Error("existing node_modules must be a regular directory");
  }
  const nodeModules = await realpath(input.nodeModulesPath);
  const nodeModulesStats = await lstat(nodeModules);
  if (!nodeModulesStats.isDirectory() || nodeModulesStats.isSymbolicLink()) {
    throw new Error("existing node_modules must be a regular directory");
  }
  const worktreeLockPath = path.join(input.repositoryRoot, PACKAGE_LOCK_PATH);
  const worktreeLockStats = await lstat(worktreeLockPath);
  if (!worktreeLockStats.isFile() || worktreeLockStats.isSymbolicLink()) {
    throw new Error("worktree package-lock.json must be a regular file");
  }
  const hiddenLockPath = path.join(nodeModules, ".package-lock.json");
  const hiddenStats = await lstat(hiddenLockPath);
  if (!hiddenStats.isFile() || hiddenStats.isSymbolicLink()) {
    throw new Error("node_modules/.package-lock.json must be a regular file");
  }
  const [productionLockBytes, candidateLockBytes, worktreeLockBytes, hiddenLockBytes] = await Promise.all([
    readGitBlob(input.repositoryRoot, input.productionCommit, PACKAGE_LOCK_PATH),
    readGitBlob(input.repositoryRoot, input.candidateCommit, PACKAGE_LOCK_PATH),
    readFile(worktreeLockPath),
    readFile(hiddenLockPath),
  ]);
  return verifyOfflineDependencyClosure({
    productionCommit: input.productionCommit,
    candidateCommit: input.candidateCommit,
    productionLockBytes,
    candidateLockBytes,
    worktreeLockBytes,
    hiddenLockBytes,
    nodeModulesPath: nodeModules,
  });
}

export async function assertDependencyClosure(input: {
  repositoryRoot: string;
  nodeModulesPath: string;
  expected: DependencyClosureReceipt;
}) {
  const actual = await dependencyClosureFor({
    repositoryRoot: input.repositoryRoot,
    productionCommit: input.expected.packageLock.productionCommit,
    candidateCommit: input.expected.packageLock.candidateCommit,
    nodeModulesPath: input.nodeModulesPath,
  });
  if (canonicalJsonSha256(actual) !== canonicalJsonSha256(input.expected)) {
    throw new Error("offline dependency closure changed after capture planning");
  }
  return actual;
}

/** Test/CI overlay copy that keeps npm's relative .bin links inside the copy. */
export async function copyNodeModulesTree(source: string, target: string) {
  await cp(source, target, {
    recursive: true,
    dereference: false,
    preserveTimestamps: true,
    verbatimSymlinks: true,
  });
}

async function assertAncestor(repositoryRoot: string, ancestor: string, descendant: string, label: string) {
  try {
    await execFileBuffer("git", ["-C", repositoryRoot, "merge-base", "--is-ancestor", ancestor, descendant], repositoryRoot);
  } catch {
    throw new Error(label);
  }
}

function validateSanitizedSource(source: SanitizedHistoricalSource, manifest: GauntletManifest) {
  const receipt = AGREED_RUN_RECEIPT;
  if (source.schemaVersion !== "1" || source.kind !== "historical-live-eval-synthetic-subset") {
    throw new Error("sanitized source envelope is invalid");
  }
  const expectedRun = {
    fullRunSha256: receipt.fullRunSha256,
    runId: receipt.runId,
    generatedAt: receipt.generatedAt,
    executionMode: receipt.executionMode,
    model: receipt.model,
    reasoningEffort: receipt.reasoningEffort,
    promptVersion: receipt.promptVersion,
    canonicalPromptSha256: receipt.canonicalPromptSha256,
    contractVersion: receipt.contractVersion,
  };
  if (canonicalJsonSha256(source.sourceRun) !== canonicalJsonSha256(expectedRun)) {
    throw new Error("sanitized source run receipt does not match the agreed historical run");
  }
  if (source.selection.caseCount !== receipt.selectedResults
    || source.selection.provenance !== "synthetic-only"
    || source.selection.excludedResultCount !== receipt.totalResults - receipt.selectedResults) {
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
  if (source.results.length !== receipt.selectedResults
    || seen.size !== expected.size
    || [...expected.keys()].some((caseId) => !seen.has(caseId))) {
    throw new Error("sanitized source does not contain the exact manifest case set");
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
  includeRuntimeClosure: boolean,
): Promise<CandidateBinding> {
  const [prompt, renderer] = await Promise.all([
    readGitBlob(repositoryRoot, commit, PROMPT_PATH),
    readGitBlob(repositoryRoot, commit, RENDERER_PATH),
  ]);
  if (sha256(prompt.toString("utf8").trim()) !== AGREED_RUN_RECEIPT.canonicalPromptSha256) {
    throw new Error(`canonical prompt at ${commit} does not match the historical generation receipt`);
  }
  return {
    commit,
    model: AGREED_RUN_RECEIPT.model,
    resumePrompt: { path: PROMPT_PATH, sha256: sha256(prompt) },
    renderer: { path: RENDERER_PATH, sha256: sha256(renderer) },
    runtimeClosure: includeRuntimeClosure ? await runtimeClosureFor(repositoryRoot, commit) : null,
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
  await Promise.all([
    resolveCommit(repositoryRoot, PRODUCTION_COMMIT),
    resolveCommit(repositoryRoot, input.candidateCommit),
    resolveCommit(repositoryRoot, input.sourceCommit),
  ]);
  if (input.candidateCommit === PRODUCTION_COMMIT) throw new Error("candidate commit must differ from production");
  await assertAncestor(repositoryRoot, PRODUCTION_COMMIT, input.candidateCommit, "candidate commit must descend from production");
  await assertAncestor(repositoryRoot, input.candidateCommit, input.sourceCommit, "source commit must include the candidate commit");

  const expectedManifest = path.join(repositoryRoot, "web/gauntlet/manifest.json");
  if (await realpath(input.manifestPath) !== await realpath(expectedManifest)) {
    throw new Error("capture must use the repository's canonical Gauntlet manifest");
  }
  const manifest = JSON.parse(await readFile(expectedManifest, "utf8")) as GauntletManifest;
  assertApprovedCaptureManifest(manifest);
  const sourceBytes = await readGitBlob(repositoryRoot, input.sourceCommit, input.sourcePath);
  const source = JSON.parse(sourceBytes.toString("utf8")) as SanitizedHistoricalSource;
  validateSanitizedSource(source, manifest);

  const [productionBinding, candidateBinding, candidateValidator, dependencyClosure] = await Promise.all([
    bindingFor(repositoryRoot, PRODUCTION_COMMIT, false),
    bindingFor(repositoryRoot, input.candidateCommit, true),
    validatorReceiptFor(repositoryRoot, input.candidateCommit),
    dependencyClosureFor({
      repositoryRoot,
      productionCommit: PRODUCTION_COMMIT,
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
    productionCommit: PRODUCTION_COMMIT,
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

export async function allocateLoopbackPort() {
  return new Promise<number>((resolve, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        server.close();
        reject(new Error("could not allocate a loopback port"));
        return;
      }
      server.close((error) => error ? reject(error) : resolve(address.port));
    });
  });
}

export type VerifiedNetworkGuard = {
  path: string;
  receipt: { path: string; sha256: string };
};

/** Materialize the candidate-commit guard once; both archived variants use this exact copy. */
export async function materializeCandidateNetworkGuard(input: {
  plan: CapturePlan;
  directory: string;
}): Promise<VerifiedNetworkGuard> {
  const runtimeReceipt = input.plan.candidate.runtimeClosure?.files.find(
    (entry) => entry.path === NETWORK_GUARD_PATH,
  );
  if (!runtimeReceipt) throw new Error("candidate runtime closure omits the network guard");
  const directoryStats = await lstat(input.directory);
  if (!directoryStats.isDirectory() || directoryStats.isSymbolicLink()) {
    throw new Error("network guard destination must be a regular directory");
  }
  const directoryReal = await realpath(input.directory);
  const bytes = await readGitBlob(
    input.plan.repositoryRoot,
    input.plan.candidateCommit,
    NETWORK_GUARD_PATH,
  );
  if (sha256(bytes) !== runtimeReceipt.sha256) {
    throw new Error("candidate network guard does not match the runtime closure receipt");
  }
  const outputPath = path.join(directoryReal, `network-guard-${runtimeReceipt.sha256}.cjs`);
  let created = false;
  try {
    await writeFile(outputPath, bytes, { flag: "wx", mode: 0o400 });
    created = true;
    const outputStats = await lstat(outputPath);
    if (!outputStats.isFile() || outputStats.isSymbolicLink()) {
      throw new Error("verified network guard copy is not a regular file");
    }
    const copiedBytes = await readFile(outputPath);
    if (!copiedBytes.equals(bytes) || sha256(copiedBytes) !== runtimeReceipt.sha256) {
      throw new Error("verified network guard copy changed while materializing");
    }
    return { path: outputPath, receipt: runtimeReceipt };
  } catch (error) {
    if (created) await rm(outputPath, { force: true });
    throw error;
  }
}

export async function archiveCommit(input: {
  repositoryRoot: string;
  commit: string;
  nodeModulesPath: string;
  parentDirectory: string;
  label: string;
  dependencyClosure: DependencyClosureReceipt;
}) {
  await assertDependencyClosure({
    repositoryRoot: input.repositoryRoot,
    nodeModulesPath: input.nodeModulesPath,
    expected: input.dependencyClosure,
  });
  const treeRoot = await mkdtemp(path.join(input.parentDirectory, `${input.label}-`));
  const archivePath = path.join(input.parentDirectory, `${input.label}-${input.commit}.tar`);
  await execFileBuffer("git", ["-C", input.repositoryRoot, "archive", "--format=tar", `--output=${archivePath}`, input.commit], input.repositoryRoot);
  try {
    await execFileBuffer("tar", ["-xf", archivePath, "-C", treeRoot], input.repositoryRoot);
  } finally {
    await rm(archivePath, { force: true });
  }
  const suppliedStats = await lstat(input.nodeModulesPath);
  if (!suppliedStats.isDirectory() || suppliedStats.isSymbolicLink()) {
    throw new Error("existing node_modules is not a regular directory");
  }
  const nodeModules = await realpath(input.nodeModulesPath);
  await symlink(nodeModules, path.join(treeRoot, "web/node_modules"), "dir");
  return treeRoot;
}

function boundedOutput(chunks: Buffer[]) {
  const text = Buffer.concat(chunks).toString("utf8").replace(/\u001b\[[0-9;]*m/g, "");
  return text.slice(-12_000);
}

export function runProcess(input: {
  command: string;
  args: string[];
  cwd: string;
  env: NodeJS.ProcessEnv;
  label: string;
  timeoutMs: number;
}) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(input.command, input.args, { cwd: input.cwd, env: input.env, stdio: ["ignore", "pipe", "pipe"] });
    const output: Buffer[] = [];
    child.stdout.on("data", (chunk: Buffer) => output.push(chunk));
    child.stderr.on("data", (chunk: Buffer) => output.push(chunk));
    const timeout = setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error(`${input.label} timed out`));
    }, input.timeoutMs);
    child.once("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    child.once("close", (code) => {
      clearTimeout(timeout);
      if (code === 0) resolve();
      else reject(new Error(`${input.label} failed (${code})\n${boundedOutput(output)}`));
    });
  });
}

export function startProcess(input: {
  command: string;
  args: string[];
  cwd: string;
  env: NodeJS.ProcessEnv;
}): { child: ChildProcess; output: Buffer[] } {
  const child = spawn(input.command, input.args, { cwd: input.cwd, env: input.env, stdio: ["ignore", "pipe", "pipe"] });
  const output: Buffer[] = [];
  child.stdout?.on("data", (chunk: Buffer) => output.push(chunk));
  child.stderr?.on("data", (chunk: Buffer) => output.push(chunk));
  return { child, output };
}

export async function stopProcess(child: ChildProcess) {
  if (child.exitCode !== null || child.killed) return;
  child.kill("SIGTERM");
  await new Promise<void>((resolve) => {
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      resolve();
    }, 5_000);
    child.once("close", () => {
      clearTimeout(timer);
      resolve();
    });
  });
}

export function hermeticEnvironment(input: {
  port: number;
  networkGuardPath: string;
  temporaryDirectory: string;
}) {
  const appUrl = `http://127.0.0.1:${input.port}`;
  return {
    PATH: process.env.PATH,
    TMPDIR: input.temporaryDirectory,
    CI: "1",
    NODE_ENV: "production",
    NODE_OPTIONS: `--require=${input.networkGuardPath}`,
    RIYP_GAUNTLET_NETWORK_GUARD: "1",
    NEXT_TELEMETRY_DISABLED: "1",
    NEXT_PUBLIC_APP_URL: appUrl,
    NEXT_PUBLIC_SUPABASE_URL: `${appUrl}/__gauntlet-supabase`,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "gauntlet-public-anon-key",
    NEXT_PUBLIC_ENABLE_ANALYTICS: "false",
    NEXT_PUBLIC_ENABLE_BILLING_UNLOCK: "true",
    NEXT_PUBLIC_ENABLE_EXTENSION_SYNC: "false",
    NEXT_PUBLIC_ENABLE_GUEST_REPORT_SAVE: "false",
    NEXT_PUBLIC_ENABLE_PUBLIC_SHARE_LINKS: "false",
    NEXT_PUBLIC_ENABLE_ERROR_REPLAY: "false",
    USE_MOCK_OPENAI: "1",
    SKIP_DB_READY_CHECK: "1",
    RIYP_ALLOW_TEST_RATE_LIMIT_FALLBACK: "true",
    RIYP_ALLOW_TEST_ANONYMOUS_ACCESS_FALLBACK: "true",
    SESSION_SECRET: "gauntlet-capture-local-only-session",
    UPSTASH_REDIS_REST_URL: "",
    UPSTASH_REDIS_REST_TOKEN: "",
    KV_REST_API_URL: "",
    KV_REST_API_TOKEN: "",
    SENTRY_AUTH_TOKEN: "",
  } satisfies NodeJS.ProcessEnv;
}

export async function createStagingDirectory(outputPath: string) {
  await mkdir(path.dirname(outputPath), { recursive: true });
  return mkdtemp(path.join(path.dirname(outputPath), `.${path.basename(outputPath)}-capture-`));
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
