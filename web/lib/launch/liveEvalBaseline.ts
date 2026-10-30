import type { LiveEvalEvidence } from "./evalEvidence";

// Ten original synthetic outputs replayed on f9d3903813c2449b205ec39baec9f344650006e5.
// The source hash binds the unchanged live run; fresh Operations proof is separate.
export const BUNDLED_LIVE_EVAL_EVIDENCE: LiveEvalEvidence = Object.freeze({
  runId: "eval_1793394208092_replay",
  model: "gpt-6.1-terra",
  reasoningEffort: "medium",
  validationMode: "saved_output_replay",
  "sourceRunSha256": "b6e20c5669bbeb80b7b612993339a6a38a8c033813e2bb60a2502fab4bb41111",
  "resumePromptSha256": "67c7257730ac5b53f3465454d7bc6831e83f07d50255435e7cafbc09d1f8fa86",
  "resumeIdeasPromptSha256": "6d90925e63aae15476712f92af5ffbdf4e684feec413711e14d6dba7201b6fc7",
  total: 10,
  passed: 10,
  warned: 0,
  failed: 0,
});
