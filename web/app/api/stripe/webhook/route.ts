import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseAdminClient } from "@/lib/supabase/adminClient";
import { logError, logInfo } from "@/lib/observability/logger";
import { getRequestId, routeLabel } from "@/lib/observability/requestContext";

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-11-17.clover" })
    : null;

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

function normalizeTier(input: unknown): "24h" | "30d" | "90d" {
    if (typeof input !== "string") return "24h";
    const raw = input.trim();
    if (raw === "single") return "24h";
    if (raw === "pack") return "30d";
    if (raw === "24h" || raw === "30d" || raw === "90d") return raw;
    return "24h";
}

// Disable body parser - Stripe requires raw body
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
    const request_id = getRequestId(request);
    const { method, path } = routeLabel(request);
    const route = `${method} ${path}`;
    const startedAt = Date.now();

    if (!stripe || !WEBHOOK_SECRET) {
        logError({
            msg: "stripe.webhook.config_missing",
            request_id,
            route,
            method,
            path,
            outcome: "internal_error",
            err: { name: "ConfigError", message: "Stripe or webhook secret not configured" }
        });
        return new NextResponse("Webhook not configured", { status: 400, headers: { "x-request-id": request_id } });
    }

    const supabaseAdmin = createSupabaseAdminClient();
    if (!supabaseAdmin) {
        logError({
            msg: "stripe.webhook.supabase_admin_missing",
            request_id,
            route,
            method,
            path,
            outcome: "internal_error",
            err: { name: "ConfigError", message: "Supabase admin client not configured" }
        });
        return new NextResponse("Database not configured", { status: 500, headers: { "x-request-id": request_id } });
    }

    // Get raw body and signature
    const body = await request.text();
    const sig = request.headers.get("stripe-signature");

    if (!sig) {
        logError({
            msg: "stripe.webhook.missing_signature",
            request_id,
            route,
            method,
            path,
            outcome: "validation_error"
        });
        return new NextResponse("Missing signature", { status: 400, headers: { "x-request-id": request_id } });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET);
    } catch (err: any) {
        logError({
            msg: "stripe.webhook.signature_invalid",
            request_id,
            route,
            method,
            path,
            outcome: "validation_error",
            err: { name: err?.name || "Error", message: err?.message || "Signature verification failed" }
        });
        return new NextResponse("Webhook signature invalid", { status: 400, headers: { "x-request-id": request_id } });
    }

    // Handle checkout.session.completed
    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata || {};
        const email = metadata.email || session.customer_email;
        const tier = normalizeTier(metadata.tier);
        const metadataUserId = metadata.user_id || null;

        logInfo({
            msg: "stripe.webhook.verified",
            request_id,
            route,
            method,
            path,
            outcome: "success",
            stripe: { event_id: event.id, event_type: event.type, session_id: session.id }
        });

        if (!email) {
            logError({
                msg: "stripe.webhook.missing_email",
                request_id,
                route,
                method,
                path,
                outcome: "validation_error",
                stripe: { event_id: event.id, event_type: event.type, session_id: session.id }
            });
            return new NextResponse("No email found", { status: 400, headers: { "x-request-id": request_id } });
        }

        try {
            // Idempotency: if we've already created a pass for this checkout session, exit cleanly.
            const { data: existing } = await supabaseAdmin
                .from("passes")
                .select("id")
                .eq("checkout_session_id", session.id)
                .limit(1)
                .maybeSingle();
            if (existing?.id) {
                logInfo({
                    msg: "stripe.webhook.idempotent_replay",
                    request_id,
                    route,
                    method,
                    path,
                    outcome: "success",
                    stripe: { event_id: event.id, event_type: event.type, session_id: session.id }
                });
                return NextResponse.json({ received: true }, { headers: { "x-request-id": request_id } });
            }

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
                    logInfo({
                        msg: "stripe.webhook.user_created",
                        request_id,
                        route,
                        method,
                        path,
                        outcome: "success",
                        stripe: { event_id: event.id, event_type: event.type, session_id: session.id }
                    });

                    // Trigger login code email so they can access their account
                    const { error: otpError } = await supabaseAdmin.auth.signInWithOtp({
                        email: email.toLowerCase()
                    });

                    if (otpError) {
                        logError({
                            msg: "stripe.webhook.otp_send_failed",
                            request_id,
                            route,
                            method,
                            path,
                            outcome: "provider_error",
                            err: { name: "OtpError", message: otpError.message }
                        });
                    } else {
                        logInfo({
                            msg: "stripe.webhook.otp_sent",
                            request_id,
                            route,
                            method,
                            path,
                            outcome: "success"
                        });
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
            // If tier is '24h', we convert it to 'single_use' in the database with 1 year expiry
            // Logic: It stays valid until used (enforced by the streaming endpoint)
            const dbTier = tier === "24h" ? "single_use" : tier;
            const nowMs = Date.now();
            const expiresAt = tier === "30d"
                ? new Date(nowMs + 30 * 24 * 60 * 60 * 1000).toISOString()
                : new Date(nowMs + 365 * 24 * 60 * 60 * 1000).toISOString(); // 1 Year for single use

            // Create pass in database
            const passId = crypto.randomUUID();
            const { error: passError } = await supabaseAdmin
                .from("passes")
                .insert({
                    id: passId,
                    user_id: userId,
                    tier: dbTier,
                    purchased_at: new Date().toISOString(),
                    expires_at: expiresAt,
                    price_id: null,
                    checkout_session_id: session.id,
                    created_at: new Date().toISOString()
                });

            if (passError) {
                logError({
                    msg: "stripe.webhook.pass_insert_failed",
                    request_id,
                    route,
                    method,
                    path,
                    outcome: "provider_error",
                    stripe: { event_id: event.id, event_type: event.type, session_id: session.id },
                    err: { name: "SupabaseError", message: passError.message }
                });
                throw passError;
            }

            logInfo({
                msg: "stripe.webhook.fulfillment.completed",
                request_id,
                route,
                method,
                path,
                latency_ms: Date.now() - startedAt,
                outcome: "success",
                user_id: userId,
                stripe: { event_id: event.id, event_type: event.type, session_id: session.id }
            });

        } catch (err: any) {
            logError({
                msg: "stripe.webhook.fulfillment.failed",
                request_id,
                route,
                method,
                path,
                latency_ms: Date.now() - startedAt,
                outcome: "internal_error",
                stripe: { event_id: event.id, event_type: event.type, session_id: (event.data.object as any)?.id },
                err: { name: err?.name || "Error", message: err?.message || "Webhook processing failed", stack: err?.stack }
            });
            return new NextResponse("Processing Error", { status: 500, headers: { "x-request-id": request_id } });
        }
    }

    return NextResponse.json({ received: true }, { headers: { "x-request-id": request_id } });
}
