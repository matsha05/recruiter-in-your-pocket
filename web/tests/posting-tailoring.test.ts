import assert from "node:assert/strict";
import { validateWorklistPayload } from "../lib/llm/worklist-validator";
import { WORKLIST_REPORT_JSON_SCHEMA, WorklistReportSchema } from "../lib/llm/worklist-schema";
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

// A quote from a resume line longer than a report can hold stays as quoted, so the report can be parsed again.
{
  const long = `Dedicated engineer with nine years of experience building payment systems at scale. ${"Passionate about reliable software and strong teams. ".repeat(4)}`.trim();
  const text = `${RESUME}\n\nSummary\n${long}`;
  assert.ok(long.length > 200);
  const draft = structuredClone(base);
  (draft as { cards: unknown[] }).cards = [{ kind: "line", where: "Summary", line: "Dedicated engineer with nine years of experience building payment systems at scale.", cannot_tell: "This could describe many engineers. Which systems were yours?", example: "Backend engineer who built [which systems] for [who used them].", question: "Which payment systems did you build, and who used them?" }];
  const report = validateWorklistPayload(draft, text, { forceGrounding: true });
  assert.ok(report.cards[0].line.length <= 200, "the quote is not widened past the limit");
  assert.equal(WorklistReportSchema.safeParse(report).success, true, "a validated report always parses again");
}

console.log("posting tailoring tests passed");
