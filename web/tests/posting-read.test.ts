import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import Module from "node:module";
import path from "node:path";
import { validateResumeFeedbackRequest } from "../lib/backend/validation";
import { GenerationAccessError } from "../lib/billing/generationAccess";
import { streamResumeFeedback } from "../lib/api";
import { POSTING_READ_INCLUDED_HINT, POSTING_READS_PER_DAY } from "../lib/reports/posting-read-terms";

/**
 * The posting read on the pass (Nov 10, 2026): a resume already read, read against a posting, spends no report.
 * It is refused, with nothing spent, unless the person is signed in, holds an active pass, owns the report, and
 * sent the same resume with a posting.
 */

const RESUME = `Priya Natarajan
Senior Backend Engineer
Experience
Built the public API gateway used by partner integrations.
Moved the payouts ledger to a sharded store that handles 2.1 million transactions a day.
Organized the quarterly hack week for 40 engineers.`;

const report = {
  contract_version: "v3",
  score: 86,
  cards: [
    { kind: "line", where: "Northwind, line 1", line: "Built the public API gateway used by partner integrations.", cannot_tell: "x", example: "y [number]", question: "z" },
    { kind: "structure", where: "Structure", line: "There is no headline.", cannot_tell: "x", example: "", question: "z" },
    { kind: "keep", where: "Northwind, line 2", line: "Moved the payouts ledger to a sharded store that handles 2.1 million transactions a day.", cannot_tell: "x", example: "", question: "" },
  ],
};

// ---- The request ----
const REPORT_ID = "0b6f7c1e-2a34-4d5e-8f90-1a2b3c4d5e6f";
{
  const ok = validateResumeFeedbackRequest({ text: RESUME, jobDescription: "Staff Backend Engineer, Payments", posting_read: { report_id: REPORT_ID } });
  assert.equal(ok.ok, true);
  assert.deepEqual(ok.value?.postingRead, { reportId: REPORT_ID });
  assert.equal(validateResumeFeedbackRequest({ text: RESUME }).value?.postingRead, null);
  assert.equal(validateResumeFeedbackRequest({ text: RESUME, posting_read: { report_id: "not-a-report" } }).ok, false);
  assert.equal(validateResumeFeedbackRequest({ text: RESUME, posting_read: { report_id: REPORT_ID }, document: "linkedin" }).ok, false, "a profile review is never a posting read");
  assert.equal(validateResumeFeedbackRequest({ text: RESUME, posting_read: { report_id: REPORT_ID }, rebuild: { report_id: REPORT_ID } }).ok, false);
}

// ---- Refusals, each before anything is spent ----
function passesAdmin(rows: unknown[]) {
  const query: any = { select: () => query, eq: () => query, gt: () => query, order: () => query, limit: async () => ({ data: rows, error: null }) };
  const reports: any = { select: () => reports, eq: () => reports, maybeSingle: async () => ({ data: null, error: null }) };
  return { from: (table: string) => (table === "passes" ? query : reports) };
}
async function refusal(run: Promise<unknown>) {
  try {
    await run;
  } catch (error) {
    assert.ok(error instanceof GenerationAccessError);
    assert.equal(error.accessConsumed, false, "a refused posting read spends nothing");
    assert.match(error.message, /Nothing was used\.$/);
    return error.code;
  }
  assert.fail("expected the posting read to be refused");
}

async function run() {
  // The posting read pulls in the rate limiter, which imports through the "@/" alias; resolve it as the scripts do.
  const resolver = Module as unknown as { _resolveFilename: (request: string, ...rest: unknown[]) => string };
  const resolveFilename = resolver._resolveFilename;
  resolver._resolveFilename = function resolveAlias(this: unknown, request: string, ...rest: unknown[]) {
    return resolveFilename.call(this, request.startsWith("@/") ? path.join(process.cwd(), request.slice(2)) : request, ...rest);
  };
  const { isSameResume, quotedLinesOf, reservePostingRead, savedScoreOf, withSavedScore } = await import("../lib/reports/posting-read");

  // ---- The same resume ----
  {
    assert.deepEqual(quotedLinesOf(report), [report.cards[0].line, report.cards[2].line], "only lines quoted from the resume tie a report to it");
    assert.equal(isSameResume(report, RESUME), true);
    assert.equal(isSameResume(report, RESUME.replace("public API gateway", "partner API gateway")), false, "a revised line makes it a new resume, which is a report of its own");
    assert.equal(isSameResume({ ...report, cards: [report.cards[1]] }, RESUME), false, "a report that quotes nothing can't vouch for any text");
    assert.equal(isSameResume({ score: 70, top_fixes: [] }, RESUME), false, "an older report that quotes nothing can't vouch for any text");
    // A report saved before the worklist quotes the line behind each fix; that ties it to its resume the same way.
    const older = { score: 70, top_fixes: [
      { fix: "Say what you owned.", evidence: { section: "Experience", excerpt: report.cards[0].line } },
      { fix: "Add a summary.", evidence: { section: "Summary", excerpt: "No summary section present" } },
      { fix: "Say what changed.", evidence: report.cards[2].line },
    ] };
    assert.deepEqual(quotedLinesOf(older), [report.cards[0].line, report.cards[2].line], "a fix about something missing quotes nothing");
    assert.equal(isSameResume(older, RESUME), true, "an older report can be read against a posting too");
    assert.equal(isSameResume(older, RESUME.replace("public API gateway", "partner API gateway")), false);
    assert.equal(isSameResume({ score: 70, top_fixes: [older.top_fixes[1]] }, RESUME), false, "only missing-section fixes: nothing quoted, nothing vouched for");
  }

  // ---- The same resume keeps its score ----
  // Four live reads of one resume against one posting came back 82, 82, 82 and 86 (November 12 and 13, 2026): the
  // model scores the page again each time. The read shows the score of the report it belongs to.
  {
    assert.equal(savedScoreOf(report), 86);
    assert.equal(savedScoreOf({ score: 70, top_fixes: [] }), null, "an older report's score was worked out differently, so there is none to keep");
    assert.equal(savedScoreOf(null), null);

    const read = { ...report, score: 82, score_label: "Mostly clear", content_score: 82, lifted_by_employer: false };
    const kept = withSavedScore(read, 86);
    assert.deepEqual([kept.score, kept.score_label, kept.content_score], [86, "Clear and specific", 86], "the saved score, with the band it sits in");
    assert.equal(kept.cards, read.cards, "nothing else in the read changes");
    assert.equal(read.score, 82, "the read itself is left as it was");
    assert.equal(withSavedScore(read, 82), read, "the same score changes nothing");
    assert.equal(withSavedScore(read, null), read, "no saved score to keep: the read's own stands");
    assert.equal(withSavedScore(read, undefined), read);
    assert.equal(withSavedScore({ score: 70, top_fixes: [] }, 86).score, 70, "only a worklist report keeps one");

    // The top band is decided by the cards, and that outranks the saved score in both directions.
    assert.equal(withSavedScore(read, 95).score, 82, "a saved Ready to send never sits over a card that needs work");
    const clean = { ...read, score: 94, cards: [report.cards[2]] };
    assert.equal(withSavedScore(clean, 86).score, 94, "a page with nothing to fix never drops below the floor");
    assert.equal(withSavedScore(clean, 91).score, 91, "within the rules, the saved score is kept");
    assert.equal(withSavedScore({ ...clean, lifted_by_employer: true }, 95).score, 94, "the employer lift never reaches the top band");
  }

  assert.equal(await refusal(reservePostingRead({ reportId: REPORT_ID, text: RESUME, hasPosting: true, userId: null, admin: passesAdmin([]) })), "POSTING_READ_SIGN_IN");
  assert.equal(await refusal(reservePostingRead({ reportId: REPORT_ID, text: RESUME, hasPosting: false, userId: "user-1", admin: passesAdmin([]) })), "POSTING_READ_NO_POSTING");
  assert.equal(await refusal(reservePostingRead({ reportId: REPORT_ID, text: RESUME, hasPosting: true, userId: "user-1", admin: passesAdmin([]) })), "POSTING_READ_NO_PASS");
  // The pass's term decides, not its report count: a pass with no reports left gets past the pass check
  // (and stops here only because this admin has no such report). A revoked pass doesn't.
  const spent = { id: "pass-1", tier: "30d", expires_at: new Date(Date.now() + 86_400_000).toISOString(), uses_remaining: 0, created_at: new Date().toISOString(), revoked_at: null };
  assert.equal(await refusal(reservePostingRead({ reportId: REPORT_ID, text: RESUME, hasPosting: true, userId: "user-1", admin: passesAdmin([spent]) })), "POSTING_READ_SOURCE_UNKNOWN");
  assert.equal(await refusal(reservePostingRead({ reportId: REPORT_ID, text: RESUME, hasPosting: true, userId: "user-1", admin: passesAdmin([{ ...spent, revoked_at: new Date().toISOString() }]) })), "POSTING_READ_NO_PASS");

  // ---- The client names the report, and sends no recovery marker for it ----
  const originalFetch = globalThis.fetch;
  let body: any = null;
  try {
    globalThis.fetch = async (_input: any, init?: any) => {
      body = JSON.parse(String(init?.body || "{}"));
      return new Response(`${JSON.stringify({ type: "error", errorCode: "POSTING_READ_NO_PASS", message: "Nothing was used.", access_consumed: false })}\n`, { status: 402, headers: { "Content-Type": "application/x-ndjson" } });
    };
    const result = await streamResumeFeedback(RESUME, "Staff Backend Engineer, Payments", () => undefined, "resume", { postingRead: { reportId: REPORT_ID } });
    assert.equal(result.ok, false);
    assert.deepEqual(body?.posting_read, { report_id: REPORT_ID });
    assert.equal(body?.recovery_id, undefined);
  } finally {
    globalThis.fetch = originalFetch;
  }

  // ---- The route: reserved through the posting read, kept as its own report, and never counted ----
  const route = readFileSync(path.join(process.cwd(), "app", "api", "resume-feedback-stream", "route.ts"), "utf8");
  assert.ok(route.indexOf("postingRead ? await reservePostingRead({") > -1, "a posting read must not reach the metered reservation");
  assert.ok(route.indexOf("postingRead ? await reservePostingRead({") < route.indexOf("for await (const ev of streamJson"), "eligibility is settled before any model call");
  assert.match(route, /entitlementKind === "posting_read"/, "a posting read is saved as a report of its own, like a rebuild");
  assert.match(route, /const read = postingRead \? withSavedScore\(validated\.payload, grantedReservation\.savedReportScore\) : validated\.payload;/, "a posting read keeps the saved report's score");
  assert.ok(route.indexOf("withSavedScore(validated.payload") < route.indexOf("sendPreview(read)"), "before the wait screen shows a band");
  assert.equal((route.match(/validated\.payload/g) || []).length, 2, "and nothing downstream reads the score the model gave this time");
  assert.match(route, /\.\.\.\(unmetered \? \{\} : \{/, "a posting read says nothing about reports left");

  // ---- The words ----
  assert.equal(POSTING_READ_INCLUDED_HINT, "Included with your pass. This one doesn't use a report.");
  assert.ok(POSTING_READS_PER_DAY >= 5 && POSTING_READS_PER_DAY <= 25, "the day's limit is a cost guard, not a wall a normal day of applying hits");

  console.log("posting read tests passed");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
