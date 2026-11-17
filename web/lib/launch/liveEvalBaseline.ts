import type { LiveEvalEvidence } from "./evalEvidence";

// The ten synthetic golden fixtures on the worklist prompt (resume_v3.txt) with the role list of November 17, 2026 (a
// second title only for a second direction, never a title the person moved past), on top of the same day's rule that
// Clear and specific holds at most three cards that need work. Generated live that day in one run and checked in the
// run itself: 10 pass, 0 warnings, 0 failures. First run on this prompt; not repeated.
//
// Read this with its history. Earlier the same day the evidence was the same ten fixtures on the three-card prompt
// alone (eval_1794931009733: 9 pass, 1 warning; receipt tests/fixtures/results/summary_golden_synthetic_three_card_2026-11-17.md).
// Before that it was the full golden tier (23 fixtures) replayed through the validator (eval_1794518962413_replay,
// 21 pass, 2 warnings). Approved spend covers synthetic resumes only, so the evidence is the ten synthetic fixtures.
// The role list's own comparison (twenty-two resumes on both prompts) is in docs/audits/2026-11-role-list.md.
export const BUNDLED_LIVE_EVAL_EVIDENCE: LiveEvalEvidence = Object.freeze({
  runId: "eval_1794934554043",
  model: "gpt-6.1-terra",
  reasoningEffort: "medium",
  validationMode: "in_run",
  sourceRunSha256: undefined,
  "resumePromptSha256": "2a237565211b3751de15ed28ec6153d0283469e0a4d8e4c61bbb16bdacb4fc29",
  "resumeIdeasPromptSha256": "6d90925e63aae15476712f92af5ffbdf4e684feec413711e14d6dba7201b6fc7",
  total: 10,
  passed: 10,
  warned: 0,
  failed: 0,
});
