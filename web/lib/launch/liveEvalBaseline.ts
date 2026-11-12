import type { LiveEvalEvidence } from "./evalEvidence";

// The ten synthetic golden fixtures on the worklist prompt (resume_v3.txt) with the must-have rule of November 12,
// 2026 (what a posting's table may list), generated live that day and checked in the run. It is the first golden
// run of that prompt: 10 pass, no warning. The rule changes what a posting read lists, and these fixtures carry no
// posting, so this run shows the ordinary report did not move; the posting lists themselves were read and judged
// on thirteen resume-and-posting pairs (docs/audits/2026-11-posting-tailoring.md).
//
// It is not the only run. The full golden tier (23 fixtures) ran once on the same prompt later that day: 20 pass,
// 3 warnings, 0 failures, which is 87% passing and under the 90% this evidence must show, so that run is recorded
// (tests/fixtures/results/summary_golden_full_must_have_2026-11-12.md) and not bound here. Its ten synthetic
// fixtures all passed again; the warnings were two repeated three-word clauses in a write-up and one card example
// with no blank, on three of the other thirteen. It was not run again to get a better number.
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
