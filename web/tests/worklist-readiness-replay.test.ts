import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { assertNoReplayErrors, replayWorklistReadiness, verifySavedRunProvenance, WORKLIST_REPLAY_RECEIPT } from "../lib/evals/worklist-readiness-replay";
import { BUNDLED_LIVE_EVAL_EVIDENCE } from "../lib/launch/liveEvalBaseline";
import { liveEvalMatchesCandidate } from "../lib/launch/evalEvidence";

const root = path.resolve(__dirname, "../..");
const receipt = replayWorklistReadiness(root);
assert.deepEqual(receipt, JSON.parse(fs.readFileSync(path.join(root, WORKLIST_REPLAY_RECEIPT), "utf8")),
  "source bytes, calibration, validator/check code, or replay outcomes changed; investigate and record a new replay");
assert.deepEqual(receipt.summary, { total: 28, passed: 28, warned: 0, failed: 0 });
assert.equal(receipt.uncalibrated, 31, "cases without a predefined range for their complete input must not enter the passing cohort");
assert.ok(receipt.results.filter((result) => result.jobPath).every((result) => !result.fixtureId),
  "resume-only calibration must not qualify a resume-plus-posting input");
assert.equal(receipt.requestRefused, 1, "a request refused before a call is not model-quality evidence");
assert.equal(receipt.repaired, 4, "replay must preserve original drafts and use the actual saved repairs");
assert.equal(receipt.newProviderCalls, 0);
assert.throws(() => assertNoReplayErrors([{ caseId: "uncalibrated_regression", errors: [{ message: "Invented fact" }] }]),
  "a failure outside the calibrated denominator must still block reconciliation");
assert.equal(new Set(receipt.results.filter((result) => result.fixtureId).map((result) => result.resumeSha256)).size, 28);
assert.equal(receipt.results.filter((result) => result.status === "UNCALIBRATED" && result.warnings.length > 0).length, 2,
  "the two no-blank warnings outside the calibrated cohort must remain visible");
assert.equal(receipt.sourceRunSha256, BUNDLED_LIVE_EVAL_EVIDENCE.sourceRunSha256);
assert.equal(receipt.summary.total, BUNDLED_LIVE_EVAL_EVIDENCE.total);
assert.equal(receipt.summary.passed, BUNDLED_LIVE_EVAL_EVIDENCE.passed);
assert.equal(receipt.summary.warned, BUNDLED_LIVE_EVAL_EVIDENCE.warned);
assert.equal(receipt.summary.failed, BUNDLED_LIVE_EVAL_EVIDENCE.failed);

const report = receipt.results.find((result) => result.fixtureId)!;
const record = JSON.parse(fs.readFileSync(path.join(root, report.source), "utf8"));
const source = { resumeText: fs.readFileSync(path.join(root, report.resumePath), "utf8"),
  promptSha256: receipt.resumePromptSha256, model: receipt.model, reasoningEffort: receipt.reasoningEffort };
for (const changed of [
  { ...record, resume_sha256: "0".repeat(64) },
  { ...record, resume_prompt_sha256: "0".repeat(64) },
  { ...record, model: "another-model" },
  { ...record, reasoning_effort: "low" },
  { ...record, calls: record.calls.map((call: object) => ({ ...call, model: "another-model" })) },
]) assert.throws(() => verifySavedRunProvenance(changed, source), "mismatched provenance must fail closed");

const candidate = { model: receipt.model, reasoningEffort: receipt.reasoningEffort,
  resumePrompt: fs.readFileSync(path.join(root, "web/prompts/resume_v3.txt"), "utf8").trim(),
  resumeIdeasPrompt: fs.readFileSync(path.join(root, "web/prompts/resume_ideas_v1.txt"), "utf8").trim() };
assert.equal(liveEvalMatchesCandidate(BUNDLED_LIVE_EVAL_EVIDENCE, candidate), true);
assert.equal(liveEvalMatchesCandidate(BUNDLED_LIVE_EVAL_EVIDENCE, { ...candidate,
  resumePrompt: fs.readFileSync(path.join(root, "web/prompts/resume_v2.txt"), "utf8").trim() }), false,
"v3 evidence must not approve a rollback to a different prompt");
console.log("worklist readiness provenance and offline replay tests passed");
