import { PROFILE_BANDS, SCORE_BANDS, WORKLIST_BANDS, scoreBandIndex, worklistBandIndex } from "@/lib/reports/score-band";
import styles from "./MarkedReport.module.css";

/**
 * The first read shows where the resume sits, in words. The number is kept for comparing revisions.
 * The anchor sentence waits for wider screens, except where the band is the screen's point.
 */
/** The worklist report has five bands (Nov 6, 2026); the v2 report keeps its four. */
export function ScoreBand({ score, anchorOnPhones = false, bands = "report" }: { score: number; anchorOnPhones?: boolean; bands?: "report" | "worklist" | "profile" }) {
  // A profile review has the worklist's five bands under its own names and anchors.
  const scale = bands === "profile" ? PROFILE_BANDS : bands === "worklist" ? WORKLIST_BANDS : SCORE_BANDS;
  const current = Math.max(0, bands === "report" ? scoreBandIndex(score) : worklistBandIndex(score));
  const band = scale[current];

  return (
    <div className={styles.band} data-testid="score-band" data-band={current} data-bands={scale.length} data-anchor={anchorOnPhones || undefined}>
      <p className={styles.bandName}>{band.name}</p>
      <ol className={styles.bandScale} style={{ gridTemplateColumns: `repeat(${scale.length}, minmax(0, 1fr))` }} aria-label={`${band.name}, band ${current + 1} of ${scale.length}`}>
        {scale.map((item, index) => (
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
