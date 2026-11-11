import assert from "node:assert/strict";
import {
  liftAnswersFromStored,
  mergeLineAnswers,
  parseLineAnswersPatch,
  parseStoredLineAnswers,
  storedAnswersFromLift,
  sendLineAnswers,
  getPendingLineAnswers,
  subscribePendingLineAnswers,
  waitForLineAnswerWrites,
  stageLineAnswers,
  discardPendingLineAnswers,
  type PendingLineAnswersChange,
  LINE_ANSWER_LIMITS,
} from "../lib/reports/line-answers";

// ============================================
// The request body: bounded, typed, and never the resume
// ============================================

const good = {
  fix_index: 0,
  answers: [
    { question: "Which inventory feature did you develop?", kind: "answered", text: "  the low-stock   alert view " },
    { question: "What task did it help users perform?", kind: "unknown" },
  ],
  line: "Responsible for developing features: the low-stock alert view.",
  source: "literal",
};
const parsed = parseLineAnswersPatch(good);
assert.ok(parsed);
assert.equal(parsed!.answers[0].kind, "answered");
assert.equal((parsed!.answers[0] as { text: string }).text, "the low-stock alert view", "whitespace is collapsed");
assert.equal(parsed!.answers[1].kind, "unknown");
assert.equal(parsed!.source, "literal");

assert.equal(parseLineAnswersPatch({ ...good, fix_index: LINE_ANSWER_LIMITS.fixes }), null, "only a card position the report can have");
assert.equal(parseLineAnswersPatch({ ...good, fix_index: "0" }), null);
assert.equal(parseLineAnswersPatch({ ...good, answers: [] }), null, "nothing to keep");
const clear = { fix_index: 0, answers: [], line: null, source: "literal" as const };
assert.deepEqual(parseLineAnswersPatch(clear), clear, "empty answers and a null literal line explicitly clear the card");
assert.equal(parseLineAnswersPatch({ ...clear, source: "polished" }), null, "a clear cannot claim a composed line source");
assert.equal(parseLineAnswersPatch({ ...clear, line: "old line" }), null, "a clear cannot retain the previous line");
assert.equal(parseLineAnswersPatch({ ...good, answers: [{ question: "Q?", kind: "answered", text: "" }] }), null, "an empty answer is not an answer");
assert.equal(parseLineAnswersPatch({ ...good, answers: [{ question: "Q?", kind: "answered", text: "x".repeat(LINE_ANSWER_LIMITS.text + 1) }] }), null);
assert.equal(parseLineAnswersPatch({ ...good, answers: [{ question: "Q?", kind: "open" }] }), null, "open questions are not stored");
assert.equal(parseLineAnswersPatch({ ...good, source: "model" }), null);
assert.equal(parseLineAnswersPatch({ ...good, line: "" }), null, "an empty string is not a line; null clears it");
assert.ok(parseLineAnswersPatch({ ...good, line: null }));
assert.equal(parseLineAnswersPatch({ ...good, line: "x".repeat(LINE_ANSWER_LIMITS.line + 1) }), null);
assert.equal(parseLineAnswersPatch(null), null);

// ============================================
// The stored column: one entry per fix, merged without losing the others
// ============================================

const first = mergeLineAnswers(null, parsed!, new Date("2026-11-02T20:00:00Z"));
assert.deepEqual(Object.keys(first), ["0"]);
assert.equal(first["0"].updated_at, "2026-11-02T20:00:00.000Z");
const second = mergeLineAnswers(first, { fix_index: 2, answers: [{ question: "Scope?", kind: "not_mine" }], line: null, source: "literal" }, new Date("2026-11-02T20:05:00Z"));
assert.deepEqual(Object.keys(second).sort(), ["0", "2"]);
assert.equal(second["0"].line, good.line, "an earlier fix's answers survive a later fix's save");
const replaced = mergeLineAnswers(second, { fix_index: 0, answers: [{ question: "Q?", kind: "unknown" }], line: null, source: "literal" });
assert.equal(replaced["0"].line, null, "saving a fix again replaces its entry");
const cleared = mergeLineAnswers(second, clear);
assert.deepEqual(Object.keys(cleared), ["2"], "clearing one card keeps the other card");
assert.deepEqual(mergeLineAnswers(cleared, clear), cleared, "clearing twice is idempotent");
assert.deepEqual(Object.keys(second).sort(), ["0", "2"], "clearing does not mutate the original object");

assert.deepEqual(parseStoredLineAnswers({ "0": { answers: [{ question: "Q?", kind: "answered", text: "a" }], line: "L", source: "edited", updated_at: "2026-11-02T20:00:00.000Z" }, junk: 1, "5": {} }),
  { "0": { answers: [{ question: "Q?", kind: "answered", text: "a" }], line: "L", source: "edited", updated_at: "2026-11-02T20:00:00.000Z" } },
  "unknown keys and malformed entries are dropped, not fatal");
assert.equal(parseStoredLineAnswers("nope"), null);
assert.equal(parseStoredLineAnswers({ "0": { answers: [], line: null, source: "literal" } }), null, "an entry with no answers reads as nothing kept");

// ============================================
// Back into the report: matched by question text, so a reworded question starts fresh
// ============================================

const stored = first["0"];
const lifted = liftAnswersFromStored(stored, ["Which inventory feature did you develop?", "What task did it help users perform?", "Which roles helped?"]);
assert.ok(lifted);
assert.deepEqual(lifted!.answers, [{ kind: "answered", value: "the low-stock alert view" }, { kind: "unknown" }, { kind: "open" }]);
assert.equal(lifted!.line, good.line);
assert.equal(liftAnswersFromStored(stored, ["A different question?"]), null, "nothing matches, nothing is restored");
assert.equal(liftAnswersFromStored(undefined, ["Q?"]), null);

assert.deepEqual(storedAnswersFromLift(["Q1?", "Q2?", "Q3?"], [{ kind: "answered", value: " a  b " }, { kind: "open" }, { kind: "not_mine" }]),
  [{ question: "Q1?", kind: "answered", text: "a b" }, { question: "Q3?", kind: "not_mine" }]);

// ============================================
// Sending: a bad id or a failed request resolves false, never throws
// ============================================

(async () => {
const calls: Array<{ url: string; body: unknown }> = [];
const fakeFetch = (async (url: string, init?: RequestInit) => {
  calls.push({ url, body: JSON.parse(String(init?.body)) });
  return new Response("{}", { status: 200 });
}) as unknown as typeof fetch;
assert.equal(await sendLineAnswers("not-a-uuid", parsed!, fakeFetch), false);
assert.equal(calls.length, 0, "no request for a bad id");
assert.equal(await sendLineAnswers("1ec2778f-9c09-42fd-9910-fc5ec3f47e44", parsed!, fakeFetch), true);
assert.equal(calls[0].url, "/api/reports/1ec2778f-9c09-42fd-9910-fc5ec3f47e44/answers");
assert.equal(await sendLineAnswers("1ec2778f-9c09-42fd-9910-fc5ec3f47e44", parsed!, (async () => new Response("{}", { status: 500 })) as unknown as typeof fetch), false);
assert.equal(await sendLineAnswers("1ec2778f-9c09-42fd-9910-fc5ec3f47e44", parsed!, (async () => { throw new Error("offline"); }) as unknown as typeof fetch), false);
// Clear the failed marker before the browser-warning cases below.
assert.equal(await sendLineAnswers("1ec2778f-9c09-42fd-9910-fc5ec3f47e44", parsed!, fakeFetch), true);

// ============================================
// Shared writes: navigation cannot let an older view overwrite a newer card edit
// ============================================

const reportA = "d0d97587-a173-4b42-9cd1-1aa0e9ce32be";
const reportB = "becbbd36-11bd-47db-a4b9-6b21b672ebaf";
function responseGate() {
  let resolve!: (response: Response) => void;
  const promise = new Promise<Response>((done) => { resolve = done; });
  return { promise, resolve };
}
async function nextTurn() { await new Promise<void>((resolve) => setImmediate(resolve)); }

const held = responseGate();
const seen: Array<{ url: string; body: typeof parsed }> = [];
const queuedFetch = (async (url: string, init?: RequestInit) => {
  const value = JSON.parse(String(init?.body));
  seen.push({ url, body: value });
  return seen.length === 1 ? held.promise : new Response("{}", { status: 200 });
}) as unknown as typeof fetch;
const older = sendLineAnswers(reportA, parsed!, queuedFetch);
await nextTurn();
const nextPatch = { ...parsed!, answers: [{ question: "Latest?", kind: "answered" as const, text: "newest edit" }] };
const newer = sendLineAnswers(reportA.toUpperCase(), nextPatch, queuedFetch);
// Simulate the newer view changing its local object while its first save is queued.
nextPatch.answers[0].text = "later local mutation";
assert.equal((getPendingLineAnswers(reportA, 0)?.patch.answers[0] as { text: string }).text, "newest edit", "the retained draft is a snapshot of the edit, not its caller's mutable object");
const otherCard = sendLineAnswers(reportA, { ...parsed!, fix_index: 1 }, queuedFetch);
const otherReport = sendLineAnswers(reportB, parsed!, queuedFetch);
await Promise.all([otherCard, otherReport]);
assert.equal(seen.length, 3, "other cards and reports proceed while one card's older write is held");
assert.equal(seen.filter((call) => call.url.toLowerCase().includes(reportA) && call.body?.fix_index === 0).length, 1, "the reopened view waits for the older write to the same card, including differently cased report ids");
held.resolve(new Response("{}", { status: 200 }));
assert.deepEqual(await Promise.all([older, newer]), [true, true]);
assert.equal(getPendingLineAnswers(reportA, 0), null, "confirmed answers are not retained as a stale cache");
assert.equal(seen[3].body?.answers[0].kind, "answered");
assert.equal((seen[3].body?.answers[0] as { text: string }).text, "newest edit", "a queued request captures its body at the time of the edit");

const failedGate = responseGate();
let failureCalls = 0;
const recoveringFetch = (async () => {
  failureCalls += 1;
  if (failureCalls === 1) return failedGate.promise;
  return new Response("{}", { status: 200 });
}) as unknown as typeof fetch;
const failed = sendLineAnswers(reportA, parsed!, recoveringFetch);
const afterFailure = sendLineAnswers(reportA, clear, recoveringFetch);
await nextTurn();
assert.equal(failureCalls, 1);
failedGate.resolve(new Response("{}", { status: 503 }));
assert.deepEqual(await Promise.all([failed, afterFailure]), [false, true], "a failed save does not stall the next edit");
assert.equal(failureCalls, 2, "failure is not implicitly retried");

const coalescedGate = responseGate();
const coalescedCalls: unknown[] = [];
const coalescedFetch = (async (_url: string, init?: RequestInit) => {
  coalescedCalls.push(JSON.parse(String(init?.body)));
  return coalescedCalls.length === 1 ? coalescedGate.promise : new Response("{}", { status: 200 });
}) as unknown as typeof fetch;
const coalescedFirst = sendLineAnswers(reportA, parsed!, coalescedFetch);
const superseded = sendLineAnswers(reportA, { ...parsed!, line: "intermediate edit" }, coalescedFetch);
const coalescedLast = sendLineAnswers(reportA, clear, coalescedFetch);
assert.equal(await superseded, false, "only the newest queued edit is retained behind an in-flight request");
assert.equal(coalescedCalls.length, 1);
assert.deepEqual(getPendingLineAnswers(reportA, 0)?.patch, clear, "superseding a queued request does not replace the latest draft with a failure");
coalescedGate.resolve(new Response("{}", { status: 200 }));
assert.deepEqual(await Promise.all([coalescedFirst, coalescedLast]), [true, true]);
assert.deepEqual(coalescedCalls, [parsed, clear], "the superseded intermediate edit is never sent");

const firstReadGate = responseGate();
const latestReadGate = responseGate();
const unrelatedReadGate = responseGate();
const beforeRead = sendLineAnswers(reportA, parsed!, (async () => firstReadGate.promise) as unknown as typeof fetch);
const unrelated = sendLineAnswers(reportB, parsed!, (async () => unrelatedReadGate.promise) as unknown as typeof fetch);
let canRead = false;
const readyToRead = waitForLineAnswerWrites(reportA.toUpperCase()).then(() => { canRead = true; });
const addedWhileWaiting = sendLineAnswers(reportA, clear, (async () => latestReadGate.promise) as unknown as typeof fetch);
await nextTurn();
assert.equal(canRead, false);
firstReadGate.resolve(new Response("{}", { status: 200 }));
await beforeRead;
await nextTurn();
assert.equal(canRead, false, "reopening waits for an edit added after the original read wait began");
latestReadGate.resolve(new Response("{}", { status: 503 }));
assert.equal(await addedWhileWaiting, false);
await readyToRead;
assert.equal(canRead, true, "a failed write settles the read wait; its retained draft provides recovery");
assert.equal(getPendingLineAnswers(reportA, 0)?.state, "failed");
// report B is still held: reopening A must not wait for unrelated reports.
assert.equal(await sendLineAnswers(reportA, clear, fakeFetch), true);
unrelatedReadGate.resolve(new Response("{}", { status: 200 }));
await unrelated;
await waitForLineAnswerWrites("not-a-uuid");

// ============================================
// Leaving the document: warn until the latest write succeeds, even after a failed view is gone
// ============================================

const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
const unloadListeners = new Set<EventListener>();
const browserWindow = {
  addEventListener(type: string, listener: EventListener) { if (type === "beforeunload") unloadListeners.add(listener); },
  removeEventListener(type: string, listener: EventListener) { if (type === "beforeunload") unloadListeners.delete(listener); },
};
Object.defineProperty(globalThis, "window", { configurable: true, value: browserWindow });
try {
  assert.equal(getPendingLineAnswers("not-a-uuid", 0), null);
  assert.equal(getPendingLineAnswers(reportA, LINE_ANSWER_LIMITS.fixes), null);
  let notifications = 0;
  const unsubscribe = subscribePendingLineAnswers(reportA, 0, () => { notifications += 1; });
  const firstGate = responseGate();
  const lastGate = responseGate();
  let unloadCalls = 0;
  const unloadFetch = (async () => {
    unloadCalls += 1;
    return unloadCalls === 1 ? firstGate.promise : lastGate.promise;
  }) as unknown as typeof fetch;
  const firstWrite = sendLineAnswers(reportA, parsed!, unloadFetch);
  const lastWrite = sendLineAnswers(reportA, clear, unloadFetch);
  assert.equal(notifications, 2, "a remounted view sees each pending edit to its card");
  const pendingSnapshot = getPendingLineAnswers(reportA, 0);
  assert.equal(pendingSnapshot?.state, "saving");
  assert.deepEqual(pendingSnapshot?.patch, clear, "a pending clear can restore empty fields on remount");
  assert.equal(getPendingLineAnswers(reportA, 0), pendingSnapshot, "external-store snapshots stay stable until a change");
  assert.equal(unloadListeners.size, 1, "one document warning covers pending writes");
  let prevented = false;
  const event = { preventDefault() { prevented = true; }, returnValue: undefined };
  for (const listener of unloadListeners) listener(event as unknown as Event);
  assert.equal(prevented, true);
  assert.equal(event.returnValue, "");
  firstGate.resolve(new Response("{}", { status: 200 }));
  assert.equal(await firstWrite, true);
  assert.equal(getPendingLineAnswers(reportA, 0), pendingSnapshot, "the old completion cannot erase the newer view's draft");
  assert.equal(notifications, 2);
  assert.equal(unloadListeners.size, 1, "an older success cannot clear the newer edit's warning");
  lastGate.resolve(new Response("{}", { status: 503 }));
  assert.equal(await lastWrite, false);
  const failedSnapshot = getPendingLineAnswers(reportA, 0);
  assert.equal(failedSnapshot?.state, "failed");
  assert.deepEqual(failedSnapshot?.patch, clear, "the failed latest edit remains available for explicit retry");
  assert.equal(getPendingLineAnswers(reportA, 0), failedSnapshot);
  assert.equal(notifications, 3);
  assert.equal(unloadListeners.size, 1, "a failed save remains unsaved after its request settles");
  await nextTurn();
  assert.equal(unloadCalls, 2, "leaving a failure marker does not retry a request");
  assert.equal(await sendLineAnswers(reportB, clear, fakeFetch), true);
  assert.equal(notifications, 3, "another report cannot update this card's observer");
  assert.equal(unloadListeners.size, 1, "saving a different report cannot clear the failed card's warning");
  assert.equal(await sendLineAnswers(reportA, clear, fakeFetch), true);
  assert.equal(getPendingLineAnswers(reportA, 0), null);
  assert.equal(notifications, 5, "retry announces pending then confirmed removal");
  unsubscribe();
  assert.equal(unloadListeners.size, 0, "a newer successful save of the same card clears its warning");

  const abortGate = responseGate();
  let abortCalls = 0;
  const abortFetch = (async () => {
    abortCalls += 1;
    return abortCalls === 1 ? abortGate.promise : new Response("{}", { status: 200 });
  }) as unknown as typeof fetch;
  const controller = new AbortController();
  const beforeAbort = sendLineAnswers(reportA, parsed!, abortFetch);
  const aborted = sendLineAnswers(reportA, clear, abortFetch, controller.signal);
  controller.abort();
  abortGate.resolve(new Response("{}", { status: 200 }));
  assert.deepEqual(await Promise.all([beforeAbort, aborted]), [true, false]);
  assert.equal(abortCalls, 1, "an edit aborted while queued is never dispatched");
  assert.equal(unloadListeners.size, 1, "the aborted newest edit has not been saved");
  assert.equal(await sendLineAnswers(reportA, clear, fakeFetch), true);
  assert.equal(unloadListeners.size, 0);
  assert.equal(notifications, 5, "unmounted subscribers are detached without deleting unsaved data");

  const stagedGate = responseGate();
  const reasons: PendingLineAnswersChange[] = [];
  const stopObserving = subscribePendingLineAnswers(reportA, 0, (reason) => { reasons.push(reason); });
  const beforeDebounce = sendLineAnswers(reportA, parsed!, (async () => stagedGate.promise) as unknown as typeof fetch);
  const staged = stageLineAnswers(reportA, clear);
  assert.equal(getPendingLineAnswers(reportA, 0), staged);
  assert.equal(unloadListeners.size, 1, "a local debounce already has an unload warning");
  stagedGate.resolve(new Response("{}", { status: 200 }));
  await beforeDebounce;
  assert.equal(getPendingLineAnswers(reportA, 0), staged, "an old network success cannot erase a newer staged edit");
  assert.deepEqual(reasons, ["changed", "changed"]);
  stageLineAnswers(reportB, clear);
  discardPendingLineAnswers("not-a-uuid");
  assert.equal(getPendingLineAnswers(reportA, 0), staged, "invalid discard identities cannot clear drafts");
  discardPendingLineAnswers(reportA.toUpperCase());
  assert.equal(getPendingLineAnswers(reportA, 0), null);
  assert.equal(getPendingLineAnswers(reportB, 0)?.state, "saving", "confirmed report deletion only clears that report");
  assert.equal(unloadListeners.size, 1);
  assert.deepEqual(reasons, ["changed", "changed", "discarded"], "discard is distinct from a successful save");
  discardPendingLineAnswers();
  assert.equal(getPendingLineAnswers(reportB, 0), null, "confirmed identity loss clears remaining session drafts");
  assert.equal(unloadListeners.size, 0);
  stopObserving();

  const discardedGate = responseGate();
  const signedBackInGate = responseGate();
  let discardCalls = 0;
  const discardedFetch = (async () => {
    discardCalls += 1;
    return discardCalls === 1 ? discardedGate.promise : signedBackInGate.promise;
  }) as unknown as typeof fetch;
  const discardedRunning = sendLineAnswers(reportA, parsed!, discardedFetch);
  const discardedQueued = sendLineAnswers(reportA, clear, discardedFetch);
  discardPendingLineAnswers(reportA);
  assert.deepEqual(await Promise.all([discardedRunning, discardedQueued]), [false, false]);
  assert.equal(discardCalls, 1, "discard cancels the queued request before it starts");
  assert.equal(getPendingLineAnswers(reportA, 0), null);
  assert.equal(unloadListeners.size, 0);
  let discardedReadReady = false;
  const discardedRead = waitForLineAnswerWrites(reportA).then(() => { discardedReadReady = true; });
  const readAbort = new AbortController();
  const abandonedRead = waitForLineAnswerWrites(reportA, readAbort.signal);
  readAbort.abort();
  await abandonedRead;
  await nextTurn();
  assert.equal(discardedReadReady, false, "a new read still waits for the old request's actual server response");
  const afterIdentityReturn = sendLineAnswers(reportA, { ...parsed!, line: "new account-session edit" }, discardedFetch);
  const returnedSnapshot = getPendingLineAnswers(reportA, 0);
  await nextTurn();
  assert.equal(discardCalls, 1, "a later visit preserves the ignored in-flight request's ordering barrier");
  discardedGate.resolve(new Response("{}", { status: 503 }));
  await nextTurn();
  assert.equal(discardCalls, 2);
  assert.equal(getPendingLineAnswers(reportA, 0), returnedSnapshot, "a discarded request's late failure cannot restore its old payload");
  assert.equal(discardedReadReady, false, "the read also waits for a newer edit queued during the barrier");
  signedBackInGate.resolve(new Response("{}", { status: 200 }));
  assert.equal(await afterIdentityReturn, true);
  await discardedRead;
  assert.equal(getPendingLineAnswers(reportA, 0), null);
  assert.equal(unloadListeners.size, 0);
} finally {
  if (previousWindow) Object.defineProperty(globalThis, "window", previousWindow);
  else Reflect.deleteProperty(globalThis, "window");
}

console.log("line answers tests passed");
})().catch((error) => { console.error(error); process.exitCode = 1; });
