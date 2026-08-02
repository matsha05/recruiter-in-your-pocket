import { spawn, type ChildProcess } from "node:child_process";
import { createServer } from "node:net";
import {
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import type { DependencyClosureReceipt } from "../../lib/gauntlet/types";
import { NETWORK_GUARD_PATH, sha256 } from "./contracts";
import { assertDependencyClosure } from "./repository-dependencies";
import { execFileBuffer, readGitBlob } from "./repository-git";
import type { CapturePlan } from "./repository-plan";

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
