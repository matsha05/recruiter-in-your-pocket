import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseAdminClient } from "@/lib/supabase/adminClient";
import {
  isPassActive,
  toStoredPassTier
} from "@/lib/billing/entitlements";
import {
  getTierDefaultsForCheckout,
  isCheckoutPaymentSettled,
  paymentIntentIdForSession,
  stripeId,
} from "@/lib/billing/checkoutFulfillment";
import { buildConfirmResponse, type UnlockConfirmResponse } from "@/lib/billing/unlockStateMachine";
import { isLaunchFlagEnabled } from "@/lib/launch/flags";
import { createStripeClient } from "@/lib/billing/stripeClient";
import { getSubscriptionPeriodEndUnix } from "@/lib/billing/subscriptionPeriod";
import {
  STRIPE_CHECKOUT_SESSION_EXPAND,
  validateStripeCheckoutSession,
  type ApprovedStripeOffer,
} from "@/lib/billing/stripeOffers";
import { readJsonWithLimit } from "@/lib/security/requestBody";
import { rateLimitAsync } from "@/lib/security/rateLimit";
import { hashForLogs, logError } from "@/lib/observability/logger";

const stripe = createStripeClient();

export const runtime = "nodejs";

function response(body: UnlockConfirmResponse, status: number) {
  return NextResponse.json(body, { status });
}

function getEmailFromCheckoutSession(session: Stripe.Checkout.Session): string | null {
  const metadataEmail = session.metadata?.email;
  if (metadataEmail && typeof metadataEmail === "string") return metadataEmail.toLowerCase();

  const customerEmail = session.customer_details?.email || session.customer_email;
  if (customerEmail && typeof customerEmail === "string") return customerEmail.toLowerCase();

  return null;
}

async function findUserIdByEmail(admin: any, email: string): Promise<string | null> {
  const perPage = 200;

  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error || !data?.users?.length) break;

    const found = data.users.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());
    if (found?.id) return found.id;

    if (data.users.length < perPage) break;
  }

  return null;
}

async function ensurePassForCheckoutSession(
  admin: any,
  session: Stripe.Checkout.Session,
  offer: ApprovedStripeOffer
) {
  const { data: block, error: blockError } = await admin
    .from("billing_entitlement_blocks")
    .select("checkout_session_id")
    .eq("checkout_session_id", session.id)
    .maybeSingle();
  if (blockError) throw blockError;
  if (block?.checkout_session_id) return null;

  const existing = await admin
    .from("passes")
    .select("id, tier, uses_remaining, expires_at, revoked_at")
    .eq("checkout_session_id", session.id)
    .limit(1)
    .maybeSingle();

  if (existing?.data?.id) {
    return existing.data;
  }

  const metadataUserId = typeof session.metadata?.user_id === "string" && session.metadata.user_id
    ? session.metadata.user_id
    : null;

  const email = getEmailFromCheckoutSession(session);
  const userId = metadataUserId || (email ? await findUserIdByEmail(admin, email) : null);
  if (!userId) return null;

  const storedTier = toStoredPassTier(offer.tier);

  let subscriptionId: string | null = null;
  let subscriptionPeriodEndUnix: number | null = null;
  if (session.mode === "subscription") {
    subscriptionId = stripeId(session.subscription);
    if (!subscriptionId) return null;
    const subscription = await stripe!.subscriptions.retrieve(subscriptionId);
    if (subscription.status !== "active" && subscription.status !== "trialing") return null;
    subscriptionPeriodEndUnix = getSubscriptionPeriodEndUnix(subscription, offer);
    if (!subscriptionPeriodEndUnix || subscriptionPeriodEndUnix * 1000 <= Date.now()) return null;
  }

  const { usesRemaining, expiresAt, purchasedAt } = getTierDefaultsForCheckout(
    storedTier,
    session,
    subscriptionPeriodEndUnix,
  );
  const passId = crypto.randomUUID();

  const { error: insertError } = await admin.from("passes").insert({
    id: passId,
    user_id: userId,
    tier: storedTier,
    uses_remaining: usesRemaining,
    purchased_at: purchasedAt,
    expires_at: expiresAt,
    price_id: offer.priceId,
    stripe_subscription_id: subscriptionId,
    checkout_session_id: session.id,
    stripe_payment_intent_id: paymentIntentIdForSession(session),
    stripe_customer_id: stripeId(session.customer),
    created_at: new Date().toISOString(),
  });

  if (insertError) {
    const fallback = await admin
      .from("passes")
      .select("id, tier, uses_remaining, expires_at, revoked_at")
      .eq("checkout_session_id", session.id)
      .limit(1)
      .maybeSingle();

    return fallback?.data ?? null;
  }

  return {
    id: passId,
    tier: storedTier,
    uses_remaining: usesRemaining,
    expires_at: expiresAt,
  };
}

export async function POST(req: NextRequest) {
  if (!isLaunchFlagEnabled("billingUnlock")) {
    return response(
      buildConfirmResponse({
        state: "checkout_incomplete",
        status: "unavailable",
      }),
      503
    );
  }

  try {
    if (!stripe) {
      return response(
        buildConfirmResponse({
          state: "not_paid",
          message: "We could not confirm your payment. Try again later or contact support before paying again.",
          pending: false,
        }),
        500
      );
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const ipLimit = await rateLimitAsync(`ip:${hashForLogs(ip)}:billing-confirm`, 30, 10 * 60 * 1000);
    if (!ipLimit.ok) {
      return response(
        buildConfirmResponse({ state: "fulfillment_pending", message: "Too many payment checks. Wait a few minutes before trying again." }),
        429,
      );
    }

    const body = await readJsonWithLimit<any>(req, 16 * 1024);
    const sessionId = typeof body?.sessionId === "string" ? body.sessionId.trim() : "";
    if (!/^cs_(?:test_|live_)?[A-Za-z0-9]{8,200}$/.test(sessionId)) {
      return response(
        buildConfirmResponse({
          state: "checkout_incomplete",
          message: "This link does not include a valid purchase reference. Restore your purchase from Billing.",
          pending: false,
        }),
        400
      );
    }

    const sessionLimit = await rateLimitAsync(
      `stripe-session:${hashForLogs(sessionId)}:billing-confirm`,
      12,
      10 * 60 * 1000,
    );
    if (!sessionLimit.ok) {
      return response(
        buildConfirmResponse({ state: "fulfillment_pending", message: "Too many payment checks. Wait a few minutes before trying again." }),
        429,
      );
    }

    let checkoutSession: Stripe.Checkout.Session;
    try {
      checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: [...STRIPE_CHECKOUT_SESSION_EXPAND],
      });
    } catch (err: any) {
      const invalidRequest =
        err instanceof Stripe.errors.StripeInvalidRequestError ||
        err?.type === "StripeInvalidRequestError";

      if (invalidRequest) {
        return response(
          buildConfirmResponse({
            state: "checkout_incomplete",
            message: "We could not find this checkout. Restore your purchase from Billing or contact support.",
            pending: false,
          }),
          404
        );
      }

      throw err;
    }
    const status = checkoutSession.status || null;
    const validation = validateStripeCheckoutSession(checkoutSession);

    if (!validation.ok) {
      return response(
        buildConfirmResponse({
          state: "checkout_incomplete",
          status: "ineligible",
          message: "This checkout session is not eligible for Recruiter in Your Pocket access.",
          pending: false,
        }),
        422
      );
    }

    if (status !== "complete") {
      return response(
        buildConfirmResponse({
          state: "checkout_incomplete",
          status,
        }),
        409
      );
    }

    if (!isCheckoutPaymentSettled(checkoutSession.payment_status)) {
      return response(
        buildConfirmResponse({
          state: "fulfillment_pending",
          status,
        }),
        202
      );
    }

    const supabaseAdmin = createSupabaseAdminClient();
    if (!supabaseAdmin) {
      return response(
        buildConfirmResponse({
          state: "fulfillment_pending",
          status,
          message: "We could not confirm your pass yet. Try again later or contact support before paying again.",
        }),
        500
      );
    }

    const { data: entitlementBlock, error: entitlementBlockError } = await supabaseAdmin
      .from("billing_entitlement_blocks")
      .select("reason")
      .eq("checkout_session_id", sessionId)
      .maybeSingle();
    if (entitlementBlockError) {
      return response(
        buildConfirmResponse({
          state: "fulfillment_pending",
          status,
          message: "We could not verify this purchase yet.",
        }),
        202,
      );
    }
    if (entitlementBlock?.reason) {
      return response(
        buildConfirmResponse({
          state: "checkout_incomplete",
          status: "reversed",
          message: "This purchase is no longer eligible for access.",
          pending: false,
        }),
        409,
      );
    }

    const { data, error } = await supabaseAdmin
      .from("passes")
      .select("id, tier, uses_remaining, expires_at, revoked_at")
      .eq("checkout_session_id", sessionId)
      .limit(1)
      .maybeSingle();

    if (error) {
      logError({
        msg: "billing.confirm.query_failed",
        outcome: "provider_error",
        supabase: { table: "passes", op: "select", error_code: error.code },
        err: { name: "SupabaseError", message: error.message },
      });
      return response(
        buildConfirmResponse({
          state: "fulfillment_pending",
          status,
        }),
        202
      );
    }

    const pass = data?.id
      ? data
      : await ensurePassForCheckoutSession(supabaseAdmin, checkoutSession, validation.offer);

    if (!pass?.id) {
      return response(
        buildConfirmResponse({
          state: "fulfillment_pending",
          status,
        }),
        202
      );
    }

    return response(
      buildConfirmResponse({
        state: "unlocked",
        status,
        pass: {
          id: pass.id,
          tier: pass.tier ?? null,
          expires_at: pass.expires_at ?? null,
          uses_remaining: typeof pass.uses_remaining === "number" ? pass.uses_remaining : null,
          active: isPassActive(pass as any),
        },
      }),
      200
    );
  } catch (error: any) {
    logError({
      msg: "billing.confirm.failed",
      outcome: "provider_error",
      err: { name: error?.name || "BillingConfirmError", message: error?.message || "Confirmation failed" },
    });
    const requestStatus = Number(error?.httpStatus);
    if (requestStatus === 400 || requestStatus === 413) {
      return response(
        buildConfirmResponse({
          state: "checkout_incomplete",
          message: requestStatus === 413 ? "Request body too large." : "Invalid request body.",
          pending: false,
        }),
        requestStatus,
      );
    }
    return response(
      buildConfirmResponse({
        state: "fulfillment_pending",
      }),
      202
    );
  }
}
