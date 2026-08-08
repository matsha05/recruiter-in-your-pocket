import { execFile } from "node:child_process";

const FULL_GIT_SHA = /^[a-f0-9]{40}$/;

export function execFileBuffer(command: string, args: string[], cwd: string, maxBuffer = 32 * 1024 * 1024) {
  return new Promise<Buffer>((resolve, reject) => {
    const env = command === "git"
      ? { ...process.env, GIT_NO_REPLACE_OBJECTS: "1" }
      : process.env;
    execFile(command, args, { cwd, encoding: "buffer", env, maxBuffer }, (error, stdout, stderr) => {
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
