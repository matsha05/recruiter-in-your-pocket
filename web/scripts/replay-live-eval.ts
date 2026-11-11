import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { validateResumeModelPayload } from "../lib/backend/validation";
import { canonicalizeResumeReportEvidence } from "../lib/llm/evidence-canonicalizer";
import { runAllChecks } from "../lib/evals/checks";
import { evaluateReportIntegrity } from "../lib/evals/integrity-checks";
import { generateMarkdownReport } from "../lib/evals/report";
import type { ErrorCode, EvalRunOutput, FixtureResult, WarningCode } from "../lib/evals/types";
import { resumeTextFromFixture } from "../lib/evals/fixture-input";
import { runWorklistChecks, worklistMetrics } from "../lib/evals/worklist-checks";
import { isWorklistReport } from "../lib/llm/worklist-schema";
import { validateWorklistPayload } from "../lib/llm/worklist-validator";

function argumentValue(name: string) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
  // Several saved runs of the same fixtures replay together so score test-retest can be measured.
  const inputArgs = process.argv.slice(2).filter((value) => !value.startsWith("--") && value !== argumentValue("--write-summary") && value !== argumentValue("--write-json"));
  if (inputArgs.length === 0) throw new Error("Usage: replay-live-eval.ts <saved-run.json> [more-runs.json ...] [--write-summary <summary.md>] [--write-json <replay.json>]");

  const sources = await Promise.all(inputArgs.map(async (inputArg) => {
    const bytes = await readFile(path.resolve(process.cwd(), inputArg));
    const run = JSON.parse(bytes.toString("utf8")) as EvalRunOutput;
    if (run.metadata.execution_mode !== "live") throw new Error(`Only saved live eval runs can be replayed: ${inputArg}`);
    return { run, sha256: createHash("sha256").update(bytes).digest("hex") };
  }));
  const run = sources[0].run;
  const promptHashes = new Set(sources.map((source) => source.run.metadata.resume_prompt_sha256));
  if (promptHashes.size > 1) throw new Error("Saved runs replayed together must share one resume prompt");

  const calibration = JSON.parse(
    await readFile(path.resolve(process.cwd(), "../tests/fixtures/calibration.json"), "utf8"),
  );
  const results: FixtureResult[] = [];

  for (const original of sources.flatMap((source) => source.run.results)) {
    const fixture = calibration.fixtures.find((item: any) => item.id === original.fixture_id);
    if (!fixture) throw new Error(`Missing fixture definition: ${original.fixture_id}`);
    const resumeText = resumeTextFromFixture(await readFile(
      path.resolve(process.cwd(), `../tests/resumes/${fixture.path}`),
      "utf8",
    ));

    // A worklist report (contract v3) replays through its own validator and checks, as the runner does.
    const saved = original.model_output ?? original.raw_output;
    const worklist = isWorklistReport(saved);
    const replayChanges = worklist ? [] : canonicalizeResumeReportEvidence(structuredClone(saved), resumeText).changes;
    try {
      const output: any = worklist
        ? validateWorklistPayload(structuredClone(saved), resumeText, { forceGrounding: true })
        : validateResumeModelPayload(structuredClone(saved), resumeText, { forceGrounding: true });
      const checks = worklist
        ? runWorklistChecks({
          output,
          resumeText,
          fixture,
          globalBanned: calibration.global_banned_phrases,
          globalDiscouraged: calibration.global_discouraged_phrases,
        })
        : runAllChecks({
          output,
          resumeText,
          fixture,
          globalBanned: calibration.global_banned_phrases,
          globalDiscouraged: calibration.global_discouraged_phrases,
          expectedContractVersion: calibration.contract_version,
        });
      const errors = checks.errors.map((item) => ({
        code: (item.code || "E_SCHEMA") as ErrorCode,
        message: item.message || "Validation failed",
      }));
      const warnings = checks.warnings.map((item) => ({
        code: (item.code || "W_SPECIFICITY_LOW") as WarningCode,
        message: item.message || "Review recommended",
      }));
      results.push({
        ...original,
        generation_normalization_changes: original.normalization_changes,
        normalization_changes: replayChanges,
        status: errors.length > 0 ? "FAIL" : warnings.length > 0 ? "WARN" : "PASS",
        errors,
        warnings,
        actual_score: output.score,
        expected_range: [fixture.expected_score.min, fixture.expected_score.max],
        raw_output: output,
        integrity: worklist ? undefined : evaluateReportIntegrity(output),
        ...(worklist ? { worklist: worklistMetrics(output) } : {}),
      });
    } catch (error) {
      results.push({
        ...original,
        generation_normalization_changes: original.normalization_changes,
        normalization_changes: replayChanges,
        status: "FAIL",
        errors: [{ code: "E_SCHEMA", message: error instanceof Error ? error.message : String(error) }],
        warnings: [],
        expected_range: [fixture.expected_score.min, fixture.expected_score.max],
      });
    }
  }

  const summary = {
    total: results.length,
    passed: results.filter((result) => result.status === "PASS").length,
    warned: results.filter((result) => result.status === "WARN").length,
    failed: results.filter((result) => result.status === "FAIL").length,
  };
  const replay: EvalRunOutput = {
    metadata: {
      ...run.metadata,
      run_id: `${sources.map((source) => source.run.metadata.run_id).join("+")}_replay`,
      validation_mode: "saved_output_replay",
      validation_input: "model_output_when_available",
      validation_timestamp: new Date().toISOString(),
      source_run_sha256: sources[0].sha256,
      ...(sources.length > 1 ? {
        source_runs: sources.map((source) => ({ run_id: source.run.metadata.run_id, sha256: source.sha256 })),
        calls_made: sources.reduce((total, source) => total + source.run.metadata.calls_made, 0),
        actual_cost_usd: Math.round(sources.reduce((total, source) => total + source.run.metadata.actual_cost_usd, 0) * 1e8) / 1e8,
      } : {}),
    },
    summary,
    results,
  };

  const outputPath = argumentValue("--write-summary");
  if (outputPath) {
    await writeFile(path.resolve(process.cwd(), outputPath), generateMarkdownReport(replay), "utf8");
  }
  const jsonOutputPath = argumentValue("--write-json");
  if (jsonOutputPath) {
    await writeFile(path.resolve(process.cwd(), jsonOutputPath), JSON.stringify(replay, null, 2), "utf8");
  }
  console.log(JSON.stringify({
    runId: replay.metadata.run_id,
    validationMode: replay.metadata.validation_mode,
    sourceRunSha256: replay.metadata.source_run_sha256,
    ...summary,
  }, null, 2));
  if (summary.failed > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
