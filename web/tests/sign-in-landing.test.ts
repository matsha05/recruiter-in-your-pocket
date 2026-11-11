import assert from "node:assert/strict";
import { signInLanding } from "../lib/auth/landing";

const answer = (status: number, body: unknown) => (async () => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } })) as unknown as typeof fetch;

async function main() {
  // A person with a saved report lands on My reports.
  assert.equal(await signInLanding(answer(200, { ok: true, reports: [{ id: "r1" }] })), "/reports");

  // No saved reports, a first-time account: the upload page.
  assert.equal(await signInLanding(answer(200, { ok: true, reports: [] })), "/workspace");

  // Anything that isn't a clean answer lands where sign-in always landed.
  assert.equal(await signInLanding(answer(401, { ok: false })), "/workspace");
  assert.equal(await signInLanding(answer(500, { ok: false })), "/workspace");
  assert.equal(await signInLanding(answer(200, { ok: false, reports: [{ id: "r1" }] })), "/workspace", "a list without ok is not trusted");
  assert.equal(await signInLanding(answer(200, { ok: true })), "/workspace");
  assert.equal(await signInLanding((async () => new Response("not json", { status: 200 })) as unknown as typeof fetch), "/workspace");
  assert.equal(await signInLanding((async () => { throw new Error("offline"); }) as unknown as typeof fetch), "/workspace");

  // It asks for one report, with the session, and never waits past its limit.
  let asked: { url: string; init?: RequestInit } | null = null;
  await signInLanding((async (url: string, init?: RequestInit) => { asked = { url, init }; return new Response(JSON.stringify({ ok: true, reports: [] })); }) as unknown as typeof fetch);
  assert.equal(asked!.url, "/api/reports?limit=1");
  assert.equal(asked!.init?.credentials, "same-origin");

  const slow = ((_url: string, init?: RequestInit) => new Promise<Response>((_resolve, reject) => {
    init?.signal?.addEventListener("abort", () => reject(new Error("aborted")));
  })) as unknown as typeof fetch;
  const started = Date.now();
  assert.equal(await signInLanding(slow, 60), "/workspace");
  assert.ok(Date.now() - started < 1000, "a slow answer stops at the limit");

  console.log("sign-in landing: saved reports land on My reports, everything else on the upload page");
}

main().catch((error) => { console.error(error); process.exit(1); });
