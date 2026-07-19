import { useEffect } from "react";
import type { ReadonlyURLSearchParams } from "next/navigation";
import type { Dispatch, SetStateAction } from "react";

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
      fetch("/sample-report.json")
        .then((res) => res.json())
        .then((data) => setReport(data))
        .catch((err) => console.error("Failed to load sample report:", err));
    }
  }, [searchParams, report, skipSample, setReport]);
}
