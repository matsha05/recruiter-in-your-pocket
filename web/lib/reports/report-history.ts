// What a row on My reports can say about a saved report beyond its verdict (Nov 11, 2026): how many of its
// lines the person has answered, and how its score moved against their previous report for the same role.
// Pure, so the page computes it on the server and the rows only render it.

export type LineProgress = {
  /** Lines the report asked a question about. */
  total: number;
  /** Of those, the ones with a revised line kept. */
  answered: number;
};

export type ScoreChange = {
  /** This report's score minus the earlier one's. */
  delta: number;
  /** When the earlier report was made (ISO). */
  since: string;
};

type CardLike = { kind?: unknown; example?: unknown };

const HAS_BLANK = /\[[^\]]*\]/u;

/**
 * A worklist report asks a question on every card whose example has a blank to fill, except the one it says to
 * keep (the same rule the report uses for its own "all addressed" state). An answer counts once the person has a
 * revised line for that card. Earlier-format reports don't store their cards this way, so they return null and
 * the row says nothing rather than guessing.
 */
export function lineProgress(cards: unknown, lineAnswers: unknown): LineProgress | null {
  if (!Array.isArray(cards)) return null;
  const fillable = cards.flatMap((card: CardLike, index) =>
    card && typeof card === "object" && card.kind !== "keep" && typeof card.example === "string" && HAS_BLANK.test(card.example) ? [index] : [],
  );
  if (fillable.length === 0) return null;
  const stored = lineAnswers && typeof lineAnswers === "object" && !Array.isArray(lineAnswers) ? (lineAnswers as Record<string, unknown>) : {};
  const answered = fillable.filter((index) => {
    const entry = stored[String(index)];
    return Boolean(entry && typeof entry === "object" && typeof (entry as { line?: unknown }).line === "string" && (entry as { line: string }).line.trim());
  }).length;
  return { total: fillable.length, answered };
}

/** "3 of 6 lines answered", in the words the row shows. */
export function lineProgressLabel(progress: LineProgress): string {
  const { total, answered } = progress;
  const lines = total === 1 ? "line" : "lines";
  if (answered === 0) return `${total} ${lines} to answer`;
  if (answered >= total) return total === 1 ? "The one line is answered" : `All ${total} lines answered`;
  return `${answered} of ${total} ${lines} answered`;
}

export type ScoredReport = {
  id: string;
  score: number | null;
  targetRole: string | null;
  createdAt: string;
  /** A LinkedIn profile review is never compared with a resume report. */
  isProfile: boolean;
};

const roleKey = (role: string | null) => (role ?? "").trim().toLowerCase().replace(/\s+/g, " ");

/**
 * For each report, the change from the person's previous report of the same kind for the same role. The role is
 * the report's own read of the target job, so two reports that share it were judged against the same thing; a
 * report with no role, or no earlier match, has no change to show. This compares two real scores and says which
 * report it is measured against. It does not claim the two are versions of one resume, because a saved report
 * doesn't record which report it revises.
 */
export function scoreChanges(reports: readonly ScoredReport[]): Map<string, ScoreChange> {
  const changes = new Map<string, ScoreChange>();
  const oldestFirst = [...reports]
    .filter((report) => typeof report.score === "number" && Number.isFinite(report.score) && !Number.isNaN(Date.parse(report.createdAt)))
    .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
  const lastByKey = new Map<string, ScoredReport>();
  for (const report of oldestFirst) {
    const role = roleKey(report.targetRole);
    if (!role) continue;
    const key = `${report.isProfile ? "profile" : "resume"}:${role}`;
    const previous = lastByKey.get(key);
    if (previous) changes.set(report.id, { delta: (report.score as number) - (previous.score as number), since: previous.createdAt });
    lastByKey.set(key, report);
  }
  return changes;
}

/**
 * "Up 6 since Nov 1, 2026", with both dates already formatted the way the page formats dates. When the earlier
 * report was made the same day, "since" that date reads as if nothing came before it, so the row says which
 * report instead: "Down 2 from your earlier report that day".
 */
export function scoreChangeLabel(change: ScoreChange, sinceLabel: string, ownLabel?: string): string {
  const sameDay = ownLabel !== undefined && ownLabel === sinceLabel;
  if (change.delta > 0) return sameDay ? `Up ${change.delta} from your earlier report that day` : `Up ${change.delta} since ${sinceLabel}`;
  if (change.delta < 0) return sameDay ? `Down ${Math.abs(change.delta)} from your earlier report that day` : `Down ${Math.abs(change.delta)} since ${sinceLabel}`;
  return sameDay ? "Same score as your earlier report that day" : `Same score as ${sinceLabel}`;
}
