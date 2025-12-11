import { createAppError } from "./openai";

const MAX_TEXT_LENGTH = 30000;
const ALLOWED_MODES = ["resume", "resume_ideas"] as const;

export type Mode = (typeof ALLOWED_MODES)[number];

export function validateResumeFeedbackRequest(body: any): {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
  value?: { text: string; mode: Mode; jobDescription: string | null };
} {
  const fieldErrors: Record<string, string> = {};

  if (!body || typeof body !== "object") {
    return {
      ok: false,
      message: "Your request did not come through in a usable format.",
      fieldErrors: { body: "Request body must be a JSON object." }
    };
  }

  const { text, mode } = body as { text?: unknown; mode?: unknown };
  const jobDescription = (body as any).jobDescription;

  const trimmedText = typeof text === "string" ? text.trim() : "";
  if (!trimmedText) fieldErrors.text = "Paste your resume text so I can actually review it.";
  else if (trimmedText.length > MAX_TEXT_LENGTH) {
    fieldErrors.text = "Your resume text is very long. Try trimming extra content.";
  }

  let normalizedMode: Mode = "resume";
  if (mode !== undefined) {
    if (typeof mode !== "string") fieldErrors.mode = 'Mode must be "resume" or "resume_ideas".';
    else if (!(ALLOWED_MODES as readonly string[]).includes(mode)) fieldErrors.mode = 'Mode must be "resume" or "resume_ideas".';
    else normalizedMode = mode as Mode;
  }

  let normalizedJob: string | null = null;
  if (jobDescription !== undefined) {
    if (typeof jobDescription !== "string") fieldErrors.jobDescription = "Job description should be plain text.";
    else if (jobDescription.length > 8000) fieldErrors.jobDescription = "Job description is too long.";
    else normalizedJob = jobDescription.trim() || null;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      message: "Something in your request needs a quick tweak before I can give you feedback.",
      fieldErrors
    };
  }

  return {
    ok: true,
    value: { text: trimmedText, mode: normalizedMode, jobDescription: normalizedJob }
  };
}

export function validateResumeIdeasRequest(body: any): {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
  value?: { text: string };
} {
  const fieldErrors: Record<string, string> = {};

  if (!body || typeof body !== "object") {
    return {
      ok: false,
      message: "Your request did not come through in a usable format.",
      fieldErrors: { body: "Request body must be a JSON object." }
    };
  }

  const { text } = body as { text?: unknown };
  const trimmedText = typeof text === "string" ? text.trim() : "";

  if (!trimmedText) fieldErrors.text = "Paste your resume text so I can actually review it.";
  else if (trimmedText.length > MAX_TEXT_LENGTH) fieldErrors.text = "Your resume text is very long. Try trimming extra content.";

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      message: "Something in your request needs a quick tweak before I can help.",
      fieldErrors
    };
  }

  return { ok: true, value: { text: trimmedText } };
}

function normalizeScore(score: any, fieldName: string) {
  if (typeof score !== "number" || !Number.isFinite(score)) {
    throw createAppError("OPENAI_RESPONSE_SHAPE_INVALID", `The model response had an invalid ${fieldName}.`, 502);
  }
  const rounded = Math.round(score);
  if (rounded < 0) return 0;
  if (rounded > 100) return 100;
  return rounded;
}

export function ensureLayoutAndContentFields(obj: any) {
  const normalizedLayoutScore =
    obj.layout_score === null || typeof obj.layout_score === "undefined"
      ? null
      : normalizeScore(obj.layout_score, "layout_score");

  const normalizedContentScore = normalizeScore(
    typeof obj.content_score === "number" ? obj.content_score : obj.score,
    "content_score"
  );

  obj.score = normalizeScore(obj.score, "score");
  obj.layout_score = normalizedLayoutScore;
  obj.layout_band = typeof obj.layout_band === "string" ? obj.layout_band : "unknown";
  obj.layout_notes = typeof obj.layout_notes === "string" ? obj.layout_notes : "";
  obj.content_score = normalizedContentScore;
  return obj;
}

export function validateResumeModelPayload(obj: any) {
  if (!obj || typeof obj !== "object") {
    throw createAppError("OPENAI_RESPONSE_SHAPE_INVALID", "The model response did not match the expected format.", 502);
  }

  obj.score = normalizeScore(obj.score, "score");

  const requiredStrings = ["score_label", "score_comment_short", "score_comment_long", "summary"];
  for (const key of requiredStrings) {
    if (typeof obj[key] !== "string") {
      throw createAppError("OPENAI_RESPONSE_SHAPE_INVALID", `The model response was missing ${key}.`, 502);
    }
  }

  const requiredArrays = ["strengths", "gaps", "rewrites", "next_steps"];
  for (const key of requiredArrays) {
    if (!Array.isArray(obj[key])) {
      throw createAppError("OPENAI_RESPONSE_SHAPE_INVALID", `The model response field "${key}" was not in the expected format.`, 502);
    }
  }

  if (Array.isArray(obj.rewrites)) {
    for (const item of obj.rewrites) {
      if (!item || typeof item !== "object") {
        throw createAppError("OPENAI_RESPONSE_SHAPE_INVALID", "One of the rewrite suggestions was not structured correctly.", 502);
      }
      for (const key of ["label", "original", "better", "enhancement_note"]) {
        if (typeof item[key] !== "string") {
          throw createAppError("OPENAI_RESPONSE_SHAPE_INVALID", "One of the rewrite suggestions was missing a text field.", 502);
        }
      }
    }
  }

  return ensureLayoutAndContentFields(obj);
}

export function validateResumeIdeasPayload(obj: any) {
  if (!obj || typeof obj !== "object") {
    throw createAppError("OPENAI_RESPONSE_SHAPE_INVALID", "The model response did not match the expected format.", 502);
  }

  if (!Array.isArray(obj.questions)) {
    throw createAppError("OPENAI_RESPONSE_SHAPE_INVALID", "The model response was missing questions.", 502);
  }
  if (!Array.isArray(obj.notes)) {
    throw createAppError("OPENAI_RESPONSE_SHAPE_INVALID", "The model response was missing notes.", 502);
  }
  if (typeof obj.how_to_use !== "string") {
    throw createAppError("OPENAI_RESPONSE_SHAPE_INVALID", "The model response was missing how_to_use.", 502);
  }

  return obj;
}

