"use client";

import { useState, useEffect } from "react";
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

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setError("Sign in to view saved job details.");
      setLoading(false);
      return;
    }

    async function fetchJob() {
      try {
        const res = await fetch(`/api/extension/saved-jobs/${jobId}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError("Job not found");
          } else {
            setError("Failed to load job");
          }
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
    }
    fetchJob();
  }, [authLoading, jobId, user]);

  if (loading) {
    return (
      <div data-visual-anchor="job-detail-page" className="app-card flex items-center justify-center py-24">
        <div className="text-muted-foreground">Loading job details...</div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div data-visual-anchor="job-detail-page" className="space-y-4">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Link>
        <div className="app-card p-8 text-center">
          <AlertCircle className="h-8 w-8 mx-auto text-destructive mb-3" />
          <p className="text-muted-foreground">{error || "Job not found"}</p>
        </div>
      </div>
    );
  }

  const score = job.match_score ?? 0;

  return (
    <div data-visual-anchor="job-detail-page" className="space-y-6">
      <Link
        href="/jobs"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Jobs
      </Link>

      <AppPageIntro
        eyebrow="Role detail"
        title={job.title}
        description="Keep role context, match gaps, and next actions in one place while you decide how to tailor the resume."
        meta={
          <>
            <span className="inline-flex items-center rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground">
              {job.company}
            </span>
            {job.location ? (
              <span className="inline-flex items-center rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground">
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
