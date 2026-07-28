import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/serverClient";
import { hashForLogs, logError, logInfo, logWarn } from "@/lib/observability/logger";
import { getRequestId, routeLabel } from "@/lib/observability/requestContext";
import { rateLimitAsync } from "@/lib/security/rateLimit";
import { readJsonWithLimit } from "@/lib/security/requestBody";
import {
    getTierLabel,
    normalizeRequestedTier,
    toStoredPassTier
} from "@/lib/billing/entitlements";
import { getOrSetCache } from "@/lib/redis/idempotency";
import { isLaunchFlagEnabled } from "@/lib/launch/flags";
import { getAppUrlForRequest } from "@/lib/runtime/appUrl";
import { createStripeClient } from "@/lib/billing/stripeClient";
import { getLaunchStripeOffer } from "@/lib/billing/stripeOffers";
import { areNewPurchasesDisabled } from "@/lib/launch/serverFlags";

// Initialize Stripe
const stripe = createStripeClient();

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

async function findReusableCustomerId(email: string, userId: string): Promise<string | null> {
    if (!stripe) return null;
    const customers = await stripe.customers.list({ email: email.toLowerCase(), limit: 10 });
    const matching = customers.data.find((customer) => (
        !customer.deleted &&
        customer.metadata?.riyp_app === "recruiter-in-your-pocket" &&
        customer.metadata?.riyp_user_id === userId
    ));
    return matching?.id || null;
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

    if (!isLaunchFlagEnabled("billingUnlock") || areNewPurchasesDisabled()) {
        const res = NextResponse.json({ ok: false, message: "Purchases are temporarily unavailable." }, { status: 503 });
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

        if (requestedTier !== "30d") {
            const res = NextResponse.json(
                { ok: false, message: "That offer is no longer available. Choose the Job Search Pass instead." },
                { status: 400 }
            );
            res.headers.set("x-request-id", request_id);
            return res;
        }

        // Check if user is already logged in (optional). If so, bind purchase to that account email.
        let userId: string | null = null;
        let checkoutEmail: string | undefined = undefined;
        try {
            const supabase = await createSupabaseServerClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                userId = user.id;
                checkoutEmail = user.email || undefined;
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

        const launchOffer = getLaunchStripeOffer();

        if (!launchOffer) {
            logError({
                msg: "checkout.invalid_price_id",
                request_id,
                route,
                method,
                path,
                outcome: "internal_error",
                err: {
                    name: "ConfigError",
                    message: "The canonical Job Search Pass price/product pair is incomplete",
                    code: "STRIPE_OFFER_CATALOG_INCOMPLETE"
                }
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

        const baseUrl = getAppUrlForRequest(request);
        const reusableCustomerId = userId && checkoutEmail
            ? await findReusableCustomerId(checkoutEmail, userId)
            : null;

        const mode = "payment" as const;
        const successUrl = new URL(`${baseUrl}/purchase/confirmed`);
        successUrl.searchParams.set("session_id", "{CHECKOUT_SESSION_ID}");
        successUrl.searchParams.set("tier", requestedTier);
        successUrl.searchParams.set("source", checkoutSource);
        if (unlockSection) {
            successUrl.searchParams.set("unlock", unlockSection);
        }
        // Stripe replaces this token only when the braces are left literal.
        // URLSearchParams percent-encodes them, which sends customers back with
        // the text "{CHECKOUT_SESSION_ID}" instead of the completed session ID.
        const stripeSuccessUrl = successUrl
            .toString()
            .replace("%7BCHECKOUT_SESSION_ID%7D", "{CHECKOUT_SESSION_ID}");

        const createCheckoutSession = async () => {
            const checkoutSession = await stripe.checkout.sessions.create({
                mode,
                line_items: [
                    {
                        price: launchOffer.priceId,
                        quantity: 1
                    }
                ],
                ...(reusableCustomerId
                    ? { customer: reusableCustomerId }
                    : {
                        ...(checkoutEmail ? { customer_email: checkoutEmail } : {}),
                        customer_creation: "always" as const,
                    }),
                billing_address_collection: "required",
                automatic_tax: { enabled: true },
                success_url: stripeSuccessUrl,
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
                invoice_creation: { enabled: true },
                allow_promotion_codes: true,
                custom_text: {
                    submit: {
                        message: "You're getting five additional reports for 30 days. This is a one-time payment and will not renew."
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
            user_id: userId ? hashForLogs(userId) : undefined
        });
        return res;

    } catch (err: any) {
        const status = err?.httpStatus === 413 ? 413 : err?.httpStatus === 400 ? 400 : 500;
        logError({
            msg: "http.request.completed",
            request_id,
            route,
            method,
            path,
            status,
            latency_ms: Date.now() - startedAt,
            outcome: "internal_error",
            err: { name: err?.name || "Error", message: err?.message || "Checkout failed", stack: err?.stack }
        });
        const res = NextResponse.json(
            {
                ok: false,
                message: status === 413
                    ? "Checkout request is too large."
                    : status === 400
                        ? "Checkout request is invalid."
                        : "Checkout could not be started. Try again shortly."
            },
            { status }
        );
        res.headers.set("x-request-id", request_id);
        return res;
    }
}
