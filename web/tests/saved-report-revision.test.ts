import assert from "node:assert/strict";
import Module from "node:module";
import type { ReadonlyURLSearchParams } from "next/navigation";
import { schemaValidReport } from "./helpers/report-fidelity-fixture";
import { getSavedReportRevisionHref } from "../lib/reports/saved-report-revision";

type RuntimeModule = typeof Module & { _load: (request: string, parent: NodeModule | null, isMain: boolean) => unknown };
type Effect = { dependencies: unknown[]; cleanup?: () => void };

function createHookHarness() {
  const slots: unknown[] = [];
  let cursor = 0;
  const effects = new Set<Effect>();
  const pending: Array<() => void> = [];
  const react = {
    useRef<T>(initial: T) {
      const index = cursor++;
      slots[index] ??= { current: initial };
      return slots[index] as { current: T };
    },
    useState<T>(initial: T) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = initial;
      return [slots[index] as T, (value: T | ((previous: T) => T)) => {
        slots[index] = typeof value === "function" ? (value as (previous: T) => T)(slots[index] as T) : value;
      }] as const;
    },
    useCallback<T>(callback: T) { return callback; },
    useEffect(callback: () => void | (() => void), dependencies: unknown[]) {
      const index = cursor++;
      const previous = slots[index] as Effect | undefined;
      if (previous && dependencies.every((value, i) => Object.is(value, previous.dependencies[i]))) return;
      const effect: Effect = { dependencies };
      slots[index] = effect;
      pending.push(() => {
        previous?.cleanup?.();
        if (previous) effects.delete(previous);
        effect.cleanup = callback() || undefined;
        effects.add(effect);
      });
    },
  };
  return {
    react,
    render<T>(render: () => T) { cursor = 0; return render(); },
    flush() { for (const effect of pending.splice(0)) effect(); },
    unmount() { for (const effect of effects) effect.cleanup?.(); },
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((done, fail) => { resolve = done; reject = fail; });
  return { promise, resolve, reject };
}

const reportAId = "11111111-1111-4111-8111-111111111111";
const reportBId = "22222222-2222-4222-8222-222222222222";
const reportPayload = (id = reportAId) => ({
  ok: true,
  report: { ...schemaValidReport, report_id: id, original_extra_evidence: { excerpt: "Preserve this evidence." } },
  resumeText: "Old resume must not be hydrated",
  jdPreview: "Old job must not be hydrated",
});
const response = (payload: unknown, status = 200) => new Response(JSON.stringify(payload), { status });
const nextTurn = () => new Promise<void>((resolve) => setImmediate(resolve));

async function run() {
  assert.equal(getSavedReportRevisionHref(reportAId), `/workspace?revision=${reportAId}`);
  for (const invalid of ["1", "", "../../private", `${reportAId}?other=1`, "not-a-report-id"]) {
    assert.equal(getSavedReportRevisionHref(invalid), null, "only validated saved IDs become comparison links");
  }

  const runtimeModule = Module as RuntimeModule;
  const originalLoad = runtimeModule._load;
  const originalFetch = global.fetch;
  let harness = createHookHarness();
  runtimeModule._load = function loadHookRuntime(request, parent, isMain) {
    if (request === "react") return {
      useRef: <T>(value: T) => harness.react.useRef(value),
      useState: <T>(value: T) => harness.react.useState(value),
      useCallback: <T>(value: T) => harness.react.useCallback(value),
      useEffect: (callback: () => void | (() => void), dependencies: unknown[]) => harness.react.useEffect(callback, dependencies),
    };
    return originalLoad(request, parent, isMain);
  };
  const { useSavedReportRevision } = require("../components/workspace/hooks/useSavedReportRevision") as typeof import("../components/workspace/hooks/useSavedReportRevision");
  runtimeModule._load = originalLoad;

  let beginCount = 0;
  let options!: Parameters<typeof useSavedReportRevision>[0];
  let requests: Array<{ url: string; init?: RequestInit; reply: ReturnType<typeof deferred<Response>> }> = [];
  const reset = (query = `revision=${reportAId}`, userId: string | null = "user-a", isAuthLoading = false) => {
    harness.unmount();
    harness = createHookHarness();
    requests = [];
    beginCount = 0;
    global.fetch = async (input, init) => {
      const reply = deferred<Response>();
      requests.push({ url: String(input), init, reply });
      // Ignore abort intentionally so the hook must reject stale replies itself.
      return reply.promise;
    };
    options = {
      searchParams: new URLSearchParams(query) as ReadonlyURLSearchParams,
      userId,
      isAuthLoading,
      onBeginRevision: () => { beginCount += 1; },
    };
  };
  const read = () => harness.render(() => useSavedReportRevision(options));
  const render = () => { read(); harness.flush(); return read(); };
  const navigate = (query: string) => { options.searchParams = new URLSearchParams(query) as ReadonlyURLSearchParams; };

  try {
    for (const query of ["", "revision=1"]) {
      reset(query);
      assert.equal(render().active, false);
      assert.equal(requests.length, 0, "ordinary and in-memory workspaces never fetch saved baselines");
      assert.equal(beginCount, 0);
    }

    reset("revision=not-a-report");
    assert.equal(render().state, "invalid");
    assert.equal(requests.length, 0);
    assert.match(render().error || "", /comparison link/);

    reset(`revision=${reportAId}`, null, true);
    assert.equal(render().state, "loading");
    assert.equal(requests.length, 0, "wait for auth resolution before any private fetch");
    options.isAuthLoading = false;
    assert.equal(render().state, "signed_out");
    assert.equal(requests.length, 0, "signed-out users cannot load a baseline");
    options.userId = "user-a";
    assert.equal(render().state, "loading");
    assert.equal(requests.length, 1);
    assert.equal(requests[0].url, `/api/reports/${reportAId}`);
    assert.equal(requests[0].init?.credentials, "same-origin");
    assert.equal(requests[0].init?.cache, "no-store");
    requests[0].reply.resolve(response(reportPayload()));
    await nextTurn();
    let controls = render();
    assert.equal(controls.state, "ready");
    assert.deepEqual(controls.baseline, { ...reportPayload().report, id: reportAId }, "preserve the full original report");
    assert.equal("resumeText" in controls.baseline!, false);
    assert.equal("jdPreview" in controls.baseline!, false);

    options.userId = "user-b";
    assert.equal(read().baseline, null, "account changes must hide the old baseline before effects run");
    harness.flush();
    assert.equal(requests[0].init?.signal?.aborted, true);
    requests[1].reply.resolve(response({ ok: false }, 404));
    await nextTurn();
    assert.equal(render().state, "not_found");
    assert.equal(render().baseline, null);

    for (const [status, expected] of [[401, "signed_out"], [403, "not_found"], [404, "not_found"], [409, "untrusted"], [500, "error"]] as const) {
      reset();
      render();
      requests[0].reply.resolve(response({ ok: false }, status));
      await nextTurn();
      controls = render();
      assert.equal(controls.state, expected);
      assert.ok(controls.error, "every failure has a visible recovery message");
      assert.equal(controls.baseline, null);
    }

    for (const malformed of [{ ok: true }, { ok: true, report: [] }, reportPayload(reportBId), { ok: true, report: { report_id: reportAId, score: 72 } }]) {
      reset();
      render();
      requests[0].reply.resolve(response(malformed));
      await nextTurn();
      assert.equal(render().state, "error", "missing, partial, or mismatched report bodies cannot become baselines");
    }

    reset();
    controls = render();
    controls.clearSavedRevision();
    assert.equal(requests[0].init?.signal?.aborted, true);
    requests[0].reply.resolve(response(reportPayload()));
    await nextTurn();
    controls = render();
    assert.equal(controls.active, false);
    assert.equal(controls.baseline, null, "new-report dismisses late baseline replies immediately");
    options.userId = "user-b";
    controls.retrySavedRevision();
    render();
    assert.equal(requests.length, 1, "auth changes and retries cannot revive a dismissed route before navigation finishes");
    navigate("");
    render();
    navigate(`revision=${reportBId}`);
    render();
    assert.equal(requests.length, 2, "a new saved report can be opened after dismissal");

    reset();
    render();
    navigate(`revision=${reportBId}`);
    assert.equal(read().baseline, null);
    harness.flush();
    requests[1].reply.resolve(response(reportPayload(reportBId)));
    await nextTurn();
    requests[0].reply.resolve(response(reportPayload()));
    await nextTurn();
    assert.equal(render().baseline?.id, reportBId, "navigation ignores a delayed reply for the previous report");
    navigate("");
    assert.equal(read().baseline, null, "leaving revision mode hides its baseline immediately");
    harness.flush();

    reset();
    render();
    options.userId = "user-b";
    read();
    requests[0].reply.resolve(response(reportPayload()));
    await nextTurn();
    assert.equal(read().baseline, null, "identity changes reject old replies even before effect cleanup");
    harness.flush();
    requests[1].reply.resolve(response({ ok: false }, 404));
    await nextTurn();
    assert.equal(render().baseline, null);

    reset();
    controls = render();
    const body = deferred<unknown>();
    requests[0].reply.resolve({ ok: true, status: 200, json: () => body.promise } as Response);
    await nextTurn();
    controls.clearSavedRevision();
    body.resolve(reportPayload());
    await nextTurn();
    assert.equal(render().baseline, null, "late JSON parsing cannot revive a canceled comparison");

    reset();
    render();
    requests[0].reply.reject(new Error("Network unavailable"));
    await nextTurn();
    controls = render();
    assert.equal(controls.state, "error");
    controls.retrySavedRevision();
    render();
    requests[1].reply.resolve(response(reportPayload()));
    await nextTurn();
    assert.equal(render().state, "ready", "retry can recover a failed load");
    assert.equal(beginCount, 1, "retry must not reset newly entered input");

    reset();
    render();
    harness.unmount();
    assert.equal(requests[0].init?.signal?.aborted, true);
    requests[0].reply.resolve(response(reportPayload()));
    await nextTurn();
    assert.equal(read().baseline, null, "unmounted workspaces cannot accept late reports");
  } finally {
    harness.unmount();
    runtimeModule._load = originalLoad;
    global.fetch = originalFetch;
  }
}

run().then(() => console.log("Saved report revision handoff tests passed")).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
