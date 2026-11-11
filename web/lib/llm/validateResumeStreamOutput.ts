import { resolveResumeRepairReasoningEffort } from "@/lib/llm/model-config";
import { extractJsonFromText } from "../backend/openai";
import {
  ensureLayoutAndContentFields,
  validateCaseInterviewPayload,
  validateCaseNegotiationPayload,
  validateCaseResumePayload,
  validateResumeIdeasPayload,
  validateResumeModelPayload,
} from "../backend/validation";
import { logError, logInfo, logWarn } from "../observability/logger";
import { recordLaunchSignal } from "../observability/launchSignals";
import { runJson } from "./orchestrator";
import {
  buildResumeRepairMessages,
  isRepairableResumeResponseError,
} from "./reportRepair";
import { isStableOpenAITransportError } from "../backend/openai-transport";
import { isWorklistReportEnabled } from "../reports/report-shape";
import { isWorklistReport } from "./worklist-schema";
import { validateWorklistPayload } from "./worklist-validator";
import { buildWorklistRepairMessages } from "./worklist-repair";

type ResumeMode =
  | "resume"
  | "resume_ideas"
  | "case_resume"
  | "case_interview"
  | "case_negotiation"
  | "linkedin";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

/**
 * The resume report's validator: the worklist validator when the worklist prompt wrote the draft (or the
 * draft says so), the Critical Miss validator otherwise. A v2 draft under the worklist flag is refused by
 * the worklist validator and repaired into the worklist shape.
 */
export function validateResumePayload(parsed: unknown, text: string, options?: { forceGrounding?: boolean; jobDescription?: string }) {
  if (isWorklistReportEnabled() || isWorklistReport(parsed)) {
    return validateWorklistPayload(parsed, text, options);
  }
  return validateResumeModelPayload(parsed, text, options);
}

export async function validateResumeStreamOutput(input: {
  raw: string;
  text: string;
  mode: ResumeMode;
  model: string;
  messages: ChatMessage[];
  requestId: string;
  route: string;
  userIdForLogs?: string;
  validationOptions?: { forceGrounding?: boolean; jobDescription?: string };
  signal?: AbortSignal;
  /** The contract the first call was made under, when it isn't the mode's own, so the repair matches it. */
  responseFormat?: unknown;
}) {
  try {
    const parsedJson = extractJsonFromText(input.raw);
    let payload: any;
    if (input.mode === "resume_ideas") {
      payload = validateResumeIdeasPayload(parsedJson);
    } else if (input.mode === "case_resume") {
      payload = validateCaseResumePayload(parsedJson);
    } else if (input.mode === "case_interview") {
      payload = validateCaseInterviewPayload(parsedJson);
    } else if (input.mode === "case_negotiation") {
      payload = validateCaseNegotiationPayload(parsedJson);
    } else {
      payload = ensureLayoutAndContentFields(
        validateResumePayload(parsedJson, input.text, input.validationOptions)
      );
    }
    return { payload, replacementRaw: null as string | null, repairMs: 0 };
  } catch (error: any) {
    if (input.mode !== "resume" || !isRepairableResumeResponseError(error)) {
      logError({
        msg: "llm.response.validation_failed",
        request_id: input.requestId,
        route: input.route,
        user_id: input.userIdForLogs,
        http: { body_bytes: input.raw?.length || 0 },
        err: {
          name: error?.name || "ValidationError",
          message: error?.message || "Response validation failed",
        },
      });
      const validationError = new Error("The model's answer didn't come back in a shape we could read. Your resume wasn't the problem. Try again.") as Error & {
        code: string;
      };
      validationError.code = "OPENAI_RESPONSE_PARSE_ERROR";
      throw validationError;
    }

    recordLaunchSignal("riyp.report.repair", { result: "started" });
    logWarn({
      msg: "llm.response.repair_started",
      request_id: input.requestId,
      route: input.route,
      user_id: input.userIdForLogs,
      http: { body_bytes: input.raw?.length || 0 },
      err: {
        name: error?.name || "ValidationError",
        message: error?.message || "Response validation failed",
      },
    });

    const repairStartedAt = Date.now();
    const worklist = isWorklistReportEnabled();
    try {
      const repaired = await runJson<any>({
        ctx: {
          request_id: input.requestId,
          user_id: input.userIdForLogs,
          route: input.route,
        },
        task: "resume_feedback",
        mode: "resume",
        model: input.model,
        prompt_version: worklist ? "resume_v3_repair" : "resume_v2_repair",
        reasoning_effort: resolveResumeRepairReasoningEffort(input.model),
        schema_version: worklist ? "report_v3" : "report_v1",
        messages: worklist
          ? buildWorklistRepairMessages(input.messages, input.raw, error)
          : buildResumeRepairMessages(input.messages, input.raw, error),
        signal: input.signal,
        response_format: input.responseFormat,
      });
      const payload = ensureLayoutAndContentFields(
        validateResumePayload(repaired.parsed, input.text, input.validationOptions)
      );
      recordLaunchSignal("riyp.report.repair", { result: "completed" });
      logInfo({
        msg: "llm.response.repair_completed",
        request_id: input.requestId,
        route: input.route,
        user_id: input.userIdForLogs,
      });
      return { payload, replacementRaw: repaired.raw, repairMs: Date.now() - repairStartedAt };
    } catch (repairError: any) {
      if (isStableOpenAITransportError(repairError)) throw repairError;
      recordLaunchSignal("riyp.report.repair", { result: "failed" });
      logError({
        msg: "llm.response.repair_failed",
        request_id: input.requestId,
        route: input.route,
        user_id: input.userIdForLogs,
        err: {
          name: repairError?.name || "ValidationError",
          message: repairError?.message || "Response repair failed",
          code: repairError?.code,
        },
      });
      const validationError = new Error(
        "We couldn’t finish this report on our side. Your resume wasn’t the problem. Try again in a minute."
      ) as Error & { code: string };
      validationError.code = "OPENAI_RESPONSE_SHAPE_INVALID";
      throw validationError;
    }
  }
}
