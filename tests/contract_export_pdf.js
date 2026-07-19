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
    // PDF export is a paid, authenticated route. Payload-shape behavior is
    // covered by web/tests/pdf-export.test.ts; this integration contract
    // verifies the production authorization boundary.
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

    assert.strictEqual(validResponse.status, 401, "Signed-out PDF export should return 401");
    const validPayload = JSON.parse(validResponse.body.toString());
    assert.strictEqual(validPayload.ok, false, "Unauthorized response should have ok: false");
    assert.strictEqual(validPayload.errorCode, "UNAUTHORIZED", "Should have UNAUTHORIZED code");
    assert.ok(validResponse.headers["x-request-id"], "Unauthorized response should include a request ID");

    // Authorization runs before payload parsing so malformed requests cannot
    // probe the paid export surface while signed out.
    const invalidResponse = await request("POST", "/api/export-pdf", {
      report: {}
    });
    assert.strictEqual(invalidResponse.status, 401, "Signed-out invalid report should return 401");
    const invalidPayload = JSON.parse(invalidResponse.body.toString());
    assert.strictEqual(invalidPayload.ok, false, "Response should have ok: false");
    assert.strictEqual(invalidPayload.errorCode, "UNAUTHORIZED", "Should have UNAUTHORIZED code");

    // Missing-body requests are protected by the same boundary.
    const noBodyResponse = await request("POST", "/api/export-pdf", null);
    assert.strictEqual(noBodyResponse.status, 401, "Signed-out missing body should return 401");

    console.log("Contract tests for /api/export-pdf passed.");
  } finally {
    if (next) await next.stop();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
