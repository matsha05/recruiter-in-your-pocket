import { useEffect } from "react";
import type { ReadonlyURLSearchParams } from "next/navigation";
import type { Dispatch, SetStateAction } from "react";

type JobContext = {
  id: string;
  externalId?: string | null;
  title: string;
  company: string;
  score?: number | null;
  jdPreview?: string;
  jobDescription?: string;
};

type JobContextOptions = {
  searchParams: ReadonlyURLSearchParams;
  setResumeText: Dispatch<SetStateAction<string>>;
  setJobDescription: Dispatch<SetStateAction<string>>;
  setLoadedJobContext: Dispatch<SetStateAction<JobContext | null>>;
  setSkipSample: Dispatch<SetStateAction<boolean>>;
  shouldHydrateDefaultResume?: boolean;
};

export type LoadedJobContext = JobContext;

export function useJobContextFromExtension({
  searchParams,
  setResumeText,
  setJobDescription,
  setLoadedJobContext,
  setSkipSample,
  shouldHydrateDefaultResume = false
}: JobContextOptions) {
  useEffect(() => {
    const jobId = searchParams.get("job");
    const source = searchParams.get("source");
    if (!jobId && source === "extension-local") {
      const jobDescription = searchParams.get("jd") || "";
      const title = searchParams.get("title") || "Saved job";
      const company = searchParams.get("company") || "Saved from extension";

      setSkipSample(true);
      if (jobDescription) {
        setJobDescription(jobDescription);
      }
      setLoadedJobContext({
        id: "extension-local",
        externalId: null,
        title,
        company,
        score: null,
        jdPreview: jobDescription.slice(0, 200),
        jobDescription
      });
      void hydrateDefaultResume();
      return;
    }

    if (!jobId) return;

    const fetchJob = async () => {
      try {
        const res = await fetch(`/api/extension/saved-jobs/${jobId}`);
        if (!res.ok) {
          setLoadedJobContext(null);
          return;
        }

        const data = await res.json();

        if (data.success && data.data) {
          const job = data.data;
          const jobDescription = job.jobDescription || job.jdText || job.jd_text || job.job_description_text || "";
          if (jobDescription) {
            setJobDescription(jobDescription);
          }
          setLoadedJobContext({
            id: job.id,
            externalId: job.externalId || null,
            title: job.title,
            company: job.company,
            score: job.score,
            jdPreview: job.jdPreview,
            jobDescription
          });
          setSkipSample(true);
          void hydrateDefaultResume();
          console.log("[Workspace] Loaded job from extension:", job.title);
        }
      } catch (error) {
        console.error("[Workspace] Failed to load job:", error);
      }
    };

    fetchJob();
    async function hydrateDefaultResume() {
      if (!shouldHydrateDefaultResume) return;

      try {
        const res = await fetch("/api/user/default-resume?includeText=1");
        if (!res.ok) return;

        const data = await res.json();
        const resumeText = data?.data?.resumeText;
        if (data.success && typeof resumeText === "string" && resumeText.trim()) {
          setResumeText(resumeText);
        }
      } catch {
        // No saved resume or not signed in; the workspace upload step remains visible.
      }
    }
  }, [searchParams, setResumeText, setJobDescription, setLoadedJobContext, setSkipSample, shouldHydrateDefaultResume]);
}
