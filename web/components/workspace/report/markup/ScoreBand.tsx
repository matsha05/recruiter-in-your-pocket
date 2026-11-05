import { SCORE_BANDS, scoreBandIndex, type BandMisses } from "@/lib/reports/score-band";
import styles from "./MarkedReport.module.css";

/**
 * The first read shows where the resume sits, in words. The number is kept for comparing revisions.
 * The bottom rung reads the Critical Miss count too (score-band.ts), so the report passes it in.
 */
export function ScoreBand({ score, misses, anchorOnPhones = false }: { score: number; misses?: BandMisses | null; anchorOnPhones?: boolean }) {
  const current = Math.max(0, scoreBandIndex(score, misses));
  const band = SCORE_BANDS[current];

  return (
    <div className={styles.band} data-testid="score-band" data-band={current} data-anchor={anchorOnPhones || undefined}>
      <p className={styles.bandName}>{band.name}</p>
      <ol className={styles.bandScale} aria-label={`${band.name}, band ${current + 1} of ${SCORE_BANDS.length}`}>
        {SCORE_BANDS.map((item, index) => (
          <li key={item.name} className={styles.bandStep} data-current={index === current || undefined} aria-current={index === current || undefined}>
            <span className={styles.bandBar} aria-hidden="true" />
            <span className={styles.bandLabel}>{item.name}</span>
          </li>
        ))}
      </ol>
      <p className={styles.bandAnchor}>{band.anchor}</p>
    </div>
  );
}
