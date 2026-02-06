import { useEffect } from "react";
import type { ReadonlyURLSearchParams } from "next/navigation";
import type { Dispatch, SetStateAction } from "react";

type SampleReportOptions = {
  searchParams: ReadonlyURLSearchParams;
  report: unknown | null;
  skipSample: boolean;
  setReport: Dispatch<SetStateAction<any>>;
};

export function useSampleReport({
  searchParams,
  report,
  skipSample,
  setReport
}: SampleReportOptions) {
  useEffect(() => {
    const sampleParam = searchParams.get("sample");

    if (sampleParam === "true" && !report && !skipSample) {
      fetch("/sample-report.json")
        .then((res) => res.json())
        .then((data) => setReport(data))
        .catch((err) => console.error("Failed to load sample report:", err));
    }
  }, [searchParams, report, skipSample, setReport]);
}
