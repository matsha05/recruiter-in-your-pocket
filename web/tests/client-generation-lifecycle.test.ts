import assert from "node:assert/strict";
import {
  cancelOwnedAnalysisRun,
  finishOwnedAnalysisRun,
  ownsAnalysisRun,
  type AnalysisControllerRef,
} from "../lib/analysis-run-ownership";
import { fetchFreeStatusSnapshot, refreshFreeStatusBalance } from "../lib/free-status-client";
import { publishAuthoritativeAnalysis } from "../lib/analysis-completion";

function response(body: unknown, status = 200) {
  return Promise.resolve(new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  }));
}

async function run() {
  await assert.rejects(
    () => fetchFreeStatusSnapshot(() => response({ ok: false, free_uses_left: 0 }, 500) as any),
    /HTTP 500/,
    "a 500 error body must not become an authoritative refresh",
  );
  await assert.rejects(
    () => fetchFreeStatusSnapshot(() => response({ ok: false, free_uses_left: 0 }) as any),
    /HTTP 200/,
    "ok:false must fail closed even when the transport is 2xx",
  );

  let remaining = 2;
  const refreshed = await refreshFreeStatusBalance({
    fallbackDecrement: true,
    setRemaining: (value) => {
      remaining = typeof value === "function" ? value(remaining) : value;
    },
    fetcher: (() => response({ ok: false, free_uses_left: 0 }, 500)) as any,
  });
  assert.equal(refreshed, false);
  assert.equal(remaining, 1, "a consumed attempt must conservatively decrement when refresh is not authoritative");

  let timedOutSignal: AbortSignal | null | undefined;
  const stalledBalance = await refreshFreeStatusBalance({
    fallbackDecrement: true,
    timeoutMs: 15,
    setRemaining: (value) => {
      remaining = typeof value === "function" ? value(remaining) : value;
    },
    fetcher: ((_url: unknown, init?: RequestInit) => {
      timedOutSignal = init?.signal;
      return new Promise<Response>(() => undefined);
    }) as typeof fetch,
  });
  assert.equal(stalledBalance, false, "a stalled balance request must settle instead of blocking failure recovery");
  assert.equal(timedOutSignal?.aborted, true, "the timed-out transport must be canceled");
  assert.equal(remaining, 0, "an explicitly consumed attempt still gets its conservative fallback");
  await assert.rejects(
    () => fetchFreeStatusSnapshot((async () => new Response(new ReadableStream())) as typeof fetch, { timeoutMs: 15 }),
    /timed out/,
    "a response whose JSON body never finishes must obey the same deadline",
  );
  const canceledStatus = new AbortController();
  canceledStatus.abort();
  let canceledFetchCalls = 0;
  await assert.rejects(
    () => fetchFreeStatusSnapshot((() => { canceledFetchCalls += 1; return response({ ok: true, free_uses_left: 1 }); }) as typeof fetch, { signal: canceledStatus.signal }),
    { name: "AbortError" },
  );
  assert.equal(canceledFetchCalls, 0, "an obsolete request must not start a new transport");

  let resolveDelayed!: (response: Response) => void;
  const delayedResponse = new Promise<Response>((resolve) => { resolveDelayed = resolve; });
  const stoppedRunA = new AbortController();
  const stoppedActive: AnalysisControllerRef = { current: stoppedRunA };
  const latestAfterStop: AnalysisControllerRef = { current: stoppedRunA };
  cancelOwnedAnalysisRun(stoppedActive, latestAfterStop, false);
  assert.equal(ownsAnalysisRun(latestAfterStop, stoppedRunA), true);
  remaining = 3;
  const staleRefresh = refreshFreeStatusBalance({
    fallbackDecrement: true,
    setRemaining: (value) => {
      remaining = typeof value === "function" ? value(remaining) : value;
    },
    fetcher: (() => delayedResponse) as any,
    shouldApply: () => ownsAnalysisRun(latestAfterStop, stoppedRunA),
  });
  const replacementRunB = new AbortController();
  stoppedActive.current = replacementRunB;
  latestAfterStop.current = replacementRunB;
  resolveDelayed(new Response(JSON.stringify({ ok: true, free_uses_left: 0 }), { status: 200 }));
  assert.equal(await staleRefresh, false);
  assert.equal(remaining, 3, "Run A must not overwrite Run B's balance when its refresh resolves late");

  let rejectDelayed!: (error: Error) => void;
  const delayedFailure = new Promise<Response>((_resolve, reject) => { rejectDelayed = reject; });
  const staleFallback = refreshFreeStatusBalance({
    fallbackDecrement: true,
    setRemaining: (value) => {
      remaining = typeof value === "function" ? value(remaining) : value;
    },
    fetcher: (() => delayedFailure) as any,
    shouldApply: () => ownsAnalysisRun(latestAfterStop, stoppedRunA),
  });
  rejectDelayed(new Error("late Run A refresh failed"));
  assert.equal(await staleFallback, false);
  assert.equal(remaining, 3, "Run A must not apply its fallback decrement after Run B owns the UI");

  const completionEvents: string[] = [];
  const published = publishAuthoritativeAnalysis({
    showReport: () => { completionEvents.push("report"); },
    finishOwner: () => true,
    clearLoading: () => { completionEvents.push("clear"); },
    refresh: () => new Promise(() => undefined),
  });
  assert.equal(published, true);
  assert.deepEqual(completionEvents, ["report", "clear"], "a never-resolving refresh must not hide a complete report");

  const runA = new AbortController();
  const active: AnalysisControllerRef = { current: runA };
  const latest: AnalysisControllerRef = { current: runA };
  cancelOwnedAnalysisRun(active, latest, false);
  assert.equal(runA.signal.aborted, true);
  assert.equal(ownsAnalysisRun(latest, runA), true, "Stop without a replacement run must retain settlement ownership");

  const runB = new AbortController();
  active.current = runB;
  latest.current = runB;
  assert.equal(finishOwnedAnalysisRun(active, runA), false, "late Run A cleanup must not finish Run B");
  assert.equal(active.current, runB);
  assert.equal(ownsAnalysisRun(latest, runA), false);
  assert.equal(finishOwnedAnalysisRun(active, runB), true);
  assert.equal(active.current, null);
}

run().then(() => console.log("client generation lifecycle tests passed")).catch((error) => {
  console.error(error);
  process.exit(1);
});
