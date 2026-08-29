import assert from "node:assert/strict";
import {
  appendFailureDisposition,
  generationFailureCompletion,
  settleGenerationFailure,
} from "../lib/billing/generationFailure";
import type { GenerationAccessReservation } from "../lib/billing/generationAccess";

const anonymousReservation: GenerationAccessReservation = {
  access: "full",
  accessTier: "free_full",
  entitlementKind: "anonymous_free",
  reservationId: "11111111-1111-4111-8111-111111111111",
  userId: null,
  activePass: null,
  freeUsesRemaining: 0,
  anonymousCookieMeta: {
    used: 1,
    last_free_ts: "2026-08-02T00:00:00.000Z",
    reset_month: "2026-08",
  },
  anonymousIdentityHash: "a".repeat(64),
  anonymousMonthKey: "2026-08",
};

async function run() {
  let releases = 0;
  const restored = await settleGenerationFailure({
    reservation: anonymousReservation,
    admin: null,
    error: new Error("Prompt load failed"),
    attemptConsumed: false,
    release: async () => { releases += 1; },
  });
  assert.equal(releases, 1);
  assert.equal(restored.creditRestored, true);
  assert.equal(restored.attemptConsumed, false);
  assert.equal(restored.anonymousCookieMeta?.used, 0);
  assert.match(restored.retryMessage, /credit was restored/i);

  const releaseFailed = await settleGenerationFailure({
    reservation: anonymousReservation,
    admin: null,
    error: new Error("Prompt load failed"),
    attemptConsumed: false,
    release: async () => { throw new Error("ledger unavailable"); },
  });
  assert.equal(releaseFailed.creditRestored, false);
  assert.equal(releaseFailed.attemptConsumed, undefined);
  assert.equal(releaseFailed.attemptDisposition, "unknown");
  assert.equal(releaseFailed.anonymousCookieMeta?.used, 1);
  assert.doesNotMatch(releaseFailed.retryMessage, /^Your report credit was restored/iu);
  assert.match(releaseFailed.retryMessage, /Check History and your remaining reports/i);

  const consumed = await settleGenerationFailure({
    reservation: anonymousReservation,
    admin: null,
    error: new Error("Provider response failed"),
    attemptConsumed: true,
    release: async () => { throw new Error("must not release"); },
  });
  assert.equal(consumed.attemptConsumed, true);
  assert.equal(consumed.creditRestored, false);
  assert.equal(releases, 1, "post-consumption failure must not release the attempt");
  const copy = appendFailureDisposition("Provider response failed. Your report credit was restored; please try again.", consumed);
  assert.equal((copy.match(/report attempt was used/giu) || []).length, 1);
  assert.equal((copy.match(/credit was restored/giu) || []).length, 0, "stale restoration copy must be replaced, not duplicated");

  assert.deepEqual(
    generationFailureCompletion({ code: "OPENAI_TIMEOUT", httpStatus: 504 }),
    { status: 504, outcome: "timeout" },
  );
  assert.deepEqual(
    generationFailureCompletion({ code: "OPENAI_NETWORK_ERROR", httpStatus: 502 }),
    { status: 502, outcome: "network_error" },
  );

  const refundedFinality = await settleGenerationFailure({
    reservation: anonymousReservation,
    admin: null,
    error: new Error("Persistence failed after commit"),
    attemptConsumed: false,
    release: async () => ({ state: "refunded", accessConsumed: false }),
  });
  assert.equal(refundedFinality.attemptDisposition, "restored");

  const consumedFinality = await settleGenerationFailure({
    reservation: anonymousReservation,
    admin: null,
    error: new Error("Commit finality was ambiguous"),
    attemptConsumed: false,
    release: async () => ({ state: "committed", accessConsumed: true }),
  });
  assert.equal(consumedFinality.attemptDisposition, "consumed");

  const unknownFinality = await settleGenerationFailure({
    reservation: anonymousReservation,
    admin: null,
    error: new Error("Release finality unavailable"),
    attemptConsumed: false,
    release: async () => ({ state: "unknown", accessConsumed: null }),
  });
  assert.equal(unknownFinality.attemptDisposition, "unknown");
}

run().then(() => console.log("generation failure tests passed")).catch((error) => {
  console.error(error);
  process.exit(1);
});
