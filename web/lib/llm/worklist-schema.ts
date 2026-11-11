import { z } from "zod";
import { getWorklistScoreLabel } from "../score-utils";

/**
 * The worklist report (Matt, November 5, 2026; docs/design/2026-11-worklist-report/): the score and its
 * rung, the recruiter's write-up, then one card per line that needs work, in the order a recruiter hits
 * them. No Critical Miss. Contract "v3". resume_v2.txt and its contract are untouched: reports saved under
 * it still render through the v2 path.
 */

export const WORKLIST_CONTRACT_VERSION = "v3" as const;

/**
 * "upgrade" (Matt, Nov 7, 2026): on a strong resume, a change that makes a line that already works harder to pass
 * over (the next level up, the best result moved first, a line that dilutes the rest cut). It quotes a resume line
 * like "line", but it is optional: it never counts as a line that needs work, so Ready to send still holds.
 */
export const CARD_KINDS = ["line", "structure", "dates", "keep", "upgrade"] as const;
export type CardKind = typeof CARD_KINDS[number];

/** Kinds that quote a resume line word for word. */
export const QUOTED_KINDS: ReadonlySet<CardKind> = new Set(["line", "keep", "upgrade"]);
/** Kinds that count as a line that needs work: the band and the ending read these. */
export const WORK_KINDS: ReadonlySet<CardKind> = new Set(["line", "structure", "dates"]);

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
  if (card.kind === "upgrade") {
    // A move or a cut needs no example; an example with blanks needs the question that fills them.
    if (/\[[^\]]*\]/u.test(card.example) && !card.question) context.addIssue({ code: "custom", path: ["question"], message: "an upgrade with blanks carries the question that fills them" });
    return;
  }
  if (!card.question) context.addIssue({ code: "custom", path: ["question"], message: "a card that needs work carries the question that fills its blanks" });
  if (card.kind === "line" && !card.example) context.addIssue({ code: "custom", path: ["example"], message: "a line card carries the line with the detail in" });
});
export type WorklistCard = z.infer<typeof WorklistCardSchema>;

/**
 * Tailoring to a posting (Nov 10, 2026): lines already on the resume that answer the posting and sit too low
 * ("lead"), and lines the posting doesn't ask about, for a resume that needs the room ("trim"). Each quotes a
 * resume line word for word, like a card. Optional with no default, so a report saved before them parses to the
 * same object.
 */
export const MAX_POSTING_MOVES = 3;
const PostingMoveSchema = z.object({ line: text(MAX_LINE_LENGTH), why: text(320) });
export type PostingMove = z.infer<typeof PostingMoveSchema>;

/**
 * A profile review's status for every part of the profile (Nov 11, 2026), so a reader sees the whole profile at
 * a glance and not only the parts that got a card: the headline, the About, each job, the Top Skills. "empty"
 * is a part with nothing in it (no About, a job with no description). Written by the profile prompt only; a
 * resume report never carries it.
 */
export const PART_STATUSES = ["fine", "needs_work", "empty"] as const;
export type PartStatus = typeof PART_STATUSES[number];
export const MAX_PARTS = 16;
export const ProfilePartSchema = z.object({
  /** "Headline", "About", "Top skills", or a job's employer copied from the profile. */
  name: text(80),
  /** A job's title, copied from the profile; empty for the other parts. */
  detail: optionalText(120),
  status: z.enum(PART_STATUSES),
});
export type ProfilePart = z.infer<typeof ProfilePartSchema>;

export const WorklistFitSchema = z.object({
  roles: z.array(text(80)).max(4),
  /**
   * Why a recruiter would read the resume as the first role (Nov 7, 2026), the reason under "Which job is this
   * for?". Optional with no default: a report saved before it existed must parse to the same object, or its
   * stored signature no longer matches.
   */
  why: optionalText(240).optional(),
  level: optionalText(120),
  note: optionalText(800),
  posting: z.object({
    summary: optionalText(600),
    missing: z.array(text(120)).max(6),
    lead: z.array(PostingMoveSchema).max(MAX_POSTING_MOVES).optional(),
    trim: z.array(PostingMoveSchema).max(MAX_POSTING_MOVES).optional(),
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
  // Lines written to screening software, found in the text as submitted (lib/reports/screener-text.ts); set by
  // the route after validation, never by the model, and absent on an ordinary resume.
  screener_text: z.array(z.object({
    kind: z.enum(["instruction", "score", "posting_copy", "keyword_repeat"]),
    excerpt: text(200),
  })).max(3).optional(),
  // What the report was written about (lib/reports/report-document.ts): set by the route after validation, never
  // by the model, and absent on a resume report, so every report saved before it parses to the same object.
  document: z.literal("linkedin").optional(),
  // Every part of a profile and how it stands; a profile review only (see ProfilePartSchema).
  parts: z.array(ProfilePartSchema).max(MAX_PARTS).optional(),
  // Kept by the shared persistence layer (ensureLayoutAndContentFields); never set by the model.
  layout_score: z.number().nullable().optional(),
  layout_band: z.string().optional(),
  layout_notes: z.string().optional(),
  content_score: z.number().optional(),
}).superRefine((report, context) => {
  if (report.cards.filter((card) => card.kind === "keep").length > 1) {
    context.addIssue({ code: "custom", path: ["cards"], message: "at most one keep card" });
  }
}).transform((report) => ({ ...report, score_label: getWorklistScoreLabel(report.score) }));

export type WorklistReport = z.infer<typeof WorklistReportSchema>;

const stringValue = { type: "string" } as const;
const nonEmptyString = { type: "string", minLength: 1 } as const;

const POSTING_MOVES_JSON_SCHEMA = {
  type: "array",
  minItems: 0,
  maxItems: MAX_POSTING_MOVES,
  items: {
    type: "object",
    properties: { line: { type: "string", minLength: 1, maxLength: MAX_LINE_LENGTH }, why: nonEmptyString },
    required: ["line", "why"],
    additionalProperties: false,
  },
} as const;

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
        why: stringValue,
        level: stringValue,
        note: stringValue,
        posting: {
          type: "object",
          properties: {
            summary: stringValue,
            missing: { type: "array", minItems: 0, maxItems: 6, items: nonEmptyString },
            lead: POSTING_MOVES_JSON_SCHEMA,
            trim: POSTING_MOVES_JSON_SCHEMA,
          },
          required: ["summary", "missing", "lead", "trim"],
          additionalProperties: false,
        },
      },
      required: ["roles", "why", "level", "note", "posting"],
      additionalProperties: false,
    },
  },
  required: ["contract_version", "score", "lifted_by_employer", "verdict", "write_up", "cards", "fit"],
  additionalProperties: false,
} as const;

/** The profile review's contract: the worklist report plus the status of every part of the profile. */
export const LINKEDIN_REPORT_JSON_SCHEMA = {
  ...WORKLIST_REPORT_JSON_SCHEMA,
  properties: {
    ...WORKLIST_REPORT_JSON_SCHEMA.properties,
    parts: {
      type: "array",
      minItems: 0,
      maxItems: MAX_PARTS,
      items: {
        type: "object",
        properties: {
          name: nonEmptyString,
          detail: stringValue,
          status: { type: "string", enum: [...PART_STATUSES] },
        },
        required: ["name", "detail", "status"],
        additionalProperties: false,
      },
    },
  },
  required: [...WORKLIST_REPORT_JSON_SCHEMA.required, "parts"],
} as const;

export const LINKEDIN_REPORT_RESPONSE_FORMAT = {
  type: "json_schema",
  json_schema: {
    name: "riyp_profile_review_v3",
    strict: true,
    schema: LINKEDIN_REPORT_JSON_SCHEMA,
  },
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
