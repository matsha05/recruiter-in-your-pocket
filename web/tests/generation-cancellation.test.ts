import assert from "node:assert/strict";
import Module from "node:module";
import path from "node:path";
import {
  finalizeGenerationCompletion,
  generationCancellationWasCommitted,
  shouldSynthesizeGenerationCancellation,
} from "../lib/billing/generation-cancellation";
import { isStableOpenAITransportError } from "../lib/backend/openai-transport";

const originalResolveFilename = (Module as any)._resolveFilename;
(Module as any)._resolveFilename = function resolveFilename(request: string, ...args: any[]) {
  const mapped = request.startsWith("@/") ? path.join(process.cwd(), request.slice(2)) : request;
  return originalResolveFilename.call(this, mapped, ...args);
};

const {
  callOpenAIChat,
  callOpenAIChatStreamingWithUsage,
} = require("../lib/backend/openai") as typeof import("../lib/backend/openai");

const messages = [{ role: "user" as const, content: "Resume source" }];

async function consumeProvider(signal: AbortSignal) {
  const { stream } = callOpenAIChatStreamingWithUsage(
    messages,
    "resume",
    undefined,
    "gpt-test",
    { signal },
  );
  for await (const _chunk of stream) {
    // The cancellation probes return no trusted report content.
  }
}

async function run() {
  assert.equal(isStableOpenAITransportError({ code: "OPENAI_NETWORK_ERROR" }), true);
  assert.equal(isStableOpenAITransportError({ code: "OPENAI_TIMEOUT" }), true);
  assert.equal(isStableOpenAITransportError({ code: "CLIENT_CANCELED" }), true);
  assert.equal(isStableOpenAITransportError({ code: "OPENAI_RESPONSE_SHAPE_INVALID" }), false);
  assert.equal(shouldSynthesizeGenerationCancellation(new DOMException("Aborted", "AbortError")), true);
  assert.equal(shouldSynthesizeGenerationCancellation({ code: "OPENAI_TIMEOUT" }), false);
  assert.equal(shouldSynthesizeGenerationCancellation({ code: "REPORT_CLEANUP_UNCONFIRMED" }), false);
  const originalFetch = globalThis.fetch;
  const originalEnv = {
    apiKey: process.env.OPENAI_API_KEY,
    mock: process.env.USE_MOCK_OPENAI,
    timeout: process.env.OPENAI_TIMEOUT_MS,
    retries: process.env.OPENAI_MAX_RETRIES,
    retryBackoff: process.env.OPENAI_RETRY_BACKOFF_MS,
  };
  process.env.OPENAI_API_KEY = "test-key";
  process.env.OPENAI_MAX_RETRIES = "0";
  process.env.OPENAI_RETRY_BACKOFF_MS = "0";
  delete process.env.USE_MOCK_OPENAI;

  try {
    let fetchCalls = 0;
    globalThis.fetch = (async () => {
      fetchCalls += 1;
      throw new Error("provider must not start");
    }) as typeof fetch;
    const canceledBeforeProvider = new AbortController();
    canceledBeforeProvider.abort();
    await assert.rejects(
      () => consumeProvider(canceledBeforeProvider.signal),
      (error: any) => error?.code === "CLIENT_CANCELED" && error?.code !== 20,
      "cancel-before-provider must return the stable client cancellation code",
    );
    assert.equal(fetchCalls, 0, "cancel-before-provider must not call OpenAI");

    let providerStarted!: () => void;
    const started = new Promise<void>((resolve) => { providerStarted = resolve; });
    globalThis.fetch = ((_url: string | URL | Request, init?: RequestInit) => {
      fetchCalls += 1;
      providerStarted();
      return new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => {
          reject(new DOMException("The operation was aborted", "AbortError"));
        }, { once: true });
      });
    }) as typeof fetch;
    process.env.OPENAI_TIMEOUT_MS = "60000";
    const canceledAfterStart = new AbortController();
    const providerRun = consumeProvider(canceledAfterStart.signal);
    await started;
    canceledAfterStart.abort();
    await assert.rejects(
      () => providerRun,
      (error: any) => error?.code === "CLIENT_CANCELED" && error?.message === "Analysis stopped before the report was complete.",
      "genuine client cancel must not be classified as timeout",
    );

    let delayedProviderStarted!: () => void;
    const delayedStarted = new Promise<void>((resolve) => { delayedProviderStarted = resolve; });
    globalThis.fetch = ((_url: string | URL | Request, init?: RequestInit) => {
      delayedProviderStarted();
      return new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => {
          setTimeout(() => reject(new DOMException("Delayed abort rejection", "AbortError")), 20);
        }, { once: true });
      });
    }) as typeof fetch;
    process.env.OPENAI_TIMEOUT_MS = "5";
    const clientWonRace = new AbortController();
    const delayedRejection = consumeProvider(clientWonRace.signal);
    await delayedStarted;
    clientWonRace.abort();
    await assert.rejects(
      () => delayedRejection,
      (error: any) => error?.code === "CLIENT_CANCELED",
      "the first abort owner must remain client even when rejection arrives after the timeout deadline",
    );

    globalThis.fetch = ((_url: string | URL | Request, init?: RequestInit) => new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => {
        reject(new DOMException("The operation was aborted", "AbortError"));
      }, { once: true });
    })) as typeof fetch;
    process.env.OPENAI_TIMEOUT_MS = "5";
    await assert.rejects(
      () => consumeProvider(new AbortController().signal),
      (error: any) => error?.code === "OPENAI_TIMEOUT"
        && error?.message === "OpenAI request timed out."
        && error?.code !== 20,
      "timer-owned abort must become the stable timeout error",
    );

    let timeoutFirstStarted!: () => void;
    const timeoutStarted = new Promise<void>((resolve) => { timeoutFirstStarted = resolve; });
    globalThis.fetch = ((_url: string | URL | Request, init?: RequestInit) => {
      timeoutFirstStarted();
      return new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => {
          setTimeout(() => reject(new DOMException("Delayed timeout rejection", "AbortError")), 20);
        }, { once: true });
      });
    }) as typeof fetch;
    process.env.OPENAI_TIMEOUT_MS = "5";
    const clientAfterTimeout = new AbortController();
    const timeoutFirstRun = consumeProvider(clientAfterTimeout.signal);
    await timeoutStarted;
    setTimeout(() => clientAfterTimeout.abort(), 10);
    await assert.rejects(
      () => timeoutFirstRun,
      (error: any) => error?.code === "OPENAI_TIMEOUT",
      "a later client abort must not overwrite a timer-owned timeout",
    );

    globalThis.fetch = (async () => {
      const socketError = new Error("socket closed") as Error & { code: string };
      socketError.code = "ECONNRESET";
      throw socketError;
    }) as typeof fetch;
    process.env.OPENAI_TIMEOUT_MS = "60000";
    await assert.rejects(
      () => consumeProvider(new AbortController().signal),
      (error: any) => error?.code === "OPENAI_NETWORK_ERROR" && error?.internal === "socket closed",
      "raw provider transport codes must normalize to the stable network error taxonomy",
    );

    globalThis.fetch = ((_url: string | URL | Request, init?: RequestInit) => Promise.resolve({
      ok: true,
      status: 200,
      text: () => new Promise<string>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => {
          reject(new DOMException("The operation was aborted", "AbortError"));
        }, { once: true });
      }),
    } as Response)) as typeof fetch;
    process.env.OPENAI_TIMEOUT_MS = "5";
    await assert.rejects(
      () => callOpenAIChat(messages, "resume", "gpt-test", { signal: new AbortController().signal }),
      (error: any) => error?.code === "OPENAI_TIMEOUT" && error?.code !== 20,
      "repair-style non-streaming body timeouts must use the stable timeout code",
    );

    const beforeCommit = new AbortController();
    beforeCommit.abort();
    const beforeEvents: string[] = [];
    await assert.rejects(() => finalizeGenerationCompletion({
      signal: beforeCommit.signal,
      persist: async () => { beforeEvents.push("persist"); return "report-1"; },
      commit: async () => { beforeEvents.push("commit"); },
      rollback: async () => { beforeEvents.push("rollback"); return { confirmed: true }; },
    }), (error: any) => error?.code === "CLIENT_CANCELED");
    assert.deepEqual(beforeEvents, [], "observed cancel must prevent persistence and commit");

    const afterCommit = new AbortController();
    const afterCommitEvents: string[] = [];
    await assert.rejects(() => finalizeGenerationCompletion({
      signal: afterCommit.signal,
      persist: async () => {
        afterCommitEvents.push("persist");
        return "report-2";
      },
      commit: async () => {
        afterCommitEvents.push("commit");
        afterCommit.abort();
      },
      rollback: async () => { afterCommitEvents.push("rollback"); return { confirmed: true }; },
    }), (error: any) => error?.code === "CLIENT_CANCELED" && !generationCancellationWasCommitted(error));
    assert.deepEqual(afterCommitEvents, ["commit"], "cancel after commit must not create a visible report before refund settlement");

    const duringCommit = new AbortController();
    let finishCommit!: () => void;
    const commitEvents: string[] = [];
    const raced = finalizeGenerationCompletion({
      signal: duringCommit.signal,
      persist: async () => { commitEvents.push("persist"); return "report-3"; },
      commit: async () => {
        commitEvents.push("commit");
        await new Promise<void>((resolve) => {
          finishCommit = () => { resolve(); };
        });
      },
      rollback: async () => { commitEvents.push("rollback"); return { confirmed: true }; },
    });
    while (!commitEvents.includes("commit")) await Promise.resolve();
    duringCommit.abort();
    finishCommit();
    await assert.rejects(
      () => raced,
      (error: any) => error?.code === "CLIENT_CANCELED" && !generationCancellationWasCommitted(error),
      "signed-in cancel-vs-commit must remain refundable before persistence",
    );
    assert.deepEqual(commitEvents, ["commit"], "commit must finish before report persistence can begin");

    const afterPersistence = new AbortController();
    const persistedEvents: string[] = [];
    await assert.rejects(() => finalizeGenerationCompletion({
      signal: afterPersistence.signal,
      commit: async () => { persistedEvents.push("commit"); },
      persist: async () => {
        persistedEvents.push("persist");
        afterPersistence.abort();
        return "report-3";
      },
      rollback: async () => { persistedEvents.push("rollback"); return { confirmed: true }; },
    }), (error: any) => error?.code === "CLIENT_CANCELED" && generationCancellationWasCommitted(error));
    assert.deepEqual(persistedEvents, ["commit", "persist"], "a charged, persisted report remains authoritative after Stop");

    const successEvents: string[] = [];
    const completed = await finalizeGenerationCompletion({
      signal: new AbortController().signal,
      persist: async () => { successEvents.push("persist"); return "report-4"; },
      commit: async () => { successEvents.push("commit"); },
      rollback: async () => { successEvents.push("rollback"); return { confirmed: true }; },
    });
    assert.deepEqual(completed, { reportId: "report-4", attemptConsumed: true });
    assert.deepEqual(successEvents, ["commit", "persist"], "normal completion must commit before exposing persistence");
  } finally {
    globalThis.fetch = originalFetch;
    if (originalEnv.apiKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = originalEnv.apiKey;
    if (originalEnv.mock === undefined) delete process.env.USE_MOCK_OPENAI;
    else process.env.USE_MOCK_OPENAI = originalEnv.mock;
    if (originalEnv.timeout === undefined) delete process.env.OPENAI_TIMEOUT_MS;
    else process.env.OPENAI_TIMEOUT_MS = originalEnv.timeout;
    if (originalEnv.retries === undefined) delete process.env.OPENAI_MAX_RETRIES;
    else process.env.OPENAI_MAX_RETRIES = originalEnv.retries;
    if (originalEnv.retryBackoff === undefined) delete process.env.OPENAI_RETRY_BACKOFF_MS;
    else process.env.OPENAI_RETRY_BACKOFF_MS = originalEnv.retryBackoff;
    (Module as any)._resolveFilename = originalResolveFilename;
  }
}

run().then(() => console.log("generation cancellation tests passed")).catch((error) => {
  console.error(error);
  process.exit(1);
});
