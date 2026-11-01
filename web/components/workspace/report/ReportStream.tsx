"use client";

import { useEffect, useMemo } from "react";
import { m } from "motion/react";
import {
  ArrowRight,
  CaretDown,
  EnvelopeSimple,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Analytics } from "@/lib/analytics";
import { JOB_SEARCH_PASS_DECISION } from "@/lib/billing/pricing";
import {
  buildIndependentQuestionPresentation,
  buildReportRewritePresentation,
  fixPlanHeadingForCount,
} from "@/lib/reports/report-presentation";
import { criticalMissReason, fixCardSlots, reconcileReport } from "@/lib/reports/report-integrity";
import { saveUnlockContext } from "@/lib/unlock/unlockContext";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { EASE } from "@/lib/animation";
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
  // One disposition per resume line and each observation once, shared with the PDF.
  const integrity = useMemo(() => reconcileReport(report), [report]);
  const reconciled = integrity.report;
  const fixes = useMemo(() => (reconciled.top_fixes || []).slice(0, 3), [reconciled.top_fixes]);
  const rewrites = useMemo(() => reconciled.rewrites || [], [reconciled.rewrites]);
  const presentation = useMemo(
    () => buildReportRewritePresentation(fixes, rewrites),
    [fixes, rewrites],
  );
  const questions = useMemo(
    () => buildIndependentQuestionPresentation(reconciled.ideas?.questions || []),
    [reconciled.ideas?.questions],
  );
  const strengths = (reconciled.strengths || []).slice(0, 3);
  const strengthsToKeep = strengths.slice(1);
  const roleFit = report.job_alignment?.role_fit;
  const verdict = report.first_impression || report.first_impression_takeaway || report.summary || "Here's where to start.";
  const verdictReason = report.score_comment_short !== verdict ? report.score_comment_short : undefined;
  const criticalMiss = fixes[0];
  const criticalMissWhy = criticalMissReason(integrity);
  const structuralGaps = integrity.structuralGaps;
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

  // Signature move: the recruiter's read draws in, one beat at a time, when a report first appears.
  // The server snapshot reports reduced motion, so pages that arrive fully rendered start settled.
  const reducedMotion = useReducedMotion();
  const reveal = (step: number) => ({
    initial: reducedMotion ? false : { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.32, ease: EASE, delay: 0.12 + step * 0.14 },
  });

  return (
    <div className={cn(styles.root, className)}>
      {comparisonBaseline && <ReadComparison previous={comparisonBaseline} current={report} />}
      <section id="section-first-impression" className={cn(styles.openingSection, "scroll-mt-36 pb-6 pt-2 sm:pb-8 sm:pt-4")}>
        <p className={cn(styles.label, "riyp-verdict-label")}>Verdict</p>
        <h1 className={cn(styles.openingTitle, "mt-3")}>{verdict}</h1>
        {verdictReason && <p className={cn(styles.body, "mt-4 max-w-[43rem] text-foreground")}>{verdictReason}</p>}

        {typeof report.score === "number" && (
          <m.div {...reveal(0)} className={styles.scoreRow} data-testid="first-impression-score">
            <p className={styles.scoreValue}>
              {report.score}<span className={styles.scoreScale}>/100</span>
            </p>
            <div>
              <p className="text-sm font-semibold text-foreground">First Impression score</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">How clearly your resume shows your work today. It doesn&apos;t predict interviews or offers.</p>
            </div>
          </m.div>
        )}

        {criticalMiss && (
          <m.div {...reveal(1)} className={styles.criticalMiss} data-testid="critical-miss">
            <p className={styles.criticalLabel}>Critical Miss</p>
            <p className={styles.criticalTitle}>{criticalMiss.fix || criticalMiss.text}</p>
            {criticalMissWhy && <p className={cn(styles.body, "mt-2 text-foreground")}>{criticalMissWhy}</p>}
            <button type="button" className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand" onClick={() => {
              const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
              document.getElementById("section-fixes")?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
            }}>
              See how to fix it <ArrowRight className="size-4" weight="bold" />
            </button>
          </m.div>
        )}

        {structuralGaps.length > 0 && (
          <m.div {...reveal(2)} className={styles.gapNote} data-testid="structural-gaps">
            <p className="text-sm font-semibold">{criticalMiss ? "They’ll also notice" : "They’ll notice"}</p>
            {structuralGaps.map((gap) => <p key={gap.text} className={cn(styles.body, "mt-1 text-foreground")}>{gap.text}</p>)}
          </m.div>
        )}

        {strengths[0] && (
          <m.div {...reveal(structuralGaps.length > 0 ? 3 : 2)} className={styles.worksNote}>
            <p className="text-sm font-semibold">Don&apos;t touch this one</p>
            <p className={cn(styles.body, "mt-1 text-foreground")}>{strengths[0]}</p>
          </m.div>
        )}
      </section>

      <section id="section-fixes" className="scroll-mt-36 border-t border-line pt-6">
        <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className={styles.sectionTitle}>{fixPlanHeadingForCount(fixes.length)}</h2>
          </div>
          <p className="max-w-[20rem] text-sm leading-6 text-muted-foreground">
            These are drafts. Keep only what&apos;s true, and say it your way.
            {/* Saved reports never keep the resume, so drafts can't be checked against it for copying. */}
            {!isSample && !resumeText?.trim() ? " Saved reports don’t keep your resume, so Copy is off here." : null}
          </p>
        </div>

        <div>
          {presentation.fixes.map(({ fix, rewrite }, index) => (
            <FixCanvas
              key={`${fix.fix || fix.text}-${index}`}
              fix={fix}
              rewrite={rewrite}
              index={index}
              {...fixCardSlots(integrity, index)}
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
              <h2 className={styles.sectionTitle}>Leave these alone. They&apos;re working.</h2>
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
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(15rem,0.65fr)] lg:gap-12">
            <div>
              <h2 className={styles.sectionTitle}>{hasJobDescription ? "How your experience fits this role." : "Roles your experience points toward."}</h2>
              <p className="mt-5 max-w-[42rem] text-base leading-7 text-foreground/80">{report.job_alignment.positioning_suggestion || report.job_alignment.jd_match_summary}</p>
            </div>
            <div className="border-l-2 border-brand/30 pl-5">
              <p className="text-sm font-semibold text-muted-foreground">Roles to consider</p>
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

      <FullRecruiterNotes report={reconciled} hasJobDescription={hasJobDescription} />

      {isSample && onStartReport && (
        <section className={styles.revisionSection} aria-labelledby="sample-report-next-step-title" data-testid="sample-terminal-cta">
          <div className={styles.revisionPanel}>
            <div>
              <h2 id="sample-report-next-step-title" className={styles.revisionTitle}>Now let&apos;s look at yours.</h2>
              <p className={styles.revisionCopy}>Upload or paste it to see what comes through clearly, where it leaves questions, and what to change first.</p>
            </div>
            <div className={styles.revisionAction}>
              <Button variant="brand" size="lg" onClick={onStartReport}>
                Get your free report <ArrowRight className="ml-2 size-4" weight="bold" />
              </Button>
              <p className={styles.revisionNote}>Your first report is free. No card or account needed.</p>
            </div>
          </div>
        </section>
      )}

      {!isSample && onStartRevision && (
        <section className={styles.revisionSection} aria-labelledby="revision-loop-title" data-testid={isExhausted ? "post-report-purchase-decision" : undefined}>
          <div className={styles.revisionPanel}>
            <div>
              <h2 id="revision-loop-title" className={styles.revisionTitle}>{isExhausted ? "Revised it? See what changed." : "Made your edits? See what changed."}</h2>
              <p className={styles.revisionCopy}>{isExhausted ? <>{JOB_SEARCH_PASS_DECISION.freeBoundary} {JOB_SEARCH_PASS_DECISION.whenToBuy}</> : <>Upload the new version and we&apos;ll compare the two: whether the Critical Miss is fixed, what got clearer, and what to do next.</>}</p>
            </div>
            <div className={styles.revisionAction}>
              <Button variant={isExhausted ? "premium" : "brand"} size="lg" onClick={isExhausted && onUpgrade ? onUpgrade : onStartRevision}>
                {isExhausted ? JOB_SEARCH_PASS_DECISION.cta : "Compare my revision"}<ArrowRight className="ml-2 size-4" weight="bold" />
              </Button>
              <p className={styles.revisionNote}>{isExhausted ? JOB_SEARCH_PASS_DECISION.terms : "The comparison lasts for this visit. Save the report to keep it."}</p>
            </div>
          </div>
        </section>
      )}

      {!isSample && (
        <section className={styles.feedbackSection} aria-labelledby="report-feedback-title" data-testid="report-feedback">
          <div className={styles.feedbackContent}>
            <div>
              <h2 id="report-feedback-title" className={styles.feedbackTitle}>Did we read you right?</h2>
              <p className={styles.feedbackCopy}>Tell us what helped and what missed. One example is enough for us to dig in.</p>
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
