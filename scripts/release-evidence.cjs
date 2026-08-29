const { spawnSync } = require("child_process");

const RELEASE_INPUT_EXTENSIONS = [
  "cjs",
  "css",
  "graphql",
  "gql",
  "html",
  "js",
  "json",
  "jsx",
  "mdx",
  "mjs",
  "py",
  "scss",
  "sh",
  "sql",
  "toml",
  "ts",
  "tsx",
  "wasm",
  "yaml",
  "yml",
];

const RELEASE_INPUT_CODE_ROOTS = [
  "api",
  "app",
  "extension",
  "lib",
  "scripts",
  "server",
  "src",
  "tests",
  "web",
];

const RELEASE_INPUT_PATHS = [
  ":(top,literal).env.example",
  ":(top,literal).gitattributes",
  ":(top,literal).gitignore",
  ":(top,literal).node-version",
  ":(top,literal).npmrc",
  ":(top,literal).nvmrc",
  ":(top,literal).vercelignore",
  ":(top,literal)Procfile",
  ":(top,literal)fly.toml",
  ":(top,literal)netlify.toml",
  ":(top,literal)render.yaml",
  ":(top,literal)turbo.json",
  ":(top,literal)vercel.json",
  ":(top,literal)wrangler.toml",
  ":(top,glob).env.*.example",
  ":(top,glob)*.config.*",
  ":(top,glob)Dockerfile*",
  ":(top,glob)docker-compose*.yaml",
  ":(top,glob)docker-compose*.yml",
  ":(top,glob)jsconfig*.json",
  ":(top,glob)package*.json",
  ":(top,glob)tsconfig*.json",
  ":(top,glob).github/actions/**",
  ":(top,glob).github/workflows/**",
  ":(top,literal).github/dependabot.yml",
  ":(top,glob)extension/assets/**",
  ":(top,glob)extension/public/**",
  ":(top,glob)migrations/**",
  ":(top,glob)prompts/**",
  ":(top,glob)public/**",
  ":(top,glob)supabase/**",
  ":(top,glob)test-data/**",
  ":(top,glob)web/public/**",
  ":(top,glob)web/prompts/**",
  ":(top,glob)tests/resumes/**",
  ...RELEASE_INPUT_CODE_ROOTS.flatMap((root) => (
    RELEASE_INPUT_EXTENSIONS.map((extension) => `:(top,glob)${root}/**/*.${extension}`)
  )),
  ":(top,glob,exclude)tests/fixtures/results/**",
];

function runGit(repoRoot, args) {
  return spawnSync("git", args, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });
}

function inspectReleaseCandidate(repoRoot) {
  const shaResult = runGit(repoRoot, ["rev-parse", "--verify", "HEAD"]);
  const branchResult = runGit(repoRoot, ["symbolic-ref", "--quiet", "--short", "HEAD"]);
  const trackedStatus = runGit(repoRoot, [
    "status",
    "--porcelain=v1",
    "--untracked-files=no",
  ]);
  const untrackedReleaseInputs = runGit(repoRoot, [
    "ls-files",
    "--others",
    "--exclude-standard",
    "-z",
    "--",
    ...RELEASE_INPUT_PATHS,
  ]);

  const sha = shaResult.status === 0 ? shaResult.stdout.trim() : null;
  const branch = branchResult.status === 0 ? branchResult.stdout.trim() : null;
  const trackedTreeClean = Boolean(
    sha && trackedStatus.status === 0 && trackedStatus.stdout.trim() === "",
  );
  const untrackedReleaseInputCount = untrackedReleaseInputs.status === 0
    ? (untrackedReleaseInputs.stdout.match(/\0/g) || []).length
    : null;
  const hasUntrackedReleaseInputs = untrackedReleaseInputCount === null
    ? null
    : untrackedReleaseInputCount > 0;

  return {
    sha,
    branch: branch || null,
    trackedTreeClean,
    hasUntrackedReleaseInputs,
    untrackedReleaseInputCount,
  };
}

function candidateBindingIsValid(candidate) {
  return Boolean(
    candidate?.trackedTreeClean
      && candidate?.hasUntrackedReleaseInputs === false
      && candidate?.untrackedReleaseInputCount === 0
      && /^[a-f0-9]{40}$/i.test(candidate?.sha || ""),
  );
}

function releaseCandidateIsUnchanged(candidate, candidateAtCompletion) {
  return Boolean(
    candidateBindingIsValid(candidate)
      && candidateBindingIsValid(candidateAtCompletion)
      && candidate.sha === candidateAtCompletion.sha
      && candidate.branch === candidateAtCompletion.branch,
  );
}

function describeReleaseCandidate(candidate) {
  const sha = candidate?.sha ? candidate.sha.slice(0, 12) : "unavailable";
  const branch = candidate?.branch || "detached HEAD";
  const cleanliness = candidate?.trackedTreeClean ? "clean" : "dirty or unavailable";
  const releaseInputs = candidate?.hasUntrackedReleaseInputs === false
    ? "no untracked release inputs"
    : candidate?.hasUntrackedReleaseInputs === true
      ? `${candidate.untrackedReleaseInputCount} untracked release input(s)`
      : "untracked release-input state unavailable";
  return `${sha} on ${branch}; tracked tree ${cleanliness}; ${releaseInputs}`;
}

function summarizeAutopilot(results, candidate, candidateAtCompletion = candidate) {
  const automatedChecks = results.filter((result) => result.category === "check");
  const commandFailed = results.some((result) => result.outcome === "fail");
  const candidateStable = releaseCandidateIsUnchanged(candidate, candidateAtCompletion);
  const automatedChecksPassed = candidateStable
    && automatedChecks.length > 0
    && automatedChecks.every((result) => result.outcome === "pass")
    && !commandFailed;

  return {
    automatedChecksPassed,
    candidateStable,
    manualRehearsalRequired: true,
    releaseVerdict: automatedChecksPassed ? "manual_rehearsal_required" : "no_go",
  };
}

function summarizeLaunchGate(results) {
  const automatedChecksPassed = results.length > 0
    && results.every((result) => result.status !== "fail");

  return {
    automatedChecksPassed,
    manualRehearsalRequired: true,
    // Preserve the legacy field for consumers while making its release-level
    // meaning explicit: automated checks alone never authorize promotion.
    goNoGo: false,
    releaseVerdict: automatedChecksPassed ? "manual_rehearsal_required" : "no_go",
  };
}

module.exports = {
  candidateBindingIsValid,
  describeReleaseCandidate,
  inspectReleaseCandidate,
  releaseCandidateIsUnchanged,
  summarizeAutopilot,
  summarizeLaunchGate,
};
