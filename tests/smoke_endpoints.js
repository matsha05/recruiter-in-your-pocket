const assert = require("assert");

process.env.USE_MOCK_OPENAI = "1";
const { startNextServer } = require("../scripts/next_server");

async function run() {
  const next = await startNextServer();
  try {
    const healthRes = await fetch(`${next.baseUrl}/api/health`);
    assert.strictEqual(healthRes.status, 200);
    assert.strictEqual((await healthRes.json()).ok, true);

    const readyRes = await fetch(`${next.baseUrl}/api/ready`);
    const readyJson = await readyRes.json().catch(() => null);
    assert.strictEqual(
      readyRes.status,
      200,
      `Ready failed: ${readyJson ? JSON.stringify(readyJson) : "non-json response"}`
    );
    assert.strictEqual(readyJson.ok, true);
  } finally {
    await next.stop();
  }

  console.log("Smoke endpoints passed.");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
