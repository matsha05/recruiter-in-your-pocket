import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  INDEXNOW_ENDPOINT,
  INDEXNOW_KEY,
  INDEXNOW_KEY_LOCATION,
  indexNowBody,
  pagesToSubmit,
  submitToIndexNow,
  submittedAfter,
} from "../lib/seo/indexnow";
import { PUBLIC_PAGES } from "../lib/seo/public-pages";

async function main() {
  const pages = [
    { path: "/", updated: "2026-11-02" },
    { path: "/research/ats", updated: "2026-11-10" },
    { path: "/help", updated: "2026-11-11" },
  ];

  // Nothing sent yet: every page goes.
  assert.deepEqual(pagesToSubmit(pages, {}), pages);

  // Only the new page and the page whose date changed go. An unchanged page never goes twice.
  assert.deepEqual(
    pagesToSubmit(pages, { "/": "2026-11-02", "/research/ats": "2026-11-06" }).map((page) => page.path),
    ["/research/ats", "/help"],
  );
  assert.deepEqual(pagesToSubmit(pages, submittedAfter(pages)), []);

  // A page dropped from the list is forgotten, not resubmitted.
  assert.deepEqual(Object.keys(submittedAfter(pages.slice(0, 2))), ["/", "/research/ats"]);

  // The body names the host, the key, where the key is served, and canonical URLs.
  const body = indexNowBody(pages);
  assert.equal(body.host, "www.recruiterinyourpocket.com");
  assert.equal(body.keyLocation, `https://www.recruiterinyourpocket.com/${INDEXNOW_KEY}.txt`);
  assert.deepEqual(body.urlList, [
    "https://www.recruiterinyourpocket.com",
    "https://www.recruiterinyourpocket.com/research/ats",
    "https://www.recruiterinyourpocket.com/help",
  ]);

  // The key file the engine fetches holds exactly the key.
  assert.match(INDEXNOW_KEY, /^[a-f0-9]{32}$/);
  assert.equal(INDEXNOW_KEY_LOCATION.endsWith(`/${INDEXNOW_KEY}.txt`), true);
  assert.equal(readFileSync(path.join(__dirname, "..", "public", `${INDEXNOW_KEY}.txt`), "utf8"), INDEXNOW_KEY);

  // One POST, as JSON. 200 and 202 are both a yes; anything else, or no answer, is a no.
  let asked: { url: string; init?: RequestInit } | null = null;
  const answer = (status: number) =>
    (async (url: string, init?: RequestInit) => {
      asked = { url, init };
      return new Response(null, { status });
    }) as unknown as typeof fetch;

  assert.deepEqual(await submitToIndexNow(pages, answer(200)), { ok: true, status: 200 });
  assert.equal(asked!.url, INDEXNOW_ENDPOINT);
  assert.equal(asked!.init?.method, "POST");
  assert.deepEqual(JSON.parse(String(asked!.init?.body)), body);
  assert.deepEqual(await submitToIndexNow(pages, answer(202)), { ok: true, status: 202 });
  assert.deepEqual(await submitToIndexNow(pages, answer(403)), { ok: false, status: 403 });
  assert.deepEqual(await submitToIndexNow(pages, answer(429)), { ok: false, status: 429 });
  assert.deepEqual(
    await submitToIndexNow(pages, (async () => { throw new Error("offline"); }) as unknown as typeof fetch),
    { ok: false, status: null },
  );

  // The real list fits one request (the protocol allows 10,000 URLs).
  assert.ok(PUBLIC_PAGES.length > 0 && PUBLIC_PAGES.length < 10000);

  console.log("indexnow: only new and changed pages are sent, once");
}

main().catch((error) => { console.error(error); process.exit(1); });
