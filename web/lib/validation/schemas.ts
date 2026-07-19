import { z } from "zod";
import {
    containsExactEvidence,
    findAlreadySatisfiedFix,
    findUnsupportedAgencyUpgrade,
    findUnsupportedOutcomeClaims
} from "@/lib/llm/grounding";

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

/**
 * Rewrite item schema
 */
const RewriteSchema = z.object({
    label: z.string(),
    original: z.string(),
    better: z.string(),
    enhancement_note: z.string()
});

const ConfidenceSchema = z.enum(["high", "medium", "low"]);
const ImpactLevelSchema = z.enum(["high", "medium", "low"]);
const EffortLevelSchema = z.enum(["quick", "moderate", "high"]);

const EvidenceSchema = z.object({
    excerpt: z.string().min(1).max(140),
    section: z.string().min(1)
});

const TopFixSchema = z.object({
    fix: z.string().min(1),
    why: z.string().min(1),
    confidence: ConfidenceSchema,
    evidence: EvidenceSchema,
    impact_level: ImpactLevelSchema,
    effort: EffortLevelSchema,
    section_ref: z.string().min(1)
});

function normalizeForEvidence(value: string) {
    return value
        .toLowerCase()
        .replace(/[^\w\d%\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

function isAcceptedAbsenceMarker(value: string) {
    const normalizedValue = normalizeForEvidence(value);
    return [
        "no summary section present",
        "no job description provided",
        "no matching job description provided",
        "no linkedin profile provided"
    ].includes(normalizedValue);
}

const concreteMetricPattern = /\b\d+(?:\.\d+)?\s*(?:%|x|×|k|m|b|teams?|users?|customers?|projects?|features?|partners?|regions?|weeks?|months?|years?|hrs?|hours?|days?)?\b/gi;

function removeBracketPlaceholders(value: string) {
    return value.replace(/\[[^\]]+\]/g, "");
}

function escapeRegExp(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function containsLiteral(text: string, value: string) {
    return new RegExp(escapeRegExp(value)).test(text);
}

function findUngroundedSpecifics(text: string, sourceText: string) {
    const normalizedSource = normalizeForEvidence(sourceText);
    const unbracketedText = removeBracketPlaceholders(text);
    const matches = unbracketedText.match(concreteMetricPattern) || [];
    const ungrounded = new Set<string>();

    for (const match of matches) {
        const normalizedMetric = normalizeForEvidence(match);
        const numericValue = match.match(/\d+(?:\.\d+)?/)?.[0];
        if (!numericValue) continue;

        const numberPattern = new RegExp(`\\b${escapeRegExp(numericValue)}\\b`);
        const isGrounded =
            (normalizedMetric.length > 0 && containsLiteral(normalizedSource, normalizedMetric)) ||
            numberPattern.test(normalizedSource);

        if (!isGrounded) {
            ungrounded.add(match.trim());
        }
    }

    return Array.from(ungrounded);
}

export function assertReportGrounding(report: ResumeFeedbackResponse, resumeText: string) {
    const missingEvidence: string[] = [];
    const inventedSpecifics: string[] = [];

    for (const [index, fix] of report.top_fixes.entries()) {
        const excerpt = normalizeForEvidence(fix.evidence.excerpt);
        if (excerpt.length > 10 && !containsExactEvidence(resumeText, fix.evidence.excerpt) && !isAcceptedAbsenceMarker(fix.evidence.excerpt)) {
            missingEvidence.push(`top_fixes[${index}].evidence.excerpt`);
        }
        const alreadySatisfied = findAlreadySatisfiedFix(fix.fix, fix.evidence.excerpt, resumeText);
        if (alreadySatisfied.length > 0) {
            inventedSpecifics.push(`top_fixes[${index}].fix contradicted by resume: ${alreadySatisfied.join(", ")}`);
        }
    }

    for (const [index, rewrite] of report.rewrites.entries()) {
        const original = normalizeForEvidence(rewrite.original);
        if (original.length > 10 && !containsExactEvidence(resumeText, rewrite.original)) {
            missingEvidence.push(`rewrites[${index}].original`);
        }
        const ungroundedSpecifics = findUngroundedSpecifics(rewrite.better, resumeText);
        if (ungroundedSpecifics.length > 0) {
            inventedSpecifics.push(`rewrites[${index}].better: ${ungroundedSpecifics.join(", ")}`);
        }
        const unsupportedAgency = findUnsupportedAgencyUpgrade(rewrite.original, rewrite.better, resumeText);
        if (unsupportedAgency.length > 0) {
            inventedSpecifics.push(`rewrites[${index}].better unsupported ownership: ${unsupportedAgency.join(", ")}`);
        }
        const unsupportedOutcomes = findUnsupportedOutcomeClaims(rewrite.original, rewrite.better, resumeText);
        if (unsupportedOutcomes.length > 0) {
            inventedSpecifics.push(`rewrites[${index}].better unsupported outcomes: ${unsupportedOutcomes.join(", ")}`);
        }
    }

    const quotedGap = report.biggest_gap_example.match(/["“]([^"”]+)["”]/)?.[1];
    if (!quotedGap || !containsExactEvidence(resumeText, quotedGap)) {
        missingEvidence.push("biggest_gap_example.quote");
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

const SectionReviewItemSchema = z.object({
    grade: z.string(),
    priority: z.string(),
    working: z.string().nullable().optional().default(""),
    missing: z.string().nullable().optional().default(""),
    fix: z.string().nullable().optional().default("")
});

/**
 * Resume feedback response schema (from LLM)
 */
export const ResumeFeedbackResponseSchema = z.object({
    contract_version: z.literal("v2"),
    score: z.number().transform(n => Math.min(100, Math.max(0, Math.round(n)))),
    score_label: z.string(),
    score_comment_short: z.string(),
    score_comment_long: z.string(),
    score_plain: z.string(),
    first_impression: z.string(),
    biggest_gap_example: z.string(),
    first_impression_takeaway: z.string(),
    summary: z.string(),
    strengths: z.array(z.string()),
    gaps: z.array(z.string()),
    rewrites: z.array(RewriteSchema),
    top_fixes: z.array(TopFixSchema).min(3),
    next_steps: z.array(z.string()),
    subscores: z.object({
        impact: z.number().int().min(0).max(100),
        clarity: z.number().int().min(0).max(100),
        story: z.number().int().min(0).max(100),
        readability: z.number().int().min(0).max(100)
    }).optional(),
    section_review: z.record(z.string(), SectionReviewItemSchema).optional(),
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
        missing: z.array(z.string()),
        role_fit: z.object({
            best_fit_roles: z.array(z.string()).optional(),
            stretch_roles: z.array(z.string()).optional(),
            seniority_read: z.string().optional(),
            industry_signals: z.array(z.string()).optional(),
            company_stage_fit: z.string().optional()
        }).optional(),
        positioning_suggestion: z.string().optional()
    }).passthrough().optional()
}).passthrough();
export type ResumeFeedbackResponse = z.infer<typeof ResumeFeedbackResponseSchema>;

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
