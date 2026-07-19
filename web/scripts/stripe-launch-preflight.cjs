#!/usr/bin/env node

const { loadEnvConfig } = require("@next/env");
const Stripe = require("stripe");

loadEnvConfig(process.cwd());

const CANONICAL_APP_URL = "https://www.recruiterinyourpocket.com";
const CANONICAL_WEBHOOK_URL = `${CANONICAL_APP_URL}/api/stripe/webhook`;
const REQUIRED_WEBHOOK_EVENTS = [
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
  "invoice.finalized",
  "invoice.paid",
  "invoice.payment_failed",
  "invoice.voided",
  "invoice.marked_uncollectible",
];

const args = new Set(process.argv.slice(2));
const remote = args.has("--remote");
const expectedModeArg = [...args].find((arg) => arg.startsWith("--mode="));
const expectedMode = expectedModeArg?.split("=")[1] || null;

const failures = [];
const warnings = [];

function value(name) {
  return String(process.env[name] || "").trim();
}

function pass(message) {
  console.log(`PASS  ${message}`);
}

function fail(message) {
  failures.push(message);
  console.error(`FAIL  ${message}`);
}

function warn(message) {
  warnings.push(message);
  console.warn(`WARN  ${message}`);
}

function requireValue(name, alternatives = []) {
  const names = [name, ...alternatives];
  const found = names.find((candidate) => value(candidate));
  if (!found) {
    fail(`${names.join(" or ")} is missing or empty`);
    return "";
  }
  pass(`${found} is present and nonempty`);
  return value(found);
}

const secretKey = requireValue("STRIPE_SECRET_KEY");
const webhookSecret = requireValue("STRIPE_WEBHOOK_SECRET");
const priceId = requireValue("STRIPE_PRICE_ID_30D");
const productId = requireValue("STRIPE_PRODUCT_ID_30D");
requireValue("SUPABASE_SECRET_KEY", ["SUPABASE_SERVICE_ROLE_KEY"]);

const inferredMode = secretKey.startsWith("sk_live_")
  ? "live"
  : secretKey.startsWith("sk_test_")
    ? "test"
    : "unknown";

if (secretKey && inferredMode === "unknown") fail("STRIPE_SECRET_KEY has an unrecognized mode prefix");
if (secretKey && inferredMode !== "unknown") pass(`Stripe key is in ${inferredMode} mode`);
if (expectedMode && expectedMode !== inferredMode) fail(`Expected ${expectedMode} mode but the Stripe key is ${inferredMode}`);
if (webhookSecret && !webhookSecret.startsWith("whsec_")) fail("STRIPE_WEBHOOK_SECRET is not a webhook signing secret");
if (priceId && !priceId.startsWith("price_")) fail("STRIPE_PRICE_ID_30D is not a Stripe Price ID");
if (productId && !productId.startsWith("prod_")) fail("STRIPE_PRODUCT_ID_30D is not a Stripe Product ID");

const appUrl = value("NEXT_PUBLIC_APP_URL");
if (inferredMode === "live") {
  if (appUrl !== CANONICAL_APP_URL) fail(`NEXT_PUBLIC_APP_URL must equal ${CANONICAL_APP_URL} for live billing`);
  else pass("Production app URL is canonical");
} else if (!appUrl) {
  warn("NEXT_PUBLIC_APP_URL is not set; local request origin fallback will be used");
}

const billingFlag = value("NEXT_PUBLIC_ENABLE_BILLING_UNLOCK").toLowerCase();
if (["1", "true", "yes", "on"].includes(billingFlag)) {
  warn("Billing is enabled. Keep it off until the remote preflight and sandbox journey both pass.");
} else {
  pass("Billing remains disabled while launch wiring is verified");
}

async function runRemoteChecks() {
  if (!secretKey || !priceId || !productId) return;

  const stripe = new Stripe(secretKey, {
    apiVersion: Stripe.API_VERSION,
    maxNetworkRetries: 2,
    typescript: true,
  });

  const [account, price, product, webhooks, taxSettings] = await Promise.all([
    stripe.accounts.retrieve(),
    stripe.prices.retrieve(priceId),
    stripe.products.retrieve(productId),
    stripe.webhookEndpoints.list({ limit: 100 }),
    stripe.tax.settings.retrieve(),
  ]);

  if (inferredMode === "live") {
    if (!account.charges_enabled) fail("Stripe account cannot accept live charges");
    else pass("Stripe account can accept live charges");
    if (!account.payouts_enabled) fail("Stripe account payouts are not enabled");
    else pass("Stripe account payouts are enabled");
  }

  if (!price.active) fail("Job Search Pass price is inactive");
  else pass("Job Search Pass price is active");
  const actualProductId = typeof price.product === "string" ? price.product : price.product?.id;
  if (actualProductId !== productId) fail("Job Search Pass price does not belong to STRIPE_PRODUCT_ID_30D");
  else pass("Job Search Pass price belongs to the canonical product");
  if (product.deleted) fail("Job Search Pass product is deleted");
  else if (!product.active) fail("Job Search Pass product is inactive");
  else pass("Job Search Pass product is active");
  if (price.type !== "one_time") fail(`Job Search Pass price type is ${price.type}, expected one_time`);
  else pass("Job Search Pass is a one-time price");
  if (price.unit_amount !== 2900 || price.currency.toLowerCase() !== "usd") {
    fail(`Job Search Pass price must be USD 29.00; Stripe returned ${price.currency.toUpperCase()} ${Number(price.unit_amount || 0) / 100}`);
  } else {
    pass("Job Search Pass price is USD 29.00");
  }
  if (price.livemode !== (inferredMode === "live")) fail("Stripe price mode does not match the configured secret key");
  else pass("Stripe price mode matches the secret key");

  const canonicalWebhook = webhooks.data.find((endpoint) => endpoint.url === CANONICAL_WEBHOOK_URL);
  if (!canonicalWebhook) {
    fail(`No webhook endpoint points directly to ${CANONICAL_WEBHOOK_URL}`);
  } else {
    pass("Canonical www webhook endpoint exists with no redirect");
    if (canonicalWebhook.status !== "enabled") fail("Canonical webhook endpoint is disabled");
    else pass("Canonical webhook endpoint is enabled");

    const enabled = new Set(canonicalWebhook.enabled_events);
    const listensToAll = enabled.has("*");
    const missingEvents = REQUIRED_WEBHOOK_EVENTS.filter((event) => !listensToAll && !enabled.has(event));
    if (missingEvents.length) fail(`Canonical webhook is missing events: ${missingEvents.join(", ")}`);
    else pass("Canonical webhook subscribes to every fulfillment and receipt event");
  }

  if (taxSettings.status !== "active") fail(`Stripe Tax status is ${taxSettings.status || "unknown"}, expected active`);
  else pass("Stripe Tax is active for automatic Checkout calculation");
}

(async () => {
  if (remote && secretKey && priceId && productId) {
    try {
      await runRemoteChecks();
    } catch (error) {
      fail(`Remote Stripe verification failed: ${error?.message || String(error)}`);
    }
  } else if (!remote) {
    warn("Remote Stripe objects were not checked. Re-run with --remote after loading sandbox or live environment variables.");
  }

  console.log(`\nStripe launch preflight: ${failures.length ? "NOT READY" : "READY"} · ${failures.length} failure(s) · ${warnings.length} warning(s)`);
  process.exitCode = failures.length ? 1 : 0;
})();
