import type { LiveEvalEvidence } from "./evalEvidence";

// Bundled so hosted readiness can verify the same immutable evidence used by CI.
// Any launch model or prompt change must be followed by a fresh live eval and an
// explicit baseline update before the quality gate can pass again.
export const BUNDLED_LIVE_EVAL_EVIDENCE: LiveEvalEvidence = Object.freeze({
  runId: "eval_1785271781375",
  model: "gpt-5.6-luna",
  resumePromptSha256: "dcfecbf6ad919950f69d6a12d8e0db3a46d3268a836c22771cbd5b425312a950",
  resumeIdeasPromptSha256: "6d90925e63aae15476712f92af5ffbdf4e684feec413711e14d6dba7201b6fc7",
  total: 23,
  passed: 22,
  warned: 1,
  failed: 0,
});
