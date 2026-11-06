"use client";

import { useCallback, useMemo, useState } from "react";
import { CaretDown } from "@phosphor-icons/react";
import type { WorklistReport as Report } from "@/lib/llm/worklist-schema";
import { isWorklistReport } from "@/lib/llm/worklist-schema";
import { sendLineAnswers, type LineAnswersPatch, type StoredLineAnswersByFix } from "@/lib/reports/line-answers";
import { buildPdfExportRequest } from "@/lib/reports/pdf-export";
import { SCORE_BANDS, scoreBandIndex } from "@/lib/reports/score-band";
import { cardsHeading, fitHeading, POSTING_MISSING_LABEL, UNLISTED_LINES_NOTE, workCards } from "@/lib/reports/worklist-presentation";
import { cn } from "@/lib/utils";
import { ReportEnding } from "../ReportEnding";
import { ResearchReceipts } from "../ResearchReceipts";
import type { ReportData } from "../ReportTypes";
import { ScoreBand } from "../markup/ScoreBand";
import shared from "../markup/MarkedReport.module.css";
import { WorklistCard, type CardState } from "./WorklistCard";
import { WorklistComparison } from "./WorklistComparison";
import styles from "./Worklist.module.css";

export interface WorklistReportProps {
  report: Report & Pick<ReportData, "id">;
  className?: string;
  isSample?: boolean;
  freeUsesRemaining?: number;
  hasPaidAccess?: boolean;
  comparisonBaseline?: ReportData | null;
  onStartRevision?: () => void;
  onStartReport?: () => void;
  onUpgrade?: () => void;
  resumeText?: string;
  storedLineAnswers?: StoredLineAnswersByFix | null;
  isSignedIn?: boolean;
  onSaveReport?: () => void;
  isSavingReport?: boolean;
}

/**
 * The worklist report (Matt, Nov 5, 2026): the score and its rung, the verdict, the recruiter's write-up, then
 * one card per line that needs work, in the order a recruiter hits them, each with the line as written, what a
 * recruiter can't tell, the example with blanks the person fills, and the question. Then fit, the research
 * behind the read, how the score works, and the ending. One component serves the sample, a fresh, recovered or
 * saved report; the PDF prints the same order.
 */
export function WorklistReport({
  report,
  className,
  isSample = false,
  freeUsesRemaining = 1,
  hasPaidAccess = false,
  comparisonBaseline = null,
  onStartRevision,
  onStartReport,
  onUpgrade,
  resumeText,
  storedLineAnswers = null,
  isSignedIn = false,
  onSaveReport,
  isSavingReport = false,
}: WorklistReportProps) {
  const band = SCORE_BANDS[Math.max(0, scoreBandIndex(report.score))];
  const heading = cardsHeading(report);
  const work = workCards(report);
  const ready = work.length === 0;
  const isExhausted = !isSample && freeUsesRemaining <= 0 && !hasPaidAccess;
  const reportId = buildPdfExportRequest(report)?.report_id;

  // One state per card, so the ending knows when every line with blanks is filled.
  const [states, setStates] = useState<Record<number, CardState>>({});
  const onStateChange = useCallback((index: number, state: CardState) => {
    setStates((current) => (current[index] === state ? current : { ...current, [index]: state }));
  }, []);
  const fillable = report.cards.flatMap((card, index) => (card.kind !== "keep" && /\[[^\]]*\]/u.test(card.example) ? [index] : []));
  const filled = fillable.filter((index) => states[index] === "filled");
  const allAddressed = fillable.length > 0 && filled.length === fillable.length;

  // Answers are kept with the report when it has a row of its own, which only a signed-in report does (W3).
  const persist = useMemo(() => (reportId && !isSample ? (patch: LineAnswersPatch) => sendLineAnswers(reportId, patch) : undefined), [isSample, reportId]);
  const previous = comparisonBaseline && isWorklistReport(comparisonBaseline) ? comparisonBaseline : null;
  const posting = report.fit.posting;

  return (
    <div className={cn(styles.root, className)} data-testid="worklist-report">
      {previous && <WorklistComparison previous={previous} current={report} />}

      <section id="section-first-impression" className={cn(styles.opening, "scroll-mt-36")} aria-labelledby="report-verdict">
        <div className={styles.top}>
          <p className={styles.score} aria-label={`Score ${report.score} out of 99`} data-testid="worklist-score">{report.score}</p>
          <ScoreBand score={report.score} />
        </div>
        <h1 id="report-verdict" className={styles.verdict}>{report.verdict}</h1>
        <div className={styles.writeUp} data-testid="worklist-write-up">
          {report.write_up.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        </div>
      </section>

      <section id="section-fixes" className={cn(styles.page, "scroll-mt-36")} aria-labelledby="fixes-title" data-ready={ready || undefined}>
        <h2 id="fixes-title" className={styles.sectionTitle}>{heading.title}</h2>
        {heading.lead && <p className={styles.sectionLead}>{heading.lead}</p>}
        {report.cards.length > 0 && (
          <ol className={styles.cards}>
            {report.cards.map((card, index) => (
              <WorklistCard
                key={`${card.kind}-${card.line}-${index}`}
                card={card}
                index={index}
                cards={report.cards}
                resumeText={resumeText}
                isSample={isSample}
                initial={storedLineAnswers?.[String(index)]}
                onPersist={persist}
                onStateChange={onStateChange}
              />
            ))}
          </ol>
        )}
        {work.length > 0 && <p className={styles.unlisted}>{UNLISTED_LINES_NOTE}</p>}
      </section>

      <ResearchReceipts />

      {(report.fit.note || report.fit.roles.length > 0) && (
        <section id="section-role" className={cn(shared.role, "scroll-mt-36")} aria-labelledby="role-title">
          <h2 id="role-title" className={shared.sectionTitle}>{fitHeading(report)}</h2>
          <div className={styles.fitGrid}>
            <div>
              {posting.summary && <p className={shared.bodyText}>{posting.summary}</p>}
              {report.fit.note && <p className={cn(shared.bodyText, posting.summary && "mt-3")}>{report.fit.note}</p>}
              {posting.missing.length > 0 && (
                <div className={styles.missing}>
                  <p className={shared.keepLabel}>{POSTING_MISSING_LABEL}</p>
                  <ul>{posting.missing.map((item) => <li key={item}>{item}</li>)}</ul>
                </div>
              )}
            </div>
            {report.fit.roles.length > 0 && (
              <div className={styles.fitList}>
                <p className={shared.keepLabel}>{posting.summary ? "The role, as the posting names it" : "Roles to consider"}</p>
                <ul>{report.fit.roles.slice(0, 4).map((role) => <li key={role}>{role}</li>)}</ul>
                {report.fit.level && <p className={shared.roleMeta}>How the page reads: {report.fit.level}</p>}
              </div>
            )}
          </div>
        </section>
      )}

      <details id="section-score" className={cn("ui-disclosure group scroll-mt-36", shared.disclosure)} data-testid="score-basis">
        <summary className={cn("focus-ring", shared.disclosureSummary)}>
          <span>What the rung and the number mean</span>
          <CaretDown className="size-4 shrink-0 text-brand transition-transform duration-fast ease-snap group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
        </summary>
        <div className={shared.disclosureBody}>
          <p>The rung is what a recruiter does with the page after one pass. The number says where in the rung it sits. It doesn&apos;t predict interviews or offers.</p>
          <p>{band.name}: {band.anchor}</p>
          {report.lifted_by_employer && <p>A recent employer whose hiring bar recruiters know on sight lifted this page one rung. The lines under that name still get their cards.</p>}
        </div>
      </details>

      <ReportEnding
        isSample={isSample}
        isSignedIn={isSignedIn}
        isExhausted={isExhausted}
        ready={ready}
        allAddressed={allAddressed}
        revisedCount={filled.length}
        onStartReport={onStartReport}
        onStartRevision={onStartRevision}
        onSaveReport={onSaveReport}
        isSavingReport={isSavingReport}
        onUpgrade={onUpgrade}
      />
    </div>
  );
}
