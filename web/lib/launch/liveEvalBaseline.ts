import type { LiveEvalEvidence } from "./evalEvidence";

// The full golden tier (23 fixtures) on the worklist prompt (resume_v3.txt) with the gap-note rule of November 12,
// 2026, generated live that day and replayed through the validator and checks. It is the first and only golden
// run of that prompt. As generated it was 22 pass with one warning, for a summary card whose example has no blank;
// replayed through the check as corrected the same day (an intro line rewritten from the resume's own facts needs
// no blank, under any of its names) it is 23 pass (docs/audits/2026-11-gap-note.md).
export const BUNDLED_LIVE_EVAL_EVIDENCE: LiveEvalEvidence = Object.freeze({
  runId: "eval_1794508255590_replay",
  model: "gpt-6.1-terra",
  reasoningEffort: "medium",
  validationMode: "saved_output_replay",
  "sourceRunSha256": "842e4a9e6559b4a4c5504463cd309d44eb44cd8aa7cae707e49302d93b3c4c26",
  "resumePromptSha256": "8f4d8d54e1caeeef8ed3be2cc70ebe6d8edd6c38da2c277500002afeab6bd980",
  "resumeIdeasPromptSha256": "6d90925e63aae15476712f92af5ffbdf4e684feec413711e14d6dba7201b6fc7",
  total: 23,
  passed: 23,
  warned: 0,
  failed: 0,
});
