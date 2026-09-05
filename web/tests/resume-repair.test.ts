import assert from "node:assert/strict";
import Module from "node:module";
import path from "node:path";
import { schemaValidReport } from "./helpers/report-fidelity-fixture";

async function run() {
  const runtimeModule = Module as typeof Module & { _load: (request: string, parent: unknown, isMain: boolean) => any };
  const originalLoad = runtimeModule._load;
  runtimeModule._load = function(request, parent, isMain) {
    return originalLoad.call(this, request.startsWith("@/") ? path.join(process.cwd(), request.slice(2)) : request, parent, isMain);
  };
  const { validateResumeStreamOutput } = await import("../lib/llm/validateResumeStreamOutput");
  const originalFetch = globalThis.fetch;
  const originalEnv = { ...process.env };
  process.env.OPENAI_API_KEY = "test-key";
  process.env.USE_MOCK_OPENAI = "false";
  process.env.OPENAI_RESUME_REASONING_EFFORT = "low";
  process.env.OPENAI_MAX_RETRIES = "0";
  const draft = { ...structuredClone(schemaValidReport), score_comment_short: "This verdict has far too many words and must be rewritten as a complete sentence within the limit." };
  const requestBodies: any[] = [];
  let reply = structuredClone(schemaValidReport);
  try {
    globalThis.fetch = (async (_url, init) => {
      requestBodies.push(JSON.parse(String(init?.body)));
      return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(reply) }, finish_reason: "stop" }] }), {
        status: 200, headers: { "content-type": "application/json" },
      });
    }) as typeof fetch;
    const input = {
      raw: JSON.stringify(draft), text: "", mode: "resume" as const, model: "gpt-5.6-luna",
      messages: [{ role: "system" as const, content: "Return the report." }],
      requestId: "repair-contract", route: "/api/resume-feedback-stream",
    };
    const result = await validateResumeStreamOutput(input);
    assert.equal(result.payload.score_comment_short, schemaValidReport.score_comment_short);
    assert.equal(requestBodies.length, 1);
    assert.equal(requestBodies[0].reasoning_effort, "medium");
    assert.equal(requestBodies[0].max_completion_tokens, 8000);
    assert.match(requestBodies[0].messages.at(-1).content, /score_comment_short:.*16 words/);
    assert.match(requestBodies[0].messages.at(-1).content, /Objective.*section_review\.Summary/);
    assert.match(requestBodies[0].messages.at(-1).content, /Additional Information.*section_review\.Skills/);
    reply = draft;
    await assert.rejects(validateResumeStreamOutput(input), /did not pass its evidence check/);
    assert.equal(requestBodies.length, 2, "a failed repair must not start an unbounded retry loop");
  } finally {
    globalThis.fetch = originalFetch;
    runtimeModule._load = originalLoad;
    for (const key of ["OPENAI_API_KEY", "USE_MOCK_OPENAI", "OPENAI_RESUME_REASONING_EFFORT", "OPENAI_MAX_RETRIES"]) {
      if (originalEnv[key] === undefined) delete process.env[key];
      else process.env[key] = originalEnv[key];
    }
  }
  console.log("resume repair contract tests passed");
}
run().catch(error => { console.error(error); process.exitCode = 1; });
