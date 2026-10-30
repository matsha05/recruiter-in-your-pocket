"use client";

import { useEffect, useMemo } from "react";
import {
  ArrowRight,
  CaretDown,
  CheckCircle,
  EnvelopeSimple,
  Target,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Analytics } from "@/lib/analytics";
import { FREE_REPORT_ENTITLEMENT, JOB_SEARCH_PASS_DECISION } from "@/lib/billing/pricing";
import {
  buildIndependentQuestionPresentation,
  buildReportRewritePresentation,
  fixPlanHeadingForCount,
} from "@/lib/reports/report-presentation";
import { saveUnlockContext } from "@/lib/unlock/unlockContext";
import { cn } from "@/lib/utils";
import { FixCanvas } from "./FixCanvas";
import { FullRecruiterNotes } from "./FullRecruiterNotes";
import { IndependentAdvice } from "./IndependentAdvice";
import { ReadComparison } from "./ReadComparison";
import type { ReportData } from "./ReportTypes";
import styles from "./ReportStream.module.css";

interface ReportStreamProps {
  report: ReportData;
  className?: string;
  isSample?: boolean;
  freeUsesRemaining?: number;
  onUpgrade?: () => void;
  hasJobDescription?: boolean;
  isGated?: boolean;
  justUnlocked?: boolean;
  highlightSection?: string | null;
  hasPaidAccess?: boolean;
  comparisonBaseline?: ReportData | null;
  onStartRevision?: () => void;
  onStartReport?: () => void;
  resumeText?: string;
}

const REPORT_FEEDBACK_HREF = `mailto:support@recruiterinyourpocket.com?subject=${encodeURIComponent(
  "Report feedback",
)}&body=${encodeURIComponent(
  [
    "Which advice was useful?",
    "",
    "What was unclear, generic, or wrong?",
    "",
    "Did anything make the report hard to use?",
    "",
    "Optional: What did you understand the score to mean?",
  ].join("\n"),
)}`;

export function ReportStream({
  report,
  className,
  isSample = false,
  freeUsesRemaining = 1,
  onUpgrade,
  hasJobDescription = false,
  isGated = false,
  hasPaidAccess = false,
  comparisonBaseline = null,
  onStartRevision,
  onStartReport,
  resumeText,
}: ReportStreamProps) {
  const fixes = useMemo(() => (report.top_fixes || []).slice(0, 3), [report.top_fixes]);
  const rewrites = useMemo(() => report.rewrites || [], [report.rewrites]);
  const presentation = useMemo(
    () => buildReportRewritePresentation(fixes, rewrites),
    [fixes, rewrites],
  );
  const questions = useMemo(
    () => buildIndependentQuestionPresentation(report.ideas?.questions || []),
    [report.ideas?.questions],
  );
  const strengths = (report.strengths || []).slice(0, 3);
  const strengthsToKeep = strengths.slice(1);
  const roleFit = report.job_alignment?.role_fit;
  const verdict = report.first_impression || report.first_impression_takeaway || report.summary || "Here's where to start.";
  const verdictReason = report.score_comment_short !== verdict ? report.score_comment_short : undefined;
  const criticalMiss = fixes[0];
  const isExhausted = !isSample && freeUsesRemaining <= 0 && !hasPaidAccess;

  useEffect(() => {
    if (rewrites.length > 0) Analytics.track("sm1_fixes_rendered", { count: rewrites.length });
  }, [rewrites.length]);

  const handleUnlock = () => {
    if (!onUpgrade) return;
    saveUnlockContext({ section: "bullet_upgrades" });
    Analytics.paywallCtaClicked("bullet_upgrades");
    onUpgrade();
  };

  return (
    <div className={cn(styles.root, className)}>
      {comparisonBaseline && <ReadComparison previous={comparisonBaseline} current={report} />}
      <section id="section-first-impression" className={cn(styles.openingSection, "scroll-mt-36 pb-6 pt-2 sm:pb-8 sm:pt-4")}>
        <p className={styles.label}>Verdict</p>
        <h1 className={cn(styles.openingTitle, "mt-3")}>{verdict}</h1>
        {verdictReason && <p className={cn(styles.body, "mt-4 max-w-[43rem] text-foreground")}>{verdictReason}</p>}

        {typeof report.score === "number" && (
          <div className={styles.scoreRow} data-testid="first-impression-score">
            <p className={styles.scoreValue}>
              {report.score}<span className={styles.scoreScale}>/100</span>
            </p>
            <div>
              <p className="text-sm font-semibold text-foreground">First Impression score</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">How clearly your resume shows your work today. It doesn&apos;t predict interviews or offers.</p>
            </div>
          </div>
        )}

        {criticalMiss && (
          <div className={styles.criticalMiss} data-testid="critical-miss">
            <p className={styles.criticalLabel}>Critical Miss</p>
            <p className={styles.criticalTitle}>{criticalMiss.fix || criticalMiss.text}</p>
            {criticalMiss.why && <p className={cn(styles.body, "mt-2 text-foreground")}>{criticalMiss.why}</p>}
            <button type="button" className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand" onClick={() => {
              const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
              document.getElementById("section-fixes")?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
            }}>
              See how to fix it <ArrowRight className="size-4" weight="bold" />
            </button>
          </div>
        )}

        {strengths[0] && (
          <div className={styles.worksNote}>
            <p className="text-sm font-semibold text-foreground">What already works</p>
            <p className={cn(styles.body, "mt-1 text-foreground")}>{strengths[0]}</p>
          </div>
        )}
      </section>

      <section id="section-fixes" className="scroll-mt-36 border-t border-line pt-6">
        <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className={styles.sectionTitle}>{fixPlanHeadingForCount(fixes.length)}</h2>
          </div>
          <p className="max-w-[20rem] text-sm leading-6 text-muted-foreground">Check each suggestion against your experience. Add only details you know are accurate.</p>
        </div>

        <div>
          {presentation.fixes.map(({ fix, rewrite }, index) => (
            <FixCanvas
              key={`${fix.fix || fix.text}-${index}`}
              fix={fix}
              rewrite={rewrite}
              index={index}
              locked={isGated && index > 0}
              onUnlock={handleUnlock}
              resumeText={resumeText}
              isSample={isSample}
            />
          ))}
        </div>
      </section>

      <IndependentAdvice rewrites={presentation.independentRewrites} questions={questions} resumeText={resumeText} isReadOnly={isSample} />

      {strengthsToKeep.length > 0 && (
        <section id="section-keep" className="scroll-mt-36 border-t border-line py-8 sm:py-10">
          <div className="grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12">
            <div>
              <p className="text-xs font-semibold uppercase riyp-track-017 text-brand">Keep these</p>
              <h2 className={cn(styles.sectionTitle, "mt-3")}>Also worth keeping.</h2>
            </div>
            <ol className="divide-y divide-[hsl(var(--paper-line))] border-y border-[hsl(var(--paper-line))]">
              {strengthsToKeep.map((strength, index) => (
                <li key={strength} className="grid grid-cols-[2rem_1fr] gap-3 py-5">
                  <span className="riyp-tabular-label text-xs font-semibold text-brand">0{index + 1}</span>
                  <p className="text-base leading-7 text-foreground/85">{strength}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {report.job_alignment && (
        <section id="section-role" className="scroll-mt-36 border-t border-line py-8 sm:py-10">
          <div className="flex items-center gap-2 text-brand"><Target className="size-5" weight="duotone" /><p className="text-xs font-semibold uppercase riyp-track-017">Role fit</p></div>
          <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(15rem,0.65fr)] lg:gap-12">
            <div>
              <h2 className={styles.sectionTitle}>{hasJobDescription ? "How your experience fits this role." : "Roles your experience points toward."}</h2>
              <p className="mt-5 max-w-[42rem] text-base leading-7 text-foreground/80">{report.job_alignment.positioning_suggestion || report.job_alignment.jd_match_summary}</p>
            </div>
            <div className="border-l-2 border-brand/30 pl-5">
              <p className="text-xs font-semibold uppercase riyp-track-015 text-muted-foreground">Roles to consider</p>
              <ul className="mt-4 space-y-3">
                {(roleFit?.best_fit_roles || []).slice(0, 3).map((role) => <li key={role} className="text-sm font-medium leading-6 text-foreground">{role}</li>)}
              </ul>
              {roleFit?.seniority_read && <p className="mt-5 text-xs leading-5 text-muted-foreground">Level suggested by the resume: {roleFit.seniority_read}</p>}
            </div>
          </div>
        </section>
      )}

      <details id="section-score" className="ui-disclosure group scroll-mt-36 border-y border-[hsl(var(--paper-line))]" data-testid="score-basis">
        <summary className="focus-ring flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-4 [&::-webkit-details-marker]:hidden">
          <span className="text-sm font-semibold text-foreground">How the score works</span>
          <CaretDown className="size-4 shrink-0 text-brand transition-transform duration-fast ease-snap group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
        </summary>
        <div className="grid max-w-[43rem] gap-3 border-t border-[hsl(var(--paper-line))] pb-6 pt-5 text-base leading-7 text-foreground/85">
          <p>The score weighs four things a recruiter notices: the results you show, how clearly each line reads, how your experience fits together, and how easy the page is to scan. It is not a simple average.</p>
          {report.score_plain && <p>{report.score_plain}</p>}
          {report.score_comment_long && report.score_comment_long !== report.score_plain && <p>{report.score_comment_long}</p>}
        </div>
      </details>

      <FullRecruiterNotes report={report} hasJobDescription={hasJobDescription} />

      {isSample && onStartReport && (
        <section className={styles.revisionSection} aria-labelledby="sample-report-next-step-title" data-testid="sample-terminal-cta">
          <div className={styles.revisionPanel}>
            <div>
              <p className="text-xs font-semibold uppercase riyp-track-017 text-brand">Your turn</p>
              <h2 id="sample-report-next-step-title" className={styles.revisionTitle}>Let&apos;s look at your resume.</h2>
              <p className={styles.revisionCopy}>Upload or paste it to see what comes through clearly, where it leaves questions, and what to change first.</p>
            </div>
            <div className={styles.revisionAction}>
              <Button variant="brand" size="lg" onClick={onStartReport}>
                Get my free report <ArrowRight className="ml-2 size-4" weight="bold" />
              </Button>
              <p className={styles.revisionNote}>{FREE_REPORT_ENTITLEMENT.promise} No account required.</p>
            </div>
          </div>
        </section>
      )}

      {!isSample && onStartRevision && (
        <section className={styles.revisionSection} aria-labelledby="revision-loop-title" data-testid={isExhausted ? "post-report-purchase-decision" : undefined}>
          <div className={styles.revisionPanel}>
            <div>
              <div className="flex items-center gap-2 text-brand"><CheckCircle className="size-5" weight="duotone" /><p className="text-xs font-semibold uppercase riyp-track-017">After you edit</p></div>
              <h2 id="revision-loop-title" className={styles.revisionTitle}>See what changed.</h2>
              <p className={styles.revisionCopy}>{isExhausted ? <>{JOB_SEARCH_PASS_DECISION.freeBoundary} {JOB_SEARCH_PASS_DECISION.whenToBuy}</> : <>Upload your revision to compare the two reports: what improved, what still needs detail, and what to work on next.</>}</p>
            </div>
            <div className={styles.revisionAction}>
              <Button variant={isExhausted ? "premium" : "brand"} size="lg" onClick={isExhausted && onUpgrade ? onUpgrade : onStartRevision}>
                {isExhausted ? JOB_SEARCH_PASS_DECISION.cta : "Compare my revision"}<ArrowRight className="ml-2 size-4" weight="bold" />
              </Button>
              <p className={styles.revisionNote}>{isExhausted ? JOB_SEARCH_PASS_DECISION.terms : "The comparison stays in this browser visit."}</p>
            </div>
          </div>
        </section>
      )}

      {!isSample && (
        <section className={styles.feedbackSection} aria-labelledby="report-feedback-title" data-testid="report-feedback">
          <div className={styles.feedbackContent}>
            <div>
              <p className="text-xs font-semibold uppercase riyp-track-017 text-brand">Help improve the report</p>
              <h2 id="report-feedback-title" className={styles.feedbackTitle}>What did we get right? What did we miss?</h2>
              <p className={styles.feedbackCopy}>Tell us which advice helped or felt wrong. Include an example so we can look into it.</p>
            </div>
            <div className={styles.feedbackAction}>
              <Button asChild variant="outline" size="lg" className="border-foreground/35 bg-paper hover:border-brand/45 hover:bg-brand/5">
                <a href={REPORT_FEEDBACK_HREF}>Send feedback<EnvelopeSimple className="ml-1 size-4 text-brand" weight="bold" /></a>
              </Button>
              <p className={styles.feedbackNote}>Opens your email with a few questions. Your resume is never attached.</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
