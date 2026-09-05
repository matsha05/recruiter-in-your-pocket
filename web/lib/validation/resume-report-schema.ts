import { z } from "zod";
import { getScoreLabel } from "../score-utils";

const RewriteSchema = z.object({
  label: z.string().min(1),
  original: z.string().min(1),
  better: z.string().min(1),
  enhancement_note: z.string().regex(/^Add\b/, "enhancement_note must begin with Add"),
});

const ConfidenceSchema = z.enum(["high", "medium", "low"]);
const ImpactLevelSchema = z.enum(["high", "medium", "low"]);
const EffortLevelSchema = z.enum(["quick", "moderate", "high"]);

const EvidenceSchema = z.object({
  excerpt: z.string().trim().min(1).max(140),
  section: z.string().min(1),
});

const TopFixSchema = z.object({
  fix: z.string().min(1),
  why: z.string().min(1),
  confidence: ConfidenceSchema,
  evidence: EvidenceSchema,
  impact_level: ImpactLevelSchema,
  effort: EffortLevelSchema,
  section_ref: z.string().min(1),
});

function normalizedKeywordKeys(values: string[]) {
  return values.map(value => value.normalize("NFKC").toLocaleLowerCase().trim().replace(/\s+/g, " "));
}

const JobKeywordsSchema = z.object({
  matched: z.array(z.string().trim().min(1)).max(20),
  missing: z.array(z.string().trim().min(1)).max(20),
  match_count: z.number().int().min(0),
  total_count: z.number().int().min(0),
}).superRefine((keywords, context) => {
  const matched = normalizedKeywordKeys(keywords.matched);
  const missing = normalizedKeywordKeys(keywords.missing);
  const matchedSet = new Set(matched);
  const missingSet = new Set(missing);
  if (matchedSet.size !== matched.length) {
    context.addIssue({ code: "custom", path: ["matched"], message: "matched JD keywords must be unique" });
  }
  if (missingSet.size !== missing.length) {
    context.addIssue({ code: "custom", path: ["missing"], message: "missing JD keywords must be unique" });
  }
  if (matched.some(keyword => missingSet.has(keyword))) {
    context.addIssue({ code: "custom", path: ["missing"], message: "a JD keyword cannot be both matched and missing" });
  }
  if (keywords.match_count !== matchedSet.size) {
    context.addIssue({
      code: "custom",
      path: ["match_count"],
      message: "match_count must equal the normalized matched keyword count",
    });
  }
  if (keywords.total_count !== matchedSet.size + missingSet.size) {
    context.addIssue({
      code: "custom",
      path: ["total_count"],
      message: "total_count must equal the normalized matched and missing keyword count",
    });
  }
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

const SectionReviewItemSchema = z.object({
  grade: z.string(),
  priority: z.string(),
  working: z.string().nullable().optional().default(""),
  missing: z.string().nullable().optional().default(""),
  fix: z.string().nullable().optional().default(""),
});

/**
 * Canonical structural contract for a client-visible resume report.
 * Source-grounding and narrative-fidelity checks stay on the server because
 * they require the submitted resume and optional job description.
 */
export const ResumeFeedbackResponseSchema = z.object({
  contract_version: z.literal("v2"),
  score: z.number().transform(n => Math.min(100, Math.max(0, Math.round(n)))),
  score_label: z.string().min(1).refine(value => wordCount(value) <= 3, "score_label must be 1-3 words"),
  score_comment_short: z.string().min(1).refine(
    value => wordCount(value) <= 16,
    "score_comment_short must be at most 16 words",
  ),
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
    readability: z.number().int().min(0).max(100),
  }),
  section_review: z.object({
    Summary: SectionReviewItemSchema,
    "Work Experience": SectionReviewItemSchema,
    Skills: SectionReviewItemSchema,
    Education: SectionReviewItemSchema,
  }),
  layout_score: z.number().nullable().optional(),
  layout_band: z.string().optional(),
  layout_notes: z.string().optional(),
  content_score: z.number().optional(),
  job_alignment: z.object({
    jd_match_score: z.number().int().min(0).max(100),
    jd_match_summary: z.string(),
    jd_keywords: JobKeywordsSchema,
    strongly_aligned: z.array(z.string()).min(3).max(5),
    underplayed: z.array(z.string()).min(2).max(4),
    missing: z.array(z.string()).min(1).max(3),
    role_fit: z.object({
      best_fit_roles: z.array(z.string()).min(1).max(5),
      stretch_roles: z.array(z.string()).max(3),
      seniority_read: z.string(),
      industry_signals: z.array(z.string()).max(8),
      company_stage_fit: z.string(),
    }),
    positioning_suggestion: z.string(),
  }),
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
}).transform(report => ({ ...report, score_label: getScoreLabel(report.score) }));

export type ResumeFeedbackResponse = z.infer<typeof ResumeFeedbackResponseSchema>;
