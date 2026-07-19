import type Stripe from "stripe";
import { getTierDefaults, type StoredPassTier } from "./entitlements";

export function isCheckoutPaymentSettled(status: unknown): boolean {
  return status === "paid" || status === "no_payment_required";
}

export function stripeId(value: unknown): string | null {
  if (typeof value === "string" && value) return value;
  if (value && typeof value === "object" && typeof (value as { id?: unknown }).id === "string") {
    return (value as { id: string }).id;
  }
  return null;
}

export function paymentIntentIdForSession(session: Pick<Stripe.Checkout.Session, "payment_intent">) {
  return stripeId(session.payment_intent);
}

export function purchaseDateForSession(session: Pick<Stripe.Checkout.Session, "created">): Date {
  const createdMs = Number(session.created) * 1000;
  return new Date(Number.isFinite(createdMs) && createdMs > 0 ? createdMs : Date.now());
}

export function getTierDefaultsForCheckout(
  tier: StoredPassTier,
  session: Pick<Stripe.Checkout.Session, "created">,
  subscriptionPeriodEndUnix?: number | null,
) {
  const purchasedAt = purchaseDateForSession(session);
  return {
    purchasedAt: purchasedAt.toISOString(),
    ...getTierDefaults(tier, { now: purchasedAt, subscriptionPeriodEndUnix }),
  };
}
