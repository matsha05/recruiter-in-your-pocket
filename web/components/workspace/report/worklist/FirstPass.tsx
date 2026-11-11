"use client";

import { useState } from "react";
import { Paper } from "@/components/materials/Paper";
import type { WorklistReport } from "@/lib/llm/worklist-schema";
import { POSTING_LEAD_HOW, POSTING_LEAD_LABEL, POSTING_MISSING_HOW, POSTING_TRIM_HOW, POSTING_TRIM_LABEL, POSTING_MISSING_LABEL, postingMissingShown, screenerNote, screenerTitle, worklistLevelParts, worklistReadFor, wordingFor } from "@/lib/reports/worklist-presentation";
import { cn } from "@/lib/utils";
import styles from "./Worklist.module.css";

/**
 * The first pass (Matt chose direction B on November 7, 2026; docs/design/2026-11-first-read.md). Recruiters
 * describe the first seconds as a sort: which job is this for, what level, and does it fit the posting. The
 * report's score rests on those answers, so they sit under the verdict with their reasons instead of under the
 * cards. The questions label themselves: no "first pass" label, since "pass" already means the Job Search Pass
 * and a recruiter passing on you (three reviewers, Nov 7). A line written to screening software comes first.
 */
export function FirstPass({ report, onReadAgainstPosting }: { report: WorklistReport; onReadAgainstPosting?: () => void }) {
  const read = worklistReadFor(report);
  const level = worklistLevelParts(read.level, read.role);
  const screener = report.screener_text ?? [];
  const posting = report.fit.posting;
  const lead = posting.lead ?? [];
  const trim = posting.trim ?? [];
  const [showAll, setShowAll] = useState(false);
  if (!read.role && !level && screener.length === 0) return null;
  const shownMissing = showAll ? posting.missing : postingMissingShown(posting.missing);
  const hiddenMissing = posting.missing.length - shownMissing.length;

  return (
    <section className={styles.firstPass} aria-label={wordingFor(report).firstPassLabel} data-testid="first-pass">
      {screener.length > 0 && (
        <div className={styles.stop} data-testid="screener-text">
          <p className={styles.stopTitle}>{screenerTitle(screener.length > 1)}</p>
          {screener.map((finding) => (
            <Paper key={finding.excerpt} kind="strip" className={styles.strip}>
              <p className={cn(styles.quote, styles.struck)}>{finding.excerpt}</p>
            </Paper>
          ))}
          <p className={styles.stopNote}>{screenerNote(screener)}</p>
        </div>
      )}

      {(read.role || level) && (
        <dl className={styles.sort} data-columns={(read.role ? 1 : 0) + (level ? 1 : 0) + (read.hasPosting ? 1 : 0)}>
          {read.role && (
            <div>
              <dt>Which job is this for?</dt>
              <dd className={styles.sortAnswer} data-testid="first-pass-role">{read.role}</dd>
              {report.fit.why && <dd className={styles.sortWhy}>{report.fit.why}</dd>}
            </div>
          )}
          {level && (
            <div>
              <dt>What level?</dt>
              <dd className={styles.sortAnswer} data-testid="first-pass-level">{level.level}</dd>
              {level.because && <dd className={styles.sortWhy}>{level.because}</dd>}
            </div>
          )}
          {read.hasPosting && (
            <div>
              <dt>Your posting</dt>
              <dd className={styles.sortAnswer} data-testid="first-pass-posting-role">{read.postingRole || "The job you added"}</dd>
            </div>
          )}
        </dl>
      )}

      {read.hasPosting ? (
        (report.fit.note || posting.missing.length > 0 || lead.length > 0 || trim.length > 0) && (
          <div className={styles.postingFit} data-testid="first-pass-posting">
            {report.fit.note && <p className={styles.postingNote}>{report.fit.note}</p>}
            {posting.missing.length > 0 && (
              <div className={styles.missing}>
                <p className={styles.missingLabel}>{POSTING_MISSING_LABEL}</p>
                <ul>{shownMissing.map((item) => <li key={item}>{item}</li>)}</ul>
                {hiddenMissing > 0 && (
                  <button type="button" className={cn("riyp-link focus-ring", styles.missingMore)} onClick={() => setShowAll(true)} data-testid="posting-missing-more">
                    Show {hiddenMissing} more
                  </button>
                )}
                <p className={styles.missingHow}>{POSTING_MISSING_HOW}</p>
              </div>
            )}
            {[{ id: "lead", label: POSTING_LEAD_LABEL, how: POSTING_LEAD_HOW, moves: lead }, { id: "trim", label: POSTING_TRIM_LABEL, how: POSTING_TRIM_HOW, moves: trim }].map((group) => group.moves.length > 0 && (
              <div key={group.id} className={styles.moves} data-testid={`posting-${group.id}`}>
                <p className={styles.missingLabel}>{group.label}</p>
                <p className={styles.missingHow}>{group.how}</p>
                <ul className={styles.moveList}>
                  {group.moves.map((move) => (
                    <li key={move.line}>
                      <Paper kind="strip" className={styles.strip}><p className={styles.quote}>{move.line}</p></Paper>
                      <p className={styles.postingNote}>{move.why}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )
      ) : onReadAgainstPosting ? (
        <p className={styles.passAside}>
          Going for something else?{" "}
          <button type="button" className="riyp-link focus-ring" onClick={onReadAgainstPosting} data-testid="read-against-posting">Read it against a posting</button>
        </p>
      ) : null}
    </section>
  );
}
