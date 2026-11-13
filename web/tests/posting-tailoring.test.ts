import assert from "node:assert/strict";
import { validateWorklistPayload } from "../lib/llm/worklist-validator";
import { MAX_LINE_LENGTH, MAX_QUOTE_LENGTH, WORKLIST_REPORT_JSON_SCHEMA, WorklistReportSchema } from "../lib/llm/worklist-schema";
import { quoteWithinLine } from "../lib/llm/worklist-grounding";
import { POSTING_LEAD_HOW, POSTING_LEAD_LABEL, POSTING_TRIM_HOW, POSTING_TRIM_LABEL } from "../lib/reports/worklist-presentation";

/**
 * Tailoring to a posting (Nov 10, 2026): with a posting, the report may name up to three resume lines to move
 * up and up to three to trim. Each is a resume line word for word; a line that isn't is dropped, and without a
 * posting there are none.
 */

const RESUME = `Priya Natarajan
Senior Backend Engineer

Experience
Northwind Pay, Senior Backend Engineer, March 2021 - Present
Built the public API gateway used by partner integrations.
Mentor two engineers on the payments team.
Wrote the on-call runbook for the payouts service.
Moved the payouts ledger to a sharded store that handles 2.1 million transactions a day.
Organized the quarterly hack week for 40 engineers.

Kestrel Labs, Software Engineer, June 2018 - February 2021
Built the reconciliation job that matches card settlements against the ledger every night.

Skills
Go, PostgreSQL, Kafka, PHP, jQuery`;

const base = {
  contract_version: "v3",
  score: 86,
  lifted_by_employer: false,
  verdict: "A senior backend engineer whose ledger work sits fourth under her current job.",
  write_up: ["You build payments systems, and your resume says so. For this posting, the ledger line is the one to lead with."],
  cards: [],
  fit: {
    roles: ["Senior Backend Engineer", "Staff Backend Engineer, Payments"],
    why: "Your title and both jobs are backend payments work.",
    level: "senior, mentors two engineers",
    note: "Your ledger and reconciliation work is what this posting is hiring for.",
    posting: {
      summary: "Staff Backend Engineer, Payments: ledger systems at volume and cross-team migrations.",
      missing: ["Leading a migration across several teams"],
      lead: [
        { line: "Moved the payouts ledger to a sharded store that handles 2.1 million transactions a day.", why: "The posting's first ask is ledger experience at volume. This is the fourth line under Northwind; make it the first." },
        { line: "Rebuilt the ledger for 9 million transactions a day.", why: "A line the resume doesn't have." },
      ],
      trim: [
        { line: "Organized the quarterly hack week for 40 engineers.", why: "A good line. Nothing in this posting asks for it." },
        { line: "Moved the payouts ledger to a sharded store that handles 2.1 million transactions a day.", why: "Already in the lines to move up." },
      ],
    },
  },
};

// With a posting: quoted lines are kept, a line that isn't on the resume is dropped, and a line is never in both lists.
{
  const report = validateWorklistPayload(structuredClone(base), RESUME, { forceGrounding: true });
  assert.deepEqual(report.fit.posting.lead?.map((move) => move.line), ["Moved the payouts ledger to a sharded store that handles 2.1 million transactions a day."]);
  assert.deepEqual(report.fit.posting.trim?.map((move) => move.line), ["Organized the quarterly hack week for 40 engineers."]);
  assert.deepEqual(report.fit.posting.missing, ["Leading a migration across several teams"], "the missing list is untouched");
}

// Every move ungrounded: the lists are left off, never empty arrays, and the report still stands.
{
  const draft = structuredClone(base);
  draft.fit.posting.lead = [{ line: "Led the migration to Kubernetes.", why: "Not on the resume." }];
  draft.fit.posting.trim = [];
  const report = validateWorklistPayload(draft, RESUME, { forceGrounding: true });
  assert.equal("lead" in report.fit.posting, false);
  assert.equal("trim" in report.fit.posting, false);
}

// Without a posting there is nothing to tailor to, whatever the model returned.
{
  const draft = structuredClone(base);
  draft.fit.posting.summary = "";
  draft.fit.posting.missing = [];
  const report = validateWorklistPayload(draft, RESUME, { forceGrounding: true });
  assert.equal("lead" in report.fit.posting, false);
  assert.equal("trim" in report.fit.posting, false);
}

// A banned word in a move's reason sends the report back, as it does anywhere else in the report.
{
  const draft = structuredClone(base);
  draft.fit.posting.lead = [{ line: "Moved the payouts ledger to a sharded store that handles 2.1 million transactions a day.", why: "This is the line the candidate should lead with." }];
  assert.throws(() => validateWorklistPayload(draft, RESUME, { forceGrounding: true }), /retired phrase/);
}

// A report saved before tailoring existed parses to the same object: no field appears on it.
{
  const saved = structuredClone(base) as { fit: { posting: Record<string, unknown> } };
  delete saved.fit.posting.lead;
  delete saved.fit.posting.trim;
  const parsed = WorklistReportSchema.parse(saved);
  assert.equal("lead" in parsed.fit.posting, false);
  assert.equal("trim" in parsed.fit.posting, false);
  assert.throws(() => WorklistReportSchema.parse({ ...base, fit: { ...base.fit, posting: { ...base.fit.posting, lead: Array.from({ length: 4 }, () => base.fit.posting.lead[0]) } } }), "at most three moves");
}

// The model is asked for both lists every time, so a strict response format has somewhere to put an empty one.
{
  const posting = WORKLIST_REPORT_JSON_SCHEMA.properties.fit.properties.posting;
  assert.deepEqual([...posting.required], ["summary", "missing", "lead", "trim", "covered"]);
  assert.equal(posting.properties.lead.maxItems, 3);
}

// The fixed words promise nothing about recruiters and never say delete.
for (const text of [POSTING_LEAD_LABEL, POSTING_LEAD_HOW, POSTING_TRIM_LABEL, POSTING_TRIM_HOW]) {
  assert.doesNotMatch(text, /delete|remove|recruiters? (?:read|spend|always)/iu);
  assert.doesNotMatch(text, /—/u);
}

// ---- Covered requirements (Nov 11, 2026): each must-have is covered or missing ----
{
  const posting = WORKLIST_REPORT_JSON_SCHEMA.properties.fit.properties.posting;
  assert.ok((posting.required as readonly string[]).includes("covered"), "the model always returns the covered list");
  const prompt = require("node:fs").readFileSync(require("node:path").join(__dirname, "../prompts/resume_v3.txt"), "utf8");
  assert.match(prompt, /each one is either covered or missing, never both/);
  assert.match(prompt, /"covered": \[\{ "requirement": "", "line": "" \}\]/);
  const { POSTING_TABLE_LABEL, POSTING_COVERED_LABEL, POSTING_NOT_COVERED } = require("../lib/reports/worklist-presentation");
  for (const label of [POSTING_TABLE_LABEL, POSTING_COVERED_LABEL, POSTING_NOT_COVERED]) assert.ok(label.length > 0 && label.length < 40);
  assert.equal(WorklistReportSchema.safeParse(null).success, false);

  const draft = structuredClone(base) as typeof base & { fit: { posting: { covered?: Array<{ requirement: string; line: string }> } } };
  draft.fit.posting.covered = [
    { requirement: "Ledger experience at volume", line: "Moved the payouts ledger to a sharded store that handles 2.1 million transactions a day." },
    { requirement: "Kubernetes in production", line: "Ran the Kubernetes migration for the platform." },
    { requirement: "ledger experience at volume", line: "Wrote the on-call runbook for the payouts service." },
    { requirement: "Leading a migration across several teams", line: "Built the public API gateway used by partner integrations." },
    { requirement: "On-call for the payouts path", line: "Wrote the on-call runbook for the payouts service." },
    { requirement: "5+ years building backend systems", line: "Northwind Pay, Senior Backend Engineer, March 2021 - Present" },
  ];
  const report = validateWorklistPayload(draft, RESUME, { forceGrounding: true });
  assert.deepEqual(report.fit.posting.covered?.map((item) => item.requirement), ["Ledger experience at volume", "On-call for the payouts path"],
    "a line that isn't on the resume, a repeated requirement, a requirement also listed as missing, and a years-of-experience ask are all dropped");

  const long = structuredClone(base);
  long.fit.posting.missing = [`Partner with Finance and Risk on reconciliation and controls, ${"including month-end close support and audit evidence, ".repeat(6)}as needed.`];
  const cut = validateWorklistPayload(long, RESUME, { forceGrounding: true }).fit.posting.missing[0];
  assert.ok(cut.length <= 200 && cut.startsWith("Partner with Finance and Risk") && !/[,;:. ]$/u.test(cut), "a requirement copied as a paragraph is cut to a clause, not sent back");

  const none = structuredClone(draft);
  none.fit.posting.summary = "";
  none.fit.posting.missing = [];
  assert.equal("covered" in validateWorklistPayload(none, RESUME, { forceGrounding: true }).fit.posting, false, "no posting, no table");

  const saved = structuredClone(base) as { fit: { posting: Record<string, unknown> } };
  delete saved.fit.posting.covered;
  assert.equal("covered" in WorklistReportSchema.parse(saved).fit.posting, false, "a report saved before the table parses to the same object");
}

// ---- What a must-have is (Nov 12, 2026): the live walk's table listed citizenship, a heading and hours as gaps ----
{
  const prompt = require("node:fs").readFileSync(require("node:path").join(__dirname, "../prompts/resume_v3.txt"), "utf8");
  assert.match(prompt, /a condition of the job that a resume doesn't state/, "conditions of employment are named as never a must-have");
  assert.match(prompt, /never a section heading/, "a heading is never a requirement");
  assert.match(prompt, /required and preferred alike/, "a preferred ask that names the specialty counts");
  assert.match(prompt, /the write-up never says which job you read the resume for/, "with a posting, the person named the job");

  const draft = structuredClone(base) as typeof base & { fit: { posting: { covered?: Array<{ requirement: string; line: string }> } } };
  draft.fit.posting.missing = ["ITAR REQUIREMENTS", "U.S. citizen or national, (ii) U.S. lawful permanent resident", "Must be authorized to work in the United States", "Kubernetes in production", "SQL"];
  draft.fit.posting.covered = [
    { requirement: "3+ years on call for a payments service", line: "Wrote the on-call runbook for the payouts service." },
    { requirement: "5+ years building backend systems", line: "Northwind Pay, Senior Backend Engineer, March 2021 - Present" },
    { requirement: "Eligible under export-control rules", line: "Wrote the on-call runbook for the payouts service." },
  ];
  const report = validateWorklistPayload(draft, RESUME, { forceGrounding: true });
  assert.deepEqual(report.fit.posting.missing, ["Kubernetes in production", "SQL"], "a heading and a rule about who may be hired are not gaps on a resume; a short tool name still is");
  assert.deepEqual(report.fit.posting.covered?.map((item) => item.requirement), ["3+ years on call for a payments service"],
    "a years ask answered by a line of that work stays; one answered by an employer-and-dates line, and an eligibility rule, are dropped");
}

// A bullet longer than the model's quote is shown whole. The model is asked for under 200 characters and stops where
// that lands; on a live report of November 12, 2026 a card's line ended "through innovative strategies aimed at".
{
  const bullet = "Rebuilt the hiring process across four regions, cutting time to hire from 61 days to 34 within two quarters through structured interviews aimed at opening new markets (Vietnam, Kenya, Poland) and new fields (machine learning, payments).";
  const cut = bullet.slice(0, bullet.indexOf("aimed at") + "aimed at".length);
  assert.ok(bullet.length > MAX_QUOTE_LENGTH && bullet.length <= MAX_LINE_LENGTH && cut.length <= MAX_QUOTE_LENGTH);
  const text = `${RESUME}\n- ${bullet}`;
  const draft = structuredClone(base);
  (draft as { cards: unknown[] }).cards = [{ kind: "line", where: "Northwind Pay, line 4", line: cut, cannot_tell: "The days are here. Which roles were these?", example: "Rebuilt hiring for [which roles] across four regions, cutting time to hire from 61 days to 34.", question: "Which roles did the new process hire for?" }];
  Object.assign(draft.fit.posting, { covered: [{ requirement: "Hiring across regions", line: cut }], lead: [], trim: [{ line: cut, why: "A good line. Nothing in this posting asks for it." }] });
  const report = validateWorklistPayload(draft, text, { forceGrounding: true });
  assert.equal(report.cards[0].line, bullet, "a card quotes the whole bullet, not the part the model's limit reached");
  assert.equal(report.fit.posting.covered?.[0].line, bullet, "so does a row of the posting's table");
  assert.equal(report.fit.posting.trim?.[0].line, bullet, "and a line the posting doesn't ask about");
  assert.equal(WorklistReportSchema.safeParse(report).success, true, "a validated report always parses again");

  // The next live report quoted the same kind of bullet from its middle to its end, exactly 200 characters:
  // "achieving a 300% reduction in time to hire…". The start is the limit's doing too.
  const tail = bullet.slice(bullet.indexOf("cutting time"));
  assert.ok(tail.length <= MAX_QUOTE_LENGTH);
  const fromTheMiddle = structuredClone(draft);
  (fromTheMiddle as { cards: Array<{ line: string }> }).cards[0].line = tail;
  Object.assign(fromTheMiddle.fit.posting, { covered: [{ requirement: "Hiring across regions", line: tail }], lead: [], trim: [{ line: tail, why: "A good line. Nothing in this posting asks for it." }] });
  const whole = validateWorklistPayload(fromTheMiddle, text, { forceGrounding: true });
  assert.equal(whole.cards[0].line, bullet, "a card quotes the bullet from its first word, not from where the model's limit let it start");
  assert.equal(whole.fit.posting.covered?.[0].line, bullet);
  assert.equal(whole.fit.posting.trim?.[0].line, bullet);
}

// On a line longer than a report holds (a summary pasted as one paragraph) a quote that stops mid-sentence runs on to
// the end of its sentence, a quote that is a whole sentence stays the one the model chose, and the report parses again.
{
  const first = "Dedicated engineer with nine years of experience building payment systems at scale.";
  const long = `${first} ${"Passionate about reliable software and strong teams. ".repeat(7)}`.trim();
  const text = `${RESUME}\n\nSummary\n${long}`;
  assert.ok(long.length > MAX_LINE_LENGTH);
  const card = { kind: "line", where: "Summary", line: "Dedicated engineer with nine years of experience building payment", cannot_tell: "This could describe many engineers. Which systems were yours?", example: "Backend engineer who built [which systems] for [who used them].", question: "Which payment systems did you build, and who used them?" };
  for (const line of [card.line, first]) {
    const draft = structuredClone(base);
    (draft as { cards: unknown[] }).cards = [{ ...card, line }];
    const report = validateWorklistPayload(draft, text, { forceGrounding: true });
    assert.equal(report.cards[0].line, first, "the quote is the sentence: not the paragraph, and not a part of the sentence");
    assert.equal(WorklistReportSchema.safeParse(report).success, true, "a validated report always parses again");
  }
}

// The same rule on its own, with a small limit so the cases are short.
{
  // A quote that stops at a break is the part the model chose.
  const line = "Led the migration of 3.5 million accounts to the new ledger over two years, working with Finance (Treasury, Tax) and Risk, then trained the support team on it.";
  const clause = "Led the migration of 3.5 million accounts to the new ledger over two years";
  assert.equal(quoteWithinLine(clause, line, 400), clause, "a quote that stops at a clause break stands, with room or without");
  assert.equal(quoteWithinLine(clause, line, 80), clause);
  assert.equal(quoteWithinLine(line, line, 80), line, "the line's own end is a break");

  // A quote that stops anywhere else runs on to the end of its sentence.
  assert.equal(quoteWithinLine("Led the migration of 3.5 million accounts to the new", line, 400), line, "to the sentence's end when that fits");

  // A quote that starts partway into a sentence goes back to the sentence's first word when the result fits.
  assert.equal(quoteWithinLine("working with Finance (Treasury, Tax) and Risk, then trained the", line, 400), line, "both ends, when the limit landed mid-sentence twice");
  assert.equal(quoteWithinLine("then trained the support team on it.", line, 400), line, "a start after a clause break is still partway in");
  assert.equal(quoteWithinLine("then trained the support team on it.", line, 80), "then trained the support team on it.", "the start stands when the sentence is too long to show");

  // When the sentence is too long to show, the end moves to the nearest clause break.
  assert.equal(quoteWithinLine("Led the migration of 3.5 million accounts to the new", line, 80), clause, "forward to the next clause break; the point in 3.5 is not one");
  assert.equal(quoteWithinLine("working with Finance (Treasury", line, 80), "working with Finance (Treasury, Tax) and Risk", "never left inside a parenthesis it opened");
  const run = "Owned onboarding for enterprise customers, and built the playbook that the regional teams in eleven countries still use to bring a new account from signed contract to first invoice.";
  assert.equal(quoteWithinLine("Owned onboarding for enterprise customers, and built the", run, 100), "Owned onboarding for enterprise customers", "back to the last break when the next one is out of reach");
  assert.equal(quoteWithinLine("and built the playbook that the regional teams in eleven countries still use to bring", run, 100), "and built the playbook that the regional teams in eleven countries still use to bring", "with no break to move to and no room to go back, the quote stands as written");
  assert.equal(quoteWithinLine("not on this line at all", run, 100), "not on this line at all", "a quote the line doesn't hold is left alone");

  // Where a sentence ends: not at an abbreviation, and at a bullet's mark when a file read put two bullets on one line.
  const two = "Runs payments for Inc. 5000 sellers in the U.S. and Canada. Built the ledger. Hired the first six engineers and set the on-call rota.";
  assert.equal(quoteWithinLine("Runs payments for Inc. 5000 sellers in", two, 400), "Runs payments for Inc. 5000 sellers in the U.S. and Canada.", "an abbreviation does not end a sentence");
  assert.equal(quoteWithinLine("Runs payments for Inc.", two, 400), "Runs payments for Inc. 5000 sellers in the U.S. and Canada.", "and a quote that stops on one has not reached a break");
  assert.equal(quoteWithinLine("Built the ledger. Hired the first", two, 400), "Built the ledger. Hired the first six engineers and set the on-call rota.", "a quote that runs into a second sentence runs to the end of that one");
  assert.equal(quoteWithinLine("Built the ledger.", two, 400), "Built the ledger.", "one whole sentence of several stays one sentence");
  const joined = "Opened three regions to target enterprise deals. ● Managed the LATAM sales team as it grew from four people to eleven ● Hired the first sales engineer";
  assert.equal(quoteWithinLine("Opened three regions to target enterprise deals.", joined, 400), "Opened three regions to target enterprise deals.", "the first of two bullets on one line stays the first");
  assert.equal(quoteWithinLine("Managed the LATAM sales team as it", joined, 400), "Managed the LATAM sales team as it grew from four people to eleven", "a bullet ends at the next bullet's mark, with or without a full stop");
  assert.equal(quoteWithinLine("set the on-call rota.", two, 400), "Hired the first six engineers and set the on-call rota.", "going back stops at the start of the quote's own sentence");
  assert.equal(quoteWithinLine("grew from four people to eleven", joined, 400), "Managed the LATAM sales team as it grew from four people to eleven", "and at a bullet's mark, never in the bullet before it");
}

console.log("posting tailoring tests passed");
