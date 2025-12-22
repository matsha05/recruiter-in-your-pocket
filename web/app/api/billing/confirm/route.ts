import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Stripe } from "stripe";
import { db } from "@/lib/db"; // Assuming standard db import

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-11-17.clover" as any,
});

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const { sessionId } = await req.json();

        if (!sessionId) {
            return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
        }

        // 1. Retrieve the checkout session from Stripe
        const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

        if (checkoutSession.status !== "complete" && checkoutSession.status !== "open") {
            return NextResponse.json({ error: "Session not successful" }, { status: 400 });
        }

        // 2. We don't manually update entitlements here because the webhook handles it.
        // Instead, we just check if they ARE updated yet.
        // This confirms the webhook processed or allows the client to poll.

        if (!session?.user?.email) {
            // Unauthenticated user - they might have just signed up during checkout
            // We should still return OK if the session is complete
            return NextResponse.json({
                ok: true,
                status: checkoutSession.status,
                requiresAuth: true
            });
        }

        // Check DB for updated credits/membership
        const user = await db.user.findUnique({
            where: { email: session.user.email },
            select: { membership: true, credits: true }
        });

        // If user is now 'audit' or has credits, confirming the purchase worked
        const isPaid = user?.membership === 'audit' || (user?.credits ?? 0) > 0;

        return NextResponse.json({
            ok: true,
            status: checkoutSession.status,
            isPaid,
            credits: user?.credits ?? 0
        });

    } catch (error: any) {
        console.error("[BILLING_CONFIRM_ERROR]", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
