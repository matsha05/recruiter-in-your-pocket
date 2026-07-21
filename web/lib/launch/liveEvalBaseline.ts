import type { LiveEvalEvidence } from "./evalEvidence";

// Bundled so hosted readiness can verify the same immutable evidence used by CI.
// Any launch model or prompt change must be followed by a fresh live eval and an
// explicit baseline update before the quality gate can pass again.
export const BUNDLED_LIVE_EVAL_EVIDENCE: LiveEvalEvidence = Object.freeze({
  runId: "eval_1784502145848",
  model: "gpt-5-nano-2025-08-07",
  resumePromptSha256: "4ef8b64d737794eb713cd7466b4b0adc57bb4c46b7d5ab56bdd1bd275e8a3de0",
  resumeIdeasPromptSha256: "6d90925e63aae15476712f92af5ffbdf4e684feec413711e14d6dba7201b6fc7",
  total: 8,
  passed: 8,
  warned: 0,
  failed: 0,
});
