import type Stripe from "stripe";
import {
  getTierDefaultsForCheckout,
  paymentIntentIdForSession,
  stripeId,
} from "./checkoutFulfillment";
import { toStoredPassTier, type PassStatus, type StoredPassTier } from "./entitlements";
import type { ApprovedStripeOffer } from "./stripeOffers";

/**
 * The lifecycle of a purchased pass.
 *
 *   granted --(credits spent)--> used ----+
 *      |                                  +--> expired
 *      +--(refund | dispute | account_deleted)--> revoked   [terminal]
 *
 * Stripe is the source of truth for payment. The `passes` row is the local
 * projection of it, and migration 025 makes the database hold the rules:
 * a blocked checkout session is never granted again, writing `revoked_at`
 * zeroes credits and ends expiry in the same statement, and `revoked_at`
 * never returns to null. There are exactly two write transitions, both
 * atomic RPCs wrapped here:
 *
 *   fulfillCheckoutPass        grant (created | existing | renewed | blocked)
 *   revokeCheckoutEntitlements reversal (block sessions, revoke passes)
 *
 * The read side is `getPassStatus` in ./entitlements, the one derivation of
 * active | used | expired | revoked | invalid from a row. Every route that
 * grants or reverses access goes through this module so the webhook, the
 * return-URL confirm, restore, and account deletion cannot disagree.
 */
export type PassLifecycleState = PassStatus;

export type ReversalReason = "refund" | "dispute" | "account_deleted";

export type LifecyclePass = {
  id: string;
  user_id: string;
  tier: string | null;
  uses_remaining: number | null;
  expires_at: string | null;
  revoked_at: string | null;
  revocation_reason: string | null;
  checkout_session_id: string | null;
  stripe_subscription_id: string | null;
};

export type CheckoutPassGrant =
  | { outcome: "created" | "existing" | "renewed"; pass: LifecyclePass }
  | { outcome: "blocked"; reason: string };

export type CheckoutPassInput = {
  userId: string;
  checkoutSessionId: string;
  tier: StoredPassTier;
  usesRemaining: number;
  purchasedAt: string;
  expiresAt: string;
  priceId: string | null;
  stripeSubscriptionId: string | null;
  stripePaymentIntentId: string | null;
  stripeCustomerId: string | null;
};

export type ReversalResult = { blocked: number; revoked: number };

type RpcResult = { data: unknown; error: { message?: string; code?: string } | null };
export type PassLifecycleClient = {
  rpc: (functionName: string, args: Record<string, unknown>) => PromiseLike<RpcResult>;
};

export class PassLifecycleError extends Error {
  readonly code: string | null;

  constructor(message: string, code: string | null = null) {
    super(message);
    this.name = "PassLifecycleError";
    this.code = code;
  }
}

/**
 * The pass a settled, approved checkout session grants. The caller has already
 * validated the session against the offer catalog and, for subscriptions,
 * verified the billing period with Stripe.
 */
export function buildCheckoutPassInput(
  session: Pick<Stripe.Checkout.Session, "id" | "created" | "customer" | "payment_intent">,
  offer: ApprovedStripeOffer,
  userId: string,
  subscription: { id: string | null; periodEndUnix: number | null } = { id: null, periodEndUnix: null },
): CheckoutPassInput {
  const tier = toStoredPassTier(offer.tier);
  const { usesRemaining, expiresAt, purchasedAt } = getTierDefaultsForCheckout(
    tier,
    session,
    subscription.periodEndUnix,
  );
  return {
    userId,
    checkoutSessionId: session.id,
    tier,
    usesRemaining,
    purchasedAt,
    expiresAt,
    priceId: offer.priceId,
    stripeSubscriptionId: subscription.id,
    stripePaymentIntentId: paymentIntentIdForSession(session),
    stripeCustomerId: stripeId(session.customer),
  };
}

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" && value ? value : null;
}

function isoOrNull(value: unknown): string | null {
  if (typeof value !== "string" || !value) return null;
  const ms = Date.parse(value);
  return Number.isNaN(ms) ? value : new Date(ms).toISOString();
}

function record(value: unknown): Record<string, unknown> | null {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate && typeof candidate === "object" ? candidate as Record<string, unknown> : null;
}

export function parseLifecyclePass(value: unknown): LifecyclePass | null {
  const row = record(value);
  if (!row || typeof row.id !== "string" || typeof row.user_id !== "string") return null;
  return {
    id: row.id,
    user_id: row.user_id,
    tier: stringOrNull(row.tier),
    uses_remaining: typeof row.uses_remaining === "number" ? row.uses_remaining : null,
    expires_at: isoOrNull(row.expires_at),
    revoked_at: isoOrNull(row.revoked_at),
    revocation_reason: stringOrNull(row.revocation_reason),
    checkout_session_id: stringOrNull(row.checkout_session_id),
    stripe_subscription_id: stringOrNull(row.stripe_subscription_id),
  };
}

/** Reads the grant RPC's JSON. A shape this code does not recognize is an error, never a grant. */
export function parseCheckoutPassGrant(value: unknown): CheckoutPassGrant {
  const row = record(value);
  const outcome = row?.outcome;
  if (outcome === "blocked") {
    return { outcome, reason: stringOrNull(row?.reason) || "reversed" };
  }
  if (outcome === "created" || outcome === "existing" || outcome === "renewed") {
    const pass = parseLifecyclePass(row?.pass);
    if (pass) return { outcome, pass };
  }
  throw new PassLifecycleError("Checkout fulfillment returned an unrecognized result");
}

export function parseReversalResult(value: unknown): ReversalResult {
  const row = record(value);
  const blocked = Number(row?.blocked);
  const revoked = Number(row?.revoked);
  if (!Number.isInteger(blocked) || !Number.isInteger(revoked)) {
    throw new PassLifecycleError("Entitlement reversal returned an unrecognized result");
  }
  return { blocked, revoked };
}

/** The grant transition. Writes nothing when the purchase was reversed. */
export async function fulfillCheckoutPass(
  admin: PassLifecycleClient,
  input: CheckoutPassInput,
): Promise<CheckoutPassGrant> {
  const { data, error } = await admin.rpc("fulfill_checkout_pass", {
    p_user_id: input.userId,
    p_checkout_session_id: input.checkoutSessionId,
    p_tier: input.tier,
    p_uses_remaining: input.usesRemaining,
    p_purchased_at: input.purchasedAt,
    p_expires_at: input.expiresAt,
    p_price_id: input.priceId,
    p_stripe_subscription_id: input.stripeSubscriptionId,
    p_stripe_payment_intent_id: input.stripePaymentIntentId,
    p_stripe_customer_id: input.stripeCustomerId,
  });
  if (error) {
    throw new PassLifecycleError(error.message || "Checkout fulfillment failed", error.code || null);
  }
  return parseCheckoutPassGrant(data);
}

/** The reversal transition: blocks the sessions and revokes every pass they or the payment reach. */
export async function revokeCheckoutEntitlements(
  admin: PassLifecycleClient,
  input: {
    checkoutSessionIds: Iterable<string>;
    stripePaymentIntentId?: string | null;
    stripeSubscriptionId?: string | null;
    reason: ReversalReason;
  },
): Promise<ReversalResult> {
  const sessionIds = [...new Set(input.checkoutSessionIds)].filter(
    (id): id is string => typeof id === "string" && id.startsWith("cs_"),
  );
  const { data, error } = await admin.rpc("revoke_checkout_entitlements", {
    p_checkout_session_ids: sessionIds,
    p_stripe_payment_intent_id: input.stripePaymentIntentId || null,
    p_stripe_subscription_id: input.stripeSubscriptionId || null,
    p_reason: input.reason,
  });
  if (error) {
    throw new PassLifecycleError(error.message || "Entitlement reversal failed", error.code || null);
  }
  return parseReversalResult(data);
}
