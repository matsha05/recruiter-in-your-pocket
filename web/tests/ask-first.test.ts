/**
 * Ask-first (Matt, Nov 5, 2026): the not-ready page's questions come before the report, and the report
 * is written again from the resume with the answers in it. Checked on Kevin's saved production output
 * (tests/fixtures/report-integrity, run 10) and his golden resume.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  ASK_FIRST_ADDED_HEADING,
  ASK_FIRST_MAX_QUESTIONS,
  askFirstOffered,
  askFirstPlaceholder,
  buildAskFirstQuestions,
  composeAskFirstResume,
  isAskFirstEnabled,
  reportToneOf,
} from "../lib/reports/ask-first";
import { validateResumeFeedbackRequest } from "../lib/backend/validation";
import type { ReportData } from "../components/workspace/report/ReportTypes";

const fixtures = JSON.parse(readFileSync(path.join(__dirname, "fixtures", "report-integrity", "live-outputs-83b2a2d1.json"), "utf8")) as {
  runs: Array<{ fixture_id: string; report: ReportData }>;
};
// Kevin's four production runs scored 58, 60, 60 and 58; the lowest is the one on the rung by score alone.
// (In the live product the severity check flags his gap as a second miss, which puts every run there.)
const kevinRuns = fixtures.runs.filter((run) => run.fixture_id === "synth_operations_manager_entry_weak_1").map((run) => run.report);
const kevin = kevinRuns.reduce((lowest, run) => ((run.score ?? 100) < (lowest.score ?? 100) ? run : lowest));
const meredith = fixtures.runs.find((run) => run.fixture_id === "synth_data_scientist_senior_elite_1")!.report;
const flagged = (report: ReportData, flags: boolean[]) => ({ ...report, top_fixes: (report.top_fixes || []).map((fix, index) => ({ ...fix, critical: flags[index] ?? false })) });
const kevinResume = readFileSync(path.join(__dirname, "..", "..", "tests", "resumes", "golden", "synth_operations_manager_entry_weak_1766960246467.txt"), "utf8");

// ============================================
// Who gets the questions first
// ============================================

assert.equal(kevin.score, 58);
assert.equal(reportToneOf(kevin), "not_ready", "Kevin's 58 is the bottom rung on the score alone");
assert.equal(askFirstOffered(kevin), true);
const kevinAtSixty = kevinRuns.find((run) => run.score === 60)!;
assert.equal(askFirstOffered(kevinAtSixty), true, "his 60 runs are on the rung too: the line is 60 and below, so the same resume gets the same screen on every run");
assert.equal(askFirstOffered({ ...kevinAtSixty, score: 61 }), false, "61 is the next page up on the golden set, above the rung");
assert.equal(askFirstOffered(flagged({ ...kevinAtSixty, score: 61 }, [true, true, true])), false, "and the severity check's flags don't move it (Matt: \"Band only\")");
assert.equal(reportToneOf(meredith), "ready", "Meredith's 92 with one miss is the clear page");
assert.equal(askFirstOffered(meredith), false);
assert.equal(askFirstOffered({ ...kevin, top_fixes: [] }), false, "nothing to ask about, nothing to ask");
assert.equal(askFirstOffered({ ...flagged(kevin, [true, true, false]), score: 66 }), false, "band only (Matt): flagged misses never move the rung");
assert.equal(askFirstOffered({ ...flagged(kevin, [true, false, false]), score: 60 }), true);
assert.equal(isAskFirstEnabled(undefined), true);
assert.equal(isAskFirstEnabled("0"), false);
assert.equal(isAskFirstEnabled("off"), false);
assert.equal(isAskFirstEnabled("1"), true);

// ============================================
// The questions
// ============================================

const questions = buildAskFirstQuestions(kevin);
assert.ok(questions.length > 0 && questions.length <= ASK_FIRST_MAX_QUESTIONS, `between one and ${ASK_FIRST_MAX_QUESTIONS} questions`);
assert.equal(questions[0].fixIndex, 0, "the first fix's line comes first");
assert.equal(questions[0].kind, "line");
assert.equal(questions[0].excerpt, "- Duties included maintaining records and updating reports.");
assert.equal(questions[0].note, "Name the records you maintained and the reports you updated.", "the note is the model's fix, without its locator clause");
assert.equal(questions[0].question, "", "with no question of its own, the note is the ask");
assert.ok(questions.some((question) => question.kind === "general"), "the report's open questions fill the rest");
assert.equal(new Set(questions.map((question) => question.id)).size, questions.length, "ids are unique");
const lineQuestions = questions.filter((question) => question.fixIndex !== null);
assert.ok(lineQuestions.length >= 3 && lineQuestions.length <= 6, "one or two per fix on Kevin's report: the integrity pass moves his open questions onto the lines they ask about");
assert.deepEqual([...new Set(lineQuestions.map((question) => question.fixIndex))], [0, 1, 2], "every fix has at least one, in the report's order");

// The severity check's dated-gap fix asks for the time since, and a missing headline asks for the role.
const withGap: ReportData = {
  ...kevin,
  top_fixes: [
    { fix: "Add one dated line covering Jul 2023 to today.", why: "A dated line such as \"Career break\" or \"Job search and coursework\" is enough.", evidence: { excerpt: "Feb 2023 - Jul 2023", section: "Experience" }, critical: true },
    { fix: "Add a one-line headline above the experience naming the role you want.", why: "The page points in two directions.", evidence: { excerpt: "No summary section present", section: "Summary" }, critical: true },
    ...(kevin.top_fixes || []).slice(0, 1).map((fix) => ({ ...fix, critical: false })),
  ],
};
const gapQuestions = buildAskFirstQuestions(withGap);
assert.equal(gapQuestions[0].kind, "since");
assert.equal(gapQuestions[0].excerpt, "Feb 2023 - Jul 2023", "the dated line is quoted so the person sees which date");
assert.equal(gapQuestions[0].question, "", "the note is the ask; the field says the shape of the answer");
assert.match(askFirstPlaceholder(gapQuestions[0].kind), /since, with dates/u);
assert.equal(gapQuestions[1].kind, "headline");
assert.equal(gapQuestions[1].excerpt, "", "nothing to quote for a missing headline");
assert.equal(gapQuestions[1].question, "");
assert.match(askFirstPlaceholder(gapQuestions[1].kind), /title you're applying for/u);

// ============================================
// The resume with the answers in it
// ============================================

const unanswered = composeAskFirstResume(kevinResume, questions, {});
assert.equal(unanswered.answered, 0);
assert.equal(unanswered.text, kevinResume, "no answers, no change");

const did = (value: string) => ({ value, relation: "did" as const });
const answers = {
  [questions[0].id]: did("the daily shipment log and the weekly on-time delivery report, read by the operations manager"),
  [questions.find((question) => question.kind === "general")!.id]: did("Scheduling 30 volunteers across 12 events a year"),
};
const composed = composeAskFirstResume(kevinResume, questions, answers);
assert.equal(composed.answered, 2);
assert.ok(
  composed.text.includes("- Duties included maintaining records and updating reports: the daily shipment log and the weekly on-time delivery report, read by the operations manager."),
  "a line's answer is composed into that line, as the revised line does",
);
assert.ok(!composed.text.includes("- Duties included maintaining records and updating reports.\n"), "the old line is replaced, not kept beside the new one");
assert.ok(composed.text.endsWith(`${ASK_FIRST_ADDED_HEADING}\n- Scheduling 30 volunteers across 12 events a year`), "a general answer goes under the heading at the end");
assert.equal(composed.text.split("\n").length, kevinResume.trimEnd().split("\n").length + 3, "two lines and a blank line were added, nothing else moved");
assert.ok(composed.text.includes("- Was responsible for assisting with daily operational tasks."), "untouched lines stay word for word");

const gapAnswers = { [gapQuestions[0].id]: did("Job search and CAPM coursework, Aug 2023 to now"), [gapQuestions[1].id]: did("Operations Coordinator") };
const composedGap = composeAskFirstResume(kevinResume, gapQuestions, gapAnswers);
const gapLines = composedGap.text.split("\n");
assert.equal(gapLines[0].trim(), "Kevin M. Turner", "the name stays first");
assert.equal(gapLines[1], "Operations Coordinator", "the headline goes right under the name");
assert.ok(composedGap.text.endsWith(`${ASK_FIRST_ADDED_HEADING}\n- Job search and CAPM coursework, Aug 2023 to now`), "the time since goes under the heading at the end, as a dated line of the person's own");
assert.match(composedGap.text, /\nFeb 2023 - Jul 2023\s*\n- Was responsible/u, "the dated line itself is not touched");

// Whitespace in an answer collapses; a blank answer counts as none.
const spaced = composeAskFirstResume(kevinResume, questions, { [questions[0].id]: did("  the  shipment   log  "), [questions[1].id]: did("   ") });
assert.equal(spaced.answered, 1);
assert.ok(spaced.text.includes("updating reports: the shipment log."));

// Three honest states (Matt, Nov 5): related work never goes into the line it was asked about; "none" is left out.
const related = composeAskFirstResume(kevinResume, questions, {
  [questions[0].id]: { value: "Kept the warehouse inventory sheet for a summer job", relation: "related" },
  [questions[1].id]: { value: "typed but left out", relation: "none" },
});
assert.equal(related.answered, 1);
assert.match(related.text, /- Duties included maintaining records and updating reports\.\s*\n/u, "the line stays as it was");
assert.ok(related.text.endsWith(`${ASK_FIRST_ADDED_HEADING}\n- Kept the warehouse inventory sheet for a summer job`), "the related work is its own line");
assert.ok(!related.text.includes("typed but left out"));
assert.equal(askFirstPlaceholder("line", "related"), "The related work, as you'd put it on the page");

// ============================================
// The request: a rebuild names the report it is written from
// ============================================

const text = kevinResume;
const plain = validateResumeFeedbackRequest({ text, mode: "resume" });
assert.equal(plain.ok, true);
assert.equal(plain.value?.rebuild, null);
const anonymous = validateResumeFeedbackRequest({ text, mode: "resume", rebuild: { recovery_id: "7C9E6679-7425-40DE-944B-E07FC1F90AE7" } });
assert.equal(anonymous.ok, true);
assert.deepEqual(anonymous.value?.rebuild, { reportId: null, recoveryId: "7c9e6679-7425-40de-944b-e07fc1f90ae7" });
const signedIn = validateResumeFeedbackRequest({ text, mode: "resume", rebuild: { report_id: "7c9e6679-7425-40de-944b-e07fc1f90ae7" } });
assert.deepEqual(signedIn.value?.rebuild, { reportId: "7c9e6679-7425-40de-944b-e07fc1f90ae7", recoveryId: null });
const bad = validateResumeFeedbackRequest({ text, mode: "resume", rebuild: { report_id: "not-a-report" } });
assert.equal(bad.ok, false);
assert.equal(bad.fieldErrors?.rebuild, "The rebuild must name the report it is written from.");
assert.equal(validateResumeFeedbackRequest({ text, mode: "resume", rebuild: "yes" }).ok, false);
assert.equal(validateResumeFeedbackRequest({ text, mode: "resume", rebuild: null }).value?.rebuild, null);

console.log("ask-first tests passed");
