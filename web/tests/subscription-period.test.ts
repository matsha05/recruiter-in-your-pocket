import assert from "node:assert/strict";
import { getSubscriptionPeriodEndUnix } from "../lib/billing/subscriptionPeriod";
import { getTierDefaultsForCheckout } from "../lib/billing/checkoutFulfillment";

const offer = { priceId: "price_monthly", productId: "prod_monthly" };
const periodEnd = Date.parse("2026-10-01T12:00:00.000Z") / 1000;
const item = {
  id: "si_monthly",
  object: "subscription_item",
  price: { id: offer.priceId, product: offer.productId },
  current_period_start: periodEnd - 30 * 86_400,
  current_period_end: periodEnd,
};
const subscription = {
  id: "sub_monthly",
  object: "subscription",
  status: "active",
  items: { object: "list", data: [item], has_more: false },
};

assert.equal(getSubscriptionPeriodEndUnix(subscription, offer), periodEnd, "modern item-level periods are restored");
assert.equal(getSubscriptionPeriodEndUnix({
  ...subscription,
  items: { ...subscription.items, data: [{ ...item, price: { ...item.price, product: { id: offer.productId } } }] },
}, offer), periodEnd, "expanded product responses match the approved offer");

const unrelatedItem = {
  ...item,
  id: "si_unrelated",
  price: { id: "price_unrelated", product: "prod_unrelated" },
  current_period_end: periodEnd + 365 * 86_400,
};
assert.equal(getSubscriptionPeriodEndUnix({
  ...subscription,
  current_period_end: periodEnd + 100 * 86_400,
  items: { ...subscription.items, data: [unrelatedItem, item] },
}, offer), periodEnd, "an unrelated first item and a stale top-level period cannot extend access");

for (const data of [[], [unrelatedItem], [item, { ...item, id: "si_duplicate" }]]) {
  assert.equal(getSubscriptionPeriodEndUnix({
    ...subscription,
    current_period_end: periodEnd,
    items: { ...subscription.items, data },
  }, offer), null, "missing or ambiguous approved items fail closed even with a top-level period");
}
assert.equal(getSubscriptionPeriodEndUnix({
  ...subscription, items: { ...subscription.items, has_more: true },
}, offer), null, "a truncated item list cannot prove which periods belong to the offer");
assert.equal(getSubscriptionPeriodEndUnix({
  ...subscription,
  items: { ...subscription.items, data: [{ ...item, price: { ...item.price, product: "prod_wrong" } }] },
}, offer), null, "both price and product must match");

const { current_period_end: _period, current_period_start: _start, ...legacyItem } = item;
void _period;
void _start;
const legacySubscription = {
  ...subscription,
  current_period_end: periodEnd,
  items: { ...subscription.items, data: [legacyItem] },
};
assert.equal(getSubscriptionPeriodEndUnix(legacySubscription, offer), periodEnd, "pre-Basil webhook payloads retain their shared period");
assert.equal(getSubscriptionPeriodEndUnix({ data: legacySubscription }, offer), periodEnd);
assert.equal(getSubscriptionPeriodEndUnix({ current_period_end: periodEnd }, offer), null, "a period without an approved item is insufficient");

for (const invalid of [undefined, null, 0, -1, NaN, Infinity, 1.5, Number.MAX_SAFE_INTEGER, String(periodEnd)]) {
  assert.equal(getSubscriptionPeriodEndUnix({
    ...subscription,
    current_period_end: periodEnd,
    items: { ...subscription.items, data: [{ ...item, current_period_end: invalid }] },
  }, offer), null, "an invalid modern period must not fall back to a legacy field");
  assert.throws(() => getTierDefaultsForCheckout("monthly", { created: periodEnd - 86_400 }, invalid as number),
    /verified subscription billing period/, "missing or invalid billing periods cannot invent monthly access");
}

const purchase = { created: periodEnd + 86_400 };
assert.equal(getTierDefaultsForCheckout("monthly", purchase, periodEnd).expiresAt,
  "2026-10-01T12:00:00.000Z", "even an expired provider period remains exact, with no synthetic extension");
assert.equal(getTierDefaultsForCheckout("30d", { created: periodEnd }).expiresAt,
  "2026-10-31T12:00:00.000Z", "the current one-time 30-day pass remains anchored to checkout");
console.log("Subscription period tests passed");
