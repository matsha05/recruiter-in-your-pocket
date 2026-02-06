import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseAdminClient } from "@/lib/supabase/adminClient";
import { isPassActive } from "@/lib/billing/entitlements";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-11-17.clover" })
  : null;

export const runtime = "nodejs";

type ConfirmResponse = {
  ok: boolean;
  state: "unlocked" | "fulfillment_pending" | "checkout_incomplete" | "not_paid";
  pending?: boolean;
  status?: string | null;
  message: string;
  pass?: {
    id: string;
    tier: string | null;
    expires_at: string | null;
    uses_remaining: number | null;
    active: boolean;
  };
};

function response(body: ConfirmResponse, status: number) {
  return NextResponse.json(body, { status });
}

export async function POST(req: NextRequest) {
  try {
    if (!stripe) {
      return response(
        {
          ok: false,
          state: "not_paid",
          message: "Payments are not configured yet."
        },
        500
      );
    }

    const body = await req.json();
    const sessionId = typeof body?.sessionId === "string" ? body.sessionId.trim() : "";
    if (!sessionId) {
      return response(
        {
          ok: false,
          state: "checkout_incomplete",
          message: "Missing sessionId."
        },
        400
      );
    }

    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
    const status = checkoutSession.status || null;

    if (status !== "complete") {
      return response(
        {
          ok: false,
          state: "checkout_incomplete",
          status,
          message: "Checkout is not complete yet."
        },
        409
      );
    }

    if (checkoutSession.payment_status !== "paid") {
      return response(
        {
          ok: false,
          state: "not_paid",
          status,
          message: "Payment is not marked as paid yet."
        },
        409
      );
    }

    const supabaseAdmin = createSupabaseAdminClient();
    if (!supabaseAdmin) {
      return response(
        {
          ok: false,
          state: "fulfillment_pending",
          pending: true,
          status,
          message: "Database is not configured."
        },
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
        {
          ok: false,
          state: "fulfillment_pending",
          pending: true,
          status,
          message: "Payment received. Finalizing access..."
        },
        202
      );
    }

    if (!data?.id) {
      return response(
        {
          ok: false,
          state: "fulfillment_pending",
          pending: true,
          status,
          message: "Payment received. Finalizing access..."
        },
        202
      );
    }

    return response(
      {
        ok: true,
        state: "unlocked",
        status,
        message: "Access unlocked.",
        pass: {
          id: data.id,
          tier: data.tier ?? null,
          expires_at: data.expires_at ?? null,
          uses_remaining: typeof data.uses_remaining === "number" ? data.uses_remaining : null,
          active: isPassActive(data as any)
        }
      },
      200
    );
  } catch (error: any) {
    console.error("[billing.confirm] error:", error?.message);
    return response(
      {
        ok: false,
        state: "fulfillment_pending",
        pending: true,
        message: "Payment received. Finalizing access..."
      },
      202
    );
  }
}
