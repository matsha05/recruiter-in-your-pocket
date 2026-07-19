import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseServerClient } from "@/lib/supabase/serverClient";
import { createSupabaseAdminClient } from "@/lib/supabase/adminClient";
import {
  getTierDefaults,
  isPassActive,
  toStoredPassTier
} from "@/lib/billing/entitlements";
import { isLaunchFlagEnabled } from "@/lib/launch/flags";
import { hashForLogs, logError, logWarn } from "@/lib/observability/logger";
import { createStripeClient } from "@/lib/billing/stripeClient";
import {
  STRIPE_CHECKOUT_SESSION_EXPAND,
  getLaunchStripeOffer,
  validateStripeCheckoutSession,
} from "@/lib/billing/stripeOffers";

const stripe = createStripeClient();

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function extractCurrentPeriodEndUnix(
  subscription:
    | Stripe.Subscription
    | Stripe.Response<Stripe.Subscription>
    | null
    | undefined
): number | null {
  const direct = (subscription as any)?.current_period_end;
  if (typeof direct === "number") return direct;

  const wrapped = (subscription as any)?.data?.current_period_end;
  if (typeof wrapped === "number") return wrapped;

  return null;
}

export async function POST() {
  try {
    if (!isLaunchFlagEnabled("billingUnlock")) {
      return NextResponse.json(
        { ok: false, restored: 0, message: "Billing restore is temporarily unavailable." },
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

    const admin = createSupabaseAdminClient();
    if (!admin) {
      return NextResponse.json(
        { ok: false, restored: 0, message: "Database is not configured." },
        { status: 500 }
      );
    }

    if (!stripe) {
      return NextResponse.json(
        { ok: false, restored: 0, message: "Payments are not configured yet." },
        { status: 500 }
      );
    }

    if (!getLaunchStripeOffer()) {
      return NextResponse.json(
        { ok: false, restored: 0, message: "The billing offer catalog is not configured." },
        { status: 500 }
      );
    }

    const { data: existingForUser, error: existingError } = await admin
      .from("passes")
      .select("id, tier, uses_remaining, expires_at")
      .eq("user_id", user.id);

    if (existingError) {
      return NextResponse.json(
        { ok: false, restored: 0, message: "Failed to load existing access." },
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
        message: "No billing account found for this email."
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
        message: "No completed purchases found to restore."
      });
    }

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

      if (session.payment_status !== "paid") continue;

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
          subscriptionPeriodEndUnix = extractCurrentPeriodEndUnix(subscription);
        } catch {
          continue;
        }

        if (!subscriptionPeriodEndUnix || subscriptionPeriodEndUnix * 1000 <= Date.now()) continue;
      }

      if (storedTier === "monthly" && session.mode !== "subscription") continue;

      const { usesRemaining, expiresAt } = getTierDefaults(storedTier, { subscriptionPeriodEndUnix });
      inserts.push({
        id: crypto.randomUUID(),
        user_id: user.id,
        tier: storedTier,
        uses_remaining: usesRemaining,
        purchased_at: new Date().toISOString(),
        expires_at: expiresAt,
        price_id: validation.offer.priceId,
        stripe_subscription_id: subscriptionId,
        checkout_session_id: sessionId,
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
          { ok: false, restored: 0, message: "Failed to restore purchases." },
          { status: 500 }
        );
      }
      restored += 1;
    }

    const { data: updatedPasses } = await admin
      .from("passes")
      .select("id, tier, uses_remaining, expires_at")
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
      { ok: false, restored: 0, message: "Failed to restore access." },
      { status: 500 }
    );
  }
}
