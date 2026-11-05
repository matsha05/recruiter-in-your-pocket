/**
 * Score bands for the first report (decision D5): the band and what it means,
 * not the number. The number appears only as a change between two reads.
 *
 * Four rungs since November 5, 2026 (Matt: "a fourth rung, Not ready yet"). The three
 * upper rungs match `getScoreLabel`, which the validator writes into score_label. The
 * bottom rung is the lowest part of the validator's lowest band, on the score alone
 * (Matt, Nov 5: "Band only"; the live run of November 5 put every weak page between 57
 * and 68, so the line sits inside that band, not under it). That rung is also the trigger
 * for the questions-first path (lib/reports/ask-first.ts).
 */

import { getScoreLabel } from "../score-utils";

export interface ScoreBand {
  name: string;
  /** What a resume in this band looks like to a reader. */
  anchor: string;
}

export interface BandMisses {
  /** How many Critical Misses the report names, 1 to 3. */
  count: number;
  /** The severity check marked them, so the count is a judgment, not a default. */
  counted: boolean;
}

/** Below this, the validator's lowest band reads as not ready. */
export const NOT_READY_SCORE = 60;

export const SCORE_BANDS: readonly ScoreBand[] = [
  { name: "Not ready yet", anchor: "The jobs are listed. A reader can't tell what you did in them or what you've done since." },
  { name: "Needs more context", anchor: "The jobs are easy to follow. What you did in them mostly isn't." },
  { name: "Mostly clear", anchor: "Most lines show what you did. A few leave your part or the result unclear." },
  { name: "Clear and specific", anchor: "Lines say what you did and what changed because of it." },
];

const NOT_READY = 0;
const NEEDS_CONTEXT = 1;
const CLEAR = SCORE_BANDS.length - 1;

/** Whether the validator's lowest band reads as not ready for this score. */
export function readsNotReady(score: number) {
  return getScoreLabel(score) === SCORE_BANDS[NEEDS_CONTEXT].name && score < NOT_READY_SCORE;
}

export function scoreBandIndex(score: number) {
  const index = SCORE_BANDS.findIndex((band) => band.name === getScoreLabel(score));
  if (index === NEEDS_CONTEXT && readsNotReady(score)) return NOT_READY;
  return index;
}

export function scoreBandFor(score: number): ScoreBand {
  return SCORE_BANDS[Math.max(0, scoreBandIndex(score))];
}

/**
 * How the report speaks to this page (Matt, Nov 5, 2026). `not_ready`: the bottom rung; the report
 * asks before it marks. `ready`: the top rung with a single Critical Miss, where the miss is the
 * question a recruiter would ask, not a reason to pass; the word "Critical Miss" never shows. With
 * two or more flagged misses on a clear page the severity check has earned the standard heading.
 */
export type ReportTone = "not_ready" | "standard" | "ready";

export function reportTone(score: number | undefined | null, misses?: BandMisses | null): ReportTone {
  if (typeof score !== "number" || !Number.isFinite(score)) return "standard";
  const index = scoreBandIndex(score);
  if (index === NOT_READY) return "not_ready";
  if (index === CLEAR && (misses?.count ?? 1) <= 1) return "ready";
  return "standard";
}
