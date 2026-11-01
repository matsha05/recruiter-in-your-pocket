/**
 * Score bands for the first report (decision D5): the band and what it means,
 * not the number. The number appears only as a change between two reads.
 * Thresholds match `getScoreLabel`, which the validator writes into score_label.
 */

import { getScoreLabel } from "../score-utils";

export interface ScoreBand {
  name: string;
  /** What a resume in this band looks like to a reader. */
  anchor: string;
}

// Draft anchors (spec 71, pending Matt's copy approval).
export const SCORE_BANDS: readonly ScoreBand[] = [
  { name: "Needs more context", anchor: "The jobs are easy to follow. What you did in them mostly isn't." },
  { name: "Mostly clear", anchor: "Most lines show what you did. A few leave your part or the result unclear." },
  { name: "Clear and specific", anchor: "Lines say what you did and what changed because of it." },
];

export function scoreBandIndex(score: number) {
  return SCORE_BANDS.findIndex((band) => band.name === getScoreLabel(score));
}

export function scoreBandFor(score: number): ScoreBand {
  return SCORE_BANDS[Math.max(0, scoreBandIndex(score))];
}
