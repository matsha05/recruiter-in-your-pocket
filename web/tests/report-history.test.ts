import assert from "node:assert/strict";
import { earlierVersionsLabel, groupReportVersions, revisionProgress, revisionProgressLabel, revisionScoreLabel, lineProgress, lineProgressLabel, reportVersions, savedPostingRole, scoreChangeLabel, scoreChanges, versionChangeLabel } from "../lib/reports/report-history";

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

// A read against a posting is the same resume read again (the live walk of November 12, 2026: "Up 2", "Down 2").
const withPostings = scoreChanges([
  { id: "r1", score: 80, targetRole: "Technical Recruiter", createdAt: "2026-11-05T12:00:00.000Z", isProfile: false },
  { id: "p1", score: 82, targetRole: "Technical Recruiter", createdAt: "2026-11-12T12:00:00.000Z", isProfile: false, hasPosting: true },
  { id: "p2", score: 84, targetRole: "Technical Recruiter", createdAt: "2026-11-12T13:00:00.000Z", isProfile: false, hasPosting: true },
  { id: "r2", score: 86, targetRole: "Technical Recruiter", createdAt: "2026-11-13T12:00:00.000Z", isProfile: false },
]);
assert.equal(withPostings.has("p1"), false, "a posting read is not set against the report before it");
assert.equal(withPostings.has("p2"), false, "nor against another posting read");
assert.deepEqual(withPostings.get("r2"), { delta: 6, since: "2026-11-05T12:00:00.000Z" }, "the next resume report is measured against the last resume report, past the posting reads");

assert.deepEqual(savedPostingRole("A close match for the security desk.", ["Senior Technical Recruiter", "Technical Recruiter, Security"]), { hasPosting: true, postingRole: "Technical Recruiter, Security" });
assert.deepEqual(savedPostingRole("A close match.", ["Senior Technical Recruiter"]), { hasPosting: true, postingRole: null }, "a posting read that names no second role still says it was one");
assert.deepEqual(savedPostingRole("", ["Senior Technical Recruiter", "Recruiter"]), { hasPosting: false, postingRole: null }, "without a posting the second role is only another job the resume points to");
assert.deepEqual(savedPostingRole(null, null), { hasPosting: false, postingRole: null }, "an earlier kind of report has neither");

assert.equal(scoreChangeLabel({ delta: 6, since: "x" }, "Nov 1, 2026"), "Up 6 since Nov 1, 2026");
assert.equal(scoreChangeLabel({ delta: -8, since: "x" }, "Nov 1, 2026"), "Down 8 since Nov 1, 2026");
// Two reads of one page land up to 5 apart (ten resumes read four times each, November 13, 2026), so a difference
// that size is not called a change, in either direction.
assert.equal(scoreChangeLabel({ delta: -3, since: "x" }, "Nov 1, 2026"), "About the same score as Nov 1, 2026");
assert.equal(scoreChangeLabel({ delta: 5, since: "x" }, "Nov 1, 2026"), "About the same score as Nov 1, 2026");
assert.equal(scoreChangeLabel({ delta: 0, since: "x" }, "Nov 1, 2026"), "Same score as Nov 1, 2026");
// Two reports for the same role on one day: "since" that date would read as if nothing came before it.
assert.equal(scoreChangeLabel({ delta: -7, since: "x" }, "Nov 5, 2026", "Nov 5, 2026"), "Down 7 from your earlier report that day");
assert.equal(scoreChangeLabel({ delta: 6, since: "x" }, "Nov 5, 2026", "Nov 5, 2026"), "Up 6 from your earlier report that day");
assert.equal(scoreChangeLabel({ delta: -2, since: "x" }, "Nov 5, 2026", "Nov 5, 2026"), "About the same score as your earlier report that day");
assert.equal(scoreChangeLabel({ delta: 0, since: "x" }, "Nov 5, 2026", "Nov 5, 2026"), "Same score as your earlier report that day");
assert.equal(scoreChangeLabel({ delta: -9, since: "x" }, "Nov 1, 2026", "Nov 5, 2026"), "Down 9 since Nov 1, 2026");

// ---- Versions of one resume ----
const linked = [
  { id: "v3", score: 88, createdAt: "2026-11-09T12:00:00.000Z", revises: "v2" },
  { id: "solo", score: 60, createdAt: "2026-11-08T12:00:00.000Z", revises: null },
  { id: "v2", score: 81, createdAt: "2026-11-05T12:00:00.000Z", revises: "v1" },
  { id: "orphan", score: 70, createdAt: "2026-11-04T12:00:00.000Z", revises: "deleted" },
  { id: "v1", score: 77, createdAt: "2026-11-01T12:00:00.000Z" },
  { id: "branch", score: null, createdAt: "2026-11-03T12:00:00.000Z", revises: "v1" },
];
const groups = groupReportVersions(linked);
assert.deepEqual(groups.map((group) => group.map((report) => report.id)), [["v3", "v2", "branch", "v1"], ["solo"], ["orphan"]], "one group per resume, newest first, ordered by their newest report");
assert.deepEqual(groupReportVersions([...linked].reverse()).map((group) => group[0].id), ["v3", "solo", "orphan"], "the order the reports arrive in doesn't matter");
assert.deepEqual(groupReportVersions([]), []);

const versions = reportVersions(groups);
assert.deepEqual(versions.get("v3"), { number: 4, of: 4, change: { delta: 7, from: 3 } }, "measured against the version it revises");
assert.deepEqual(versions.get("v2"), { number: 3, of: 4, change: { delta: 4, from: 1 } }, "a re-check of the first version is measured against the first, not the one dated just before it");
assert.deepEqual(versions.get("branch"), { number: 2, of: 4, change: null }, "no score, no change");
assert.deepEqual(versions.get("v1"), { number: 1, of: 4, change: null });
assert.equal(versions.has("solo"), false, "a resume with one report has no versions to number");
assert.equal(versions.has("orphan"), false, "a link to a report that isn't here starts its own resume");

// A loop can't be written by the app, and must not hang the page if one ever exists.
const loop = groupReportVersions([{ id: "a", score: 1, createdAt: "2026-11-01T00:00:00.000Z", revises: "b" }, { id: "b", score: 2, createdAt: "2026-11-02T00:00:00.000Z", revises: "a" }]);
assert.deepEqual(loop.map((group) => group.map((report) => report.id)), [["b", "a"]]);

assert.equal(versionChangeLabel({ delta: 6, from: 2 }), "Up 6 from version 2");
assert.equal(versionChangeLabel({ delta: -6, from: 1 }), "Down 6 from version 1");
assert.equal(versionChangeLabel({ delta: -3, from: 1 }), "About the same score as version 1");
assert.equal(versionChangeLabel({ delta: 5, from: 2 }), "About the same score as version 2");
assert.equal(versionChangeLabel({ delta: 0, from: 1 }), "Same score as version 1");
assert.equal(earlierVersionsLabel(1), "1 earlier version");
assert.equal(earlierVersionsLabel(2), "2 earlier versions");

// ---- What a resume's revisions did ----
const line = (text: string) => ({ kind: "line", line: text, example: `${text} [detail]` });
const first = [line("Managed renewals"), line("Worked with teams"), line("Ran reviews"), { kind: "keep", line: "Managed 32 accounts", example: "x" }];
const now = [line("Worked  with teams"), line("Led onboarding"), { kind: "keep", line: "Managed 32 accounts", example: "x" }];
assert.deepEqual(revisionProgress(first, now), { gone: 2, still: 1, added: 1 }, "the kept line is never on the list; spacing doesn't make a line new");
assert.deepEqual(revisionProgress(first, [first[3]]), { gone: 3, still: 0, added: 0 });
assert.equal(revisionProgress(undefined, now), null, "an earlier-format report has no list to compare");
assert.equal(revisionProgress(first, [{ kind: "line" }]), null, "a card without its line is not compared");

assert.equal(revisionProgressLabel({ gone: 4, still: 2, added: 1 }), "4 lines are off the list. 2 are still there, and 1 new one came up.");
assert.equal(revisionProgressLabel({ gone: 1, still: 1, added: 0 }), "1 line is off the list. 1 is still there.");
assert.equal(revisionProgressLabel({ gone: 3, still: 0, added: 0 }), "All 3 lines are off the list. Nothing is on it now.");
assert.equal(revisionProgressLabel({ gone: 1, still: 0, added: 0 }), "The one line is off the list. Nothing is on it now.");
assert.equal(revisionProgressLabel({ gone: 2, still: 0, added: 2 }), "2 lines are off the list. 2 new ones came up.");
assert.equal(revisionProgressLabel({ gone: 0, still: 3, added: 0 }), "The same lines are on the list.");
assert.equal(revisionProgressLabel({ gone: 0, still: 1, added: 2 }), "The same line is on the list, and 2 new ones came up.");
assert.equal(revisionProgressLabel({ gone: 0, still: 0, added: 0 }), "Nothing on the list, then or now.");
assert.equal(revisionProgressLabel({ gone: 0, still: 0, added: 1 }), "Nothing was on the list before. 1 new one came up.");
for (const label of [{ gone: 4, still: 2, added: 1 }, { gone: 3, still: 0, added: 0 }].map(revisionProgressLabel)) assert.doesNotMatch(label, /fixed/i, "off the list is never called fixed");

assert.equal(revisionScoreLabel(17, "Not ready yet", "Mostly clear"), "Up 17, from Not ready yet to Mostly clear.");
assert.equal(revisionScoreLabel(7, "Mostly clear", "Mostly clear"), "Up 7.");
assert.equal(revisionScoreLabel(-6, "Mostly clear", "Mostly clear"), "Down 6.");
assert.equal(revisionScoreLabel(4, "Mostly clear", "Mostly clear"), "About the same score.");
assert.equal(revisionScoreLabel(-3, "Mostly clear", "Mostly clear"), "About the same score.");
// 82 and 86 are one resume read twice (the live reads of November 13, 2026), and they sit in two bands.
assert.equal(revisionScoreLabel(4, "Mostly clear", "Clear and specific"), "About the same score.", "a band's edge crossed by a re-read's worth is not a move between bands");
assert.equal(revisionScoreLabel(0, "Mostly clear", "Mostly clear"), "Same score.");

console.log("report history: lines answered, score changes, versions and what the revisions did");
