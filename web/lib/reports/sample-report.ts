import type { ReportData } from "@/components/workspace/report/ReportTypes";

export function assertSampleReportResponseOk(response: Pick<Response, "ok" | "status">) {
  if (!response.ok) {
    throw new Error(`Sample report request failed with status ${response.status}.`);
  }
}

export async function fetchSampleReport(fetcher: typeof fetch = fetch): Promise<ReportData> {
  const response = await fetcher("/sample-report.json");
  assertSampleReportResponseOk(response);

  const data: unknown = await response.json();
  if (
    !data
    || typeof data !== "object"
    || typeof (data as { score?: unknown }).score !== "number"
    || !Array.isArray((data as { top_fixes?: unknown }).top_fixes)
    || !Array.isArray((data as { rewrites?: unknown }).rewrites)
  ) {
    throw new Error("Sample report response did not match the report contract.");
  }

  return data as ReportData;
}
