// Run the app in mock mode and POST all test resumes to the API, asserting shape.
const assert = require("assert");
process.env.USE_MOCK_OPENAI = "1";
process.env.API_AUTH_TOKEN = ""; // disable auth for mock script

const app = require("../app");
const fs = require("fs");
const path = require("path");

async function run() {
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  const resumesDir = path.join(__dirname, "..", "tests", "resumes");
  const files = fs.readdirSync(resumesDir).filter((f) => f.endsWith(".txt"));

  for (const file of files) {
    const text = fs.readFileSync(path.join(resumesDir, file), "utf8");
    const res = await fetch(`${baseUrl}/api/resume-feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, mode: "resume" })
    });
    assert.strictEqual(res.status, 200, `Expected 200 for ${file}, got ${res.status}`);
    const payload = await res.json();
    assert.strictEqual(payload.ok, true, `Expected ok=true for ${file}`);
    const data = payload.data;
    assert.ok(typeof data.score === "number");
    assert.ok(typeof data.score_label === "string");
    assert.ok(typeof data.score_comment_short === "string");
    assert.ok(typeof data.score_comment_long === "string");
    assert.ok(Array.isArray(data.strengths));
    assert.ok(Array.isArray(data.gaps));
    assert.ok(Array.isArray(data.rewrites));
    assert.ok(Array.isArray(data.next_steps));
  }

  // Exercise resume ideas endpoint with first file
  const sample = files[0];
  const sampleText = fs.readFileSync(path.join(resumesDir, sample), "utf8");
  const ideasRes = await fetch(`${baseUrl}/api/resume-ideas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: sampleText })
  });
  assert.strictEqual(ideasRes.status, 200, `Expected 200 for resume-ideas ${sample}`);
  const ideasPayload = await ideasRes.json();
  assert.strictEqual(ideasPayload.ok, true);
  assert.ok(Array.isArray(ideasPayload.data.questions));
  assert.ok(Array.isArray(ideasPayload.data.notes));
  assert.ok(typeof ideasPayload.data.how_to_use === "string");

  server.close();
  console.log("Mock run completed across sample resumes and resume ideas.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
