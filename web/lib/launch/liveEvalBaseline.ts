import type { LiveEvalEvidence } from "./evalEvidence";

// November 7 upgrades3 outputs, replayed without new calls on November 10.
// Only the 28 resume-only cases with pre-existing exact-input calibration enter this gate.
// All 59 report drafts, four saved repairs, and the oversized refusal are receipted separately.
export const BUNDLED_LIVE_EVAL_EVIDENCE: LiveEvalEvidence = Object.freeze({
  runId: "worklist_upgrades3_2026-11-07_replay_2026-11-10",
  model: "gpt-6.1-terra",
  reasoningEffort: "medium",
  validationMode: "saved_output_replay",
  "sourceRunSha256": "9db5042467c2e33ba4eb221f1b3a25ee73e589b3797c76da7481d539e10df585",
  "resumePromptSha256": "15dff271c2d212b2504350e8d09deec38785cfa3e7ee269f5f8154593e015688",
  "resumeIdeasPromptSha256": "6d90925e63aae15476712f92af5ffbdf4e684feec413711e14d6dba7201b6fc7",
  total: 28,
  passed: 28,
  warned: 0,
  failed: 0,
});
