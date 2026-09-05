import { z } from "zod";
import {
    containsExactEvidence,
    findAlreadySatisfiedFix,
    findBiggestGapContradictions,
    findFixEvidenceMismatch,
    findNonActionableFix,
    isAcceptedAbsenceMarker,
} from "../llm/grounding";
import { auditReportNarrative, compareSourceBoundRewrite } from "../llm/source-fidelity";
import type { ResumeFeedbackResponse } from "./resume-report-schema";

export { ResumeFeedbackResponseSchema } from "./resume-report-schema";
export type { ResumeFeedbackResponse } from "./resume-report-schema";

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

const MAX_TEXT_LENGTH = 30000;
const MAX_JOB_DESCRIPTION_LENGTH = 8000;

const ModeSchema = z.enum([
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
const ResumeFeedbackRequestSchema = z.object({
    text: z.string()
        .min(1, "Paste your resume text so I can actually look at it.")
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
const ResumeIdeasRequestSchema = z.object({
    text: z.string()
        .min(1, "Paste your resume text so I can actually look at it.")
        .max(MAX_TEXT_LENGTH, "Your resume text is very long. Try trimming extra content.")
        .transform(s => s.trim())
});
export type ResumeIdeasRequest = z.infer<typeof ResumeIdeasRequestSchema>;

/**
 * PDF export request schema
 */
const PdfExportRequestSchema = z.object({
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
const CheckoutRequestSchema = z.object({
    tier: z.enum(["monthly", "lifetime", "24h", "30d", "90d", "single", "pack"]).optional(),
    email: z.string().email("Invalid email format").optional(),
    user_id: z.string().uuid().optional()
});
export type CheckoutRequest = z.infer<typeof CheckoutRequestSchema>;

// =============================================================================
// RESPONSE SCHEMAS (for LLM output validation)
// =============================================================================

export function assertReportGrounding(
    report: ResumeFeedbackResponse,
    resumeText: string,
    jobDescription?: string,
) {
    const missingEvidence: string[] = [];
    const inventedSpecifics: string[] = [];

    if (String(report.section_review["Work Experience"].priority).toLowerCase() === "high"
        && report.top_fixes.length > 0
        && report.top_fixes.every(fix => /^No (?:summary|skills|education) section present$/i.test(fix.evidence.excerpt))) {
        missingEvidence.push("top_fixes must include an actionable experience edit when Work Experience is high priority; optional sections alone do not address the report's main concern");
    }
    for (const [index, fix] of report.top_fixes.entries()) {
        if (!containsExactEvidence(resumeText, fix.evidence.excerpt) && !isAcceptedAbsenceMarker(fix.evidence.excerpt, resumeText, fix.evidence.section)) {
            missingEvidence.push(`top_fixes[${index}].evidence.excerpt`);
        }
        const alreadySatisfied = findAlreadySatisfiedFix(fix.fix, fix.evidence.excerpt, resumeText);
        if (alreadySatisfied.length > 0) {
            inventedSpecifics.push(`top_fixes[${index}].fix contradicted by resume: ${alreadySatisfied.join(", ")}`);
        }
        const evidenceMismatch = findFixEvidenceMismatch(fix.fix, fix.evidence.excerpt, resumeText, fix.evidence.section);
        if (evidenceMismatch.length > 0) {
            inventedSpecifics.push(`top_fixes[${index}].evidence mismatch: ${evidenceMismatch.join(", ")}`);
        }
        const nonActionable = findNonActionableFix(fix.fix);
        if (nonActionable.length > 0) {
            inventedSpecifics.push(`top_fixes[${index}].fix not actionable: ${nonActionable.join(", ")}`);
        }
    }

    for (const [index, rewrite] of report.rewrites.entries()) {
        if (!containsExactEvidence(resumeText, rewrite.original)) {
            missingEvidence.push(`rewrites[${index}].original`);
        }
        const comparison = compareSourceBoundRewrite({
            sourceText: resumeText,
            sourceLocator: rewrite.original,
            candidate: rewrite.better,
        });
        if (!comparison.safe) {
            inventedSpecifics.push(
                `rewrites[${index}].better source fidelity: ${comparison.issues.map(issue => issue.detail).join(", ")}`,
            );
        }
    }

    for (const issue of auditReportNarrative(report, resumeText, jobDescription)) {
        inventedSpecifics.push(
            `${issue.path} unsupported narrative facts: ${issue.unsupportedFacts.join(", ")}`,
        );
    }

    const quotedGap = report.biggest_gap_example.match(/["“]([^"”]+)["”]/)?.[1];
    if (!quotedGap || !containsExactEvidence(resumeText, quotedGap)) {
        missingEvidence.push("biggest_gap_example.quote");
    } else {
        const gapContradictions = findBiggestGapContradictions(report.biggest_gap_example, resumeText);
        if (gapContradictions.length > 0) {
            inventedSpecifics.push(`biggest_gap_example contradicted by resume: ${gapContradictions.join(", ")}`);
        }
    }

    if (/\[?SOURCE_\d{3}\]?/i.test(JSON.stringify(report))) {
        inventedSpecifics.push("response exposes an internal SOURCE catalog tag");
    }

    if (missingEvidence.length > 0 || inventedSpecifics.length > 0) {
        return {
            ok: false as const,
            missingEvidence,
            inventedSpecifics
        };
    }

    return {
        ok: true as const,
        missingEvidence: [],
        inventedSpecifics: []
    };
}

/**
 * Resume ideas response schema (from LLM)
 */
const ResumeIdeasResponseSchema = z.object({
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
const StripeCheckoutMetadataSchema = z.object({
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
function safeParse<T>(schema: z.ZodSchema<T>, data: unknown): {
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
