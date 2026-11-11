import assert from "node:assert/strict";
import { cronRequestAllowed, KEEPALIVE_TABLES, pingDatabase } from "../lib/ops/database-keepalive";

type Call = { url: string; headers: Record<string, string> };

function fakeFetch(statusFor: (table: string) => number | Error) {
  const calls: Call[] = [];
  const impl = (async (input: URL | RequestInfo, init?: RequestInit) => {
    const url = String(input);
    calls.push({ url, headers: { ...(init?.headers as Record<string, string>) } });
    const table = new URL(url).pathname.split("/").pop() || "";
    const status = statusFor(table);
    if (status instanceof Error) throw status;
    return new Response("[]", { status });
  }) as typeof fetch;
  return { impl, calls };
}

async function main() {
  // One anonymous, read-only request per table, the same reads the GitHub keepalive made.
  const healthy = fakeFetch(() => 200);
  const result = await pingDatabase({ url: "https://project.supabase.co", key: "public-key" }, healthy.impl);
  assert.equal(result.ok, true);
  assert.deepEqual(result.tables.map(({ table }) => table), [...KEEPALIVE_TABLES]);
  assert.equal(healthy.calls.length, KEEPALIVE_TABLES.length);
  for (const call of healthy.calls) {
    const url = new URL(call.url);
    assert.equal(url.origin, "https://project.supabase.co");
    assert.match(url.pathname, /^\/rest\/v1\/[a-z_]+$/);
    assert.equal(url.searchParams.get("select"), "id");
    assert.equal(url.searchParams.get("limit"), "1");
    assert.deepEqual(call.headers, { apikey: "public-key" }, "only the public key is sent, never a bearer token");
  }

  // A refused table or a network failure fails the run, so the cron reports it.
  const refused = await pingDatabase({ url: "https://project.supabase.co", key: "k" }, fakeFetch((t) => (t === "cases" ? 401 : 200)).impl);
  assert.equal(refused.ok, false);
  assert.deepEqual(refused.tables.find(({ table }) => table === "cases"), { table: "cases", status: 401 });

  const offline = await pingDatabase({ url: "https://project.supabase.co", key: "k" }, fakeFetch(() => new Error("offline")).impl);
  assert.equal(offline.ok, false);
  assert.ok(offline.tables.every(({ status }) => status === null));

  // Without CRON_SECRET the route is open (it only repeats reads the public key allows);
  // with one, only Vercel's scheduler header passes.
  assert.equal(cronRequestAllowed(null, undefined), true);
  assert.equal(cronRequestAllowed(null, ""), true);
  assert.equal(cronRequestAllowed("Bearer s3cret", "s3cret"), true);
  assert.equal(cronRequestAllowed(null, "s3cret"), false);
  assert.equal(cronRequestAllowed("Bearer wrong", "s3cret"), false);
  assert.equal(cronRequestAllowed("s3cret", "s3cret"), false);

  console.log("database keepalive tests passed");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
