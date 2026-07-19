import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseServerClient } from "@/lib/supabase/serverClient";
import { createSupabaseAdminClient } from "@/lib/supabase/adminClient";
import { logInfo, logError, logWarn } from "@/lib/observability/logger";
import { getRequestId, routeLabel } from "@/lib/observability/requestContext";
import { createStripeClient } from "@/lib/billing/stripeClient";
import {
    buildAuthDeletionPendingResponse,
    buildIncompleteAccountDeletionResponse,
    type AccountDeletionRecord,
} from "@/lib/backend/accountDeletion";

const stripe = createStripeClient();

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function shouldIgnoreMissingTable(error: { message?: string } | null | undefined) {
    if (!error?.message) return false;
    return error.message.includes("does not exist") || error.message.includes("relation");
}

function shouldIgnoreMissingUserIdColumn(error: { message?: string } | null | undefined) {
    if (!error?.message) return false;
    const message = error.message.toLowerCase();
    return (
        message.includes("user_id") &&
        (message.includes("does not exist") || message.includes("could not find")) &&
        (message.includes("column") || message.includes("schema cache"))
    );
}

function throwDeletionError(table: string, error: { message?: string } | null | undefined): never {
    throw new Error(`Failed to delete ${table}: ${error?.message || "Unknown database error"}`);
}

function shouldCancelSubscription(status: Stripe.Subscription.Status) {
    return status !== "canceled" && status !== "incomplete_expired";
}

async function cancelActiveSubscriptions(subscriptionIds: string[]) {
    if (!stripe) {
        throw new Error("Stripe is not configured to cancel an active subscription");
    }

    const subscriptions = new Map<string, Stripe.Subscription>();

    for (const subscriptionId of subscriptionIds) {
        if (!subscriptions.has(subscriptionId)) {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            subscriptions.set(subscription.id, subscription);
        }
    }

    let canceled = 0;
    for (const subscription of subscriptions.values()) {
        if (!shouldCancelSubscription(subscription.status)) continue;
        await stripe.subscriptions.cancel(subscription.id);
        canceled += 1;
    }

    return canceled;
}

/**
 * DELETE /api/account/delete
 * 
 * User Account Deletion (RT-011: Data Retention Truth)
 * 
 * Deletes all user data per the Data Handling Truth Table:
 * - All reports (analysis results, score history)
 * - All saved_jobs (extension job descriptions)
 * - All artifacts (case-related data)
 * - User record
 * 
 * Does NOT delete:
 * - Payment records (legal requirement - handled by Stripe)
 */
export async function DELETE(request: Request) {
    const request_id = getRequestId(request);
    const { method, path } = routeLabel(request);
    const startedAt = Date.now();

    logInfo({ msg: "http.request.started", request_id, route: `${method} ${path}`, method, path });

    try {
        // Get authenticated user
        const supabase = await createSupabaseServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            logWarn({
                msg: "http.request.completed",
                request_id,
                route: `${method} ${path}`,
                status: 401,
                latency_ms: Date.now() - startedAt,
                outcome: "auth_required"
            });
            return NextResponse.json(
                { ok: false, errorCode: "UNAUTHORIZED", message: "You must be logged in to delete your account." },
                { status: 401 }
            );
        }

        const userId = user.id;

        // Use admin client for deletions
        const admin = createSupabaseAdminClient();
        if (!admin) {
            logError({
                msg: "http.request.completed",
                request_id,
                route: `${method} ${path}`,
                status: 500,
                latency_ms: Date.now() - startedAt,
                outcome: "internal_error",
                err: { name: "ConfigError", message: "Admin client not configured" }
            });
            return NextResponse.json(
                { ok: false, errorCode: "INTERNAL_ERROR", message: "Account deletion is temporarily unavailable." },
                { status: 500 }
            );
        }

        // Cancel recurring billing before removing the local entitlement or auth
        // record. Otherwise the user could lose access while Stripe keeps charging.
        const { data: localPasses, error: localPassesError } = await admin
            .from("passes")
            .select("tier, checkout_session_id, stripe_payment_intent_id, stripe_subscription_id")
            .eq("user_id", userId);

        if (localPassesError) {
            throwDeletionError("passes", localPassesError);
        }

        const monthlyPasses = (localPasses || []).filter((pass: any) => pass.tier === "monthly");
        let canceledSubscriptions = 0;
        if (monthlyPasses.length > 0) {
            const subscriptionIds = monthlyPasses
                .map((pass: any) => pass.stripe_subscription_id)
                .filter((value: unknown): value is string => typeof value === "string" && value.startsWith("sub_"));

            if (subscriptionIds.length !== monthlyPasses.length) {
                return NextResponse.json(
                    {
                        ok: false,
                        errorCode: "BILLING_CANCELLATION_FAILED",
                        message: "We could not verify every subscription, so your account was not deleted. Please contact support.",
                    },
                    { status: 502 }
                );
            }

            try {
                canceledSubscriptions = await cancelActiveSubscriptions([...new Set(subscriptionIds)]);
            } catch (billingError: any) {
                logError({
                    msg: "account.deletion.subscription_cancel_failed",
                    request_id,
                    user_id: userId,
                    outcome: "provider_error",
                    err: {
                        name: billingError?.name || "Error",
                        message: billingError?.message || "Failed to cancel subscription",
                    },
                });
                return NextResponse.json(
                    {
                        ok: false,
                        errorCode: "BILLING_CANCELLATION_FAILED",
                        message: "We could not cancel your subscription, so your account was not deleted. Please try again or contact support.",
                    },
                    { status: 502 }
                );
            }
        }

        const entitlementBlocks = (localPasses || [])
            .filter((pass: any) => typeof pass.checkout_session_id === "string" && pass.checkout_session_id)
            .map((pass: any) => ({
                checkout_session_id: pass.checkout_session_id,
                stripe_payment_intent_id:
                    typeof pass.stripe_payment_intent_id === "string"
                        ? pass.stripe_payment_intent_id
                        : null,
                reason: "account_deleted",
                updated_at: new Date().toISOString(),
            }));

        if (entitlementBlocks.length > 0) {
            const { error: blockError } = await admin
                .from("billing_entitlement_blocks")
                .upsert(entitlementBlocks, { onConflict: "checkout_session_id" });
            if (blockError) throwDeletionError("billing entitlement blocks", blockError);
        }

        // Delete in order (foreign key dependencies)
        const deletions: AccountDeletionRecord[] = [];

        // 1. Delete all reports
        const { error: reportsError, count: reportsCount } = await admin
            .from("reports")
            .delete({ count: "exact" })
            .eq("user_id", userId);

        if (reportsError) {
            logError({
                msg: "account.deletion.failed",
                request_id,
                user_id: userId,
                err: { name: "SupabaseError", message: reportsError.message, code: reportsError.code }
            });
            throw new Error(`Failed to delete reports: ${reportsError.message}`);
        }
        deletions.push({ table: "reports", count: reportsCount });

        // 2. Delete saved resume profile (default resume + embeddings)
        const { error: profilesError, count: profilesCount } = await admin
            .from("user_profiles")
            .delete({ count: "exact" })
            .eq("user_id", userId);

        if (profilesError && !shouldIgnoreMissingTable(profilesError)) {
            logError({
                msg: "account.deletion.failed",
                request_id,
                user_id: userId,
                supabase: { table: "user_profiles", error_code: profilesError.code }
            });
            throwDeletionError("user_profiles", profilesError);
        }
        deletions.push({ table: "user_profiles", count: profilesCount });

        // 3. Delete all saved_jobs (for extension)
        const { error: jobsError, count: jobsCount } = await admin
            .from("saved_jobs")
            .delete({ count: "exact" })
            .eq("user_id", userId);

        if (jobsError && !shouldIgnoreMissingTable(jobsError)) {
            logError({
                msg: "account.deletion.failed",
                request_id,
                user_id: userId,
                supabase: { table: "saved_jobs", error_code: jobsError.code }
            });
            throwDeletionError("saved_jobs", jobsError);
        }
        deletions.push({ table: "saved_jobs", count: jobsCount });

        // 4. Delete all artifacts (via cases cascade - or directly if no cases)
        const { error: artifactsError, count: artifactsCount } = await admin
            .from("artifacts")
            .delete({ count: "exact" })
            .eq("user_id", userId);

        // Older schemas may not have this table/user_id path. Any other failure
        // means deletion is incomplete and must not be reported as success.
        if (
            artifactsError &&
            !shouldIgnoreMissingUserIdColumn(artifactsError) &&
            !shouldIgnoreMissingTable(artifactsError)
        ) {
            throwDeletionError("artifacts", artifactsError);
        }
        deletions.push({ table: "artifacts", count: artifactsCount });

        // 5. Delete user_usage tracking
        const { error: usageError, count: usageCount } = await admin
            .from("user_usage")
            .delete({ count: "exact" })
            .eq("user_id", userId);

        if (usageError && !shouldIgnoreMissingTable(usageError)) {
            logError({
                msg: "account.deletion.failed",
                request_id,
                user_id: userId,
                supabase: { table: "user_usage", error_code: usageError.code }
            });
            throwDeletionError("user_usage", usageError);
        }
        deletions.push({ table: "user_usage", count: usageCount });

        // 6. Delete account export jobs
        const { error: exportJobsError, count: exportJobsCount } = await admin
            .from("account_export_jobs")
            .delete({ count: "exact" })
            .eq("user_id", userId);

        if (exportJobsError && !shouldIgnoreMissingTable(exportJobsError)) {
            logError({
                msg: "account.deletion.failed",
                request_id,
                user_id: userId,
                supabase: { table: "account_export_jobs", error_code: exportJobsError.code }
            });
            throwDeletionError("account_export_jobs", exportJobsError);
        }
        deletions.push({ table: "account_export_jobs", count: exportJobsCount });

        // 7. Delete in-flight generation reservations before their parent passes.
        // This keeps account deletion retryable even after a paid report has
        // reserved or consumed access.
        const { error: reservationDeleteError } = await admin.rpc(
            "delete_generation_access_reservations_for_user",
            { p_user_id: userId }
        );
        if (reservationDeleteError) {
            throwDeletionError("generation access reservations", reservationDeleteError);
        }

        // 8. Delete passes (credit records). Stripe retains the authoritative
        // payment record and the anonymous block ledger prevents restoration.
        // Note: This is acceptable because Stripe has the authoritative payment record
        const { error: passesError, count: passesCount } = await admin
            .from("passes")
            .delete({ count: "exact" })
            .eq("user_id", userId);

        if (passesError) {
            logError({
                msg: "account.deletion.failed",
                request_id,
                user_id: userId,
                supabase: { table: "passes", error_code: passesError.code }
            });
            throwDeletionError("passes", passesError);
        }
        deletions.push({ table: "passes", count: passesCount });

        // 9. Delete cases (if any)
        const { error: casesError, count: casesCount } = await admin
            .from("cases")
            .delete({ count: "exact" })
            .eq("user_id", userId);

        if (casesError && !shouldIgnoreMissingTable(casesError)) {
            throwDeletionError("cases", casesError);
        }
        deletions.push({ table: "cases", count: casesCount });

        // 10. Delete the user from auth (this is the final step)
        // Note: This requires admin privileges
        const { error: authDeleteError } = await admin.auth.admin.deleteUser(userId);

        if (authDeleteError) {
            logError({
                msg: "account.deletion.auth_failed",
                request_id,
                user_id: userId,
                err: { name: "AuthError", message: authDeleteError.message }
            });

            // Keep the auth session intact so the same user can retry this
            // idempotent route. Never claim complete deletion while the auth
            // identity still exists.
            const pending = buildAuthDeletionPendingResponse(deletions, canceledSubscriptions);
            return NextResponse.json(pending.body, { status: pending.status });
        }

        logInfo({
            msg: "account.deletion.completed",
            request_id,
            user_id: userId,
            latency_ms: Date.now() - startedAt,
            outcome: "success"
        });

        return NextResponse.json({
            ok: true,
            message: "Your account and all associated data have been deleted.",
            deletions,
            canceled_subscriptions: canceledSubscriptions,
        });

    } catch (err: any) {
        logError({
            msg: "http.request.completed",
            request_id,
            route: `${method} ${path}`,
            status: 500,
            latency_ms: Date.now() - startedAt,
            outcome: "internal_error",
            err: { name: err?.name || "Error", message: err?.message || "Unknown error" }
        });

        const incomplete = buildIncompleteAccountDeletionResponse();
        return NextResponse.json(incomplete.body, { status: incomplete.status });
    }
}
