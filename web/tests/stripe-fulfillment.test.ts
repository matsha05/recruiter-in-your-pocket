import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  getLaunchStripeOffer,
  isUnrelatedStripeCheckout,
  validateStripeCheckoutSession,
} from "../lib/billing/stripeOffers";
import {
  claimStripeEvent,
  completeStripeEvent,
  type StripeEventRpcClient,
} from "../lib/billing/stripeEventLease";
import {
  getTierDefaultsForCheckout,
  isCheckoutPaymentSettled,
} from "../lib/billing/checkoutFulfillment";
import { isPassActive } from "../lib/billing/entitlements";

const offerEnv = {
  STRIPE_PRICE_ID_30D: "price_job_search_pass",
  STRIPE_PRODUCT_ID_30D: "prod_job_search_pass",
};

function checkoutSession(overrides: Record<string, unknown> = {}) {
  return {
    mode: "payment",
    metadata: { tier: "30d", pass_tier: "30d" },
    line_items: {
      data: [
        {
          quantity: 1,
          price: {
            id: "price_job_search_pass",
            product: "prod_job_search_pass",
            currency: "usd",
            unit_amount: 2_900,
          },
        },
      ],
      has_more: false,
    },
    ...overrides,
  } as any;
}

const approved = validateStripeCheckoutSession(checkoutSession(), offerEnv);
assert.equal(approved.ok, true, "the exact $29 price/product pair is approved");
assert.equal(approved.ok && approved.offer.tier, "30d", "price data, not metadata fallback, selects the tier");
assert.equal(getLaunchStripeOffer(offerEnv)?.expectedUnitAmount, 2_900);

assert.equal(isCheckoutPaymentSettled("paid"), true);
assert.equal(isCheckoutPaymentSettled("no_payment_required"), true);
assert.equal(isCheckoutPaymentSettled("unpaid"), false);
const purchaseCreated = Date.parse("2026-04-01T12:00:00.000Z") / 1000;
const anchoredPass = getTierDefaultsForCheckout("30d", { created: purchaseCreated } as any);
assert.equal(anchoredPass.purchasedAt, "2026-04-01T12:00:00.000Z");
assert.equal(anchoredPass.expiresAt, "2026-05-01T12:00:00.000Z");
assert.equal(anchoredPass.usesRemaining, 5);
assert.equal(
  isPassActive({ tier: "30d", uses_remaining: 5, expires_at: "2099-01-01T00:00:00.000Z", revoked_at: "2026-04-02T00:00:00.000Z" }),
  false,
  "a reversal remains inactive even when credits and expiry look active",
);

const unknownPrice = validateStripeCheckoutSession(
  checkoutSession({
    line_items: {
      data: [{
        quantity: 1,
        price: {
          id: "price_unrelated_product",
          product: "prod_unrelated_product",
          currency: "usd",
          unit_amount: 2_900,
        },
      }],
      has_more: false,
    },
  }),
  offerEnv
);
assert.deepEqual(unknownPrice, { ok: false, reason: "unknown_price" });
assert.equal(isUnrelatedStripeCheckout(unknownPrice), true, "unrelated Stripe purchases are terminally rejected");

assert.deepEqual(
  validateStripeCheckoutSession(
    checkoutSession({
      line_items: {
        data: [{
          quantity: 1,
          price: {
            id: "price_job_search_pass",
            product: "prod_wrong",
            currency: "usd",
            unit_amount: 2_900,
          },
        }],
        has_more: false,
      },
    }),
    offerEnv
  ),
  { ok: false, reason: "product_mismatch" },
  "a canonical price paired to the wrong product fails closed"
);

assert.deepEqual(
  validateStripeCheckoutSession(checkoutSession({ metadata: { tier: "lifetime" } }), offerEnv),
  { ok: false, reason: "metadata_mismatch" },
  "legacy metadata cannot upgrade a canonical Job Search Pass"
);

assert.deepEqual(
  validateStripeCheckoutSession(checkoutSession(), {
    STRIPE_PRICE_ID_30D: "price_job_search_pass",
  }),
  { ok: false, reason: "catalog_not_configured" },
  "a price without its canonical product id is not fulfillable"
);

type FakeLeaseRow = {
  status: "processing" | "completed" | "failed" | "rejected";
  leaseToken: string | null;
};

class AtomicFakeLeaseAdmin implements StripeEventRpcClient {
  private row: FakeLeaseRow | null = null;

  async rpc(functionName: string, args: Record<string, unknown>) {
    // Let concurrent callers reach the same database boundary. The mutation
    // below is synchronous, matching the single-row lock in migration 014.
    await new Promise<void>((resolve) => setImmediate(resolve));

    if (functionName === "claim_stripe_event") {
      if (!this.row) {
        this.row = { status: "processing", leaseToken: String(args.p_lease_token) };
        return { data: { claimed: true, reason: "new" }, error: null };
      }
      if (this.row.status === "completed" || this.row.status === "rejected") {
        return { data: { claimed: false, reason: this.row.status }, error: null };
      }
      if (this.row.status === "processing") {
        return { data: { claimed: false, reason: "leased" }, error: null };
      }
      this.row = { status: "processing", leaseToken: String(args.p_lease_token) };
      return { data: { claimed: true, reason: "retry" }, error: null };
    }

    if (functionName === "complete_stripe_event") {
      const ownsLease = this.row?.status === "processing"
        && this.row.leaseToken === args.p_lease_token;
      if (ownsLease) this.row = { status: "completed", leaseToken: null };
      return { data: ownsLease, error: null };
    }

    return { data: false, error: null };
  }
}

async function assertAtomicLeaseBehavior() {
  const leaseAdmin = new AtomicFakeLeaseAdmin();
  const claimInput = {
    eventId: "evt_duplicate",
    eventType: "checkout.session.completed",
    payload: { object_id: "cs_test" },
    requestId: "req_test",
  };
  const concurrentClaims = await Promise.all([
    claimStripeEvent(leaseAdmin, claimInput),
    claimStripeEvent(leaseAdmin, claimInput),
  ]);
  assert.equal(
    concurrentClaims.filter((claim) => claim.claimed).length,
    1,
    "only one concurrent webhook delivery owns the fulfillment lease"
  );
  assert.equal(
    concurrentClaims.filter((claim) => claim.reason === "leased").length,
    1,
    "the duplicate delivery is acknowledged without running fulfillment"
  );

  const owner = concurrentClaims.find((claim) => claim.claimed)!;
  await completeStripeEvent(leaseAdmin, claimInput.eventId, owner.leaseToken!);
  const afterCompletion = await claimStripeEvent(leaseAdmin, claimInput);
  assert.deepEqual(
    { claimed: afterCompletion.claimed, reason: afterCompletion.reason },
    { claimed: false, reason: "completed" },
    "a completed event cannot be reclaimed"
  );
}

const migration014 = fs.readFileSync(
  path.join(process.cwd(), "database", "migrations", "014_atomic_stripe_event_leases.sql"),
  "utf8"
);
assert.match(migration014, /ON CONFLICT \(event_id\) DO NOTHING/i);
assert.match(migration014, /FOR UPDATE/i);
assert.match(migration014, /lease_token = p_lease_token/i);
assert.match(migration014, /TO service_role/i);
assert.doesNotMatch(
  migration014,
  /GRANT EXECUTE[\s\S]+TO (?:PUBLIC|anon|authenticated)/i,
  "browser roles cannot invoke billing lease RPCs"
);

const migration013 = fs.readFileSync(
  path.join(process.cwd(), "database", "migrations", "013_database_advisor_hardening.sql"),
  "utf8"
);
assert.match(
  migration013,
  /to_regprocedure\('public\.rls_auto_enable\(\)'\) IS NOT NULL/i,
  "migration 013 tolerates the helper being absent on a clean replay"
);

const fulfillmentRouteSources = [
  "app/api/billing/confirm/route.ts",
  "app/api/billing/restore/route.ts",
  "app/api/stripe/webhook/route.ts",
].map((relativePath) => fs.readFileSync(path.join(process.cwd(), relativePath), "utf8"));
for (const source of fulfillmentRouteSources) {
  assert.match(source, /validateStripeCheckoutSession/);
  assert.doesNotMatch(
    source,
    /resolveRequestedTierFromSession/,
    "fulfillment routes must derive access from the approved price/product pair"
  );
}
assert.match(fulfillmentRouteSources[2], /claimStripeEvent/);
assert.match(fulfillmentRouteSources[2], /completeStripeEvent/);
assert.match(fulfillmentRouteSources[0], /billing_entitlement_blocks/);
assert.match(fulfillmentRouteSources[0], /status: "reversed"/);
assert.match(fulfillmentRouteSources[0], /This purchase is no longer eligible for access/);
assert.match(fulfillmentRouteSources[1], /billing_entitlement_blocks/);
assert.match(fulfillmentRouteSources[2], /billing_entitlement_blocks/);
assert.match(fulfillmentRouteSources[2], /EntitlementBlockedError/);
assert.match(fulfillmentRouteSources[2], /rejectStripeEvent/);
assert.match(fulfillmentRouteSources[2], /entitlement_blocked:/);
assert.match(fulfillmentRouteSources[1], /getTierDefaultsForCheckout/);
assert.match(fulfillmentRouteSources[2], /getTierDefaultsForCheckout/);

const migration016 = fs.readFileSync(
  path.join(process.cwd(), "database", "migrations", "016_billing_reversals_and_deletion_safety.sql"),
  "utf8",
);
assert.match(migration016, /CREATE TABLE IF NOT EXISTS public\.billing_entitlement_blocks/i);
assert.match(migration016, /CHECK \(reason IN \('account_deleted', 'refund', 'dispute'\)\)/i);
assert.match(migration016, /REVOKE ALL ON TABLE public\.billing_entitlement_blocks FROM PUBLIC, anon, authenticated/i);
assert.match(migration016, /delete_generation_access_reservations_for_user/i);

assertAtomicLeaseBehavior()
  .then(() => console.log("Stripe fulfillment behavior contracts passed"))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
