import type { LiveEvalEvidence } from "./evalEvidence";

// The ten synthetic golden fixtures on the worklist prompt (resume_v3.txt), generated live on
// November 11, 2026 and replayed through the validator, the checks and the score ranges redrawn
// that day for this prompt (docs/audits/2026-11-posting-tailoring.md).
export const BUNDLED_LIVE_EVAL_EVIDENCE: LiveEvalEvidence = Object.freeze({
  runId: "eval_1794413230597_replay",
  model: "gpt-6.1-terra",
  reasoningEffort: "medium",
  validationMode: "saved_output_replay",
  "sourceRunSha256": "8f10d720e75f7049570f639946d600ad984fb16315a6ce383091aba6afb0b6c5",
  "resumePromptSha256": "e122fb00655b92e22574f13af1e038ff8846f6c54459bfa431be988d44f4cdc4",
  "resumeIdeasPromptSha256": "6d90925e63aae15476712f92af5ffbdf4e684feec413711e14d6dba7201b6fc7",
  total: 10,
  passed: 9,
  warned: 1,
  failed: 0,
});
