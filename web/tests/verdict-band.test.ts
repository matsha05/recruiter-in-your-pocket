import assert from "node:assert/strict";
import Module from "node:module";
import path from "node:path";
import { readFileSync } from "node:fs";
import { onlySoftIssues, validateWorklistPayload, verdictAboveBand } from "../lib/llm/worklist-validator";

// A verdict's reaction stays inside its band (live walk, November 17, 2026: 68, Needs more context, and "I'd want
// to talk with you"). Below Mostly clear the report is sent back once; if that fails, the draft stands.

const LIVE_SLIP = "Your branch management and deposit growth at Magnolia Community Bank fit the Riverbend role. I’d want to talk with you, though I’d still ask what you’ve been doing since December 2024 and about your compliance experience.";

// ---- The phrase, and only below 70 ----
assert.equal(verdictAboveBand(68, LIVE_SLIP), "I’d want to talk");
assert.equal(verdictAboveBand(70, LIVE_SLIP), null, "Mostly clear may say it");
for (const verdict of [
  "Your branch work is clear. I’d hesitate to move this resume forward without your dates.",
  "The Cobalt Pay role is a different track. I'd pass for this role.",
  "I wouldn't move this forward yet. What have you done since 2024?",
  "I'd want to know what you've been doing since December 2024.",
]) assert.equal(verdictAboveBand(64, verdict), null, verdict);
for (const verdict of ["I'd move this resume forward for a Branch Manager role.", "I would move it forward with a question.", "I’d still want to talk to you about the branch."]) {
  assert.ok(verdictAboveBand(66, verdict), verdict);
}

// ---- The validator flags it softly, and lets a kept draft through ----
const sample = JSON.parse(readFileSync(path.join(process.cwd(), "public/sample-report.json"), "utf8"));
const slipped = { ...sample, score: 68, verdict: LIVE_SLIP };
let thrown: unknown = null;
try { validateWorklistPayload(slipped, ""); } catch (error) { thrown = error; }
assert.ok(thrown, "a verdict above its band is refused");
assert.equal(onlySoftIssues(thrown), true, "and only softly");
assert.equal(validateWorklistPayload(slipped, "", { allowVerdictAboveBand: true }).verdict, LIVE_SLIP, "a kept draft passes");
assert.equal(validateWorklistPayload({ ...sample, score: 74, verdict: LIVE_SLIP }, "").score, 74, "Mostly clear is never refused for it");
let hard: unknown = null;
try { validateWorklistPayload({ ...slipped, verdict: `${LIVE_SLIP} ${"More words. ".repeat(40)}` }, ""); } catch (error) { hard = error; }
assert.ok(hard);
assert.equal(onlySoftIssues(hard), false, "a draft with a fault of its own is not soft");

// ---- The repair flow: fixed when the repair works, the draft kept when it doesn't ----
async function run() {
  const runtimeModule = Module as typeof Module & { _load: (request: string, parent: unknown, isMain: boolean) => unknown };
  const originalLoad = runtimeModule._load;
  runtimeModule._load = function (request, parent, isMain) {
    return originalLoad.call(this, request.startsWith("@/") ? path.join(process.cwd(), request.slice(2)) : request, parent, isMain);
  };
  const { validateResumeStreamOutput } = await import("../lib/llm/validateResumeStreamOutput");
  const originalFetch = globalThis.fetch;
  const originalEnv = { ...process.env };
  process.env.OPENAI_API_KEY = "test-key";
  process.env.USE_MOCK_OPENAI = "false";
  process.env.OPENAI_MAX_RETRIES = "0";
  const requests: Array<{ messages: Array<{ content: string }> }> = [];
  const fixed = { ...slipped, verdict: "Your branch management and deposit growth at Magnolia Community Bank fit the Riverbend role. I’d hesitate until I knew what you’ve done since December 2024." };
  let reply: unknown = fixed;
  try {
    globalThis.fetch = (async (_url: unknown, init?: RequestInit) => {
      requests.push(JSON.parse(String(init?.body)));
      return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(reply) }, finish_reason: "stop" }] }), { status: 200, headers: { "content-type": "application/json" } });
    }) as typeof fetch;
    const input = {
      raw: JSON.stringify(slipped), text: "", mode: "resume" as const, model: "gpt-6.1-terra",
      messages: [{ role: "system" as const, content: "Return the report." }],
      requestId: "verdict-band", route: "/api/resume-feedback-stream",
    };
    const repaired = await validateResumeStreamOutput(input);
    assert.equal(repaired.payload.verdict, fixed.verdict, "the repair's verdict is the one delivered");
    assert.equal(repaired.payload.score, 68, "and the score is kept");
    assert.equal(requests.length, 1);
    assert.match(requests[0].messages.at(-1)!.content, /keep the score and rewrite the verdict/);

    reply = slipped;
    const kept = await validateResumeStreamOutput(input);
    assert.equal(kept.payload.verdict, LIVE_SLIP, "a failed repair keeps the draft instead of losing the report");
    assert.equal(kept.replacementRaw, null);
    assert.equal(requests.length, 2, "one repair, no loop");

    const fine = await validateResumeStreamOutput({ ...input, raw: JSON.stringify({ ...slipped, score: 74 }) });
    assert.equal(fine.payload.score, 74);
    assert.equal(requests.length, 2, "Mostly clear needs no repair");
  } finally {
    globalThis.fetch = originalFetch;
    runtimeModule._load = originalLoad;
    for (const key of ["OPENAI_API_KEY", "USE_MOCK_OPENAI", "OPENAI_MAX_RETRIES"]) {
      if (originalEnv[key] === undefined) delete process.env[key];
      else process.env[key] = originalEnv[key];
    }
  }
  console.log("verdict band: refused softly, repaired once, the draft kept when the repair fails");
}
run().catch((error) => { console.error(error); process.exitCode = 1; });
