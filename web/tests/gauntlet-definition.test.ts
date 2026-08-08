import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { validateGauntletDefinition } from "../lib/gauntlet/progress";
import { unboundCandidateAllowed } from "../lib/gauntlet/progress/definition";
import { shouldProtectInternalLaunchSurfaceForHost } from "../lib/launch/access";
import { GAUNTLET_RUNTIME_CLOSURE_PATHS } from "../lib/gauntlet/types";

const webRoot = process.cwd();
const repositoryRoot = path.resolve(webRoot, "..");
const baselineCommit = "181bf60ba636d4d461d0fc0b965f36120b296fb4";

function sha256(value: string | Buffer) {
  return createHash("sha256").update(value).digest("hex");
}

async function pathExists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function sourceFiles(directory: string): Promise<string[]> {
  const output: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) output.push(...await sourceFiles(filePath));
    else if (/\.(?:[cm]?[jt]sx?)$/.test(entry.name)) output.push(filePath);
  }
  return output;
}

async function main() {
  const definition = await validateGauntletDefinition(webRoot, "iteration-002");
  assert.deepEqual(definition.issues, [], "the active definition must validate without invented evidence");
  assert.equal(definition.manifest.activeIterationId, "iteration-002");
  assert.ok(["pending", "collecting", "complete"].includes(definition.iteration.status));
  assert.equal(definition.iteration.production.commit, baselineCommit);
  assert.equal(definition.iteration.production.ref, "main");
  assert.equal(definition.iteration.production.deploymentStatus, "deployed_baseline");
  assert.equal(definition.iteration.candidate.ref, "codex/gauntlet-iteration-002");
  assert.equal(definition.iteration.candidate.deploymentStatus, "not_deployed");
  if (definition.iteration.status === "pending") {
    assert.equal(definition.iteration.critic.verdict, "pending");
    assert.equal(definition.iteration.candidate.commit, null);
    assert.equal(definition.iteration.seal, null);
  } else {
    assert.match(definition.iteration.candidate.commit ?? "", /^[a-f0-9]{40}$/);
    assert.notEqual(definition.iteration.candidate.model, null);
    assert.notEqual(definition.iteration.candidate.resumePrompt, null);
    assert.notEqual(definition.iteration.candidate.renderer, null);
    assert.equal(definition.iteration.status === "complete", definition.iteration.seal !== null);
  }
  assert.equal(unboundCandidateAllowed("baseline_pending"), true);
  assert.equal(unboundCandidateAllowed("pending"), true);
  assert.equal(unboundCandidateAllowed("collecting"), false);
  assert.equal(unboundCandidateAllowed("complete"), false);
  assert.equal(shouldProtectInternalLaunchSurfaceForHost("localhost", false), true);
  assert.equal(shouldProtectInternalLaunchSurfaceForHost("localhost", true), false);
  assert.equal(shouldProtectInternalLaunchSurfaceForHost("example.com", true), true);

  const baselinePath = path.join(webRoot, "gauntlet/iterations/iteration-000-baseline.json");
  const baselineRaw = await readFile(baselinePath, "utf8");
  assert.equal(definition.iteration.previous?.iterationId, "iteration-000-baseline");
  assert.equal(definition.iteration.previous?.ledgerSha256, sha256(baselineRaw));

  const forbidden = [
    "web/gauntlet/iterations/iteration-001.json",
    "web/gauntlet/artifacts/iteration-001",
    "web/gauntlet/published/progress.json",
    "web/gauntlet/published/progress-data.ts",
    "web/gauntlet/sources/eval-1785271781375-synthetic-12.json",
    "web/lib/gauntlet/published-progress.ts",
    "web/lib/gauntlet/publish-progress.ts",
  ];
  for (const repositoryPath of forbidden) {
    assert.equal(await pathExists(path.join(repositoryRoot, repositoryPath)), false, `${repositoryPath} must stay excluded`);
  }

  const artifactEntries = (await readdir(path.join(webRoot, "gauntlet/artifacts"))).sort();
  if (definition.iteration.status === "pending") {
    assert.deepEqual(artifactEntries, [".gitignore"], "pending iteration must not ship evidence files");
  } else {
    assert.ok(artifactEntries.every((entry) => [".gitignore", "iteration-002"].includes(entry)));
    if (definition.iteration.status === "complete") {
      assert.ok(artifactEntries.includes("iteration-002"));
    }
  }

  for (const repositoryPath of GAUNTLET_RUNTIME_CLOSURE_PATHS) {
    assert.equal(await pathExists(path.join(repositoryRoot, repositoryPath)), true, `runtime closure path is missing: ${repositoryPath}`);
  }

  const gauntletTests = (await readdir(path.join(webRoot, "tests")))
    .filter((entry) => /^gauntlet.*\.test\.ts$/.test(entry))
    .map((entry) => path.join(webRoot, "tests", entry));
  const harnessSources = (
    await Promise.all([
      sourceFiles(path.join(webRoot, "lib/gauntlet")),
      sourceFiles(path.join(webRoot, "scripts/gauntlet-evidence-capture")),
      sourceFiles(path.join(webRoot, "app/(app)/launch/gauntlet")),
    ])
  ).flat().concat([
    path.join(webRoot, "scripts/gauntlet-evidence-capture.ts"),
    path.join(webRoot, "scripts/gauntlet-report-finalizer.ts"),
    path.join(webRoot, "scripts/run-gauntlet.ts"),
    path.join(webRoot, "tests/ui/gauntlet.spec.ts"),
    ...gauntletTests,
  ]);
  for (const filePath of harnessSources) {
    const source = await readFile(filePath, "utf8");
    const lineCount = source.split("\n").length - 1;
    assert.ok(lineCount < 500, `${path.relative(webRoot, filePath)} must stay below 500 lines`);
    if (!filePath.includes(`${path.sep}tests${path.sep}`)) {
      assert.doesNotMatch(source, /53ae48cc41df97c6d8dcaebb5bfc458b080bf581/);
      assert.doesNotMatch(source, /3a85bb583458bbab9c74648a6106f5b87ada3dc6/);
      assert.doesNotMatch(source, /eval_1785271781375/);
      assert.doesNotMatch(source, /LEGACY_CAPTURE_ITERATION/);
      assert.doesNotMatch(source, /iteration-001/);
    }
  }

  const page = await readFile(path.join(webRoot, "app/(app)/launch/gauntlet/page.tsx"), "utf8");
  assert.match(page, /PRIVATE_ROUTE_ROBOTS/);
  assert.match(page, /shouldProtectInternalLaunchSurface/);
  assert.match(page, /canAccessInternalLaunchSurface/);
  assert.match(page, /getGauntletProgress/);
  assert.doesNotMatch(page, /published-progress/);

  const nextConfig = await readFile(path.join(webRoot, "next.config.mjs"), "utf8");
  assert.doesNotMatch(nextConfig, /"\/launch\/gauntlet"/);
  assert.match(nextConfig, /DefinePlugin/);
  assert.match(nextConfig, /__RIYP_GAUNTLET_MANIFEST_JSON__/);
  assert.match(nextConfig, /__RIYP_GAUNTLET_BASELINE_JSON__/);
  assert.match(nextConfig, /__RIYP_GAUNTLET_ITERATION_002_JSON__/);
  assert.doesNotMatch(nextConfig, /gauntlet\/iterations\/\*/);
  assert.doesNotMatch(nextConfig, /gauntlet\/artifacts\/iteration/);

  const captureGit = await readFile(
    path.join(webRoot, "scripts/gauntlet-evidence-capture/repository-git.ts"),
    "utf8",
  );
  assert.match(captureGit, /GIT_NO_REPLACE_OBJECTS: "1"/);

  console.log("Gauntlet definition integrity tests passed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
