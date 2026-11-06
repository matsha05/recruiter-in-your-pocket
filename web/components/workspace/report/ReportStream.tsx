"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CaretDown, Check, WarningCircle } from "@phosphor-icons/react";
import { Analytics } from "@/lib/analytics";
import { isWorklistReport } from "@/lib/llm/worklist-schema";
import { bracketPlaceholderKeys } from "@/lib/llm/report-placeholder-policy";
import { resolveUniqueSourceLine } from "@/lib/llm/source-fidelity";
import { readAnonymousReportRecoveryMarker } from "@/lib/reports/anonymous-report-recovery-client";
import { liftAnswersFromStored, sendLineAnswers, storedAnswersFromLift, type StoredLineAnswersByFix } from "@/lib/reports/line-answers";
import { buildPdfExportRequest } from "@/lib/reports/pdf-export";
import { sendReportFeedback } from "@/lib/reports/report-feedback";
import {
  buildReportRewritePresentation,
  criticalCountHeading,
  fixLabel,
  fixPlanHeadingForCount,
  questionForPlaceholder,
  readCriticalMisses,
  reportHasJobDescription,
  TIGHTENING_HEADING,
  withCriticalFirst,
} from "@/lib/reports/report-presentation";
import { reportTone } from "@/lib/reports/score-band";
import { criticalMissReason, fixCardSlots, reconcileReport } from "@/lib/reports/report-integrity";
import { splitVerdict } from "@/lib/reports/report-opening";
import { liftQuestions } from "@/lib/reports/revised-line";
import { saveUnlockContext } from "@/lib/unlock/unlockContext";
import { cn } from "@/lib/utils";
import { IndependentAdvice } from "./IndependentAdvice";
import { ReadComparison } from "./ReadComparison";
import { ReportEnding } from "./ReportEnding";
import { WorklistReport } from "./worklist/WorklistReport";
import { ResearchReceipts } from "./ResearchReceipts";
import type { ReportData } from "./ReportTypes";
import { DEFAULT_LIFT_QUESTION, type LiftChange, type LiftPersist, type ResumeSource } from "./markup/LineLift";
import { CriticalMissRow, FixRow, PageNote, excerptOf, marksLine } from "./markup/MarkedRows";
import { ScoreBand } from "./markup/ScoreBand";
import { hiddenFixesKey, useHiddenFixes } from "./markup/useHiddenFixes";
import styles from "./markup/MarkedReport.module.css";

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
  /** Why the resume may be missing: a saved report never keeps it; a reloaded one lost it. */
  resumeSource?: ResumeSource;
  /** The reader's answers kept with a saved report, keyed by fix position (W3). */
  storedLineAnswers?: StoredLineAnswersByFix | null;
  /** The reader has an account, so the report can be kept and its answers stay with it. */
  isSignedIn?: boolean;
  /** Saves this report to My reports; absent once it is saved. */
  onSaveReport?: () => void;
  isSavingReport?: boolean;
}

/**
 * The report: one document, the same on the sample, a fresh read, a recovered
 * read, a saved report and the PDF (plan item 2.4). The opening read gives the
 * Verdict and the score band; the page below marks the candidate's own lines,
 * with the recruiter's notes in the margin and the Critical Miss highlighted.
 */
export function ReportStream(props: ReportStreamProps) {
  // The worklist report (contract v3, Nov 5, 2026) has its own document; the Critical Miss report below is
  // the v2 shape every report saved before it still has.
  if (isWorklistReport(props.report)) {
    return (
      <WorklistReport
        report={props.report}
        className={props.className}
        isSample={props.isSample}
        freeUsesRemaining={props.freeUsesRemaining}
        hasPaidAccess={props.hasPaidAccess}
        comparisonBaseline={props.comparisonBaseline}
        onStartRevision={props.onStartRevision}
        onStartReport={props.onStartReport}
        onUpgrade={props.onUpgrade}
        resumeText={props.resumeText}
        storedLineAnswers={props.storedLineAnswers}
        isSignedIn={props.isSignedIn}
        onSaveReport={props.onSaveReport}
        isSavingReport={props.isSavingReport}
      />
    );
  }
  return <CriticalMissReport {...props} />;
}

function CriticalMissReport({
  report,
  className,
  isSample = false,
  freeUsesRemaining = 1,
  onUpgrade,
  hasJobDescription: hasJobDescriptionText = false,
  isGated = false,
  hasPaidAccess = false,
  comparisonBaseline = null,
  onStartRevision,
  onStartReport,
  resumeText,
  resumeSource,
  storedLineAnswers = null,
  isSignedIn = false,
  onSaveReport,
  isSavingReport = false,
}: ReportStreamProps) {
  // One disposition per resume line and each observation once, shared with the PDF. Critical Misses lead.
  const integrity = useMemo(() => reconcileReport(withCriticalFirst(report)), [report]);
  const reconciled = integrity.report;
  const fixes = useMemo(() => (reconciled.top_fixes || []).slice(0, 3), [reconciled.top_fixes]);
  const presentation = useMemo(
    () => buildReportRewritePresentation(fixes, reconciled.rewrites || []),
    [fixes, reconciled.rewrites],
  );
  const strengths = (reconciled.strengths || []).slice(0, 3);
  const roleFit = report.job_alignment?.role_fit;
  const verdict = report.first_impression || report.first_impression_takeaway || report.summary || "Here's where to start.";
  // The first sentence leads the phone's first screen; the rest waits behind "Read the rest" (W1).
  const opening = useMemo(() => splitVerdict(verdict), [verdict]);
  const [restOpen, setRestOpen] = useState(false);
  const readLine = report.score_comment_short && report.score_comment_short !== verdict && report.score_comment_short !== opening.lead ? report.score_comment_short : null;
  const misses = readCriticalMisses(reconciled);
  // How the report speaks to this page: a clear page with one miss gets the question a recruiter would
  // ask, never a Critical Miss; the bottom rung is where the questions come first (Matt, Nov 5, 2026).
  const tone = reportTone(report.score, misses);
  const countHeading = criticalCountHeading(misses, tone);
  const criticals = fixes.slice(0, misses.count);
  const ready = tone === "ready" && misses.count === 1;
  const isExhausted = !isSample && freeUsesRemaining <= 0 && !hasPaidAccess;
  // A recovered report has lost the posting's text but not the fact that it was read against one.
  const hasJobDescription = hasJobDescriptionText || reportHasJobDescription(report);

  // The resume this visit can check lines against: the one it ran on, or one pasted back in.
  const [reattached, setReattached] = useState<string | undefined>();
  const sourceText = resumeText?.trim() ? resumeText : reattached;
  const source: ResumeSource = sourceText ? "attached" : resumeSource || (isSample ? "sample" : "saved");
  const reattach = useCallback((text: string) => {
    const matches = fixes.some((fix) => resolveUniqueSourceLine(excerptOf(fix), text).status === "resolved");
    if (!matches) return "That resume doesn't have the lines this report quotes. Paste the version you ran the report on.";
    setReattached(text);
    return null;
  }, [fixes]);

  const hiddenFixes = useHiddenFixes(isSample ? undefined : hiddenFixesKey(report));
  // One revised-line flow per critical fix, each with its own state.
  const [lifts, setLifts] = useState<Record<number, LiftChange>>({});
  const liftHandlers = useMemo(() => [0, 1, 2].map((index) => (change: LiftChange) => {
    setLifts((current) => (current[index]?.state === change.state && current[index]?.line === change.line ? current : { ...current, [index]: change }));
  }), []);
  // A Critical Miss about something the resume doesn't have has no line to revise.
  const revisable = criticals.flatMap((fix, index) => (marksLine(fix) ? [index] : []));
  const allAddressed = revisable.length > 0 && revisable.every((index) => lifts[index]?.state === "addressed");

  const questionsFor = useCallback((index: number) => {
    const asked = liftQuestions(integrity.fixQuestions[index] || []);
    if (asked.length > 0) return asked;
    const draft = presentation.fixes[index]?.rewrite?.better || "";
    return liftQuestions(bracketPlaceholderKeys(draft).map(questionForPlaceholder));
  }, [integrity.fixQuestions, presentation.fixes]);

  const firstState = lifts[0]?.state;
  useEffect(() => {
    if (firstState === "addressed") Analytics.track("critical_miss_addressed", { sample: isSample });
  }, [isSample, firstState]);

  const handleUnlock = () => {
    if (!onUpgrade) return;
    saveUnlockContext({ section: "bullet_upgrades" });
    Analytics.paywallCtaClicked("bullet_upgrades");
    onUpgrade();
  };

  // The report the server can check a polish request against: a saved report's id, or this browser's
  // anonymous report recovery. The sample has neither, so it keeps the literal line.
  const reportId = buildPdfExportRequest(report)?.report_id;
  const [recoveryId, setRecoveryId] = useState<string | undefined>();
  useEffect(() => {
    if (isSample || reportId) return;
    setRecoveryId(readAnonymousReportRecoveryMarker()?.recoveryId);
  }, [isSample, reportId, report]);
  const polishContext = isSample ? undefined : reportId ? { reportId } : recoveryId ? { recoveryId } : undefined;

  // Answers are kept with the report when it has a row of its own, which only a signed-in report does (W3).
  const askedFor = (index: number) => { const asked = questionsFor(index); return asked.length > 0 ? asked : [DEFAULT_LIFT_QUESTION]; };
  const liftInitial = (index: number) => liftAnswersFromStored(storedLineAnswers?.[String(index)], askedFor(index)) ?? undefined;
  const persistHandlers = useMemo(() => (!reportId || isSample ? [] : [0, 1, 2].map((index) => (change: LiftPersist) => sendLineAnswers(reportId, {
    fix_index: index,
    answers: storedAnswersFromLift(change.questions, change.answers),
    line: change.line,
    source: change.source,
  }))), [isSample, reportId]);

  const liftProps = { resumeText: sourceText, source, onReattach: isSample ? undefined : reattach, polishContext };

  return (
    <div className={cn(styles.root, className)}>
      {comparisonBaseline && <ReadComparison previous={comparisonBaseline} current={report} />}

      <section id="section-first-impression" className={cn(styles.opening, "scroll-mt-36")} aria-labelledby="report-verdict">
        <p className="riyp-verdict-label text-muted-foreground">Verdict</p>
        <h1 id="report-verdict" className={opening.rest ? styles.verdictLead : styles.verdict}>{opening.lead}</h1>
        {(opening.rest || readLine) && (
          <div className={styles.verdictRest} data-folded={restOpen ? undefined : ""} data-testid="verdict-rest">
            <div id="verdict-rest" className={styles.verdictRestText}>
              {opening.rest && <p>{opening.rest}</p>}
              {/* The one-sentence read the homepage quotes (Impeccable 8): under the Verdict, where a visitor looks for it. */}
              {readLine && <p className={styles.readLine} data-testid="report-read-line">{readLine}</p>}
            </div>
            {!restOpen && (
              <button type="button" className={cn("focus-ring", styles.readRest)} aria-expanded={false} aria-controls="verdict-rest" onClick={() => setRestOpen(true)}>
                Read the rest
              </button>
            )}
          </div>
        )}
        {typeof report.score === "number" && <ScoreBand score={report.score} />}
        {/* A structural gap the model flags (a dated break, a missing section) is said in the opening read, where the person looks for it. */}
        {integrity.structuralGaps.length > 0 && (
          <div className={styles.gapRow} data-testid="structural-gaps">
            <p className={styles.gapLabel}><WarningCircle className="size-4" weight="bold" aria-hidden="true" />Before the bullets</p>
            {integrity.structuralGaps.map((gap) => <p key={gap.text} className={styles.gapText}>{gap.text}</p>)}
          </div>
        )}
      </section>

      <section id="section-fixes" className={cn(styles.page, "scroll-mt-36")} aria-labelledby="fixes-title" data-tone={tone}>
        {countHeading ? (
          <div className={styles.countHead}>
            <h2 id="fixes-title" className={styles.sectionTitle}>{countHeading.title}</h2>
            <p className={styles.countLead}>{countHeading.lead}</p>
          </div>
        ) : (
          <h2 id="fixes-title" className={cn(styles.sectionTitle, styles.pageTitle)}>{fixPlanHeadingForCount(fixes.length)}</h2>
        )}
        <ol className={styles.lines}>
          {criticals.map((fix, index) => (
            <CriticalMissRow
              key={`${fix.fix || fix.text}-${index}`}
              fix={fix}
              index={index}
              label={fixLabel(index, misses, tone, fixes.length)}
              definition={index === 0 && !countHeading ? "The one thing to fix first" : undefined}
              why={index === 0 ? criticalMissReason(integrity) : fixCardSlots(integrity, index).why}
              hidden={hiddenFixes.isHidden(index)}
              onHide={() => hiddenFixes.hide(index)}
              onRestore={() => hiddenFixes.restore(index)}
              onLiftChange={liftHandlers[index]}
              liftState={lifts[index]?.state ?? "open"}
              questions={questionsFor(index)}
              initial={liftInitial(index)}
              onPersist={persistHandlers[index]}
              feedback={isSample || index > 0 ? undefined : {
                question: "Was this the right thing to fix first?",
                onSubmit: ({ right, note }) => sendReportFeedback({
                  reportId: buildPdfExportRequest(report)?.report_id,
                  criticalMiss: fix.fix || fix.text || "",
                  right,
                  note,
                }),
              }}
              {...liftProps}
            />
          ))}

          {strengths[0] && (
            <PageNote kind="keep">
              <Check className={styles.keepTick} weight="bold" aria-hidden="true" />
              <div>
                <p className={styles.keepLabel}>Keep this one</p>
                <p className={styles.keepText}>{strengths[0]}</p>
              </div>
            </PageNote>
          )}

          {/* On a clear page the rest are tweaks, under their own heading, not fixes. */}
          {ready && fixes.length > 1 && (
            <li className={styles.tighteningHead} aria-hidden="true"><p className={styles.sectionTitle}>{TIGHTENING_HEADING}</p></li>
          )}
          {fixes.slice(criticals.length).map((fix, offset) => {
            const index = offset + criticals.length;
            const slots = fixCardSlots(integrity, index);
            return (
              <FixRow
                key={`${fix.fix || fix.text}-${index}`}
                fix={fix}
                index={index}
                total={fixes.length}
                label={ready ? fixLabel(index, misses, tone, fixes.length) : undefined}
                why={slots.why}
                whatToAdd={slots.whatToAdd}
                hidden={hiddenFixes.isHidden(index)}
                locked={isGated}
                onHide={() => hiddenFixes.hide(index)}
                onRestore={() => hiddenFixes.restore(index)}
                onUnlock={handleUnlock}
                questions={questionsFor(index)}
                initial={liftInitial(index)}
                onPersist={persistHandlers[index]}
                {...liftProps}
              />
            );
          })}
        </ol>
      </section>

      <ResearchReceipts />

      <IndependentAdvice rewrites={presentation.independentRewrites} resumeText={sourceText} isReadOnly={isSample} />

      {strengths.length > 1 && (
        <section id="section-keep" className={cn(styles.keep, "scroll-mt-36")} aria-labelledby="keep-title">
          <h2 id="keep-title" className={styles.sectionTitle}>Keep these. They&apos;re working.</h2>
          <ul className={styles.keepList}>
            {strengths.slice(1).map((strength) => (
              <li key={strength} className={styles.keepNote}>
                <Check className={styles.keepTick} weight="bold" aria-hidden="true" />
                <p className={styles.keepText}>{strength}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {report.job_alignment && (
        <section id="section-role" className={cn(styles.role, "scroll-mt-36")} aria-labelledby="role-title">
          <h2 id="role-title" className={styles.sectionTitle}>{hasJobDescription ? "How your experience fits this role." : "Roles your experience points toward."}</h2>
          <div className={styles.roleGrid}>
            <p className={styles.bodyText}>{report.job_alignment.positioning_suggestion || report.job_alignment.jd_match_summary}</p>
            <div className={styles.roleList}>
              <p className={styles.keepLabel}>Roles to consider</p>
              <ul>{(roleFit?.best_fit_roles || []).slice(0, 3).map((role) => <li key={role}>{role}</li>)}</ul>
              {roleFit?.seniority_read && <p className={styles.roleMeta}>Level suggested by the resume: {roleFit.seniority_read}</p>}
            </div>
          </div>
        </section>
      )}

      <details id="section-score" className={cn("ui-disclosure group scroll-mt-36", styles.disclosure)} data-testid="score-basis">
        <summary className={cn("focus-ring", styles.disclosureSummary)}>
          <span>How the score works</span>
          <CaretDown className="size-4 shrink-0 text-brand transition-transform duration-fast ease-snap group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
        </summary>
        <div className={styles.disclosureBody}>
          <p>The score weighs four things a recruiter notices: the results you show, how clearly each line reads, how your experience fits together, and how easy the text is to follow. It doesn&apos;t predict interviews or offers.</p>
          {report.score_plain && <p>{report.score_plain}</p>}
          {report.score_comment_long && report.score_comment_long !== report.score_plain && <p>{report.score_comment_long}</p>}
        </div>
      </details>

      <ReportEnding
        isSample={isSample}
        isSignedIn={isSignedIn}
        isExhausted={isExhausted}
        ready={ready}
        allAddressed={allAddressed}
        revisedCount={revisable.length}
        onStartReport={onStartReport}
        onStartRevision={onStartRevision}
        onSaveReport={onSaveReport}
        isSavingReport={isSavingReport}
        onUpgrade={onUpgrade}
      />
    </div>
  );
}
