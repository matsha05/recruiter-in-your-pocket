import { inngest } from "@/lib/inngest/client";
import { generatePdfBuffer } from "@/lib/backend/pdf";
import { buildAccountExportPayload } from "@/lib/backend/accountExport";
import { createSupabaseAdminClient } from "@/lib/supabase/adminClient";
import { logError, logInfo } from "@/lib/observability/logger";

/**
 * Background job for PDF generation.
 * 
 * Benefits:
 * - Doesn't block user requests
 * - Automatic retries on failure
 * - Better error visibility via Inngest dashboard
 * - Can handle longer generation times
 */
export const generatePdfJob = inngest.createFunction(
    {
        id: "generate-pdf",
        retries: 3,
        // Timeout after 2 minutes (PDF generation can be slow)
        cancelOn: [],
    },
    { event: "pdf/generate.requested" },
    async ({ event, step }) => {
        const { report, requestId, userId } = event.data;

        const pdfBuffer = await step.run("generate-pdf-buffer", async () => {
            logInfo({
                msg: "pdf.generation.started",
                request_id: requestId,
                user_id: userId,
            });

            try {
                const buffer = await generatePdfBuffer(report);

                logInfo({
                    msg: "pdf.generation.completed",
                    request_id: requestId,
                    user_id: userId,
                });

                // Convert buffer to base64 for storage/transmission
                return buffer.toString("base64");
            } catch (error: any) {
                logError({
                    msg: "pdf.generation.failed",
                    request_id: requestId,
                    user_id: userId,
                    err: { name: error?.name, message: error?.message, stack: error?.stack },
                });
                throw error;
            }
        });

        return {
            success: true,
            pdfBase64: pdfBuffer,
            sizeBytes: Buffer.from(pdfBuffer, "base64").length
        };
    }
);

/**
 * Background job for account data export generation.
 *
 * Flow:
 * 1. Mark job as running
 * 2. Build payload snapshot from user-scoped tables
 * 3. Persist JSON payload in account_export_jobs.result_json
 * 4. Mark job completed (or failed with error message)
 */
export const exportAccountDataJob = inngest.createFunction(
    {
        id: "export-account-data",
        retries: 2,
        cancelOn: [],
    },
    { event: "account/export.requested" },
    async ({ event, step }) => {
        const { jobId, userId, userEmail } = event.data as {
            jobId: string;
            userId: string;
            userEmail?: string | null;
        };

        const admin = createSupabaseAdminClient();
        if (!admin) {
            throw new Error("Supabase admin client not configured");
        }

        await step.run("mark-running", async () => {
            await admin
                .from("account_export_jobs")
                .update({
                    status: "running",
                    started_at: new Date().toISOString(),
                    error_message: null,
                })
                .eq("id", jobId)
                .eq("user_id", userId);
        });

        try {
            const payload = await step.run("build-export-payload", async () => {
                logInfo({
                    msg: "account.export.started",
                    user_id: userId,
                });

                return buildAccountExportPayload(admin as any, {
                    id: userId,
                    email: userEmail || null,
                    user_metadata: null,
                });
            });

            await step.run("persist-export-result", async () => {
                const now = new Date();
                const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

                const { error } = await admin
                    .from("account_export_jobs")
                    .update({
                        status: "completed",
                        completed_at: now.toISOString(),
                        expires_at: expiresAt,
                        result_json: payload,
                        error_message: null,
                    })
                    .eq("id", jobId)
                    .eq("user_id", userId);

                if (error) throw error;
            });

            logInfo({
                msg: "account.export.completed",
                user_id: userId,
            });

            return { ok: true, jobId };
        } catch (error: any) {
            await step.run("mark-failed", async () => {
                await admin
                    .from("account_export_jobs")
                    .update({
                        status: "failed",
                        completed_at: new Date().toISOString(),
                        error_message: error?.message || "Export failed",
                    })
                    .eq("id", jobId)
                    .eq("user_id", userId);
            });

            logError({
                msg: "account.export.failed",
                user_id: userId,
                err: { name: error?.name, message: error?.message, stack: error?.stack },
            });

            throw error;
        }
    }
);

/**
 * All Inngest functions to register with the serve handler
 */
export const inngestFunctions = [
    generatePdfJob,
    exportAccountDataJob,
];
