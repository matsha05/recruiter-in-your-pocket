"use client";

import { useRef, useState } from "react";
import type { ElementType, KeyboardEvent } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  FileText,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { InsightSparkleIcon } from "@/components/icons";
import type { JobDetail } from "@/components/jobs/jobDetailTypes";

type TabId = "overview" | "job-description" | "analysis";

type JobDetailTabsProps = {
  score: number | null;
  job: JobDetail;
};

export default function JobDetailTabs({ score, job }: JobDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const tabRefs = useRef<Partial<Record<TabId, HTMLButtonElement | null>>>({});

  const tabs: { id: TabId; label: string; icon: ElementType }[] = [
    { id: "overview", label: "Overview", icon: InsightSparkleIcon },
    { id: "job-description", label: "Job Description", icon: FileText },
    { id: "analysis", label: "Skills and gaps", icon: CheckCircle2 }
  ];

  const selectTab = (id: TabId) => {
    setActiveTab(id);
    window.requestAnimationFrame(() => tabRefs.current[id]?.focus());
  };

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, currentId: TabId) => {
    const currentIndex = tabs.findIndex((tab) => tab.id === currentId);
    let nextIndex: number | null = null;

    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabs.length;
    if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = tabs.length - 1;

    if (nextIndex == null) return;
    event.preventDefault();
    selectTab(tabs[nextIndex].id);
  };

  return (
    <div className="gap-y-6">
      <div className="border-b border-border">
        <div className="flex gap-5 overflow-x-auto" role="tablist" aria-label="Saved job details">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button type="button"
              key={id}
              ref={(node) => { tabRefs.current[id] = node; }}
              onClick={() => setActiveTab(id)}
              onKeyDown={(event) => handleTabKeyDown(event, id)}
              id={`job-tab-${id}`}
              role="tab"
              aria-selected={activeTab === id}
              aria-controls={`job-panel-${id}`}
              tabIndex={activeTab === id ? 0 : -1}
              className={cn(
                "-mb-px flex min-h-11 shrink-0 items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium transition-colors",
                activeTab === id
                  ? "border-brand text-brand"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[400px]">
        {activeTab === "overview" && (
          <div id="job-panel-overview" role="tabpanel" aria-labelledby="job-tab-overview" tabIndex={0} className="grid grid-cols-1 gap-6 outline-none lg:grid-cols-3">
            <div className="lg:col-span-2 gap-y-4">
              <RecruiterFitSummary
                score={score}
                matchedSkills={job.matchedSkills}
                missingSkills={job.missingSkills}
                topGaps={job.topGaps}
              />
            </div>
            <div className="gap-y-4">
              <ApplicationReadiness job={job} score={score} />
              <NextBestActions jobId={job.id} onReviewJobDescription={() => selectTab("job-description")} />
            </div>
          </div>
        )}

        {activeTab === "job-description" && (
          <div id="job-panel-job-description" role="tabpanel" aria-labelledby="job-tab-job-description" tabIndex={0} className="overflow-hidden border-y border-border bg-card outline-none">
            <div className="px-6 py-4 border-b border-border bg-muted/30">
              <h3 className="font-medium text-foreground">Full Job Description</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {job.company} • {job.location || "Location not specified"}
              </p>
            </div>
            <div className="p-6 max-h-[600px] overflow-y-auto">
              {job.job_description_text ? (
                <FormattedJobDescription text={job.job_description_text} />
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No job description available.
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand hover:underline ml-1"
                  >
                    View original posting
                  </a>
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === "analysis" && (
          <div id="job-panel-analysis" role="tabpanel" aria-labelledby="job-tab-analysis" tabIndex={0} className="gap-y-6 outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="border border-border rounded bg-card p-6">
                <h3 className="font-medium text-foreground mb-4">Skills found in your resume</h3>
                {job.matchedSkills.length > 0 ? (
                  <div className="gap-y-3">
                    {job.matchedSkills.slice(0, 12).map((skill) => (
                      <span
                        key={skill}
                        className="mr-2 mb-2 inline-flex items-center border-l-2 border-success bg-success/10 px-2.5 py-1 text-xs font-medium text-success"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No matched skills found yet.</p>
                )}
              </div>

              <div className="border border-border rounded bg-card p-6">
                <h3 className="font-medium text-foreground mb-4">Skills not found in your resume</h3>
                {job.missingSkills.length > 0 ? (
                  <div className="gap-y-3">
                    {job.missingSkills.slice(0, 12).map((skill) => (
                      <span
                        key={skill}
                        className="mr-2 mb-2 inline-flex items-center border-l-2 border-destructive bg-error-surface px-2.5 py-1 text-xs font-medium text-destructive"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No skill gaps listed.</p>
                )}
              </div>
            </div>

            {job.topGaps.length > 0 && (
              <div className="border border-border rounded bg-card p-6">
                <h3 className="font-medium text-foreground mb-4">Details to check before applying</h3>
                <ul className="gap-y-3">
                  {job.topGaps.map((gap, i) => (
                    <li key={gap} className="flex items-start gap-3">
                      <span className="flex size-6 flex-shrink-0 items-center justify-center border border-warning/35 bg-warning/10 text-xs font-medium text-warning-foreground">
                        {i + 1}
                      </span>
                      <span className="text-sm text-muted-foreground">{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <ApplicationReadiness job={job} score={score} />
            <NextBestActions jobId={job.id} onReviewJobDescription={() => selectTab("job-description")} />
          </div>
        )}
      </div>
    </div>
  );
}

function RecruiterFitSummary({
  score,
  matchedSkills,
  missingSkills,
  topGaps
}: {
  score: number | null;
  matchedSkills: string[];
  missingSkills: string[];
  topGaps: string[];
}) {
  const [expanded, setExpanded] = useState(false);
  const scoreClass = score == null ? "neutral" : getScoreClass(score);
  const scoreColors = {
    success: "text-success border-success/20 bg-success/5",
    premium: "text-premium border-premium/20 bg-premium/5",
    destructive: "text-destructive border-destructive/20 bg-destructive/5",
    neutral: "text-muted-foreground border-line bg-paper-muted",
  };

  const totalSkills = matchedSkills.length + missingSkills.length;
  const requirementsMet = matchedSkills.length;
  const coveragePercent = totalSkills > 0 ? (requirementsMet / totalSkills) * 100 : 0;

  return (
    <div className="border border-border rounded p-6 bg-card gap-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-foreground">Resume match</h3>
          <p className="text-sm text-muted-foreground">
            How your resume compares with the job description
          </p>
        </div>
        <div
          className={cn(
            "size-16 rounded-full border-2 flex items-center justify-center",
            scoreColors[scoreClass]
          )}
        >
          <span className="text-xl font-bold">{score != null ? score : " - "}</span>
        </div>
      </div>

      {totalSkills > 0 && (
        <div className="gap-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Skills Coverage</span>
            <span className="font-medium">
              {requirementsMet}/{totalSkills} matched
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-brand rounded-full transition-all"
              style={{ width: `${coveragePercent}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="gap-y-3">
          <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
            <CheckCircle2 className="size-4 text-success" />
            Skills found in your resume
          </h4>
          {matchedSkills.length > 0 ? (
            <ul className="gap-y-2">
              {(expanded ? matchedSkills : matchedSkills.slice(0, 5)).map((skill) => (
                <li key={skill} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-success mt-1">•</span>
                  {skill}
                </li>
              ))}
              {matchedSkills.length > 5 && (
                <li>
                  <button type="button"
                    onClick={() => setExpanded(!expanded)}
                    className="text-xs text-brand hover:underline font-medium"
                  >
                    {expanded ? "Show less" : `+${matchedSkills.length - 5} more skills matched`}
                  </button>
                </li>
              )}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground/70 italic">No matching skills detected</p>
          )}
        </div>

        <div className="gap-y-3">
          <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
            <XCircle className="size-4 text-destructive" />
            Details to check
          </h4>
          {topGaps.length > 0 || missingSkills.length > 0 ? (
            <ul className="gap-y-2">
              {topGaps.map((gap) => (
                <li key={gap} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-destructive mt-1">•</span>
                  {gap}
                </li>
              ))}
              {missingSkills.slice(0, Math.max(0, 3 - topGaps.length)).map((skill) => (
                <li key={skill} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-destructive mt-1">•</span>
                  Not found in your resume: {skill}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground/70 italic">No gaps listed. Check the job description for requirements this comparison may have missed.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ApplicationReadiness({ job, score }: { job: JobDetail; score: number | null }) {
  const missingCount = job.missingSkills.length;
  const gapCount = job.topGaps.length;
  const hasJobText = Boolean(job.job_description_text?.trim());
  const readinessLabel = score == null
    ? "No match score yet"
    : score >= 75
      ? "Higher match score"
      : score >= 60
        ? "Moderate match score"
        : "Lower match score";

  return (
    <div className="rounded border border-brand/20 bg-brand/[0.045] p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Resume comparison
          </p>
          <h3 className="mt-1 font-display text-xl font-semibold tracking-tight text-foreground">
            {readinessLabel}
          </h3>
        </div>
        <span className="rounded bg-background/80 px-2 py-1 text-xs font-semibold tabular-nums text-brand">
          {score != null ? `${score}/100` : "No score"}
        </span>
      </div>

      <div className="gap-y-3 text-sm">
        <ReadinessRow complete={hasJobText} label={hasJobText ? "Job description saved" : "Job description not saved"} />
        <ReadinessRow complete={score != null} label={score == null ? "Match score unavailable" : "Match score available"} />
        <ReadinessRow complete={missingCount + gapCount === 0} label={missingCount + gapCount > 0 ? `${missingCount + gapCount} details to check` : "No gaps listed"} />
      </div>

      <Link
        href={`/workspace?job=${job.id}`}
        className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
      >
        Start a report
        <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}

function ReadinessRow({ complete, label }: { complete: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      {complete ? (
        <CheckCircle2 className="size-4 text-success" />
      ) : (
        <XCircle className="size-4 text-warning" />
      )}
      <span>{label}</span>
    </div>
  );
}

function NextBestActions({ jobId, onReviewJobDescription }: { jobId: string; onReviewJobDescription: () => void }) {
  return (
    <div className="border border-border rounded p-6 bg-card gap-y-4">
      <h3 className="font-medium text-foreground">What to do next</h3>

      <div className="gap-y-2">
        <ActionButton
          icon={FileText}
          label="Start a report"
          description="Get resume feedback for this job"
          href={`/workspace?job=${jobId}`}
        />
        <ActionButton
          icon={InsightSparkleIcon}
          label="Review job description"
          description="Read the requirements and responsibilities"
          onClick={onReviewJobDescription}
        />
      </div>
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  description,
  href,
  onClick,
}: {
  icon: ElementType;
  label: string;
  description: string;
  href?: string;
  onClick?: () => void;
}) {
  const content = (
    <>
      <Icon className="size-5 text-brand shrink-0" />
      <div className="flex-1 text-left">
        <div className="text-sm font-medium text-foreground">{label}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="flex items-center gap-3 p-3 rounded border border-border hover:bg-muted/50 cursor-pointer transition-colors"
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-h-11 w-full items-center gap-3 rounded border border-border p-3 transition-colors",
        "bg-muted/20 hover:bg-muted/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
      )}
    >
      {content}
    </button>
  );
}

function getScoreClass(score: number): "success" | "premium" | "destructive" {
  if (score >= 85) return "success";
  if (score >= 70) return "premium";
  return "destructive";
}

const SECTION_PATTERNS = [
  /^(About|About Us|About the (Company|Team|Role|Position))/i,
  /^(What You['']ll Do|Responsibilities|Key Responsibilities|Your Role)/i,
  /^(What We['']re Looking For|Requirements|Qualifications|What You Need|Minimum Qualifications)/i,
  /^(Preferred Qualifications|Nice to Have|Bonus Points|Preferred)/i,
  /^(Benefits|Perks|What We Offer|Compensation)/i,
  /^(How to Apply|Application|Next Steps)/i
];

function FormattedJobDescription({ text }: { text: string }) {
  const lines = text.split("\n");
  const sections: Array<{ header: string | null; content: string[] }> = [];
  let currentSection: { header: string | null; content: string[] } = { header: null, content: [] };

  for (const line of lines) {
    const trimmed = line.trim();

    const isHeader =
      SECTION_PATTERNS.some((pattern) => pattern.test(trimmed)) ||
      (trimmed.length < 60 && trimmed.endsWith(":")) ||
      (trimmed.length < 60 && /^[A-Z][^a-z]*$/.test(trimmed.replace(/[:\s]/g, "")));

    if (isHeader && trimmed.length > 0) {
      if (currentSection.content.length > 0 || currentSection.header) {
        sections.push(currentSection);
      }
      currentSection = { header: trimmed.replace(/:$/, ""), content: [] };
    } else if (trimmed.length > 0) {
      currentSection.content.push(trimmed);
    }
  }

  if (currentSection.content.length > 0 || currentSection.header) {
    sections.push(currentSection);
  }

  return (
    <div className="gap-y-6">
      {sections.map((section) => (
        <div key={`${section.header || "section"}-${section.content.join("|")}`} className="gap-y-2">
          {section.header && (
            <h4 className="text-sm font-semibold text-foreground">{section.header}</h4>
          )}
          <div className="text-sm text-muted-foreground leading-relaxed gap-y-2">
            {section.content.map((line, lineIdx) => {
              const isBullet = /^[•\-*]\s/.test(line) || /^\d+[.)]\s/.test(line);
              if (isBullet) {
                return (
                  <div key={line} className="flex gap-2 pl-2">
                    <span className="text-brand">•</span>
                    <span>{line.replace(/^[•\-*\d.)]+\s*/, "")}</span>
                  </div>
                );
              }
              return <p key={line}>{line}</p>;
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
