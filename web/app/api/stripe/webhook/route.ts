import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-11-17.clover" })
    : null;

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// Supabase admin client (bypasses RLS for writes)
const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        { auth: { persistSession: false } }
    )
    : null;

// Disable body parser - Stripe requires raw body
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
    if (!stripe || !WEBHOOK_SECRET) {
        console.error("[webhook] Stripe or webhook secret not configured");
        return new NextResponse("Webhook not configured", { status: 400 });
    }

    if (!supabaseAdmin) {
        console.error("[webhook] Supabase admin client not configured");
        return new NextResponse("Database not configured", { status: 500 });
    }

    // Get raw body and signature
    const body = await request.text();
    const sig = request.headers.get("stripe-signature");

    if (!sig) {
        console.error("[webhook] Missing stripe-signature header");
        return new NextResponse("Missing signature", { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET);
    } catch (err: any) {
        console.error("[webhook] Signature verification failed:", err.message);
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    // Handle checkout.session.completed
    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata || {};
        const email = metadata.email || session.customer_email;
        const tier = metadata.tier || "24h";
        const metadataUserId = metadata.user_id || null;

        console.log(`[webhook] checkout.session.completed for ${email}, tier: ${tier}`);

        if (!email) {
            console.error("[webhook] No email in session");
            return new NextResponse("No email found", { status: 400 });
        }

        try {
            // Find or create user by email
            let userId = metadataUserId;

            if (!userId) {
                // Look up user by email in Supabase auth
                const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();

                if (!listError && users.users) {
                    const existingUser = users.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
                    if (existingUser) {
                        userId = existingUser.id;
                    }
                }
            }

            if (!userId) {
                // Create user via Supabase Auth
                const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
                    email: email.toLowerCase(),
                    email_confirm: true
                });

                if (createError) {
                    // If user already exists, try to find them again
                    console.log("[webhook] User creation failed, trying lookup:", createError.message);
                    const { data: users } = await supabaseAdmin.auth.admin.listUsers();
                    const existingUser = users?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());
                    if (existingUser) {
                        userId = existingUser.id;
                    }
                } else if (newUser?.user) {
                    userId = newUser.user.id;
                    console.log(`[webhook] Created new user: ${userId}`);

                    // Trigger login code email so they can access their account
                    const { error: otpError } = await supabaseAdmin.auth.signInWithOtp({
                        email: email.toLowerCase()
                    });

                    if (otpError) {
                        console.error("[webhook] Failed to send login code:", otpError.message);
                    } else {
                        console.log(`[webhook] Sent login code to ${email}`);
                    }
                }
            }

            if (!userId) {
                throw new Error("Could not find or create user");
            }

            // Update user's first name from billing if not set
            const customerDetails = session.customer_details;
            if (customerDetails?.name) {
                const firstName = customerDetails.name.split(" ")[0];
                const { data: existingUser } = await supabaseAdmin.auth.admin.getUserById(userId);

                if (existingUser?.user && !existingUser.user.user_metadata?.first_name) {
                    await supabaseAdmin.auth.admin.updateUserById(userId, {
                        user_metadata: {
                            ...existingUser.user.user_metadata,
                            first_name: firstName
                        }
                    });
                    console.log(`[webhook] Updated user first_name: ${firstName}`);
                }
            }

            // Calculate expiration
            const nowMs = Date.now();
            const expiresAt = tier === "30d"
                ? new Date(nowMs + 30 * 24 * 60 * 60 * 1000).toISOString()
                : new Date(nowMs + 24 * 60 * 60 * 1000).toISOString();

            // Create pass in database
            const passId = crypto.randomUUID();
            const { error: passError } = await supabaseAdmin
                .from("passes")
                .insert({
                    id: passId,
                    user_id: userId,
                    tier: tier,
                    purchased_at: new Date().toISOString(),
                    expires_at: expiresAt,
                    price_id: null,
                    checkout_session_id: session.id,
                    created_at: new Date().toISOString()
                });

            if (passError) {
                console.error("[webhook] Failed to create pass:", passError.message);
                throw passError;
            }

            console.log(`[webhook] Pass created for user ${userId}, tier: ${tier}, expires: ${expiresAt}`);

        } catch (err: any) {
            console.error("[webhook] Error processing webhook:", err.message);
            return new NextResponse(`Processing Error: ${err.message}`, { status: 500 });
        }
    }

    return NextResponse.json({ received: true });
}
