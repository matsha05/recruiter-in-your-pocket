const assert = require("assert");
const fs = require("fs");
const path = require("path");
const app = require("../app");
const { validateResumeFeedbackRequest, validateResumeModelPayload } = app;

const resumesDir = path.join(__dirname, "resumes");

function testSamplesValidate() {
  const files = fs.readdirSync(resumesDir).filter((f) => f.endsWith(".txt"));
  for (const file of files) {
    const text = fs.readFileSync(path.join(resumesDir, file), "utf8");
    const res = validateResumeFeedbackRequest({ text, mode: "resume" });
    assert.strictEqual(res.ok, true, `Expected ok for ${file}`);
  }
}

function testSchemaShape() {
  const payload = {
    score: 85.6,
    score_label: "Strong",
    score_comment_short: "Clear impact with a few gaps.",
    score_comment_long: "Shows ownership and impact; tighten a few bullets to surface scope and decisions.",
    summary: "You read as...",
    strengths: ["a"],
    gaps: ["b"],
    rewrites: [{ label: "Impact", original: "x", better: "y", enhancement_note: "z" }],
    next_steps: ["c"]
  };
  const parsed = validateResumeModelPayload(payload);
  assert.strictEqual(parsed.score, 86);
}

function run() {
  testSamplesValidate();
  testSchemaShape();
  console.log("Schema contract tests passed.");
}

run();
