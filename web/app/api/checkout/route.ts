import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseServerClient } from "@/lib/supabase/serverClient";
import { hashForLogs, logError, logInfo, logWarn } from "@/lib/observability/logger";
import { getRequestId, routeLabel } from "@/lib/observability/requestContext";
import { rateLimitAsync } from "@/lib/security/rateLimit";
import { readJsonWithLimit } from "@/lib/security/requestBody";
import {
    getCheckoutModeForTier,
    getTierLabel,
    normalizeRequestedTier,
    toStoredPassTier
} from "@/lib/billing/entitlements";
import { getOrSetCache } from "@/lib/redis/idempotency";

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-11-17.clover" })
    : null;

// Pricing tiers: monthly subscription ($9) and lifetime one-time ($79)
const PRICE_IDS = {
    "monthly": process.env.STRIPE_PRICE_ID_MONTHLY || "price_MONTHLY_PLACEHOLDER",
    "lifetime": process.env.STRIPE_PRICE_ID_LIFETIME || "price_LIFETIME_PLACEHOLDER",
    // Legacy one-time pricing (deprecated, kept for existing purchases)
    "24h": process.env.STRIPE_PRICE_ID_24H || "price_1SeJLJK3nCOONJJ0g2JncGeY",
    "30d": process.env.STRIPE_PRICE_ID_30D || "price_1SeJLsK3nCOONJJ0mrQIVesj",
};

const getBaseUrl = () => {
    if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return "http://localhost:3000";
}

type CheckoutSource = "landing" | "pricing" | "paywall" | "settings" | "workspace" | "unknown";
type UnlockSection = "evidence_ledger" | "bullet_upgrades" | "missing_wins" | "job_alignment" | "export_pdf";

function normalizeCheckoutSource(input: unknown): CheckoutSource {
    if (typeof input !== "string") return "unknown";
    const normalized = input.trim().toLowerCase();
    if (
        normalized === "landing" ||
        normalized === "pricing" ||
        normalized === "paywall" ||
        normalized === "settings" ||
        normalized === "workspace"
    ) {
        return normalized;
    }
    return "unknown";
}

function getCancelUrl(baseUrl: string, source: CheckoutSource): string {
    if (source === "settings") return `${baseUrl}/settings/billing?payment=cancelled`;
    if (source === "paywall" || source === "workspace") return `${baseUrl}/workspace?payment=cancelled`;
    return `${baseUrl}/pricing?payment=cancelled`;
}

function isValidEmail(email: unknown): email is string {
    if (typeof email !== "string") return false;
    const trimmed = email.trim();
    if (!trimmed || trimmed.length > 320) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

function normalizeUnlockSection(input: unknown): UnlockSection | null {
    if (typeof input !== "string") return null;
    const trimmed = input.trim().toLowerCase();
    const allowed: UnlockSection[] = [
        "evidence_ledger",
        "bullet_upgrades",
        "missing_wins",
        "job_alignment",
        "export_pdf"
    ];
    return allowed.includes(trimmed as UnlockSection) ? (trimmed as UnlockSection) : null;
}

export async function POST(request: Request) {
    const request_id = getRequestId(request);
    const { method, path } = routeLabel(request);
    const route = `${method} ${path}`;
    const startedAt = Date.now();
    logInfo({ msg: "http.request.started", request_id, route, method, path });

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rl = await rateLimitAsync(`ip:${hashForLogs(ip)}:${path}`, 10, 60_000);
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
        const requestedTier = normalizeRequestedTier(body?.tier);
        const checkoutSource = normalizeCheckoutSource(body?.source);
        const idempotencyKey = typeof body?.idempotencyKey === "string"
            ? body.idempotencyKey.trim().slice(0, 200)
            : null;
        const unlockSection = normalizeUnlockSection(body?.unlockSection);
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
        let checkoutEmail: string | undefined = undefined;
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

        if (!checkoutEmail && body?.email != null && !isValidEmail(body?.email)) {
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

        if (!checkoutEmail && isValidEmail(body?.email)) {
            checkoutEmail = body.email.trim();
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

        const tierLabel = getTierLabel(requestedTier);
        const storedTier = toStoredPassTier(requestedTier);

        const baseUrl = getBaseUrl();

        const mode = getCheckoutModeForTier(requestedTier);
        const isSubscription = mode === "subscription";
        const successUrl = new URL(`${baseUrl}/purchase/confirmed`);
        successUrl.searchParams.set("session_id", "{CHECKOUT_SESSION_ID}");
        successUrl.searchParams.set("tier", requestedTier);
        successUrl.searchParams.set("source", checkoutSource);
        if (unlockSection) {
            successUrl.searchParams.set("unlock", unlockSection);
        }

        const createCheckoutSession = async () => {
            const checkoutSession = await stripe.checkout.sessions.create({
                mode,
                payment_method_types: ["card"],
                line_items: [
                    {
                        price: priceId,
                        quantity: 1
                    }
                ],
                ...(checkoutEmail ? { customer_email: checkoutEmail } : {}),
                billing_address_collection: "required",
                success_url: successUrl.toString(),
                cancel_url: getCancelUrl(baseUrl, checkoutSource),
                metadata: {
                    email: checkoutEmail || "",
                    tier: requestedTier,
                    pass_tier: storedTier,
                    tier_label: tierLabel,
                    user_id: userId || "",
                    source: checkoutSource,
                    unlock_section: unlockSection || ""
                },
                ...(isSubscription
                    ? {}
                    : {
                        invoice_creation: { enabled: true as const }
                    }),
                allow_promotion_codes: true,
                custom_text: {
                    submit: {
                        message: requestedTier === "lifetime"
                            ? `You're getting Lifetime Access. Pay once, use forever.`
                            : isSubscription
                                ? `You're subscribing to ${tierLabel}. Cancel anytime.`
                                : `You're getting ${tierLabel}. We'll activate it right after checkout.`
                    }
                }
            }, idempotencyKey ? { idempotencyKey: `checkout:${idempotencyKey}` } : undefined);

            return {
                id: checkoutSession.id,
                url: checkoutSession.url,
            };
        };

        const dedupeIdentity = hashForLogs(`${userId || "guest"}:${checkoutEmail || "no-email"}`);
        const dedupeKey = idempotencyKey
            ? `checkout:${idempotencyKey}:${requestedTier}:${checkoutSource}:${dedupeIdentity}`
            : null;

        const checkoutSession = dedupeKey
            ? (await getOrSetCache(dedupeKey, createCheckoutSession, 60 * 15)).value
            : await createCheckoutSession();

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
            sessionId: checkoutSession.id,
            checkoutIntent: {
                tier: requestedTier,
                mode,
                source: checkoutSource
            }
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
