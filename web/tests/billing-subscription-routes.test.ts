import assert from "node:assert/strict";
import Module from "node:module";
import path from "node:path";
import { NextRequest } from "next/server";
import { hasPdfExportAccess, isPassActive } from "../lib/billing/entitlements";

type RuntimeModule = typeof Module & {
  _load: (request: string, parent: NodeModule | null, isMain: boolean) => unknown;
};

async function run() {
  const testEnv = {
    STRIPE_PRICE_ID_30D: "price_pass",
    STRIPE_PRODUCT_ID_30D: "prod_pass",
    STRIPE_PRICE_ID_MONTHLY: "price_monthly",
    STRIPE_PRODUCT_ID_MONTHLY: "prod_monthly",
    STRIPE_WEBHOOK_SECRET: "whsec_subscription_test",
  };
  const originalEnv = Object.fromEntries(Object.keys(testEnv).map((key) => [key, process.env[key]]));
  Object.assign(process.env, testEnv);
  const runtimeModule = Module as RuntimeModule;
  const originalLoad = runtimeModule._load;
  const nowUnix = Math.floor(Date.now() / 1000);
  const periodEnd = nowUnix + 14 * 86_400;
  const expectedExpiry = new Date(periodEnd * 1000).toISOString();
  const user = { id: "user_monthly", email: "monthly@example.com" };
  const approvedItem = {
    id: "si_monthly",
    object: "subscription_item",
    price: { id: "price_monthly", product: "prod_monthly" },
    current_period_start: nowUnix - 16 * 86_400,
    current_period_end: periodEnd,
  };
  const modernSubscription = {
    id: "sub_monthly", object: "subscription", status: "active",
    items: { object: "list", has_more: false, data: [
      { ...approvedItem, id: "si_other", price: { id: "price_other", product: "prod_other" }, current_period_end: periodEnd + 365 * 86_400 },
      approvedItem,
    ] },
  };
  let subscription: any = modernSubscription;
  let lookupFails = false;
  let passes: any[] = [];
  let mutations = 0;
  let failedEvents = 0;
  let eventType = "customer.subscription.updated";
  let session: any;
  let beforePassUpdate: (() => void) | null = null;
  const monthlySession = {
    id: "cs_test_monthly1234", mode: "subscription", status: "complete", payment_status: "paid",
    subscription: "sub_monthly", created: nowUnix - 16 * 86_400, customer: "cus_monthly",
    metadata: { user_id: user.id, email: user.email, tier: "monthly" },
    line_items: { has_more: false, data: [{ quantity: 1, price: approvedItem.price }] },
  };
  const admin = {
    from(table: string) {
      let operation = "select";
      let values: any;
      const filters: Array<(row: any) => boolean> = [];
      const execute = () => {
        assert.ok(table === "passes" || table === "billing_entitlement_blocks", `unexpected table ${table}`);
        if (table === "passes" && operation === "update") beforePassUpdate?.();
        const rows = table === "passes" ? passes.filter((row) => filters.every((filter) => filter(row))) : [];
        if (operation === "insert") { mutations += 1; passes.push(values); }
        if (operation === "update") { mutations += 1; for (const row of rows) Object.assign(row, values); }
        return { data: rows, error: null };
      };
      const query: any = {
        select: () => query,
        eq: (key: string, value: unknown) => { filters.push((row) => row[key] === value); return query; },
        is: (key: string, value: null) => { filters.push((row) => (row[key] ?? null) === value); return query; },
        in: (key: string, values: unknown[]) => { filters.push((row) => values.includes(row[key])); return query; },
        limit: () => query,
        insert: (payload: unknown) => { operation = "insert"; values = payload; return query; },
        update: (payload: unknown) => { operation = "update"; values = payload; return query; },
        maybeSingle: async () => { const result = execute(); return { ...result, data: result.data[0] || null }; },
        then: (resolve: (value: unknown) => unknown, reject: (error: unknown) => unknown) => Promise.resolve().then(execute).then(resolve, reject),
      };
      return query;
    },
  };
  const stripe = {
    subscriptions: { retrieve: async () => { if (lookupFails) throw new Error("Stripe unavailable"); return subscription; } },
    customers: { list: async () => ({ data: [{ id: "cus_monthly" }] }), update: async () => ({}) },
    checkout: { sessions: { list: async () => ({ data: [session] }), retrieve: async () => session } },
    webhooks: { constructEvent: () => ({
      id: "evt_monthly", type: eventType,
      data: { object: eventType.startsWith("checkout.") ? session : subscription },
    }) },
  };
  runtimeModule._load = function loadBillingMocks(request, parent, isMain) {
    if (request === "@/lib/billing/stripeClient") return { createStripeClient: () => stripe };
    if (request === "@/lib/supabase/adminClient") return { createSupabaseAdminClient: () => admin };
    if (request === "@/lib/supabase/serverClient") return { createSupabaseServerClient: async () => ({ auth: { getUser: async () => ({ data: { user } }) } }) };
    if (request === "@/lib/launch/flags") return { isLaunchFlagEnabled: () => true };
    if (request === "@/lib/security/rateLimit") return { rateLimitAsync: async () => ({ ok: true }) };
    if (request === "@/lib/observability/logger") return { hashForLogs: () => "hash", logInfo() {}, logWarn() {}, logError() {} };
    if (request === "@/lib/observability/operations") return { captureOperationalError() {} };
    if (request === "@/lib/observability/requestContext") return { getRequestId: () => "request_test", routeLabel: () => ({ method: "POST", path: "/api/stripe/webhook" }) };
    if (request === "@/lib/auth/otpEmail") return { sendAuthOtpEmail: async () => { throw new Error("Unexpected email attempt"); } };
    if (request === "@/lib/billing/stripeEventLease") return {
      claimStripeEvent: async () => ({ claimed: true, leaseToken: "lease_test" }),
      completeStripeEvent: async () => {},
      failStripeEvent: async () => { failedEvents += 1; },
      rejectStripeEvent: async () => { throw new Error("Unexpected rejection"); },
    };
    if (request.startsWith("@/")) return originalLoad(path.join(process.cwd(), request.slice(2)), parent, isMain);
    return originalLoad(request, parent, isMain);
  };

  const reset = () => {
    session = structuredClone(monthlySession);
    subscription = structuredClone(modernSubscription);
    lookupFails = false;
    passes = [];
    mutations = 0;
    failedEvents = 0;
    eventType = "customer.subscription.updated";
    beforePassUpdate = null;
  };
  const existingPass = () => ({
    id: "pass_monthly", user_id: user.id, tier: "monthly", price_id: "price_monthly",
    stripe_subscription_id: "sub_monthly", expires_at: new Date((nowUnix + 86_400) * 1000).toISOString(), uses_remaining: 9_999,
  });

  try {
    const restore = require("../app/api/billing/restore/route").POST as () => Promise<Response>;
    const confirm = require("../app/api/billing/confirm/route").POST as (req: NextRequest) => Promise<Response>;
    const webhook = require("../app/api/stripe/webhook/route").POST as (req: NextRequest) => Promise<Response>;
    const confirmRequest = () => new NextRequest("http://localhost/api/billing/confirm", {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ sessionId: session.id }),
    });
    const webhookRequest = () => new NextRequest("http://localhost/api/stripe/webhook", {
      method: "POST", headers: { "stripe-signature": "test_signature" }, body: "{}",
    });
    for (const route of ["restore", "confirm", "checkout webhook"] as const) {
      const call = async () => {
        if (route === "restore") return restore();
        if (route === "confirm") return confirm(confirmRequest());
        eventType = "checkout.session.completed";
        return webhook(webhookRequest());
      };
      reset();
      session.subscription = { id: "sub_monthly" }; // Expanded session references also work.
      assert.equal((await call()).status, 200, `${route} accepts modern subscription data`);
      assert.equal(passes.length, 1);
      assert.equal(passes[0].expires_at, expectedExpiry, `${route} uses the approved item's exact period`);
      assert.equal(passes[0].stripe_subscription_id, "sub_monthly");

      for (const failure of ["missing", "ambiguous", "provider error"] as const) {
        reset();
        if (failure === "missing") subscription.items.data = [];
        if (failure === "ambiguous") subscription.items.data = [approvedItem, { ...approvedItem, id: "si_duplicate" }];
        if (failure === "provider error") lookupFails = true;
        const response = await call();
        assert.equal(mutations, 0, `${route} cannot create access from ${failure}`);
        assert.equal(response.status, route === "restore" ? 200 : route === "confirm" ? 202 : 500);
        if (route === "checkout webhook") assert.equal(failedEvents, 1, "webhook retains failed fulfillment for retry");
      }

      reset();
      session = {
        ...monthlySession, mode: "payment", subscription: null, created: nowUnix,
        metadata: { user_id: user.id, email: user.email, tier: "30d" },
        line_items: { has_more: false, data: [{ quantity: 1, price: { id: "price_pass", product: "prod_pass", currency: "usd", unit_amount: 2_900 } }] },
      };
      lookupFails = true;
      assert.equal((await call()).status, 200, `${route} still fulfills the one-time offer without a subscription lookup`);
      assert.equal(passes[0].expires_at, new Date((nowUnix + 30 * 86_400) * 1000).toISOString());
      assert.equal(passes[0].uses_remaining, 5);
    }

    for (const priceId of ["price_monthly", "sub_monthly", null]) {
      reset();
      passes = [{ ...existingPass(), price_id: priceId }, { ...existingPass(), id: "pass_other", stripe_subscription_id: "sub_other" }];
      const otherExpiry = passes[1].expires_at;
      assert.equal((await webhook(webhookRequest())).status, 200);
      assert.equal(passes[0].expires_at, expectedExpiry, "subscription update matches the canonical item for current and migrated passes");
      assert.equal(passes[1].expires_at, otherExpiry, "another subscription is untouched");
    }
    for (const reason of ["refund", "dispute"]) {
      for (const status of ["active", "trialing", "past_due"]) {
        for (const duringWrite of [false, true]) {
          reset();
          subscription.status = status;
          const revokedAt = new Date(nowUnix * 1000).toISOString();
          const revoke = () => Object.assign(passes[0], {
            revoked_at: revokedAt, revocation_reason: reason, expires_at: revokedAt, uses_remaining: 0,
          });
          passes = [existingPass()];
          if (duringWrite) beforePassUpdate = revoke;
          else revoke();
          assert.equal((await webhook(webhookRequest())).status, 200);
          assert.equal(passes[0].expires_at, revokedAt, `${reason} expiry survives a late ${status} update`);
          assert.equal(passes[0].uses_remaining, 0, `${reason} credits cannot be restored`);
          assert.equal(passes[0].revoked_at, revokedAt);
          assert.equal(passes[0].revocation_reason, reason);
          assert.equal(isPassActive(passes[0]), false);
          assert.equal(hasPdfExportAccess(passes[0]), false);
        }
      }
    }
    reset();
    const revoked = { ...existingPass(), revoked_at: new Date(nowUnix * 1000).toISOString(), revocation_reason: "refund" };
    passes = [revoked];
    subscription.items.data = [];
    assert.equal((await webhook(webhookRequest())).status, 200, "revoked-only subscription needs no billing-period resolution");
    assert.equal(mutations, 0);
    subscription.status = "canceled";
    eventType = "customer.subscription.deleted";
    assert.equal((await webhook(webhookRequest())).status, 200, "cancellation preserves an existing revocation");
    assert.equal(mutations, 0);

    reset();
    passes = [{ ...revoked }, { ...existingPass(), id: "pass_valid" }];
    const revokedBefore = structuredClone(passes[0]);
    assert.equal((await webhook(webhookRequest())).status, 200);
    assert.deepEqual(passes[0], revokedBefore, "a mixed subscription leaves its revoked row untouched");
    assert.equal(passes[1].expires_at, expectedExpiry, "a valid row on that subscription still updates");
    reset();
    passes = [existingPass()];
    subscription.current_period_end = periodEnd;
    subscription.items.data = [{ id: "si_monthly", price: approvedItem.price }];
    assert.equal((await webhook(webhookRequest())).status, 200);
    assert.equal(passes[0].expires_at, expectedExpiry, "older webhook payloads retain the shared subscription period");

    reset();
    passes = [existingPass()];
    const priorExpiry = passes[0].expires_at;
    subscription.items.data = [];
    assert.equal((await webhook(webhookRequest())).status, 500);
    assert.equal(mutations, 0);
    assert.equal(passes[0].expires_at, priorExpiry, "missing item data preserves existing expiry without granting another month");
    assert.equal(failedEvents, 1);

    subscription.status = "canceled";
    eventType = "customer.subscription.deleted";
    assert.equal((await webhook(webhookRequest())).status, 200, "cancellation needs no active billing period");
    assert.equal(passes[0].uses_remaining, 0);
    assert.ok(Date.parse(passes[0].expires_at) <= Date.now());
    console.log("Billing subscription route tests passed");
  } finally {
    runtimeModule._load = originalLoad;
    for (const [key, value] of Object.entries(originalEnv)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

run().catch((error) => { console.error(error); process.exitCode = 1; });
