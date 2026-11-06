"use client";

import { Clipping } from "@/components/materials/Clipping";
import type { WorklistReport } from "@/lib/llm/worklist-schema";
import { compareWorklists } from "@/lib/reports/worklist-presentation";
import { cn } from "@/lib/utils";
import styles from "../ReadComparison.module.css";

/**
 * The re-check for two worklist reports on one resume: which of the lines the person worked on are off the
 * list, which are still there, and how far the score moved. Last time's lines are dimmed clippings, as the
 * homepage shows a re-check. A line off the list is no longer a card; the copy never says it was fixed.
 */
export function WorklistComparison({ previous, current }: { previous: WorklistReport; current: WorklistReport }) {
  const comparison = compareWorklists(previous, current);
  const lineOf = (card: WorklistReport["cards"][number]) => card.line;
  return (
    <section aria-labelledby="read-comparison-title" className={styles.root} data-testid="read-comparison">
      <div className={styles.header}>
        <h2 id="read-comparison-title" className={styles.title}>{comparison.title}</h2>
        <p className={styles.intro}>{comparison.intro}</p>
      </div>
      <div className={styles.reads}>
        <article className={styles.read} aria-label="Last time">
          {comparison.gone.slice(0, 3).map((card) => <Clipping key={`gone-${card.line}`} caption="Last time" line={lineOf(card)} note={card.cannot_tell} dim />)}
          {comparison.still.slice(0, 3).map((card) => <Clipping key={`still-${card.line}`} caption="Last time" line={lineOf(card)} note={card.cannot_tell} dim />)}
          <p className={styles.verdict}>{previous.verdict}</p>
        </article>
        <article className={cn(styles.read, styles.current)} aria-label="Now">
          {comparison.still.slice(0, 3).map((card) => <Clipping key={`now-still-${card.line}`} caption="Now" line={lineOf(card)} note={card.cannot_tell} dim />)}
          {comparison.added.slice(0, 3).map((card) => <Clipping key={`now-added-${card.line}`} caption="Now" line={lineOf(card)} note={card.cannot_tell} />)}
          <p className={styles.verdict}>{current.verdict}</p>
        </article>
      </div>
      <p className={styles.sum}>
        {comparison.sum && <span className={styles.delta}>{comparison.sum}</span>}
        <span className={styles.sumQuiet}>{previous.verdict.trim() === current.verdict.trim() ? "The verdict reads the same." : "The verdict changed too."}</span>
      </p>
    </section>
  );
}
