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
    label: z.string().min(1),
    original: z.string().min(1),
    better: z.string().min(1),
    enhancement_note: z.string().regex(/^Add\b/, "enhancement_note must begin with Add")
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

function sentenceCount(value: string) {
    return value.split(/[.!?]+(?:\s+|$)/).filter(part => part.trim().length > 0).length;
}

function wordCount(value: string) {
    return value.trim().split(/\s+/).filter(Boolean).length;
}

const BoundedStringSchema = (minSentences: number, maxSentences: number, field: string) =>
    z.string().min(1).refine(
        value => {
            const count = sentenceCount(value);
            return count >= minSentences && count <= maxSentences;
        },
        `${field} must contain ${minSentences}-${maxSentences} sentences`,
    );

function normalizeForEvidence(value: string) {
    return value
        .toLowerCase()
        .replace(/[^\w\d%\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

export function assertReportGrounding(
    report: ResumeFeedbackResponse,
    resumeText: string,
    narrativeSourceText = resumeText,
) {
    const missingEvidence: string[] = [];
    const inventedSpecifics: string[] = [];

    for (const [index, fix] of report.top_fixes.entries()) {
        const excerpt = normalizeForEvidence(fix.evidence.excerpt);
        if (excerpt.length > 10 && !containsExactEvidence(resumeText, fix.evidence.excerpt) && !isAcceptedAbsenceMarker(fix.evidence.excerpt, resumeText)) {
            missingEvidence.push(`top_fixes[${index}].evidence.excerpt`);
        }
        const alreadySatisfied = findAlreadySatisfiedFix(fix.fix, fix.evidence.excerpt, resumeText);
        if (alreadySatisfied.length > 0) {
            inventedSpecifics.push(`top_fixes[${index}].fix contradicted by resume: ${alreadySatisfied.join(", ")}`);
        }
        const evidenceMismatch = findFixEvidenceMismatch(fix.fix, fix.evidence.excerpt, resumeText);
        if (evidenceMismatch.length > 0) {
            inventedSpecifics.push(`top_fixes[${index}].evidence mismatch: ${evidenceMismatch.join(", ")}`);
        }
        const nonActionable = findNonActionableFix(fix.fix);
        if (nonActionable.length > 0) {
            inventedSpecifics.push(`top_fixes[${index}].fix not actionable: ${nonActionable.join(", ")}`);
        }
    }

    for (const [index, rewrite] of report.rewrites.entries()) {
        const original = normalizeForEvidence(rewrite.original);
        if (original.length > 10 && !containsExactEvidence(resumeText, rewrite.original)) {
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

    for (const issue of auditReportNarrative(report, narrativeSourceText)) {
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
    score_label: z.string().min(1).refine(value => wordCount(value) <= 3, "score_label must be 1-3 words"),
    score_comment_short: z.string().min(1).refine(value => wordCount(value) <= 16, "score_comment_short must be at most 16 words"),
    score_comment_long: BoundedStringSchema(2, 4, "score_comment_long"),
    score_plain: BoundedStringSchema(1, 2, "score_plain"),
    first_impression: BoundedStringSchema(1, 3, "first_impression"),
    biggest_gap_example: z.string().min(1),
    first_impression_takeaway: z.string().min(1).refine(value => {
        const count = wordCount(value);
        return count >= 2 && count <= 6;
    }, "first_impression_takeaway must be 2-6 words"),
    summary: BoundedStringSchema(3, 5, "summary"),
    strengths: z.array(z.string().min(1)).min(3).max(5),
    gaps: z.array(z.string().min(1)).min(3).max(5),
    rewrites: z.array(RewriteSchema).max(3),
    top_fixes: z.array(TopFixSchema).min(1).max(3),
    next_steps: z.array(z.string().min(1)).min(3).max(5),
    subscores: z.object({
        impact: z.number().int().min(0).max(100),
        clarity: z.number().int().min(0).max(100),
        story: z.number().int().min(0).max(100),
        readability: z.number().int().min(0).max(100)
    }),
    section_review: z.object({
        Summary: SectionReviewItemSchema,
        "Work Experience": SectionReviewItemSchema,
        Skills: SectionReviewItemSchema,
        Education: SectionReviewItemSchema,
    }),
    // Optional layout fields
    layout_score: z.number().nullable().optional(),
    layout_band: z.string().optional(),
    layout_notes: z.string().optional(),
    content_score: z.number().optional(),
    // Job alignment (optional)
    job_alignment: z.object({
        jd_match_score: z.number().int().min(0).max(100),
        jd_match_summary: z.string(),
        jd_keywords: z.object({
            matched: z.array(z.string()).max(20),
            missing: z.array(z.string()).max(20),
            match_count: z.number().int().min(0),
            total_count: z.number().int().min(0)
        }),
        strongly_aligned: z.array(z.string()).min(3).max(5),
        underplayed: z.array(z.string()).min(2).max(4),
        missing: z.array(z.string()).min(1).max(3),
        role_fit: z.object({
            best_fit_roles: z.array(z.string()).min(3).max(5),
            stretch_roles: z.array(z.string()).min(1).max(3),
            seniority_read: z.string(),
            industry_signals: z.array(z.string()).max(8),
            company_stage_fit: z.string()
        }),
        positioning_suggestion: z.string()
    }).passthrough(),
    ideas: z.object({
        questions: z.array(z.object({
            question: z.string().min(1),
            archetype: z.enum([
                "TENSION POINT",
                "SCALING",
                "QUALITY UNDER PRESSURE",
                "IMPROVEMENT",
                "CROSS-FUNCTIONAL COMPLEXITY",
                "END-TO-END OWNERSHIP",
                "DOMAIN LIFT",
                "HIGH STAKES",
            ]),
            why: z.string().min(1),
        })).length(5),
    }),
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
