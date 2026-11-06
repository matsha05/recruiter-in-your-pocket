"use client";

import { ArrowRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { JOB_SEARCH_PASS_DECISION } from "@/lib/billing/pricing";
import styles from "./markup/MarkedReport.module.css";

export interface ReportEndingProps {
  isSample: boolean;
  isSignedIn: boolean;
  /** The free report is spent and there is no pass: the ending sells the pass, plainly. */
  isExhausted: boolean;
  /** The page is on the top rung with nothing to answer: the ending points at the posting. */
  ready: boolean;
  /** A worklist report with no line that needs work. Only then does the ending say the resume isn't the problem;
   * a v2 report can be "ready" with one question still open. */
  clean?: boolean;
  /** Every line the person could revise is revised. */
  allAddressed: boolean;
  /** How many lines the person revised, for the plural. */
  revisedCount: number;
  onStartReport?: () => void;
  onStartRevision?: () => void;
  onSaveReport?: () => void;
  isSavingReport?: boolean;
  onUpgrade?: () => void;
}

/**
 * How the report ends, the same for both shapes: the sample invites a report; a signed-in report leads with
 * saving this version (W3), the re-check second; an anonymous report points at the re-check, or at the pass
 * once the free report is spent. A clear page ends on sending it, then the posting (Matt, Nov 5, 2026).
 */
export function ReportEnding({ isSample, isSignedIn, isExhausted, ready, clean = false, allAddressed, revisedCount, onStartReport, onStartRevision, onSaveReport, isSavingReport = false, onUpgrade }: ReportEndingProps) {
  // Matt, November 6, 2026: on a strong resume, say so and say the resume isn't the problem (copy system §3, pair 40).
  const readyEnding = ready ? (clean ? "This is killer! Send it." : "Send it. Then read it against the posting you're going for.") : null;
  const readyNote = ready && clean ? "Your resume won't be the reason you don't get the call. Read it against the posting you're going for, and look at whether anyone can bring you in." : null;
  const revisionLabel = ready ? "Read it against a posting" : "Compare my revision";
  const addressedHeading = `${revisedCount > 1 ? "Your lines are ready. Drop them" : "Your line is ready. Drop it"} into your resume and see what changed.`;

  if (isSample) {
    if (!onStartReport) return null;
    return (
      <section className={styles.ending} aria-labelledby="report-next-step" data-testid="sample-terminal-cta">
        <h2 id="report-next-step" className={styles.sectionTitle}>That&rsquo;s Jordan&rsquo;s. Yours is next.</h2>
        <div><Button variant="primary" onClick={onStartReport}>Get your free report <ArrowRight className="size-4" weight="bold" /></Button></div>
      </section>
    );
  }

  if (isSignedIn && onSaveReport) {
    return (
      <section className={styles.ending} aria-labelledby="report-next-step" data-testid="report-save-version">
        <h2 id="report-next-step" className={styles.sectionTitle}>
          {allAddressed ? "Your line is ready. Save this version." : "Save this version."}
        </h2>
        <p className={styles.endingCopy}>Your answers and the revised line stay with it.</p>
        <div className={styles.endingActions}>
          <Button variant="primary" onClick={onSaveReport} disabled={isSavingReport} aria-busy={isSavingReport || undefined} data-testid="report-save-version-button">
            {isSavingReport ? "Saving…" : "Save this version"}
          </Button>
          {onStartRevision && (
            <Button variant="quiet" onClick={onStartRevision}>Compare my revision <ArrowRight className="size-4" weight="bold" /></Button>
          )}
        </div>
        {isExhausted && <p className={styles.endingNote}>{JOB_SEARCH_PASS_DECISION.whenToBuy}</p>}
      </section>
    );
  }

  if (isSignedIn && onStartRevision) {
    return (
      <section className={styles.ending} aria-labelledby="report-next-step" data-testid="report-next-step">
        <h2 id="report-next-step" className={styles.sectionTitle}>
          {allAddressed ? addressedHeading : readyEnding || "Made your edits? See what changed."}
        </h2>
        {!allAddressed && readyNote && <p className={styles.endingCopy}>{readyNote}</p>}
        {isExhausted && <p className={styles.endingCopy}>{JOB_SEARCH_PASS_DECISION.freeBoundary} {JOB_SEARCH_PASS_DECISION.whenToBuy}</p>}
        <div><Button variant="primary" onClick={onStartRevision}>{revisionLabel}<ArrowRight className="size-4" weight="bold" /></Button></div>
        {isExhausted && <p className={styles.endingNote}>{JOB_SEARCH_PASS_DECISION.terms}</p>}
      </section>
    );
  }

  if (!isSignedIn && onStartRevision) {
    return (
      <section className={styles.ending} aria-labelledby="report-next-step" data-testid={isExhausted ? "post-report-purchase-decision" : "report-next-step"}>
        <h2 id="report-next-step" className={styles.sectionTitle}>
          {allAddressed ? addressedHeading : readyEnding || (isExhausted ? "Revised it? See what changed." : "Made your edits? See what changed.")}
        </h2>
        {!allAddressed && readyNote && <p className={styles.endingCopy}>{readyNote}</p>}
        {isExhausted && <p className={styles.endingCopy}>{JOB_SEARCH_PASS_DECISION.freeBoundary} {JOB_SEARCH_PASS_DECISION.whenToBuy}</p>}
        <div>
          <Button variant="primary" onClick={isExhausted && onUpgrade ? onUpgrade : onStartRevision}>
            {isExhausted ? JOB_SEARCH_PASS_DECISION.cta : revisionLabel}<ArrowRight className="size-4" weight="bold" />
          </Button>
        </div>
        <p className={styles.endingNote}>{isExhausted ? JOB_SEARCH_PASS_DECISION.terms : "The comparison lasts for this visit. Save the report to keep it."}</p>
      </section>
    );
  }

  return null;
}
