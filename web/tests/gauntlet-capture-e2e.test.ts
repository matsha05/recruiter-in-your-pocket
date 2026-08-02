import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import {
  copyFile,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  GAUNTLET_CAPTURE_CONTRACT,
  GAUNTLET_FINALIZED_CAPTURE_STATEMENT,
  GAUNTLET_RUNTIME_CLOSURE_PATHS,
  type GauntletIteration,
  type GauntletManifest,
  type GauntletOutputArtifact,
  type Variant,
} from "../lib/gauntlet/types";
import {
  getGauntletProgress,
  validateGauntletDefinition,
} from "../lib/gauntlet/progress";
import { captureGauntletEvidence } from "../scripts/gauntlet-evidence-capture/browser";
import {
  canonicalJsonSha256,
  serialize,
  sha256,
} from "../scripts/gauntlet-evidence-capture/contracts";
import {
  copyNodeModulesTree,
  createCapturePlan,
  gitText,
} from "../scripts/gauntlet-evidence-capture/repository";

const ITERATION_ID = "iteration-ci-e2e";
const SOURCE_PATH = "web/gauntlet/sources/eval-1785271781375-synthetic-12.json";
const SNAPSHOT_PATHS = Object.freeze(Array.from(new Set([
  ...GAUNTLET_RUNTIME_CLOSURE_PATHS,
  "web/lib/gauntlet/types.ts",
  "web/lib/gauntlet/progress.ts",
])));

function execGit(cwd: string, args: string[]) {
  return new Promise<string>((resolve, reject) => {
    execFile("git", args, { cwd, encoding: "utf8", maxBuffer: 16 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr.trim() || stdout.trim() || `git ${args[0]} failed`));
        return;
      }
      resolve(stdout.trim());
    });
  });
}

async function copySnapshot(sourceRoot: string, repositoryRoot: string) {
  for (const repositoryPath of SNAPSHOT_PATHS) {
    const source = path.join(sourceRoot, repositoryPath);
    const stats = await lstat(source);
    if (!stats.isFile() || stats.isSymbolicLink()) {
      throw new Error(`candidate snapshot path is not a regular file: ${repositoryPath}`);
    }
    const target = path.join(repositoryRoot, repositoryPath);
    await mkdir(path.dirname(target), { recursive: true });
    await copyFile(source, target);
  }
}

async function createOfflineNodeModulesOverlay(sourceWebRoot: string, targetWebRoot: string) {
  const source = path.join(sourceWebRoot, "node_modules");
  const target = path.join(targetWebRoot, "node_modules");
  await copyNodeModulesTree(source, target);
}

async function prepareEphemeralRepository(sourceRoot: string, temporaryRoot: string) {
  const repositoryRoot = path.join(temporaryRoot, "repository");
  await execGit(temporaryRoot, ["clone", "--shared", "--quiet", sourceRoot, repositoryRoot]);
  await copySnapshot(sourceRoot, repositoryRoot);

  const manifestPath = path.join(repositoryRoot, "web/gauntlet/manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as GauntletManifest;
  manifest.activeIterationId = ITERATION_ID;
  await writeFile(manifestPath, serialize(manifest));

  await execGit(repositoryRoot, ["add", "--", ...SNAPSHOT_PATHS, "web/gauntlet/manifest.json"]);
  await execGit(repositoryRoot, [
    "-c", "user.name=RIYP Gauntlet CI",
    "-c", "user.email=gauntlet-ci@invalid.local",
    "commit", "--quiet", "-m", "test: ephemeral capture candidate",
  ]);
  const candidateCommit = await gitText(repositoryRoot, ["rev-parse", "HEAD"]);
  await createOfflineNodeModulesOverlay(
    path.join(sourceRoot, "web"),
    path.join(repositoryRoot, "web"),
  );
  return { repositoryRoot, candidateCommit, manifestPath };
}

async function writeCollectingLedger(input: {
  repositoryRoot: string;
  plan: Awaited<ReturnType<typeof createCapturePlan>>;
}) {
  const baselinePath = path.join(
    input.repositoryRoot,
    "web/gauntlet/iterations/iteration-000-baseline.json",
  );
  const baselineBytes = await readFile(baselinePath);
  const ledger: GauntletIteration = {
    schemaVersion: "2",
    id: ITERATION_ID,
    label: "Commit-bound capture E2E",
    createdAt: new Date(Date.now() - 1_000).toISOString(),
    status: "collecting",
    production: input.plan.production,
    candidate: input.plan.candidate,
    builder: {
      change: "Exercise the archived production and candidate runtimes through the finalized-v1 capture contract.",
      claim: "The captured reports are bound to exact commits, dependencies, finalization, browser-observed props, and live archive identities.",
    },
    critic: {
      verdict: "pending",
      rationale: "This E2E verifies capture provenance; independent quality judgment remains separate.",
      remainingGap: "Complete blind review and independent source and public-reference assessments.",
    },
    previous: {
      iterationId: "iteration-000-baseline",
      ledgerSha256: sha256(baselineBytes),
    },
    seal: null,
    baselineStatement: GAUNTLET_FINALIZED_CAPTURE_STATEMENT,
  };
  const ledgerPath = path.join(
    input.repositoryRoot,
    `web/gauntlet/iterations/${ITERATION_ID}.json`,
  );
  await writeFile(ledgerPath, serialize(ledger));
}

async function readArtifacts(artifactRoot: string, variant: Variant) {
  const directory = path.join(artifactRoot, "outputs", variant);
  const names = (await readdir(directory)).filter((name) => name.endsWith(".json")).sort();
  const artifacts = await Promise.all(names.map(async (name) => JSON.parse(
    await readFile(path.join(directory, name), "utf8"),
  ) as GauntletOutputArtifact));
  return { directory, names, artifacts };
}

function assertFreshArtifact(artifact: GauntletOutputArtifact, variant: Variant, candidateCommit: string) {
  assert.equal(artifact.captureContract, GAUNTLET_CAPTURE_CONTRACT);
  assert.equal(
    artifact.reportMode,
    variant === "candidate" ? "candidate_commit_finalized" : "historical_raw_unfinalized",
  );
  assert.equal(artifact.finalization?.rawReportSha256, artifact.generation.reportSha256);
  assert.equal(artifact.finalization?.effectiveReportSha256, artifact.reportSha256);
  assert.equal(artifact.reportSha256, canonicalJsonSha256(artifact.report));
  assert.ok(artifact.binding.dependencyClosure);
  assert.equal(artifact.binding.dependencyClosure.packageLock.candidateCommit, candidateCommit);
  if (variant === "candidate") {
    assert.equal(artifact.finalization?.status, "finalized");
    assert.equal(artifact.finalization?.validator?.commit, candidateCommit);
    assert.ok(artifact.binding.runtimeClosure);
  } else {
    assert.equal(artifact.finalization?.status, "unfinalized_raw");
    assert.equal(artifact.binding.runtimeClosure, null);
  }

  const captureReceipt = artifact.presentation.captureReceipt;
  assert.ok(captureReceipt);
  assert.equal(captureReceipt.archiveIdentity.variant, variant);
  assert.equal(captureReceipt.archiveIdentity.commit, artifact.binding.commit);
  assert.match(captureReceipt.archiveIdentity.nonce, /^[a-f0-9]{48}$/);
  assert.equal(captureReceipt.renderedReport.caseId, artifact.caseId);
  assert.equal(captureReceipt.renderedReport.component, "ReportStream");
  assert.equal(captureReceipt.renderedReport.reportSha256, artifact.reportSha256);
  assert.equal(
    canonicalJsonSha256({
      schemaVersion: captureReceipt.renderedReport.schemaVersion,
      nonce: captureReceipt.renderedReport.nonce,
      variant: captureReceipt.renderedReport.variant,
      commit: captureReceipt.renderedReport.commit,
    }),
    canonicalJsonSha256(captureReceipt.archiveIdentity),
  );
}

async function run() {
  const sourceRoot = path.resolve(process.cwd(), "..");
  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "riyp-gauntlet-e2e-"));
  let failed = false;
  try {
    const prepared = await prepareEphemeralRepository(sourceRoot, temporaryRoot);
    const plan = await createCapturePlan({
      repositoryRoot: prepared.repositoryRoot,
      manifestPath: prepared.manifestPath,
      iterationId: ITERATION_ID,
      candidateCommit: prepared.candidateCommit,
      sourceCommit: prepared.candidateCommit,
      sourcePath: SOURCE_PATH,
    });
    await writeCollectingLedger({ repositoryRoot: prepared.repositoryRoot, plan });

    const artifactRoot = path.join(
      plan.repositoryRoot,
      `web/gauntlet/artifacts/${ITERATION_ID}`,
    );
    await captureGauntletEvidence(plan, artifactRoot);

    const [candidate, production, journeys] = await Promise.all([
      readArtifacts(artifactRoot, "candidate"),
      readArtifacts(artifactRoot, "production"),
      readdir(path.join(artifactRoot, "journeys")),
    ]);
    assert.equal(candidate.artifacts.length, 12);
    assert.equal(production.artifacts.length, 12);
    assert.equal(journeys.filter((name) => name.endsWith(".json")).length, 4);

    const candidateByCase = new Map(candidate.artifacts.map((artifact) => [artifact.caseId, artifact]));
    const candidateNonces = new Set<string>();
    const productionNonces = new Set<string>();
    for (const productionArtifact of production.artifacts) {
      const candidateArtifact = candidateByCase.get(productionArtifact.caseId);
      assert.ok(candidateArtifact);
      assertFreshArtifact(productionArtifact, "production", prepared.candidateCommit);
      assertFreshArtifact(candidateArtifact, "candidate", prepared.candidateCommit);
      assert.equal(
        canonicalJsonSha256(candidateArtifact.generation),
        canonicalJsonSha256(productionArtifact.generation),
      );
      candidateNonces.add(candidateArtifact.presentation.captureReceipt!.archiveIdentity.nonce);
      productionNonces.add(productionArtifact.presentation.captureReceipt!.archiveIdentity.nonce);
    }
    assert.equal(candidateNonces.size, 1);
    assert.equal(productionNonces.size, 1);
    assert.notEqual([...candidateNonces][0], [...productionNonces][0]);

    const definition = await validateGauntletDefinition(
      path.join(plan.repositoryRoot, "web"),
      ITERATION_ID,
    );
    assert.deepEqual(definition.issues, []);
    const progress = await getGauntletProgress(path.join(plan.repositoryRoot, "web"), ITERATION_ID);
    assert.deepEqual(progress.dataIssues, []);
    assert.equal(progress.pairedOutputCases, 12);
    assert.equal(progress.completedJourneys, 4);
    assert.equal(progress.automatedCheckedCases, 12);
    assert.equal(progress.reportContractFailures, 0);
    assert.equal(progress.automatedSourceIntegrityViolations, 0);

    const tamperPath = path.join(candidate.directory, candidate.names[0]);
    const untamperedBytes = await readFile(tamperPath);
    const tampered = JSON.parse(untamperedBytes.toString("utf8")) as GauntletOutputArtifact;
    tampered.presentation.captureReceipt!.renderedReport.reportSha256 = "0".repeat(64);
    await writeFile(tamperPath, serialize(tampered));
    const rejected = await getGauntletProgress(path.join(plan.repositoryRoot, "web"), ITERATION_ID);
    assert.equal(rejected.dataIssues.some((issue) => /rendered ReportStream receipt/.test(issue)), true);
    await writeFile(tamperPath, untamperedBytes);
    const restored = await getGauntletProgress(path.join(plan.repositoryRoot, "web"), ITERATION_ID);
    assert.deepEqual(restored.dataIssues, []);

    console.log("gauntlet capture E2E passed: 12 archived pairs, 4 journeys, strict receipts, tamper rejection");
  } catch (error) {
    failed = true;
    console.error(`gauntlet capture E2E workspace: ${temporaryRoot}`);
    throw error;
  } finally {
    if (!failed || process.env.RIYP_KEEP_GAUNTLET_E2E !== "1") {
      await rm(temporaryRoot, { recursive: true, force: true });
    }
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
