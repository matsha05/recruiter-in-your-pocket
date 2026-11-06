import assert from "node:assert/strict";
import { validateWorklistPayload, normaliseProse } from "../lib/llm/worklist-validator";
import { WorklistReportSchema, isWorklistReport } from "../lib/llm/worklist-schema";
import { bannedPhrasesIn, inflatesOwnership, ungroundedTokensInExample } from "../lib/llm/worklist-grounding";
import { mergeSeverityIntoWorklist, worklistAsSeverityReport } from "../lib/reports/worklist-severity";
import { reportPreview } from "../lib/reports/report-preview";
import { parseResumeStreamCompletion } from "../lib/validation/resume-stream-completion";
import { askFirstOffered } from "../lib/reports/ask-first";
import { MOCK_WORKLIST_REPORT } from "../lib/backend/mock-worklist-report";

// Sam Whitaker, the synthetic resume the worklist shape was sketched on (docs/design/2026-11-worklist-report/).
const RESUME = `Sam Whitaker
Madison, WI | sam.whitaker@example.com | 555-0207

Marketing manager who has led credit union campaigns from strategy to launch.

EDUCATION
B.A., Economics, University of Wisconsin-Madison, May 2024

EXPERIENCE

Marketing Intern
Badger State Credit Union, Madison, WI
June 2023 - May 2024
- Helped with the member newsletter
- Posted on the credit union's social media accounts
- Supported planning for branch events

Research Assistant
Department of Agricultural Economics, University of Wisconsin-Madison
January 2023 - May 2023
- Cleaned survey data from 1,200 dairy farms in Stata for a pricing study
- Wrote 15 literature summaries on farm subsidies

SKILLS
Excel, Stata, Canva, survey design, public speaking`;

function draft(overrides: Record<string, unknown> = {}) {
  return {
    contract_version: "v3",
    score: 64,
    lifted_by_employer: false,
    verdict: "A recruiter sees an intern's resume with a manager's headline.",
    write_up: [
      "The resume says manager and the experience says intern, and that mismatch is the first thing a recruiter sees. The fix is cheap: say what you are.",
      "The research job is the best-written thing on the page: 1,200 farms, Stata, 15 summaries. The marketing bullets need the same treatment.",
    ],
    cards: [
      {
        kind: "line",
        where: "Headline",
        line: "Marketing manager who has led credit union campaigns from strategy to launch.",
        cannot_tell: "The headline promises a manager; the next line says intern. Say what you are, and what you want.",
        example: "Economics graduate (May 2024) with a year in credit union marketing, looking for a [marketing coordinator] role.",
        question: "What job are you going for? One title.",
      },
      {
        kind: "structure",
        where: "Structure",
        line: "Education sits above Experience.",
        cannot_tell: "You have a year of experience. Lead with it; the degree isn't the headline.",
        example: "",
        question: "Can you move Experience above Education?",
      },
      {
        kind: "dates",
        where: "Dates",
        line: "Nothing is dated after May 2024.",
        cannot_tell: "A recruiter will ask what happened since. One honest dated line covers it.",
        example: "[June 2024 - Present]  [Job search and marketing coursework]",
        question: "What have you done since May 2024, as a dated line?",
      },
      {
        kind: "line",
        where: "Marketing Intern, line 1",
        line: "Helped with the member newsletter",
        cannot_tell: "'Helped' hides the job. Did you write it, build it, send it? To how many people, how often?",
        example: "Wrote and built the monthly member newsletter in [tool], sent to [number] members.",
        question: "What part of the newsletter was yours, and how many members got it?",
      },
      {
        kind: "keep",
        where: "Research Assistant, line 1",
        line: "Cleaned survey data from 1,200 dairy farms in Stata for a pricing study",
        cannot_tell: "This is the best-written line on the page. The marketing bullets should read like it.",
        example: "",
        question: "",
      },
    ],
    fit: {
      roles: ["Marketing Intern"],
      level: "entry level",
      note: "A year of credit union marketing after an economics degree points at coordinator roles. The headline should say so.",
      posting: { summary: "", missing: [] },
    },
    ...overrides,
  };
}

function refuses(input: unknown, pattern: RegExp) {
  assert.throws(() => validateWorklistPayload(input, RESUME, { forceGrounding: true }), (error: any) => {
    assert.equal(error.code, "OPENAI_RESPONSE_SHAPE_INVALID");
    assert.match(String(error.message), pattern, `expected refusal to match ${pattern}, got: ${error.message}`);
    return true;
  });
}

// A grounded draft ships, with the rung written from the score and the bullet marks dropped from quoted lines.
{
  const report = validateWorklistPayload(draft(), RESUME, { forceGrounding: true });
  assert.equal(report.contract_version, "v3");
  assert.equal(report.score_label, "Needs more context");
  assert.equal(report.cards.length, 5);
  assert.equal(report.cards[3].line, "Helped with the member newsletter");
  assert.ok(isWorklistReport(report));
}

// A quoted line that is not on the resume as written is refused, and names the card.
refuses(draft({ cards: [{ ...draft().cards[3], line: "Helped with the members newsletter" }] }), /cards\[0\]\.line: is not on the resume as written/);

// A number in an example outside a bracket that the resume doesn't state is an invented fact.
refuses(draft({ cards: [{ ...draft().cards[3], example: "Wrote the monthly newsletter sent to 10,000 members." }] }), /cards\[0\]\.example: puts a number outside a bracket/);

// The same number inside a bracket is a blank, not a claim.
{
  const report = validateWorklistPayload(draft({ cards: [{ ...draft().cards[3], example: "Wrote the monthly newsletter sent to [10,000] members." }] }), RESUME, { forceGrounding: true });
  assert.equal(report.cards.length, 1);
}

// A name the resume doesn't have, outside a bracket, is refused; inside a bracket it passes.
refuses(draft({ cards: [{ ...draft().cards[3], example: "Built the member newsletter in Mailchimp, sent to [number] members." }] }), /cards\[0\]\.example: puts a name outside a bracket.*Mailchimp/);
{
  const report = validateWorklistPayload(draft({ cards: [{ ...draft().cards[3], example: "Built the member newsletter in [Mailchimp], sent to [number] members." }] }), RESUME, { forceGrounding: true });
  assert.equal(report.cards[0].example, "Built the member newsletter in [Mailchimp], sent to [number] members.");
}

// Facts the resume states stay outside brackets: Stata, 1,200 and May 2024 are on the page.
{
  const report = validateWorklistPayload(draft({ cards: [{ ...draft().cards[0], example: "Economics graduate (May 2024) who cleaned 1,200 farms of survey data in Stata, looking for a [marketing coordinator] role." }] }), RESUME, { forceGrounding: true });
  assert.equal(report.cards.length, 1);
}

// "Helped" never becomes "led" in the example.
assert.equal(inflatesOwnership("Helped with the member newsletter", "Led the member newsletter for [number] members."), true);
assert.equal(inflatesOwnership("Helped with the member newsletter", "Wrote and built the newsletter, [number] members."), false);
assert.equal(inflatesOwnership("Led the newsletter", "Led the newsletter for [number] members."), false);
refuses(draft({ cards: [{ ...draft().cards[3], example: "Led the member newsletter for [number] members." }] }), /ownership verb/);

// The retired names never reach the page: "Critical Miss" refuses; "the read" is rewritten in place.
refuses(draft({ verdict: "A Critical Miss on line one." }), /verdict: uses the retired phrase "critical miss"/);
assert.deepEqual(bannedPhrasesIn("Nothing to flag; a reader sees the work."), []);
assert.equal(normaliseProse("That detail slows the read. The read is quick otherwise."), "That detail slows the first pass. The first pass is quick otherwise.");
assert.equal(normaliseProse("Recruiters who read the resume twice are rare."), "Recruiters who read the resume twice are rare.", "a verb phrase is left alone");
{
  const report = validateWorklistPayload(draft({ cards: [{ ...draft().cards[3], cannot_tell: "'Helped' hides the job and slows the read." }] }), RESUME, { forceGrounding: true });
  assert.equal(report.cards[0].cannot_tell, "'Helped' hides the job and slows the first pass.");
}

// A structure card's statement may only carry dates the resume has.
refuses(draft({ cards: [{ ...draft().cards[2], line: "Nothing is dated after March 2025." }] }), /cards\[0\]\.line: states a number the resume doesn't have/);

// Two cards on one line: the first stands, the second is dropped without a refusal.
{
  const report = validateWorklistPayload(draft({ cards: [draft().cards[3], { ...draft().cards[3], cannot_tell: "A second note on the same line." }] }), RESUME, { forceGrounding: true });
  assert.equal(report.cards.length, 1);
}

// Shape: a keep card asks nothing, a line card carries an example, at most one keep card.
refuses(draft({ cards: [{ ...draft().cards[4], question: "Why?" }] }), /question: a keep card asks nothing/);
refuses(draft({ cards: [{ ...draft().cards[3], example: "" }] }), /example: a line card carries the line/);
refuses(draft({ cards: [draft().cards[4], { ...draft().cards[4], line: "Wrote 15 literature summaries on farm subsidies" }] }), /at most one keep card/);
refuses(draft({ write_up: [] }), /write_up/);
refuses(draft({ contract_version: "v2" }), /contract_version/);

// Em dashes become commas; nothing else in the prose changes.
assert.equal(normaliseProse("Posting is a task — which accounts, how often?"), "Posting is a task, which accounts, how often?");
assert.equal(normaliseProse("1,200 farms—Stata—15 summaries."), "1,200 farms, Stata, 15 summaries.");

// Grounding tokens: a currency and a percentage are numbers; a sentence-initial word is not a name; an acronym is.
assert.deepEqual(ungroundedTokensInExample("Grew the list by 30% to $2M in [year].", RESUME), [{ kind: "number", token: "30%" }, { kind: "number", token: "$2M" }]);
assert.deepEqual(ungroundedTokensInExample("Wrote the newsletter in Canva for the credit union.", RESUME), []);
assert.deepEqual(ungroundedTokensInExample("Ran the CRM migration.", RESUME), [{ kind: "name", token: "CRM" }]);

// The wait screen's preview: the verdict and the band, no Critical Miss.
{
  const report = validateWorklistPayload(draft(), RESUME, { forceGrounding: true });
  assert.deepEqual(reportPreview(report), { first_impression: report.verdict, score: 64, score_label: "Needs more context", critical_miss: null });
  assert.equal(askFirstOffered(report as any), false, "the worklist asks on each card, never before the report");
}

// The client accepts a v3 complete event and still accepts v2.
{
  const report = validateWorklistPayload(draft(), RESUME, { forceGrounding: true });
  const completion = parseResumeStreamCompletion({ type: "complete", ok: true, data: report }, "resume");
  assert.equal(completion.valid, true);
  const rejected = parseResumeStreamCompletion({ type: "complete", ok: true, data: { ...report, cards: "no" } }, "resume");
  assert.equal(rejected.valid, false);
}

// The severity check on a worklist: cards shown as fixes; a new gap item becomes a dates card unless one exists.
{
  const report = validateWorklistPayload(draft({ cards: draft().cards.filter((card) => card.kind !== "dates") }), RESUME, { forceGrounding: true });
  const view = worklistAsSeverityReport(report);
  assert.equal(view.first_impression, report.verdict);
  assert.equal(view.top_fixes.length, 3, "the keep card is not a fix");
  const merged = mergeSeverityIntoWorklist(report, {
    more_critical: false,
    critical_misses: [{ source: "new", kind: "no_recent_work", fix: "Add one dated line covering May 2024 to today.", why: "Nothing is listed after the internship ended. A recruiter reading this year will ask what the time was.", excerpt: "June 2023 - May 2024", section: "Experience", effort: "quick" }],
  });
  assert.deepEqual(merged.added, ["no_recent_work"]);
  const dates = merged.report.cards.find((card) => card.kind === "dates");
  assert.ok(dates);
  assert.equal(dates?.line, "June 2023 - May 2024");
  assert.match(dates?.example || "", /^\[Month Year\] - Present/);
  // Validates: the quoted date line is on the page, and the example's only facts are blanks.
  const validated = validateWorklistPayload(merged.report, RESUME, { forceGrounding: true });
  assert.equal(validated.cards.filter((card) => card.kind === "dates").length, 1);
  // With a dates card already there, the same item is skipped.
  const already = mergeSeverityIntoWorklist(validateWorklistPayload(draft(), RESUME, { forceGrounding: true }), { more_critical: false, critical_misses: [{ source: "new", kind: "no_recent_work", fix: "Add one dated line covering May 2024 to today.", why: "x", excerpt: "June 2023 - May 2024", section: "Experience", effort: "quick" }] });
  assert.deepEqual(already.added, []);
  assert.deepEqual(already.skipped, [{ kind: "no_recent_work", reason: "already_carded" }]);
  // A promotion changes nothing; the worklist has no flag to promote into.
  const promoted = mergeSeverityIntoWorklist(report, { more_critical: false, critical_misses: [{ source: "fix_2", kind: "title_level_mismatch", fix: "", why: "", excerpt: "", section: "", effort: "quick" }] });
  assert.deepEqual(promoted.added, []);
}

// The mock report the UI specs run on is a valid worklist report.
assert.ok(WorklistReportSchema.safeParse(MOCK_WORKLIST_REPORT).success);

console.log("worklist-validator tests passed");
