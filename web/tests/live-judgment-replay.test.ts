import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { classifyRefusal, outcomeCounts, refusalsByDetector, replaySavedRuns, type ReplayResult } from "../lib/evals/live-judgment-replay";

/**
 * The judgment wave's replay (docs/audits/2026-11-judgment-wave.md): the live judgment run's 102 saved
 * outputs through the current validators and severity merge, no model call. These assertions are the
 * audit's after numbers; the before numbers are the committed replay-before.json.
 */
const auditDir = path.resolve(process.cwd(), "../docs/audits/2026-11-live-judgment");
const before = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), "../docs/audits/2026-11-judgment-wave/replay-before.json"), "utf8")) as ReplayResult[];
const results = replaySavedRuns(auditDir);
const byStem = new Map(results.map((result) => [result.stem, result]));
const run = (stem: string) => {
  const result = byStem.get(stem);
  assert.ok(result, `saved run ${stem}`);
  return result!;
};

assert.equal(results.length, 102, "every saved run replays");
assert.equal(before.length, 102);

// The classifier reads the validator's messages.
assert.equal(classifyRefusal("The model response failed the evidence grounding contract at section_review.Summary: the source contains this section; review its existing content; do not report it absent.").detector, "summary_presence");
assert.equal(classifyRefusal("The model response failed the evidence grounding contract: contradicted positive source evidence at section_review.Summary.missing.").detector, "summary_contradiction");
assert.deepEqual(classifyRefusal("The model response failed the evidence grounding contract at gaps[0] unsupported narrative facts: RN, BLS.").facts, ["RN", "BLS"]);
assert.equal(classifyRefusal("The model response used ambiguous source evidence: top_fixes[0].evidence.excerpt.").detector, "ambiguous_excerpt");

// Before: 39 first drafts refused, 11 runs never shipped. After: every run that reached the model ships.
const beforeOutcomes = outcomeCounts(before);
assert.equal(beforeOutcomes.never_shipped, 11);
assert.equal(Object.values(refusalsByDetector(before, "first_draft")).reduce((a, b) => a + b, 0), 39);
const after = outcomeCounts(results);
assert.equal(after.never_shipped ?? 0, 0, "no saved run is left without a report");
assert.equal(after.regression_no_repair ?? 0, 0, "no first draft that shipped before is refused now");
assert.equal(after.request_refused, 1, "the fifteen-page CV is still refused before any model call");
const firstDraftRefusals = Object.values(refusalsByDetector(results, "first_draft")).reduce((a, b) => a + b, 0);
assert.ok(firstDraftRefusals <= 14, `first-draft refusals ${firstDraftRefusals} (the audit lists the fourteen that remain and why)`);
assert.equal(Object.values(refusalsByDetector(results, "repaired_draft")).reduce((a, b) => a + b, 0), 0, "every saved repair that is still needed ships");

// 1. The summary detector: the student resume and the academic CV ship on their first drafts.
for (const stem of ["h2_thin_resume__run1", "h2_thin_resume__run2", "h2_thin_resume__run3", "h4b_academic_cv_under_cap__run1", "h4b_academic_cv_under_cap__run2", "h4b_academic_cv_under_cap__run3"]) {
  assert.equal(run(stem).outcome, "shipped_first_draft", stem);
}
assert.equal(run("h2_thin_resume__run1").fixes[0].excerpt, "- Built a dashboard in Tableau for the marketing team", "the student's Critical Miss is the dashboard line, as the drafts had it");
// The COO resume's unlabeled opener is a summary, so a draft that calls it absent is still refused and repaired.
assert.equal(run("b12_coo_executive_two_page__run2").first_draft?.refusal?.detector, "summary_contradiction");
assert.equal(run("b12_coo_executive_two_page__run2").outcome, "shipped_after_repair");

// 3. The honest mismatch reaches the Verdict and the posting block.
const mismatch = run("h5_mismatched_posting__run1");
assert.equal(mismatch.outcome, "shipped_first_draft");
assert.match(mismatch.verdict ?? "", /nursing job calls for a different set of qualifications that aren't shown here/u);
assert.ok((mismatch.jd_missing?.length ?? 0) >= 6, `the missing-requirements list survives: ${JSON.stringify(mismatch.jd_missing)}`);
assert.ok(mismatch.jd_missing?.some((item) => /RN license/u.test(item)) && mismatch.jd_missing?.some((item) => /BLS/u.test(item)));
assert.equal(run("h5_mismatched_posting__run2").outcome, "shipped_first_draft");
assert.match(run("h5_mismatched_posting__run2").verdict ?? "", /nursing|clinical|RN/u);
// Run 3 claimed EHR documentation as strongly aligned on a resume with no EHR; that invention is still refused, and the saved repair ships.
assert.equal(run("h5_mismatched_posting__run3").first_draft?.refusal?.path, "job_alignment.strongly_aligned[1]");
assert.deepEqual(run("h5_mismatched_posting__run3").first_draft?.refusal?.facts, ["EHR"]);
assert.equal(run("h5_mismatched_posting__run3").outcome, "shipped_after_repair");

// 4. The first fix moves: a gap or a title above the work leads when Fix 1 was a line edit on a duty line.
const led: Record<string, string> = {
  b10_it_support_recent_grad__run1: "no_recent_work", b10_it_support_recent_grad__run2: "no_recent_work",
  b34_bank_branch_manager_gap__run1: "no_recent_work", b34_bank_branch_manager_gap__run2: "no_recent_work",
  b35_marketing_coordinator_gap__run1: "no_recent_work", b35_marketing_coordinator_gap__run2: "no_recent_work",
  b36_product_designer_unrelated__run1: "no_recent_work", b36_product_designer_unrelated__run2: "no_recent_work",
  b37_marketing_director_bad__run1: "no_recent_work", b37_marketing_director_bad__run2: "no_recent_work",
  h1_bad_resume__run1: "no_recent_work",
};
for (const [stem, kind] of Object.entries(led)) {
  const result = run(stem);
  const record = JSON.parse(fs.readFileSync(path.join(auditDir, "outputs", `${stem}.json`), "utf8"));
  const draft = result.outcome === "shipped_first_draft" ? record.model_output : record.model_output_repaired;
  assert.equal(result.severity?.led, kind, stem);
  assert.equal(result.fixes[0].critical, true);
  assert.equal(result.fixes[1].fix, draft.top_fixes[0].fix, `${stem}: the model's first fix is the second Critical Miss, unchanged`);
  assert.equal(result.fixes[1].critical, true);
  assert.ok(result.critical_misses.length >= 2);
  const previous = before.find((item) => item.stem === stem)!;
  assert.equal(previous.fixes[0].fix, previous.outcome === "shipped_first_draft" ? record.model_output.top_fixes[0].fix : record.model_output_repaired.top_fixes[0].fix,
    `${stem}: before, the model's line edit led`);
}
assert.match(run("b34_bank_branch_manager_gap__run1").fixes[0].fix, /^Add one dated line covering December 2024 to today/u);
assert.equal(run("h1_bad_resume__run1").fixes[0].fix, "Add one dated line covering November 2021 to today, and include recent marketing work or study if true.");
// The rule does not apply when Fix 1 is itself structural, or when the addition is another kind.
for (const stem of ["b11_recent_grad_bad__run1", "b11_recent_grad_bad__run2"]) {
  assert.equal(run(stem).severity?.led, null, `${stem}: Fix 1 is on the summary`);
  assert.deepEqual(run(stem).severity?.added, ["no_recent_work", "no_evidence_latest_role"]);
}
assert.equal(run("b16_career_changer_bad__run1").severity?.led, null, "no_target_role does not lead");
assert.equal(run("b33_nonprofit_program_manager__run1").severity?.led ?? null, null);
assert.equal(results.filter((result) => result.severity?.led).length, Object.keys(led).length, "exactly these runs lead with a structural miss");

// Nothing that shipped before ships with a different Verdict unless its first draft now ships in place of its repair.
for (const previous of before) {
  const next = run(previous.stem);
  if (previous.outcome === "shipped_first_draft") {
    assert.equal(next.outcome, "shipped_first_draft", previous.stem);
    assert.equal(next.verdict, previous.verdict, `${previous.stem}: the Verdict is the same text`);
  }
}

console.log("live judgment replay tests passed");
