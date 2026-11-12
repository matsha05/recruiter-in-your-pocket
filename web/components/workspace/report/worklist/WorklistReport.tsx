"use client";

import { splitVerdict } from "@/lib/reports/report-opening";
import { useCallback, useMemo, useState } from "react";
import { CaretDown } from "@phosphor-icons/react";
import type { WorklistReport as Report } from "@/lib/llm/worklist-schema";
import { isWorklistReport } from "@/lib/llm/worklist-schema";
import { sendLineAnswers, type LineAnswersPatch, type StoredLineAnswersByFix } from "@/lib/reports/line-answers";
import { buildPdfExportRequest } from "@/lib/reports/pdf-export";
import { worklistBandIndex, worklistBandsFor } from "@/lib/reports/score-band";
import { reportDocumentKind } from "@/lib/reports/report-document";
import { cardsHeading, fitHeading, hasRoleSection, PART_STATUS_LABEL, PARTS_LABEL, reportWording, UPGRADES_HEADING, upgradesLead, workCards } from "@/lib/reports/worklist-presentation";
import { cn } from "@/lib/utils";
import { ReportEnding } from "../ReportEnding";
import { ResearchReceipts } from "../ResearchReceipts";
import type { ReportData } from "../ReportTypes";
import { ScoreBand } from "../markup/ScoreBand";
import shared from "../markup/MarkedReport.module.css";
import { FinishedLines, type FinishedLine } from "./FinishedLines";
import { FirstPass } from "./FirstPass";
import { WorklistCard, type CardState } from "./WorklistCard";
import { WorklistComparison } from "./WorklistComparison";
import { AcrossShapesComparison } from "./AcrossShapesComparison";
import { isLinkedInReport } from "@/lib/reports/report-document";
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
  /** Keeps the resume and opens the posting field, for the first pass's "Read it against a posting". */
  onReadAgainstPosting?: () => void;
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
  onReadAgainstPosting,
  onUpgrade,
  resumeText,
  storedLineAnswers = null,
  isSignedIn = false,
  onSaveReport,
  isSavingReport = false,
}: WorklistReportProps) {
  // A LinkedIn profile review is this report with the profile's words and bands, and no posting or research strip.
  const document = reportDocumentKind(report);
  const isProfile = document === "linkedin";
  const wording = reportWording(document);
  const band = worklistBandsFor(document)[Math.max(0, worklistBandIndex(report.score))];
  const heading = cardsHeading(report);
  const work = workCards(report);
  // Upgrades are their own group after the list (Nov 7, 2026); each card keeps its place in report.cards for its answers.
  const indexed = report.cards.map((card, index) => ({ card, index }));
  const mainCards = indexed.filter(({ card }) => card.kind !== "upgrade");
  const upgrades = indexed.filter(({ card }) => card.kind === "upgrade");
  const ready = work.length === 0;
  const isExhausted = !isSample && freeUsesRemaining <= 0 && !hasPaidAccess;
  const reportId = buildPdfExportRequest(report)?.report_id;

  // One state per card, so the ending knows when every line with blanks is filled.
  const [states, setStates] = useState<Record<number, CardState>>({});
  const onStateChange = useCallback((index: number, state: CardState) => {
    setStates((current) => (current[index] === state ? current : { ...current, [index]: state }));
  }, []);
  // Each filled line with its answers, for the finished-lines sheet after the cards.
  const [finished, setFinished] = useState<Record<number, FinishedLine>>({});
  const onLineChange = useCallback((index: number, line: FinishedLine | null) => {
    setFinished((current) => {
      if (!line) {
        if (!(index in current)) return current;
        const next = { ...current };
        delete next[index];
        return next;
      }
      return current[index]?.line === line.line ? current : { ...current, [index]: line };
    });
  }, []);
  const fillable = report.cards.flatMap((card, index) => (card.kind !== "keep" && /\[[^\]]*\]/u.test(card.example) ? [index] : []));
  const filled = fillable.filter((index) => states[index] === "filled");
  const allAddressed = fillable.length > 0 && filled.length === fillable.length;

  // Answers are kept with the report when it has a row of its own, which only a signed-in report does (W3).
  const persist = useMemo(() => (reportId && !isSample ? (patch: LineAnswersPatch) => sendLineAnswers(reportId, patch) : undefined), [isSample, reportId]);
  // A re-check compares like with like: a profile with a profile, a resume with a resume.
  const previous = comparisonBaseline && isWorklistReport(comparisonBaseline) && reportDocumentKind(comparisonBaseline) === reportDocumentKind(report) ? comparisonBaseline : null;

  // A revision of a report saved before the worklist: the two aren't the same kind of report, and the comparison says so.
  const olderBaseline = comparisonBaseline && !isWorklistReport(comparisonBaseline) && reportDocumentKind(report) === "resume" && !isLinkedInReport(comparisonBaseline) ? comparisonBaseline : null;

  const verdict = splitVerdict(report.verdict);

  return (
    <div className={cn(styles.root, className)} data-testid="worklist-report">
      {previous && <WorklistComparison previous={previous} current={report} />}
      {olderBaseline && <AcrossShapesComparison previous={olderBaseline} current={report} />}

      <section id="section-first-impression" className={cn(styles.opening, "scroll-mt-36")} aria-labelledby="report-verdict">
        <div className={styles.top}>
          <p className={styles.score} aria-label={`Score ${report.score} out of 99`} data-testid="worklist-score">{report.score}</p>
          <ScoreBand score={report.score} bands={isProfile ? "profile" : "worklist"} />
        </div>
        {/* The verdict runs two or three sentences (Nov 12, 2026): the first is the heading, the rest reads on under it. */}
        <h1 id="report-verdict" className={styles.verdict}>{verdict.lead}</h1>
        {verdict.rest && <p className={styles.verdictRest} data-testid="worklist-verdict-rest">{verdict.rest}</p>}
        <FirstPass report={report} onReadAgainstPosting={isSample || isProfile ? undefined : onReadAgainstPosting} />
        <div className={styles.writeUp} data-testid="worklist-write-up">
          {report.write_up.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        </div>
      </section>

      <section id="section-fixes" className={cn(styles.page, "scroll-mt-36")} aria-labelledby="fixes-title" data-ready={ready || undefined}>
        {report.parts && report.parts.length > 0 && (
          <div className={styles.parts} data-testid="profile-parts">
            <p className={styles.partsLabel}>{PARTS_LABEL}</p>
            <ul>
              {report.parts.map((part) => (
                <li key={`${part.name}|${part.detail}`} data-status={part.status}>
                  <span className={styles.partName}>{part.name}{part.detail && <span className={styles.partDetail}>{part.detail}</span>}</span>
                  <span className={styles.partStatus}>{PART_STATUS_LABEL[part.status]}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <h2 id="fixes-title" className={styles.sectionTitle}>{heading.title}</h2>
        {heading.lead && <p className={styles.sectionLead}>{heading.lead}</p>}
        {mainCards.length > 0 && (
          <ol className={styles.cards}>
            {mainCards.map(({ card, index }) => (
              <WorklistCard
                key={`${card.kind}-${card.line}-${index}`}
                card={card}
                index={index}
                cards={report.cards}
                resumeText={resumeText}
                document={document}
                isSample={isSample}
                initial={storedLineAnswers?.[String(index)]}
                onPersist={persist}
                onStateChange={onStateChange}
                onLineChange={onLineChange}
              />
            ))}
          </ol>
        )}
        {work.length > 0 && <p className={styles.unlisted}>{wording.unlisted}</p>}
        {wording.sourceLimits && <p className={styles.unlisted} data-testid="report-source-limits">{wording.sourceLimits}</p>}
        {wording.sourceAdvice && <p className={styles.unlisted} data-testid="report-source-advice">{wording.sourceAdvice}</p>}
      </section>

      {upgrades.length > 0 && (
        <section id="section-upgrades" className={cn(styles.page, styles.upgrades, "scroll-mt-36")} aria-labelledby="upgrades-title" data-testid="worklist-upgrades">
          <h2 id="upgrades-title" className={styles.sectionTitle}>{UPGRADES_HEADING}</h2>
          <p className={styles.sectionLead}>{upgradesLead(report)}</p>
          <ol className={styles.cards}>
            {upgrades.map(({ card, index }) => (
              <WorklistCard
                key={`${card.kind}-${card.line}-${index}`}
                card={card}
                index={index}
                cards={report.cards}
                resumeText={resumeText}
                document={document}
                isSample={isSample}
                initial={storedLineAnswers?.[String(index)]}
                onPersist={persist}
                onStateChange={onStateChange}
                onLineChange={onLineChange}
              />
            ))}
          </ol>
        </section>
      )}

      {/* With a posting, its fit is in the first pass. Without one, where else the experience points, after the cards. */}
      {hasRoleSection(report) && (
        <section id="section-role" className={cn(shared.role, "scroll-mt-36")} aria-labelledby="role-title">
          <h2 id="role-title" className={shared.sectionTitle}>{fitHeading(report)}</h2>
          <div className={styles.fitGrid}>
            {report.fit.note && <p className={shared.bodyText}>{report.fit.note}</p>}
            {report.fit.roles.length > 0 && (
              <div className={styles.fitList}>
                <p className={shared.keepLabel}>{wording.fitListLabel}</p>
                <ul>{report.fit.roles.slice(0, 4).map((role) => <li key={role}>{role}</li>)}</ul>
              </div>
            )}
          </div>
        </section>
      )}

      {!isProfile && <ResearchReceipts />}

      <details id="section-score" className={cn("ui-disclosure group scroll-mt-36", shared.disclosure)} data-testid="score-basis">
        <summary className={cn("focus-ring", shared.disclosureSummary)}>
          <span>What the score means</span>
          <CaretDown className="size-4 shrink-0 text-brand transition-transform duration-fast ease-snap group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
        </summary>
        <div className={shared.disclosureBody}>
          <p>{wording.scoreNote}</p>
          <p>{band.name}: {band.anchor}</p>
          {report.lifted_by_employer && <p>{isProfile ? "A recent employer recruiters know on sight moved this profile up one band. The parts under that name still need the work." : "A recent employer recruiters know on sight moved this resume up one band. The lines under that name still need the work."}</p>}
        </div>
      </details>

      <FinishedLines cards={report.cards} finished={finished} document={document} />

      <ReportEnding
        document={document}
        isSample={isSample}
        isSignedIn={isSignedIn}
        isExhausted={isExhausted}
        ready={ready}
        clean={ready}
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
