const assert = require("assert");
const app = require("../app");
const { validateResumeIdeasRequest, validateResumeIdeasPayload } = app;

function testIdeasValidation() {
  const res = validateResumeIdeasRequest({ text: "" });
  assert.strictEqual(res.ok, false);
  const ok = validateResumeIdeasRequest({ text: "hello" });
  assert.strictEqual(ok.ok, true);
}

function testIdeasPayloadShape() {
  const parsed = validateResumeIdeasPayload({
    questions: ["a"],
    notes: [],
    how_to_use: "b"
  });
  assert.ok(Array.isArray(parsed.questions));
}

function run() {
  testIdeasValidation();
  testIdeasPayloadShape();
  console.log("Ideas contract tests passed.");
}

run();
