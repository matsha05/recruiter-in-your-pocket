import { clearAnonymousReportRecoveryMarker } from "./anonymous-report-recovery-client";

export async function parseGenerationFailureResponse(response: Response) {
  let message = `The report request failed with status ${response.status}. Please try again.`;
  let errorCode: string | undefined;
  let operationId: string | null = null;
  try {
    const body = await response.json();
    if (typeof body?.message === "string") message = body.message;
    if (typeof body?.errorCode === "string") errorCode = body.errorCode;
    if (typeof body?.operation_id === "string") operationId = body.operation_id;
  } catch {
    // The marker stays recoverable when the response does not prove terminality.
  }
  return { message, errorCode, operationId };
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
