import type { LiveEvalEvidence } from "./evalEvidence";

// The full golden tier (23 fixtures) on the worklist prompt (resume_v3.txt) with the must-have rule of November 12,
// 2026 (what a posting's table may list), generated live that day in one run and replayed through the validator
// and checks: 21 pass, 2 warnings, 0 failures.
//
// Read this number with its history. As generated the run was 20 pass and 3 warnings, 87%, under the 90% this
// evidence must show, and it was recorded as not meeting the bar. One of the three warnings was the repeated-clause
// check flagging "year in your" in a sentence that names two places a date appears; that check was corrected the
// same day for its own reasons (PR 142: a clause cut off at a function word is not a repeated phrase), and the
// same saved run replays at 21 pass. The run was not generated again. The two warnings left are a write-up that
// says "people you managed" twice and a card whose fix has no blank to fill.
//
// Before this, the evidence was a run of the ten synthetic fixtures alone on the same prompt (10 pass; receipt in
// tests/fixtures/results/summary_golden_synthetic_must_have_2026-11-12.md). None of these fixtures carries a
// posting; the posting lists were read and judged on thirteen pairs (docs/audits/2026-11-posting-tailoring.md).
export const BUNDLED_LIVE_EVAL_EVIDENCE: LiveEvalEvidence = Object.freeze({
  runId: "eval_1794518962413_replay",
  model: "gpt-6.1-terra",
  reasoningEffort: "medium",
  validationMode: "saved_output_replay",
  "sourceRunSha256": "3a2f4ec3f0deb24daa0d73802cd7fe0ea18bfd27c40c734a493c70b0944174fe",
  "resumePromptSha256": "22a90f2273de5ce42637d4e17bd153524479681571b5471df18782f6b1bb6e6c",
  "resumeIdeasPromptSha256": "6d90925e63aae15476712f92af5ffbdf4e684feec413711e14d6dba7201b6fc7",
  total: 23,
  passed: 21,
  warned: 2,
  failed: 0,
});
