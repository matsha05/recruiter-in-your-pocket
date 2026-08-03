import { captureOperationalError } from "../observability/operations";
import { logError, logInfo } from "../observability/logger";
import type { GenerationAccessReservation, GenerationAccessRpcClient } from "./generationAccess";
import { appendFailureDisposition, logGenerationReleaseFailure, settleGenerationFailure } from "./generationFailure";

type StreamFailureContext = {
  request_id: string;
  route: string;
  method: string;
  path: string;
  user_id?: string;
  startedAt: number;
};

export async function handleGenerationStreamFailure(input: {
  error: any;
  attemptConsumed: boolean;
  reservation: GenerationAccessReservation;
  admin: GenerationAccessRpcClient | null;
  controller: ReadableStreamDefaultController<Uint8Array>;
  encoder: TextEncoder;
  context: StreamFailureContext;
}) {
  const { error, context } = input;
  const disposition = await settleGenerationFailure({
    reservation: input.reservation,
    admin: input.admin,
    error,
    attemptConsumed: input.attemptConsumed,
  });
  logGenerationReleaseFailure(disposition, context);

  const code = error?.code || "INTERNAL_SERVER_ERROR";
  if (code !== "GENERATION_PAUSED" && code !== "GENERATION_BUDGET_EXHAUSTED" && code !== "CLIENT_CANCELED") {
    captureOperationalError(error, {
      operation: "generation.resume_feedback_stream",
      tags: { error_code: String(code) },
    });
  }
  const baseMessage = code === "OPENAI_TIMEOUT"
    ? "This is taking longer than usual. Try again in a moment."
    : code === "CLIENT_CANCELED"
      ? "Analysis stopped before the report was complete."
      : code === "OPENAI_NETWORK_ERROR"
        ? "Connection hiccup. Try again in a moment."
        : error?.message || "The report could not be completed.";
  const message = appendFailureDisposition(baseMessage, disposition);

  try {
    input.controller.enqueue(input.encoder.encode(`${JSON.stringify({
      type: "error",
      errorCode: code,
      message,
      attempt_consumed: disposition.attemptConsumed,
      credit_restored: disposition.creditRestored,
    })}\n`));
    input.controller.close();
  } catch {
    // The entitlement settlement above remains authoritative after disconnect.
  }

  const completionLog = {
    msg: "http.request.completed",
    request_id: context.request_id,
    route: context.route,
    method: context.method,
    path: context.path,
    status: code === "CLIENT_CANCELED" ? 499 : 500,
    latency_ms: Date.now() - context.startedAt,
    outcome: code === "CLIENT_CANCELED" ? "client_disconnect" as const : "internal_error" as const,
    err: {
      name: error?.name || "Error",
      message: error?.message || message,
      code: String(code),
      stack: error?.stack,
    },
  };
  if (code === "CLIENT_CANCELED") logInfo(completionLog);
  else logError(completionLog);
}
