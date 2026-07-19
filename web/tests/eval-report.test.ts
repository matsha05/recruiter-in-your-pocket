import assert from "node:assert/strict";
import { generateMarkdownReport } from "../lib/evals/report";
import type { EvalRunOutput } from "../lib/evals/types";

function buildRun(executionMode: "dry_run" | "live"): EvalRunOutput {
  return {
    metadata: {
      run_id: `test_${executionMode}`,
      timestamp: "2026-07-09T00:00:00.000Z",
      execution_mode: executionMode,
      model: "test-model",
      temperature: 0,
      top_p: 1,
      prompt_version_hash: "test",
      contract_version: "v2",
      tier: "golden",
      budget_usd: 0,
      actual_cost_usd: 0,
      calls_made: executionMode === "dry_run" ? 0 : 1,
      max_calls: 1,
      concurrency: 1,
    },
    summary: { total: 1, passed: 1, warned: 0, failed: 0 },
    results: [
      {
        fixture_id: "fixture_1",
        status: "PASS",
        errors: [],
        warnings: [],
        actual_score: executionMode === "dry_run" ? 0 : 82,
        expected_range: [75, 90],
      },
    ],
  };
}

const dryRunReport = generateMarkdownReport(buildRun("dry_run"));
assert.match(dryRunReport, /^# PromptOps Fixture Validation Report/m);
assert.match(dryRunReport, /not evidence of model output quality/i);
assert.match(dryRunReport, /Fixture Validation Rate/);
assert.doesNotMatch(dryRunReport, /fixture_1 \(score:/);

const liveReport = generateMarkdownReport(buildRun("live"));
assert.match(liveReport, /^# PromptOps Live Eval Report/m);
assert.match(liveReport, /Live model evaluation/);
assert.match(liveReport, /fixture_1 \(score: 82\)/);

console.log("eval-report tests passed");
