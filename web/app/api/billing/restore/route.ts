import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseServerClient } from "@/lib/supabase/serverClient";
import { createSupabaseAdminClient } from "@/lib/supabase/adminClient";
import {
  getTierDefaults,
  isPassActive,
  normalizeRequestedTier,
  toStoredPassTier,
  type RequestedPricingTier
} from "@/lib/billing/entitlements";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-11-17.clover" })
  : null;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function inferRequestedTier(session: Stripe.Checkout.Session): RequestedPricingTier {
  const metadataTier = normalizeRequestedTier(session.metadata?.tier);
  if (metadataTier) return metadataTier;

  const passTierRaw = String(session.metadata?.pass_tier || "").trim().toLowerCase();
  if (passTierRaw === "monthly") return "monthly";
  if (passTierRaw === "lifetime") return "lifetime";
  if (passTierRaw === "30d") return "30d";
  if (passTierRaw === "90d") return "90d";
  if (passTierRaw === "single_use") return "24h";

  // Current payment-mode default is lifetime unless explicit legacy metadata says otherwise.
  return session.mode === "subscription" ? "monthly" : "lifetime";
}

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
        console.warn("[billing.restore] failed to list sessions for customer", customer.id, err?.message);
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

      const session = sessionsById.get(sessionId);
      if (!session) continue;

      const requestedTier = inferRequestedTier(session);
      const storedTier = toStoredPassTier(requestedTier);

      let subscriptionId: string | null = null;
      let subscriptionPeriodEndUnix: number | null = null;
      if (typeof session.subscription === "string" && session.subscription) {
        subscriptionId = session.subscription;
        try {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          subscriptionPeriodEndUnix = extractCurrentPeriodEndUnix(subscription);
        } catch {
          // Best-effort; fallback defaults below.
        }
      }

      const { usesRemaining, expiresAt } = getTierDefaults(storedTier, { subscriptionPeriodEndUnix });
      inserts.push({
        id: crypto.randomUUID(),
        user_id: user.id,
        tier: storedTier,
        uses_remaining: usesRemaining,
        purchased_at: new Date().toISOString(),
        expires_at: expiresAt,
        price_id: subscriptionId,
        checkout_session_id: sessionId,
        created_at: new Date().toISOString()
      });
    }

    if (inserts.length > 0) {
      const { error: insertError } = await admin.from("passes").insert(inserts);
      if (insertError) {
        console.error("[billing.restore] insert failed:", insertError.message);
        return NextResponse.json(
          { ok: false, restored: 0, message: "Failed to restore purchases." },
          { status: 500 }
        );
      }
    }

    const { data: updatedPasses } = await admin
      .from("passes")
      .select("id, tier, uses_remaining, expires_at")
      .eq("user_id", user.id);
    const activeAfter = (updatedPasses || []).filter((pass: any) => isPassActive(pass)).length;

    return NextResponse.json({
      ok: true,
      restored: inserts.length,
      active_before: activeBefore,
      active_after: activeAfter,
      message: inserts.length > 0
        ? "Access restored successfully."
        : activeAfter > 0
          ? "Access is already active."
          : "No additional purchases were found to restore."
    });
  } catch (err: any) {
    console.error("[billing.restore] error:", err?.message);
    return NextResponse.json(
      { ok: false, restored: 0, message: "Failed to restore access." },
      { status: 500 }
    );
  }
}
