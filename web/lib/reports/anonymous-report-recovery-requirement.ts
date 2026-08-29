import { isAnonymousRecoveryId } from "./anonymous-report-recovery";

export const ANONYMOUS_REPORT_RECOVERY_STORAGE_REQUIRED_MESSAGE =
  "This browser could not store the recovery reference required for a free report. Allow site storage, then try again.";

export function requireAnonymousReportRecoveryId(input: {
  mode: string;
  userId: string | null;
  bypass: boolean;
  recoveryId: unknown;
}) {
  const recoveryId = isAnonymousRecoveryId(input.recoveryId)
    ? input.recoveryId.toLowerCase()
    : null;
  // Resume ideas has its own fail-closed access reservation. Do not broaden
  // this report-recovery precondition to a route that never stores a report.
  if (input.mode !== "resume" || input.userId || input.bypass) return recoveryId;
  if (recoveryId) return recoveryId;
  const error = new Error(ANONYMOUS_REPORT_RECOVERY_STORAGE_REQUIRED_MESSAGE) as Error & {
    code: string;
    httpStatus: number;
  };
  error.code = "RECOVERY_STORAGE_REQUIRED";
  error.httpStatus = 409;
  throw error;
}
