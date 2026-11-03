import assert from "node:assert/strict";
import crypto from "node:crypto";
import { readFileSync } from "node:fs";
import Module from "node:module";
import path from "node:path";
import { NextRequest } from "next/server";
import {
  ANONYMOUS_ID_COOKIE,
  FREE_COOKIE,
  getCurrentMonthKey,
  makeAnonymousIdentityCookie,
  makeFreeCookie,
  parseFreeCookie,
} from "../lib/backend/freeCookie";
import { anonymousGenerationAccessBackend } from "../lib/billing/anonymousGenerationAccess";
import {
  anonymousNetworkHashFromRequest,
  hashAnonymousIdentity,
} from "../lib/billing/anonymousIdentity";
import {
  ANONYMOUS_COMMITTED_TTL_SECONDS,
  ANONYMOUS_HOLD_TTL_SECONDS,
  ANONYMOUS_RECOVERY_TTL_MS,
  ANONYMOUS_RECOVERY_TTL_SECONDS,
  GENERATION_HOLD_SQL_INTERVAL,
} from "../lib/billing/anonymousLedgerTimings";
import {
  ANONYMOUS_REPORT_RECOVERY_TTL_SECONDS,
  AnonymousReportRecoveryError,
  anonymousRecoveryStorageKey,
  createAnonymousReportRecovery,
  deleteLocalAnonymousEntry,
  readLocalAnonymousEntry,
} from "../lib/reports/anonymous-report-recovery";
import { ANONYMOUS_REPORT_RECOVERY_TTL_MS } from "../lib/reports/anonymous-report-recovery-client";
import { schemaValidReport } from "./helpers/report-fidelity-fixture";

type RuntimeModule = typeof Module & {
  _load: (request: string, parent: NodeModule | null, isMain: boolean) => unknown;
};

const envNames = [
  "NODE_ENV",
  "SESSION_SECRET",
  "ANONYMOUS_REPORT_RECOVERY_SECRET",
  "USE_MOCK_OPENAI",
  "RIYP_ALLOW_TEST_ANONYMOUS_ACCESS_FALLBACK",
  "NEXT_PUBLIC_APP_URL",
  "VERCEL_ENV",
  "VERCEL_URL",
  "BYPASS_PAYWALL",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "KV_REST_API_URL",
  "KV_REST_API_TOKEN",
] as const;

function sha(seed: string) {
  return crypto.createHash("sha256").update(seed).digest("hex");
}

function networkHash(address: string) {
  return anonymousNetworkHashFromRequest(new Request("http://localhost:3000/", {
    headers: { "x-forwarded-for": address },
  }))!;
}

function ledgerKey(monthKey: string, identityHash: string) {
  return `generation:anonymous:${monthKey}:${identityHash}`;
}

function networkKey(monthKey: string, shadowHash: string) {
  return `generation:anonymous:${monthKey}:network:${shadowHash}`;
}

function request(
  url: string,
  cookies: Record<string, string | null>,
  address: string,
  init?: RequestInit,
) {
  const headers = new Headers(init?.headers);
  headers.set("x-forwarded-for", address);
  const cookie = Object.entries(cookies)
    .filter((entry): entry is [string, string] => Boolean(entry[1]))
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");
  if (cookie) headers.set("cookie", cookie);
  return new NextRequest(url, { ...init, signal: init?.signal || undefined, headers });
}

async function run() {
  const originalEnv = Object.fromEntries(envNames.map((name) => [name, process.env[name]]));
  const mutableEnv = process.env as Record<string, string | undefined>;
  mutableEnv.NODE_ENV = "test";
  process.env.SESSION_SECRET = "anonymous-ledger-test-secret";
  process.env.USE_MOCK_OPENAI = "1";
  process.env.RIYP_ALLOW_TEST_ANONYMOUS_ACCESS_FALLBACK = "true";
  process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
  for (const name of [
    "VERCEL_ENV", "VERCEL_URL", "BYPASS_PAYWALL",
    "UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN", "KV_REST_API_URL", "KV_REST_API_TOKEN",
  ]) delete process.env[name];

  const monthKey = getCurrentMonthKey();

  // ---------------------------------------------------------------------------
  // 5. Every lifetime is named once, and the two holds agree.
  // ---------------------------------------------------------------------------
  assert.equal(ANONYMOUS_HOLD_TTL_SECONDS, 15 * 60);
  assert.equal(GENERATION_HOLD_SQL_INTERVAL, "15 minutes");
  for (const migration of [
    "012_generation_access_reservations.sql",
    "021_revoked_pass_generation_access.sql",
  ]) {
    const sql = readFileSync(path.join(process.cwd(), "database", "migrations", migration), "utf8");
    const intervals = Array.from(sql.matchAll(/v_hold_expires_at[^;]*INTERVAL '([^']+)'/g), (match) => match[1]);
    assert.ok(intervals.length > 0, `${migration} declares the signed-in hold`);
    for (const interval of intervals) {
      assert.equal(interval, GENERATION_HOLD_SQL_INTERVAL, `${migration} hold must equal the anonymous hold`);
    }
  }
  assert.equal(ANONYMOUS_REPORT_RECOVERY_TTL_SECONDS, ANONYMOUS_RECOVERY_TTL_SECONDS);
  assert.equal(ANONYMOUS_REPORT_RECOVERY_TTL_MS, ANONYMOUS_RECOVERY_TTL_MS);
  assert.equal(ANONYMOUS_RECOVERY_TTL_MS, ANONYMOUS_RECOVERY_TTL_SECONDS * 1000);
  assert.ok(
    ANONYMOUS_HOLD_TTL_SECONDS < ANONYMOUS_RECOVERY_TTL_SECONDS
    && ANONYMOUS_RECOVERY_TTL_SECONDS < ANONYMOUS_COMMITTED_TTL_SECONDS,
    "a hold ends before the recovery window, which ends before the committed entry",
  );
  assert.ok(ANONYMOUS_COMMITTED_TTL_SECONDS >= 31 * 24 * 60 * 60, "a committed entry outlives the longest month");
  for (const file of [
    "lib/billing/anonymousGenerationAccess.ts",
    "lib/reports/anonymous-report-recovery.ts",
    "lib/reports/anonymous-report-recovery-client.ts",
    "lib/reports/anonymous-report-claim-tombstone.ts",
  ]) {
    const source = readFileSync(path.join(process.cwd(), file), "utf8");
    assert.doesNotMatch(source, /=\s*\d+\s*\*\s*(60|24)\s*\*/, `${file} takes its lifetimes from anonymousLedgerTimings`);
  }

  // ---------------------------------------------------------------------------
  // The reserve script refuses without writing.
  // ---------------------------------------------------------------------------
  const ledgerSource = readFileSync(path.join(process.cwd(), "lib/billing/anonymousGenerationAccess.ts"), "utf8");
  const reserveScript = ledgerSource.match(/const RESERVE_SCRIPT = `([\s\S]*?)`;/)?.[1] || "";
  assert.ok(reserveScript.includes("return 1"), "the reserve script is present");
  const lastRefusal = Math.max(...["return 2", "return 3", "return 4"].map((line) => reserveScript.lastIndexOf(line)));
  const firstWrite = reserveScript.indexOf('redis.call("SET"');
  assert.ok(firstWrite > lastRefusal, "every refusal returns before the reserve script writes anything");
  assert.equal(reserveScript.match(/redis\.call\("SET"/g)?.length, 2, "a reservation writes both keys, once each");
  assert.doesNotMatch(ledgerSource, /reconcileCommitted|RECONCILE_COMMITTED/, "the ledger has no cookie-seeded write path");

  // ---------------------------------------------------------------------------
  // 1. A used-up visitor cannot poison a shared network, and a network cannot
  //    follow a fresh visitor home.
  // ---------------------------------------------------------------------------
  const home = { identity: { id: crypto.randomUUID() }, address: "203.0.113.10" };
  const homeIdentityHash = hashAnonymousIdentity(home.identity);
  const homeShadow = networkHash(home.address);
  const cafeShadow = networkHash("203.0.113.20");
  const homeReservation = crypto.randomUUID();

  assert.deepEqual(await anonymousGenerationAccessBackend.reserveWithReason({
    identityHash: homeIdentityHash, shadowHash: homeShadow, monthKey, reservationId: homeReservation,
  }), { reserved: true });
  const held = readLocalAnonymousEntry(ledgerKey(monthKey, homeIdentityHash));
  assert.ok(held);
  assert.ok(
    Math.abs(held.expiresAtMs - Date.now() - ANONYMOUS_HOLD_TTL_SECONDS * 1000) < 5_000,
    "a hold lasts exactly the shared hold lifetime",
  );
  assert.equal(await anonymousGenerationAccessBackend.commit({
    identityHash: homeIdentityHash, shadowHash: homeShadow, monthKey, reservationId: homeReservation,
  }), true);

  // The visitor opens the app at a cafe. Refused, and the cafe is untouched.
  assert.deepEqual(await anonymousGenerationAccessBackend.reserveWithReason({
    identityHash: homeIdentityHash, shadowHash: cafeShadow, monthKey, reservationId: crypto.randomUUID(),
  }), { reserved: false, refusal: "identity" });
  assert.equal(readLocalAnonymousEntry(networkKey(monthKey, cafeShadow)), null,
    "a refusal must not write the network key");
  assert.deepEqual(await anonymousGenerationAccessBackend.inspect({
    identityHash: homeIdentityHash, shadowHash: cafeShadow, monthKey,
  }), { status: "committed", reservationId: homeReservation, identity: "committed", network: "available" });

  // Someone else at the cafe gets their report.
  const cafeVisitor = hashAnonymousIdentity({ id: crypto.randomUUID() });
  const cafeReservation = crypto.randomUUID();
  assert.deepEqual(await anonymousGenerationAccessBackend.reserveWithReason({
    identityHash: cafeVisitor, shadowHash: cafeShadow, monthKey, reservationId: cafeReservation,
  }), { reserved: true }, "a fresh visitor on the cafe network is not blocked by the used-up visitor's presence");
  assert.equal(await anonymousGenerationAccessBackend.commit({
    identityHash: cafeVisitor, shadowHash: cafeShadow, monthKey, reservationId: cafeReservation,
  }), true);

  // Now the cafe network has minted a report. A third person there is refused
  // by the network, but their own identity stays clean and works elsewhere.
  const thirdIdentity = hashAnonymousIdentity({ id: crypto.randomUUID() });
  assert.deepEqual(await anonymousGenerationAccessBackend.reserveWithReason({
    identityHash: thirdIdentity, shadowHash: cafeShadow, monthKey, reservationId: crypto.randomUUID(),
  }), { reserved: false, refusal: "network" });
  assert.equal(readLocalAnonymousEntry(ledgerKey(monthKey, thirdIdentity)), null,
    "a network refusal must not write the identity key");
  assert.deepEqual(await anonymousGenerationAccessBackend.reserveWithReason({
    identityHash: thirdIdentity, shadowHash: networkHash("203.0.113.30"), monthKey, reservationId: crypto.randomUUID(),
  }), { reserved: true }, "the third person gets their report once they are on their own network");

  // ---------------------------------------------------------------------------
  // Route-level checks need the Next request scope and Supabase mocked.
  // ---------------------------------------------------------------------------
  const runtimeModule = Module as RuntimeModule;
  const originalLoad = runtimeModule._load;
  let currentCookies: Record<string, string | null> = {};
  let authenticatedUser: { id: string } | null = null;
  const persisted: Array<Record<string, any>> = [];
  const persistedReportIds = new Map<string, string>();
  let failTombstoneOnce = false;
  let dropEnvelopeBeforeTombstoneOnce = false;
  runtimeModule._load = function loadWithRouteMocks(moduleName, parent, isMain) {
    if (moduleName === "next/headers") {
      return {
        cookies: async () => ({
          get: (name: string) => (currentCookies[name] ? { name, value: currentCookies[name]! } : undefined),
        }),
      };
    }
    if (moduleName === "@/lib/supabase/serverClient") {
      const client = () => ({
        auth: { getUser: async () => ({ data: { user: authenticatedUser }, error: null }) },
      });
      return {
        createSupabaseServerClient: async () => client(),
        maybeCreateSupabaseServerClient: async () => (authenticatedUser ? client() : null),
      };
    }
    if (moduleName === "@/lib/supabase/adminClient") {
      return { createSupabaseAdminClient: () => ({
        serviceRole: true,
        rpc: async () => ({ data: { found: false }, error: null }),
      }) };
    }
    if (moduleName === "@/lib/reports/generated-report-store") {
      return {
        persistReceiptValidatedReport: async (input: Record<string, any>) => {
          persisted.push(input);
          if (!persistedReportIds.has(input.receiptHash)) {
            persistedReportIds.set(input.receiptHash, crypto.randomUUID());
          }
          return persistedReportIds.get(input.receiptHash)!;
        },
        ownedStoredReportExists: async () => true,
      };
    }
    if (moduleName === "@/lib/reports/anonymous-report-claim-tombstone") {
      const real = originalLoad(
        path.join(process.cwd(), "lib/reports/anonymous-report-claim-tombstone"), parent, isMain,
      ) as Record<string, any>;
      return {
        ...real,
        replaceAnonymousReportRecoveryWithClaimTombstone: async (input: Record<string, any>) => {
          if (failTombstoneOnce) {
            failTombstoneOnce = false;
            throw new AnonymousReportRecoveryError();
          }
          if (dropEnvelopeBeforeTombstoneOnce) {
            dropEnvelopeBeforeTombstoneOnce = false;
            deleteLocalAnonymousEntry(anonymousRecoveryStorageKey(input.envelope.recovery_id));
          }
          return real.replaceAnonymousReportRecoveryWithClaimTombstone(input);
        },
      };
    }
    if (moduleName.startsWith("@/")) {
      return originalLoad(path.join(process.cwd(), moduleName.slice(2)), parent, isMain);
    }
    return originalLoad(moduleName, parent, isMain);
  };

  try {
    const freeStatusRoute = require("../app/api/free-status/route") as {
      GET: (request: Request) => Promise<Response>;
    };
    const recoveryRoute = require("../app/api/reports/recovery/route") as {
      GET: (request: NextRequest) => Promise<Response>;
      POST: (request: NextRequest) => Promise<Response>;
    };

    // -------------------------------------------------------------------------
    // 2. GET /api/free-status reads the ledger and never writes it, and only
    //    the visitor's own key may mark the cookie.
    // -------------------------------------------------------------------------
    const snapshot = (identityHash: string, shadowHash: string) => ({
      identity: readLocalAnonymousEntry(ledgerKey(monthKey, identityHash))?.value ?? null,
      network: readLocalAnonymousEntry(networkKey(monthKey, shadowHash))?.value ?? null,
    });
    const freeStatus = async (cookies: Record<string, string | null>, address: string) => {
      currentCookies = cookies;
      const response = await freeStatusRoute.GET(request("http://localhost:3000/api/free-status", cookies, address));
      const body = await response.json();
      const setCookie = (response as unknown as { cookies: { get(name: string): { value: string } | undefined } })
        .cookies.get(FREE_COOKIE)?.value;
      return { body, freeCookie: setCookie ? parseFreeCookie(setCookie) : null };
    };

    // The used-up home visitor at the cafe: told 0, cookie synced from their own key.
    const homeCookie = makeAnonymousIdentityCookie(home.identity);
    const beforeHome = snapshot(homeIdentityHash, cafeShadow);
    const homeAtCafe = await freeStatus({ [ANONYMOUS_ID_COOKIE]: homeCookie }, "203.0.113.20");
    assert.equal(homeAtCafe.body.free_uses_remaining, 0);
    assert.equal(homeAtCafe.body.source, "anonymous_ledger");
    assert.equal(homeAtCafe.freeCookie?.used, 1, "the visitor's own committed key refreshes their cookie");
    assert.deepEqual(snapshot(homeIdentityHash, cafeShadow), beforeHome, "a status read leaves the ledger as it was");
    assert.equal(beforeHome.network, `committed:${cafeReservation}`,
      "the cafe network carries only the report minted there, never the home visitor's");

    // A stale "used" cookie with a fresh identity must not seed the ledger.
    const staleIdentity = { id: crypto.randomUUID() };
    const staleIdentityHash = hashAnonymousIdentity(staleIdentity);
    const staleShadow = networkHash("203.0.113.40");
    const usedCookie = makeFreeCookie({ used: 1, last_free_ts: new Date().toISOString(), reset_month: monthKey });
    const stale = await freeStatus({
      [ANONYMOUS_ID_COOKIE]: makeAnonymousIdentityCookie(staleIdentity),
      [FREE_COOKIE]: usedCookie,
    }, "203.0.113.40");
    assert.equal(stale.body.free_uses_remaining, 0, "the signed cookie still refuses on its own");
    assert.equal(stale.body.source, "cookie");
    assert.deepEqual(snapshot(staleIdentityHash, staleShadow), { identity: null, network: null },
      "a used cookie never seeds either ledger key");

    // A fresh visitor on the minted cafe network: told 0 for now, cookie left clean.
    const freshIdentity = { id: crypto.randomUUID() };
    const freshAtCafe = await freeStatus({ [ANONYMOUS_ID_COOKIE]: makeAnonymousIdentityCookie(freshIdentity) }, "203.0.113.20");
    assert.equal(freshAtCafe.body.free_uses_remaining, 0);
    assert.equal(freshAtCafe.body.source, "anonymous_ledger");
    assert.equal(freshAtCafe.freeCookie?.used ?? 0, 0, "a network block must not be written into the visitor's cookie");
    const freshAtHome = await freeStatus({ [ANONYMOUS_ID_COOKIE]: makeAnonymousIdentityCookie(freshIdentity) }, "203.0.113.50");
    assert.equal(freshAtHome.body.free_uses_remaining, 1, "the same visitor has their report once they leave the cafe");
    assert.equal(freshAtHome.body.source, "cookie");

    // -------------------------------------------------------------------------
    // 3. Recovery GET tells "not yet" from "never" so the browser can stop.
    // -------------------------------------------------------------------------
    const recoveryUrl = (recoveryId: string) => `http://localhost:3000/api/reports/recovery?recovery_id=${recoveryId}`;
    const recoveryGet = async (recoveryId: string, cookie: string | null, address: string) => {
      const response = await recoveryRoute.GET(request(recoveryUrl(recoveryId), { [ANONYMOUS_ID_COOKIE]: cookie }, address));
      return { status: response.status, body: await response.json() };
    };

    const waiting = { identity: { id: crypto.randomUUID() }, address: "203.0.113.60" };
    const waitingCookie = makeAnonymousIdentityCookie(waiting.identity);
    const waitingHash = hashAnonymousIdentity(waiting.identity);
    const waitingShadow = networkHash(waiting.address);
    const waitingReservation = crypto.randomUUID();
    const waitingRecoveryId = crypto.randomUUID();

    const unknown = await recoveryGet(waitingRecoveryId, waitingCookie, waiting.address);
    assert.equal(unknown.status, 202, "nothing known yet is not terminal");
    assert.deepEqual(unknown.body, { ok: false, recovery_id: waitingRecoveryId, status: "pending", reason: "unknown" });

    assert.equal(await anonymousGenerationAccessBackend.reserve({
      identityHash: waitingHash, shadowHash: waitingShadow, monthKey, reservationId: waitingReservation,
    }), true);
    const generating = await recoveryGet(waitingRecoveryId, waitingCookie, waiting.address);
    assert.equal(generating.status, 202);
    assert.equal(generating.body.reason, "generating", "a held reservation means the report is still being made");
    const generatingElsewhere = await recoveryGet(waitingRecoveryId, waitingCookie, "203.0.113.61");
    assert.equal(generatingElsewhere.body.reason, "generating", "the identity key answers even from another network");

    const envelope = createAnonymousReportRecovery({
      reservationId: waitingReservation,
      identityHash: waitingHash,
      shadowHash: waitingShadow,
      monthKey,
      recoveryId: waitingRecoveryId,
      report: schemaValidReport,
      resumeHash: sha("waiting resume"),
    });
    assert.equal(await anonymousGenerationAccessBackend.completeWithRecovery({
      identityHash: waitingHash, shadowHash: waitingShadow, monthKey, reservationId: waitingReservation, recovery: envelope,
    }), "created");
    const found = await recoveryGet(waitingRecoveryId, waitingCookie, "203.0.113.61");
    assert.equal(found.status, 200);
    assert.equal(found.body.recovery_id, waitingRecoveryId);

    const strangerCookie = makeAnonymousIdentityCookie({ id: crypto.randomUUID() });
    const stranger = await recoveryGet(waitingRecoveryId, strangerCookie, waiting.address);
    assert.equal(stranger.status, 404, "another identity is terminal, not pending");
    assert.equal(stranger.body.errorCode, "RECOVERY_NOT_FOUND");
    assert.equal((await recoveryGet(waitingRecoveryId, null, waiting.address)).status, 404,
      "no identity cookie is terminal");

    const orphanRecoveryId = crypto.randomUUID();
    const orphan = await recoveryGet(orphanRecoveryId, waitingCookie, waiting.address);
    assert.equal(orphan.status, 410, "a minted identity with nothing stored under a new id is terminal");
    assert.equal(orphan.body.errorCode, "RECOVERY_EXPIRED");
    assert.deepEqual(snapshot(waitingHash, waitingShadow), {
      identity: `committed:${waitingReservation}`,
      network: `committed:${waitingReservation}`,
    }, "recovery reads never touch the ledger");

    // -------------------------------------------------------------------------
    // 4. The claim survives a Redis failure after the Postgres claim, and a
    //    retry converges on the same report.
    // -------------------------------------------------------------------------
    const claim = async (recoveryId: string, cookie: string, address: string) => {
      const response = await recoveryRoute.POST(request(
        "http://localhost:3000/api/reports/recovery",
        { [ANONYMOUS_ID_COOKIE]: cookie },
        address,
        {
          method: "POST",
          headers: { "content-type": "application/json", origin: "http://localhost:3000" },
          body: JSON.stringify({ recovery_id: recoveryId }),
        },
      ));
      return { status: response.status, body: await response.json() };
    };
    authenticatedUser = { id: "33333333-3333-4333-8333-333333333333" };

    failTombstoneOnce = true;
    const firstClaim = await claim(waitingRecoveryId, waitingCookie, waiting.address);
    assert.equal(firstClaim.status, 200, "the account holds the report once Postgres has it, whatever Redis did");
    assert.equal(persisted.length, 1);
    const ownedReportId = firstClaim.body.reportId;
    assert.match(ownedReportId, /^[0-9a-f-]{36}$/u);
    assert.equal((await recoveryGet(waitingRecoveryId, waitingCookie, waiting.address)).status, 200,
      "until the tombstone lands the browser can still see its report");

    const retryClaim = await claim(waitingRecoveryId, waitingCookie, waiting.address);
    assert.equal(retryClaim.status, 200);
    assert.equal(retryClaim.body.reportId, ownedReportId, "the retry converges on the same report");
    assert.equal(persisted.length, 2, "the retry goes back through the idempotent Postgres claim");
    const afterRetry = await recoveryGet(waitingRecoveryId, waitingCookie, waiting.address);
    assert.equal(afterRetry.status, 410, "the retry wrote the tombstone");
    assert.equal(afterRetry.body.errorCode, "RECOVERY_CLAIMED");
    const settled = await claim(waitingRecoveryId, waitingCookie, waiting.address);
    assert.equal(settled.status, 200);
    assert.equal(settled.body.reportId, ownedReportId);
    assert.equal(persisted.length, 2, "a tombstoned claim answers without touching Postgres");

    authenticatedUser = { id: "44444444-4444-4444-8444-444444444444" };
    assert.equal((await claim(waitingRecoveryId, waitingCookie, waiting.address)).status, 409,
      "another account cannot take the saved report");
    authenticatedUser = { id: "33333333-3333-4333-8333-333333333333" };

    // The envelope expires between the Postgres claim and the tombstone swap.
    const vanishing = { identity: { id: crypto.randomUUID() }, address: "203.0.113.70" };
    const vanishingCookie = makeAnonymousIdentityCookie(vanishing.identity);
    const vanishingHash = hashAnonymousIdentity(vanishing.identity);
    const vanishingShadow = networkHash(vanishing.address);
    const vanishingReservation = crypto.randomUUID();
    const vanishingRecoveryId = crypto.randomUUID();
    assert.equal(await anonymousGenerationAccessBackend.reserve({
      identityHash: vanishingHash, shadowHash: vanishingShadow, monthKey, reservationId: vanishingReservation,
    }), true);
    assert.equal(await anonymousGenerationAccessBackend.completeWithRecovery({
      identityHash: vanishingHash, shadowHash: vanishingShadow, monthKey, reservationId: vanishingReservation,
      recovery: createAnonymousReportRecovery({
        reservationId: vanishingReservation,
        identityHash: vanishingHash,
        shadowHash: vanishingShadow,
        monthKey,
        recoveryId: vanishingRecoveryId,
        report: schemaValidReport,
        resumeHash: sha("vanishing resume"),
      }),
    }), "created");
    dropEnvelopeBeforeTombstoneOnce = true;
    const vanishingClaim = await claim(vanishingRecoveryId, vanishingCookie, vanishing.address);
    assert.equal(vanishingClaim.status, 200, "a swap conflict after the Postgres claim still reports the saved report");
    assert.match(vanishingClaim.body.reportId, /^[0-9a-f-]{36}$/u);
    const vanished = await recoveryGet(vanishingRecoveryId, vanishingCookie, vanishing.address);
    assert.equal(vanished.status, 410);
    assert.equal(vanished.body.errorCode, "RECOVERY_EXPIRED");

    // The claim route documents its order.
    const routeSource = readFileSync(path.join(process.cwd(), "app/api/reports/recovery/route.ts"), "utf8");
    assert.ok(
      routeSource.indexOf("await persistReceiptValidatedReport(") < routeSource.indexOf("await tombstoneAfterClaim("),
      "Postgres claims before Redis tombstones",
    );
    assert.match(routeSource, /recovery\.claim\.tombstone_deferred/);
  } finally {
    runtimeModule._load = originalLoad;
  }

  for (const name of envNames) {
    const value = originalEnv[name];
    if (value === undefined) delete mutableEnv[name];
    else mutableEnv[name] = value;
  }
}

run().then(() => console.log("anonymous ledger state machine tests passed")).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
