import { createHash } from "node:crypto";
import { execFile, spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { lstat, readFile, readdir, realpath } from "node:fs/promises";
import path from "node:path";

const SAFE_COMPONENT = /^[a-z0-9][a-z0-9-]{0,63}$/;
const RESERVED_COMPONENTS = new Set(["constructor", "prototype", "__proto__"]);
const FULL_GIT_SHA = /^[a-f0-9]{40}$/;
const SAFE_REPOSITORY_SEGMENT = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

export function sha256(value: string | Buffer) {
  return createHash("sha256").update(value).digest("hex");
}

function sortJson(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortJson);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nested]) => [key, sortJson(nested)]));
  }
  return value;
}

export function stableJson(value: unknown) {
  return JSON.stringify(sortJson(value));
}

export function canonicalJsonSha256(value: unknown) {
  return sha256(stableJson(value));
}

export function isSafeComponent(value: unknown): value is string {
  return typeof value === "string" && SAFE_COMPONENT.test(value) && !RESERVED_COMPONENTS.has(value);
}

export function assertSafeComponent(value: unknown, label: string): asserts value is string {
  if (!isSafeComponent(value)) {
    throw new Error(`${label} must contain only lowercase letters, numbers, and internal hyphens`);
  }
}

export function isFullGitSha(value: unknown): value is string {
  return typeof value === "string" && FULL_GIT_SHA.test(value);
}

export function isSafeRepositoryPath(value: unknown): value is string {
  if (typeof value !== "string" || value.length === 0 || value.startsWith("/") || value.includes("\\")) {
    return false;
  }
  const segments = value.split("/");
  return segments.every((segment) => segment !== "."
    && segment !== ".."
    && SAFE_REPOSITORY_SEGMENT.test(segment));
}

export function isPathInside(root: string, candidate: string) {
  const relative = path.relative(root, candidate);
  return relative !== ""
    && !relative.startsWith(`..${path.sep}`)
    && relative !== ".."
    && !path.isAbsolute(relative);
}

export async function resolveContainedExistingPath(root: string, relativePath: string) {
  if (!isSafeRepositoryPath(relativePath)) {
    throw new Error(`unsafe relative path: ${relativePath}`);
  }
  const [rootReal, candidateReal] = await Promise.all([
    realpath(root),
    realpath(path.resolve(root, relativePath)),
  ]);
  if (!isPathInside(rootReal, candidateReal)) {
    throw new Error(`path escapes its approved root: ${relativePath}`);
  }
  return candidateReal;
}

function execGitBuffer(repositoryRoot: string, args: string[]) {
  return new Promise<Buffer>((resolve, reject) => {
    execFile("git", ["--no-replace-objects", "-C", repositoryRoot, ...args], {
      encoding: "buffer",
      maxBuffer: 16 * 1024 * 1024,
    }, (error, stdout, stderr) => {
      if (error) {
        const detail = Buffer.isBuffer(stderr) ? stderr.toString("utf8").trim() : String(stderr).trim();
        reject(new Error(detail || error.message));
        return;
      }
      resolve(Buffer.isBuffer(stdout) ? stdout : Buffer.from(stdout));
    });
  });
}

function execGitBufferWithInput(repositoryRoot: string, args: string[], input: Buffer) {
  return new Promise<Buffer>((resolve, reject) => {
    const child = spawn(
      "git",
      ["--no-replace-objects", "-C", repositoryRoot, ...args],
      { stdio: ["pipe", "pipe", "pipe"] },
    );
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];
    child.stdout.on("data", (chunk: Buffer) => stdout.push(chunk));
    child.stderr.on("data", (chunk: Buffer) => stderr.push(chunk));
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(Buffer.concat(stderr).toString("utf8").trim() || `git exited ${code}`));
        return;
      }
      resolve(Buffer.concat(stdout));
    });
    child.stdin.end(input);
  });
}

export async function findRepositoryRoot(startPath: string) {
  const stdout = await execGitBuffer(startPath, ["rev-parse", "--show-toplevel"]);
  return stdout.toString("utf8").trim();
}

export async function resolveRealCommit(repositoryRoot: string, commit: string) {
  if (!isFullGitSha(commit)) throw new Error("commit must be a full 40-character Git SHA");
  const stdout = await execGitBuffer(repositoryRoot, ["rev-parse", "--verify", `${commit}^{commit}`]);
  const resolved = stdout.toString("utf8").trim();
  if (resolved !== commit) throw new Error(`commit does not resolve exactly: ${commit}`);
  return resolved;
}

export async function readGitBlob(repositoryRoot: string, commit: string, repositoryPath: string) {
  await resolveRealCommit(repositoryRoot, commit);
  if (!isSafeRepositoryPath(repositoryPath)) throw new Error(`unsafe repository path: ${repositoryPath}`);
  return execGitBuffer(repositoryRoot, ["show", `${commit}:${repositoryPath}`]);
}

export type GitTreeEntry = {
  mode: string;
  type: string;
  objectId: string;
  path: string;
};

export async function listGitTree(repositoryRoot: string, commit: string, repositoryPath: string) {
  await resolveRealCommit(repositoryRoot, commit);
  if (!isSafeRepositoryPath(repositoryPath)) throw new Error(`unsafe repository path: ${repositoryPath}`);
  const stdout = await execGitBuffer(repositoryRoot, ["ls-tree", "-r", "-z", commit, "--", repositoryPath]);
  return stdout.toString("utf8").split("\0").filter(Boolean).map((record): GitTreeEntry => {
    const separator = record.indexOf("\t");
    if (separator < 0) throw new Error(`malformed Git tree entry for ${repositoryPath}`);
    const [mode, type, objectId] = record.slice(0, separator).split(" ");
    const entryPath = record.slice(separator + 1);
    if (!mode || !type || !/^[a-f0-9]{40,64}$/.test(objectId) || !isSafeRepositoryPath(entryPath)) {
      throw new Error(`unsafe or malformed Git tree entry: ${entryPath}`);
    }
    return { mode, type, objectId, path: entryPath };
  });
}

export async function readGitObjects(repositoryRoot: string, objectIds: string[]) {
  const unique = [...new Set(objectIds)];
  if (unique.some((objectId) => !/^[a-f0-9]{40,64}$/.test(objectId))) {
    throw new Error("Git object IDs must be full hexadecimal hashes");
  }
  if (unique.length === 0) return new Map<string, Buffer>();
  const stdout = await execGitBufferWithInput(
    repositoryRoot,
    ["cat-file", "--batch"],
    Buffer.from(`${unique.join("\n")}\n`),
  );
  const output = new Map<string, Buffer>();
  let offset = 0;
  for (const requested of unique) {
    const newline = stdout.indexOf(10, offset);
    if (newline < 0) throw new Error(`missing Git object header for ${requested}`);
    const header = stdout.subarray(offset, newline).toString("utf8");
    const [objectId, type, sizeText] = header.split(" ");
    const size = Number(sizeText);
    if (objectId !== requested || type !== "blob" || !Number.isSafeInteger(size) || size < 0) {
      throw new Error(`Git object ${requested} is missing or is not a blob`);
    }
    const start = newline + 1;
    const end = start + size;
    if (end >= stdout.length || stdout[end] !== 10) throw new Error(`truncated Git object ${requested}`);
    output.set(objectId, stdout.subarray(start, end));
    offset = end + 1;
  }
  return output;
}

export async function gitFileIntroductionCommits(
  repositoryRoot: string,
  repositoryPath: string,
) {
  if (!isSafeRepositoryPath(repositoryPath)) throw new Error(`unsafe repository path: ${repositoryPath}`);
  const stdout = await execGitBuffer(repositoryRoot, [
    "log",
    "--format=%H",
    "--diff-filter=A",
    "--",
    repositoryPath,
  ]);
  return stdout.toString("utf8").trim().split(/\s+/).filter(Boolean);
}

export async function gitCommitParents(repositoryRoot: string, commit: string) {
  await resolveRealCommit(repositoryRoot, commit);
  const stdout = await execGitBuffer(repositoryRoot, ["rev-list", "--parents", "-n", "1", commit]);
  const commits = stdout.toString("utf8").trim().split(/\s+/).filter(Boolean);
  if (commits[0] !== commit) throw new Error(`could not inspect Git parents for ${commit}`);
  return commits.slice(1);
}

export async function gitDiffPaths(
  repositoryRoot: string,
  parentCommit: string,
  commit: string,
  diffFilter?: "A",
) {
  await Promise.all([
    resolveRealCommit(repositoryRoot, parentCommit),
    resolveRealCommit(repositoryRoot, commit),
  ]);
  const args = [
    "diff-tree",
    "--no-commit-id",
    "--name-only",
    "-r",
    "-z",
    "--no-renames",
    "--ignore-submodules=none",
    "--no-ext-diff",
    "--no-textconv",
  ];
  if (diffFilter) args.push(`--diff-filter=${diffFilter}`);
  args.push(parentCommit, commit, "--");
  const stdout = await execGitBuffer(repositoryRoot, args);
  const changedPaths = stdout.toString("utf8").split("\0").filter(Boolean);
  if (changedPaths.some((changedPath) => !isSafeRepositoryPath(changedPath))) {
    throw new Error("Git commit contains an unsafe changed path");
  }
  return changedPaths;
}

export async function isAncestorCommit(repositoryRoot: string, ancestor: string, descendant: string) {
  await Promise.all([
    resolveRealCommit(repositoryRoot, ancestor),
    resolveRealCommit(repositoryRoot, descendant),
  ]);
  try {
    await execGitBuffer(repositoryRoot, ["merge-base", "--is-ancestor", ancestor, descendant]);
    return true;
  } catch {
    return false;
  }
}

export async function gitHead(repositoryRoot: string) {
  const stdout = await execGitBuffer(repositoryRoot, ["rev-parse", "HEAD"]);
  return stdout.toString("utf8").trim();
}

export async function dirtyRepositoryPaths(repositoryRoot: string, repositoryPaths: string[]) {
  for (const repositoryPath of repositoryPaths) {
    if (!isSafeRepositoryPath(repositoryPath)) throw new Error(`unsafe repository path: ${repositoryPath}`);
  }
  const stdout = await execGitBuffer(repositoryRoot, [
    "status",
    "--porcelain=v1",
    "--untracked-files=all",
    "--",
    ...repositoryPaths,
  ]);
  return stdout.toString("utf8").trim();
}

async function collectArtifactFiles(root: string, directory: string, output: Array<{ path: string; sha256: string }>) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    if (!SAFE_REPOSITORY_SEGMENT.test(entry.name) || entry.name === "." || entry.name === "..") {
      throw new Error(`unsafe evidence path component: ${entry.name}`);
    }
    const entryPath = path.join(directory, entry.name);
    const stats = await lstat(entryPath);
    if (stats.isSymbolicLink()) throw new Error(`evidence tree contains a symbolic link: ${entry.name}`);
    if (stats.isDirectory()) {
      await collectArtifactFiles(root, entryPath, output);
      continue;
    }
    if (!stats.isFile()) throw new Error(`evidence tree contains a non-file entry: ${entry.name}`);
    const relative = path.relative(root, entryPath).split(path.sep).join("/");
    output.push({ path: relative, sha256: sha256(await readFile(entryPath)) });
  }
}

export async function hashArtifactTree(artifactRoot: string) {
  return canonicalJsonSha256(await artifactFileReceipts(artifactRoot));
}

export async function artifactFileReceipts(artifactRoot: string) {
  if (!existsSync(artifactRoot)) return [];
  const stats = await lstat(artifactRoot);
  if (stats.isSymbolicLink() || !stats.isDirectory()) {
    throw new Error("artifact root must be a regular directory");
  }
  const rootReal = await realpath(artifactRoot);
  const files: Array<{ path: string; sha256: string }> = [];
  await collectArtifactFiles(rootReal, rootReal, files);
  return files;
}
