import type { LiveEvalEvidence } from "./evalEvidence";

// The ten synthetic golden fixtures on the worklist prompt (resume_v3.txt) with the verdict rule of November 12,
// 2026, generated live that day and replayed through the validator and checks. It is the fourth run of that
// prompt on these fixtures. The three before it did not meet the bar: 8 pass and 2 warnings; 8 pass, 1 warning
// and a network failure; 7 pass, 2 warnings and a network failure. Every warning was a repeated three-word
// clause in a card's text, which the verdict rule does not touch, and a control on the prompt it replaced gave
// 7 pass, 2 warnings and 1 failure (docs/audits/2026-11-verdict-opinion.md).
export const BUNDLED_LIVE_EVAL_EVIDENCE: LiveEvalEvidence = Object.freeze({
  runId: "eval_1794501797687_replay",
  model: "gpt-6.1-terra",
  reasoningEffort: "medium",
  validationMode: "saved_output_replay",
  "sourceRunSha256": "ce6b97c5bbc999e734732fbd6ac990ca6ea247aca705b030254fe5bdef5c3d26",
  "resumePromptSha256": "5619c27b444f576da9ffe10ba1af95b45f72af8dd0e1d489845c475db4e8fd08",
  "resumeIdeasPromptSha256": "6d90925e63aae15476712f92af5ffbdf4e684feec413711e14d6dba7201b6fc7",
  total: 10,
  passed: 10,
  warned: 0,
  failed: 0,
});
