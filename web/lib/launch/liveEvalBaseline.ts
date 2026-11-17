import type { LiveEvalEvidence } from "./evalEvidence";

// The ten synthetic golden fixtures on the worklist prompt (resume_v3.txt) with Clear and specific held to the cards
// in the prompt as well as in code (November 17, 2026: more than three cards that need work never scores above 84),
// generated live that day in one run and checked in the run itself: 9 pass, 1 warning, 0 failures. The warning is a
// card whose fix has no blank to fill.
//
// Read this with its history. Until this change the evidence was the full golden tier (23 fixtures) replayed through
// the validator (eval_1794518962413_replay, 21 pass, 2 warnings). The approved spend for this change covers synthetic
// resumes only, so the evidence narrows to the ten synthetic fixtures; the other thirteen were not generated on this
// prompt. The comparison with the shipped prompt (forty reads of the ten, and posting reads on both prompts) is in
// docs/audits/2026-11-score-reread.md.
export const BUNDLED_LIVE_EVAL_EVIDENCE: LiveEvalEvidence = Object.freeze({
  runId: "eval_1794931009733",
  model: "gpt-6.1-terra",
  reasoningEffort: "medium",
  validationMode: "in_run",
  sourceRunSha256: undefined,
  "resumePromptSha256": "31aaaaa165a693ca738aa2ab774bde8497f256a9472501edc1e12f0debca674d",
  "resumeIdeasPromptSha256": "6d90925e63aae15476712f92af5ffbdf4e684feec413711e14d6dba7201b6fc7",
  total: 10,
  passed: 9,
  warned: 1,
  failed: 0,
});
