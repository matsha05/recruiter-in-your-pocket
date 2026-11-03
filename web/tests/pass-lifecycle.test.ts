import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  buildCheckoutPassInput,
  fulfillCheckoutPass,
  parseCheckoutPassGrant,
  parseReversalResult,
  PassLifecycleError,
  revokeCheckoutEntitlements,
} from "../lib/billing/passLifecycle";
import {
  buildConfirmResponse,
  getInitialUnlockState,
  isPendingConfirmResponse,
  nextConfirmDelayMs,
  transitionUnlockState,
} from "../lib/billing/unlockStateMachine";
import { confirmStepFor } from "../lib/observability/launchSignals";

const offer = { tier: "30d", mode: "payment", priceId: "price_pass", productId: "prod_pass" } as const;
const createdUnix = Date.parse("2026-04-01T12:00:00.000Z") / 1000;
const pass = {
  id: "pass_1", user_id: "user_1", tier: "30d", uses_remaining: 5,
  expires_at: "2026-06-30T12:00:00+00:00", revoked_at: null, revocation_reason: null,
  checkout_session_id: "cs_test_1", stripe_subscription_id: null,
};

async function run() {
  // The grant input is derived once, the same way, for every route.
  const oneTime = buildCheckoutPassInput(
    { id: "cs_test_1", created: createdUnix, customer: { id: "cus_1" } as any, payment_intent: "pi_1" },
    offer,
    "user_1",
  );
  assert.deepEqual(oneTime, {
    userId: "user_1", checkoutSessionId: "cs_test_1", tier: "30d", usesRemaining: 5,
    purchasedAt: "2026-04-01T12:00:00.000Z", expiresAt: "2026-06-30T12:00:00.000Z",
    priceId: "price_pass", stripeSubscriptionId: null, stripePaymentIntentId: "pi_1", stripeCustomerId: "cus_1",
  });
  const periodEnd = createdUnix + 30 * 86_400;
  const monthly = buildCheckoutPassInput(
    { id: "cs_test_2", created: createdUnix, customer: "cus_1", payment_intent: null },
    { ...offer, tier: "monthly", mode: "subscription", priceId: "price_monthly" },
    "user_1",
    { id: "sub_1", periodEndUnix: periodEnd },
  );
  assert.equal(monthly.tier, "monthly");
  assert.equal(monthly.stripeSubscriptionId, "sub_1");
  assert.equal(monthly.expiresAt, new Date(periodEnd * 1000).toISOString());
  assert.equal(monthly.stripePaymentIntentId, null);

  // The RPC's JSON is parsed strictly; anything unrecognized is an error, never a grant.
  for (const outcome of ["created", "existing", "renewed"] as const) {
    const grant = parseCheckoutPassGrant({ outcome, pass });
    if (grant.outcome === "blocked") throw new Error(`${outcome} parsed as blocked`);
    assert.equal(grant.outcome, outcome);
    assert.equal(grant.pass.expires_at, "2026-06-30T12:00:00.000Z", "timestamps normalize to ISO");
  }
  assert.deepEqual(parseCheckoutPassGrant([{ outcome: "blocked", reason: "dispute" }]), { outcome: "blocked", reason: "dispute" });
  assert.deepEqual(parseCheckoutPassGrant({ outcome: "blocked" }), { outcome: "blocked", reason: "reversed" });
  assert.throws(() => parseCheckoutPassGrant({ outcome: "created" }), PassLifecycleError, "a grant without a pass is not a grant");
  assert.throws(() => parseCheckoutPassGrant({ outcome: "granted", pass }), PassLifecycleError);
  assert.throws(() => parseCheckoutPassGrant(null), PassLifecycleError);
  assert.deepEqual(parseReversalResult({ blocked: 2, revoked: 1 }), { blocked: 2, revoked: 1 });
  assert.throws(() => parseReversalResult({ blocked: "2" }), PassLifecycleError);

  // The wrappers send exactly the RPC arguments and surface database errors with their code.
  const calls: Array<{ fn: string; args: Record<string, unknown> }> = [];
  let failWith: { message: string; code: string } | null = null;
  const admin = {
    async rpc(fn: string, args: Record<string, unknown>) {
      calls.push({ fn, args });
      if (failWith) return { data: null, error: failWith };
      return fn === "fulfill_checkout_pass"
        ? { data: { outcome: "created", pass }, error: null }
        : { data: { blocked: 1, revoked: 1 }, error: null };
    },
  };
  const granted = await fulfillCheckoutPass(admin, oneTime);
  assert.equal(granted.outcome, "created");
  assert.deepEqual(calls[0], {
    fn: "fulfill_checkout_pass",
    args: {
      p_user_id: "user_1", p_checkout_session_id: "cs_test_1", p_tier: "30d", p_uses_remaining: 5,
      p_purchased_at: "2026-04-01T12:00:00.000Z", p_expires_at: "2026-06-30T12:00:00.000Z",
      p_price_id: "price_pass", p_stripe_subscription_id: null, p_stripe_payment_intent_id: "pi_1", p_stripe_customer_id: "cus_1",
    },
  });
  const reversed = await revokeCheckoutEntitlements(admin, {
    checkoutSessionIds: ["cs_test_1", "cs_test_1", "pi_not_a_session", ""],
    stripePaymentIntentId: "pi_1",
    reason: "refund",
  });
  assert.deepEqual(reversed, { blocked: 1, revoked: 1 });
  assert.deepEqual(calls[1].args, {
    p_checkout_session_ids: ["cs_test_1"],
    p_stripe_payment_intent_id: "pi_1",
    p_stripe_subscription_id: null,
    p_reason: "refund",
  }, "only checkout session ids reach the reversal, deduplicated");
  failWith = { message: "pass_checkout_blocked: refund", code: "23514" };
  await assert.rejects(() => fulfillCheckoutPass(admin, oneTime), (error: PassLifecycleError) => {
    assert.equal(error.name, "PassLifecycleError");
    assert.equal(error.code, "23514");
    return true;
  });

  // The confirm projection: terminal states stop polling, rate limits carry a wait.
  const revokedResponse = buildConfirmResponse({ state: "access_revoked", status: "revoked" });
  assert.equal(revokedResponse.ok, false);
  assert.equal(revokedResponse.pending, false);
  assert.equal(isPendingConfirmResponse(revokedResponse), false);
  const expiredResponse = buildConfirmResponse({ state: "pass_expired", status: "expired" });
  assert.equal(expiredResponse.pending, false);
  const limited = buildConfirmResponse({ state: "rate_limited", retryAfterMs: 4_200.4 });
  assert.equal(limited.pending, true, "a rate limit is a reason to try again, not a failure");
  assert.equal(limited.retry_after_ms, 4200);
  assert.equal(isPendingConfirmResponse(limited), true);
  assert.equal(buildConfirmResponse({ state: "rate_limited", retryAfterMs: 0 }).retry_after_ms, undefined);
  assert.equal(nextConfirmDelayMs(limited, 0), 4200, "the client waits at least the server's retry window");
  assert.equal(nextConfirmDelayMs(buildConfirmResponse({ state: "fulfillment_pending" }), 2), 1800, "ordinary polling keeps its backoff");
  assert.equal(nextConfirmDelayMs(buildConfirmResponse({ state: "rate_limited", retryAfterMs: 600_000 }), 0), 30_000, "waits are capped");

  const checking = getInitialUnlockState("cs_test_1");
  const revokedUi = transitionUnlockState(checking, { type: "response", response: revokedResponse });
  assert.equal(revokedUi.status, "error");
  assert.equal(revokedUi.reason, "access_revoked");
  assert.match(revokedUi.message, /refunded or disputed/);
  const expiredUi = transitionUnlockState(checking, { type: "response", response: expiredResponse });
  assert.equal(expiredUi.status, "error");
  assert.equal(expiredUi.reason, "pass_expired");
  assert.match(expiredUi.message, /expired/);
  const limitedUi = transitionUnlockState(checking, { type: "response", response: limited });
  assert.equal(limitedUi.status, "pending");
  assert.equal(limitedUi.reason, "rate_limited");

  assert.equal(confirmStepFor(409, revokedResponse), "confirm_incomplete", "a reversal counts as an incomplete confirmation in the funnel");
  assert.equal(confirmStepFor(409, expiredResponse), "confirm_incomplete");
  assert.equal(confirmStepFor(429, limited), null, "rate limits are not counted");

  // Migration 025 holds the lifecycle rules where every writer meets.
  const migration = fs.readFileSync(
    path.join(process.cwd(), "database", "migrations", "025_pass_lifecycle.sql"),
    "utf8",
  );
  assert.match(migration, /CREATE TRIGGER passes_enforce_lifecycle\s+BEFORE INSERT OR UPDATE ON public\.passes/);
  assert.match(migration, /CREATE TRIGGER billing_entitlement_blocks_revoke_passes\s+AFTER INSERT OR UPDATE ON public\.billing_entitlement_blocks/);
  assert.match(migration, /pass_revocation_is_final/);
  assert.match(migration, /pass_checkout_blocked/);
  assert.match(migration, /CHECK \(revoked_at IS NULL OR \(uses_remaining = 0 AND expires_at <= revoked_at\)\)/);
  assert.match(migration, /pg_advisory_xact_lock/);
  for (const fn of ["fulfill_checkout_pass", "revoke_checkout_entitlements"]) {
    assert.match(migration, new RegExp(`CREATE OR REPLACE FUNCTION public\\.${fn}\\(`));
    assert.match(migration, new RegExp(`GRANT EXECUTE ON FUNCTION public\\.${fn}\\([\\s\\S]*?\\)\\s+TO service_role`));
    assert.match(migration, new RegExp(`REVOKE ALL ON FUNCTION public\\.${fn}\\([\\s\\S]*?\\)\\s+FROM PUBLIC, anon, authenticated`));
  }
  const manifest = fs.readFileSync(path.join(process.cwd(), "..", "scripts", "migrate.js"), "utf8");
  assert.match(manifest, /\["025_pass_lifecycle", "web\/database\/migrations\/025_pass_lifecycle\.sql"\]/);
  assert.match(manifest, /verifyPassLifecycle\(db\)/);

  console.log("Pass lifecycle tests passed");
}

run().catch((error) => { console.error(error); process.exitCode = 1; });
