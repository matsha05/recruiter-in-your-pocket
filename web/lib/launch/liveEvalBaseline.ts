import type { LiveEvalEvidence } from "./evalEvidence";

// Ten original synthetic outputs replayed on 09f0b89e3c361f1cc2dcfe5ffaa4ea02eb2d901d.
// The source hash binds the unchanged live run; fresh Operations proof is separate.
export const BUNDLED_LIVE_EVAL_EVIDENCE: LiveEvalEvidence = Object.freeze({
  runId: "eval_1793463473819_replay",
  model: "gpt-6.1-terra",
  reasoningEffort: "medium",
  validationMode: "saved_output_replay",
  "sourceRunSha256": "da5212325f26a0ad3183372e44c83fb59c3a8754bacbe0c240ef6fe3255cc257",
  "resumePromptSha256": "83b2a2d1f9cde086ebb28fc2e0596ed7c58e6c4f905c4f57fe56cc86e9665107",
  "resumeIdeasPromptSha256": "6d90925e63aae15476712f92af5ffbdf4e684feec413711e14d6dba7201b6fc7",
  total: 10,
  passed: 10,
  warned: 0,
  failed: 0,
});
