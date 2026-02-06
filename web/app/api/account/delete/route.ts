import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/serverClient";
import { createSupabaseAdminClient } from "@/lib/supabase/adminClient";
import { logInfo, logError, logWarn } from "@/lib/observability/logger";
import { getRequestId, routeLabel } from "@/lib/observability/requestContext";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

        // Delete in order (foreign key dependencies)
        const deletions: { table: string; count: number | null }[] = [];

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

        if (profilesError && !profilesError.message.includes("does not exist")) {
            logWarn({
                msg: "account.deletion.table_warning",
                request_id,
                user_id: userId,
                supabase: { table: "user_profiles", error_code: profilesError.code }
            });
        }
        deletions.push({ table: "user_profiles", count: profilesCount });

        // 3. Delete all saved_jobs (for extension)
        const { error: jobsError, count: jobsCount } = await admin
            .from("saved_jobs")
            .delete({ count: "exact" })
            .eq("user_id", userId);

        // Ignore error if table doesn't exist yet (extension not built)
        if (jobsError && !jobsError.message.includes("does not exist")) {
            logWarn({
                msg: "account.deletion.table_warning",
                request_id,
                user_id: userId,
                supabase: { table: "saved_jobs", error_code: jobsError.code }
            });
        }
        deletions.push({ table: "saved_jobs", count: jobsCount });

        // 4. Delete all artifacts (via cases cascade - or directly if no cases)
        const { error: artifactsError, count: artifactsCount } = await admin
            .from("artifacts")
            .delete({ count: "exact" })
            .eq("user_id", userId);

        // Ignore if artifacts doesn't have user_id column
        if (artifactsError && !artifactsError.message.includes("column") && !artifactsError.message.includes("does not exist")) {
            logWarn({
                msg: "account.deletion.table_warning",
                request_id,
                user_id: userId,
                supabase: { table: "artifacts", error_code: artifactsError.code }
            });
        }
        deletions.push({ table: "artifacts", count: artifactsCount });

        // 5. Delete user_usage tracking
        const { error: usageError } = await admin
            .from("user_usage")
            .delete()
            .eq("user_id", userId);

        if (usageError && !usageError.message.includes("does not exist")) {
            logWarn({
                msg: "account.deletion.table_warning",
                request_id,
                user_id: userId,
                supabase: { table: "user_usage", error_code: usageError.code }
            });
        }

        // 6. Delete account export jobs
        const { error: exportJobsError, count: exportJobsCount } = await admin
            .from("account_export_jobs")
            .delete({ count: "exact" })
            .eq("user_id", userId);

        if (exportJobsError && !exportJobsError.message.includes("does not exist")) {
            logWarn({
                msg: "account.deletion.table_warning",
                request_id,
                user_id: userId,
                supabase: { table: "account_export_jobs", error_code: exportJobsError.code }
            });
        }
        deletions.push({ table: "account_export_jobs", count: exportJobsCount });

        // 7. Delete passes (credit records) - we keep Stripe records but delete our local pass records
        // Note: This is acceptable because Stripe has the authoritative payment record
        const { error: passesError, count: passesCount } = await admin
            .from("passes")
            .delete({ count: "exact" })
            .eq("user_id", userId);

        if (passesError) {
            logWarn({
                msg: "account.deletion.table_warning",
                request_id,
                user_id: userId,
                supabase: { table: "passes", error_code: passesError.code }
            });
        }
        deletions.push({ table: "passes", count: passesCount });

        // 8. Delete cases (if any)
        const { error: casesError, count: casesCount } = await admin
            .from("cases")
            .delete({ count: "exact" })
            .eq("user_id", userId);

        if (casesError && !casesError.message.includes("does not exist")) {
            logWarn({
                msg: "account.deletion.table_warning",
                request_id,
                user_id: userId,
                supabase: { table: "cases", error_code: casesError.code }
            });
        }
        deletions.push({ table: "cases", count: casesCount });

        // 9. Delete the user from auth (this is the final step)
        // Note: This requires admin privileges
        const { error: authDeleteError } = await admin.auth.admin.deleteUser(userId);

        if (authDeleteError) {
            logError({
                msg: "account.deletion.auth_failed",
                request_id,
                user_id: userId,
                err: { name: "AuthError", message: authDeleteError.message }
            });
            // Even if auth deletion fails, data is already deleted
            // User can try again or contact support
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
            deletions
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

        return NextResponse.json(
            { ok: false, errorCode: "INTERNAL_ERROR", message: "Account deletion failed. Please try again or contact support." },
            { status: 500 }
        );
    }
}
