"use client";

import { useState } from "react";
import type { ElementType } from "react";
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
  score: number;
  job: JobDetail;
};

export default function JobDetailTabs({ score, job }: JobDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const tabs: { id: TabId; label: string; icon: ElementType }[] = [
    { id: "overview", label: "Overview", icon: InsightSparkleIcon },
    { id: "job-description", label: "Job Description", icon: FileText },
    { id: "analysis", label: "Full Analysis", icon: CheckCircle2 }
  ];

  return (
    <div className="gap-y-6">
      <div className="border-b border-border">
        <nav className="flex gap-6">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button type="button"
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex items-center gap-2 px-1 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
                activeTab === id
                  ? "border-brand text-brand"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      <div className="min-h-[400px]">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
              <NextBestActions jobId={job.id} />
            </div>
          </div>
        )}

        {activeTab === "job-description" && (
          <div className="border border-border rounded bg-card overflow-hidden">
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
          <div className="gap-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="border border-border rounded bg-card p-6">
                <h3 className="font-medium text-foreground mb-4">What you already cover</h3>
                {job.matchedSkills.length > 0 ? (
                  <div className="gap-y-3">
                    {job.matchedSkills.slice(0, 12).map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-success/10 text-success mr-2 mb-2"
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
                <h3 className="font-medium text-foreground mb-4">Missing or underplayed</h3>
                {job.missingSkills.length > 0 ? (
                  <div className="gap-y-3">
                    {job.missingSkills.slice(0, 12).map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-destructive/10 text-destructive mr-2 mb-2"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No missing skills  -  great match!</p>
                )}
              </div>
            </div>

            {job.topGaps.length > 0 && (
              <div className="border border-border rounded bg-card p-6">
                <h3 className="font-medium text-foreground mb-4">Priority Gaps to Address</h3>
                <ul className="gap-y-3">
                  {job.topGaps.map((gap, i) => (
                    <li key={gap} className="flex items-start gap-3">
                      <span className="flex-shrink-0 size-6 rounded-full bg-amber-500/10 text-amber-600 text-xs font-medium flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span className="text-sm text-muted-foreground">{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <ApplicationReadiness job={job} score={score} />
            <NextBestActions jobId={job.id} />
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
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  topGaps: string[];
}) {
  const [expanded, setExpanded] = useState(false);
  const scoreClass = getScoreClass(score);
  const scoreColors = {
    success: "text-success border-success/20 bg-success/5",
    premium: "text-premium border-premium/20 bg-premium/5",
    destructive: "text-destructive border-destructive/20 bg-destructive/5"
  };

  const totalSkills = matchedSkills.length + missingSkills.length;
  const requirementsMet = matchedSkills.length;
  const coveragePercent = totalSkills > 0 ? (requirementsMet / totalSkills) * 100 : 0;

  return (
    <div className="border border-border rounded p-6 bg-card gap-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-foreground">Recruiter Fit Summary</h3>
          <p className="text-sm text-muted-foreground">
            How a recruiter would view your resume against this role
          </p>
        </div>
        <div
          className={cn(
            "size-16 rounded-full border-2 flex items-center justify-center",
            scoreColors[scoreClass]
          )}
        >
          <span className="text-xl font-bold">{score > 0 ? score : " - "}</span>
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
            Skills recruiters will see
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
            Gaps to address
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
                  Missing: {skill}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground/70 italic">Great match! No major gaps detected</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ApplicationReadiness({ job, score }: { job: JobDetail; score: number }) {
  const missingCount = job.missingSkills.length;
  const gapCount = job.topGaps.length;
  const hasJobText = Boolean(job.job_description_text?.trim());
  const readinessLabel = score >= 75
    ? "Ready to tailor"
    : score >= 60
      ? "Needs a focused pass"
      : "High-risk stretch";

  return (
    <div className="rounded border border-brand/20 bg-brand/[0.045] p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Application readiness
          </p>
          <h3 className="mt-1 font-display text-xl font-semibold tracking-tight text-foreground">
            {readinessLabel}
          </h3>
        </div>
        <span className="rounded bg-background/80 px-2 py-1 text-xs font-semibold tabular-nums text-brand">
          {score > 0 ? `${score}%` : "No score"}
        </span>
      </div>

      <div className="gap-y-3 text-sm">
        <ReadinessRow complete={hasJobText} label="Job description captured" />
        <ReadinessRow complete={score >= 60} label="Quick fit score available" />
        <ReadinessRow complete={missingCount + gapCount === 0} label={missingCount + gapCount > 0 ? `${missingCount + gapCount} gaps to resolve` : "No priority gaps detected"} />
      </div>

      <Link
        href={`/workspace?job=${job.id}`}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
      >
        Run role-specific briefing
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

function NextBestActions({ jobId }: { jobId: string }) {
  return (
    <div className="border border-border rounded p-6 bg-card gap-y-4">
      <h3 className="font-medium text-foreground">Next best actions</h3>

      <div className="gap-y-2">
        <ActionButton
          icon={FileText}
          label="Role-specific brief"
          description="See the exact edits for this job"
          href={`/workspace?job=${jobId}`}
        />
        <ActionButton
          icon={InsightSparkleIcon}
          label="Review job description"
          description="Use the analysis tab to see present and missing signals"
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
}: {
  icon: ElementType;
  label: string;
  description: string;
  href?: string;
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
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded border border-border",
        "bg-muted/20"
      )}
    >
      {content}
    </div>
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
