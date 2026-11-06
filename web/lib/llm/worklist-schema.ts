import { z } from "zod";
import { getScoreLabel } from "../score-utils";

/**
 * The worklist report (Matt, November 5, 2026; docs/design/2026-11-worklist-report/): the score and its
 * rung, the recruiter's write-up, then one card per line that needs work, in the order a recruiter hits
 * them. No Critical Miss. Contract "v3". resume_v2.txt and its contract are untouched: reports saved under
 * it still render through the v2 path.
 */

export const WORKLIST_CONTRACT_VERSION = "v3" as const;

export const CARD_KINDS = ["line", "structure", "dates", "keep"] as const;
export type CardKind = typeof CARD_KINDS[number];

/** The most cards a report shows; the prompt asks for every line that needs obvious work. */
export const MAX_CARDS = 12;
/** A quoted line is one resume line or a bounded part of one. */
export const MAX_LINE_LENGTH = 200;
export const MAX_WRITE_UP_PARAGRAPHS = 3;

const text = (max: number) => z.string().trim().min(1).max(max);
const optionalText = (max: number) => z.string().trim().max(max);

export const WorklistCardSchema = z.object({
  kind: z.enum(CARD_KINDS),
  where: text(64),
  line: text(MAX_LINE_LENGTH),
  cannot_tell: text(600),
  example: optionalText(400),
  question: optionalText(300),
}).superRefine((card, context) => {
  if (card.kind === "keep") {
    if (card.question) context.addIssue({ code: "custom", path: ["question"], message: "a keep card asks nothing" });
    return;
  }
  if (!card.question) context.addIssue({ code: "custom", path: ["question"], message: "a card that needs work carries the question that fills its blanks" });
  if (card.kind === "line" && !card.example) context.addIssue({ code: "custom", path: ["example"], message: "a line card carries the line with the detail in" });
});
export type WorklistCard = z.infer<typeof WorklistCardSchema>;

export const WorklistFitSchema = z.object({
  roles: z.array(text(80)).max(4),
  level: optionalText(120),
  note: optionalText(800),
  posting: z.object({
    summary: optionalText(600),
    missing: z.array(text(120)).max(6),
  }),
});

export const WorklistReportSchema = z.object({
  contract_version: z.literal(WORKLIST_CONTRACT_VERSION),
  score: z.number().transform((n) => Math.min(99, Math.max(0, Math.round(n)))),
  /** The validator writes the rung from the score; the model never sets it. */
  score_label: z.string().optional(),
  lifted_by_employer: z.boolean(),
  verdict: text(240),
  write_up: z.array(text(1800)).min(1).max(MAX_WRITE_UP_PARAGRAPHS),
  cards: z.array(WorklistCardSchema).max(MAX_CARDS),
  fit: WorklistFitSchema,
  // Kept by the shared persistence layer (ensureLayoutAndContentFields); never set by the model.
  layout_score: z.number().nullable().optional(),
  layout_band: z.string().optional(),
  layout_notes: z.string().optional(),
  content_score: z.number().optional(),
}).superRefine((report, context) => {
  if (report.cards.filter((card) => card.kind === "keep").length > 1) {
    context.addIssue({ code: "custom", path: ["cards"], message: "at most one keep card" });
  }
}).transform((report) => ({ ...report, score_label: getScoreLabel(report.score) }));

export type WorklistReport = z.infer<typeof WorklistReportSchema>;

const stringValue = { type: "string" } as const;
const nonEmptyString = { type: "string", minLength: 1 } as const;

/** The contract in the JSON Schema subset OpenAI Structured Outputs accepts. Keep it aligned with resume_v3.txt. */
export const WORKLIST_REPORT_JSON_SCHEMA = {
  type: "object",
  properties: {
    contract_version: { type: "string", enum: [WORKLIST_CONTRACT_VERSION] },
    score: { type: "integer", minimum: 0, maximum: 99 },
    lifted_by_employer: { type: "boolean" },
    verdict: nonEmptyString,
    write_up: { type: "array", minItems: 1, maxItems: MAX_WRITE_UP_PARAGRAPHS, items: nonEmptyString },
    cards: {
      type: "array",
      minItems: 0,
      maxItems: MAX_CARDS,
      items: {
        type: "object",
        properties: {
          kind: { type: "string", enum: [...CARD_KINDS] },
          where: nonEmptyString,
          line: { type: "string", minLength: 1, maxLength: MAX_LINE_LENGTH },
          cannot_tell: nonEmptyString,
          example: stringValue,
          question: stringValue,
        },
        required: ["kind", "where", "line", "cannot_tell", "example", "question"],
        additionalProperties: false,
      },
    },
    fit: {
      type: "object",
      properties: {
        roles: { type: "array", minItems: 0, maxItems: 4, items: nonEmptyString },
        level: stringValue,
        note: stringValue,
        posting: {
          type: "object",
          properties: {
            summary: stringValue,
            missing: { type: "array", minItems: 0, maxItems: 6, items: nonEmptyString },
          },
          required: ["summary", "missing"],
          additionalProperties: false,
        },
      },
      required: ["roles", "level", "note", "posting"],
      additionalProperties: false,
    },
  },
  required: ["contract_version", "score", "lifted_by_employer", "verdict", "write_up", "cards", "fit"],
  additionalProperties: false,
} as const;

export const WORKLIST_REPORT_RESPONSE_FORMAT = {
  type: "json_schema",
  json_schema: {
    name: "riyp_resume_report_v3",
    strict: true,
    schema: WORKLIST_REPORT_JSON_SCHEMA,
  },
} as const;

/** Whether a report (fresh, saved, or recovered) is a worklist report. */
export function isWorklistReport(report: unknown): report is WorklistReport {
  return Boolean(report) && typeof report === "object"
    && (report as { contract_version?: unknown }).contract_version === WORKLIST_CONTRACT_VERSION
    && Array.isArray((report as { cards?: unknown }).cards);
}
