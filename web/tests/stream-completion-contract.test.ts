import assert from "node:assert/strict";
import { streamLinkedInFeedback, streamResumeFeedback } from "../lib/api";

type StreamEvent = Record<string, unknown>;

function responseFor(events: StreamEvent[]) {
  return new Response(`${events.map((event) => JSON.stringify(event)).join("\n")}\n`, {
    status: 200,
    headers: { "Content-Type": "application/x-ndjson" },
  });
}

async function capturePartials(run: (partials: unknown[]) => Promise<{ ok: boolean; report?: { score?: number } }>) {
  const partials: unknown[] = [];
  const result = await run(partials);
  assert.deepEqual(partials, [null], "chunk callbacks must never expose unvalidated report objects");
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
    await capturePartials((partials) => streamResumeFeedback(
      "Resume source",
      undefined,
      (_text, partial) => partials.push(partial),
    ));

    globalThis.fetch = async () => responseFor([
      { type: "chunk", content: '{"score":92,"summary":"partial and unvalidated"}' },
      { type: "complete", data: { score: 77, summary: "authoritative" } },
    ]);
    await capturePartials((partials) => streamLinkedInFeedback(
      { pdfText: "Profile source", source: "pdf" },
      (_text, partial) => partials.push(partial),
    ));
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
