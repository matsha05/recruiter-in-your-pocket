import type { LiveEvalEvidence } from "./evalEvidence";

// Bundled so hosted readiness can verify the same immutable evidence used by CI.
// Any launch model or prompt change must be followed by a fresh live eval and an
// explicit baseline update before the quality gate can pass again.
export const BUNDLED_LIVE_EVAL_EVIDENCE: LiveEvalEvidence = Object.freeze({
  runId: "eval_1786231390293_replay",
  model: "gpt-5.6-luna",
  reasoningEffort: "low",
  validationMode: "saved_output_replay",
  sourceRunSha256: "4071205c5fc6975ed14f43ca052adfab18c139c309d9714eea087b35bca82023",
  resumePromptSha256: "fd910eea3d1a4ebd7c4ae3f0419d6b36f6d799d08c8e52b8a7625dffb964236a",
  resumeIdeasPromptSha256: "6d90925e63aae15476712f92af5ffbdf4e684feec413711e14d6dba7201b6fc7",
  total: 23,
  passed: 22,
  warned: 1,
  failed: 0,
});
