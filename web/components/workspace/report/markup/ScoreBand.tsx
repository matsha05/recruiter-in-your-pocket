import { SCORE_BANDS, scoreBandIndex } from "@/lib/reports/score-band";
import styles from "./MarkedReport.module.css";

/**
 * The first read shows where the resume sits, in words. The number is kept for comparing revisions.
 * The anchor sentence waits for wider screens, except where the band is the screen's point.
 */
export function ScoreBand({ score, anchorOnPhones = false }: { score: number; anchorOnPhones?: boolean }) {
  const current = Math.max(0, scoreBandIndex(score));
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
