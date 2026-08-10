import { createAppError } from "./errors";
import { assertReportGrounding, ResumeFeedbackResponseSchema } from "../validation/schemas";
import { getScoreLabel } from "../score-utils";
import { canonicalizeResumeReportEvidence } from "../llm/evidence-canonicalizer";
import { calibrateResumeScore } from "../llm/resume-score-calibration";
import { positiveSourceContradictions, removeUnsafeRewrites } from "../llm/source-fidelity";
import { ambiguousReportSourceLocators } from "../llm/report-source-locators";

const MAX_TEXT_LENGTH = 30000;
const ALL_MODES = ["resume", "resume_ideas", "case_resume", "case_interview", "case_negotiation", "linkedin"] as const;
// This validator fronts the public resume report endpoints. Other product
// modes have dedicated routes and must not be reachable by changing JSON.
const ALLOWED_MODES: readonly Mode[] = ["resume"];

export type Mode = (typeof ALL_MODES)[number];

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
  if (!trimmedText) fieldErrors.text = "Paste your resume text so I can actually look at it.";
  else if (trimmedText.length > MAX_TEXT_LENGTH) {
    fieldErrors.text = "Your resume text is very long. Try trimming extra content.";
  }

  let normalizedMode: Mode = "resume";
  if (mode !== undefined) {
    if (typeof mode !== "string") fieldErrors.mode = 'Mode must be "resume".';
    else if (!(ALLOWED_MODES as readonly string[]).includes(mode)) fieldErrors.mode = 'Mode must be "resume".';
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

  if (!trimmedText) fieldErrors.text = "Paste your resume text so I can actually look at it.";
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
  obj.score_label = getScoreLabel(obj.score);
  obj.layout_score = normalizedLayoutScore;
  obj.layout_band = typeof obj.layout_band === "string" ? obj.layout_band : "unknown";
  obj.layout_notes = typeof obj.layout_notes === "string" ? obj.layout_notes : "";
  obj.content_score = normalizedContentScore;
  return obj;
}

export function validateResumeModelPayload(
  obj: any,
  resumeText?: string,
  options: { forceGrounding?: boolean; jobDescription?: string } = {},
) {
  if (!obj || typeof obj !== "object") {
    throw createAppError("OPENAI_RESPONSE_SHAPE_INVALID", "The model response did not match the expected format.", 502);
  }

  const isMockOpenAI = ["1", "true", "TRUE"].includes(String(process.env.USE_MOCK_OPENAI || "").trim());
  const shouldGround = Boolean(resumeText && (options.forceGrounding || !isMockOpenAI));
  if (resumeText && shouldGround) {
    const contradictions = positiveSourceContradictions(obj, resumeText, options.jobDescription);
    if (contradictions.length > 0) {
      throw createAppError(
        "OPENAI_RESPONSE_SHAPE_INVALID",
        `The model response failed the evidence grounding contract: contradicted positive source evidence at ${contradictions[0].path}.`,
        502,
      );
    }
    const ambiguousLocators = ambiguousReportSourceLocators(obj, resumeText);
    if (ambiguousLocators.length > 0) {
      throw createAppError(
        "OPENAI_RESPONSE_SHAPE_INVALID",
        `The model response used ambiguous source evidence: ${ambiguousLocators.join(", ")}.`,
        502,
      );
    }
    obj = canonicalizeResumeReportEvidence(obj, resumeText).report;
    const rewriteScreen = removeUnsafeRewrites(obj, resumeText);
    if (rewriteScreen.removed.length > 0) {
      throw createAppError(
        "OPENAI_RESPONSE_SHAPE_INVALID",
        `The model response failed the evidence grounding contract at rewrites[${rewriteScreen.removed[0].index}].better source fidelity.`,
        502,
      );
    }
    obj = rewriteScreen.report;
  }

  obj.score = normalizeScore(obj.score, "score");
  if (typeof obj.contract_version === "undefined") {
    obj.contract_version = "v2";
  }

  const requiredStrings = [
    "score_label",
    "score_comment_short",
    "score_comment_long",
    "score_plain",
    "first_impression",
    "biggest_gap_example",
    "first_impression_takeaway",
    "summary"
  ];
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

  const parsed = ResumeFeedbackResponseSchema.safeParse(obj);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    const path = firstIssue?.path?.join(".") || "response";
    throw createAppError(
      "OPENAI_RESPONSE_SHAPE_INVALID",
      `The model response failed the recruiter briefing contract at ${path}.`,
      502
    );
  }

  if (resumeText && shouldGround) {
    const grounding = assertReportGrounding(parsed.data, resumeText, options.jobDescription);
    if (!grounding.ok) {
      const issue = grounding.missingEvidence[0] || grounding.inventedSpecifics[0] || "response";
      throw createAppError(
        "OPENAI_RESPONSE_SHAPE_INVALID",
        `The model response failed the evidence grounding contract at ${issue}.`,
        502,
        { grounding }
      );
    }
  }

  const calibrated = resumeText && shouldGround
    ? calibrateResumeScore(parsed.data, resumeText).report
    : parsed.data;
  return ensureLayoutAndContentFields(calibrated);
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

export function validateCaseResumePayload(obj: any) {
  if (!obj || typeof obj !== "object") {
    throw createAppError("OPENAI_RESPONSE_SHAPE_INVALID", "The model response did not match the expected format.", 502);
  }
  // Basic checks
  if (!obj.verdict || !["shortlist", "maybe", "pass"].includes(obj.verdict)) {
    throw createAppError("OPENAI_RESPONSE_SHAPE_INVALID", "Missing or invalid verdict.", 502);
  }
  if (!Array.isArray(obj.signal_ladder)) {
    throw createAppError("OPENAI_RESPONSE_SHAPE_INVALID", "Missing signal_ladder array.", 502);
  }
  return obj;
}

export function validateCaseInterviewPayload(obj: any) {
  if (!obj || typeof obj !== "object") {
    throw createAppError("OPENAI_RESPONSE_SHAPE_INVALID", "The model response did not match the expected format.", 502);
  }
  if (!obj.scorecard) {
    throw createAppError("OPENAI_RESPONSE_SHAPE_INVALID", "Missing scorecard.", 502);
  }
  if (!obj.improved_answer) {
    throw createAppError("OPENAI_RESPONSE_SHAPE_INVALID", "Missing improved_answer.", 502);
  }
  return obj;
}

export function validateCaseNegotiationPayload(obj: any) {
  if (!obj || typeof obj !== "object") {
    throw createAppError("OPENAI_RESPONSE_SHAPE_INVALID", "The model response did not match the expected format.", 502);
  }

  if (typeof obj.strategy_summary !== "string") {
    throw createAppError("OPENAI_RESPONSE_SHAPE_INVALID", "Missing strategy_summary.", 502);
  }
  if (!Array.isArray(obj.levers_checklist)) {
    throw createAppError("OPENAI_RESPONSE_SHAPE_INVALID", "Missing levers_checklist.", 502);
  }
  for (const item of obj.levers_checklist) {
    if (!item || typeof item !== "object") {
      throw createAppError("OPENAI_RESPONSE_SHAPE_INVALID", "Invalid levers_checklist item.", 502);
    }
    for (const key of ["lever", "status", "coach_note"]) {
      if (typeof (item as any)[key] !== "string") {
        throw createAppError("OPENAI_RESPONSE_SHAPE_INVALID", "Invalid levers_checklist item fields.", 502);
      }
    }
  }

  if (!obj.ask_script || typeof obj.ask_script !== "object") {
    throw createAppError("OPENAI_RESPONSE_SHAPE_INVALID", "Missing ask_script.", 502);
  }
  if (typeof obj.ask_script.email_subject !== "string" || typeof obj.ask_script.email_body !== "string") {
    throw createAppError("OPENAI_RESPONSE_SHAPE_INVALID", "Missing ask_script email fields.", 502);
  }
  if (!Array.isArray(obj.ask_script.call_script_bullets)) {
    throw createAppError("OPENAI_RESPONSE_SHAPE_INVALID", "Missing ask_script call_script_bullets.", 502);
  }
  for (const bullet of obj.ask_script.call_script_bullets) {
    if (typeof bullet !== "string") {
      throw createAppError("OPENAI_RESPONSE_SHAPE_INVALID", "Invalid ask_script call_script_bullets.", 502);
    }
  }

  if (typeof obj.risk_assessment !== "string") {
    throw createAppError("OPENAI_RESPONSE_SHAPE_INVALID", "Missing risk_assessment.", 502);
  }
  if (typeof obj.fallback_plan !== "string") {
    throw createAppError("OPENAI_RESPONSE_SHAPE_INVALID", "Missing fallback_plan.", 502);
  }

  return obj;
}
