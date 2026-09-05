import { attachStoredReportId, buildPdfExportRequest } from "./pdf-export";
import { clearAnonymousReportRecoveryMarker } from "./anonymous-report-recovery-client";
import { ClientActionError } from "../client-action-error";

type FetchLike = typeof fetch;
const inFlightSaves = new WeakMap<object, Promise<any>>();

export function needsReceiptValidatedSave(report: unknown) {
  if (!report || typeof report !== "object" || buildPdfExportRequest(report)) return false;
  const candidate = report as { report_receipt?: unknown; recovery_id?: unknown };
  return typeof candidate.recovery_id === "string" || typeof candidate.report_receipt === "string";
}

async function postReceiptValidatedReport(report: object, fetchImpl: FetchLike) {
  const recoveryId = typeof (report as { recovery_id?: unknown }).recovery_id === "string"
    ? (report as { recovery_id: string }).recovery_id
    : null;
  const response = await fetchImpl(recoveryId ? "/api/reports/recovery" : "/api/reports", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(recoveryId ? { recovery_id: recoveryId } : { report }),
  });
  const result = await response.json();
  if (!response.ok || !result.ok) {
    if (
      recoveryId
      && (result.errorCode === "REPORT_RECEIPT_CONSUMED" || result.errorCode === "RECOVERED_REPORT_GONE")
    ) clearAnonymousReportRecoveryMarker(recoveryId);
    throw new ClientActionError(result.message, "This report couldn’t be saved. Please try again.");
  }
  const saved = attachStoredReportId(report, result.reportId);
  if (!buildPdfExportRequest(saved)) throw new ClientActionError(null, "We couldn’t confirm that this report was saved. Please try again.");
  if (recoveryId) clearAnonymousReportRecoveryMarker(recoveryId);
  return saved;
}

export function saveReceiptValidatedReport(report: any, fetchImpl: FetchLike = fetch) {
  if (!needsReceiptValidatedSave(report)) return Promise.resolve(report);
  const existing = inFlightSaves.get(report);
  if (existing) return existing;
  const pending = postReceiptValidatedReport(report, fetchImpl)
    .finally(() => inFlightSaves.delete(report));
  inFlightSaves.set(report, pending);
  return pending;
}
