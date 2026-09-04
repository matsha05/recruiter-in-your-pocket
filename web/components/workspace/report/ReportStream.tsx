"use client";

import { useEffect, useMemo } from "react";
import {
  ArrowRight,
  BracketsAngle,
  CaretDown,
  CheckCircle,
  CornersOut,
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
    "What felt immediately useful?",
    "",
    "What felt untrustworthy, generic, or wrong?",
    "",
    "What almost stopped you from finishing?",
    "",
    "Optional: Did the score feel like a document review, or did it mean something else to you?",
  ].join("\n"),
)}`;

function MarkedTakeaway({ text }: { text: string }) {
  const match = text.match(/\bbigger\b/i);
  if (!match || match.index === undefined) return <>{text}</>;
  const start = match.index;
  const end = start + match[0].length;
  return <>{text.slice(0, start)}<span className="riyp-marker">{text.slice(start, end)}</span>{text.slice(end)}</>;
}

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
  const roleFit = report.job_alignment?.role_fit;
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
    <div className={cn("mx-auto max-w-[58rem] pb-16", className)}>
      {comparisonBaseline && <ReadComparison previous={comparisonBaseline} current={report} />}
      <section id="section-first-impression" className="scroll-mt-36 pb-6 pt-2 sm:pb-8 sm:pt-4">
        <div className="flex items-start justify-between gap-4 border-b border-[hsl(var(--paper-line))] pb-4">
          <p className="text-[11px] font-semibold uppercase riyp-track-017 text-brand">First impression</p>
          {typeof report.score === "number" ? (
            <div className="max-w-[14rem] text-right">
              <p className="riyp-tabular-label text-[11px] font-semibold uppercase riyp-track-015 text-foreground">Clarity summary: {report.score}/100</p>
              <p className="mt-1 text-[11px] leading-4 text-muted-foreground">Not a prediction of interviews or offers.</p>
            </div>
          ) : (
            <p className="riyp-tabular-label text-[11px] uppercase riyp-track-015 text-muted-foreground">Opening read</p>
          )}
        </div>

        <div className="pt-5">
          <div className="border-l-2 border-cyan-bright pl-4 sm:pl-6">
            <h1 className={cn(styles.openingTitle, "font-display font-semibold tracking-[-0.045em] text-foreground")}>
              <MarkedTakeaway text={report.first_impression_takeaway || "Here's where to start."} />
            </h1>
          </div>
          <p className="mt-4 max-w-[43rem] text-base leading-7 text-foreground/80 sm:text-lg sm:leading-8">{report.score_comment_short || report.first_impression || report.summary}</p>
        </div>

        <div className="mt-5 grid border-y border-[hsl(var(--paper-line))] sm:grid-cols-2 sm:divide-x sm:divide-[hsl(var(--paper-line))]">
          <div className="border-b border-[hsl(var(--paper-line))] bg-accent-butter/20 px-4 py-4 sm:border-b-0 sm:px-5">
            <div className="flex items-center gap-3 text-brand"><CornersOut className="size-4" weight="bold" aria-hidden="true" /><p className="text-[11px] font-semibold uppercase riyp-track-015 text-foreground/75">What works</p></div>
            <p className="mt-2 text-sm font-medium leading-6 text-foreground sm:text-base">{strengths[0] || "The core of your experience is easy to follow."}</p>
          </div>
          <div className="bg-surface-sky px-4 py-4 sm:px-5">
            <div className="flex items-center gap-3 text-brand"><BracketsAngle className="size-4" weight="bold" aria-hidden="true" /><p className="riyp-text-annotation text-[11px] font-semibold uppercase riyp-track-015">What needs context</p></div>
            <p className="mt-2 text-sm font-medium leading-6 text-foreground sm:text-base">{report.gaps?.[0] || report.biggest_gap_example || "The scale and result need more detail."}</p>
          </div>
        </div>

        <div className="mt-2 flex justify-end">
          <button type="button" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand" onClick={() => {
            const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            document.getElementById("section-fixes")?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
          }}>
            See the fixes <ArrowRight className="size-4" weight="bold" />
          </button>
        </div>
      </section>

      <section id="section-fixes" className="scroll-mt-36 border-t border-foreground/80 pt-6">
        <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-[clamp(1.85rem,4vw,2.8rem)] riyp-weight-520 leading-tight tracking-[-0.04em] text-foreground">{fixPlanHeadingForCount(fixes.length)}</h2>
          </div>
          <p className="max-w-[20rem] text-sm leading-6 text-muted-foreground">Start with the original line. Add the details you can verify.</p>
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

      {strengths.length > 0 && (
        <section id="section-keep" className="scroll-mt-36 border-t border-foreground/80 py-11 sm:py-14">
          <div className="grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12">
            <div>
              <p className="text-[11px] font-semibold uppercase riyp-track-017 text-brand">Keep these</p>
              <h2 className="mt-3 font-display text-3xl riyp-weight-520 leading-tight text-foreground">Keep what&apos;s working.</h2>
            </div>
            <ol className="divide-y divide-[hsl(var(--paper-line))] border-y border-[hsl(var(--paper-line))]">
              {strengths.map((strength, index) => (
                <li key={strength} className="grid grid-cols-[2rem_1fr] gap-3 py-5">
                  <span className="riyp-tabular-label text-[11px] font-semibold text-brand">0{index + 1}</span>
                  <p className="text-base leading-7 text-foreground/85">{strength}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {report.job_alignment && (
        <section id="section-role" className="scroll-mt-36 border-t border-foreground/80 py-11 sm:py-14">
          <div className="flex items-center gap-2 text-brand"><Target className="size-5" weight="duotone" /><p className="text-[11px] font-semibold uppercase riyp-track-017">Role direction</p></div>
          <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(15rem,0.65fr)] lg:gap-12">
            <div>
              <h2 className="font-display text-[clamp(2rem,5vw,3.7rem)] riyp-weight-520 leading-[1.02] tracking-[-0.03em] text-foreground">{hasJobDescription ? "How your experience fits this role." : "Roles your experience points toward."}</h2>
              <p className="mt-5 max-w-[42rem] text-base leading-7 text-foreground/80">{report.job_alignment.positioning_suggestion || report.job_alignment.jd_match_summary}</p>
            </div>
            <div className="border-l-2 border-brand/30 pl-5">
              <p className="text-[11px] font-semibold uppercase riyp-track-015 text-muted-foreground">Best fit now</p>
              <ul className="mt-4 space-y-3">
                {(roleFit?.best_fit_roles || []).slice(0, 3).map((role) => <li key={role} className="text-sm font-medium leading-6 text-foreground">{role}</li>)}
              </ul>
              {roleFit?.seniority_read && <p className="mt-5 text-xs leading-5 text-muted-foreground">Level suggested by the resume: {roleFit.seniority_read}</p>}
            </div>
          </div>
        </section>
      )}

      <details id="section-score" className="group scroll-mt-36 border-y border-[hsl(var(--paper-line))]" data-testid="clarity-summary-basis">
        <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-4 [&::-webkit-details-marker]:hidden">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
            <span className="text-sm font-semibold text-foreground">How the clarity summary breaks down</span>
            {typeof report.score === "number" && <span className="text-xs text-muted-foreground">{report.score}/100</span>}
          </div>
          <CaretDown className="size-4 shrink-0 text-brand transition-transform group-open:rotate-180" />
        </summary>
        <div className="grid gap-6 border-t border-[hsl(var(--paper-line))] py-6 sm:grid-cols-[10rem_1fr]">
          <div>
            <p className="font-display text-5xl riyp-weight-520 leading-none text-foreground">{report.score ?? "—"}</p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">This score summarizes the four parts of the review shown here. It does not predict interviews or offers, and it is not a simple average.</p>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
            {Object.entries(report.subscores || {}).map(([label, score]) => (
              <div key={label}><p className="text-xl font-semibold tabular-nums text-foreground">{score}</p><p className="mt-1 text-xs capitalize text-muted-foreground">{label}</p></div>
            ))}
          </div>
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
          <div className={styles.feedbackRule} aria-hidden="true" />
          <div className={styles.feedbackContent}>
            <div>
              <p className="text-[11px] font-semibold uppercase riyp-track-017 text-brand">Help improve the report</p>
              <h2 id="report-feedback-title" className={styles.feedbackTitle}>What did this report get right—or miss?</h2>
              <p className={styles.feedbackCopy}>Tell us which advice helped and which line needs another look. A specific example makes your feedback easier to act on.</p>
            </div>
            <div className={styles.feedbackAction}>
              <Button asChild variant="outline" size="lg" className="border-foreground/35 bg-paper hover:border-brand/45 hover:bg-brand/5">
                <a href={REPORT_FEEDBACK_HREF}>Send feedback<EnvelopeSimple className="ml-1 size-4 text-brand" weight="bold" /></a>
              </Button>
              <p className={styles.feedbackNote}>Three prompts open in your email. Your resume is never attached.</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
