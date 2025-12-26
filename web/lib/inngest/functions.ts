import { inngest } from "@/lib/inngest/client";
import { generatePdfBuffer } from "@/lib/backend/pdf";
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
 * All Inngest functions to register with the serve handler
 */
export const inngestFunctions = [
    generatePdfJob,
];
