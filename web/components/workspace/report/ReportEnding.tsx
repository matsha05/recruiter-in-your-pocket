"use client";

import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { JOB_SEARCH_PASS_DECISION } from "@/lib/billing/pricing";
import { reportWording } from "@/lib/reports/worklist-presentation";
import { useSamplePerson } from "./SamplePerson";
import styles from "./markup/MarkedReport.module.css";

export interface ReportEndingProps {
  /** What the report is about. A profile is never "sent" and has no posting to be read against. */
  document?: "resume" | "linkedin";
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
export function ReportEnding({ document = "resume", isSample, isSignedIn, isExhausted, ready, clean = false, allAddressed, revisedCount, onStartReport, onStartRevision, onSaveReport, isSavingReport = false, onUpgrade }: ReportEndingProps) {
  // Matt, November 6, 2026: on a strong resume, say so and say the resume isn't the problem (copy system §3, pair 40).
  const wording = reportWording(document);
  const isProfile = document === "linkedin";
  const sample = useSamplePerson();
  const others = sample.samples.filter((other) => !other.current);
  const readyEnding = ready ? (clean ? wording.readyEnding : "Send it. Then read it against the posting you're going for.") : null;
  const readyNote = ready && clean ? wording.readyNote : null;
  const revisionLabel = isProfile ? "Check my updated profile" : ready ? "Read it against a posting" : "Compare my revision";
  const addressedHeading = wording.addressed(revisedCount);

  if (isSample) {
    if (!onStartReport) return null;
    return (
      <section className={styles.ending} aria-labelledby="report-next-step" data-testid="sample-terminal-cta">
        <h2 id="report-next-step" className={styles.sectionTitle}>That&rsquo;s {sample.person}&rsquo;s. Yours is next.</h2>
        <div><Button variant="primary" onClick={onStartReport}>Get your free report <ArrowRight className="size-4" weight="bold" /></Button></div>
        {/* The other samples, in the page's own text (the header's switcher is a menu): a reader who isn't Jordan
            can find the one closest to their situation, and each sample is cited from the others. */}
        {others.length > 0 && (
          <p className="text-small text-muted-foreground" data-testid="sample-others">
            Or read another sample:{" "}
            {others.map((other, index) => (
              <span key={other.href}>
                <Link href={other.href} className="riyp-link-quiet">{other.label.replace(/^A /u, "a ").replace(/^(Changing|Back|Customer)/u, (word) => word.toLowerCase())}</Link>
                {index < others.length - 2 ? ", " : index === others.length - 2 ? " or " : "."}
              </span>
            ))}
          </p>
        )}
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
            <Button variant="quiet" onClick={onStartRevision}>{isProfile ? "Check my updated profile" : "Compare my revision"} <ArrowRight className="size-4" weight="bold" /></Button>
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
        <p className={styles.endingNote} data-testid="report-kept">Kept in <Link href="/reports" className="riyp-link">My reports</Link>.</p>
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
