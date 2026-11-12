import type { LiveEvalEvidence } from "./evalEvidence";

// The ten synthetic golden fixtures on the worklist prompt (resume_v3.txt) with the must-have rule of November 12,
// 2026 (what a posting's table may list), generated live that day and checked in the run. It is the first and
// only golden run of that prompt: 10 pass, no warning. The rule changes what a posting read lists, and these
// fixtures carry no posting, so this run shows the ordinary report did not move; the posting lists themselves were
// read and judged on thirteen resume-and-posting pairs (docs/audits/2026-11-posting-tailoring.md). The fixtures that
// are real people's resumes were not run: this session's approved spend covers synthetic resumes only.
export const BUNDLED_LIVE_EVAL_EVIDENCE: LiveEvalEvidence = Object.freeze({
  runId: "eval_1794517130448",
  model: "gpt-6.1-terra",
  reasoningEffort: "medium",
  validationMode: "in_run",
  // Checked in the run itself, so there is no saved run to name; the summary's parser carries the key all the same.
  sourceRunSha256: undefined,
  "resumePromptSha256": "22a90f2273de5ce42637d4e17bd153524479681571b5471df18782f6b1bb6e6c",
  "resumeIdeasPromptSha256": "6d90925e63aae15476712f92af5ffbdf4e684feec413711e14d6dba7201b6fc7",
  total: 10,
  passed: 10,
  warned: 0,
  failed: 0,
});
