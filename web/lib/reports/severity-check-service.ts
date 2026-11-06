import "server-only";

import { ensureLayoutAndContentFields, validateResumeModelPayload } from "../backend/validation";
import { ResumeFeedbackResponseSchema } from "../validation/resume-report-schema";
import { todayForPrompt } from "../llm/prompt-date";
import {
  requestSeverityCheck,
  SEVERITY_CHECK_PROMPT_VERSION,
  SEVERITY_CHECK_TIMEOUT_MS,
  type SeverityCheckAnswer,
  type SeverityCheckResponse,
  type SeverityKind,
} from "../llm/severity-check-model";
import { criticalCount, keepsFirstFix, mergeSeverityCheck, sameFirstFix, type SeveritySkip } from "./severity-check";
import { isWorklistReport, type WorklistReport } from "../llm/worklist-schema";
import { validateWorklistPayload } from "../llm/worklist-validator";
import { mergeSeverityIntoWorklist, worklistAsSeverityReport } from "./worklist-severity";

export type SeverityOutcomeKind = "added" | "none" | "fallback" | "error";
export type SeverityReason = "added" | "promoted" | "none" | "validation" | "first_fix_changed" | "timeout" | "provider";

export interface SeverityOutcome {
  /** The report to ship: the merged one, or the original when the check failed. */
  payload: any;
  outcome: SeverityOutcomeKind;
  reason: SeverityReason;
  /** Kinds of the new Critical Misses that shipped, in order. */
  added: SeverityKind[];
  /** Existing fixes (1 = Fix 2, 2 = Fix 3) that shipped as Critical Misses. */
  promoted: number[];
  /** Existing fixes that a new Critical Miss on the same line replaced. */
  replaced: number[];
  /** The added Critical Miss that leads the report ahead of the model's first fix, when the merge rule applied. */
  led: SeverityKind | null;
  skipped: SeveritySkip[];
  critical_count: number;
  more_critical: boolean;
  /** The model call plus the validation of the merged report. */
  latency_ms: number;
  call_latency_ms?: number;
  validation_attempts: number;
  cost_usd: number | null;
  model?: string;
  prompt_version: string;
  /** The model's answer, kept for eval replays. */
  answer?: SeverityCheckAnswer;
  detail?: string;
}

type ValidationOptions = { forceGrounding?: boolean; jobDescription?: string };

// A request that never settles must not hold the report: past this, the report ships as written.
const DEADLINE_SLACK_MS = 5_000;

function withDeadline<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(Object.assign(new Error("Severity check passed its deadline"), { code: "OPENAI_TIMEOUT" })), ms);
  });
  return Promise.race([promise, deadline]).finally(() => clearTimeout(timer));
}

/**
 * Merges a severity answer into a validated report and validates the result. Never throws. The merged
 * report goes through the same validator and fabrication guard as the report itself; when that fails
 * with two new fixes it retries with the first only, and then ships the existing fixes with their flags
 * (promotions only change flags and order, never text). The first fix must come out unchanged, in the
 * position the merge gave it (see `mergeSeverityCheck` for the one case where a structural miss leads).
 */
export function settleSeverityCheck(input: {
  payload: any;
  answer: SeverityCheckAnswer;
  resumeText: string;
  validationOptions?: ValidationOptions;
}): Omit<SeverityOutcome, "latency_ms" | "cost_usd" | "prompt_version"> {
  const newCount = input.answer.critical_misses.slice(0, 2).filter((item) => item.source === "new").length;
  const limits = newCount >= 2 ? [2, 1] : newCount === 1 ? [1] : [];
  let attempts = 0;
  let detail: string | undefined;
  let firstFixChanged = false;
  const finish = (merged: ReturnType<typeof mergeSeverityCheck>, payload: any) => {
    const count = criticalCount(payload);
    const outcome: SeverityOutcomeKind = count > 1 ? "added" : "none";
    return {
      payload,
      outcome,
      reason: (count <= 1 ? "none" : merged.added.length > 0 ? "added" : "promoted") as SeverityReason,
      added: merged.added,
      promoted: merged.promoted,
      replaced: merged.replaced,
      led: merged.led,
      skipped: merged.skipped,
      critical_count: count,
      more_critical: payload.more_critical === true,
      validation_attempts: attempts,
      answer: input.answer,
      detail,
    };
  };
  for (const limit of limits) {
    const merged = mergeSeverityCheck(input.payload, input.answer, limit);
    if (merged.added.length === 0) continue;
    attempts += 1;
    try {
      const validated = ensureLayoutAndContentFields(
        validateResumeModelPayload(structuredClone(merged.report), input.resumeText, input.validationOptions),
      );
      if (!keepsFirstFix(input.payload, merged, validated)) {
        firstFixChanged = true;
        continue;
      }
      return finish(merged, validated);
    } catch (error: any) {
      detail = String(error?.message || error).slice(0, 300);
    }
  }
  // Promotions and the flags alone: the text was already validated, so the schema check is enough.
  const flagsOnly = mergeSeverityCheck(input.payload, input.answer, 0);
  const parsed = ResumeFeedbackResponseSchema.safeParse(flagsOnly.report);
  const promotedOnly = flagsOnly.promoted.length > 0;
  // Proposed fixes that all failed, with nothing to promote, are a fallback: the report ships as it was.
  if (parsed.success && sameFirstFix(input.payload, flagsOnly.report) && (newCount === 0 || promotedOnly)) {
    return finish(flagsOnly, { ...input.payload, top_fixes: flagsOnly.report.top_fixes, more_critical: flagsOnly.report.more_critical });
  }
  return {
    payload: input.payload,
    outcome: "fallback",
    reason: firstFixChanged ? "first_fix_changed" : "validation",
    added: [],
    promoted: [],
    replaced: [],
    led: null,
    skipped: flagsOnly.skipped,
    critical_count: criticalCount(input.payload),
    more_critical: false,
    validation_attempts: attempts,
    answer: input.answer,
    detail: detail || (parsed.success ? "first fix changed" : parsed.error.issues[0]?.message),
  };
}

/**
 * The severity check on a worklist report: the same call, with the cards shown as the report's fixes, and
 * each new structural item added as a card unless the model already carded that line. Validation of the
 * merged report runs the worklist validator; a merge it refuses ships the model's own cards unchanged.
 */
export function settleWorklistSeverityCheck(input: {
  payload: WorklistReport;
  answer: SeverityCheckAnswer;
  resumeText: string;
  validationOptions?: ValidationOptions;
}): Omit<SeverityOutcome, "latency_ms" | "cost_usd" | "prompt_version"> {
  // The worklist has no Critical Miss; the signal's count reads as one plus the cards the check added.
  const base = {
    promoted: [] as number[],
    replaced: [] as number[],
    led: null,
    critical_count: 1,
    more_critical: false,
    answer: input.answer,
  };
  const limits = [2, 1];
  let attempts = 0;
  let detail: string | undefined;
  for (const limit of limits) {
    const merged = mergeSeverityIntoWorklist(input.payload, input.answer, limit);
    if (merged.added.length === 0) {
      return { ...base, payload: input.payload, outcome: "none", reason: "none", added: [], skipped: merged.skipped.map((skip) => ({ kind: skip.kind, reason: skip.reason === "promotion" ? "no_such_fix" : skip.reason === "already_carded" ? "already_flagged" : "empty" })), validation_attempts: attempts, detail };
    }
    attempts += 1;
    try {
      const validated = ensureLayoutAndContentFields(validateWorklistPayload(structuredClone(merged.report), input.resumeText, input.validationOptions));
      return { ...base, critical_count: 1 + merged.added.length, payload: validated, outcome: "added", reason: "added", added: merged.added, skipped: merged.skipped.map((skip) => ({ kind: skip.kind, reason: skip.reason === "promotion" ? "no_such_fix" : skip.reason === "already_carded" ? "already_flagged" : "empty" })), validation_attempts: attempts, detail };
    } catch (error: any) {
      detail = String(error?.message || error).slice(0, 300);
    }
  }
  return { ...base, payload: input.payload, outcome: "fallback", reason: "validation", added: [], skipped: [], validation_attempts: attempts, detail };
}

/**
 * Runs the severity check on a validated resume report. Never throws: on any failure the report ships
 * unchanged, with its one Critical Miss, as before the check existed.
 */
export async function applySeverityCheck(input: {
  payload: any;
  resumeText: string;
  validationOptions?: ValidationOptions;
  today?: string;
  signal?: AbortSignal;
  request?: (args: Parameters<typeof requestSeverityCheck>[0]) => Promise<SeverityCheckResponse>;
  /** Defaults to the call's own timeout plus a few seconds. */
  deadlineMs?: number;
}): Promise<SeverityOutcome> {
  const startedAt = Date.now();
  const worklist = isWorklistReport(input.payload);
  let response: SeverityCheckResponse;
  try {
    response = await withDeadline((input.request || requestSeverityCheck)({
      resumeText: input.resumeText,
      report: worklist ? worklistAsSeverityReport(input.payload) : input.payload,
      today: input.today || todayForPrompt(),
      signal: input.signal,
    }), input.deadlineMs ?? SEVERITY_CHECK_TIMEOUT_MS + DEADLINE_SLACK_MS);
  } catch (error: any) {
    const code = String(error?.code || "");
    return {
      payload: input.payload,
      outcome: "error",
      reason: code === "OPENAI_TIMEOUT" ? "timeout" : "provider",
      added: [],
      promoted: [],
      replaced: [],
      led: null,
      skipped: [],
      critical_count: criticalCount(input.payload),
      more_critical: false,
      latency_ms: Date.now() - startedAt,
      validation_attempts: 0,
      cost_usd: null,
      prompt_version: SEVERITY_CHECK_PROMPT_VERSION,
      detail: code || String(error?.message || "unknown").slice(0, 120),
    };
  }
  const settled = worklist
    ? settleWorklistSeverityCheck({ payload: input.payload, answer: response.answer, resumeText: input.resumeText, validationOptions: input.validationOptions })
    : settleSeverityCheck({
      payload: input.payload,
      answer: response.answer,
      resumeText: input.resumeText,
      validationOptions: input.validationOptions,
    });
  return {
    ...settled,
    latency_ms: Date.now() - startedAt,
    call_latency_ms: response.latency_ms,
    cost_usd: response.cost_usd,
    model: response.model,
    prompt_version: SEVERITY_CHECK_PROMPT_VERSION,
  };
}
