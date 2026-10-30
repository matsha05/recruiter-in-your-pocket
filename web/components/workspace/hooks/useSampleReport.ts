import { useEffect } from "react";
import type { ReadonlyURLSearchParams } from "next/navigation";
import { toast } from "sonner";
import { fetchSampleReport } from "@/lib/reports/sample-report";
import type { ReportData } from "@/components/workspace/report/ReportTypes";

export function isSampleParamEnabled(value: string | null) {
  return value === "true" || value === "1";
}

type SampleReportOptions = {
  searchParams: ReadonlyURLSearchParams;
  report: unknown | null;
  skipSample?: boolean;
  setReport: (report: ReportData) => void;
};

export function useSampleReport({
  searchParams,
  report,
  skipSample = false,
  setReport
}: SampleReportOptions) {
  useEffect(() => {
    const sampleParam = searchParams.get("sample");

    if (isSampleParamEnabled(sampleParam) && !report && !skipSample) {
      let cancelled = false;
      fetchSampleReport()
        .then((data) => {
          if (!cancelled) setReport(data);
        })
        .catch((err) => {
          if (cancelled) return;
          console.error("Failed to load sample report:", err);
          toast.error("Sample report unavailable", {
            description: "Please try again in a moment or start your free report.",
          });
        });
      return () => { cancelled = true; };
    }
  }, [searchParams, report, skipSample, setReport]);
}
