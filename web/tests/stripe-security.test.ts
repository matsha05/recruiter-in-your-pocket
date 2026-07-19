import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const checkoutSource = fs.readFileSync(
  path.resolve(process.cwd(), "app/api/checkout/route.ts"),
  "utf8"
);
const webhookSource = fs.readFileSync(
  path.resolve(process.cwd(), "app/api/stripe/webhook/route.ts"),
  "utf8"
);
const stripeClientSource = fs.readFileSync(
  path.resolve(process.cwd(), "lib/billing/stripeClient.ts"),
  "utf8"
);

assert.match(
  checkoutSource,
  /Checkout could not be started\. Try again shortly\./,
  "checkout returns a stable public error instead of provider internals"
);
assert.doesNotMatch(
  checkoutSource,
  /\{ ok: false, message: err\?\.message \|\| "Checkout failed" \}/,
  "checkout must not expose Stripe error messages"
);

assert.match(
  webhookSource,
  /readTextWithLimit\(request, 512 \* 1024\)/,
  "webhook enforces an explicit payload ceiling"
);
assert.match(
  webhookSource,
  /stripe\.webhooks\.constructEvent\(body, sig, WEBHOOK_SECRET\)/,
  "webhook verifies signatures against the raw body"
);

for (const eventType of [
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
  "refund.created",
  "charge.refunded",
  "charge.dispute.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.finalized",
  "invoice.paid",
  "invoice.payment_failed",
  "invoice.voided",
  "invoice.marked_uncollectible",
]) {
  assert.ok(webhookSource.includes(eventType), `webhook handles ${eventType}`);
}

assert.doesNotMatch(
  checkoutSource,
  /payment_method_types/,
  "Checkout should use Stripe's dashboard-managed dynamic payment methods"
);
assert.match(
  checkoutSource,
  /automatic_tax:\s*\{\s*enabled:\s*true\s*\}/,
  "Checkout enables automatic tax calculation"
);
assert.match(
  checkoutSource,
  /requestedTier !== "30d"/,
  "new checkout is restricted to the launch Job Search Pass"
);
assert.match(
  checkoutSource,
  /replace\("%7BCHECKOUT_SESSION_ID%7D", "\{CHECKOUT_SESSION_ID\}"\)/,
  "Stripe's checkout-session token remains literal in the success URL"
);
assert.match(
  webhookSource,
  /upsertBillingReceipt\(supabaseAdmin, invoice, context, userId, session\.id\)/,
  "checkout fulfillment reconciles the invoice after the customer user exists"
);
assert.match(
  stripeClientSource,
  /2026-06-24\.dahlia/,
  "Stripe client is pinned to the API version shipped by the installed SDK"
);

console.log("Stripe security contracts passed");
