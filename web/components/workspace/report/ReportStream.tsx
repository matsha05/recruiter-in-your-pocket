"use client";

import { useEffect, useMemo } from "react";
import {
  ArrowRight,
  BracketsAngle,
  CaretDown,
  CheckCircle,
  ClipboardText,
  CornersOut,
  EnvelopeSimple,
  PaperPlaneTilt,
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
import { FixCanvas, evidenceFor } from "./FixCanvas";
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

const BETA_FEEDBACK_HREF = `mailto:support@recruiterinyourpocket.com?subject=${encodeURIComponent(
  "Beta report feedback",
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
  const primaryFix = fixes[0];
  const primaryEvidence = evidenceFor(primaryFix);
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
      <section id="section-first-impression" className="scroll-mt-36 pb-10 pt-2 sm:pb-14 sm:pt-8">
        <div className="flex items-start justify-between gap-4 border-b border-[hsl(var(--paper-line))] pb-4">
          <p className="text-[11px] font-semibold uppercase riyp-track-017 text-brand">The read</p>
          {typeof report.score === "number" ? (
            <div className="max-w-[14rem] text-right">
              <p className="riyp-tabular-label text-[11px] font-semibold uppercase riyp-track-015 text-foreground">Clarity summary: {report.score}/100</p>
              <p className="mt-1 text-[11px] leading-4 text-muted-foreground">Not a prediction of interviews or offers.</p>
            </div>
          ) : (
            <p className="riyp-tabular-label text-[11px] uppercase riyp-track-015 text-muted-foreground">Opening read</p>
          )}
        </div>

        <div className="pt-6 sm:pt-6">
          <div className="border-l-2 border-cyan-bright pl-5 sm:pl-12">
            <h1 className="report-opening-title font-display font-semibold tracking-[-0.055em] text-foreground">
              <MarkedTakeaway text={report.first_impression_takeaway || "Make the proof easier to see."} />
            </h1>
          </div>
          <p className="mt-5 max-w-[43rem] text-lg leading-8 text-foreground/80 sm:text-xl sm:leading-9">{report.score_comment_short || report.first_impression || report.summary}</p>
        </div>

        <div className="mt-4 grid border-y border-[hsl(var(--paper-line))] sm:grid-cols-3 sm:divide-x sm:divide-[hsl(var(--paper-line))]">
          <div className="report-evidence-tile border-b border-[hsl(var(--paper-line))] bg-accent-butter/20 px-5 py-5 sm:border-b-0 sm:px-6 sm:py-7">
            <div className="flex items-center gap-3 text-brand"><CornersOut className="size-5" weight="bold" aria-hidden="true" /><p className="text-[11px] font-semibold uppercase riyp-track-015 text-foreground/75">What lands</p></div>
            <p className="mt-3 text-lg font-medium leading-7 text-foreground">{strengths[0] || "The core of your experience is easy to follow."}</p>
          </div>
          <div className="report-evidence-tile border-b border-[hsl(var(--paper-line))] bg-paper px-5 py-5 sm:border-b-0 sm:px-6 sm:py-7">
            <div className="flex items-center gap-3 text-brand"><BracketsAngle className="size-5" weight="bold" aria-hidden="true" /><p className="riyp-text-annotation text-[11px] font-semibold uppercase riyp-track-015">Where doubt creeps in</p></div>
            <p className="mt-3 text-lg font-medium leading-7 text-foreground">{report.gaps?.[0] || report.biggest_gap_example || "The scale and result need more proof."}</p>
          </div>
          <div className="report-evidence-tile bg-surface-sky px-5 py-5 sm:px-6 sm:py-7">
            <div className="flex items-center gap-3 text-cyan-bright"><PaperPlaneTilt className="size-5" weight="bold" aria-hidden="true" /><p className="text-[11px] font-semibold uppercase riyp-track-015 text-brand">Fix first</p></div>
            <p className="mt-3 text-lg font-medium leading-7 text-foreground">{primaryFix?.fix || primaryFix?.text || "Make the strongest part of the story more specific."}</p>
          </div>
        </div>

        {primaryEvidence && (
          <div className="mt-7 flex items-start gap-3 sm:ml-[3.75rem]">
            <ClipboardText className="riyp-text-annotation mt-0.5 size-5 shrink-0" weight="duotone" />
            <p className="text-sm leading-6 text-muted-foreground"><span className="font-semibold text-foreground">What we saw on the page:</span> “{primaryEvidence}”</p>
          </div>
        )}

        <div className="mt-4 flex items-end justify-between gap-6 border-t border-foreground/70 pt-5">
          <div>
            <p className="text-[11px] font-semibold uppercase riyp-track-017 text-brand">The evidence</p>
            <p className="mt-2 text-sm text-muted-foreground">The specifics that support this read.</p>
          </div>
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
            <p className="text-[11px] font-semibold uppercase riyp-track-017 text-brand">Fix these first</p>
            <h2 className="mt-3 font-display text-[clamp(2.3rem,6vw,4.5rem)] riyp-weight-520 leading-none tracking-[-0.04em] text-foreground">{fixPlanHeadingForCount(fixes.length)}</h2>
          </div>
          <p className="max-w-[20rem] text-sm leading-6 text-muted-foreground">Each one starts with evidence from the resume, then shows the context or proof that would make the story stronger.</p>
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
              <h2 className="mt-3 font-display text-3xl riyp-weight-520 leading-tight text-foreground">The parts already earning trust.</h2>
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
              <h2 className="font-display text-[clamp(2rem,5vw,3.7rem)] riyp-weight-520 leading-[1.02] tracking-[-0.03em] text-foreground">{hasJobDescription ? "How this resume meets the role." : "Where this story reads strongest."}</h2>
              <p className="mt-5 max-w-[42rem] text-base leading-7 text-foreground/80">{report.job_alignment.positioning_suggestion || report.job_alignment.jd_match_summary}</p>
            </div>
            <div className="border-l-2 border-brand/30 pl-5">
              <p className="text-[11px] font-semibold uppercase riyp-track-015 text-muted-foreground">Best fit now</p>
              <ul className="mt-4 space-y-3">
                {(roleFit?.best_fit_roles || []).slice(0, 3).map((role) => <li key={role} className="text-sm font-medium leading-6 text-foreground">{role}</li>)}
              </ul>
              {roleFit?.seniority_read && <p className="mt-5 text-xs leading-5 text-muted-foreground">Seniority read: {roleFit.seniority_read}</p>}
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
            <p className="mt-2 text-xs leading-5 text-muted-foreground">A document-clarity read across the four signals shown here. It is not a prediction of interviews or offers, and the four signals are not presented as a simple average.</p>
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
              <p className="text-xs font-semibold uppercase riyp-track-017 text-brand">Your first read</p>
              <h2 id="sample-report-next-step-title" className={styles.revisionTitle}>Now see what lands in yours.</h2>
              <p className={styles.revisionCopy}>Upload or paste your resume for the same evidence-first read, built from your actual work and the role you want.</p>
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
              <h2 id="revision-loop-title" className={styles.revisionTitle}>Run the new version. Compare the read.</h2>
              <p className={styles.revisionCopy}>{isExhausted ? <>{JOB_SEARCH_PASS_DECISION.freeBoundary} {JOB_SEARCH_PASS_DECISION.whenToBuy}</> : <>Upload the revised resume and we&apos;ll place the two opening reads side by side: what changed, what still needs context, and what to fix next.</>}</p>
            </div>
            <div className={styles.revisionAction}>
              <Button variant={isExhausted ? "premium" : "brand"} size="lg" onClick={isExhausted && onUpgrade ? onUpgrade : onStartRevision}>
                {isExhausted ? JOB_SEARCH_PASS_DECISION.cta : "Review the revised resume"}<ArrowRight className="ml-2 size-4" weight="bold" />
              </Button>
              <p className={styles.revisionNote}>{isExhausted ? JOB_SEARCH_PASS_DECISION.terms : "The comparison stays in this browser visit."}</p>
            </div>
          </div>
        </section>
      )}

      {!isSample && (
        <section className={styles.feedbackSection} aria-labelledby="beta-feedback-title" data-testid="beta-feedback">
          <div className={styles.feedbackRule} aria-hidden="true" />
          <div className={styles.feedbackContent}>
            <div>
              <p className="text-[11px] font-semibold uppercase riyp-track-017 text-brand">A note for the beta</p>
              <h2 id="beta-feedback-title" className={styles.feedbackTitle}>What did this report get right—or miss?</h2>
              <p className={styles.feedbackCopy}>This beta is small, and I read every note, especially the blunt ones. Tell me what felt useful, what felt off, and what nearly stopped you.</p>
            </div>
            <div className={styles.feedbackAction}>
              <Button asChild variant="outline" size="lg" className="border-foreground/35 bg-paper hover:border-brand/45 hover:bg-brand/5">
                <a href={BETA_FEEDBACK_HREF}>Send a two-minute note<EnvelopeSimple className="ml-1 size-4 text-brand" weight="bold" /></a>
              </Button>
              <p className={styles.feedbackNote}>{FREE_REPORT_ENTITLEMENT.promise} {FREE_REPORT_ENTITLEMENT.boundary}</p>
              <p className={styles.feedbackNote}>Three prompts open in your email. Your resume is never attached.</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
