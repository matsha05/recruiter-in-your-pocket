import { z } from "zod";

/**
 * Central Zod schemas for API request/response validation.
 * 
 * These schemas provide:
 * - Type safety at runtime
 * - Automatic TypeScript type inference
 * - Clear error messages
 * - Easy extensibility
 */

// =============================================================================
// COMMON SCHEMAS
// =============================================================================

export const MAX_TEXT_LENGTH = 30000;
export const MAX_JOB_DESCRIPTION_LENGTH = 8000;

export const ModeSchema = z.enum([
    "resume",
    "resume_ideas",
    "case_resume",
    "case_interview",
    "case_negotiation"
]);
export type Mode = z.infer<typeof ModeSchema>;

// =============================================================================
// REQUEST SCHEMAS
// =============================================================================

/**
 * Resume feedback request schema
 */
export const ResumeFeedbackRequestSchema = z.object({
    text: z.string()
        .min(1, "Paste your resume text so I can actually review it.")
        .max(MAX_TEXT_LENGTH, "Your resume text is very long. Try trimming extra content.")
        .transform(s => s.trim()),
    mode: ModeSchema.optional().default("resume"),
    jobDescription: z.string()
        .max(MAX_JOB_DESCRIPTION_LENGTH, "Job description is too long.")
        .transform(s => s.trim() || null)
        .nullable()
        .optional()
        .default(null)
});
export type ResumeFeedbackRequest = z.infer<typeof ResumeFeedbackRequestSchema>;

/**
 * Resume ideas request schema
 */
export const ResumeIdeasRequestSchema = z.object({
    text: z.string()
        .min(1, "Paste your resume text so I can actually review it.")
        .max(MAX_TEXT_LENGTH, "Your resume text is very long. Try trimming extra content.")
        .transform(s => s.trim())
});
export type ResumeIdeasRequest = z.infer<typeof ResumeIdeasRequestSchema>;

/**
 * PDF export request schema
 */
export const PdfExportRequestSchema = z.object({
    report: z.object({
        score: z.number().int().min(0).max(100),
        score_label: z.string(),
        summary: z.string(),
        strengths: z.array(z.string()),
        gaps: z.array(z.string()),
        rewrites: z.array(z.object({
            label: z.string(),
            original: z.string(),
            better: z.string(),
            enhancement_note: z.string()
        })),
        next_steps: z.array(z.string())
    }).passthrough() // Allow additional fields
});
export type PdfExportRequest = z.infer<typeof PdfExportRequestSchema>;

/**
 * Checkout request schema
 */
export const CheckoutRequestSchema = z.object({
    tier: z.enum(["monthly", "lifetime", "24h", "30d", "90d", "single", "pack"]).optional(),
    email: z.string().email("Invalid email format").optional(),
    user_id: z.string().uuid().optional()
});
export type CheckoutRequest = z.infer<typeof CheckoutRequestSchema>;

// =============================================================================
// RESPONSE SCHEMAS (for LLM output validation)
// =============================================================================

/**
 * Rewrite item schema
 */
export const RewriteSchema = z.object({
    label: z.string(),
    original: z.string(),
    better: z.string(),
    enhancement_note: z.string()
});

/**
 * Resume feedback response schema (from LLM)
 */
export const ResumeFeedbackResponseSchema = z.object({
    score: z.number().transform(n => Math.min(100, Math.max(0, Math.round(n)))),
    score_label: z.string(),
    score_comment_short: z.string(),
    score_comment_long: z.string(),
    summary: z.string(),
    strengths: z.array(z.string()),
    gaps: z.array(z.string()),
    rewrites: z.array(RewriteSchema),
    next_steps: z.array(z.string()),
    // Optional layout fields
    layout_score: z.number().nullable().optional(),
    layout_band: z.string().optional(),
    layout_notes: z.string().optional(),
    content_score: z.number().optional(),
    // Job alignment (optional)
    job_alignment: z.object({
        jd_match_score: z.number().int().min(0).max(100).optional(),
        jd_match_summary: z.string().optional(),
        jd_keywords: z.object({
            matched: z.array(z.string()).optional(),
            missing: z.array(z.string()).optional(),
            match_count: z.number().int().optional(),
            total_count: z.number().int().optional()
        }).optional(),
        strongly_aligned: z.array(z.string()),
        underplayed: z.array(z.string()),
        missing: z.array(z.string())
    }).passthrough().optional()
}).passthrough();
export type ResumeFeedbackResponse = z.infer<typeof ResumeFeedbackResponseSchema>;

/**
 * Resume ideas response schema (from LLM)
 */
export const ResumeIdeasResponseSchema = z.object({
    questions: z.array(z.string()),
    notes: z.array(z.string()),
    how_to_use: z.string()
}).passthrough();
export type ResumeIdeasResponse = z.infer<typeof ResumeIdeasResponseSchema>;

// =============================================================================
// STRIPE WEBHOOK SCHEMAS
// =============================================================================

/**
 * Stripe checkout session metadata
 */
export const StripeCheckoutMetadataSchema = z.object({
    email: z.string().email().optional(),
    tier: z.enum(["monthly", "lifetime", "24h", "30d", "90d", "single", "pack"]).optional(),
    user_id: z.string().uuid().optional()
});

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Safely parse with Zod, returning a result object instead of throwing
 */
export function safeParse<T>(schema: z.ZodSchema<T>, data: unknown): {
    ok: true;
    data: T;
} | {
    ok: false;
    message: string;
    fieldErrors: Record<string, string>;
} {
    const result = schema.safeParse(data);

    if (result.success) {
        return { ok: true, data: result.data };
    }

    const fieldErrors: Record<string, string> = {};
    for (const error of result.error.issues) {
        const path = error.path.join(".");
        fieldErrors[path || "body"] = error.message;
    }

    return {
        ok: false,
        message: "Something in your request needs a quick tweak before I can help.",
        fieldErrors
    };
}
