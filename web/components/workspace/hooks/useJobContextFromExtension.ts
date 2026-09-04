import { useCallback, useEffect, useRef } from "react";
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
  const query = searchParams.toString();
  const pendingRequestRef = useRef<AbortController | null>(null);
  const dismissedQueryRef = useRef<string | null>(null);

  const clearJobContext = useCallback(() => {
    // Invalidate immediately: router.replace can finish after a pending fetch.
    pendingRequestRef.current?.abort();
    dismissedQueryRef.current = query;
    setLoadedJobContext(null);
  }, [query, setLoadedJobContext]);

  useEffect(() => {
    if (dismissedQueryRef.current === query) return;
    dismissedQueryRef.current = null;
    const params = new URLSearchParams(query);
    const jobId = params.get("job");
    const source = params.get("source");
    const controller = new AbortController();
    pendingRequestRef.current = controller;
    const isCurrent = () => !controller.signal.aborted;

    setLoadedJobContext(null);

    if (!jobId && source === "extension-local") {
      const jobDescription = params.get("jd") || "";
      const title = params.get("title") || "Saved job";
      const company = params.get("company") || "Saved from extension";

      setSkipSample(true);
      setJobDescription(jobDescription);
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
      return () => controller.abort();
    }

    if (!jobId) return () => controller.abort();

    setJobDescription("");

    const fetchJob = async () => {
      try {
        const res = await fetch(`/api/extension/saved-jobs/${encodeURIComponent(jobId)}`, {
          signal: controller.signal,
        });
        if (!isCurrent()) return;
        if (!res.ok) {
          return;
        }

        const data = await res.json();
        if (!isCurrent()) return;

        if (data.success && data.data) {
          const job = data.data;
          const jobDescription = job.jobDescription || job.jdText || job.jd_text || job.job_description_text || "";
          setJobDescription(jobDescription);
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
        if (isCurrent()) console.error("[Workspace] Failed to load job:", error);
      }
    };

    void fetchJob();
    async function hydrateDefaultResume() {
      if (!shouldHydrateDefaultResume || !isCurrent()) return;

      try {
        const res = await fetch("/api/user/default-resume?includeText=1", {
          signal: controller.signal,
        });
        if (!isCurrent() || !res.ok) return;

        const data = await res.json();
        if (!isCurrent()) return;
        const resumeText = data?.data?.resumeText;
        if (data.success && typeof resumeText === "string" && resumeText.trim()) {
          setResumeText((current) => isCurrent() && !current.trim() ? resumeText : current);
        }
      } catch {
        // No saved resume or not signed in; the workspace upload step remains visible.
      }
    }
    return () => controller.abort();
  }, [query, setResumeText, setJobDescription, setLoadedJobContext, setSkipSample, shouldHydrateDefaultResume]);

  return { clearJobContext };
}
