import type { LiveEvalEvidence } from "./evalEvidence";

// The ten synthetic golden fixtures on the worklist prompt (resume_v3.txt, with the posting's covered
// requirements), generated live on November 11, 2026 and replayed through the validator and checks. It is the
// second run of that prompt: the first had one fixture fail on a garbled quote, which four retests of that
// fixture did not repeat (docs/audits/2026-11-posting-requirements.md).
export const BUNDLED_LIVE_EVAL_EVIDENCE: LiveEvalEvidence = Object.freeze({
  runId: "eval_1794430089297_replay",
  model: "gpt-6.1-terra",
  reasoningEffort: "medium",
  validationMode: "saved_output_replay",
  "sourceRunSha256": "88a134e3d94e3923090007f6eb7c87564e323dc982f5e2b9695601b33f4798f9",
  "resumePromptSha256": "758861acede37f06fbbd892e6c3084b98d8c45be3963b8b393e1d05896ca26d8",
  "resumeIdeasPromptSha256": "6d90925e63aae15476712f92af5ffbdf4e684feec413711e14d6dba7201b6fc7",
  total: 10,
  passed: 9,
  warned: 1,
  failed: 0,
});
