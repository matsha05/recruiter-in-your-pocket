import assert from "node:assert/strict";
import { generateMarkdownReport } from "../lib/evals/report";
import type { EvalRunOutput } from "../lib/evals/types";
import {
  liveEvalMatchesCandidate,
  liveEvalMeetsLaunchBar,
  parseLiveEvalEvidence,
} from "../lib/launch/evalEvidence";
import { BUNDLED_LIVE_EVAL_EVIDENCE } from "../lib/launch/liveEvalBaseline";
import { loadPromptForMode } from "../lib/backend/prompts";
import { checkScoreRange } from "../lib/evals/contract-checks";

function buildRun(executionMode: "dry_run" | "live"): EvalRunOutput {
  return {
    metadata: {
      run_id: `test_${executionMode}`,
      timestamp: "2026-07-09T00:00:00.000Z",
      execution_mode: executionMode,
      model: "test-model",
      temperature: 0,
      top_p: null,
      reasoning_effort: "low",
      max_completion_tokens: null,
      prompt_version_hash: "test",
      resume_prompt_sha256: "a".repeat(64),
      resume_ideas_prompt_sha256: "b".repeat(64),
      contract_version: "v2",
      tier: "golden",
      budget_usd: 0,
      actual_cost_usd: 0,
      token_usage: { prompt_tokens: 0, completion_tokens: 0 },
      pricing_basis: executionMode === "dry_run" ? "none" : "published_standard_token_rates",
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
assert.doesNotMatch(dryRunReport, /Run ID:|Timestamp:/);
assert.equal(
  generateMarkdownReport({
    ...buildRun("dry_run"),
    metadata: {
      ...buildRun("dry_run").metadata,
      run_id: "a_different_run",
      timestamp: "2099-12-31T23:59:59.999Z",
    },
  }),
  dryRunReport,
  "fixture-validation evidence must be deterministic across run times",
);

const liveReport = generateMarkdownReport(buildRun("live"));
assert.match(liveReport, /^# PromptOps Live Eval Report/m);
assert.match(liveReport, /Live model evaluation/);
assert.match(liveReport, /Run ID:\*\* test_live/);
assert.match(liveReport, /Timestamp:\*\* 2026-07-09T00:00:00\.000Z/);
assert.match(liveReport, /Reasoning effort:\*\* low/);
assert.match(liveReport, /fixture_1 \(score: 82\)/);
assert.match(liveReport, /Resume prompt SHA-256:\*\* a{64}/);
assert.match(liveReport, /Resume ideas prompt SHA-256:\*\* b{64}/);

const passingEvidence = parseLiveEvalEvidence(generateMarkdownReport({
  ...buildRun("live"),
  summary: { total: 8, passed: 8, warned: 0, failed: 0 },
  results: Array.from({ length: 8 }, (_, index) => ({
    fixture_id: `fixture_${index + 1}`,
    status: "PASS" as const,
    errors: [],
    warnings: [],
    actual_score: 82,
    expected_range: [75, 90] as [number, number],
  })),
}));
assert.equal(passingEvidence?.total, 8);
assert.equal(liveEvalMeetsLaunchBar(passingEvidence), true);

const replayEvidence = parseLiveEvalEvidence(generateMarkdownReport({
  ...buildRun("live"),
  metadata: {
    ...buildRun("live").metadata,
    validation_mode: "saved_output_replay",
    validation_timestamp: "2026-08-08T23:30:00.000Z",
    source_run_sha256: "c".repeat(64),
  },
  summary: { total: 8, passed: 8, warned: 0, failed: 0 },
  results: [],
}));
assert.equal(replayEvidence?.validationMode, "saved_output_replay");
assert.equal(replayEvidence?.sourceRunSha256, "c".repeat(64));
assert.equal(liveEvalMeetsLaunchBar(replayEvidence), true);
assert.equal(liveEvalMeetsLaunchBar({ ...replayEvidence!, sourceRunSha256: undefined }), false);

const failingEvidence = parseLiveEvalEvidence(generateMarkdownReport({
  ...buildRun("live"),
  summary: { total: 8, passed: 7, warned: 0, failed: 1 },
  results: [],
}));
assert.equal(liveEvalMeetsLaunchBar(failingEvidence), false);
assert.equal(parseLiveEvalEvidence(dryRunReport), null);
assert.equal(
  checkScoreRange(68, { min: 74, max: 88 }).some((result) => result.code === "E_SCORE_EXTREME"),
  false,
  "score severity must use distance to the nearest range boundary, not the midpoint",
);
assert.equal(
  checkScoreRange(61, { min: 74, max: 88 }).some((result) => result.code === "E_SCORE_EXTREME"),
  true,
  "a score more than twelve points outside the range must still fail",
);

async function runCandidateBindingTests() {
  const resumePrompt = await loadPromptForMode("resume");
  const resumeIdeasPrompt = await loadPromptForMode("resume_ideas");
  assert.equal(liveEvalMatchesCandidate(BUNDLED_LIVE_EVAL_EVIDENCE, {
    model: "gpt-5.6-luna",
    reasoningEffort: "low",
    resumePrompt,
    resumeIdeasPrompt,
  }), true);
  assert.equal(liveEvalMatchesCandidate(BUNDLED_LIVE_EVAL_EVIDENCE, {
    model: "gpt-4o-mini",
    reasoningEffort: "low",
    resumePrompt,
    resumeIdeasPrompt,
  }), false);
  assert.equal(liveEvalMatchesCandidate(BUNDLED_LIVE_EVAL_EVIDENCE, {
    model: "gpt-5.6-luna",
    reasoningEffort: "medium",
    resumePrompt,
    resumeIdeasPrompt,
  }), false);
  assert.equal(liveEvalMatchesCandidate(BUNDLED_LIVE_EVAL_EVIDENCE, {
    model: "gpt-5.6-luna",
    reasoningEffort: "low",
    resumePrompt: `${resumePrompt}\nchanged`,
    resumeIdeasPrompt,
  }), false);
}

runCandidateBindingTests()
  .then(() => console.log("eval-report tests passed"))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
