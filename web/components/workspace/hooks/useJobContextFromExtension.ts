import { useEffect } from "react";
import type { ReadonlyURLSearchParams } from "next/navigation";
import type { Dispatch, SetStateAction } from "react";

type JobContext = {
  id: string;
  title: string;
  company: string;
  score?: number | null;
  jdPreview?: string;
};

type JobContextOptions = {
  searchParams: ReadonlyURLSearchParams;
  setJobDescription: Dispatch<SetStateAction<string>>;
  setLoadedJobContext: Dispatch<SetStateAction<JobContext | null>>;
  setSkipSample: Dispatch<SetStateAction<boolean>>;
};

export type LoadedJobContext = JobContext;

export function useJobContextFromExtension({
  searchParams,
  setJobDescription,
  setLoadedJobContext,
  setSkipSample
}: JobContextOptions) {
  useEffect(() => {
    const jobId = searchParams.get("job");
    if (!jobId) return;

    const fetchJob = async () => {
      try {
        const res = await fetch(`/api/extension/saved-jobs/${jobId}`);
        const data = await res.json();

        if (data.success && data.data) {
          const job = data.data;
          if (job.jobDescription) {
            setJobDescription(job.jobDescription);
          }
          setLoadedJobContext({
            id: job.id,
            title: job.title,
            company: job.company,
            score: job.score,
            jdPreview: job.jdPreview
          });
          setSkipSample(true);
          console.log("[Workspace] Loaded job from extension:", job.title);
        }
      } catch (error) {
        console.error("[Workspace] Failed to load job:", error);
      }
    };

    fetchJob();
  }, [searchParams, setJobDescription, setLoadedJobContext, setSkipSample]);
}
