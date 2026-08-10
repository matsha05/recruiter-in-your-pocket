import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  GAUNTLET_AUTOMATED_CHECK_PATHS,
  GAUNTLET_RUNTIME_CLOSURE_PATHS,
  type CandidateBinding,
  type GauntletIteration,
  type GauntletManifest,
  type ReportFinalizationReceipt,
} from "../lib/gauntlet/types";
import { parseCaptureCli } from "../scripts/gauntlet-evidence-capture";
import { assertGauntletEvalActive, parseGauntletEvalCli } from "../scripts/run-gauntlet-eval";
import {
  generationEvidenceIssues,
  generationRunIdentity,
  generationRunSetIssues,
  generationSourceLineageIssues,
  iterationEvidencePathAllowed,
} from "../lib/gauntlet/progress/generation";
import { automatedCheckClosureIssues } from "../lib/gauntlet/progress/automated";
import {
  assertCaptureLedgerReady,
  assertFreshSourceForIteration,
} from "../scripts/gauntlet-evidence-capture/repository";
import { parseRunnerAttestation } from "../scripts/gauntlet-evidence-capture/runner-attestation";
import {
  buildOutputArtifact,
  CAPTURE_HARNESS_PATHS,
  canonicalJsonSha256,
  sanitizeHistoricalRun,
  sha256,
} from "../scripts/gauntlet-evidence-capture/contracts";

const commit = "181bf60ba636d4d461d0fc0b965f36120b296fb4";

async function manifest() {
  return JSON.parse(await readFile(path.join(process.cwd(), "gauntlet/manifest.json"), "utf8")) as GauntletManifest;
}

function historicalRun(definition: GauntletManifest) {
  const model = "gpt-5.6-luna";
  const results: Array<{
    fixture_id: string;
    status: string;
    response_model: string;
    raw_output: Record<string, unknown>;
  }> = definition.cases.map((testCase, index) => ({
    fixture_id: testCase.fixtureId,
    status: "PASS",
    response_model: model,
    raw_output: { score: 70 + index, marker: testCase.id },
  }));
  results.push({
    fixture_id: "excluded_private_case",
    status: "PASS",
    response_model: model,
    raw_output: { secret: "must-not-survive-sanitization" },
  });
  return {
    metadata: {
      run_id: "eval_iteration_002_fixture",
      timestamp: "2026-08-02T18:47:49.000Z",
      execution_mode: "live",
      model,
      reasoning_effort: "low",
      prompt_version_hash: "iteration-002-test-prompt",
      resume_prompt_sha256: "a".repeat(64),
      contract_version: "v2",
    },
    summary: { total: results.length },
    results,
  };
}

function attestedRun(run: ReturnType<typeof historicalRun>, definition: GauntletManifest) {
  const bytes = Buffer.from(`${JSON.stringify(run)}\n`);
  const metadata = run.metadata;
  const attestationBytes = Buffer.from(`${JSON.stringify({
    schemaVersion: "1",
    kind: "gauntlet-eval-runner-attestation",
    issuedAt: "2026-08-02T18:48:00.000Z",
    runnerCommit: commit,
    fullRunSha256: sha256(bytes),
    runId: metadata.run_id,
    generatedAt: metadata.timestamp,
    executionMode: "live",
    model: metadata.model,
    reasoningEffort: metadata.reasoning_effort,
    promptVersion: metadata.prompt_version_hash,
    canonicalPromptSha256: metadata.resume_prompt_sha256,
    contractVersion: "v2",
    totalResults: run.results.length,
    providerResponses: run.results.map((_, index) => ({
      id: `response-${index}`,
      createdAt: metadata.timestamp,
      model: metadata.model,
    })),
    usage: { promptTokens: 1200, completionTokens: 600, totalTokens: 1800 },
    costUsd: 0.42,
  })}\n`);
  const parsed = parseRunnerAttestation(attestationBytes, bytes, definition.target.caseCount);
  return {
    bytes,
    receipt: parsed.receipt,
    binding: {
      path: "web/gauntlet/runner-receipts/iteration-002.json",
      sha256: parsed.sha256,
      runnerCommit: parsed.receipt.runnerCommit,
      issuedAt: parsed.receipt.issuedAt,
    },
  };
}

function candidateBinding(): CandidateBinding {
  return {
    ref: "codex/gauntlet-iteration-002",
    deploymentStatus: "not_deployed",
    commit,
    model: "gpt-5.6-luna",
    resumePrompt: { path: "web/prompts/resume_v2.txt", sha256: "b".repeat(64) },
    renderer: { path: "web/components/workspace/report/ReportStream.tsx", sha256: "c".repeat(64) },
  };
}

async function main() {
  const runtimePaths = new Set<string>(GAUNTLET_RUNTIME_CLOSURE_PATHS);
  for (const repositoryPath of CAPTURE_HARNESS_PATHS) {
    assert.ok(runtimePaths.has(repositoryPath));
  }
  const repositoryRoot = path.resolve(process.cwd(), "..");
  const automatedReceipts = await Promise.all(GAUNTLET_AUTOMATED_CHECK_PATHS.map(async (repositoryPath) => ({
    path: repositoryPath,
    sha256: sha256(await readFile(path.join(repositoryRoot, repositoryPath))),
  })));
  const automatedClosure = { files: automatedReceipts, sha256: "a".repeat(64) };
  assert.deepEqual(await automatedCheckClosureIssues(repositoryRoot, automatedClosure), []);
  automatedClosure.files[0].sha256 = "b".repeat(64);
  assert.match(
    (await automatedCheckClosureIssues(repositoryRoot, automatedClosure)).join("\n"),
    /differs from the candidate receipt/,
  );
  const definition = await manifest();
  const fullRun = historicalRun(definition);
  const attested = attestedRun(fullRun, definition);
  const { bytes } = attested;
  const sanitized = sanitizeHistoricalRun(bytes, definition, attested.receipt, attested.binding);
  assert.equal(sanitized.sourceRun.fullRunSha256, sha256(bytes));
  assert.equal(sanitized.sourceRun.runId, "eval_iteration_002_fixture");
  assert.equal(sanitized.selection.caseCount, 12);
  assert.equal(sanitized.selection.excludedResultCount, 1);
  assert.equal(sanitized.results.length, 12);
  assert.equal(sanitized.sourceRun.runnerReceipt.runnerCommit, commit);
  assert.match(sanitized.sourceRun.runnerReceipt.path, /runner-receipts\/iteration-002\.json$/);
  assert.equal(JSON.stringify(sanitized).includes("must-not-survive-sanitization"), false);

  const iteration = JSON.parse(
    await readFile(path.join(process.cwd(), "gauntlet/iterations/iteration-002.json"), "utf8"),
  ) as GauntletIteration;
  const captureTime = Date.parse("2026-08-02T18:48:00.000Z");
  assert.doesNotThrow(() => assertFreshSourceForIteration(sanitized, iteration, captureTime));
  const staleSource = structuredClone(sanitized);
  staleSource.sourceRun.generatedAt = "2026-08-01T00:00:00.000Z";
  assert.throws(
    () => assertFreshSourceForIteration(staleSource, iteration, captureTime),
    /generated during the active iteration and within 48 hours/,
  );
  assert.throws(
    () => assertFreshSourceForIteration(sanitized, iteration, Date.parse("2026-08-05T18:48:00.000Z")),
    /within 48 hours/,
  );
  assert.throws(
    () => assertCaptureLedgerReady(iteration, "iteration-002", commit),
    /must be collecting and bound/,
  );
  const collecting = structuredClone(iteration);
  collecting.status = "collecting";
  collecting.candidate.commit = commit;
  assert.doesNotThrow(() => assertCaptureLedgerReady(collecting, "iteration-002", commit));

  const dryRun = historicalRun(definition);
  dryRun.metadata.execution_mode = "dry_run";
  const dryAttested = attestedRun(dryRun, definition);
  assert.throws(
    () => sanitizeHistoricalRun(dryAttested.bytes, definition, dryAttested.receipt, dryAttested.binding),
    /execution mode does not match/,
  );

  const missing = historicalRun(definition);
  missing.results.splice(0, 1);
  missing.summary.total = missing.results.length;
  const missingAttested = attestedRun(missing, definition);
  assert.throws(
    () => sanitizeHistoricalRun(
      missingAttested.bytes,
      definition,
      missingAttested.receipt,
      missingAttested.binding,
    ),
    /approved fixture is missing/,
  );

  const rawReport = { score: 80, finding: "Source-bound fixture" };
  const effectiveReport = { ...rawReport, finding: "Source-bound fixture retained" };
  const finalization: ReportFinalizationReceipt = {
    status: "finalized",
    forceGrounding: true,
    rawReportSha256: canonicalJsonSha256(rawReport),
    effectiveReportSha256: canonicalJsonSha256(effectiveReport),
    validator: {
      commit,
      path: "web/lib/backend/validation.ts",
      sha256: "d".repeat(64),
      gitBlobOid: "e".repeat(40),
    },
  };
  const artifact = buildOutputArtifact({
    iterationId: "iteration-002",
    caseId: "staff-ml-elite",
    variant: "candidate",
    binding: candidateBinding(),
    generation: {
      sourceCommit: commit,
      sanitizedOutput: { path: "web/gauntlet/sources/iteration-002.json", sha256: "f".repeat(64) },
      runId: "eval_iteration_002_fixture",
      fixtureId: "anchor_elite_ml_staff_1",
      generatedAt: "2026-08-02T18:47:49.000Z",
      model: "gpt-5.6-luna",
      canonicalPromptSha256: "a".repeat(64),
      reportSha256: canonicalJsonSha256(rawReport),
    },
    finalization,
    fixtureSha256: "1".repeat(64),
    rawReport,
    effectiveReport,
    presentation: {
      visibleText: "A source-bound synthetic report presentation.",
      screenshot: Buffer.from("synthetic screenshot"),
      route: "/workspace?gauntlet=1",
      viewport: { width: 1440, height: 1200 },
      capturedAt: "2026-08-02T18:48:49.000Z",
      captureReceipt: {
        archiveIdentity: { schemaVersion: "1", nonce: "2".repeat(48), variant: "candidate", commit },
        renderedReport: {
          schemaVersion: "1",
          nonce: "2".repeat(48),
          variant: "candidate",
          commit,
          caseId: "staff-ml-elite",
          component: "ReportStream",
          reportSha256: canonicalJsonSha256(effectiveReport),
        },
      },
    },
    screenshotPath: "presentations/candidate/staff-ml-elite.png",
  });
  assert.equal(artifact.captureContract, "finalized-v1");
  assert.equal(artifact.reportMode, "candidate_commit_finalized");
  assert.equal(artifact.binding.deploymentStatus, "not_deployed");

  const collectingIteration = structuredClone(iteration);
  collectingIteration.status = "collecting";
  collectingIteration.candidate = candidateBinding();
  assert.deepEqual(generationEvidenceIssues(artifact, collectingIteration), []);
  assert.deepEqual(
    await generationSourceLineageIssues(repositoryRoot, artifact, collectingIteration),
    [],
  );
  const relabeled = structuredClone(artifact);
  relabeled.generation.sanitizedOutput.path = "web/gauntlet/sources/iteration-001.json";
  assert.match(generationEvidenceIssues(relabeled, collectingIteration).join("\n"), /iteration-002\.json/);
  const lateCapture = structuredClone(artifact);
  lateCapture.presentation.capturedAt = "2026-08-05T18:48:00.000Z";
  assert.match(generationEvidenceIssues(lateCapture, collectingIteration).join("\n"), /within 48 hours/);
  const parentCommit = execFileSync(
    "git",
    ["--no-replace-objects", "rev-parse", `${commit}^`],
    { cwd: repositoryRoot, encoding: "utf8" },
  ).trim();
  const reversedLineage = structuredClone(artifact);
  reversedLineage.generation.sourceCommit = parentCommit;
  assert.match(
    (await generationSourceLineageIssues(
      repositoryRoot,
      reversedLineage,
      collectingIteration,
    )).join("\n"),
    /does not descend/,
  );
  assert.equal(
    iterationEvidencePathAllowed("web/gauntlet/sources/iteration-002.json", "iteration-002"),
    true,
  );
  assert.equal(
    iterationEvidencePathAllowed("web/lib/backend/validation.ts", "iteration-002"),
    false,
  );
  const mixedRun = structuredClone(artifact);
  mixedRun.generation.runId = "different-run";
  assert.notEqual(generationRunIdentity(artifact), generationRunIdentity(mixedRun));
  assert.match(generationRunSetIssues([artifact, mixedRun]).join("\n"), /one immutable generation run/);

  const cli = parseCaptureCli([
    "capture",
    "--repository-root=/tmp/repository",
    "--manifest=/tmp/repository/web/gauntlet/manifest.json",
    "--iteration=iteration-002",
    `--candidate-commit=${commit}`,
    `--source-commit=${commit}`,
    "--source-path=web/gauntlet/sources/iteration-002.json",
  ]);
  assert.equal(cli.command, "capture");
  assert.equal(cli.values.iteration, "iteration-002");
  const extractCli = parseCaptureCli([
    "extract",
    "--source=/tmp/fresh-run.json",
    "--receipt=/tmp/fresh-run.receipt.json",
    "--receipt-repository-path=web/gauntlet/runner-receipts/iteration-002.json",
    "--manifest=/tmp/repository/web/gauntlet/manifest.json",
  ]);
  assert.equal(extractCli.values["receipt-repository-path"], "web/gauntlet/runner-receipts/iteration-002.json");
  assert.throws(() => parseCaptureCli(["capture", "--iteration=../../outside"]), /required/);
  const evalCli = parseGauntletEvalCli([
    "--attestation=/tmp/iteration-002-attestation.json",
    "--budget-usd=6",
    "--max-calls=80",
  ]);
  assert.equal(evalCli.options.tier, "golden");
  assert.equal(evalCli.options.dryRun, false);
  assert.equal(evalCli.options.budgetUsd, 6);
  assert.throws(() => assertGauntletEvalActive("retired"), /ended by owner/);
  assert.doesNotThrow(() => assertGauntletEvalActive("pending"));
  assert.throws(
    () => parseGauntletEvalCli(["--attestation=/tmp/a.json", "--dry-run=true"]),
    /unknown argument/,
  );

  console.log("Gauntlet capture contract tests passed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
