import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseAdminClient } from "@/lib/supabase/adminClient";

const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-11-17.clover" })
    : null;

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    try {
        if (!stripe) {
            return NextResponse.json({ ok: false, message: "Payments are not configured yet." }, { status: 500 });
        }

        const body = await req.json();
        const sessionId = body?.sessionId;
        if (!sessionId || typeof sessionId !== "string") {
            return NextResponse.json({ ok: false, message: "Missing sessionId" }, { status: 400 });
        }

        const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
        const status = checkoutSession.status;

        if (status !== "complete" && status !== "open") {
            return NextResponse.json({ ok: false, status, message: "Session not successful" }, { status: 400 });
        }

        const supabaseAdmin = createSupabaseAdminClient();
        if (!supabaseAdmin) {
            return NextResponse.json(
                { ok: false, status, message: "Database not configured" },
                { status: 500 }
            );
        }

        const { data, error } = await supabaseAdmin
            .from("passes")
            .select("id")
            .eq("checkout_session_id", sessionId)
            .limit(1)
            .maybeSingle();

        if (error) {
            console.error("[BILLING_CONFIRM_ERROR]", error);
            return NextResponse.json({ ok: false, status, message: "Failed to confirm purchase" }, { status: 500 });
        }

        return NextResponse.json({
            ok: Boolean(data?.id),
            status,
            passFound: Boolean(data?.id)
        });
    } catch (error: any) {
        console.error("[BILLING_CONFIRM_ERROR]", error);
        return NextResponse.json({ ok: false, message: "Internal error" }, { status: 500 });
    }
}
