import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseAdminClient } from "@/lib/supabase/adminClient";
import {
  getTierDefaults,
  isPassActive,
  resolveRequestedTierFromSession,
  toStoredPassTier
} from "@/lib/billing/entitlements";
import { buildConfirmResponse, type UnlockConfirmResponse } from "@/lib/billing/unlockStateMachine";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-11-17.clover" })
  : null;

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

async function ensurePassForCheckoutSession(
  admin: any,
  session: Stripe.Checkout.Session
) {
  const existing = await admin
    .from("passes")
    .select("id, tier, uses_remaining, expires_at")
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

  const requestedTier = resolveRequestedTierFromSession({
    metadataTier: session.metadata?.tier,
    passTier: session.metadata?.pass_tier,
    mode: session.mode,
  });
  const storedTier = toStoredPassTier(requestedTier);

  let subscriptionId: string | null = null;
  let subscriptionPeriodEndUnix: number | null = null;
  if (typeof session.subscription === "string" && session.subscription) {
    subscriptionId = session.subscription;
    try {
      const subscription = await stripe!.subscriptions.retrieve(subscriptionId);
      subscriptionPeriodEndUnix = extractCurrentPeriodEndUnix(subscription);
    } catch {
      // Best-effort; defaults below.
    }
  }

  const { usesRemaining, expiresAt } = getTierDefaults(storedTier, { subscriptionPeriodEndUnix });
  const passId = crypto.randomUUID();

  const { error: insertError } = await admin.from("passes").insert({
    id: passId,
    user_id: userId,
    tier: storedTier,
    uses_remaining: usesRemaining,
    purchased_at: new Date().toISOString(),
    expires_at: expiresAt,
    price_id: subscriptionId,
    checkout_session_id: session.id,
    created_at: new Date().toISOString(),
  });

  if (insertError) {
    const fallback = await admin
      .from("passes")
      .select("id, tier, uses_remaining, expires_at")
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
  try {
    if (!stripe) {
      return response(
        buildConfirmResponse({
          state: "not_paid",
          message: "Payments are not configured yet.",
          pending: false,
        }),
        500
      );
    }

    const body = await req.json();
    const sessionId = typeof body?.sessionId === "string" ? body.sessionId.trim() : "";
    if (!sessionId) {
      return response(
        buildConfirmResponse({
          state: "checkout_incomplete",
          message: "Missing sessionId.",
          pending: false,
        }),
        400
      );
    }

    let checkoutSession: Stripe.Checkout.Session;
    try {
      checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
    } catch (err: any) {
      const invalidRequest =
        err instanceof Stripe.errors.StripeInvalidRequestError ||
        err?.type === "StripeInvalidRequestError";

      if (invalidRequest) {
        return response(
          buildConfirmResponse({
            state: "checkout_incomplete",
            message: "Checkout session not found.",
            pending: false,
          }),
          404
        );
      }

      throw err;
    }
    const status = checkoutSession.status || null;

    if (status !== "complete") {
      return response(
        buildConfirmResponse({
          state: "checkout_incomplete",
          status,
        }),
        409
      );
    }

    if (checkoutSession.payment_status !== "paid") {
      return response(
        buildConfirmResponse({
          state: "not_paid",
          status,
        }),
        409
      );
    }

    const supabaseAdmin = createSupabaseAdminClient();
    if (!supabaseAdmin) {
      return response(
        buildConfirmResponse({
          state: "fulfillment_pending",
          status,
          message: "Database is not configured.",
        }),
        500
      );
    }

    const { data, error } = await supabaseAdmin
      .from("passes")
      .select("id, tier, uses_remaining, expires_at")
      .eq("checkout_session_id", sessionId)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("[billing.confirm] query failed:", error.message);
      return response(
        buildConfirmResponse({
          state: "fulfillment_pending",
          status,
        }),
        202
      );
    }

    const pass = data?.id ? data : await ensurePassForCheckoutSession(supabaseAdmin, checkoutSession);

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
    console.error("[billing.confirm] error:", error?.message);
    return response(
      buildConfirmResponse({
        state: "fulfillment_pending",
      }),
      202
    );
  }
}
