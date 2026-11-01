"use client";

import { useCallback, useMemo, useState } from "react";
import { ArrowRight, CaretDown, Check, WarningCircle } from "@phosphor-icons/react";
import { Mark, useSeen } from "@/components/research/figures/FigureKit";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { criticalMissReason, fixCardSlots, reconcileReport } from "@/lib/reports/report-integrity";
import { liftQuestions, marginNoteFromFix } from "@/lib/reports/revised-line";
import { FullRecruiterNotes } from "../FullRecruiterNotes";
import type { ReportData } from "../ReportTypes";
import { CriticalMissLift, type LiftChange } from "./CriticalMissLift";
import { MissFeedback, type MissFeedbackValue } from "./MissFeedback";
import { ScoreBand } from "./ScoreBand";
import styles from "./MarkedUpReport.module.css";

type Fix = NonNullable<ReportData["top_fixes"]>[number];

/** Where the report is shown. Every variant renders the same document. */
export type ReportVariant = "fresh" | "recovered" | "saved" | "sample";

function excerptOf(fix?: Fix) {
  if (!fix?.evidence) return "";
  return typeof fix.evidence === "string" ? fix.evidence : fix.evidence.excerpt || "";
}

function sectionOf(fix?: Fix) {
  if (!fix?.evidence || typeof fix.evidence === "string") return fix?.section_ref;
  return fix.evidence.section || fix.section_ref;
}

function quoted(line: string) {
  return line.trim().replace(/^[-•*]\s+/u, "");
}

export function MarkedUpReport({
  report,
  resumeText,
  variant = "fresh",
  hasJobDescription = false,
  onRecheck,
  onStartReport,
  onFeedback,
}: {
  report: ReportData;
  /** The resume, while this visit has it. Saved reports don't keep it. */
  resumeText?: string;
  variant?: ReportVariant;
  hasJobDescription?: boolean;
  onRecheck?: () => void;
  onStartReport?: () => void;
  onFeedback?: (value: MissFeedbackValue) => void;
}) {
  const integrity = useMemo(() => reconcileReport(report), [report]);
  const reconciled = integrity.report;
  const fixes = (reconciled.top_fixes || []).slice(0, 3);
  const miss = fixes[0];
  const missExcerpt = excerptOf(miss);
  const missQuestions = useMemo(() => liftQuestions(integrity.fixQuestions[0] || []), [integrity]);
  const missWhy = criticalMissReason(integrity);
  const strengths = (reconciled.strengths || []).slice(0, 3);
  const verdict = report.first_impression || report.first_impression_takeaway || report.summary || "Here's where to start.";
  const [lift, setLift] = useState<LiftChange>({ state: "open" });
  const onLiftChange = useCallback((change: LiftChange) => setLift(change), []);
  const { ref: missRef, seen } = useSeen<HTMLQuoteElement>(0.6);
  const isSample = variant === "sample";
  const missHead = (
    <>
      <p className={styles.missLabel}>
        <span className="riyp-verdict-label">Critical Miss</span>
        {lift.state === "addressed" && <span className={styles.addressed}><Check className="size-3.5" weight="bold" aria-hidden="true" />Addressed</span>}
      </p>
      <p className={styles.missDefinition}>The one thing to fix first</p>
    </>
  );

  return (
    <div className={styles.root}>
      <section id="section-first-impression" className={styles.opening} aria-labelledby="report-verdict">
        <p className="riyp-verdict-label text-muted-foreground">Verdict</p>
        <h1 id="report-verdict" className={styles.verdict}>{verdict}</h1>
        {typeof report.score === "number" && <ScoreBand score={report.score} />}
      </section>

      <section id="section-fixes" className={styles.page} aria-labelledby="marked-title">
        <h2 id="marked-title" className={styles.pageTitle}>Your resume, marked up</h2>
        <ol className={styles.lines}>
          {miss && (
            <li className={styles.row} data-kind="miss" data-state={lift.state} data-testid="critical-miss">
              {/* Phones name the Critical Miss above its line; wider screens write it in the margin. Only one is displayed. */}
              <div className={cn(styles.missHead, styles.phoneOnly)}>{missHead}</div>
              <div className={styles.lineCell}>
                {sectionOf(miss) && <p className={styles.lineSection}>{sectionOf(miss)}</p>}
                <blockquote ref={missRef} className={styles.missLine}>
                  <Mark seen={seen}>{quoted(missExcerpt)}</Mark>
                </blockquote>
              </div>
              <aside className={styles.noteCell} aria-label="Critical Miss">
                <div className={cn(styles.missHead, styles.marginOnly)}>{missHead}</div>
                <p className={cn(styles.penNote, seen && styles.penNoteIn)}>{marginNoteFromFix(miss.fix || miss.text || "")}</p>
                {missWhy && <p className={cn(styles.penWhy, styles.marginOnly)}>{missWhy}</p>}
              </aside>
              <div className={styles.liftCell}>
                <CriticalMissLift
                  excerpt={missExcerpt}
                  resumeText={resumeText}
                  questions={missQuestions}
                  onChange={onLiftChange}
                />
                {/* On a phone the reason follows the questions, so the first one stays on the first screen. */}
                {missWhy && <p className={cn(styles.penWhy, styles.phoneOnly)}>{missWhy}</p>}
              </div>
              {!isSample && (
                <div className={styles.feedbackCell}>
                  <MissFeedback onSubmit={onFeedback} suggestNo={lift.state === "not_mine"} />
                </div>
              )}
            </li>
          )}

          {integrity.structuralGaps.length > 0 && (
            <li className={styles.gapRow} data-testid="structural-gaps">
              <p className={styles.gapLabel}><WarningCircle className="size-4" weight="bold" aria-hidden="true" />Before the bullets</p>
              {integrity.structuralGaps.map((gap) => <p key={gap.text} className={styles.gapText}>{gap.text}</p>)}
            </li>
          )}

          {fixes.slice(1).map((fix, offset) => {
            const index = offset + 1;
            const slots = fixCardSlots(integrity, index);
            return (
              <li key={`${fix.fix}-${index}`} id={`section-fix-${index + 1}`} className={styles.row} data-kind="fix">
                <div className={styles.lineCell}>
                  {sectionOf(fix) && <p className={styles.lineSection}>{sectionOf(fix)}</p>}
                  <blockquote className={styles.inkLine}>{quoted(excerptOf(fix))}</blockquote>
                </div>
                <aside className={styles.noteCell} aria-label={`Fix ${index + 1}`}>
                  <p className={styles.fixLabel}>Fix {index + 1}</p>
                  <p className={styles.penNote}>{marginNoteFromFix(fix.fix || fix.text || "")}</p>
                  {slots.why && <p className={styles.penWhy}>{slots.why}</p>}
                  {slots.whatToAdd.length > 0 && (
                    <div className={styles.toAdd}>
                      <p className={styles.toAddLabel}>What to add</p>
                      <ul className={styles.toAddList}>
                        {slots.whatToAdd.map((question) => <li key={question}>{question}</li>)}
                      </ul>
                    </div>
                  )}
                </aside>
              </li>
            );
          })}
        </ol>
      </section>

      {strengths.length > 0 && (
        <section id="section-keep" className={styles.keep} aria-labelledby="keep-title">
          <h2 id="keep-title" className={styles.sectionTitle}>Leave these alone. They&apos;re working.</h2>
          <ul className={styles.keepList}>
            {strengths.map((strength, index) => (
              <li key={strength} className={styles.keepItem}>
                <Check className={styles.keepTick} weight="bold" aria-hidden="true" />
                <div>
                  {index === 0 && <p className={styles.keepLabel}>Don&apos;t touch this one</p>}
                  <p className={styles.keepText}>{strength}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {report.job_alignment && (report.job_alignment.positioning_suggestion || report.job_alignment.role_fit?.best_fit_roles?.length) ? (
        <section id="section-role" className={styles.role} aria-labelledby="role-title">
          <h2 id="role-title" className={styles.sectionTitle}>{hasJobDescription ? "How your experience fits this role." : "Roles your experience points toward."}</h2>
          <div className={styles.roleGrid}>
            <p className={styles.bodyText}>{report.job_alignment.positioning_suggestion || report.job_alignment.jd_match_summary}</p>
            {(report.job_alignment.role_fit?.best_fit_roles || []).length > 0 && (
              <div className={styles.roleList}>
                <p className={styles.toAddLabel}>Roles to consider</p>
                <ul>
                  {(report.job_alignment.role_fit?.best_fit_roles || []).slice(0, 3).map((role) => <li key={role}>{role}</li>)}
                </ul>
              </div>
            )}
          </div>
        </section>
      ) : null}

      <details id="section-score" className={cn("ui-disclosure group", styles.disclosure)} data-testid="score-basis">
        <summary className={styles.disclosureSummary}>
          <span>How the score works</span>
          <CaretDown className="size-4 shrink-0 text-brand transition-transform duration-fast ease-snap group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
        </summary>
        <div className={styles.disclosureBody}>
          <p>The band comes from a score that weighs four things a recruiter notices: the results you show, how clearly each line reads, how your experience fits together, and how easy the page is to scan. It is not a simple average, and it doesn&apos;t predict interviews or offers.</p>
          {report.score_comment_short && <p>{report.score_comment_short}</p>}
          {report.score_plain && <p>{report.score_plain}</p>}
          <p>When you re-check a revision, you&apos;ll see the score move.</p>
        </div>
      </details>

      <FullRecruiterNotes report={reconciled} hasJobDescription={hasJobDescription} />

      <section className={styles.ending} aria-labelledby="ending-title" data-testid="report-ending">
        {isSample ? (
          <>
            <h2 id="ending-title" className={styles.sectionTitle}>Now let&apos;s look at yours.</h2>
            <p className={styles.endingCopy}>Upload or paste it to see what comes through clearly, where it leaves questions, and what to change first.</p>
            <Button variant="brand" size="lg" className="justify-self-start" onClick={onStartReport}>
              Get your free report <ArrowRight className="ml-2 size-4" weight="bold" />
            </Button>
          </>
        ) : (
          <>
            <h2 id="ending-title" className={styles.sectionTitle}>
              {lift.state === "addressed" ? "Line fixed. See how the whole page reads now." : "Made your edits? See what changed."}
            </h2>
            <p className={styles.endingCopy}>Re-check the revised resume and we&apos;ll compare the two reads: whether the Critical Miss is fixed, what moved, and what to do next.</p>
            <Button variant="brand" size="lg" className="justify-self-start" onClick={onRecheck}>
              Re-check my resume <ArrowRight className="ml-2 size-4" weight="bold" />
            </Button>
          </>
        )}
      </section>
    </div>
  );
}
