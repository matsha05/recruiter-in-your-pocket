"use client";

import { Button } from "@/components/ui/button";
import { useCallback, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import JobDetailHeader from "@/components/jobs/JobDetailHeader";
import JobDetailTabs from "@/components/jobs/JobDetailTabs";
import type { JobDetail } from "@/components/jobs/jobDetailTypes";
import { STATUS_CONFIG } from "@/components/jobs/jobDetailTypes";
import { AppPageIntro } from "@/components/layout/AppPageIntro";
import { useAuth } from "@/components/providers/AuthProvider";

interface JobDetailClientProps {
  jobId: string;
}

export default function JobDetailClient({ jobId }: JobDetailClientProps) {
  const { user, isLoading: authLoading } = useAuth();
  return <JobDetailContent key={`${user?.id ?? 'signed-out'}:${jobId}`} jobId={jobId} userId={user?.id ?? null} authLoading={authLoading} />;
}

function JobDetailContent({ jobId, userId, authLoading }: JobDetailClientProps & { userId: string | null; authLoading: boolean }) {
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pendingRequest = useRef<AbortController | null>(null);

  const fetchJob = useCallback(async () => {
    pendingRequest.current?.abort();
    const controller = new AbortController();
    pendingRequest.current = controller;
    setLoading(true);
    setError(null);
    setJob(null);
    try {
      const res = await fetch(`/api/extension/saved-jobs/${encodeURIComponent(jobId)}`, { signal: controller.signal });
      if (!res.ok) {
        if (controller.signal.aborted) return;
        if (res.status === 401) setError("Sign in to view saved job details.");
        else if (res.status === 404) setError("This saved job is no longer available. You can still start a report with a job description you paste in.");
        else setError("We couldn't load this saved job. Please try again.");
        return;
      }
      const data = await res.json();
      if (controller.signal.aborted) return;
      if (!data.success || !data.data) throw new Error('Invalid saved job response');
      const jobData = data.data;
      setJob({
        id: jobData.id,
        external_id: jobData.externalId,
        title: jobData.title,
        company: jobData.company,
        location: jobData.location,
        url: jobData.url,
        source: jobData.source || "linkedin",
        status: Object.hasOwn(STATUS_CONFIG, jobData.status) ? jobData.status : "saved",
        match_score: jobData.score,
        captured_at: jobData.capturedAt,
        job_description_text: jobData.jobDescription || jobData.jdText,
        matchedSkills: jobData.matchedSkills || [],
        missingSkills: jobData.missingSkills || [],
        topGaps: jobData.topGaps || []
      });
    } catch (err) {
      if (controller.signal.aborted) return;
      console.error("Failed to fetch job:", err);
      setError("We couldn't load this saved job. Please try again.");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    if (authLoading) return;
    if (!userId) {
      pendingRequest.current?.abort();
      setJob(null);
      setError("Sign in to view saved job details.");
      setLoading(false);
      return;
    }

    void fetchJob();
    return () => pendingRequest.current?.abort();
  }, [authLoading, fetchJob, userId]);

  if (authLoading || loading) {
    return (
      <div data-visual-anchor="job-detail-page" className="flex items-center justify-center rounded-2xl border border-border bg-card px-5 py-24 sm:rounded-3xl">
        <div className="text-muted-foreground">Loading job details…</div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div data-visual-anchor="job-detail-page" className="space-y-4">
        <Link
          href="/jobs"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <ArrowLeft className="size-4" />
          Back to Jobs
        </Link>
        <div className="rounded-2xl border border-border bg-card px-5 py-10 text-center sm:rounded-3xl sm:p-10" role="alert">
          <AlertCircle className="size-8 mx-auto text-destructive mb-3" />
          <p className="text-muted-foreground">{error || "Job not found"}</p>
          {error?.includes("no longer available") ? (
            <Button asChild className="mt-4">
              <Link
                href="/workspace"
              >
                Start a report
              </Link>
            </Button>
          ) : error?.includes("Sign in") ? (
            <Button asChild className="mt-4">
              <Link href={`/auth?from=jobs&next=${encodeURIComponent(`/jobs/${jobId}`)}`}>Sign in</Link>
            </Button>
          ) : (
            <Button type="button" onClick={() => void fetchJob()} variant="outline" className="mt-4">Retry</Button>
          )}
        </div>
      </div>
    );
  }

  const score = job.match_score ?? null;

  return (
    <div data-visual-anchor="job-detail-page" className="space-y-6">
      <Link
        href="/jobs"
        className="inline-flex min-h-11 items-center gap-2 rounded-lg text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <ArrowLeft className="size-4" />
        Back to Jobs
      </Link>

      <AppPageIntro
        eyebrow="Role detail"
        title={job.title}
        description="Compare your resume with the job description and track your application."
        meta={
          <>
            <span className="inline-flex max-w-full items-center rounded-full bg-brand-tint px-3 py-1.5 text-xs font-medium text-brand [overflow-wrap:anywhere]">
              {job.company}
            </span>
            {job.location ? (
              <span className="inline-flex max-w-full items-center rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground [overflow-wrap:anywhere]">
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
