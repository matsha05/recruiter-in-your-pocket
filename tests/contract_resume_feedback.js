// Contract tests for /api/resume-feedback endpoint
const assert = require("assert");

process.env.USE_MOCK_OPENAI = "1";
const app = require("../app");

let testServer = null;

async function request(method, url, body = null) {
  // Start server if not already started
  if (!testServer) {
    testServer = app.listen(0); // Use random port
    // Wait for server to be ready
    await new Promise((resolve) => testServer.once("listening", resolve));
  }

  const port = testServer.address().port;
  const fullUrl = `http://localhost:${port}${url}`;

  const response = await fetch(fullUrl, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined
  });

  const responseBody = await response.text();
  return {
    status: response.status,
    body: responseBody,
    headers: Object.fromEntries(response.headers.entries())
  };
}

async function run() {
  try {
    // Test valid request
    const validResponse = await request("POST", "/api/resume-feedback", {
      text: "Software Engineer\nGoogle\nLed team of 5 engineers",
      mode: "resume"
    });
    assert.strictEqual(validResponse.status, 200, `Expected 200, got ${validResponse.status}: ${validResponse.body}`);
    const validPayload = JSON.parse(validResponse.body);
    assert.strictEqual(validPayload.ok, true, "Response should have ok: true");
    assert.ok(validPayload.data, "Response should have data field");
    assert.ok(typeof validPayload.data.score === "number", "Data should have score field");
    assert.ok(Array.isArray(validPayload.data.strengths), "Data should have strengths array");

    // Test empty text validation
    const emptyResponse = await request("POST", "/api/resume-feedback", {
      text: "",
      mode: "resume"
    });
    assert.strictEqual(emptyResponse.status, 400, "Empty text should return 400");
    const emptyPayload = JSON.parse(emptyResponse.body);
    assert.strictEqual(emptyPayload.ok, false, "Response should have ok: false");
    assert.strictEqual(emptyPayload.errorCode, "VALIDATION_ERROR", "Should have VALIDATION_ERROR code");
    assert.ok(emptyPayload.details?.fieldErrors?.text, "Should have field error for text");

    // Test text too long validation
    const longText = "a".repeat(30001);
    const longResponse = await request("POST", "/api/resume-feedback", {
      text: longText,
      mode: "resume"
    });
    assert.strictEqual(longResponse.status, 400, "Text too long should return 400");
    const longPayload = JSON.parse(longResponse.body);
    assert.strictEqual(longPayload.ok, false, "Response should have ok: false");
    assert.strictEqual(longPayload.errorCode, "VALIDATION_ERROR", "Should have VALIDATION_ERROR code");

    // Test invalid mode
    const invalidModeResponse = await request("POST", "/api/resume-feedback", {
      text: "Valid resume text",
      mode: "invalid_mode"
    });
    assert.strictEqual(invalidModeResponse.status, 400, "Invalid mode should return 400");
    const invalidModePayload = JSON.parse(invalidModeResponse.body);
    assert.strictEqual(invalidModePayload.ok, false, "Response should have ok: false");

    // Test missing body
    const noBodyResponse = await request("POST", "/api/resume-feedback", null);
    assert.strictEqual(noBodyResponse.status, 400, "Missing body should return 400");

    console.log("Contract tests for /api/resume-feedback passed.");
  } finally {
    if (testServer) {
      testServer.close();
    }
  }
}

run().catch((err) => {
  console.error(err);
  if (testServer) {
    testServer.close();
  }
  process.exit(1);
});

