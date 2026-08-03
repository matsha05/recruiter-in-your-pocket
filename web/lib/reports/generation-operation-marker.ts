import { clearAnonymousReportRecoveryMarker } from "./anonymous-report-recovery-client";

export async function parseGenerationFailureResponse(response: Response) {
  let message = `The report request failed with status ${response.status}. Please try again.`;
  let errorCode: string | undefined;
  let operationId: string | null = null;
  let accessConsumed: boolean | null = null;
  let attemptConsumed: boolean | undefined;
  let attemptDisposition: "consumed" | "restored" | "unknown" | "not_started" | undefined;
  let creditRestored = false;
  try {
    const body = await response.json();
    if (typeof body?.message === "string") message = body.message;
    if (typeof body?.errorCode === "string") errorCode = body.errorCode;
    if (typeof body?.operation_id === "string") operationId = body.operation_id;
    if (
      body?.attempt_disposition === "consumed"
      || body?.attempt_disposition === "restored"
      || body?.attempt_disposition === "unknown"
      || body?.attempt_disposition === "not_started"
    ) {
      attemptDisposition = body.attempt_disposition;
    }
    creditRestored = body?.credit_restored === true;

    if (attemptDisposition !== "unknown") {
      if (typeof body?.attempt_consumed === "boolean") {
        attemptConsumed = body.attempt_consumed;
      } else if (typeof body?.access_consumed === "boolean") {
        attemptConsumed = body.access_consumed;
      } else if (attemptDisposition === "consumed") {
        attemptConsumed = true;
      } else if (attemptDisposition === "restored" || attemptDisposition === "not_started") {
        attemptConsumed = false;
      }
    }
    accessConsumed = attemptDisposition === "unknown"
      ? null
      : typeof body?.access_consumed === "boolean"
        ? body.access_consumed
        : attemptConsumed ?? null;
  } catch {
    // The marker stays recoverable when the response does not prove terminality.
  }
  return {
    message,
    errorCode,
    operationId,
    accessConsumed,
    attemptConsumed,
    attemptDisposition,
    creditRestored,
  };
}

export function retireTerminalGenerationMarker(input: {
  markerId?: string | null;
  errorCode?: string | null;
  acknowledgedOperationId?: string | null;
  restored?: boolean;
}) {
  if (!input.markerId) return;
  const opaqueConflict = input.errorCode === "GENERATION_OPERATION_CONFLICT";
  const acknowledgedTerminal = input.acknowledgedOperationId === input.markerId && (
    input.restored
    || input.errorCode === "GENERATION_OPERATION_TERMINAL"
    || input.errorCode === "PAYWALL_REQUIRED"
  );
  if (opaqueConflict || acknowledgedTerminal) {
    clearAnonymousReportRecoveryMarker(input.markerId);
  }
}
