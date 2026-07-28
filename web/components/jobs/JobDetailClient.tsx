"use client";

import { useCallback, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import JobDetailHeader from "@/components/jobs/JobDetailHeader";
import JobDetailTabs from "@/components/jobs/JobDetailTabs";
import type { JobDetail } from "@/components/jobs/jobDetailTypes";
import { AppPageIntro } from "@/components/layout/AppPageIntro";
import { useAuth } from "@/components/providers/AuthProvider";

interface JobDetailClientProps {
  jobId: string;
}

export default function JobDetailClient({ jobId }: JobDetailClientProps) {
  const { user, isLoading: authLoading } = useAuth();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJob = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/extension/saved-jobs/${jobId}`);
      if (!res.ok) {
        if (res.status === 401) setError("Sign in to view saved job details.");
        else if (res.status === 404) setError("This job is not synced online. Open the studio for a fresh report.");
        else setError("Failed to load job");
        return;
      }
      const data = await res.json();
      const jobData = data.data;
      setJob({
        id: jobData.id,
        external_id: jobData.externalId,
        title: jobData.title,
        company: jobData.company,
        location: jobData.location,
        url: jobData.url,
        source: jobData.source || "linkedin",
        status: jobData.status || "saved",
        match_score: jobData.score,
        captured_at: jobData.capturedAt,
        job_description_text: jobData.jobDescription || jobData.jdText,
        matchedSkills: jobData.matchedSkills || [],
        missingSkills: jobData.missingSkills || [],
        topGaps: jobData.topGaps || []
      });
    } catch (err) {
      console.error("Failed to fetch job:", err);
      setError("Failed to load job");
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setError("Sign in to view saved job details.");
      setLoading(false);
      return;
    }

    void fetchJob();
  }, [authLoading, fetchJob, user]);

  if (loading) {
    return (
      <div data-visual-anchor="job-detail-page" className="app-card flex items-center justify-center py-24">
        <div className="text-muted-foreground">Loading job details…</div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div data-visual-anchor="job-detail-page" className="gap-y-4">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to Jobs
        </Link>
        <div className="app-card p-8 text-center" role="alert">
          <AlertCircle className="size-8 mx-auto text-destructive mb-3" />
          <p className="text-muted-foreground">{error || "Job not found"}</p>
          {error?.includes("not synced online") ? (
            <Link
              href="/workspace"
              className="mt-4 inline-flex min-h-11 items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background transition hover:bg-foreground/90"
            >
              Open studio instead
            </Link>
          ) : error?.includes("Sign in") ? (
            <Link href={`/auth?from=jobs&next=${encodeURIComponent(`/jobs/${jobId}`)}`} className="mt-4 inline-flex min-h-11 items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background transition hover:bg-foreground/90">Sign in</Link>
          ) : (
            <button type="button" onClick={() => void fetchJob()} className="mt-4 inline-flex min-h-11 items-center justify-center rounded-md border border-foreground px-4 py-2 text-sm font-semibold text-foreground hover:bg-paper-muted">Retry</button>
          )}
        </div>
      </div>
    );
  }

  const score = job.match_score ?? null;

  return (
    <div data-visual-anchor="job-detail-page" className="gap-y-6">
      <Link
        href="/jobs"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Jobs
      </Link>

      <AppPageIntro
        eyebrow="Role detail"
        title={job.title}
        description="Keep role context, match gaps, and next actions in one place while you decide how to tailor the resume."
        meta={
          <>
            <span className="inline-flex items-center border-l-2 border-cyan-bright bg-surface-sky px-3 py-1 text-xs font-medium text-muted-foreground">
              {job.company}
            </span>
            {job.location ? (
              <span className="inline-flex items-center border-l-2 border-line bg-paper-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                {job.location}
              </span>
            ) : null}
          </>
        }
      />

      <JobDetailHeader jobId={jobId} job={job} onJobUpdate={setJob} />

      <JobDetailTabs score={score} job={job} />
    </div>
  );
}
