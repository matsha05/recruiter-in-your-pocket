import assert from "node:assert/strict";
import crypto from "node:crypto";
import Module from "node:module";
import path from "node:path";
import { NextRequest } from "next/server";
import {
  ANONYMOUS_ID_COOKIE,
  makeAnonymousIdentityCookie,
} from "../lib/backend/freeCookie";
import { anonymousGenerationAccessBackend } from "../lib/billing/anonymousGenerationAccess";
import {
  anonymousNetworkHashFromRequest,
  hashAnonymousIdentity,
} from "../lib/billing/anonymousIdentity";
import {
  ANONYMOUS_REPORT_RECOVERY_TTL_SECONDS,
  AnonymousReportRecoveryError,
  anonymousRecoveryStorageKey,
  createAnonymousReportRecovery,
  loadAnonymousReportRecovery,
  parseAnonymousReportRecovery,
  readLocalAnonymousEntry,
} from "../lib/reports/anonymous-report-recovery";
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
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "KV_REST_API_URL",
  "KV_REST_API_TOKEN",
] as const;

function request(url: string, identityCookie: string | null, address: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  headers.set("x-forwarded-for", address);
  if (identityCookie) headers.set("cookie", `${ANONYMOUS_ID_COOKIE}=${identityCookie}`);
  return new NextRequest(url, { ...init, signal: init?.signal || undefined, headers });
}

async function run() {
  const originalEnv = Object.fromEntries(envNames.map((name) => [name, process.env[name]]));
  const mutableEnv = process.env as Record<string, string | undefined>;
  mutableEnv.NODE_ENV = "test";
  process.env.SESSION_SECRET = "anonymous-recovery-test-secret";
  process.env.USE_MOCK_OPENAI = "1";
  process.env.RIYP_ALLOW_TEST_ANONYMOUS_ACCESS_FALLBACK = "true";
  process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  delete process.env.KV_REST_API_URL;
  delete process.env.KV_REST_API_TOKEN;

  const identity = { id: crypto.randomUUID() };
  const identityCookie = makeAnonymousIdentityCookie(identity);
  const address = "203.0.113.82";
  const otherAddress = "203.0.113.83";
  const identityHash = hashAnonymousIdentity(identity);
  const shadowHash = anonymousNetworkHashFromRequest(request(
    "http://localhost:3000/", identityCookie, address
  ))!;
  const reservationId = crypto.randomUUID();
  const monthKey = "2026-08";
  const access = { identityHash, shadowHash, monthKey, reservationId };

  const prepared = createAnonymousReportRecovery({
    ...access,
    recoveryId: crypto.randomUUID(),
    report: schemaValidReport,
    resumeHash: crypto.createHash("sha256").update("private resume").digest("hex"),
    ...( {
      resumePreview: "RAW_RESUME_MUST_NOT_BE_STORED",
      jobDescriptionPreview: "RAW_JOB_DESCRIPTION_MUST_NOT_BE_STORED",
    } as any),
  });
  const serialized = JSON.parse(prepared.serializedEnvelope);
  assert.equal(prepared.ttlSeconds, ANONYMOUS_REPORT_RECOVERY_TTL_SECONDS);
  assert.match(prepared.recoveryId, /^[0-9a-f-]{36}$/u);
  assert.equal("resume_preview" in serialized, false);
  assert.equal("job_description_preview" in serialized, false);
  assert.doesNotMatch(prepared.serializedEnvelope, /RAW_(RESUME|JOB_DESCRIPTION)_MUST_NOT_BE_STORED/u);
  assert.throws(() => createAnonymousReportRecovery({
    ...access,
    recoveryId: crypto.randomUUID(),
    report: schemaValidReport,
    resumeHash: "a".repeat(64),
    ttlSeconds: ANONYMOUS_REPORT_RECOVERY_TTL_SECONDS + 1,
  }), /Invalid anonymous report recovery input/u);

  const tampered = JSON.parse(prepared.serializedEnvelope);
  tampered.report_digest = "0".repeat(64);
  assert.equal(parseAnonymousReportRecovery(JSON.stringify(tampered)), null, "tampering must fail HMAC/digest validation");

  assert.equal(await anonymousGenerationAccessBackend.reserve(access), true);
  assert.equal(await anonymousGenerationAccessBackend.completeWithRecovery({
    ...access, recovery: prepared,
  }), "created");
  assert.equal(await anonymousGenerationAccessBackend.completeWithRecovery({
    ...access, recovery: prepared,
  }), "idempotent");
  const conflicting = createAnonymousReportRecovery({
    ...access,
    recoveryId: prepared.recoveryId,
    report: schemaValidReport,
    resumeHash: "b".repeat(64),
  });
  assert.equal(await anonymousGenerationAccessBackend.completeWithRecovery({
    ...access, recovery: conflicting,
  }), "conflict");

  assert.ok(await loadAnonymousReportRecovery({
    recoveryId: prepared.recoveryId, identityHash,
  }));
  assert.equal(await loadAnonymousReportRecovery({
    recoveryId: prepared.recoveryId,
    identityHash: "c".repeat(64),
  }), null, "the recovery ID and original shadow ledger must not replace the signed identity");

  const runtimeModule = Module as RuntimeModule;
  const originalLoad = runtimeModule._load;
  let authenticatedUser: { id: string } | null = null;
  const persisted: Array<Record<string, any>> = [];
  const persistedReportIds = new Map<string, string>();
  const persistedReportOwners = new Map<string, string>();
  const deletedReportIds = new Set<string>();
  let concurrentBarrier: Promise<void> | null = null;
  let releaseConcurrentBarrier: (() => void) | null = null;
  let concurrentPersistCount = 0;
  let deletePersistedImmediately = false;
  runtimeModule._load = function loadWithRouteMocks(moduleName, parent, isMain) {
    if (moduleName === "@/lib/supabase/serverClient") {
      return {
        createSupabaseServerClient: async () => ({
          auth: { getUser: async () => ({ data: { user: authenticatedUser }, error: null }) },
        }),
      };
    }
    if (moduleName === "@/lib/supabase/adminClient") {
      return { createSupabaseAdminClient: () => ({ serviceRole: true }) };
    }
    if (moduleName === "@/lib/reports/generated-report-store") {
      return {
        persistReceiptValidatedReport: async (input: Record<string, any>) => {
          persisted.push(input);
          if (!persistedReportIds.has(input.receiptHash)) {
            const reportIds = [
              "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
              "ffffffff-ffff-4fff-8fff-ffffffffffff",
              "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
            ];
            persistedReportIds.set(
              input.receiptHash,
              reportIds[persistedReportIds.size],
            );
          }
          persistedReportOwners.set(persistedReportIds.get(input.receiptHash)!, input.userId);
          if (deletePersistedImmediately) deletedReportIds.add(persistedReportIds.get(input.receiptHash)!);
          if (concurrentBarrier) {
            concurrentPersistCount += 1;
            if (concurrentPersistCount === 2) releaseConcurrentBarrier?.();
            await concurrentBarrier;
          }
          return persistedReportIds.get(input.receiptHash)!;
        },
        ownedStoredReportExists: async (_admin: unknown, userId: string, reportId: string) => (
          persistedReportOwners.get(reportId) === userId && !deletedReportIds.has(reportId)
        ),
      };
    }
    if (moduleName.startsWith("@/")) {
      return originalLoad(path.join(process.cwd(), moduleName.slice(2)), parent, isMain);
    }
    return originalLoad(moduleName, parent, isMain);
  };

  try {
    const recoveryRoute = require("../app/api/reports/recovery/route") as {
      GET: (request: NextRequest) => Promise<Response>;
      POST: (request: NextRequest) => Promise<Response>;
    };
    const recoveryUrl = `http://localhost:3000/api/reports/recovery?recovery_id=${prepared.recoveryId}`;
    const anonymousGet = await recoveryRoute.GET(request(recoveryUrl, identityCookie, address));
    assert.equal(anonymousGet.status, 200);
    assert.match(anonymousGet.headers.get("cache-control") || "", /no-store/u);
    assert.deepEqual((await anonymousGet.json()).report, prepared.envelope.report);

    assert.equal(
      (await recoveryRoute.GET(request(recoveryUrl, null, address))).status,
      404,
      "a recovery ID and network shadow alone must not authorize content"
    );
    assert.equal(
      (await recoveryRoute.GET(request(recoveryUrl, identityCookie, otherAddress))).status,
      200,
      "the signed durable identity must recover after an IP/network change"
    );

    const claimRequest = (
      body: unknown,
      claimAddress = address,
      claimCookie: string | null = identityCookie,
    ) => request(
      "http://localhost:3000/api/reports/recovery",
      claimCookie,
      claimAddress,
      {
        method: "POST",
        headers: { "content-type": "application/json", origin: "http://localhost:3000" },
        body: JSON.stringify(body),
      }
    );
    assert.equal((await recoveryRoute.POST(claimRequest({
      recovery_id: prepared.recoveryId,
    }))).status, 401);
    authenticatedUser = { id: "11111111-1111-4111-8111-111111111111" };
    assert.equal((await recoveryRoute.POST(claimRequest({
      recovery_id: prepared.recoveryId,
      report: schemaValidReport,
    }))).status, 400, "claim must accept only the opaque recovery ID");
    assert.equal(persisted.length, 0, "unauthorized claims must not reach persistence");

    const claim = await recoveryRoute.POST(claimRequest(
      { recovery_id: prepared.recoveryId },
      otherAddress
    ));
    assert.equal(claim.status, 200);
    assert.equal((await claim.json()).reportId, "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee");
    assert.equal(persisted.length, 1);
    assert.deepEqual(
      persisted[0].payload,
      prepared.envelope.report,
      "claim must persist the server envelope, not client content"
    );
    assert.equal(persisted[0].resumeHash, prepared.envelope.resume_hash);
    assert.equal(persisted[0].createdAt, prepared.envelope.created_at);

    const retry = await recoveryRoute.POST(claimRequest({ recovery_id: prepared.recoveryId }));
    assert.equal(retry.status, 200, "a response-loss retry must be idempotent");
    assert.equal((await retry.json()).reportId, "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee");
    assert.equal(persisted.length, 1, "a tombstone retry must not persist again");

    const afterClaimGet = await recoveryRoute.GET(request(recoveryUrl, identityCookie, address));
    assert.equal(afterClaimGet.status, 404, "GET must never expose a claimed report or tombstone");
    assert.equal("reportId" in await afterClaimGet.json(), false);
    assert.equal(
      (await recoveryRoute.POST(claimRequest(
        { recovery_id: prepared.recoveryId },
        address,
        null,
      ))).status,
      404,
      "the signed-in owner still needs the original anonymous identity cookie"
    );

    authenticatedUser = { id: "22222222-2222-4222-8222-222222222222" };
    assert.equal(
      (await recoveryRoute.POST(claimRequest({ recovery_id: prepared.recoveryId }))).status,
      409,
      "another account must not inherit the owner-bound claim"
    );
    authenticatedUser = { id: "11111111-1111-4111-8111-111111111111" };
    deletedReportIds.add("eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee");
    const deletedRetry = await recoveryRoute.POST(claimRequest({ recovery_id: prepared.recoveryId }));
    assert.equal(deletedRetry.status, 410, "a lost-response retry must not resurrect a deleted report");
    assert.equal((await deletedRetry.json()).errorCode, "RECOVERED_REPORT_GONE");

    const tombstoneEntry = readLocalAnonymousEntry(
      anonymousRecoveryStorageKey(prepared.recoveryId)
    );
    assert.ok(tombstoneEntry);
    const tombstone = JSON.parse(tombstoneEntry.value) as Record<string, unknown>;
    assert.deepEqual(Object.keys(tombstone).sort(), [
      "claimant_hash", "created_at", "expires_at", "identity_hash", "kind",
      "recovery_id", "report_id", "signature", "version",
    ]);
    assert.equal(tombstone.created_at, prepared.envelope.created_at);
    assert.equal(tombstone.expires_at, prepared.envelope.expires_at);
    assert.ok(tombstoneEntry.expiresAtMs <= Date.parse(prepared.envelope.expires_at));
    assert.doesNotMatch(tombstoneEntry.value, /11111111-1111-4111-8111-111111111111/u);
    assert.equal(tombstoneEntry.value.includes(prepared.envelope.report_receipt), false);
    assert.equal(tombstoneEntry.value.includes(prepared.envelope.report_digest), false);
    assert.equal(tombstoneEntry.value.includes(prepared.envelope.resume_hash), false);
    assert.equal(tombstoneEntry.value.includes(JSON.stringify(prepared.envelope.report)), false);
    assert.doesNotMatch(
      tombstoneEntry.value,
      /private resume|RAW_RESUME_MUST_NOT_BE_STORED|RAW_JOB_DESCRIPTION_MUST_NOT_BE_STORED/u,
    );

    const deletedDuringIdentity = { id: crypto.randomUUID() };
    const deletedDuringCookie = makeAnonymousIdentityCookie(deletedDuringIdentity);
    const deletedDuringAddress = "203.0.113.85";
    const deletedDuringClaimAccess = {
      identityHash: hashAnonymousIdentity(deletedDuringIdentity),
      shadowHash: anonymousNetworkHashFromRequest(request(
        "http://localhost:3000/", deletedDuringCookie, deletedDuringAddress,
      ))!,
      monthKey,
      reservationId: crypto.randomUUID(),
    };
    const deletedDuringClaim = createAnonymousReportRecovery({
      ...deletedDuringClaimAccess,
      recoveryId: crypto.randomUUID(),
      report: schemaValidReport,
      resumeHash: crypto.createHash("sha256").update("deleted during claim").digest("hex"),
    });
    assert.equal(await anonymousGenerationAccessBackend.reserve(deletedDuringClaimAccess), true);
    assert.equal(await anonymousGenerationAccessBackend.completeWithRecovery({
      ...deletedDuringClaimAccess,
      recovery: deletedDuringClaim,
    }), "created");
    deletePersistedImmediately = true;
    const deletedInitial = await recoveryRoute.POST(claimRequest(
      { recovery_id: deletedDuringClaim.recoveryId },
      deletedDuringAddress,
      deletedDuringCookie,
    ));
    deletePersistedImmediately = false;
    assert.equal(deletedInitial.status, 410, "an initial claim must verify ownership after tombstone replacement");
    assert.equal((await deletedInitial.json()).errorCode, "RECOVERED_REPORT_GONE");

    const concurrentIdentity = { id: crypto.randomUUID() };
    const concurrentCookie = makeAnonymousIdentityCookie(concurrentIdentity);
    const concurrentAddress = "203.0.113.84";
    const concurrentAccess = {
      identityHash: hashAnonymousIdentity(concurrentIdentity),
      shadowHash: anonymousNetworkHashFromRequest(request(
        "http://localhost:3000/", concurrentCookie, concurrentAddress
      ))!,
      monthKey,
      reservationId: crypto.randomUUID(),
    };
    const concurrentRecovery = createAnonymousReportRecovery({
      ...concurrentAccess,
      recoveryId: crypto.randomUUID(),
      report: schemaValidReport,
      resumeHash: crypto.createHash("sha256").update("second private resume").digest("hex"),
    });
    assert.equal(await anonymousGenerationAccessBackend.reserve(concurrentAccess), true);
    assert.equal(await anonymousGenerationAccessBackend.completeWithRecovery({
      ...concurrentAccess,
      recovery: concurrentRecovery,
    }), "created");
    concurrentBarrier = new Promise<void>((resolve) => {
      releaseConcurrentBarrier = resolve;
    });
    const concurrentClaims = await Promise.all([
      recoveryRoute.POST(claimRequest(
        { recovery_id: concurrentRecovery.recoveryId },
        concurrentAddress,
        concurrentCookie,
      )),
      recoveryRoute.POST(claimRequest(
        { recovery_id: concurrentRecovery.recoveryId },
        concurrentAddress,
        concurrentCookie,
      )),
    ]);
    concurrentBarrier = null;
    assert.deepEqual(concurrentClaims.map((response) => response.status), [200, 200]);
    assert.deepEqual(
      await Promise.all(concurrentClaims.map(async (response) => (await response.json()).reportId)),
      [
        "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
        "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
      ],
      "concurrent same-owner claims must converge on one report ID"
    );
  } finally {
    runtimeModule._load = originalLoad;
  }

  mutableEnv.NODE_ENV = "production";
  await assert.rejects(
    loadAnonymousReportRecovery({
      recoveryId: crypto.randomUUID(),
      identityHash,
    }),
    (error: unknown) => error instanceof AnonymousReportRecoveryError,
    "production recovery must fail closed even when local mock fallback flags are present"
  );

  for (const name of envNames) {
    const value = originalEnv[name];
    if (value === undefined) delete mutableEnv[name];
    else mutableEnv[name] = value;
  }
}

run().then(() => console.log("anonymous report recovery tests passed")).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
