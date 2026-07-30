import { useEffect } from "react";
import type { ReadonlyURLSearchParams } from "next/navigation";
import type { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";
import { fetchSampleReport } from "@/lib/reports/sample-report";

export function isSampleParamEnabled(value: string | null) {
  return value === "true" || value === "1";
}

type SampleReportOptions = {
  searchParams: ReadonlyURLSearchParams;
  report: unknown | null;
  skipSample?: boolean;
  setReport: Dispatch<SetStateAction<any>>;
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
      fetchSampleReport()
        .then((data) => setReport(data))
        .catch((err) => {
          console.error("Failed to load sample report:", err);
          toast.error("Sample report unavailable", {
            description: "Please try again in a moment or start your free report.",
          });
        });
    }
  }, [searchParams, report, skipSample, setReport]);
}
