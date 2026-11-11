import assert from "node:assert/strict";
import { lineProgress, lineProgressLabel, scoreChangeLabel, scoreChanges } from "../lib/reports/report-history";

// ---- Lines answered ----
const cards = [
  { kind: "line", example: "Managed renewals by [renewal responsibilities]" },
  { kind: "keep", example: "Managed 32 B2B SaaS accounts with $2.4M in annual recurring revenue" },
  { kind: "line", example: "Introduced reviews covering [review topics] and [follow-up actions]" },
  { kind: "upgrade", example: "Move the portfolio line to the top" }, // no blank, so nothing to answer
  { kind: "line", example: "Worked with [people or teams]" },
];

assert.deepEqual(lineProgress(cards, null), { total: 3, answered: 0 }, "the keep card and a card without a blank ask nothing");
assert.deepEqual(
  lineProgress(cards, { "0": { line: "Managed renewals by running the quarterly calls", answers: [] }, "2": { line: null, answers: [] }, "1": { line: "ignored: the keep card" } }),
  { total: 3, answered: 1 },
  "an answer counts once a revised line is kept, and only on a card that asked",
);
assert.deepEqual(lineProgress(cards, { "0": { line: "a" }, "2": { line: "b" }, "4": { line: "c" } }), { total: 3, answered: 3 });
assert.deepEqual(lineProgress(cards, { "0": { line: "   " } }), { total: 3, answered: 0 }, "an empty line is not an answer");
assert.equal(lineProgress(undefined, { "0": { line: "a" } }), null, "an earlier-format report has no cards to count");
assert.equal(lineProgress([{ kind: "keep", example: "x" }], null), null, "a report that asks nothing shows no progress");
assert.equal(lineProgress("not cards", null), null);

assert.equal(lineProgressLabel({ total: 6, answered: 0 }), "6 lines to answer");
assert.equal(lineProgressLabel({ total: 1, answered: 0 }), "1 line to answer");
assert.equal(lineProgressLabel({ total: 6, answered: 3 }), "3 of 6 lines answered");
assert.equal(lineProgressLabel({ total: 6, answered: 6 }), "All 6 lines answered");
assert.equal(lineProgressLabel({ total: 1, answered: 1 }), "The one line is answered");

// ---- Change since the previous report for the same role ----
const reports = [
  { id: "d", score: 88, targetRole: "Customer Success Manager", createdAt: "2026-11-09T12:00:00.000Z", isProfile: false },
  { id: "c", score: 81, targetRole: "customer success  manager", createdAt: "2026-11-05T12:00:00.000Z", isProfile: false },
  { id: "b", score: 60, targetRole: "Technical Recruiter", createdAt: "2026-11-03T12:00:00.000Z", isProfile: false },
  { id: "a", score: 77, targetRole: "Customer Success Manager", createdAt: "2026-11-01T12:00:00.000Z", isProfile: false },
  { id: "p", score: 70, targetRole: "Customer Success Manager", createdAt: "2026-11-02T12:00:00.000Z", isProfile: true },
  { id: "n", score: 90, targetRole: null, createdAt: "2026-11-10T12:00:00.000Z", isProfile: false },
  { id: "x", score: null, targetRole: "Customer Success Manager", createdAt: "2026-11-06T12:00:00.000Z", isProfile: false },
];
const changes = scoreChanges(reports);
assert.deepEqual(changes.get("c"), { delta: 4, since: "2026-11-01T12:00:00.000Z" }, "the role matches whatever its case or spacing");
assert.deepEqual(changes.get("d"), { delta: 7, since: "2026-11-05T12:00:00.000Z" }, "each report is measured against the one just before it, not the first");
assert.equal(changes.has("a"), false, "the first report for a role has nothing to compare with");
assert.equal(changes.has("b"), false, "a different role is a different comparison");
assert.equal(changes.has("p"), false, "a profile review is never compared with a resume report");
assert.equal(changes.has("n"), false, "a report with no role is not compared");
assert.equal(changes.has("x"), false, "a report with no score is skipped, and doesn't break the chain");

assert.equal(scoreChangeLabel({ delta: 6, since: "x" }, "Nov 1, 2026"), "Up 6 since Nov 1, 2026");
assert.equal(scoreChangeLabel({ delta: -3, since: "x" }, "Nov 1, 2026"), "Down 3 since Nov 1, 2026");
assert.equal(scoreChangeLabel({ delta: 0, since: "x" }, "Nov 1, 2026"), "Same score as Nov 1, 2026");

console.log("report history: lines answered and score changes");
