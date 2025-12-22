import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseServerClient } from "@/lib/supabase/serverClient";
import { hashForLogs, logError, logInfo, logWarn } from "@/lib/observability/logger";
import { getRequestId, routeLabel } from "@/lib/observability/requestContext";
import { rateLimit } from "@/lib/security/rateLimit";
import { readJsonWithLimit } from "@/lib/security/requestBody";

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-11-17.clover" })
    : null;

const PRICE_IDS = {
    "24h": process.env.STRIPE_PRICE_ID_24H || "price_1SeJLJK3nCOONJJ0g2JncGeY",
    "30d": process.env.STRIPE_PRICE_ID_30D || "price_1SeJLsK3nCOONJJ0mrQIVesj",
    "90d": process.env.STRIPE_PRICE_ID_90D || "price_MISSING_90D_ID"
};

const getBaseUrl = () => {
    if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return "http://localhost:3000";
};

function normalizeTier(input: unknown): "24h" | "30d" | "90d" | null {
    if (typeof input !== "string") return null;
    const raw = input.trim();
    if (raw === "single") return "24h";
    if (raw === "pack") return "30d";
    if (raw === "24h" || raw === "30d" || raw === "90d") return raw;
    return null;
}

function isValidEmail(email: unknown): email is string {
    if (typeof email !== "string") return false;
    const trimmed = email.trim();
    if (!trimmed || trimmed.length > 320) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

export async function POST(request: Request) {
    const request_id = getRequestId(request);
    const { method, path } = routeLabel(request);
    const route = `${method} ${path}`;
    const startedAt = Date.now();
    logInfo({ msg: "http.request.started", request_id, route, method, path });

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rl = rateLimit(`ip:${hashForLogs(ip)}:${path}`, 10, 60_000);
    if (!rl.ok) {
        const res = NextResponse.json({ ok: false, message: "Too many requests. Try again shortly." }, { status: 429 });
        res.headers.set("x-request-id", request_id);
        res.headers.set("retry-after", String(Math.ceil(rl.resetMs / 1000)));
        logWarn({
            msg: "http.request.completed",
            request_id,
            route,
            method,
            path,
            status: 429,
            latency_ms: Date.now() - startedAt,
            outcome: "rate_limited"
        });
        return res;
    }

    if (!stripe) {
        logError({
            msg: "http.request.completed",
            request_id,
            route,
            method,
            path,
            status: 500,
            latency_ms: Date.now() - startedAt,
            outcome: "internal_error",
            err: { name: "ConfigError", message: "STRIPE_SECRET_KEY not set", code: "STRIPE_SECRET_KEY_MISSING" }
        });
        const res = NextResponse.json({ ok: false, message: "Payments are not configured yet." }, { status: 500 });
        res.headers.set("x-request-id", request_id);
        return res;
    }

    try {
        const body = await readJsonWithLimit<any>(request, 64 * 1024);
        const requestedTier = normalizeTier(body?.tier);
        if (!requestedTier) {
            const res = NextResponse.json({ ok: false, message: "Invalid plan selection." }, { status: 400 });
            res.headers.set("x-request-id", request_id);
            logInfo({
                msg: "http.request.completed",
                request_id,
                route,
                method,
                path,
                status: 400,
                latency_ms: Date.now() - startedAt,
                outcome: "validation_error"
            });
            return res;
        }

        // Check if user is already logged in (optional). If so, bind purchase to that account email.
        let userId: string | null = null;
        let checkoutEmail: string | undefined;
        try {
            const supabase = await createSupabaseServerClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                userId = session.user.id;
                checkoutEmail = session.user.email || undefined;
            }
        } catch {
            // Ignore - user will be created/linked in webhook
        }

        if (!checkoutEmail) {
            if (!isValidEmail(body?.email)) {
                const res = NextResponse.json({ ok: false, message: "A valid email is required." }, { status: 400 });
                res.headers.set("x-request-id", request_id);
                logInfo({
                    msg: "http.request.completed",
                    request_id,
                    route,
                    method,
                    path,
                    status: 400,
                    latency_ms: Date.now() - startedAt,
                    outcome: "validation_error"
                });
                return res;
            }
            checkoutEmail = body.email.trim();
        }
        if (!checkoutEmail) {
            const res = NextResponse.json({ ok: false, message: "A valid email is required." }, { status: 400 });
            res.headers.set("x-request-id", request_id);
            logInfo({
                msg: "http.request.completed",
                request_id,
                route,
                method,
                path,
                status: 400,
                latency_ms: Date.now() - startedAt,
                outcome: "validation_error"
            });
            return res;
        }

        const priceId = PRICE_IDS[requestedTier as keyof typeof PRICE_IDS];

        if (!priceId || priceId.includes("MISSING")) {
            logError({
                msg: "checkout.invalid_price_id",
                request_id,
                route,
                method,
                path,
                outcome: "internal_error",
                err: { name: "ConfigError", message: `Missing price ID for tier ${requestedTier}`, code: "STRIPE_PRICE_ID_MISSING" }
            });
            const res = NextResponse.json(
                { ok: false, message: "This plan is currently unavailable." },
                { status: 400 }
            );
            res.headers.set("x-request-id", request_id);
            return res;
        }

        const tierLabel =
            requestedTier === "90d" ? "Executive Membership (Quarterly)" :
                requestedTier === "30d" ? "Active Job Search" :
                    "Quick Check";

        const baseUrl = getBaseUrl();

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
            customer_email: checkoutEmail,
            // Collect billing name in checkout
            billing_address_collection: "required",
            success_url: `${baseUrl}/workspace?payment=success&tier=${requestedTier}`,
            cancel_url: `${baseUrl}/workspace?payment=cancelled`,
            metadata: {
                email: checkoutEmail,
                tier: requestedTier,
                tier_label: tierLabel,
                user_id: userId || ""
            },
            allow_promotion_codes: true,
            custom_text: {
                submit: {
                    message: `You're getting the ${tierLabel}. We'll activate it in your studio right after checkout.`
                }
            }
        });

        logInfo({
            msg: "checkout.session.created",
            request_id,
            route,
            method,
            path,
            outcome: "success",
            stripe: { session_id: checkoutSession.id },
            http: { body_bytes: Number(request.headers.get("content-length") || 0) || undefined }
        });

        const res = NextResponse.json({
            ok: true,
            url: checkoutSession.url,
            sessionId: checkoutSession.id
        });
        res.headers.set("x-request-id", request_id);
        logInfo({
            msg: "http.request.completed",
            request_id,
            route,
            method,
            path,
            status: 200,
            latency_ms: Date.now() - startedAt,
            outcome: "success",
            user_id: userId || undefined
        });
        return res;

    } catch (err: any) {
        logError({
            msg: "http.request.completed",
            request_id,
            route,
            method,
            path,
            status: 500,
            latency_ms: Date.now() - startedAt,
            outcome: "internal_error",
            err: { name: err?.name || "Error", message: err?.message || "Checkout failed", stack: err?.stack }
        });
        const res = NextResponse.json(
            { ok: false, message: err?.message || "Checkout failed" },
            { status: 500 }
        );
        res.headers.set("x-request-id", request_id);
        return res;
    }
}
