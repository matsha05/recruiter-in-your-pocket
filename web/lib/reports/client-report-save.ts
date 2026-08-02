import { attachStoredReportId, buildPdfExportRequest } from "./pdf-export";

type FetchLike = typeof fetch;
const inFlightSaves = new WeakMap<object, Promise<any>>();

export function needsReceiptValidatedSave(report: unknown) {
  if (!report || typeof report !== "object" || buildPdfExportRequest(report)) return false;
  return typeof (report as { report_receipt?: unknown }).report_receipt === "string";
}

async function postReceiptValidatedReport(report: object, fetchImpl: FetchLike) {
  const response = await fetchImpl("/api/reports", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ report }),
  });
  const result = await response.json();
  if (!response.ok || !result.ok) throw new Error(result.message || "Failed to save report");
  const saved = attachStoredReportId(report, result.reportId);
  if (!buildPdfExportRequest(saved)) throw new Error("The saved report did not return a valid report ID.");
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
