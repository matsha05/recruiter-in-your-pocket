import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { getScoreLabel } from "../lib/score-utils";
import { reconcileReport } from "../lib/reports/report-integrity";
import { parseReportFeedback } from "../lib/reports/report-feedback";
import { isNothingCritical } from "../lib/reports/report-presentation";
import { resolveRewriteCopyPolicy } from "../lib/reports/report-presentation";
import {
  composeRevisedLine,
  liftQuestions,
  liftSourceLine,
  liftState,
  marginNoteFromFix,
  revisedLinePolicy,
  type LiftAnswer,
} from "../lib/reports/revised-line";
import { SCORE_BANDS, scoreBandFor } from "../lib/reports/score-band";

// ============================================
// Questions and margin notes are trimmed model text, never new prose
// ============================================

assert.deepEqual(liftQuestions(["Which Linton report or statement did you prepare, and who used it?"]),
  ["Which Linton report or statement did you prepare?", "Who used it?"]);
assert.deepEqual(liftQuestions(["Did you use any checks when updating Greenfield records, and if so, what were they?"]),
  ["Did you use any checks when updating Greenfield records, and if so, what were they?"], "a conditional second half stays joined");
assert.deepEqual(liftQuestions(["How many people did you onboard, on which teams, and over what period?"]),
  ["How many people did you onboard, on which teams, and over what period?"], "a list inside one question stays one question");
assert.equal(liftQuestions(["A?", "B?", "C?", "D?"]).length, 3, "at most three questions");
assert.deepEqual(liftQuestions(["Who used it?", "who used it?"]), ["Who used it?"], "no repeats");
assert.equal(marginNoteFromFix("In the BrightWave recruitment bullet, specify the hiring and onboarding tasks you handled for the teams."),
  "Specify the hiring and onboarding tasks you handled for the teams.");
assert.equal(marginNoteFromFix("Explain how onboarding improved productivity."), "Explain how onboarding improved productivity.");

// ============================================
// The revised line on real production-prompt outputs
// ============================================

const outputs = JSON.parse(fs.readFileSync(path.join(process.cwd(), "tests/fixtures/report-integrity/live-outputs-83b2a2d1.json"), "utf8"));
const golden = path.join(process.cwd(), "..", "tests/resumes/golden");
const goldenFiles = fs.readdirSync(golden);
// Answers a candidate might type (fictional, written for this test).
const answers: Record<string, string[]> = {
  synth_data_scientist_senior_elite_1: ["compared 30-day readmissions at 12 partner hospitals against the year before launch"],
  synth_marketing_manager_vp_elite_1: ["moved launch reviews to a single go/no-go gate run by product marketing", "success meant hitting the revenue target within 90 days"],
  synth_software_engineer_mid_strong_1: ["moved the billing service off the monolith", "wrote the data migration scripts and ran the cutover"],
  synth_ux_designer_director_strong_1: ["a color-contrast standard for all text", "product teams checked it in design review before handoff"],
  synth_sales_executive_mid_foundation_1: ["built the pricing pages for 12 enterprise proposals"],
  synth_hr_manager_director_foundation_1: ["screened candidates for engineering and sales and ran onboarding for 40 new hires a year"],
  synth_finance_analyst_senior_weak_1: ["monthly P&L and cash-flow statements", "used by the CFO and 6 regional directors"],
  synth_operations_manager_entry_weak_1: ["delivery logs and weekly stock reports", "the warehouse supervisor and store managers"],
  synth_project_manager_vp_strong_1: ["a vendor delay on the payments integration", "added a second vendor and a two-week buffer"],
  synth_product_manager_entry_elite_1: ["users skipped setup because it asked for data they didn't have", "made setup skippable the top backlog item"],
};

let unchangedRefused = 0;
for (const run of outputs.runs) {
  const file = goldenFiles.find((name) => name.startsWith(run.fixture_id.replace(/_1$/u, "_")));
  assert.ok(file, `${run.fixture_id}: golden resume`);
  const resume = fs.readFileSync(path.join(golden, file!), "utf8");
  const integrity = reconcileReport(run.report);
  for (const fix of integrity.report.top_fixes || []) {
    const excerpt = typeof fix.evidence === "string" ? fix.evidence : fix.evidence?.excerpt || "";
    const original = liftSourceLine(excerpt, resume);
    assert.ok(original.full, `${run.fixture_id}: every fix line resolves to one resume line`);
    if (!resolveRewriteCopyPolicy({ sourceText: resume, original: excerpt, draft: original.line }).copyable) unchangedRefused += 1;
  }

  const miss = integrity.report.top_fixes![0];
  const excerpt = typeof miss.evidence === "string" ? miss.evidence : miss.evidence!.excerpt!;
  const asked = liftQuestions(integrity.fixQuestions[0]);
  const typed = answers[run.fixture_id];
  const given: LiftAnswer[] = (asked.length ? asked : ["open"]).map((_, index) => (
    typed[index] ? { kind: "answered", value: typed[index] } : { kind: "unknown" }
  ));
  for (const [label, text] of [["with the resume", resume], ["saved, without it", undefined]] as const) {
    const source = liftSourceLine(excerpt, text);
    const line = composeRevisedLine(source.line, given)!;
    assert.ok(line.startsWith(source.line.replace(/[.;,:\s]+$/u, "")), `${run.fixture_id} ${label}: the line keeps the original word for word`);
    const policy = revisedLinePolicy({ resumeText: text, excerpt, line, answers: given });
    assert.ok(policy.copyable, `${run.fixture_id} ${label}: the composed line passes the guard (${JSON.stringify(policy.issues)})`);
    assert.ok(policy.composed);
  }
  const line = composeRevisedLine(liftSourceLine(excerpt, resume).line, given);
  assert.notEqual(liftState(given, line), "open", `${run.fixture_id}: answering moves the Critical Miss out of "open"`);
}
// The relationship waiver exists because the guard refuses some real lines even unchanged.
assert.ok(unchangedRefused > 0, "some unchanged fix lines fail the relationship check, which is why the exact composition waives it");

// ============================================
// Edits may reword; new facts must arrive through an answer
// ============================================

const hrResume = fs.readFileSync(path.join(golden, goldenFiles.find((name) => name.startsWith("synth_hr_manager_director_foundation_"))!), "utf8");
const hrExcerpt = "- Helped oversee recruitment efforts for various teams, contributing to talent acquisition and onboarding processes.";
const hrAnswers: LiftAnswer[] = [{ kind: "answered", value: "screened candidates for engineering and sales and ran onboarding for 40 new hires a year" }];
const edit = (line: string) => revisedLinePolicy({ resumeText: hrResume, excerpt: hrExcerpt, line, answers: hrAnswers });
assert.ok(edit("Helped oversee recruitment for engineering and sales, screening candidates and running onboarding for 40 new hires a year.").copyable,
  "rewording the candidate's own facts is allowed");
assert.deepEqual(edit("Led recruitment for engineering and sales, screening candidates and running onboarding for 40 new hires a year.").newFacts, ["lead"],
  "upgrading 'helped oversee' to 'led' needs an answer first");
const invented = edit("Helped oversee recruitment for engineering and sales, screening candidates and running onboarding for 55 new hires a year at Google.");
assert.equal(invented.copyable, false);
assert.deepEqual(invented.newFacts, ["55", "Google"], "a new number or name is named back to the candidate");
assert.equal(revisedLinePolicy({ resumeText: hrResume, excerpt: hrExcerpt, line: "", answers: [] }).copyable, false, "an empty line is never copyable");

// ============================================
// States
// ============================================

const open: LiftAnswer = { kind: "open" };
const said = (value: string): LiftAnswer => ({ kind: "answered", value });
assert.equal(liftState([]), "open");
assert.equal(liftState([open]), "open");
assert.equal(liftState([{ kind: "unknown" }]), "unknown");
assert.equal(liftState([{ kind: "not_mine" }, { kind: "not_mine" }]), "not_mine");
assert.equal(liftState([said("delivery logs"), { kind: "not_mine" }], "Duties included maintaining records: delivery logs."), "addressed",
  "a question the candidate didn't do doesn't hold the line back");
assert.equal(liftState([said("delivery logs"), { kind: "unknown" }], "Duties included maintaining records: delivery logs."), "partly");
assert.equal(liftState([said("delivery logs")], "Duties included maintaining records."), "open", "an answer edited back out of the line doesn't count");
assert.equal(composeRevisedLine("Did the thing.", [{ kind: "unknown" }]), undefined, "no answers, no revised line");
assert.equal(composeRevisedLine("- Did the thing.", [said("for 3 teams."), said("weekly")]), "- Did the thing: for 3 teams; weekly.");

// ============================================
// Score bands (D5) and "Nothing critical" (D2)
// ============================================

for (const score of [0, 40, 59, 60, 69, 70, 84, 85, 92, 99]) {
  assert.equal(scoreBandFor(score).name, getScoreLabel(score), `band for ${score} matches the validator's score_label`);
}
assert.equal(new Set(SCORE_BANDS.map((band) => band.anchor)).size, SCORE_BANDS.length, "each band has its own anchor");
assert.equal(isNothingCritical({ top_fixes: [{ fix: "Optional.", impact_level: "low" }] }), true);
assert.equal(isNothingCritical({ top_fixes: [{ fix: "Fix it.", impact_level: "high" }] }), false);
assert.equal(isNothingCritical({ top_fixes: [] }), false);

// ============================================
// Critical Miss feedback keeps the answer and the model's wording only
// ============================================

assert.deepEqual(parseReportFeedback({ criticalMiss: "  Name the  records. ", right: false, note: " Gap mattered more. ", nothingCritical: true }),
  { reportId: undefined, criticalMiss: "Name the records.", nothingCritical: true, right: false, note: "Gap mattered more." });
assert.equal(parseReportFeedback({ criticalMiss: "x", right: "yes" }), null, "the answer must be a boolean");
assert.equal(parseReportFeedback({ criticalMiss: "", right: true }), null);
assert.equal(parseReportFeedback({ criticalMiss: "x", right: true, reportId: "not-a-uuid" }), null);
assert.equal(parseReportFeedback({ criticalMiss: "x", right: true, note: "y".repeat(601) }), null);
assert.equal(Object.keys(parseReportFeedback({ criticalMiss: "x", right: true, line: "resume text" })!).includes("line"), false,
  "a quoted resume line sent by a client is dropped");

console.log("revised line tests passed");
