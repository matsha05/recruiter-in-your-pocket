import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import Module from "node:module";
import path from "node:path";
import { getInitialUnlockState, transitionUnlockState } from "../lib/billing/unlockStateMachine";
import {
  getCheckoutPricingHref,
  getCheckoutRestoreHref,
  normalizeCheckoutReturnTo,
} from "../lib/billing/checkoutReturn";

type RuntimeModule = typeof Module & {
  _load: (request: string, parent: NodeModule | null, isMain: boolean) => unknown;
};

type CheckoutParameters = {
  success_url: string;
  cancel_url: string;
  mode: string;
  line_items: Array<{ price: string; quantity: number }>;
};
type CheckoutSession = { id: string; url: string };
type CheckoutCall = {
  parameters: CheckoutParameters;
  options?: { idempotencyKey: string };
  session: CheckoutSession;
};

const reportId = "16e8e371-607f-4f90-a677-37d87dc70b2a";
const otherReportId = "89ed7ee0-ea3f-4130-9f41-6a9bf00b3305";
const returnTo = `/workspace?revision=${reportId}`;
const otherReturnTo = `/workspace?revision=${otherReportId}`;
const invalidDestinations: Array<{ label: string; input: unknown }> = [
  { label: "empty destination", input: "" },
  { label: "foreign absolute URL", input: `https://example.org${returnTo}` },
  { label: "same-origin absolute URL", input: `https://checkout.example.test${returnTo}` },
  { label: "protocol-relative URL", input: `//example.org${returnTo}` },
  { label: "backslash URL", input: `/\\example.org${returnTo}` },
  { label: "encoded protocol-relative URL", input: `/%2f%2fexample.org${returnTo}` },
  { label: "JavaScript URL", input: "javascript:alert(1)" },
  { label: "different local route", input: `/reports/${reportId}` },
  { label: "different route casing", input: `/Workspace?revision=${reportId}` },
  { label: "different parameter casing", input: `/workspace?Revision=${reportId}` },
  { label: "workspace without a revision", input: "/workspace" },
  { label: "empty revision", input: "/workspace?revision=" },
  { label: "invalid report ID", input: "/workspace?revision=not-a-report-id" },
  { label: "non-UUID report ID", input: "/workspace?revision=16e8e371607f4f90a67737d87dc70b2a" },
  { label: "encoded UUID", input: `/workspace?revision=%31${reportId.slice(1)}` },
  { label: "encoded route", input: `/work%73pace?revision=${reportId}` },
  { label: "doubly encoded path", input: encodeURIComponent(encodeURIComponent(returnTo)) },
  { label: "duplicate revision", input: `${returnTo}&revision=${otherReportId}` },
  { label: "extra destination parameter", input: `${returnTo}&next=https://example.org` },
  { label: "extra empty query parameter", input: `${returnTo}&` },
  { label: "fragment", input: `${returnTo}#continue` },
  { label: "trailing slash", input: `/workspace/?revision=${reportId}` },
  { label: "path traversal", input: `/reports/../workspace?revision=${reportId}` },
  { label: "leading whitespace", input: ` ${returnTo}` },
  { label: "trailing whitespace", input: `${returnTo} ` },
  { label: "trailing newline", input: `${returnTo}\n` },
  { label: "array value", input: [returnTo] },
  { label: "object value", input: { returnTo } },
  { label: "number value", input: 1 },
  { label: "boolean value", input: false },
];

async function run() {
  const checking = getInitialUnlockState("cs_test_unconfirmed");
  const disconnected = transitionUnlockState(checking, { type: "network_error" });
  const timedOut = transitionUnlockState(disconnected, { type: "timeout" });
  assert.equal(timedOut.status, "error");
  assert.doesNotMatch(timedOut.message, /payment succeeded|payment received|purchase confirmed/i,
    "A timeout without payment confirmation must not tell the customer they paid");
  assert.match(timedOut.message, /receipt.*restore access.*before paying again/i,
    "Unconfirmed purchases need a recovery path that avoids accidental repeat payment");

  for (const candidate of [returnTo, otherReturnTo, `/workspace?revision=${reportId.toUpperCase()}`]) {
    assert.equal(normalizeCheckoutReturnTo(candidate), candidate, "an exact saved-report revision path is retained");
    assert.equal(getCheckoutPricingHref(candidate), `/pricing?returnTo=${encodeURIComponent(candidate)}`);
    assert.equal(getCheckoutRestoreHref(candidate), `/purchase/restore?returnTo=${encodeURIComponent(candidate)}`);
    const pricingUrl = new URL(getCheckoutPricingHref(candidate), "https://checkout.example.test");
    assert.equal(pricingUrl.searchParams.get("returnTo"), candidate, "pricing retains the complete local path after one query decode");
  }
  for (const { label, input } of invalidDestinations) {
    assert.equal(normalizeCheckoutReturnTo(input), null, `rejects ${label}`);
    assert.equal(getCheckoutPricingHref(input), "/pricing", `invalid ${label} cannot enter a pricing link`);
    assert.equal(getCheckoutRestoreHref(input), "/purchase/restore", `invalid ${label} cannot enter a restore link`);
  }
  for (const input of [undefined, null]) {
    assert.equal(normalizeCheckoutReturnTo(input), null);
    assert.equal(getCheckoutPricingHref(input), "/pricing", "ordinary pricing links need no continuation");
    assert.equal(getCheckoutRestoreHref(input), "/purchase/restore");
  }

  const testEnv = {
    STRIPE_PRICE_ID_30D: "price_checkout_return",
    STRIPE_PRODUCT_ID_30D: "prod_checkout_return",
    NEXT_PUBLIC_APP_URL: "https://checkout.example.test",
    VERCEL_ENV: "production",
  };
  const originalEnv = Object.fromEntries(Object.keys(testEnv).map((key) => [key, process.env[key]]));
  Object.assign(process.env, testEnv);
  const runtimeModule = Module as RuntimeModule;
  const originalLoad = runtimeModule._load;
  const checkoutCalls: CheckoutCall[] = [];
  const cachedSessions = new Map<string, Promise<CheckoutSession>>();
  const stripeSessions = new Map<string, CheckoutCall>();
  let customerLookups = 0;
  let stripeCreateAttempts = 0;
  const stripe = {
    customers: { list: async () => { customerLookups += 1; return { data: [] }; } },
    checkout: {
      sessions: {
        create: async (parameters: CheckoutParameters, options?: { idempotencyKey: string }) => {
          stripeCreateAttempts += 1;
          const previous = options && stripeSessions.get(options.idempotencyKey);
          if (previous) {
            assert.deepEqual(parameters, previous.parameters, "Stripe retries cannot change their checkout parameters");
            return previous.session;
          }
          const session = {
            id: `cs_test_return_${checkoutCalls.length + 1}`,
            url: `https://checkout.stripe.test/session-${checkoutCalls.length + 1}`,
          };
          const call = { parameters, options, session };
          checkoutCalls.push(call);
          if (options) stripeSessions.set(options.idempotencyKey, call);
          return session;
        },
      },
    },
  };

  runtimeModule._load = function loadCheckoutMocks(request, parent, isMain) {
    if (request === "@/lib/billing/stripeClient") return { createStripeClient: () => stripe };
    if (request === "@/lib/supabase/serverClient") return {
      createSupabaseServerClient: async () => ({ auth: { getUser: async () => ({
        data: { user: { id: "user_checkout_return", email: "checkout@example.test" } },
      }) } }),
    };
    if (request === "@/lib/launch/flags") return { isLaunchFlagEnabled: () => true };
    if (request === "@/lib/launch/serverFlags") return { areNewPurchasesDisabled: () => false };
    if (request === "@/lib/security/rateLimit") return { rateLimitAsync: async () => ({ ok: true }) };
    if (request === "@/lib/observability/logger") return {
      hashForLogs: (value: string) => createHash("sha256").update(value).digest("hex"),
      logInfo() {}, logWarn() {}, logError() {},
    };
    if (request === "@/lib/observability/requestContext") return {
      getRequestId: () => "request_checkout_return",
      routeLabel: () => ({ method: "POST", path: "/api/checkout" }),
    };
    if (request === "@/lib/redis/idempotency") return {
      getOrSetCache: async (key: string, factory: () => Promise<CheckoutSession>) => {
        const existing = cachedSessions.get(key);
        if (existing) return { value: await existing, cached: true };
        const created = factory();
        cachedSessions.set(key, created);
        return { value: await created, cached: false };
      },
    };
    if (request.startsWith("@/")) return originalLoad(path.join(process.cwd(), request.slice(2)), parent, isMain);
    return originalLoad(request, parent, isMain);
  };

  try {
    const checkout = require("../app/api/checkout/route").POST as (request: Request) => Promise<Response>;
    const post = (body: Record<string, unknown>) => checkout(new Request("https://checkout.example.test/api/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ tier: "30d", source: "pricing", ...body }),
    }));

    for (const { label, input } of invalidDestinations) {
      const createsBefore = checkoutCalls.length;
      const lookupsBefore = customerLookups;
      const response = await post({ returnTo: input });
      assert.equal(response.status, 400, `${label} is rejected by the real checkout handler`);
      assert.equal((await response.json()).ok, false);
      assert.equal(checkoutCalls.length, createsBefore, `${label} cannot create a Stripe session`);
      assert.equal(customerLookups, lookupsBefore, `${label} is rejected before contacting Stripe`);
    }

    for (const source of ["pricing", "workspace", "paywall", "settings"]) {
      const response = await post({ source, returnTo, unlockSection: "bullet_upgrades" });
      assert.equal(response.status, 200);
      const call = checkoutCalls[checkoutCalls.length - 1];
      const successUrl = new URL(call.parameters.success_url);
      const cancelUrl = new URL(call.parameters.cancel_url);
      assert.equal(successUrl.origin, "https://checkout.example.test");
      assert.equal(successUrl.pathname, "/purchase/confirmed");
      assert.equal(successUrl.searchParams.get("returnTo"), returnTo, `${source} success preserves the revision`);
      assert.equal(successUrl.searchParams.get("session_id"), "{CHECKOUT_SESSION_ID}");
      assert.ok(call.parameters.success_url.includes("{CHECKOUT_SESSION_ID}"), "Stripe's substitution token remains literal");
      assert.equal(successUrl.searchParams.get("source"), source);
      assert.equal(successUrl.searchParams.get("tier"), "30d");
      assert.equal(successUrl.searchParams.get("unlock"), "bullet_upgrades");
      assert.equal(cancelUrl.origin, "https://checkout.example.test");
      assert.equal(cancelUrl.pathname, "/pricing", "a cancelled revision purchase returns to its offer");
      assert.equal(cancelUrl.searchParams.get("payment"), "cancelled");
      assert.equal(cancelUrl.searchParams.get("returnTo"), returnTo, "cancelling does not drop the saved report");
      assert.equal(call.parameters.mode, "payment");
      assert.deepEqual(call.parameters.line_items, [{ price: "price_checkout_return", quantity: 1 }]);
    }

    const destinations = { pricing: "/pricing", landing: "/pricing", settings: "/settings/billing", workspace: "/workspace", paywall: "/workspace" };
    for (const [source, destination] of Object.entries(destinations)) {
      for (const body of [{ source }, { source, returnTo: null }]) {
        assert.equal((await post(body)).status, 200, "an ordinary purchase still succeeds");
        const call = checkoutCalls[checkoutCalls.length - 1];
        const successUrl = new URL(call.parameters.success_url);
        assert.equal(successUrl.pathname, "/purchase/confirmed");
        assert.equal(successUrl.searchParams.has("returnTo"), false, "ordinary confirmation has no invented continuation");
        assert.equal(call.parameters.cancel_url, `https://checkout.example.test${destination}?payment=cancelled`, `${source} retains its existing cancellation destination`);
      }
    }

    const retryBody = { returnTo, idempotencyKey: "saved-report-purchase-attempt" };
    const createsBeforeRetry = checkoutCalls.length;
    const first = await post(retryBody);
    assert.equal(first.status, 200);
    const firstResult = await first.json();
    const retry = await post(retryBody);
    assert.equal(retry.status, 200);
    assert.deepEqual(await retry.json(), firstResult, "the same continuation retry reuses the original session");
    assert.equal(checkoutCalls.length, createsBeforeRetry + 1, "a retry does not create a second payment session");
    cachedSessions.clear();
    const retryAfterCacheMiss = await post(retryBody);
    assert.equal(retryAfterCacheMiss.status, 200);
    assert.deepEqual(await retryAfterCacheMiss.json(), firstResult, "Stripe idempotency also protects a retry after a cache miss");
    assert.equal(checkoutCalls.length, createsBeforeRetry + 1);

    for (const nextReturnTo of [otherReturnTo, null]) {
      const createsBeforeChange = checkoutCalls.length;
      const attemptsBeforeChange = stripeCreateAttempts;
      const changed = await post({ ...retryBody, returnTo: nextReturnTo });
      assert.equal(changed.status, 500, "a conflicting destination reaches Stripe and rejects the existing purchase intent");
      const changedResult = await changed.json();
      assert.equal(changedResult.ok, false);
      assert.equal(changedResult.sessionId, undefined, "the cache cannot return a stale destination for a changed intent");
      assert.equal(stripeCreateAttempts, attemptsBeforeChange + 1, "the conflicting destination reaches Stripe instead of a stale cache entry");
      assert.equal(checkoutCalls.length, createsBeforeChange, "conflicting retry cannot create a second payment session");
    }

    console.log("Checkout return tests passed: strict local destinations, success/cancel continuity, ordinary purchases, and idempotent retries");
  } finally {
    runtimeModule._load = originalLoad;
    for (const [key, value] of Object.entries(originalEnv)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

run().catch((error) => { console.error(error); process.exitCode = 1; });
