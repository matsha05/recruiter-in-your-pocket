import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseServerClient } from "@/lib/supabase/serverClient";
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
import { isLaunchFlagEnabled } from "@/lib/launch/flags";
import { hashForLogs, logError, logWarn } from "@/lib/observability/logger";
import { createStripeClient } from "@/lib/billing/stripeClient";
import { getSubscriptionPeriodEndUnix } from "@/lib/billing/subscriptionPeriod";
import {
  STRIPE_CHECKOUT_SESSION_EXPAND,
  getLaunchStripeOffer,
  validateStripeCheckoutSession,
} from "@/lib/billing/stripeOffers";
import { rateLimitAsync } from "@/lib/security/rateLimit";

const stripe = createStripeClient();

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    if (!isLaunchFlagEnabled("billingUnlock")) {
      return NextResponse.json(
        { ok: false, restored: 0, message: "Purchase recovery is temporarily unavailable. Try again later or contact support." },
        { status: 503 }
      );
    }

    const supabase = await createSupabaseServerClient();
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;

    if (!user?.id || !user.email) {
      return NextResponse.json(
        { ok: false, restored: 0, message: "Please sign in first." },
        { status: 401 }
      );
    }

    const restoreLimit = await rateLimitAsync(
      `user:${hashForLogs(user.id)}:billing-restore`,
      3,
      60 * 60 * 1000,
    );
    if (!restoreLimit.ok) {
      const response = NextResponse.json(
        { ok: false, restored: 0, message: "Too many restore attempts. Try again later." },
        { status: 429 },
      );
      response.headers.set("retry-after", String(Math.ceil(restoreLimit.resetMs / 1000)));
      return response;
    }

    const admin = createSupabaseAdminClient();
    if (!admin) {
      return NextResponse.json(
        { ok: false, restored: 0, message: "Could not check your purchases. Try again later or contact support." },
        { status: 500 }
      );
    }

    if (!stripe) {
      return NextResponse.json(
        { ok: false, restored: 0, message: "Could not check your purchases. Try again later or contact support." },
        { status: 500 }
      );
    }

    if (!getLaunchStripeOffer()) {
      return NextResponse.json(
        { ok: false, restored: 0, message: "Could not check your purchases. Try again later or contact support." },
        { status: 500 }
      );
    }

    const { data: existingForUser, error: existingError } = await admin
      .from("passes")
      .select("id, tier, uses_remaining, expires_at, revoked_at")
      .eq("user_id", user.id);

    if (existingError) {
      return NextResponse.json(
        { ok: false, restored: 0, message: "Could not check your current pass. Try again." },
        { status: 500 }
      );
    }

    const activeBefore = (existingForUser || []).filter((pass: any) => isPassActive(pass)).length;

    // Find Stripe customer(s) for this signed-in email.
    const customers = await stripe.customers.list({ email: user.email.toLowerCase(), limit: 5 });
    if (customers.data.length === 0) {
      return NextResponse.json({
        ok: true,
        restored: 0,
        active_before: activeBefore,
        active_after: activeBefore,
        message: "No purchases were found for this email. Sign in with the email you used at checkout."
      });
    }

    const sessionsById = new Map<string, Stripe.Checkout.Session>();
    for (const customer of customers.data) {
      try {
        const sessions = await stripe.checkout.sessions.list({
          customer: customer.id,
          status: "complete",
          limit: 25
        });
        for (const session of sessions.data) {
          if (session.id) sessionsById.set(session.id, session);
        }
      } catch (err: any) {
        logWarn({
          msg: "billing.restore.sessions_failed",
          stripe: { customer_id: hashForLogs(customer.id) },
          outcome: "provider_error",
          err: { name: err?.name || "StripeError", message: err?.message || "Failed to list checkout sessions" }
        });
      }
    }

    const sessionIds = [...sessionsById.keys()];
    if (sessionIds.length === 0) {
      return NextResponse.json({
        ok: true,
        restored: 0,
        active_before: activeBefore,
        active_after: activeBefore,
        message: "No completed purchases were found for this email. If you paid with a different email, sign in with that address."
      });
    }


    const { data: blockedSessions, error: blockedSessionsError } = await admin
      .from("billing_entitlement_blocks")
      .select("checkout_session_id")
      .in("checkout_session_id", sessionIds);
    if (blockedSessionsError) {
      return NextResponse.json(
        { ok: false, restored: 0, message: "Could not confirm which purchases can be restored. Try again or contact support." },
        { status: 500 },
      );
    }
    const blockedSessionIds = new Set(
      (blockedSessions || []).map((row: any) => row.checkout_session_id),
    );

    const { data: existingPasses } = await admin
      .from("passes")
      .select("checkout_session_id")
      .in("checkout_session_id", sessionIds);

    const existingSessionIds = new Set(
      (existingPasses || [])
        .map((p: any) => p.checkout_session_id)
        .filter((v: unknown): v is string => typeof v === "string" && v.length > 0)
    );

    const inserts: any[] = [];
    for (const sessionId of sessionIds) {
      if (existingSessionIds.has(sessionId)) continue;
      if (blockedSessionIds.has(sessionId)) continue;

      const sessionSummary = sessionsById.get(sessionId);
      if (!sessionSummary) continue;

      let session: Stripe.Checkout.Session;
      try {
        session = await stripe.checkout.sessions.retrieve(sessionId, {
          expand: [...STRIPE_CHECKOUT_SESSION_EXPAND],
        });
      } catch (err: any) {
        logWarn({
          msg: "billing.restore.session_lookup_failed",
          stripe: { session_id: hashForLogs(sessionId) },
          outcome: "provider_error",
          err: { name: err?.name || "StripeError", message: err?.message || "Failed to retrieve checkout session" }
        });
        continue;
      }

      if (!isCheckoutPaymentSettled(session.payment_status)) continue;

      const validation = validateStripeCheckoutSession(session);
      if (!validation.ok) {
        logWarn({
          msg: "billing.restore.session_rejected",
          stripe: { session_id: hashForLogs(sessionId) },
          outcome: "validation_error",
          err: { name: "UnapprovedCheckoutSession", message: validation.reason }
        });
        continue;
      }

      const storedTier = toStoredPassTier(validation.offer.tier);

      let subscriptionId: string | null = null;
      let subscriptionPeriodEndUnix: number | null = null;
      if (session.mode === "subscription") {
        subscriptionId = typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id || null;
        if (!subscriptionId) continue;

        try {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          if (subscription.status !== "active" && subscription.status !== "trialing") {
            continue;
          }
          subscriptionPeriodEndUnix = getSubscriptionPeriodEndUnix(subscription, validation.offer);
        } catch {
          continue;
        }

        if (!subscriptionPeriodEndUnix || subscriptionPeriodEndUnix * 1000 <= Date.now()) continue;
      }

      if (storedTier === "monthly" && session.mode !== "subscription") continue;

      const paymentIntentId = paymentIntentIdForSession(session);
      if (paymentIntentId) {
        try {
          const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
            expand: ["latest_charge"],
          });
          const latestCharge = paymentIntent.latest_charge;
          if (
            latestCharge &&
            typeof latestCharge !== "string" &&
            (latestCharge.refunded || latestCharge.disputed)
          ) {
            continue;
          }
        } catch {
          // Restoration must fail closed when reversal state cannot be checked.
          continue;
        }
      }

      const { usesRemaining, expiresAt, purchasedAt } = getTierDefaultsForCheckout(
        storedTier,
        session,
        subscriptionPeriodEndUnix,
      );
      if (Date.parse(expiresAt) <= Date.now()) continue;
      inserts.push({
        id: crypto.randomUUID(),
        user_id: user.id,
        tier: storedTier,
        uses_remaining: usesRemaining,
        purchased_at: purchasedAt,
        expires_at: expiresAt,
        price_id: validation.offer.priceId,
        stripe_subscription_id: subscriptionId,
        checkout_session_id: sessionId,
        stripe_payment_intent_id: paymentIntentId,
        stripe_customer_id: stripeId(session.customer),
        created_at: new Date().toISOString()
      });
    }

    let restored = 0;
    for (const pass of inserts) {
      const { error: insertError } = await admin.from("passes").insert(pass);
      if (insertError) {
        // The webhook or another restore request may have won the unique
        // checkout-session race. That is a successful idempotent outcome.
        if (insertError.code === "23505") continue;
        logError({
          msg: "billing.restore.insert_failed",
          supabase: { table: "passes", op: "insert", error_code: insertError.code },
          outcome: "provider_error",
          err: { name: "SupabaseError", message: insertError.message }
        });
        return NextResponse.json(
          { ok: false, restored: 0, message: "Could not restore your purchases. Try again or contact support." },
          { status: 500 }
        );
      }
      restored += 1;
    }

    const { data: updatedPasses } = await admin
      .from("passes")
      .select("id, tier, uses_remaining, expires_at, revoked_at")
      .eq("user_id", user.id);
    const activeAfter = (updatedPasses || []).filter((pass: any) => isPassActive(pass)).length;

    return NextResponse.json({
      ok: true,
      restored,
      active_before: activeBefore,
      active_after: activeAfter,
      message: restored > 0
        ? "Access restored successfully."
        : activeAfter > 0
          ? "Access is already active."
          : "No additional purchases were found to restore."
    });
  } catch (err: any) {
    logError({
      msg: "billing.restore.failed",
      outcome: "provider_error",
      err: { name: err?.name || "BillingRestoreError", message: err?.message || "Failed to restore access" }
    });
    return NextResponse.json(
      { ok: false, restored: 0, message: "Could not restore your purchases. Try again or contact support." },
      { status: 500 }
    );
  }
}
