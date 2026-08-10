import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { validateResumeModelPayload } from "../lib/backend/validation";
import { runAllChecks } from "../lib/evals/checks";
import { generateMarkdownReport } from "../lib/evals/report";
import type { ErrorCode, EvalRunOutput, FixtureResult, WarningCode } from "../lib/evals/types";

function argumentValue(name: string) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
  const inputArg = process.argv.slice(2).find((value) => !value.startsWith("--") && value !== argumentValue("--write-summary"));
  if (!inputArg) throw new Error("Usage: replay-live-eval.ts <saved-run.json> [--write-summary <summary.md>]");

  const runPath = path.resolve(process.cwd(), inputArg);
  const runBytes = await readFile(runPath);
  const run = JSON.parse(runBytes.toString("utf8")) as EvalRunOutput;
  if (run.metadata.execution_mode !== "live") throw new Error("Only saved live eval runs can be replayed");

  const calibration = JSON.parse(
    await readFile(path.resolve(process.cwd(), "../tests/fixtures/calibration.json"), "utf8"),
  );
  const results: FixtureResult[] = [];

  for (const original of run.results) {
    const fixture = calibration.fixtures.find((item: any) => item.id === original.fixture_id);
    if (!fixture) throw new Error(`Missing fixture definition: ${original.fixture_id}`);
    const resumeText = await readFile(
      path.resolve(process.cwd(), `../tests/resumes/${fixture.path}`),
      "utf8",
    );

    try {
      const output = validateResumeModelPayload(structuredClone(original.raw_output), resumeText, { forceGrounding: true });
      const checks = runAllChecks({
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
        status: errors.length > 0 ? "FAIL" : warnings.length > 0 ? "WARN" : "PASS",
        errors,
        warnings,
        actual_score: output.score,
        expected_range: [fixture.expected_score.min, fixture.expected_score.max],
        raw_output: output,
      });
    } catch (error) {
      results.push({
        ...original,
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
      run_id: `${run.metadata.run_id}_replay`,
      validation_mode: "saved_output_replay",
      validation_timestamp: new Date().toISOString(),
      source_run_sha256: createHash("sha256").update(runBytes).digest("hex"),
    },
    summary,
    results,
  };

  const outputPath = argumentValue("--write-summary");
  if (outputPath) {
    await writeFile(path.resolve(process.cwd(), outputPath), generateMarkdownReport(replay), "utf8");
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
