const assert = require("assert");
const {
  validateResumeFeedbackRequest,
  validateResumeModelPayload
} = require("../server");

function testValidationEmpty() {
  const res = validateResumeFeedbackRequest({ text: "", mode: "resume" });
  assert.strictEqual(res.ok, false);
  assert.strictEqual(
    res.fieldErrors.text,
    "Paste your resume text so I can actually review it."
  );
}

function testValidationTooLong() {
  const longText = "a".repeat(20001);
  const res = validateResumeFeedbackRequest({ text: longText, mode: "resume" });
  assert.strictEqual(res.ok, false);
  assert.ok(res.fieldErrors.text.includes("very long"));
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
    summary: "",
    strengths: [],
    gaps: [],
    rewrites: [{ label: "", original: "a", better: "b", enhancement_note: "c" }],
    next_steps: []
  });
  assert.strictEqual(parsed.score, 100);

  const parsedLow = validateResumeModelPayload({
    score: -5,
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
  testValidationSuccess();
  testScoreClamp();
  console.log("Validation tests passed.");
}

run();
