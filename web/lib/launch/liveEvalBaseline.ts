import type { LiveEvalEvidence } from "./evalEvidence";

// All 23 golden fixtures generated on 1ddcc7b5ceac7023b2d21333af5de189b06e7260 and replayed
// through 0766adc1. The source hash binds the unchanged live run.
export const BUNDLED_LIVE_EVAL_EVIDENCE: LiveEvalEvidence = Object.freeze({
  runId: "eval_1793560808592_replay",
  model: "gpt-6.1-terra",
  reasoningEffort: "medium",
  validationMode: "saved_output_replay",
  "sourceRunSha256": "d72a2dbe77a0bff34afc7c44a3dc9ae10cd6df98f479c135e5035fe8bdbd7069",
  "resumePromptSha256": "55bee48bf96439b3171f1ccac5a8ca79cf1bdb6a003a3ef5f769e2c54f2b45c4",
  "resumeIdeasPromptSha256": "6d90925e63aae15476712f92af5ffbdf4e684feec413711e14d6dba7201b6fc7",
  total: 23,
  passed: 22,
  warned: 1,
  failed: 0,
});
