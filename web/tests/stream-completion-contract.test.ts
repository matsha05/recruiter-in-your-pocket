import assert from "node:assert/strict";
import { streamLinkedInFeedback, streamResumeFeedback } from "../lib/api";

type StreamEvent = Record<string, unknown>;

function responseFor(events: StreamEvent[]) {
  return new Response(`${events.map((event) => JSON.stringify(event)).join("\n")}\n`, {
    status: 200,
    headers: { "Content-Type": "application/x-ndjson" },
  });
}

async function capturePartials(
  expectedPartials: unknown[],
  run: (partials: unknown[]) => Promise<{ ok: boolean; report?: { score?: number } }>,
) {
  const partials: unknown[] = [];
  const result = await run(partials);
  assert.deepEqual(partials, expectedPartials, "only explicitly supported streams may expose raw progress callbacks");
  assert.ok(result.ok && result.report, "the complete event must return a report");
  assert.equal(result.report.score, 77, "only the complete event may become authoritative report data");
}

async function run() {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () => responseFor([
      { type: "chunk", content: '{"score":91,"summary":"partial and unvalidated"}' },
      { type: "complete", data: { score: 77, summary: "authoritative" } },
    ]);
    await capturePartials([], (partials) => streamResumeFeedback(
      "Resume source",
      undefined,
      (_text, partial) => partials.push(partial),
    ));

    const completedThenStopped = new AbortController();
    let terminalStreamCanceled = false;
    globalThis.fetch = async () => new Response(new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(`${JSON.stringify({
          type: "complete",
          data: { score: 77, summary: "authoritative before Stop" },
          report_id: "report-terminal",
        })}\n`));
        completedThenStopped.abort();
      },
      cancel() {
        terminalStreamCanceled = true;
      },
    }), { status: 200 });
    const terminal = await Promise.race([
      streamResumeFeedback(
        "Resume source", undefined, () => undefined, "resume", { signal: completedThenStopped.signal },
      ),
      new Promise<never>((_resolve, reject) => setTimeout(() => reject(new Error("complete event did not terminate")), 100)),
    ]);
    assert.equal(terminal.ok, true, "an authoritative complete event must beat a later caller abort");
    assert.equal(terminal.aborted, undefined);
    assert.equal(terminal.reportId, "report-terminal");
    await Promise.resolve();
    assert.equal(terminalStreamCanceled, true, "the reader should be released without waiting for EOF");

    globalThis.fetch = async () => responseFor([
      { type: "chunk", content: '{"score":92,"summary":"partial and unvalidated"}' },
      { type: "complete", data: { score: 77, summary: "authoritative" } },
    ]);
    await capturePartials([null], (partials) => streamLinkedInFeedback(
      { pdfText: "Profile source", source: "pdf" },
      (_text, partial) => partials.push(partial),
    ));

    const failedPartials: unknown[] = [];
    globalThis.fetch = async () => responseFor([
      { type: "chunk", content: '{"score":99,"summary":"must stay private"}' },
      {
        type: "error",
        errorCode: "VALIDATION_FAILED",
        message: "Evidence validation failed",
        attempt_consumed: true,
      },
    ]);
    const failed = await streamResumeFeedback(
      "Resume source",
      undefined,
      (_text, partial) => failedPartials.push(partial),
    );
    assert.equal(failed.ok, false);
    assert.equal(failed.attemptConsumed, true, "post-provider failures must disclose that the attempt was consumed");
    assert.deepEqual(failedPartials, [], "resume failure paths must invoke no raw callbacks");

    globalThis.fetch = async () => responseFor([
      { type: "meta", attempt_consumed: true },
      { type: "chunk", content: '{"score":99}' },
    ]);
    const ended = await streamResumeFeedback("Resume source", undefined, () => undefined);
    assert.equal(ended.ok, false);
    assert.equal(ended.errorCode, "STREAM_TRANSPORT_ERROR");
    assert.equal(ended.attemptConsumed, true, "EOF after consumed metadata must retain attempt state");
    assert.match(ended.message || "", /connection ended/i);

    const pendingEnded = await (async () => {
      globalThis.fetch = async () => responseFor([{ type: "meta", attempt_consumed: false }]);
      return streamResumeFeedback("Resume source", undefined, () => undefined);
    })();
    assert.equal(pendingEnded.errorCode, "STREAM_TRANSPORT_ERROR");
    assert.equal(pendingEnded.attemptConsumed, undefined, "initial pending metadata must not be mistaken for a restored attempt");

    let reads = 0;
    globalThis.fetch = async () => new Response(new ReadableStream<Uint8Array>({
      pull(controller) {
        reads += 1;
        if (reads === 1) {
          controller.enqueue(new TextEncoder().encode('{"type":"meta","attempt_consumed":true}\n'));
          return;
        }
        controller.error(new DOMException("Canceled", "AbortError"));
      },
    }), {
      status: 200,
      headers: { "x-riyp-attempt-consumed": "1" },
    });
    const transportAbort = await streamResumeFeedback("Resume source", undefined, () => undefined);
    assert.equal(transportAbort.aborted, undefined, "a transport AbortError is not a user cancellation without an aborted client signal");
    assert.equal(transportAbort.errorCode, "STREAM_TRANSPORT_ERROR");
    assert.equal(transportAbort.attemptConsumed, true, "transport failure after consumed metadata must retain attempt state");

    reads = 0;
    globalThis.fetch = async () => new Response(new ReadableStream<Uint8Array>({
      pull(controller) {
        reads += 1;
        if (reads === 1) {
          controller.enqueue(new TextEncoder().encode('{"type":"meta","attempt_consumed":true}\n'));
          return;
        }
        controller.error(new Error("socket reset"));
      },
    }), { status: 200 });
    const socketReset = await streamResumeFeedback("Resume source", undefined, () => undefined);
    assert.equal(socketReset.aborted, undefined);
    assert.equal(socketReset.errorCode, "STREAM_TRANSPORT_ERROR");
    assert.equal(socketReset.attemptConsumed, true, "socket reset must preserve the latest consumed disposition");

    globalThis.fetch = async () => new Response(new ReadableStream<Uint8Array>({
      pull(controller) {
        controller.error(new Error("socket reset before metadata"));
      },
    }), { status: 200 });
    const unknownSocketReset = await streamResumeFeedback("Resume source", undefined, () => undefined);
    assert.equal(unknownSocketReset.errorCode, "STREAM_TRANSPORT_ERROR");
    assert.equal(unknownSocketReset.attemptConsumed, undefined, "socket reset without authoritative metadata must remain unknown");

    const clientController = new AbortController();
    reads = 0;
    globalThis.fetch = async () => new Response(new ReadableStream<Uint8Array>({
      pull(controller) {
        reads += 1;
        if (reads === 1) {
          controller.enqueue(new TextEncoder().encode('{"type":"meta","attempt_consumed":false}\n'));
          return;
        }
        clientController.abort();
        controller.error(new DOMException("Canceled", "AbortError"));
      },
    }), { status: 200 });
    const clientCanceled = await streamResumeFeedback(
      "Resume source", undefined, () => undefined, "resume", { signal: clientController.signal },
    );
    assert.equal(clientCanceled.aborted, true, "only the caller-owned aborted signal may mark a result canceled");
    assert.equal(clientCanceled.attemptConsumed, undefined, "pending pre-commit metadata must remain unknown after cancel");

    globalThis.fetch = async () => responseFor([{
      type: "error",
      errorCode: "CLIENT_CANCELED",
      message: "Analysis stopped. Your report credit was restored.",
      attempt_consumed: false,
      credit_restored: true,
    }]);
    const restored = await streamResumeFeedback("Resume source", undefined, () => undefined);
    assert.equal(restored.errorCode, "CLIENT_CANCELED");
    assert.equal(restored.attemptConsumed, false, "only an authoritative restored error may resolve the disposition to false");
    assert.equal(restored.creditRestored, true);
  } finally {
    globalThis.fetch = originalFetch;
  }
}

run()
  .then(() => console.log("stream completion contract tests passed"))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
