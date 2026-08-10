import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  getGauntletProgress,
  journeyDefinitionSha256,
  UnknownGauntletIterationError,
} from "../lib/gauntlet/progress";
import { validateExactArtifactInventory } from "../lib/gauntlet/progress/inventory";

async function main() {
  const snapshot = await getGauntletProgress(process.cwd(), "iteration-002");
  assert.equal(snapshot.iteration.id, "iteration-002");
  assert.equal(snapshot.iteration.status, "retired");
  assert.equal(snapshot.configuredCases, 12);
  for (const count of [
    snapshot.pairedOutputCases,
    snapshot.blindReviewedCases,
    snapshot.sourceAuditedCases,
    snapshot.referenceAssessedCases,
    snapshot.automatedCheckedCases,
  ]) assert.ok(count >= 0 && count <= 12);
  assert.ok(snapshot.completedJourneys >= 0 && snapshot.completedJourneys <= 4);
  assert.deepEqual(snapshot.dataIssues, []);
  assert.equal(snapshot.iterations.length, 2);
  assert.equal(snapshot.iterations[0]?.id, "iteration-002");
  assert.equal(snapshot.iterations[0]?.active, true);
  assert.equal(snapshot.iterations.some((iteration) => iteration.id === "iteration-001"), false);

  const caseSet = snapshot.gates.find((gate) => gate.id === "case-set");
  const binding = snapshot.gates.find((gate) => gate.id === "candidate-binding");
  const outputs = snapshot.gates.find((gate) => gate.id === "paired-outputs");
  const critic = snapshot.gates.find((gate) => gate.id === "critic-verdict");
  const integrity = snapshot.gates.find((gate) => gate.id === "evidence-integrity");
  assert.equal(caseSet?.status, "pass");
  assert.equal(snapshot.overallStatus, "retired");
  assert.equal(snapshot.pairedOutputCases, 0);
  assert.equal(snapshot.blindReviewedCases, 0);
  assert.equal(snapshot.sourceAuditedCases, 0);
  assert.equal(snapshot.referenceAssessedCases, 0);
  assert.equal(snapshot.automatedCheckedCases, 0);
  assert.equal(snapshot.completedJourneys, 0);
  assert.equal(snapshot.manuallyInventedFacts, null);
  assert.equal(snapshot.criticalJourneyFailures, null);
  assert.ok(snapshot.cases.every((testCase) => testCase.candidate === null && testCase.production === null));
  assert.equal(binding?.status, "retired");
  assert.equal(outputs?.status, "retired");
  assert.equal(critic?.status, "retired");
  assert.equal(integrity?.status, "retired");
  assert.deepEqual(snapshot.baselineGaps, [
    "Matt ended this Gauntlet before evidence capture. It is retired without a quality verdict and has no remaining work queue.",
  ]);

  const baseline = await getGauntletProgress(process.cwd(), "iteration-000-baseline");
  assert.equal(baseline.iteration.status, "baseline_pending");
  assert.equal(baseline.iteration.production.deploymentStatus, "deployed_baseline");
  assert.equal(baseline.overallStatus, "pending");
  assert.deepEqual(baseline.dataIssues, []);

  await assert.rejects(
    () => getGauntletProgress(process.cwd(), "iteration-999"),
    UnknownGauntletIterationError,
  );
  await assert.rejects(
    () => getGauntletProgress(process.cwd(), "../../outside"),
    /iteration selector/,
  );

  const journey = snapshot.manifest.requiredJourneys[0];
  assert.equal(journeyDefinitionSha256(journey), journeyDefinitionSha256({ ...journey }));

  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "riyp-gauntlet-inventory-"));
  const artifactRoot = path.join(temporaryRoot, "iteration-002");
  try {
    await mkdir(artifactRoot);
    await writeFile(path.join(artifactRoot, "unreferenced.json"), "{}\n");
    const issues: string[] = [];
    await validateExactArtifactInventory({
      artifactRoot,
      iteration: snapshot.iteration,
      prepared: { paths: new Set(), referencePacketSha256: new Map() },
      evidence: {
        candidateOutputs: new Map(),
        productionOutputs: new Map(),
        blindJudgments: new Map(),
        sourceAudits: new Map(),
        referenceAssessments: new Map(),
        journeys: new Map(),
      },
      criticValid: false,
      issues,
    });
    assert.match(issues.join("\n"), /unreferenced or invalid evidence artifact/);
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }

  console.log("Gauntlet retired progress tests passed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
