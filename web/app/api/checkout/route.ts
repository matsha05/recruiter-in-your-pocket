import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseServerClient } from "@/lib/supabase/serverClient";

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-11-17.clover" })
    : null;

const PRICE_IDS = {
    "24h": process.env.STRIPE_PRICE_ID_24H || process.env.STRIPE_PRICE_ID,
    "30d": process.env.STRIPE_PRICE_ID_30D
};

// Base URL for redirects
const getBaseUrl = () => {
    if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    // Next dev server default
    return "http://localhost:3000";
};

export async function POST(request: Request) {
    // Guard: Stripe must be configured
    if (!stripe) {
        console.error("[checkout] STRIPE_SECRET_KEY not set");
        return NextResponse.json(
            { ok: false, message: "Payments are not configured yet." },
            { status: 500 }
        );
    }

    try {
        const body = await request.json();
        const { tier, email } = body;

        // Email is required for checkout
        if (!email || typeof email !== "string") {
            return NextResponse.json(
                { ok: false, message: "Email is required." },
                { status: 400 }
            );
        }

        // Determine tier
        const selectedTier = tier === "30d" ? "30d" : "24h";
        const priceId = PRICE_IDS[selectedTier];

        if (!priceId) {
            console.error(`[checkout] No price ID for tier: ${selectedTier}`);
            return NextResponse.json(
                { ok: false, message: "Invalid pass tier." },
                { status: 400 }
            );
        }

        const tierLabel = selectedTier === "30d" ? "30-Day Campaign Pass" : "24-Hour Fix Pass";
        const baseUrl = getBaseUrl();

        // Check if user is already logged in (optional)
        let userId = null;
        try {
            const supabase = await createSupabaseServerClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                userId = session.user.id;
            }
        } catch {
            // Ignore - user will be created in webhook
        }

        // Create Stripe checkout session
        // Name will be collected by Stripe in the checkout form
        const checkoutSession = await stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            line_items: [
                {
                    price: priceId,
                    quantity: 1
                }
            ],
            customer_email: email.trim(),
            // Collect billing name in checkout
            billing_address_collection: "required",
            success_url: `${baseUrl}/workspace?payment=success&tier=${selectedTier}`,
            cancel_url: `${baseUrl}/workspace?payment=cancelled`,
            metadata: {
                email: email.trim(),
                tier: selectedTier,
                tier_label: tierLabel,
                user_id: userId || ""
            },
            allow_promotion_codes: true,
            custom_text: {
                submit: {
                    message: `You're getting the ${tierLabel}. Unlimited resume reviews await!`
                }
            }
        });

        console.log(`[checkout] Created session for ${email}, tier: ${selectedTier}`);

        return NextResponse.json({
            ok: true,
            url: checkoutSession.url,
            sessionId: checkoutSession.id
        });

    } catch (err: any) {
        console.error("[checkout] Error:", err?.message);
        return NextResponse.json(
            { ok: false, message: err?.message || "Checkout failed" },
            { status: 500 }
        );
    }
}
