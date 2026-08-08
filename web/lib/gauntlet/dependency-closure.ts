import { lstat, readFile, readdir, readlink, realpath } from "node:fs/promises";
import path from "node:path";
import { canonicalJsonSha256, isPathInside, sha256 } from "./integrity";

const LOCK_RECORD_FIELDS = ["version", "resolved", "integrity", "link"] as const;
const BENIGN_NODE_MODULES_METADATA = new Set([".bin", ".package-lock.json"]);

type LockPackageRecord = {
  version?: string;
  resolved?: string;
  integrity?: string;
  link?: boolean;
  optional?: boolean;
};

type ParsedPackageLock = {
  lockfileVersion: 3;
  name?: string;
  version?: string;
  packages: Record<string, LockPackageRecord>;
};

function assertOptionalString(value: unknown, label: string): asserts value is string | undefined {
  if (value !== undefined && typeof value !== "string") {
    throw new Error(`${label} must be a string when present`);
  }
}

export function parseDependencyLock(bytes: Buffer, label: string): ParsedPackageLock {
  let parsed: unknown;
  try {
    parsed = JSON.parse(bytes.toString("utf8"));
  } catch {
    throw new Error(`${label} is not valid JSON`);
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`${label} must be an object`);
  }
  const lock = parsed as Record<string, unknown>;
  if (lock.lockfileVersion !== 3) throw new Error(`${label} must use npm lockfileVersion 3`);
  assertOptionalString(lock.name, `${label} name`);
  assertOptionalString(lock.version, `${label} version`);
  if (!lock.packages || typeof lock.packages !== "object" || Array.isArray(lock.packages)) {
    throw new Error(`${label} packages must be an object`);
  }
  const packages: Record<string, LockPackageRecord> = {};
  for (const [packagePath, rawRecord] of Object.entries(lock.packages as Record<string, unknown>)) {
    const segments = packagePath.split("/");
    if (packagePath.includes("\\")
      || packagePath.startsWith("/")
      || segments.includes("..")
      || (packagePath !== "" && (!packagePath.startsWith("node_modules/")
        || segments.some((segment) => segment.length === 0 || segment === ".")))) {
      throw new Error(`${label} contains an unsafe package path: ${packagePath}`);
    }
    if (!rawRecord || typeof rawRecord !== "object" || Array.isArray(rawRecord)) {
      throw new Error(`${label} package ${packagePath || "<root>"} must be an object`);
    }
    const record = rawRecord as Record<string, unknown>;
    assertOptionalString(record.version, `${label} package ${packagePath} version`);
    assertOptionalString(record.resolved, `${label} package ${packagePath} resolved`);
    assertOptionalString(record.integrity, `${label} package ${packagePath} integrity`);
    if (record.link !== undefined && typeof record.link !== "boolean") {
      throw new Error(`${label} package ${packagePath} link must be boolean when present`);
    }
    if (record.optional !== undefined && typeof record.optional !== "boolean") {
      throw new Error(`${label} package ${packagePath} optional must be boolean when present`);
    }
    packages[packagePath] = {
      version: record.version as string | undefined,
      resolved: record.resolved as string | undefined,
      integrity: record.integrity as string | undefined,
      link: record.link as boolean | undefined,
      optional: record.optional as boolean | undefined,
    };
  }
  return {
    lockfileVersion: 3,
    name: lock.name as string | undefined,
    version: lock.version as string | undefined,
    packages,
  };
}

function lockProjection(packagePath: string, record: LockPackageRecord) {
  return {
    path: packagePath,
    version: record.version ?? null,
    resolved: record.resolved ?? null,
    integrity: record.integrity ?? null,
    link: record.link ?? null,
  };
}

function expectedPackageName(packagePath: string) {
  const segments = packagePath.split("/");
  const final = segments.at(-1)!;
  const parent = segments.at(-2)!;
  return parent.startsWith("@") ? `${parent}/${final}` : final;
}

async function discoverPackageRoots(nodeModulesPath: string) {
  const webRoot = path.dirname(nodeModulesPath);
  const observed = new Set<string>();

  async function visitNodeModules(directory: string) {
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      if (BENIGN_NODE_MODULES_METADATA.has(entry.name)) continue;
      if (entry.name.startsWith(".")) {
        throw new Error(`installed dependency tree contains unapproved metadata: ${path.relative(webRoot, path.join(directory, entry.name))}`);
      }
      if (entry.name.startsWith("@")) {
        const scopePath = path.join(directory, entry.name);
        const scopeStats = await lstat(scopePath);
        if (!scopeStats.isDirectory() || scopeStats.isSymbolicLink()) {
          throw new Error(`installed dependency scope must be a regular directory: ${path.relative(webRoot, scopePath)}`);
        }
        const scopedEntries = await readdir(scopePath, { withFileTypes: true });
        for (const scopedEntry of scopedEntries) {
          if (scopedEntry.name.startsWith(".")) {
            throw new Error(`installed dependency scope contains an unapproved entry: ${path.relative(webRoot, path.join(scopePath, scopedEntry.name))}`);
          }
          await visitPackage(path.join(scopePath, scopedEntry.name));
        }
        continue;
      }
      await visitPackage(path.join(directory, entry.name));
    }
  }

  async function visitPackage(packagePath: string) {
    const relative = path.relative(webRoot, packagePath).split(path.sep).join("/");
    observed.add(relative);
    const stats = await lstat(packagePath);
    if (!stats.isDirectory() || stats.isSymbolicLink()) return;
    const nestedNodeModules = path.join(packagePath, "node_modules");
    try {
      const nestedStats = await lstat(nestedNodeModules);
      if (!nestedStats.isDirectory() || nestedStats.isSymbolicLink()) {
        throw new Error(`nested node_modules must be a regular directory: ${relative}/node_modules`);
      }
      await visitNodeModules(nestedNodeModules);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }

  await visitNodeModules(nodeModulesPath);
  return observed;
}

async function snapshotInstalledFilesystem(nodeModulesPath: string) {
  const entries: Array<{
    path: string;
    type: "directory" | "file" | "symbolic-link";
    mode: number;
    sha256: string | null;
    target: string | null;
  }> = [];

  async function visit(directory: string) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      const relative = path.relative(nodeModulesPath, absolute).split(path.sep).join("/");
      const stats = await lstat(absolute);
      const mode = stats.mode & 0o777;
      if (stats.isSymbolicLink()) {
        const target = await readlink(absolute);
        const targetReal = await realpath(absolute);
        if (!isPathInside(nodeModulesPath, targetReal)) {
          throw new Error(`installed dependency symlink escapes node_modules: ${relative}`);
        }
        entries.push({
          path: relative,
          type: "symbolic-link",
          mode,
          sha256: null,
          target: target.split(path.sep).join("/"),
        });
      } else if (stats.isDirectory()) {
        entries.push({ path: relative, type: "directory", mode, sha256: null, target: null });
        await visit(absolute);
      } else if (stats.isFile()) {
        entries.push({
          path: relative,
          type: "file",
          mode,
          sha256: sha256(await readFile(absolute)),
          target: null,
        });
      } else {
        throw new Error(`installed dependency tree contains an unsupported file type: ${relative}`);
      }
    }
  }

  await visit(nodeModulesPath);
  return entries.sort((left, right) => left.path.localeCompare(right.path));
}

/**
 * Reconciles npm's hidden lock with the candidate lock and with the filesystem
 * actually used by the capture. The resulting hash includes observed package
 * kinds and package.json bytes; it cannot be recreated from the hidden lock.
 */
export async function observedInstalledTreeReceipt(input: {
  nodeModulesPath: string;
  candidateLockBytes: Buffer;
  hiddenLockBytes: Buffer;
}) {
  const suppliedStats = await lstat(input.nodeModulesPath);
  if (!suppliedStats.isDirectory() || suppliedStats.isSymbolicLink()) {
    throw new Error("existing node_modules must be a regular directory");
  }
  const nodeModulesPath = await realpath(input.nodeModulesPath);
  const webRoot = path.dirname(nodeModulesPath);
  const candidate = parseDependencyLock(input.candidateLockBytes, "candidate package-lock.json");
  const hidden = parseDependencyLock(input.hiddenLockBytes, "installed node_modules/.package-lock.json");
  if (!Object.hasOwn(candidate.packages, "")) {
    throw new Error("candidate package-lock.json must contain the root package entry");
  }
  if (candidate.name !== hidden.name
    || candidate.version !== hidden.version
    || candidate.lockfileVersion !== hidden.lockfileVersion) {
    throw new Error("installed hidden lock metadata does not match the candidate lock");
  }
  if (Object.hasOwn(hidden.packages, "")) {
    throw new Error("installed hidden lock must not contain a synthetic root package entry");
  }

  for (const [packagePath, installed] of Object.entries(hidden.packages)) {
    const expected = candidate.packages[packagePath];
    if (!expected) throw new Error(`installed dependency is absent from the candidate lock: ${packagePath}`);
    for (const field of LOCK_RECORD_FIELDS) {
      if (installed[field] !== expected[field]) {
        throw new Error(`installed dependency ${packagePath} has a mismatched ${field}`);
      }
    }
  }
  for (const [packagePath, expected] of Object.entries(candidate.packages)) {
    if (packagePath === "" || Object.hasOwn(hidden.packages, packagePath)) continue;
    if (expected.optional !== true) {
      throw new Error(`required candidate dependency is absent from the installed tree: ${packagePath}`);
    }
  }

  const discovered = await discoverPackageRoots(nodeModulesPath);
  for (const packagePath of discovered) {
    if (!Object.hasOwn(hidden.packages, packagePath)) {
      throw new Error(`installed dependency tree contains an unrecorded package: ${packagePath}`);
    }
  }
  for (const packagePath of Object.keys(hidden.packages)) {
    if (!discovered.has(packagePath)) {
      throw new Error(`hidden dependency lock package is absent from node_modules: ${packagePath}`);
    }
  }

  const observedPackages = await Promise.all(Object.entries(hidden.packages)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(async ([packagePath, record]) => {
      const exactPath = path.join(webRoot, ...packagePath.split("/"));
      const stats = await lstat(exactPath);
      if (record.link === true) {
        if (!stats.isSymbolicLink()) {
          throw new Error(`linked dependency is not a symbolic link: ${packagePath}`);
        }
        const rawTarget = await readlink(exactPath);
        const targetReal = await realpath(exactPath);
        if (!isPathInside(webRoot, targetReal)) {
          throw new Error(`linked dependency escapes the capture web root: ${packagePath}`);
        }
        return {
          ...lockProjection(packagePath, record),
          observedKind: "symbolic-link" as const,
          observedTarget: rawTarget.split(path.sep).join("/"),
          packageJsonSha256: null,
        };
      }
      if (!stats.isDirectory() || stats.isSymbolicLink()) {
        throw new Error(`installed dependency must be a regular directory: ${packagePath}`);
      }
      const packageJsonPath = path.join(exactPath, "package.json");
      const packageJsonStats = await lstat(packageJsonPath);
      if (!packageJsonStats.isFile() || packageJsonStats.isSymbolicLink()) {
        throw new Error(`installed dependency package.json must be a regular file: ${packagePath}`);
      }
      const packageJsonBytes = await readFile(packageJsonPath);
      let packageJson: unknown;
      try {
        packageJson = JSON.parse(packageJsonBytes.toString("utf8"));
      } catch {
        throw new Error(`installed dependency package.json is invalid JSON: ${packagePath}`);
      }
      const actualName = packageJson && typeof packageJson === "object" && !Array.isArray(packageJson)
        ? (packageJson as Record<string, unknown>).name
        : null;
      if (actualName !== expectedPackageName(packagePath)) {
        throw new Error(`installed dependency package name does not match its path: ${packagePath}`);
      }
      return {
        ...lockProjection(packagePath, record),
        observedKind: "directory" as const,
        observedTarget: null,
        packageJsonSha256: sha256(packageJsonBytes),
      };
    }));

  return {
    packageCount: observedPackages.length,
    sha256: canonicalJsonSha256({
      packages: observedPackages,
      filesystem: await snapshotInstalledFilesystem(nodeModulesPath),
    }),
  };
}
