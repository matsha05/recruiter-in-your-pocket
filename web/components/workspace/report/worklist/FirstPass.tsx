import { Paper } from "@/components/materials/Paper";
import type { WorklistReport } from "@/lib/llm/worklist-schema";
import { POSTING_MISSING_HOW, POSTING_MISSING_LABEL, screenerNote, screenerTitle, worklistLevelParts, worklistReadFor } from "@/lib/reports/worklist-presentation";
import { cn } from "@/lib/utils";
import styles from "./Worklist.module.css";

/**
 * The first pass (Matt chose direction B on November 7, 2026; docs/design/2026-11-first-read.md). Recruiters
 * describe the first seconds as a sort: which job is this for, what level, and does it fit the posting. The
 * report's score rests on those answers, so they sit under the verdict with their reasons instead of under the
 * cards. Most reports have no posting; then the row is the job and the level the resume was read for, and a way
 * to read it against a posting. A line written to screening software ends the first pass, so it comes first.
 */
export function FirstPass({ report, onReadAgainstPosting }: { report: WorklistReport; onReadAgainstPosting?: () => void }) {
  const read = worklistReadFor(report);
  const level = worklistLevelParts(read.level);
  const screener = report.screener_text ?? [];
  const posting = report.fit.posting;
  if (!read.role && !level && screener.length === 0) return null;

  return (
    <section className={styles.firstPass} aria-labelledby="first-pass-title" data-testid="first-pass">
      <h2 id="first-pass-title" className={styles.passTitle}>The first pass</h2>
      <p className={styles.passLead}>
        {read.hasPosting ? "Read against the posting you added." : "With no posting, a recruiter reads your resume for the job it points at."}
      </p>

      {screener.length > 0 && (
        <div className={styles.stop} data-testid="screener-text">
          <p className={styles.stopTitle}>{screener.length > 1 ? "These lines end the first pass." : "This line ends the first pass."}</p>
          {screener.map((finding) => (
            <Paper key={finding.excerpt} kind="strip" className={styles.strip}>
              <p className={cn(styles.quote, styles.struck)}>{finding.excerpt}</p>
            </Paper>
          ))}
          <p className={styles.stopNote}>
            {screenerNote(screener[0].kind, screener.length > 1)} <strong>{screenerTitle(screener.length > 1)}</strong>
          </p>
        </div>
      )}

      {(read.role || level) && (
        <dl className={styles.sort} data-columns={read.hasPosting ? 3 : 2}>
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
              <dd className={styles.sortAnswer}>{read.postingRole || "The job you added"}</dd>
              {posting.summary && <dd className={styles.sortWhy}>{posting.summary}</dd>}
            </div>
          )}
        </dl>
      )}

      {read.hasPosting ? (
        (report.fit.note || posting.missing.length > 0) && (
          <div className={styles.postingFit} data-testid="first-pass-posting">
            {report.fit.note && <p className={styles.postingNote}>{report.fit.note}</p>}
            {posting.missing.length > 0 && (
              <div className={styles.missing}>
                <p className={styles.missingLabel}>{POSTING_MISSING_LABEL}</p>
                <ul>{posting.missing.map((item) => <li key={item}>{item}</li>)}</ul>
                <p className={styles.missingHow}>{POSTING_MISSING_HOW}</p>
              </div>
            )}
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
