import assert from "node:assert/strict";
import Module from "node:module";
import type { ReadonlyURLSearchParams } from "next/navigation";
import type { LoadedJobContext } from "../components/workspace/hooks/useJobContextFromExtension";

type RuntimeModule = typeof Module & {
  _load: (request: string, parent: NodeModule | null, isMain: boolean) => unknown;
};
type Effect = { dependencies: unknown[]; cleanup?: () => void };

// Execute the real hook with controllable effect cleanup and deferred network replies.
function createHookHarness() {
  const slots: unknown[] = [];
  let cursor = 0;
  const effects = new Set<Effect>();
  const react = {
    useRef<T>(initial: T) {
      const index = cursor++;
      slots[index] ??= { current: initial };
      return slots[index] as { current: T };
    },
    useCallback<T>(callback: T) {
      return callback;
    },
    useEffect(callback: () => void | (() => void), dependencies: unknown[]) {
      const index = cursor++;
      const previous = slots[index] as Effect | undefined;
      if (previous && dependencies.every((value, i) => Object.is(value, previous.dependencies[i]))) return;
      previous?.cleanup?.();
      if (previous) effects.delete(previous);
      const effect = { dependencies, cleanup: callback() || undefined };
      slots[index] = effect;
      effects.add(effect);
    },
  };
  return {
    react,
    render<T>(render: () => T) { cursor = 0; return render(); },
    unmount() { for (const effect of effects) effect.cleanup?.(); },
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}

const jobA = { id: "11111111-1111-4111-8111-111111111111", title: "Job A", company: "Company A", jobDescription: "Description A" };
const jobB = { id: "22222222-2222-4222-8222-222222222222", title: "Job B", company: "Company B", jobDescription: "Description B" };
const response = (data: unknown) => new Response(JSON.stringify({ success: true, data }), {
  headers: { "content-type": "application/json" },
});
const nextTurn = () => new Promise<void>((resolve) => setImmediate(resolve));

async function run() {
  const runtimeModule = Module as RuntimeModule;
  const originalLoad = runtimeModule._load;
  const originalFetch = global.fetch;
  let harness = createHookHarness();
  runtimeModule._load = function loadWithHookRuntime(request, parent, isMain) {
    if (request === "react") return {
      useRef: <T>(value: T) => harness.react.useRef(value),
      useCallback: <T>(value: T) => harness.react.useCallback(value),
      useEffect: (callback: () => void | (() => void), dependencies: unknown[]) => harness.react.useEffect(callback, dependencies),
    };
    return originalLoad(request, parent, isMain);
  };
  const { useJobContextFromExtension } = require("../components/workspace/hooks/useJobContextFromExtension") as typeof import("../components/workspace/hooks/useJobContextFromExtension");
  runtimeModule._load = originalLoad;

  type State = { resume: string; description: string; job: LoadedJobContext | null; skipSample: boolean };
  let state: State;
  let requests: Array<{ url: string; signal: AbortSignal | null | undefined; reply: ReturnType<typeof deferred<Response>> }>;
  let options: Parameters<typeof useJobContextFromExtension>[0];
  const reset = (query: string, signedIn = false) => {
    harness.unmount();
    harness = createHookHarness();
    state = { resume: "", description: "", job: null, skipSample: false };
    requests = [];
    global.fetch = async (input, init) => {
      const reply = deferred<Response>();
      requests.push({ url: String(input), signal: init?.signal, reply });
      // Deliberately ignore abort so stale-body guards are exercised too.
      return reply.promise;
    };
    options = {
      searchParams: new URLSearchParams(query) as ReadonlyURLSearchParams,
      shouldHydrateDefaultResume: signedIn,
      setResumeText: (value) => { state.resume = typeof value === "function" ? value(state.resume) : value; },
      setJobDescription: (value) => { state.description = typeof value === "function" ? value(state.description) : value; },
      setLoadedJobContext: (value) => { state.job = typeof value === "function" ? value(state.job) : value; },
      setSkipSample: (value) => { state.skipSample = typeof value === "function" ? value(state.skipSample) : value; },
    };
  };
  const render = (query?: string) => {
    if (query !== undefined) options.searchParams = new URLSearchParams(query) as ReadonlyURLSearchParams;
    return harness.render(() => useJobContextFromExtension(options));
  };
  const currentJob = (): LoadedJobContext | null => state.job;

  try {
    reset(`job=${jobA.id}`, true);
    let controls = render();
    requests![0].reply.resolve(response(jobA));
    await nextTurn();
    assert.equal(currentJob()?.id, jobA.id);
    assert.equal(state!.description, "Description A");
    assert.equal(requests![1].url, "/api/user/default-resume?includeText=1");
    controls.clearJobContext();
    state!.description = "";
    state!.resume = "";
    assert.equal(currentJob(), null, "new report must immediately lose its saved-job association");
    assert.equal(requests![1].signal?.aborted, true);
    requests![1].reply.resolve(response({ resumeText: "Old default resume" }));
    await nextTurn();
    assert.equal(state!.resume, "", "a delayed default resume must not repopulate a reset workspace");
    render();
    assert.equal(requests!.length, 2, "reset must not rehydrate while router replacement is pending");
    options!.shouldHydrateDefaultResume = false;
    render();
    assert.equal(requests!.length, 2, "auth changes must not revive dismissed route context");
    render("revision=1");
    assert.equal(currentJob(), null, "revision workspace starts with no previous saved-job association");

    reset(`job=${jobA.id}`);
    controls = render();
    controls.clearJobContext();
    requests![0].reply.resolve(response(jobA));
    await nextTurn();
    assert.equal(currentJob(), null, "a late saved-job response must not restore the association after reset");
    assert.equal(state!.description, "");

    reset(`job=${jobA.id}`);
    render();
    render(`job=${jobB.id}`);
    assert.equal(requests![0].signal?.aborted, true);
    requests![1].reply.resolve(response(jobB));
    await nextTurn();
    requests![0].reply.resolve(response(jobA));
    await nextTurn();
    assert.equal(currentJob()?.id, jobB.id, "navigating between saved jobs keeps the most recent job");
    assert.equal(state!.description, "Description B");
    render("");
    assert.equal(currentJob(), null, "navigation without a job clears its association");

    reset(`job=${jobA.id}`);
    controls = render();
    const body = deferred<{ success: boolean; data: typeof jobA }>();
    requests![0].reply.resolve({ ok: true, json: () => body.promise } as Response);
    await nextTurn();
    controls.clearJobContext();
    body.resolve({ success: true, data: jobA });
    await nextTurn();
    assert.equal(currentJob(), null, "body parsing that completes after reset cannot restore a job");

    reset("source=extension-local&title=Local+role&company=Local+company&jd=Local+description", true);
    controls = render();
    assert.equal(currentJob()?.id, "extension-local");
    assert.equal(currentJob()?.title, "Local role");
    assert.equal(state!.description, "Local description");
    assert.equal(state!.skipSample, true);
    assert.equal(requests!.length, 1, "local captures hydrate without a saved-job lookup");
    requests![0].reply.resolve(response({ resumeText: "Saved resume" }));
    await nextTurn();
    assert.equal(state!.resume, "Saved resume", "initial extension hydration still loads the default resume");
    controls.clearJobContext();
    render("");
    render(`job=${jobA.id}`);
    requests![1].reply.resolve(response(jobA));
    await nextTurn();
    assert.equal(currentJob()?.id, jobA.id, "a new saved-job navigation is allowed after reset");

    reset("source=extension-local&jd=Local+description", true);
    render();
    state!.resume = "Resume the candidate just pasted";
    requests![0].reply.resolve(response({ resumeText: "Old saved resume" }));
    await nextTurn();
    assert.equal(state!.resume, "Resume the candidate just pasted", "default hydration must preserve entered resume text");

    reset(`job=${jobA.id}`, true);
    render();
    harness.unmount();
    requests![0].reply.resolve(response(jobA));
    await nextTurn();
    assert.equal(currentJob(), null, "unmounted workspaces ignore delayed replies");
    assert.equal(requests!.length, 1, "unmounted workspaces do not start default-resume hydration");
  } finally {
    harness.unmount();
    runtimeModule._load = originalLoad;
    global.fetch = originalFetch;
  }
}

run().then(() => console.log("Workspace job context lifecycle tests passed")).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
