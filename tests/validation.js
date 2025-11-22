const assert = require("assert");
const app = require("../app");
const {
  validateResumeFeedbackRequest,
  validateResumeModelPayload
} = app;

function testValidationEmpty() {
  const res = validateResumeFeedbackRequest({ text: "", mode: "resume" });
  assert.strictEqual(res.ok, false);
  assert.strictEqual(
    res.fieldErrors.text,
    "Paste your resume text so I can actually review it."
  );
}

function testValidationTooLong() {
  const longText = "a".repeat(30001);
  const res = validateResumeFeedbackRequest({ text: longText, mode: "resume" });
  assert.strictEqual(res.ok, false);
  assert.ok(res.fieldErrors.text.includes("very long"));
}

function testValidationTrimmedLength() {
  const tooLong = " " + "a".repeat(30001) + " ";
  const res = validateResumeFeedbackRequest({ text: tooLong, mode: "resume" });
  assert.strictEqual(res.ok, false);
  assert.ok(res.fieldErrors.text.includes("very long"));

  const okText = " " + "a".repeat(29990) + " ";
  const ok = validateResumeFeedbackRequest({ text: okText, mode: "resume" });
  assert.strictEqual(ok.ok, true);
  assert.strictEqual(ok.value.text.length, 29990);
}

function testValidationSuccess() {
  const res = validateResumeFeedbackRequest({ text: "hello", mode: "resume" });
  assert.strictEqual(res.ok, true);
  assert.strictEqual(res.value.text, "hello");
  assert.strictEqual(res.value.mode, "resume");
}

function testScoreClamp() {
  const parsed = validateResumeModelPayload({
    score: 120,
    score_label: "Top bar",
    score_comment_short: "Short",
    score_comment_long: "Longer note",
    summary: "",
    strengths: [],
    gaps: [],
    rewrites: [{ label: "", original: "a", better: "b", enhancement_note: "c" }],
    next_steps: []
  });
  assert.strictEqual(parsed.score, 100);

  const parsedLow = validateResumeModelPayload({
    score: -5,
    score_label: "Needs work",
    score_comment_short: "Short",
    score_comment_long: "Longer note",
    summary: "",
    strengths: [],
    gaps: [],
    rewrites: [{ label: "", original: "a", better: "b", enhancement_note: "c" }],
    next_steps: []
  });
  assert.strictEqual(parsedLow.score, 0);
}

function run() {
  testValidationEmpty();
  testValidationTooLong();
  testValidationTrimmedLength();
  testValidationSuccess();
  testScoreClamp();
  console.log("Validation tests passed.");
}

run();
