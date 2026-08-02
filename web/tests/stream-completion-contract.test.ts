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
    assert.equal(ended.attemptConsumed, true, "EOF after consumed metadata must retain attempt state");
    assert.match(ended.message || "", /without completion/i);

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
    const aborted = await streamResumeFeedback("Resume source", undefined, () => undefined);
    assert.equal(aborted.aborted, true);
    assert.equal(aborted.attemptConsumed, true, "abort after response headers must retain consumed attempt state");
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
