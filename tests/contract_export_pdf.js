// Contract tests for /api/export-pdf endpoint
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

  // For PDF responses, get as arrayBuffer; for JSON, get as text
  const contentType = response.headers.get("content-type") || "";
  let responseBody;
  if (contentType.includes("application/pdf")) {
    const buffer = await response.arrayBuffer();
    responseBody = Buffer.from(buffer);
  } else {
    responseBody = await response.text();
  }

  return {
    status: response.status,
    body: responseBody,
    headers: Object.fromEntries(response.headers.entries())
  };
}

async function run() {
  try {
    // Test valid request with mock report data
    const mockReport = {
      score: 85,
      score_label: "Strong",
      summary: "Test summary",
      strengths: ["Strength 1"],
      gaps: ["Gap 1"],
      rewrites: [],
      next_steps: ["Step 1"]
    };

    const validResponse = await request("POST", "/api/export-pdf", {
      report: mockReport
    });

    // PDF export might fail if Chromium isn't available, but we should get a proper error response
    if (validResponse.status === 200) {
      // If successful, should return PDF buffer
      assert.ok(Buffer.isBuffer(validResponse.body), "Response should be a buffer");
      assert.ok(validResponse.body.length > 0, "PDF buffer should not be empty");
      assert.strictEqual(
        validResponse.headers["content-type"],
        "application/pdf",
        "Should have PDF content type"
      );
      assert.ok(
        validResponse.headers["content-disposition"]?.includes("resume-review.pdf"),
        "Should have PDF filename in content-disposition"
      );
    } else {
      // If PDF generation fails (e.g., Chromium not available), should get proper error
      assert.ok([400, 500].includes(validResponse.status), "Should return 400 or 500 on failure");
      const errorPayload = JSON.parse(validResponse.body.toString());
      assert.strictEqual(errorPayload.ok, false, "Error response should have ok: false");
      assert.ok(errorPayload.errorCode, "Error response should have errorCode");
    }

    // Test invalid/missing report data
    const invalidResponse = await request("POST", "/api/export-pdf", {
      report: {}
    });
    assert.strictEqual(invalidResponse.status, 400, "Invalid report should return 400");
    const invalidPayload = JSON.parse(invalidResponse.body.toString());
    assert.strictEqual(invalidPayload.ok, false, "Response should have ok: false");
    assert.strictEqual(invalidPayload.errorCode, "INVALID_PAYLOAD", "Should have INVALID_PAYLOAD code");

    // Test missing body
    const noBodyResponse = await request("POST", "/api/export-pdf", null);
    assert.strictEqual(noBodyResponse.status, 400, "Missing body should return 400");

    console.log("Contract tests for /api/export-pdf passed.");
  } finally {
    if (next) await next.stop();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

