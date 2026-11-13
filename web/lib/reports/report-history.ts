// What a row on My reports can say about a saved report beyond its verdict (Nov 11, 2026): how many of its
// lines the person has answered, and how its score moved against their previous report for the same role.
// Pure, so the page computes it on the server and the rows only render it.

import { compareWorklists } from "./worklist-presentation";
import { scoreMoved } from "../score-utils";
import type { WorklistReport } from "../llm/worklist-schema";

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
  /**
   * The report read a resume the person already had a report on against a posting. The resume is the same one, so
   * a point or two between two such reads is the model, not the person's work, and the row says nothing of it.
   */
  hasPosting?: boolean;
};

/**
 * The title of the posting a saved report was read against, from the stored report: `fit.posting.summary` is
 * filled only with a posting, and the posting's title is the second role (lib/reports/worklist-presentation.ts).
 */
export function savedPostingRole(postingSummary: unknown, roles: unknown): { hasPosting: boolean; postingRole: string | null } {
  const hasPosting = typeof postingSummary === "string" && postingSummary.trim().length > 0;
  const second = Array.isArray(roles) && typeof roles[1] === "string" ? roles[1].trim() : "";
  return { hasPosting, postingRole: hasPosting && second ? second : null };
}

const roleKey = (role: string | null) => (role ?? "").trim().toLowerCase().replace(/\s+/g, " ");

/**
 * For each report, the change from the person's previous report of the same kind for the same role. The role is
 * the report's own read of the target job, so two reports that share it were judged against the same thing; a
 * report with no role, or no earlier match, has no change to show. A read against a posting is left out on both
 * sides: it is the same resume read again. This compares two real scores and says which
 * report it is measured against. It does not claim the two are versions of one resume: reports that record the
 * report they revise are measured through that link instead (reportVersions, below).
 */
export function scoreChanges(reports: readonly ScoredReport[]): Map<string, ScoreChange> {
  const changes = new Map<string, ScoreChange>();
  const oldestFirst = [...reports]
    .filter((report) => typeof report.score === "number" && Number.isFinite(report.score) && !Number.isNaN(Date.parse(report.createdAt)))
    .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
  const lastByKey = new Map<string, ScoredReport>();
  for (const report of oldestFirst) {
    const role = roleKey(report.targetRole);
    if (!role || report.hasPosting) continue;
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
 * report instead: "Down 8 from your earlier report that day". A difference no bigger than two reads of one page
 * produce (scoreMoved) is not a change, and the row says so: "About the same score as Nov 1, 2026".
 */
export function scoreChangeLabel(change: ScoreChange, sinceLabel: string, ownLabel?: string): string {
  const sameDay = ownLabel !== undefined && ownLabel === sinceLabel;
  if (!scoreMoved(change.delta)) return `${aboutTheSame(change.delta)} as ${sameDay ? "your earlier report that day" : sinceLabel}`;
  if (change.delta > 0) return sameDay ? `Up ${change.delta} from your earlier report that day` : `Up ${change.delta} since ${sinceLabel}`;
  return sameDay ? `Down ${Math.abs(change.delta)} from your earlier report that day` : `Down ${Math.abs(change.delta)} since ${sinceLabel}`;
}

/** Two scores that aren't apart by more than a re-read: the same, or about the same. Never "up" or "down". */
const aboutTheSame = (delta: number) => (delta === 0 ? "Same score" : "About the same score");

// ---- Versions of one resume (Nov 11, 2026) ----
// A report run as a re-check of a saved report records which report it revises (migration 026). Reports joined
// by those links are versions of one resume: My reports shows the newest and keeps the earlier ones under it.

export type LinkedReport = {
  id: string;
  score: number | null;
  createdAt: string;
  /** The saved report this one revises, when it was run as a re-check of it. */
  revises?: string | null;
};

export type VersionChange = {
  /** This version's score minus the score of the version it revises. */
  delta: number;
  /** The number of the version it revises. */
  from: number;
};

export type ReportVersion = {
  /** 1 for the first report of the resume, counting up by date. */
  number: number;
  /** How many versions the resume has among these reports. */
  of: number;
  /** Against the version this one revises. Null for a first version, or when either has no score. */
  change: VersionChange | null;
};

const time = (report: LinkedReport) => {
  const parsed = Date.parse(report.createdAt);
  return Number.isNaN(parsed) ? 0 : parsed;
};

/**
 * Groups reports into resumes. Each group is newest first, and the groups are ordered by their newest report, so
 * the first report of the first group is the person's latest. A report whose link points at a report that isn't
 * here (deleted, or older than the page shows) simply starts its own group. Two re-checks of the same report are
 * both versions of that resume.
 */
export function groupReportVersions<T extends LinkedReport>(reports: readonly T[]): T[][] {
  const byId = new Map(reports.map((report) => [report.id, report] as const));
  const root = new Map<string, string>();
  const find = (id: string): string => {
    let current = id;
    const seen = new Set<string>();
    while (!seen.has(current)) {
      seen.add(current);
      const parent = byId.get(current)?.revises;
      if (!parent || parent === current || !byId.has(parent)) return current;
      current = parent;
    }
    // A loop can't be written by the app; if one ever exists, the oldest id in it stands as the root.
    return [...seen].sort()[0];
  };
  for (const report of reports) root.set(report.id, find(report.id));
  const groups = new Map<string, T[]>();
  for (const report of reports) {
    const key = root.get(report.id) as string;
    groups.set(key, [...(groups.get(key) ?? []), report]);
  }
  const newestFirst = (a: T, b: T) => time(b) - time(a);
  return [...groups.values()].map((group) => [...group].sort(newestFirst)).sort((a, b) => newestFirst(a[0], b[0]));
}

/** Each version's number within its resume, and its change against the version it revises. Keyed by report id. */
export function reportVersions<T extends LinkedReport>(groups: readonly (readonly T[])[]): Map<string, ReportVersion> {
  const versions = new Map<string, ReportVersion>();
  for (const group of groups) {
    if (group.length < 2) continue;
    const oldestFirst = [...group].reverse();
    const numbers = new Map(oldestFirst.map((report, index) => [report.id, index + 1] as const));
    const scores = new Map(group.map((report) => [report.id, report.score] as const));
    for (const report of group) {
      const revised = report.revises && numbers.has(report.revises) ? report.revises : null;
      const before = revised ? scores.get(revised) : null;
      const change = revised && typeof report.score === "number" && typeof before === "number"
        ? { delta: report.score - before, from: numbers.get(revised) as number }
        : null;
      versions.set(report.id, { number: numbers.get(report.id) as number, of: group.length, change });
    }
  }
  return versions;
}

/** "Up 6 from version 2", or "About the same score as version 2" when the difference is no more than a re-read's. */
export function versionChangeLabel(change: VersionChange): string {
  if (!scoreMoved(change.delta)) return `${aboutTheSame(change.delta)} as version ${change.from}`;
  if (change.delta > 0) return `Up ${change.delta} from version ${change.from}`;
  return `Down ${Math.abs(change.delta)} from version ${change.from}`;
}

/** "2 earlier versions". */
export function earlierVersionsLabel(count: number): string {
  return `${count} earlier ${count === 1 ? "version" : "versions"}`;
}

// ---- What a resume's revisions did (Nov 11, 2026) ----
// The question a person comes back with is whether the rewrite worked. For two versions of one resume this says
// which of the first version's lines are off the list now, which are still there, and what came up new: the same
// comparison the report shows on a re-check (compareWorklists), in the same words. A line off the list is no
// longer a card. That doesn't prove it's fixed, so nothing here says so.

export type RevisionProgress = {
  /** Lines the earlier version was asked about that this one isn't. */
  gone: number;
  /** Lines both were asked about. */
  still: number;
  /** Lines this version is asked about that the earlier one wasn't. */
  added: number;
};

const isCards = (cards: unknown): cards is WorklistReport["cards"] =>
  Array.isArray(cards) && cards.every((card) => card && typeof card === "object" && typeof (card as { kind?: unknown }).kind === "string" && typeof (card as { line?: unknown }).line === "string");

/** Null when either report isn't a worklist report: an earlier-format report has no list to compare. */
export function revisionProgress(earlierCards: unknown, currentCards: unknown): RevisionProgress | null {
  if (!isCards(earlierCards) || !isCards(currentCards)) return null;
  const { gone, still, added } = compareWorklists({ cards: earlierCards, score: 0 }, { cards: currentCards, score: 0 });
  return { gone: gone.length, still: still.length, added: added.length };
}

/** "4 lines are off the list. 2 are still there, and 1 new one came up." */
export function revisionProgressLabel(progress: RevisionProgress): string {
  const { gone, still, added } = progress;
  const lines = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
  const fresh = added > 0 ? lines(added, "new one came up", "new ones came up") : null;
  if (gone === 0 && still === 0) return fresh ? `Nothing was on the list before. ${fresh[0].toUpperCase()}${fresh.slice(1)}.` : "Nothing on the list, then or now.";
  if (gone === 0) return fresh ? `The same ${still === 1 ? "line is" : "lines are"} on the list, and ${fresh}.` : `The same ${still === 1 ? "line is" : "lines are"} on the list.`;
  const off = `${lines(gone, "line is", "lines are")} off the list.`;
  if (still === 0) return fresh ? `${off} ${fresh[0].toUpperCase()}${fresh.slice(1)}.` : gone === 1 ? "The one line is off the list. Nothing is on it now." : `All ${gone} lines are off the list. Nothing is on it now.`;
  return fresh ? `${off} ${lines(still, "is", "are")} still there, and ${fresh}.` : `${off} ${lines(still, "is", "are")} still there.`;
}

/**
 * How the score moved across the resume's versions, with the bands when the band changed:
 * "Up 17, from Not ready yet to Mostly clear." The number itself never appears, only the change. A difference
 * no bigger than a re-read's is "About the same score.", with no band named: a score that sits near a band's edge
 * can land on either side of it on two reads of one page.
 */
export function revisionScoreLabel(delta: number, bandBefore: string, bandNow: string): string {
  if (!scoreMoved(delta)) return `${aboutTheSame(delta)}.`;
  const moved = delta > 0 ? `Up ${delta}` : `Down ${Math.abs(delta)}`;
  return bandBefore === bandNow ? `${moved}.` : `${moved}, from ${bandBefore} to ${bandNow}.`;
}
