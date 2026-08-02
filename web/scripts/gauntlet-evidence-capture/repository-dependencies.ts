import { cp, lstat, readFile, realpath } from "node:fs/promises";
import path from "node:path";
import type { DependencyClosureReceipt } from "../../lib/gauntlet/types";
import { observedInstalledTreeReceipt } from "../../lib/gauntlet/dependency-closure";
import {
  HIDDEN_PACKAGE_LOCK_PATH,
  PACKAGE_LOCK_PATH,
  canonicalJsonSha256,
  sha256,
} from "./contracts";
import { readGitBlob } from "./repository-git";

const FULL_GIT_SHA = /^[a-f0-9]{40}$/;

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
