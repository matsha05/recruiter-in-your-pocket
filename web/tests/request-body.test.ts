import assert from "node:assert/strict";
import { readJsonWithLimit, readTextWithLimit } from "../lib/security/requestBody";

async function expectHttpStatus(promise: Promise<unknown>, status: number) {
  await assert.rejects(promise, (error: any) => error?.httpStatus === status);
}

async function run() {
  const accepted = await readTextWithLimit(
    new Request("https://example.test", { method: "POST", body: "small" }),
    5
  );
  assert.equal(accepted, "small");

  await expectHttpStatus(
    readTextWithLimit(
      new Request("https://example.test", {
        method: "POST",
        headers: { "content-length": "1000" },
        body: "small",
      }),
      100
    ),
    413
  );

  await expectHttpStatus(
    readTextWithLimit(
      new Request("https://example.test", { method: "POST", body: "too large" }),
      4
    ),
    413
  );

  assert.deepEqual(
    await readJsonWithLimit<{ ok: boolean }>(
      new Request("https://example.test", {
        method: "POST",
        body: JSON.stringify({ ok: true }),
      }),
      100
    ),
    { ok: true }
  );

  await expectHttpStatus(
    readJsonWithLimit(
      new Request("https://example.test", { method: "POST", body: "not-json" }),
      100
    ),
    400
  );

  console.log("Request body limits passed");
}

void run();
