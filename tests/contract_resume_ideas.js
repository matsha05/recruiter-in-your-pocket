// Contract tests for /api/resume-ideas endpoint
const assert = require("assert");

process.env.USE_MOCK_OPENAI = "1";
const { startNextServer } = require("../scripts/next_server");
let next = null;

async function request(method, url, body = null) {
  if (!next) next = await startNextServer();
  const fullUrl = `${next.baseUrl}${url}`;

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
    const validResponse = await request("POST", "/api/resume-ideas", {
      text: "Software Engineer\nGoogle\nLed team of 5 engineers"
    });
    assert.strictEqual(validResponse.status, 200, `Expected 200, got ${validResponse.status}: ${validResponse.body}`);
    const validPayload = JSON.parse(validResponse.body);
    assert.strictEqual(validPayload.ok, true, "Response should have ok: true");
    assert.ok(validPayload.data, "Response should have data field");
    assert.ok(Array.isArray(validPayload.data.questions), "Data should have questions array");
    assert.ok(Array.isArray(validPayload.data.notes), "Data should have notes array");
    assert.ok(typeof validPayload.data.how_to_use === "string", "Data should have how_to_use string");

    // Test empty text validation
    const emptyResponse = await request("POST", "/api/resume-ideas", {
      text: ""
    });
    assert.strictEqual(emptyResponse.status, 400, "Empty text should return 400");
    const emptyPayload = JSON.parse(emptyResponse.body);
    assert.strictEqual(emptyPayload.ok, false, "Response should have ok: false");
    assert.strictEqual(emptyPayload.errorCode, "VALIDATION_ERROR", "Should have VALIDATION_ERROR code");
    assert.ok(emptyPayload.details?.fieldErrors?.text, "Should have field error for text");

    // Test text too long validation
    const longText = "a".repeat(30001);
    const longResponse = await request("POST", "/api/resume-ideas", {
      text: longText
    });
    assert.strictEqual(longResponse.status, 400, "Text too long should return 400");
    const longPayload = JSON.parse(longResponse.body);
    assert.strictEqual(longPayload.ok, false, "Response should have ok: false");
    assert.strictEqual(longPayload.errorCode, "VALIDATION_ERROR", "Should have VALIDATION_ERROR code");

    // Test missing body
    const noBodyResponse = await request("POST", "/api/resume-ideas", null);
    assert.strictEqual(noBodyResponse.status, 400, "Missing body should return 400");

    console.log("Contract tests for /api/resume-ideas passed.");
  } finally {
    if (next) await next.stop();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

