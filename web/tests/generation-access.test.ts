import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { makeFreeCookie, parseFreeCookie, type ParsedFreeMeta } from "../lib/backend/freeCookie";
import { allowsExplicitLocalAnonymousAccessFallback } from "../lib/billing/anonymousGenerationAccess";
import {
  GenerationAccessError,
  assertGenerationAccessDependencies,
  assertGenerationAuthLookup,
  commitGenerationAccess,
  markGenerationProviderCallStarted,
  releaseGenerationAccess,
  releaseReasonForError,
  reserveGenerationAccess,
  type GenerationAccessRpcClient,
} from "../lib/billing/generationAccess";

type HeldReservation = {
  id: string;
  userId: string;
  kind: "free" | "pass_credit";
  status: "reserved" | "committed" | "released" | "refunded";
};

class AtomicFakeRpc implements GenerationAccessRpcClient {
  private queue = Promise.resolve();
  private freeUsed = false;
  private passCredits: number;
  private reservations = new Map<string, HeldReservation>();
  readonly calls: Array<{ functionName: string; args: Record<string, unknown> }> = [];
  commitMutations = 0;
  refundMutations = 0;

  constructor(passCredits = 0) {
    this.passCredits = passCredits;
  }

  rpc(functionName: string, args: Record<string, unknown>) {
    const operation = this.queue.then(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1));
      this.calls.push({ functionName, args });

      const reservationId = String(args.p_reservation_id || "");
      const userId = String(args.p_user_id || "");
      const existing = this.reservations.get(reservationId);

      if (functionName === "reserve_generation_access") {
        if (existing) {
          return {
            data: {
              allowed: existing.status === "reserved",
              reservation_id: existing.id,
              status: existing.status,
              access_tier: existing.kind === "free" ? "free_full" : "pass_full",
              entitlement_kind: existing.kind,
              free_uses_remaining: this.freeUsed ? 0 : 1,
              pass: existing.kind === "pass_credit"
                ? { id: "pass-1", tier: "single_use", expires_at: "2099-01-01T00:00:00.000Z", uses_remaining: this.passCredits }
                : null,
            },
            error: null,
          };
        }

        const activePassHolds = Array.from(this.reservations.values()).filter(
          (reservation) => reservation.kind === "pass_credit" && reservation.status === "reserved"
        ).length;

        if (this.passCredits > activePassHolds) {
          this.reservations.set(reservationId, { id: reservationId, userId, kind: "pass_credit", status: "reserved" });
          return {
            data: {
              allowed: true,
              reservation_id: reservationId,
              status: "reserved",
              access_tier: "pass_full",
              entitlement_kind: "pass_credit",
              free_uses_remaining: this.freeUsed ? 0 : 1,
              pass: { id: "pass-1", tier: "single_use", expires_at: "2099-01-01T00:00:00.000Z", uses_remaining: this.passCredits },
            },
            error: null,
          };
        }

        const activeFreeHold = Array.from(this.reservations.values()).some(
          (reservation) => reservation.kind === "free" && reservation.status === "reserved"
        );
        if (!this.freeUsed && !activeFreeHold) {
          this.reservations.set(reservationId, { id: reservationId, userId, kind: "free", status: "reserved" });
          return {
            data: {
              allowed: true,
              reservation_id: reservationId,
              status: "reserved",
              access_tier: "free_full",
              entitlement_kind: "free",
              free_uses_remaining: 0,
              pass: null,
            },
            error: null,
          };
        }

        return {
          data: {
            allowed: false,
            reservation_id: null,
            status: "denied",
            access_tier: "preview",
            entitlement_kind: null,
            free_uses_remaining: 0,
            pass: null,
          },
          error: null,
        };
      }

      if (!existing || existing.userId !== userId) {
        return { data: { ok: false, status: "missing" }, error: null };
      }

      if (functionName === "commit_generation_access") {
        if (existing.status === "committed") {
          return { data: { ok: true, status: "committed" }, error: null };
        }
        if (existing.status !== "reserved") {
          return { data: { ok: false, status: existing.status }, error: null };
        }

        if (existing.kind === "pass_credit") this.passCredits -= 1;
        else this.freeUsed = true;
        existing.status = "committed";
        this.commitMutations += 1;
        return { data: { ok: true, status: "committed" }, error: null };
      }

      if (functionName === "release_generation_access") {
        if (existing.status === "released" || existing.status === "refunded") {
          return { data: { ok: true, status: existing.status }, error: null };
        }
        if (existing.status === "reserved") {
          existing.status = "released";
          return { data: { ok: true, status: "released" }, error: null };
        }

        if (existing.kind === "pass_credit") this.passCredits += 1;
        else this.freeUsed = false;
        existing.status = "refunded";
        this.refundMutations += 1;
        return { data: { ok: true, status: "refunded" }, error: null };
      }

      return { data: null, error: { code: "UNKNOWN_RPC" } };
    });

    this.queue = operation.then(() => undefined, () => undefined);
    return operation;
  }
}

const freeMeta: ParsedFreeMeta = {
  used: 0,
  last_free_ts: null,
  reset_month: "2099-01",
  needs_reset: false,
};

async function run() {
const uuidValues = [
  "11111111-1111-4111-8111-111111111111",
  "22222222-2222-4222-8222-222222222222",
  "33333333-3333-4333-8333-333333333333",
  "44444444-4444-4444-8444-444444444444",
];
let uuidIndex = 0;
const nextUuid = () => uuidValues[uuidIndex++];

// Two simultaneous authenticated first-free requests produce one hold.
const freeRpc = new AtomicFakeRpc();
const [freeA, freeB] = await Promise.all([
  reserveGenerationAccess({ userId: "user-1", admin: freeRpc, reportKind: "resume_feedback", bypass: false, freeMeta, randomUUID: nextUuid }),
  reserveGenerationAccess({ userId: "user-1", admin: freeRpc, reportKind: "resume_feedback", bypass: false, freeMeta, randomUUID: nextUuid }),
]);
assert.deepEqual([freeA.access, freeB.access].sort(), ["full", "preview"]);
const heldFree = [freeA, freeB].find((reservation) => reservation.access === "full")!;
await releaseGenerationAccess(heldFree, freeRpc, "provider_error");
await releaseGenerationAccess(heldFree, freeRpc, "provider_error");
assert.equal(freeRpc.commitMutations, 0);
assert.equal(freeRpc.refundMutations, 0);

// A one-credit pass also produces one pass hold under concurrency; the second
// request may still use the separate free entitlement, never the same credit.
const passRpc = new AtomicFakeRpc(1);
const [passA, passB] = await Promise.all([
  reserveGenerationAccess({ userId: "user-2", admin: passRpc, reportKind: "resume_feedback", bypass: false, freeMeta, randomUUID: nextUuid }),
  reserveGenerationAccess({ userId: "user-2", admin: passRpc, reportKind: "resume_feedback", bypass: false, freeMeta, randomUUID: nextUuid }),
]);
assert.equal([passA, passB].filter((reservation) => reservation.entitlementKind === "pass_credit").length, 1);
assert.equal([passA, passB].filter((reservation) => reservation.entitlementKind === "free").length, 1);

// Commit and cleanup retries mutate the entitlement exactly once.
const passReservation = [passA, passB].find((reservation) => reservation.entitlementKind === "pass_credit")!;
await commitGenerationAccess(passReservation, passRpc);
await commitGenerationAccess(passReservation, passRpc);
assert.equal(passRpc.commitMutations, 1);
await releaseGenerationAccess(passReservation, passRpc, "delivery_error");
await releaseGenerationAccess(passReservation, passRpc, "delivery_error");
assert.equal(passRpc.refundMutations, 1);

// Reservation keys are internal UUIDs, not request headers or user content.
const reserveCall = passRpc.calls.find((call) => call.functionName === "reserve_generation_access")!;
assert.match(String(reserveCall.args.p_reservation_id), /^[0-9a-f-]{36}$/i);
assert.equal("request_id" in reserveCall.args, false);
assert.equal("email" in reserveCall.args, false);

// Real-provider execution fails closed when either hosted dependency is absent.
assert.throws(
  () => assertGenerationAccessDependencies({ authClientAvailable: false, adminClientAvailable: false, mockProvider: false }),
  (error: unknown) => error instanceof GenerationAccessError && error.code === "ACCESS_DEPENDENCY_UNAVAILABLE"
);
assert.doesNotThrow(() =>
  assertGenerationAccessDependencies({ authClientAvailable: false, adminClientAvailable: false, mockProvider: true })
);
assert.doesNotThrow(() => assertGenerationAuthLookup({ name: "AuthSessionMissingError" }));
assert.throws(
  () => assertGenerationAuthLookup({ name: "AuthRetryableFetchError", code: "network_error" }),
  (error: unknown) => error instanceof GenerationAccessError && error.code === "ACCESS_DEPENDENCY_UNAVAILABLE"
);
await assert.rejects(
  () => reserveGenerationAccess({ userId: "user-3", admin: null, reportKind: "resume_feedback", bypass: false, freeMeta }),
  (error: unknown) => error instanceof GenerationAccessError && error.code === "ACCESS_DEPENDENCY_UNAVAILABLE"
);

// Anonymous reservation data is signed and parseable before a stream begins.
process.env.SESSION_SECRET = process.env.SESSION_SECRET || "generation-access-test-secret";
const anonymous = await reserveGenerationAccess({
  userId: null,
  admin: null,
  reportKind: "resume_feedback",
  bypass: false,
  freeMeta,
  anonymousIdentityHash: "a".repeat(64),
  now: () => new Date("2099-01-02T03:04:05.000Z"),
  randomUUID: () => "55555555-5555-4555-8555-555555555555",
});
assert.equal(anonymous.accessTier, "free_full");
assert.equal(anonymous.anonymousCookieMeta?.used, 1);
const signedCookie = makeFreeCookie(anonymous.anonymousCookieMeta!);
assert.equal(parseFreeCookie(signedCookie)?.used, 1);

// The shared ledger, rather than the client cookie, is authoritative. A
// successful direct API request consumes the anonymous allowance even when a
// caller clears the response cookie or replays an earlier unused cookie.
await commitGenerationAccess(anonymous, null);
const clearedCookieReplay = await reserveGenerationAccess({
  userId: null,
  admin: null,
  reportKind: "resume_feedback",
  bypass: false,
  freeMeta,
  anonymousIdentityHash: "a".repeat(64),
  randomUUID: () => "66666666-6666-4666-8666-666666666666",
});
assert.equal(clearedCookieReplay.access, "preview");

const staleUnusedCookieReplay = await reserveGenerationAccess({
  userId: null,
  admin: null,
  reportKind: "resume_ideas",
  bypass: false,
  freeMeta: parseFreeCookie(makeFreeCookie(freeMeta))!,
  anonymousIdentityHash: "a".repeat(64),
  randomUUID: () => "77777777-7777-4777-8777-777777777777",
});
assert.equal(staleUnusedCookieReplay.access, "preview");

// A pre-provider failure releases the hold so the legitimate first report can
// be retried, while simultaneous direct requests cannot both reach the provider.
const retryIdentity = "b".repeat(64);
const [anonymousA, anonymousB] = await Promise.all([
  reserveGenerationAccess({
    userId: null,
    admin: null,
    reportKind: "resume_feedback",
    bypass: false,
    freeMeta,
    anonymousIdentityHash: retryIdentity,
    randomUUID: () => "88888888-8888-4888-8888-888888888888",
  }),
  reserveGenerationAccess({
    userId: null,
    admin: null,
    reportKind: "resume_feedback",
    bypass: false,
    freeMeta,
    anonymousIdentityHash: retryIdentity,
    randomUUID: () => "99999999-9999-4999-8999-999999999999",
  }),
]);
assert.deepEqual([anonymousA.access, anonymousB.access].sort(), ["full", "preview"]);
const heldAnonymous = [anonymousA, anonymousB].find((item) => item.access === "full")!;
await releaseGenerationAccess(heldAnonymous, null, "internal_error");
const legitimateRetry = await reserveGenerationAccess({
  userId: null,
  admin: null,
  reportKind: "resume_feedback",
  bypass: false,
  freeMeta,
  anonymousIdentityHash: retryIdentity,
  randomUUID: () => "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
});
assert.equal(legitimateRetry.access, "full");
await markGenerationProviderCallStarted(legitimateRetry);
await releaseGenerationAccess(legitimateRetry, null, "client_disconnect");
const disconnectedReplay = await reserveGenerationAccess({
  userId: null,
  admin: null,
  reportKind: "resume_feedback",
  bypass: false,
  freeMeta,
  anonymousIdentityHash: retryIdentity,
  randomUUID: () => "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
});
assert.equal(
  disconnectedReplay.access,
  "preview",
  "disconnecting after provider work starts must not refund anonymous access"
);

// Hosted anonymous generation fails closed when the shared ledger is absent.
const originalNodeEnv = process.env.NODE_ENV;
try {
  (process.env as Record<string, string | undefined>).NODE_ENV = "production";
  await assert.rejects(
    () => reserveGenerationAccess({
      userId: null,
      admin: null,
      reportKind: "resume_feedback",
      bypass: false,
      freeMeta,
      anonymousIdentityHash: "c".repeat(64),
    }),
    (error: unknown) =>
      error instanceof GenerationAccessError
      && error.code === "ACCESS_DEPENDENCY_UNAVAILABLE"
  );
} finally {
  if (originalNodeEnv === undefined) delete (process.env as Record<string, string | undefined>).NODE_ENV;
  else (process.env as Record<string, string | undefined>).NODE_ENV = originalNodeEnv;
}

const explicitFallback = "RIYP_ALLOW_TEST_ANONYMOUS_ACCESS_FALLBACK";
assert.equal(
  allowsExplicitLocalAnonymousAccessFallback({
    [explicitFallback]: "true",
  }),
  false,
  "the explicit flag alone must not enable a production fallback"
);
assert.equal(
  allowsExplicitLocalAnonymousAccessFallback({
    [explicitFallback]: "true",
    NEXT_PUBLIC_APP_URL: "http://127.0.0.1:3000",
  }),
  false,
  "a loopback app URL without the mock provider must remain fail closed"
);
assert.equal(
  allowsExplicitLocalAnonymousAccessFallback({
    [explicitFallback]: "true",
    USE_MOCK_OPENAI: "1",
    NEXT_PUBLIC_APP_URL: "https://recruiterinyourpocket.com",
  }),
  false,
  "the test fallback must not activate for a non-loopback application URL"
);
assert.equal(
  allowsExplicitLocalAnonymousAccessFallback({
    [explicitFallback]: "true",
    USE_MOCK_OPENAI: "1",
    NEXT_PUBLIC_APP_URL: "http://localhost:3000",
  }),
  true,
  "the local test fallback requires the explicit flag, mock provider, and loopback URL together"
);

const migration = readFileSync(
  path.join(process.cwd(), "database", "migrations", "012_generation_access_reservations.sql"),
  "utf8"
);
assert.match(migration, /CREATE TABLE IF NOT EXISTS private\.generation_access_reservations/i);
assert.match(migration, /ENABLE ROW LEVEL SECURITY/i);
assert.match(migration, /passes_uses_remaining_nonnegative/i);
assert.match(migration, /FOR UPDATE/g);
assert.match(migration, /SECURITY INVOKER/g);
assert.match(migration, /SET search_path = ''/g);
assert.match(migration, /REVOKE ALL ON FUNCTION public\.reserve_generation_access[\s\S]+FROM PUBLIC, anon, authenticated/i);
assert.match(migration, /GRANT EXECUTE ON FUNCTION public\.reserve_generation_access[\s\S]+TO service_role/i);
assert.match(migration, /status = 'committed'[\s\S]+uses_remaining = uses_remaining \+ 1/i);
const ledgerDefinition = migration.match(/CREATE TABLE IF NOT EXISTS private\.generation_access_reservations \(([\s\S]+?)\n\);/)?.[1] || "";
assert.doesNotMatch(ledgerDefinition, /email|request_id|ip_address|resume_text|job_description/i);

const feedbackRoute = readFileSync(path.join(process.cwd(), "app", "api", "resume-feedback", "route.ts"), "utf8");
const streamRoute = readFileSync(path.join(process.cwd(), "app", "api", "resume-feedback-stream", "route.ts"), "utf8");
const streamFailure = readFileSync(path.join(process.cwd(), "lib", "billing", "generation-stream-failure.ts"), "utf8");
const ideasRoute = readFileSync(path.join(process.cwd(), "app", "api", "resume-ideas", "route.ts"), "utf8");
const linkedInRoute = readFileSync(path.join(process.cwd(), "app", "api", "linkedin-feedback-stream", "route.ts"), "utf8");
const resumeReviewHook = readFileSync(path.join(process.cwd(), "components", "workspace", "hooks", "useResumeReview.ts"), "utf8");
const launchProgram = readFileSync(path.join(process.cwd(), "lib", "launch", "program.ts"), "utf8");

for (const source of [feedbackRoute, streamRoute, ideasRoute]) {
  assert.match(source, /reserveGenerationAccess/);
  assert.match(source, /commitGenerationAccess/);
  assert.match(source, /settleGenerationFailure|releaseGenerationAccess/);
  const providerCallIndex = source.includes("for await (const ev of streamJson")
    ? source.indexOf("for await (const ev of streamJson")
    : source.indexOf("await runJson<any>");
  assert.ok(source.indexOf("reserveGenerationAccess({") < providerCallIndex);
  assert.doesNotMatch(source, /\.from\(["']passes["']\)/);
  assert.doesNotMatch(source, /\.from\(["']user_usage["']\)/);
  assert.match(
    source,
    /anonymousIdentityHash:\s*hashForLogs\(ip\)/,
    "direct anonymous API calls must bind the free entitlement to server-side shared state"
  );
  assert.ok(
    source.indexOf("markGenerationProviderCallStarted(") < providerCallIndex,
    "anonymous access must be consumed before provider work begins"
  );
}

assert.ok(streamRoute.indexOf("reserveGenerationAccess({") < streamRoute.indexOf("new ReadableStream"));
assert.match(streamRoute, /response\.cookies\.set\(/);
assert.doesNotMatch(streamRoute, /cookieStore\.set\(/);
const streamLoopIndex = streamRoute.indexOf("for await (const ev of streamJson");
const streamValidationIndex = streamRoute.indexOf("payload = validateResumeModelPayload");
const streamCommitIndex = streamRoute.indexOf("const completion = await finalizeGenerationCompletion");
assert.ok(streamLoopIndex > -1 && streamValidationIndex > streamLoopIndex);
assert.ok(streamCommitIndex > streamValidationIndex);
assert.match(streamRoute, /commit:\s*\(\) => commitGenerationAccess/);
assert.ok(
  streamRoute.indexOf('type: "complete"') > streamCommitIndex,
  "the authoritative complete event must not be delivered before validation and entitlement commit"
);
assert.doesNotMatch(streamRoute, /validatedChunks|type:\s*"chunk"/);
assert.match(streamRoute, /settleGenerationFailure\(\{[\s\S]+attemptConsumed:\s*reservationCommitted/);
for (const source of [feedbackRoute, streamRoute]) {
  const providerStarted = source.indexOf("await markGenerationProviderCallStarted");
  const anonymousCommitted = source.indexOf('entitlementKind === "anonymous_free"', providerStarted);
  assert.ok(
    providerStarted >= 0 && anonymousCommitted > providerStarted,
    "anonymous post-provider failures must be marked consumed before validation or delivery",
  );
}
assert.match(feedbackRoute, /attempt_consumed:\s*disposition\.attemptConsumed/);
assert.match(streamFailure, /attempt_consumed:\s*disposition\.attemptConsumed/);
assert.match(streamFailure, /The report could not be completed\./);
assert.doesNotMatch(streamFailure, /Something went wrong/);
assert.match(streamRoute, /signal:\s*generationController\.signal/g);
assert.match(streamRoute, /if \(isStableOpenAITransportError\(repairErr\)\) throw repairErr/);
assert.match(streamRoute, /generationController\.signal\.aborted && shouldSynthesizeGenerationCancellation\(err\)/);
assert.match(streamRoute, /rollback:\s*user && reportAdmin/);
assert.equal(releaseReasonForError({ code: "CLIENT_CANCELED" }), "client_disconnect");
assert.equal(releaseReasonForError({ code: "OPENAI_TIMEOUT" }), "provider_timeout");
assert.doesNotMatch(
  streamRoute,
  /new Error\("The report did not pass its evidence check\. Your report credit was restored/,
  "post-provider validation errors must not claim an anonymous attempt was restored",
);
assert.match(resumeReviewHook, /if \(result\.aborted\) \{\s*const refreshed = await input\.refreshFreeStatus/);
assert.match(resumeReviewHook, /catch \(error\) \{[\s\S]+await input\.refreshFreeStatus/);
assert.doesNotMatch(linkedInRoute, /reserveGenerationAccess/);
const linkedInFlagIndex = linkedInRoute.indexOf('isLaunchFlagEnabled("linkedInReview")');
assert.ok(linkedInFlagIndex > -1, "LinkedIn generation must enforce its launch flag server-side");
assert.ok(
  linkedInFlagIndex < linkedInRoute.indexOf("body = await readJsonWithLimit"),
  "disabled LinkedIn requests must be rejected before request parsing"
);
assert.ok(
  linkedInFlagIndex < linkedInRoute.indexOf("for await (const ev of streamJson"),
  "disabled LinkedIn requests must be rejected before provider work"
);
assert.match(linkedInRoute, /errorCode:\s*"FEATURE_DISABLED"/);
assert.match(launchProgram, /LinkedIn review[\s\S]+Blocked from enablement until its generation route uses the atomic access-reservation lifecycle/);

console.log("generation-access tests passed");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
