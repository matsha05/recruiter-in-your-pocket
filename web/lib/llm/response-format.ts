type LlmMode =
  | "resume"
  | "resume_ideas"
  | "case_resume"
  | "case_interview"
  | "case_negotiation"
  | "linkedin";

const stringValue = { type: "string" } as const;
const nonEmptyString = { type: "string", minLength: 1 } as const;
const scoreValue = { type: "integer", minimum: 0, maximum: 99 } as const;
const percentageValue = { type: "integer", minimum: 0, maximum: 100 } as const;
const stringList = (minItems: number, maxItems: number) => ({
  type: "array" as const,
  items: nonEmptyString,
  minItems,
  maxItems,
});

const sectionReviewItem = {
  type: "object",
  properties: {
    grade: stringValue,
    priority: stringValue,
    working: stringValue,
    missing: stringValue,
    fix: stringValue,
  },
  required: ["grade", "priority", "working", "missing", "fix"],
  additionalProperties: false,
} as const;

/**
 * The production resume contract in the subset of JSON Schema supported by
 * OpenAI Structured Outputs. Keep this aligned with resume_v2.txt and
 * ResumeFeedbackResponseSchema.
 */
export const RESUME_REPORT_JSON_SCHEMA = {
  type: "object",
  properties: {
    contract_version: { type: "string", enum: ["v2"] },
    score: scoreValue,
    score_label: nonEmptyString,
    score_comment_short: nonEmptyString,
    score_comment_long: nonEmptyString,
    score_plain: nonEmptyString,
    first_impression: nonEmptyString,
    biggest_gap_example: nonEmptyString,
    first_impression_takeaway: nonEmptyString,
    summary: nonEmptyString,
    strengths: stringList(3, 5),
    gaps: stringList(3, 5),
    rewrites: {
      type: "array",
      minItems: 0,
      maxItems: 3,
      items: {
        type: "object",
        properties: {
          label: nonEmptyString,
          original: nonEmptyString,
          better: nonEmptyString,
          enhancement_note: nonEmptyString,
        },
        required: ["label", "original", "better", "enhancement_note"],
        additionalProperties: false,
      },
    },
    top_fixes: {
      type: "array",
      minItems: 1,
      maxItems: 3,
      items: {
        type: "object",
        properties: {
          fix: nonEmptyString,
          why: nonEmptyString,
          confidence: { type: "string", enum: ["high", "medium", "low"] },
          evidence: {
            type: "object",
            properties: {
              excerpt: { type: "string", minLength: 1, maxLength: 140 },
              section: nonEmptyString,
            },
            required: ["excerpt", "section"],
            additionalProperties: false,
          },
          impact_level: { type: "string", enum: ["high", "medium", "low"] },
          effort: { type: "string", enum: ["quick", "moderate", "high"] },
          section_ref: nonEmptyString,
        },
        required: [
          "fix",
          "why",
          "confidence",
          "evidence",
          "impact_level",
          "effort",
          "section_ref",
        ],
        additionalProperties: false,
      },
    },
    next_steps: stringList(3, 5),
    subscores: {
      type: "object",
      properties: {
        impact: scoreValue,
        clarity: scoreValue,
        story: scoreValue,
        readability: scoreValue,
      },
      required: ["impact", "clarity", "story", "readability"],
      additionalProperties: false,
    },
    section_review: {
      type: "object",
      properties: {
        Summary: sectionReviewItem,
        "Work Experience": sectionReviewItem,
        Skills: sectionReviewItem,
        Education: sectionReviewItem,
      },
      required: ["Summary", "Work Experience", "Skills", "Education"],
      additionalProperties: false,
    },
    job_alignment: {
      type: "object",
      properties: {
        jd_match_score: percentageValue,
        jd_match_summary: stringValue,
        jd_keywords: {
          type: "object",
          properties: {
            matched: stringList(0, 20),
            missing: stringList(0, 20),
            match_count: { type: "integer", minimum: 0 },
            total_count: { type: "integer", minimum: 0 },
          },
          required: ["matched", "missing", "match_count", "total_count"],
          additionalProperties: false,
        },
        strongly_aligned: stringList(3, 5),
        underplayed: stringList(2, 4),
        missing: stringList(1, 3),
        role_fit: {
          type: "object",
          properties: {
            best_fit_roles: stringList(3, 5),
            stretch_roles: stringList(1, 3),
            seniority_read: stringValue,
            industry_signals: stringList(0, 8),
            company_stage_fit: stringValue,
          },
          required: [
            "best_fit_roles",
            "stretch_roles",
            "seniority_read",
            "industry_signals",
            "company_stage_fit",
          ],
          additionalProperties: false,
        },
        positioning_suggestion: stringValue,
      },
      required: [
        "jd_match_score",
        "jd_match_summary",
        "jd_keywords",
        "strongly_aligned",
        "underplayed",
        "missing",
        "role_fit",
        "positioning_suggestion",
      ],
      additionalProperties: false,
    },
    ideas: {
      type: "object",
      properties: {
        questions: {
          type: "array",
          minItems: 5,
          maxItems: 5,
          items: {
            type: "object",
            properties: {
              question: nonEmptyString,
              archetype: {
                type: "string",
                enum: [
                  "TENSION POINT",
                  "SCALING",
                  "QUALITY UNDER PRESSURE",
                  "IMPROVEMENT",
                  "CROSS-FUNCTIONAL COMPLEXITY",
                  "END-TO-END OWNERSHIP",
                  "DOMAIN LIFT",
                  "HIGH STAKES",
                ],
              },
              why: nonEmptyString,
            },
            required: ["question", "archetype", "why"],
            additionalProperties: false,
          },
        },
      },
      required: ["questions"],
      additionalProperties: false,
    },
  },
  required: [
    "contract_version",
    "score",
    "score_label",
    "score_comment_short",
    "score_comment_long",
    "score_plain",
    "first_impression",
    "biggest_gap_example",
    "first_impression_takeaway",
    "summary",
    "strengths",
    "gaps",
    "rewrites",
    "top_fixes",
    "next_steps",
    "subscores",
    "section_review",
    "job_alignment",
    "ideas",
  ],
  additionalProperties: false,
} as const;

export const RESUME_REPORT_RESPONSE_FORMAT = {
  type: "json_schema",
  json_schema: {
    name: "riyp_resume_report_v2",
    strict: true,
    schema: RESUME_REPORT_JSON_SCHEMA,
  },
} as const;

const LEGACY_JSON_RESPONSE_FORMAT = { type: "json_object" } as const;

export function getOpenAIResponseFormat(mode: LlmMode) {
  return mode === "resume" ? RESUME_REPORT_RESPONSE_FORMAT : LEGACY_JSON_RESPONSE_FORMAT;
}
