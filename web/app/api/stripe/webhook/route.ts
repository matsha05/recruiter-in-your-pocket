import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseAdminClient } from "@/lib/supabase/adminClient";
import { logError, logInfo, logWarn } from "@/lib/observability/logger";
import { getRequestId, routeLabel } from "@/lib/observability/requestContext";
import { readTextWithLimit } from "@/lib/security/requestBody";
import {
    toStoredPassTier,
} from "@/lib/billing/entitlements";
import {
    getTierDefaultsForCheckout,
    isCheckoutPaymentSettled,
    paymentIntentIdForSession,
    stripeId,
} from "@/lib/billing/checkoutFulfillment";
import { createStripeClient } from "@/lib/billing/stripeClient";
import {
    STRIPE_CHECKOUT_SESSION_EXPAND,
    isUnrelatedStripeCheckout,
    validateStripeCheckoutSession,
    type ApprovedStripeOffer,
} from "@/lib/billing/stripeOffers";
import {
    claimStripeEvent,
    completeStripeEvent,
    failStripeEvent,
    rejectStripeEvent,
} from "@/lib/billing/stripeEventLease";

const stripe = createStripeClient();

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export const runtime = "nodejs";

type UserResolutionContext = {
    request_id: string;
    route: string;
    method: string;
    path: string;
};

function getEmailFromCheckoutSession(session: Stripe.Checkout.Session): string | null {
    const metadataEmail = session.metadata?.email;
    if (metadataEmail && typeof metadataEmail === "string") return metadataEmail.toLowerCase();

    const customerEmail = session.customer_details?.email || session.customer_email;
    if (customerEmail && typeof customerEmail === "string") return customerEmail.toLowerCase();

    return null;
}

function toIsoFromUnix(value: unknown): string | null {
    if (typeof value === "number" && Number.isFinite(value)) {
        return new Date(value * 1000).toISOString();
    }
    return null;
}

function extractInvoicePeriod(invoice: Stripe.Invoice): { start: string | null; end: string | null } {
    const fromInvoiceStart = toIsoFromUnix((invoice as any).period_start);
    const fromInvoiceEnd = toIsoFromUnix((invoice as any).period_end);

    if (fromInvoiceStart || fromInvoiceEnd) {
        return { start: fromInvoiceStart, end: fromInvoiceEnd };
    }

    const firstLine = invoice.lines?.data?.[0];
    return {
        start: toIsoFromUnix(firstLine?.period?.start),
        end: toIsoFromUnix(firstLine?.period?.end),
    };
}

function extractCurrentPeriodEndUnix(
    subscription:
        | Stripe.Subscription
        | Stripe.Response<Stripe.Subscription>
        | null
        | undefined
): number | null {
    const fromDirect = (subscription as any)?.current_period_end;
    if (typeof fromDirect === "number") return fromDirect;

    const fromData = (subscription as any)?.data?.current_period_end;
    if (typeof fromData === "number") return fromData;

    return null;
}

function asStripeObjectRecord(value: unknown): Record<string, unknown> {
    return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

function stringOrNull(value: unknown): string | null {
    return typeof value === "string" ? value : null;
}

function numberOrNull(value: unknown): number | null {
    return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function buildStripeEventAuditPayload(event: Stripe.Event): Record<string, unknown> {
    const object = asStripeObjectRecord(event.data.object);

    return {
        event_api_version: event.api_version ?? null,
        livemode: event.livemode,
        object: stringOrNull(object.object),
        object_id: stringOrNull(object.id),
        object_created: numberOrNull(object.created),
        amount_total: numberOrNull(object.amount_total),
        amount_paid: numberOrNull(object.amount_paid),
        currency: stringOrNull(object.currency),
        mode: stringOrNull(object.mode),
        status: stringOrNull(object.status),
        payment_status: stringOrNull(object.payment_status),
        customer: stringOrNull(object.customer),
        subscription: stringOrNull(object.subscription),
        invoice: stringOrNull(object.invoice),
        payment_intent: stringOrNull(object.payment_intent),
    };
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

async function resolveUserIdForInvoice(
    admin: any,
    invoice: Stripe.Invoice,
    context: UserResolutionContext
): Promise<string | null> {
    let email = invoice.customer_email?.toLowerCase() || null;

    if (!email && typeof invoice.customer === "string" && invoice.customer) {
        try {
            const customer = await stripe!.customers.retrieve(invoice.customer);
            if (!("deleted" in customer) && typeof customer.email === "string") {
                email = customer.email.toLowerCase();
            }
        } catch (err: any) {
            logWarn({
                msg: "stripe.webhook.invoice_customer_lookup_failed",
                request_id: context.request_id,
                route: context.route,
                method: context.method,
                path: context.path,
                outcome: "provider_error",
                stripe: { invoice_id: invoice.id },
                err: { name: err?.name || "Error", message: err?.message || "Could not resolve invoice customer" }
            });
        }
    }

    if (!email) return null;
    return findUserIdByEmail(admin, email);
}

async function upsertBillingReceipt(
    admin: any,
    invoice: Stripe.Invoice,
    context: UserResolutionContext,
    knownUserId?: string,
    knownCheckoutSessionId?: string
) {
    const userId = knownUserId || await resolveUserIdForInvoice(admin, invoice, context);
    if (!userId) {
        logWarn({
            msg: "stripe.webhook.invoice_user_not_resolved",
            request_id: context.request_id,
            route: context.route,
            method: context.method,
            path: context.path,
            outcome: "validation_error",
            stripe: { invoice_id: invoice.id, event_type: context.route }
        });
        return;
    }

    const period = extractInvoicePeriod(invoice);

    const payload = {
        user_id: userId,
        stripe_invoice_id: invoice.id,
        stripe_customer_id: typeof invoice.customer === "string" ? invoice.customer : null,
        checkout_session_id: knownCheckoutSessionId || (invoice as any).checkout_session || null,
        invoice_number: invoice.number || null,
        status: invoice.status || null,
        currency: invoice.currency || null,
        amount_paid: typeof invoice.amount_paid === "number" ? invoice.amount_paid : 0,
        hosted_invoice_url: invoice.hosted_invoice_url || null,
        invoice_pdf: invoice.invoice_pdf || null,
        period_start: period.start,
        period_end: period.end,
        created_at: new Date(invoice.created * 1000).toISOString(),
        updated_at: new Date().toISOString(),
    };

    const { error } = await admin
        .from("billing_receipts")
        .upsert(payload, { onConflict: "stripe_invoice_id" });

    if (error) {
        throw new Error(`Failed to upsert billing receipt: ${error.message}`);
    }
}

async function findOrCreateUserId(
    admin: any,
    email: string,
    metadataUserId: string | null,
    context: UserResolutionContext
): Promise<{ userId: string; wasCreated: boolean }> {
    if (metadataUserId) {
        return { userId: metadataUserId, wasCreated: false };
    }

    const existingUserId = await findUserIdByEmail(admin, email);
    if (existingUserId) return { userId: existingUserId, wasCreated: false };

    const { data: newUser, error: createError } = await admin.auth.admin.createUser({
        email,
        email_confirm: true
    });

    if (!createError && newUser?.user?.id) {
        return { userId: newUser.user.id, wasCreated: true };
    }

    // Handle race: user created by another process between list and create.
    const fallbackUserId = await findUserIdByEmail(admin, email);
    if (fallbackUserId) {
        return { userId: fallbackUserId, wasCreated: false };
    }

    logError({
        msg: "stripe.webhook.user_resolution_failed",
        request_id: context.request_id,
        route: context.route,
        method: context.method,
        path: context.path,
        outcome: "provider_error",
        err: { name: "SupabaseError", message: createError?.message || "Failed to resolve user" }
    });

    throw new Error("Could not find or create user");
}

async function maybeSendOtp(admin: any, email: string, context: UserResolutionContext) {
    const { error } = await admin.auth.signInWithOtp({ email: email.toLowerCase() });
    if (error) {
        logWarn({
            msg: "stripe.webhook.otp_send_failed",
            request_id: context.request_id,
            route: context.route,
            method: context.method,
            path: context.path,
            outcome: "provider_error",
            err: { name: "OtpError", message: error.message }
        });
        return;
    }

    logInfo({
        msg: "stripe.webhook.otp_sent",
        request_id: context.request_id,
        route: context.route,
        method: context.method,
        path: context.path,
        outcome: "success"
    });
}

async function upsertPassForCheckout(
    admin: any,
    session: Stripe.Checkout.Session,
    userId: string,
    offer: ApprovedStripeOffer,
    context: UserResolutionContext
): Promise<void> {
    const storedTier = toStoredPassTier(offer.tier);
    const paymentIntentId = paymentIntentIdForSession(session);
    const customerId = stripeId(session.customer);

    const { data: entitlementBlock, error: entitlementBlockError } = await admin
        .from("billing_entitlement_blocks")
        .select("checkout_session_id, reason")
        .eq("checkout_session_id", session.id)
        .maybeSingle();

    if (entitlementBlockError) throw entitlementBlockError;
    if (entitlementBlock?.checkout_session_id) {
        throw new Error(`Checkout entitlement is blocked: ${entitlementBlock.reason || "reversed"}`);
    }

    let subscriptionId: string | null = null;
    let subscriptionPeriodEndUnix: number | null = null;

    if (typeof session.subscription === "string" && session.subscription) {
        subscriptionId = session.subscription;
        try {
            const subscription = await stripe!.subscriptions.retrieve(subscriptionId);
            subscriptionPeriodEndUnix = extractCurrentPeriodEndUnix(subscription);
        } catch (err: any) {
            logWarn({
                msg: "stripe.webhook.subscription_lookup_failed",
                request_id: context.request_id,
                route: context.route,
                method: context.method,
                path: context.path,
                outcome: "provider_error",
                stripe: { session_id: session.id },
                err: { name: err?.name || "Error", message: err?.message || "Failed to load subscription" }
            });
        }
    }

    const { usesRemaining, expiresAt, purchasedAt } = getTierDefaultsForCheckout(
        storedTier,
        session,
        subscriptionPeriodEndUnix,
    );

    // 1) Idempotency by checkout session id.
    const { data: existingBySession } = await admin
        .from("passes")
        .select("id")
        .eq("checkout_session_id", session.id)
        .limit(1)
        .maybeSingle();

    if (existingBySession?.id) {
        logInfo({
            msg: "stripe.webhook.pass_already_exists_for_session",
            request_id: context.request_id,
            route: context.route,
            method: context.method,
            path: context.path,
            outcome: "success",
            user_id: userId,
            stripe: { session_id: session.id }
        });
        return;
    }

    // 2) For subscription plans, update existing pass for the same subscription if present.
    if (subscriptionId) {
        const { data: existingSubPass } = await admin
            .from("passes")
            .select("id")
            .eq("user_id", userId)
            .eq("stripe_subscription_id", subscriptionId)
            .limit(1)
            .maybeSingle();

        if (existingSubPass?.id) {
            const { error: updateError } = await admin
                .from("passes")
                .update({
                    tier: storedTier,
                    uses_remaining: usesRemaining,
                    expires_at: expiresAt,
                    price_id: offer.priceId,
                    stripe_subscription_id: subscriptionId,
                    checkout_session_id: session.id,
                    stripe_payment_intent_id: paymentIntentId,
                    stripe_customer_id: customerId,
                    revoked_at: null,
                    revocation_reason: null
                })
                .eq("id", existingSubPass.id);

            if (updateError) throw updateError;
            return;
        }
    }

    const passId = crypto.randomUUID();
    const { error: insertError } = await admin
        .from("passes")
        .insert({
            id: passId,
            user_id: userId,
            tier: storedTier,
            uses_remaining: usesRemaining,
            purchased_at: purchasedAt,
            expires_at: expiresAt,
            price_id: offer.priceId,
            stripe_subscription_id: subscriptionId,
            checkout_session_id: session.id,
            stripe_payment_intent_id: paymentIntentId,
            stripe_customer_id: customerId,
            created_at: new Date().toISOString()
        });

    if (insertError) throw insertError;

    logInfo({
        msg: "stripe.webhook.pass_created",
        request_id: context.request_id,
        route: context.route,
        method: context.method,
        path: context.path,
        outcome: "success",
        user_id: userId,
        stripe: { session_id: session.id }
    });
}

async function linkStripeCustomerToUser(
    session: Stripe.Checkout.Session,
    userId: string,
    context: UserResolutionContext,
) {
    const customerId = stripeId(session.customer);
    if (!customerId) return;

    try {
        await stripe!.customers.update(customerId, {
            metadata: {
                riyp_app: "recruiter-in-your-pocket",
                riyp_user_id: userId,
            },
        });
    } catch (err: any) {
        logWarn({
            msg: "stripe.webhook.customer_link_failed",
            request_id: context.request_id,
            route: context.route,
            method: context.method,
            path: context.path,
            outcome: "provider_error",
            stripe: { customer_id: customerId },
            err: { name: err?.name || "StripeError", message: err?.message || "Could not link customer" },
        });
    }
}

async function paymentIntentIdForReversal(object: Record<string, unknown>): Promise<string | null> {
    const direct = stripeId(object.payment_intent);
    if (direct) return direct;

    const chargeId = stripeId(object.charge) || (object.object === "charge" ? stripeId(object.id) : null);
    if (!chargeId) return null;

    const charge = await stripe!.charges.retrieve(chargeId);
    return stripeId(charge.payment_intent);
}

async function revokeEntitlementForReversal(
    admin: any,
    object: Record<string, unknown>,
    reason: "refund" | "dispute",
) {
    const paymentIntentId = await paymentIntentIdForReversal(object);
    if (!paymentIntentId) throw new Error("Reversal did not identify a payment intent");

    const { data: localPasses, error: localPassesError } = await admin
        .from("passes")
        .select("checkout_session_id")
        .eq("stripe_payment_intent_id", paymentIntentId);
    if (localPassesError) throw localPassesError;

    const sessionIds = new Set<string>(
        (localPasses || [])
            .map((pass: any) => pass.checkout_session_id)
            .filter((id: unknown): id is string => typeof id === "string" && id.startsWith("cs_")),
    );

    const sessions = await stripe!.checkout.sessions.list({ payment_intent: paymentIntentId, limit: 100 });
    for (const session of sessions.data) sessionIds.add(session.id);
    if (sessionIds.size === 0) throw new Error("Reversal did not identify a checkout session");

    const now = new Date().toISOString();
    const blockRows = [...sessionIds].map(checkoutSessionId => ({
        checkout_session_id: checkoutSessionId,
        stripe_payment_intent_id: paymentIntentId,
        reason,
        updated_at: now,
    }));
    const { error: blockError } = await admin
        .from("billing_entitlement_blocks")
        .upsert(blockRows, { onConflict: "checkout_session_id" });
    if (blockError) throw blockError;

    const revocationPatch = {
        uses_remaining: 0,
        expires_at: now,
        revoked_at: now,
        revocation_reason: reason,
        updated_at: now,
    };
    const byIntent = await admin
        .from("passes")
        .update(revocationPatch)
        .eq("stripe_payment_intent_id", paymentIntentId);
    if (byIntent.error) throw byIntent.error;

    const bySession = await admin
        .from("passes")
        .update(revocationPatch)
        .in("checkout_session_id", [...sessionIds]);
    if (bySession.error) throw bySession.error;
}

async function syncSubscriptionStatus(
    admin: any,
    subscription: Stripe.Subscription,
    context: UserResolutionContext,
    eventType: string
) {
    const subscriptionId = subscription.id;
    const isActive = subscription.status === "active" || subscription.status === "trialing" || subscription.status === "past_due";
    const subscriptionPeriodEndUnix = extractCurrentPeriodEndUnix(subscription);
    const fallbackActiveExpiry = new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString();
    const expiresAt = isActive
        ? (subscriptionPeriodEndUnix ? new Date(subscriptionPeriodEndUnix * 1000).toISOString() : fallbackActiveExpiry)
        : new Date().toISOString();

    const { error } = await admin
        .from("passes")
        .update({
            expires_at: expiresAt,
            uses_remaining: isActive ? 9_999 : 0
        })
        .eq("stripe_subscription_id", subscriptionId)
        .eq("tier", "monthly");

    if (error) {
        throw error;
    }

    logInfo({
        msg: "stripe.webhook.subscription_synced",
        request_id: context.request_id,
        route: context.route,
        method: context.method,
        path: context.path,
        outcome: "success",
        stripe: { event_type: eventType }
    });
}

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

    let body: string;
    try {
        body = await readTextWithLimit(request, 512 * 1024);
    } catch (err: any) {
        const status = err?.httpStatus === 413 ? 413 : 400;
        logWarn({
            msg: "stripe.webhook.payload_rejected",
            request_id,
            route,
            method,
            path,
            outcome: "validation_error",
            http: { body_bytes: Number(request.headers.get("content-length") || 0) || undefined }
        });
        return new NextResponse(
            status === 413 ? "Payload too large" : "Invalid payload",
            { status, headers: { "x-request-id": request_id } }
        );
    }
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

    let claim;
    try {
        claim = await claimStripeEvent(supabaseAdmin as any, {
            eventId: event.id,
            eventType: event.type,
            payload: buildStripeEventAuditPayload(event),
            requestId: request_id,
        });
    } catch (err: any) {
        logError({
            msg: "stripe.webhook.idempotency_failed",
            request_id,
            route,
            method,
            path,
            outcome: "internal_error",
            stripe: { event_id: event.id, event_type: event.type },
            err: { name: err?.name || "Error", message: err?.message || "Could not claim event" }
        });
        return new NextResponse("Processing Error", { status: 500, headers: { "x-request-id": request_id } });
    }

    if (!claim.claimed || !claim.leaseToken) {
        logInfo({
            msg: "stripe.webhook.event_already_processed",
            request_id,
            route,
            outcome: "success",
            stripe: { event_id: event.id, event_type: event.type },
            feature: `stripe_event_claim:${claim.reason}`
        });
        return NextResponse.json({ received: true }, { headers: { "x-request-id": request_id } });
    }

    const leaseToken = claim.leaseToken;

    const context: UserResolutionContext = { request_id, route, method, path };

    try {
        if (
            event.type === "checkout.session.completed" ||
            event.type === "checkout.session.async_payment_succeeded"
        ) {
            const eventSession = event.data.object as Stripe.Checkout.Session;
            const session = await stripe.checkout.sessions.retrieve(eventSession.id, {
                expand: [...STRIPE_CHECKOUT_SESSION_EXPAND],
            });
            const validation = validateStripeCheckoutSession(session);

            if (!validation.ok) {
                if (isUnrelatedStripeCheckout(validation)) {
                    await rejectStripeEvent(
                        supabaseAdmin as any,
                        event.id,
                        leaseToken,
                        validation.reason
                    );
                    logWarn({
                        msg: "stripe.webhook.checkout_rejected",
                        request_id,
                        route,
                        method,
                        path,
                        outcome: "validation_error",
                        feature: `checkout_validation:${validation.reason}`,
                        stripe: { event_id: event.id, event_type: event.type, session_id: session.id }
                    });
                    return NextResponse.json(
                        { received: true },
                        { headers: { "x-request-id": request_id } }
                    );
                }

                throw new Error(`Checkout session validation failed: ${validation.reason}`);
            }

            if (!isCheckoutPaymentSettled(session.payment_status)) {
                logInfo({
                    msg: "stripe.webhook.checkout_not_paid",
                    request_id,
                    route,
                    method,
                    path,
                    outcome: "success",
                    stripe: { event_id: event.id, event_type: event.type, session_id: session.id }
                });
            } else {
                const email = getEmailFromCheckoutSession(session);

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
                    throw new Error("No email found for completed checkout session");
                }

                const { userId, wasCreated } = await findOrCreateUserId(
                    supabaseAdmin,
                    email,
                    session.metadata?.user_id || null,
                    context
                );

                if (wasCreated) {
                    await maybeSendOtp(supabaseAdmin, email, context);
                }

                await upsertPassForCheckout(
                    supabaseAdmin,
                    session,
                    userId,
                    validation.offer,
                    context
                );
                await linkStripeCustomerToUser(session, userId, context);

                // Invoice events can arrive before checkout.session.completed.
                // At that point the checkout email may not have an RIYP user yet,
                // so reconcile the one-time receipt again after user creation.
                if (session.invoice) {
                    const invoice = typeof session.invoice === "string"
                        ? await stripe.invoices.retrieve(session.invoice)
                        : session.invoice;
                    await upsertBillingReceipt(supabaseAdmin, invoice, context, userId, session.id);
                }
            }
        }

        if (event.type === "checkout.session.async_payment_failed") {
            const session = event.data.object as Stripe.Checkout.Session;
            logWarn({
                msg: "stripe.webhook.checkout_async_payment_failed",
                request_id,
                route,
                method,
                path,
                outcome: "provider_error",
                stripe: { event_id: event.id, event_type: event.type, session_id: session.id }
            });
        }

        if (event.type === "refund.created" || event.type === "charge.refunded") {
            await revokeEntitlementForReversal(
                supabaseAdmin,
                asStripeObjectRecord(event.data.object),
                "refund",
            );
        }

        if (event.type === "charge.dispute.created") {
            await revokeEntitlementForReversal(
                supabaseAdmin,
                asStripeObjectRecord(event.data.object),
                "dispute",
            );
        }

        if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
            const subscription = event.data.object as Stripe.Subscription;
            await syncSubscriptionStatus(supabaseAdmin, subscription, context, event.type);
        }

        if (
            event.type === "invoice.finalized" ||
            event.type === "invoice.paid" ||
            event.type === "invoice.payment_failed" ||
            event.type === "invoice.voided" ||
            event.type === "invoice.marked_uncollectible"
        ) {
            const invoice = event.data.object as Stripe.Invoice;
            await upsertBillingReceipt(supabaseAdmin, invoice, context);
        }

        await completeStripeEvent(supabaseAdmin as any, event.id, leaseToken);

        logInfo({
            msg: "stripe.webhook.completed",
            request_id,
            route,
            method,
            path,
            latency_ms: Date.now() - startedAt,
            outcome: "success",
            stripe: { event_id: event.id, event_type: event.type }
        });
    } catch (err: any) {
        try {
            await failStripeEvent(supabaseAdmin as any, event.id, leaseToken, err);
        } catch (stateError: any) {
            logWarn({
                msg: "stripe.webhook.failure_state_write_failed",
                request_id,
                route,
                method,
                path,
                outcome: "internal_error",
                stripe: { event_id: event.id, event_type: event.type },
                err: { name: stateError?.name || "Error", message: stateError?.message || "Could not record failure" }
            });
        }
        logError({
            msg: "stripe.webhook.fulfillment.failed",
            request_id,
            route,
            method,
            path,
            latency_ms: Date.now() - startedAt,
            outcome: "internal_error",
            stripe: { event_id: event.id, event_type: event.type },
            err: { name: err?.name || "Error", message: err?.message || "Webhook processing failed", stack: err?.stack }
        });
        return new NextResponse("Processing Error", { status: 500, headers: { "x-request-id": request_id } });
    }

    return NextResponse.json({ received: true }, { headers: { "x-request-id": request_id } });
}
