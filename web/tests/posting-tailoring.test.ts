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
  assert.deepEqual([...posting.required], ["summary", "missing", "lead", "trim"]);
  assert.equal(posting.properties.lead.maxItems, 3);
}

// The fixed words promise nothing about recruiters and never say delete.
for (const text of [POSTING_LEAD_LABEL, POSTING_LEAD_HOW, POSTING_TRIM_LABEL, POSTING_TRIM_HOW]) {
  assert.doesNotMatch(text, /delete|remove|recruiters? (?:read|spend|always)/iu);
  assert.doesNotMatch(text, /—/u);
}

console.log("posting tailoring tests passed");
