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
import { runJson } from "./orchestrator";
import {
  buildResumeRepairMessages,
  isRepairableResumeResponseError,
} from "./reportRepair";

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

export async function validateResumeStreamOutput(input: {
  raw: string;
  text: string;
  mode: ResumeMode;
  model: string;
  messages: ChatMessage[];
  requestId: string;
  route: string;
  userIdForLogs?: string;
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
        validateResumeModelPayload(parsedJson, input.text)
      );
    }
    return { payload, replacementRaw: null as string | null };
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
      const validationError = new Error("Could not parse the response. Please try again.") as Error & {
        code: string;
      };
      validationError.code = "OPENAI_RESPONSE_PARSE_ERROR";
      throw validationError;
    }

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
        prompt_version: "resume_v2_repair",
        schema_version: "report_v1",
        messages: buildResumeRepairMessages(input.messages, input.raw, error),
      });
      const payload = ensureLayoutAndContentFields(
        validateResumeModelPayload(repaired.parsed, input.text)
      );
      logInfo({
        msg: "llm.response.repair_completed",
        request_id: input.requestId,
        route: input.route,
        user_id: input.userIdForLogs,
      });
      return { payload, replacementRaw: repaired.raw };
    } catch (repairError: any) {
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
        "The report did not pass its evidence check. Please try again."
      ) as Error & { code: string };
      validationError.code = "OPENAI_RESPONSE_SHAPE_INVALID";
      throw validationError;
    }
  }
}
