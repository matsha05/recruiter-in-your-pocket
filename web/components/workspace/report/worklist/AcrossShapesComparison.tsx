"use client";

import { Clipping } from "@/components/materials/Clipping";
import type { WorklistReport } from "@/lib/llm/worklist-schema";
import { readCriticalMisses, withCriticalFirst } from "@/lib/reports/report-presentation";
import { compareAcrossShapes, type EarlierProblem } from "@/lib/reports/worklist-presentation";
import { cn } from "@/lib/utils";
import type { ReportData } from "../ReportTypes";
import { marksLine, quotedLine } from "../markup/MarkedRows";
import styles from "../ReadComparison.module.css";

/** How many of this version's lines the comparison shows before it points at the report. */
const NOW_SHOWN = 3;

/** An older report's top problems that quote a line; one about something the resume lacks has no line to follow. */
export function earlierProblems(report: ReportData): EarlierProblem[] {
  const ordered = withCriticalFirst(report);
  const count = Math.max(1, readCriticalMisses(ordered).count);
  return (ordered.top_fixes || [])
    .slice(0, count)
    .filter((fix) => (fix?.fix || fix?.text) && marksLine(fix))
    .map((fix) => ({ line: quotedLine(fix), note: fix?.fix || fix?.text || "" }));
}

function earlierVerdict(report: ReportData) {
  return report.first_impression || report.first_impression_takeaway || report.summary || "";
}

/**
 * An older report beside a worklist report on the same resume. The older one named its top problems; this
 * one lists every line. What can honestly be compared is whether the lines the older report led with are
 * still on the list, so that is the heading. Both verdicts and this version's first lines are shown, and a
 * note says why the list is longer and why the scores aren't set against each other.
 */
export function AcrossShapesComparison({ previous, current, earlier }: { previous: ReportData; current: WorklistReport; earlier?: string }) {
  const comparison = compareAcrossShapes(earlierProblems(previous), current);
  const then = earlier ?? "Last time";
  const stillLines = new Set(comparison.still.map((problem) => problem.line));
  const shown = comparison.now.slice(0, NOW_SHOWN);
  const rest = comparison.now.length - shown.length;
  return (
    <section aria-labelledby="read-comparison-title" className={styles.root} data-testid="read-comparison">
      <div className={styles.header}>
        <h2 id="read-comparison-title" className={styles.title}>{comparison.title}</h2>
        {comparison.intro && <p className={styles.intro}>{comparison.intro}</p>}
      </div>
      <div className={styles.reads}>
        <article className={styles.read} aria-label={then}>
          {[...comparison.gone, ...comparison.still].map((problem) => (
            <Clipping key={`then-${problem.line}`} caption={stillLines.has(problem.line) ? `${then} · still on the list` : `${then} · off the list`} line={problem.line} note={problem.note} dim />
          ))}
          <p className={styles.verdict}>{earlierVerdict(previous)}</p>
        </article>
        <article className={cn(styles.read, styles.current)} aria-label="Now" data-testid="comparison-now">
          {shown.map((card) => <Clipping key={`now-${card.line}`} caption="Now" line={card.line} note={card.cannot_tell} />)}
          {rest > 0 && <p className={styles.more}>{rest === 1 ? "One more line is in the report." : `${rest} more lines are in the report.`}</p>}
          <p className={styles.verdict}>{current.verdict}</p>
        </article>
      </div>
      <p className={styles.sum}>
        <span className={styles.sumQuiet}>{comparison.note}</span>
      </p>
    </section>
  );
}
