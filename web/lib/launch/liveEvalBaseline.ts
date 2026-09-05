import type { LiveEvalEvidence } from "./evalEvidence";

// The original live outputs and targeted replacements are replayed through this
// candidate. The source hash binds the assembled cohort and its source receipts.
export const BUNDLED_LIVE_EVAL_EVIDENCE: LiveEvalEvidence = Object.freeze({
  runId: "eval_1788577888513_targeted_cohort_replay",
  model: "gpt-5.6-terra",
  reasoningEffort: "medium",
  validationMode: "saved_output_replay",
  sourceRunSha256: "245686e38edf51014b54412f47e4c9d4ff6e3c235739190e4cc8d11413399d35",
  resumePromptSha256: "67c7257730ac5b53f3465454d7bc6831e83f07d50255435e7cafbc09d1f8fa86",
  resumeIdeasPromptSha256: "6d90925e63aae15476712f92af5ffbdf4e684feec413711e14d6dba7201b6fc7",
  total: 23,
  passed: 22,
  warned: 1,
  failed: 0,
});
