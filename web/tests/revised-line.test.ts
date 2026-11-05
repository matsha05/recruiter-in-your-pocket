import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { getScoreLabel } from "../lib/score-utils";
import { reconcileReport } from "../lib/reports/report-integrity";
import { parseReportFeedback } from "../lib/reports/report-feedback";
import { criticalCountHeading, fixLabel, missingFromResume, readCriticalMisses, withCriticalFirst } from "../lib/reports/report-presentation";
import { resolveRewriteCopyPolicy } from "../lib/reports/report-presentation";
import {
  composeRevisedLine,
  describeRefusal,
  liftQuestions,
  liftSourceLine,
  liftState,
  marginNoteFromFix,
  nearestAllowedWord,
  revisedLinePolicy,
  type LiftAnswer,
} from "../lib/reports/revised-line";
import { SCORE_BANDS, reportTone, scoreBandFor } from "../lib/reports/score-band";

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
// W3: the guard explains itself, and pure additions are never refused
// ============================================

// Daniel (Nov 2 walk): three true answers under "Responsible for developing features…" were refused by the
// responsibility-binding check, which the composition waiver did not cover. Every binding class is waived now.
const danielResume = [
  "DANIEL OKAFOR", "", "EXPERIENCE", "Software Engineering Intern, Cardinal Health, Dublin, OH", "May 2025 - August 2025",
  "- Responsible for developing features for an internal inventory management web application using React and Spring Boot",
  "- Participated in daily stand-ups and sprint planning meetings as part of an Agile team",
  "- Wrote unit tests to improve code quality and reliability",
].join("\n");
const danielExcerpt = "Responsible for developing features for an internal inventory management web application using React and Spring Boot";
const typedBy = (value: string): LiftAnswer => ({ kind: "answered", value });
const danielAnswers: LiftAnswer[] = [
  typedBy("3 features used by about 40 warehouse staff"),
  typedBy("manual stock checks went from daily to weekly"),
  typedBy("the inventory web app used by 40 warehouse staff"),
];
const danielLine = composeRevisedLine(liftSourceLine(danielExcerpt, danielResume).line, danielAnswers)!;
const danielPolicy = revisedLinePolicy({ resumeText: danielResume, excerpt: danielExcerpt, line: danielLine, answers: danielAnswers });
assert.ok(danielPolicy.copyable, `true answers added to the line are never refused (${JSON.stringify(danielPolicy.issues)})`);
assert.equal(danielPolicy.refusal, undefined);

// A refusal names what it objects to, in the candidate's words, and says what to do.
assert.deepEqual(invented.refusal, { kind: "new_fact", tokens: ["55", "Google"] });
assert.equal(describeRefusal(invented.refusal), "“55”, “Google” isn't in your line or your answers. If it's true, add it as an answer first.");
assert.equal(describeRefusal({ kind: "new_word", tokens: ["app"], nearest: ["application"] }),
  "“app” isn't in your line or your answers, but “application” is. Use the word you wrote, or add the new one as an answer.");
assert.equal(describeRefusal({ kind: "new_word", tokens: ["synergy"] }), "“synergy” isn't in your line or your answers. Use the words you wrote, or add it as an answer.");
assert.equal(describeRefusal({ kind: "lost_fact", tokens: ["35%"] }), "“35%” from your line is missing. Put it back, or keep the line as it was.");
assert.equal(describeRefusal({ kind: "binding", tokens: [] }), "We can't tell which part of your line the new words belong to. Use my exact words, or add them as an answer.");
assert.equal(describeRefusal(undefined), "");
assert.equal(describeRefusal({ kind: "empty", tokens: [] }), "");
assert.equal(revisedLinePolicy({ resumeText: hrResume, excerpt: hrExcerpt, line: "", answers: [] }).refusal?.kind, "empty");
assert.equal(nearestAllowedWord("app", "an internal inventory management web application"), "application");
assert.equal(nearestAllowedWord("warehous", "about 40 warehouse staff"), "warehouse");
assert.equal(nearestAllowedWord("55", "40 warehouse staff"), undefined, "numbers have no nearest word");
assert.equal(nearestAllowedWord("led", "Helped oversee recruitment"), undefined);

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
// Score bands (D5) and the critical fixes
// ============================================

// Four rungs (Matt, Nov 5, 2026: "Band only"). The three upper rungs match the validator's score_label; the
// bottom one is the lowest band below 60, on the score alone.
for (const score of [60, 69, 70, 84, 85, 92, 99]) {
  assert.equal(scoreBandFor(score).name, getScoreLabel(score), `band for ${score} matches the validator's score_label`);
}
for (const score of [0, 40, 55, 59]) {
  assert.equal(scoreBandFor(score).name, "Not ready yet", `a ${score} reads as not ready`);
}
assert.equal(scoreBandFor(60).name, "Needs more context", "the line is 60");
assert.equal(SCORE_BANDS.length, 4);
assert.equal(new Set(SCORE_BANDS.map((band) => band.anchor)).size, SCORE_BANDS.length, "each band has its own anchor");
// The tone: not ready on the bottom rung; ready on a clear page with a single miss; standard otherwise.
const twoFlagged = { count: 2, counted: true };
assert.equal(reportTone(58, { count: 1, counted: true }), "not_ready");
assert.equal(reportTone(66, twoFlagged), "standard", "flagged misses never move the bottom rung (band only)");
assert.equal(reportTone(66, { count: 1, counted: true }), "standard");
assert.equal(reportTone(92, { count: 1, counted: true }), "ready");
assert.equal(reportTone(92, { count: 1, counted: false }), "ready", "a clear page before the severity check is ready too");
assert.equal(reportTone(92, twoFlagged), "standard", "two flagged misses on a clear page keep the count heading");
assert.equal(reportTone(undefined, twoFlagged), "standard");
// The production prompt always names one Critical Miss, even a low-impact one (Matt: "Always name a top fix"),
// but without the severity check's flags the report can't say how many there are.
const unflagged = readCriticalMisses({ top_fixes: [{ fix: "Optional.", impact_level: "low" }, { fix: "Next." }] });
assert.deepEqual(unflagged, { count: 1, counted: false, more: false });
assert.equal(criticalCountHeading(unflagged), null, "no count heading without the severity check");
assert.deepEqual(readCriticalMisses({ top_fixes: [] }), { count: 0, counted: false, more: false });

// Flagged: the count is the leading critical fixes, up to three; "more than three" needs three.
const flags = (...critical: boolean[]) => critical.map((value, index) => ({ fix: `Fix ${index}.`, critical: value }));
assert.deepEqual(readCriticalMisses({ top_fixes: flags(true, false, false) }), { count: 1, counted: true, more: false });
assert.deepEqual(readCriticalMisses({ top_fixes: flags(true, true, false) }), { count: 2, counted: true, more: false });
assert.deepEqual(readCriticalMisses({ top_fixes: flags(true, true, true), more_critical: true }), { count: 3, counted: true, more: true });
assert.deepEqual(readCriticalMisses({ top_fixes: flags(true, true, false), more_critical: true }), { count: 2, counted: true, more: false }, "more_critical without three flagged is dropped");
assert.deepEqual(readCriticalMisses({ top_fixes: flags(false, false) }), { count: 1, counted: true, more: false }, "a report always names one");
assert.equal(readCriticalMisses({ top_fixes: flags(true, true, true, true) }).count, 3, "three at most");

// A flagged fix below an unflagged one moves up; the first stays first; unflagged reports keep their order.
const stray = { top_fixes: flags(true, false, true) };
assert.deepEqual(withCriticalFirst(stray).top_fixes?.map((fix) => fix.fix), ["Fix 0.", "Fix 2.", "Fix 1."]);
assert.equal(readCriticalMisses(withCriticalFirst(stray)).count, 2);
const plain = { top_fixes: [{ fix: "A." }, { fix: "B." }] };
assert.equal(withCriticalFirst(plain), plain);
const ordered = { top_fixes: flags(true, false) };
assert.equal(withCriticalFirst(ordered), ordered, "already in order: the same object");

// The count leads (copy-system §1); labels number the Critical Misses only when there are several.
assert.deepEqual(criticalCountHeading({ count: 1, counted: true, more: false }), { title: "One Critical Miss. Fix it first.", lead: "It's the one most likely to cost you the interview." });
assert.equal(criticalCountHeading({ count: 2, counted: true, more: false })?.title, "Two Critical Misses. Start with this one.");
assert.equal(criticalCountHeading({ count: 3, counted: true, more: false })?.title, "Three Critical Misses. Start with this one.");
assert.equal(criticalCountHeading({ count: 3, counted: true, more: true })?.title, "More than three Critical Misses. Here are the three that matter most.");
assert.deepEqual([0, 1, 2].map((index) => fixLabel(index, { count: 1, counted: true, more: false })), ["Critical Miss", "Fix 2", "Fix 3"]);
assert.deepEqual([0, 1, 2].map((index) => fixLabel(index, { count: 2, counted: true, more: false })), ["Critical Miss 1", "Critical Miss 2", "Fix 3"]);
assert.deepEqual([0, 1, 2].map((index) => fixLabel(index, unflagged)), ["Critical Miss", "Fix 2", "Fix 3"]);
// A clear page with one miss (Matt, Nov 5, 2026): the question they'd ask, then what's worth tightening. Never "Critical Miss".
const one = { count: 1, counted: true, more: false };
assert.deepEqual(criticalCountHeading(one, "ready"), { title: "The question they'd ask.", lead: "Not a reason to pass on you. Worth a sentence before you send it." });
assert.deepEqual(criticalCountHeading(unflagged, "ready"), { title: "The question they'd ask.", lead: "Not a reason to pass on you. Worth a sentence before you send it." }, "the question heading needs no count");
assert.equal(criticalCountHeading({ count: 2, counted: true, more: false }, "ready")?.title, "Two Critical Misses. Start with this one.", "two flagged misses keep the count on any tone");
assert.deepEqual([0, 1, 2].map((index) => fixLabel(index, one, "ready", 3)), ["The question they'd ask", "Worth tightening · 1 of 2", "Worth tightening · 2 of 2"]);
assert.deepEqual([0, 1].map((index) => fixLabel(index, one, "ready", 2)), ["The question they'd ask", "Worth tightening"]);
assert.deepEqual([0, 1, 2].map((index) => fixLabel(index, { count: 2, counted: true, more: false }, "ready", 3)), ["Critical Miss 1", "Critical Miss 2", "Fix 3"]);
assert.equal(criticalCountHeading(one, "not_ready")?.title, "One Critical Miss. Fix it first.", "the bottom rung keeps the count heading");
// A fix about something the resume doesn't have names it; there's no line to quote, mark or revise.
assert.equal(missingFromResume("No summary section present"), "No summary section");
assert.equal(missingFromResume("No LinkedIn profile provided."), "No LinkedIn profile");
assert.equal(missingFromResume("No budget was named for the rollout."), null, "a real line that starts with No");

// ============================================
// Critical Miss feedback keeps the answer and the model's wording only
// ============================================

assert.deepEqual(parseReportFeedback({ criticalMiss: "  Name the  records. ", right: false, note: " Gap mattered more. " }),
  { reportId: undefined, criticalMiss: "Name the records.", right: false, note: "Gap mattered more." });
assert.equal(parseReportFeedback({ criticalMiss: "x", right: "yes" }), null, "the answer must be a boolean");
assert.equal(parseReportFeedback({ criticalMiss: "", right: true }), null);
assert.equal(parseReportFeedback({ criticalMiss: "x", right: true, reportId: "not-a-uuid" }), null);
assert.equal(parseReportFeedback({ criticalMiss: "x", right: true, note: "y".repeat(601) }), null);
assert.equal(Object.keys(parseReportFeedback({ criticalMiss: "x", right: true, line: "resume text" })!).includes("line"), false,
  "a quoted resume line sent by a client is dropped");

// The privacy policy says feedback is kept 12 months, then deleted, and never includes the resume.
const migration = fs.readFileSync(path.join(process.cwd(), "database/migrations/022_report_feedback.sql"), "utf8");
const retention = fs.readFileSync(path.join(process.cwd(), "database/migrations/023_report_feedback_retention.sql"), "utf8");
assert.match(retention, /DELETE FROM public\.report_feedback\s+WHERE created_at < NOW\(\) - INTERVAL '12 months'/);
assert.match(retention, /cron\.schedule\(\s*'riyp-expire-report-feedback',\s*'41 3 \* \* \*',\s*'SELECT private\.expire_report_feedback\(\);'/u, "it runs daily");
assert.match(retention, /REVOKE ALL ON FUNCTION private\.expire_report_feedback\(\) FROM PUBLIC, anon, authenticated;\s*GRANT EXECUTE ON FUNCTION private\.expire_report_feedback\(\) TO service_role;/u,
  "only the service role can run the cleanup, as with the account-export expiry");
assert.doesNotMatch(migration, /cron\./u, "022 is the table alone, as applied to production");
assert.match(migration, /ENABLE ROW LEVEL SECURITY/);
assert.match(migration, /REVOKE ALL ON public\.report_feedback FROM anon, authenticated/);
const table = migration.slice(migration.indexOf("CREATE TABLE"), migration.indexOf(");", migration.indexOf("CREATE TABLE")));
assert.deepEqual([...table.matchAll(/^\s{2}([a-z_]+)\s/gmu)].map((match) => match[1]),
  ["id", "created_at", "user_id", "report_id", "critical_miss", "answer", "note"], "the feedback table has no column for the resume or its quoted line");

console.log("revised line tests passed");
