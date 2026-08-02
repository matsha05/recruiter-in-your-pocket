import {
  getGauntletProgress,
  validateGauntletDefinition,
  writeGauntletAnchor,
} from "../lib/gauntlet/progress";
import { prepareBlindPackets } from "../lib/gauntlet/packets";

async function main() {
  const command = process.argv[2] || "status";
  const args = process.argv.slice(3);
  const iterationArg = args.find((arg) => arg.startsWith("--iteration="));
  const iterationId = iterationArg?.slice("--iteration=".length);
  const webRootArg = args.find((arg) => arg.startsWith("--web-root="));
  const webRoot = webRootArg?.slice("--web-root=".length);
  const strict = command === "strict" || args.includes("--strict");

  if (command === "validate") {
    const result = await validateGauntletDefinition(webRoot, iterationId);
    if (!result.repositoryAvailable) {
      console.error("Gauntlet definition cannot be repository-verified because Git metadata is unavailable.");
      process.exitCode = 1;
      return;
    }
    if (result.issues.length > 0) {
      console.error(`Gauntlet definition failed validation:\n- ${result.issues.join("\n- ")}`);
      process.exitCode = 1;
      return;
    }
    console.log(`Gauntlet definition valid: ${result.manifest.cases.length} existing fixtures, ${result.manifest.requiredJourneys.length} required journeys.`);
    return;
  }

  if (command === "prepare") {
    const result = await prepareBlindPackets(webRoot, iterationId);
    console.log(`Prepared ${result.preparedCases} blind packets for ${result.iterationId}.`);
    console.log(`Artifacts: ${result.artifactRoot}`);
    return;
  }

  if (command === "anchor") {
    const result = await writeGauntletAnchor(webRoot, iterationId);
    console.log(`Prepared Git anchor for ${result.record.iterationId}.`);
    console.log(`Evidence commit: ${result.record.evidenceCommit}`);
    console.log(`Anchor: ${result.outputPath}`);
    console.log("Commit only the new anchor record in the immediate next commit; strict remains nonzero until then.");
    return;
  }

  if (command === "status" || command === "strict") {
    const snapshot = await getGauntletProgress(webRoot, iterationId);
    console.log(JSON.stringify({
      iteration: snapshot.iteration.id,
      iterationLedgerSha256: snapshot.iterationLedgerSha256,
      builder: snapshot.iteration.builder,
      critic: snapshot.iteration.critic,
      history: snapshot.iterations,
      overallStatus: snapshot.overallStatus,
      configuredCases: snapshot.configuredCases,
      pairedOutputCases: snapshot.pairedOutputCases,
      blindReviewedCases: snapshot.blindReviewedCases,
      sourceAuditedCases: snapshot.sourceAuditedCases,
      referenceAssessedCases: snapshot.referenceAssessedCases,
      completedJourneys: snapshot.completedJourneys,
      gates: snapshot.gates,
      baselineGaps: snapshot.baselineGaps,
      dataIssues: snapshot.dataIssues,
    }, null, 2));
    if (strict && snapshot.overallStatus !== "pass") process.exitCode = 1;
    return;
  }

  throw new Error(`Unknown command "${command}". Use validate, prepare, anchor, status, or strict.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
