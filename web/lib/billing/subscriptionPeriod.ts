type SubscriptionOffer = { priceId: string; productId: string };

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

export function isValidSubscriptionPeriodEndUnix(value: unknown): value is number {
  return typeof value === "number"
    && Number.isSafeInteger(value)
    && value > 0
    && Number.isFinite(new Date(value * 1000).getTime());
}

/** Read the period of the approved item, never an unrelated subscription item. */
export function getSubscriptionPeriodEndUnix(
  subscription: unknown,
  offer: SubscriptionOffer,
): number | null {
  const payload = record(subscription);
  const unwrapped = payload.items ? payload : record(payload.data);
  const items = record(unwrapped.items);
  if (!Array.isArray(items.data) || items.has_more === true) return null;

  const matchingItems = items.data.filter((value: unknown) => {
    const price = record(record(value).price);
    const productId = typeof price.product === "string" ? price.product : record(price.product).id;
    return price.id === offer.priceId && productId === offer.productId;
  });
  if (matchingItems.length !== 1) return null;

  const item = record(matchingItems[0]);
  // Pre-Basil events put one shared period on the subscription. Use that only
  // when the approved item has no item-level field, never to mask invalid data.
  const periodEnd = "current_period_end" in item
    ? item.current_period_end
    : unwrapped.current_period_end;
  return isValidSubscriptionPeriodEndUnix(periodEnd) ? periodEnd : null;
}
