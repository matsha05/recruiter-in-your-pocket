import type { SeverityCheckAnswer, SeverityCheckItem, SeverityKind } from "../llm/severity-check-model";
import { canonicalSourceIdentity } from "../llm/source-fidelity";
import type { WorklistCard, WorklistReport } from "../llm/worklist-schema";

/**
 * The severity check on a worklist report (measured both ways, brief PR B item 3). The second call reads the
 * resume and the cards and names the structural problems it still finds: time nobody accounts for, a title
 * above the work, no job named, missing or conflicting dates, a latest role with nothing to hold. The worklist
 * prompt asks for these as cards itself, so the merge here only adds what the model's own cards left out.
 * The measurement that decides whether the call stays is how often it adds anything on the live set.
 */

/** The cards shown to the severity check in the shape its prompt knows: Fix 1 and the rest. */
export function worklistAsSeverityReport(report: WorklistReport) {
  return {
    first_impression: report.verdict,
    top_fixes: report.cards.filter((card) => card.kind !== "keep" && card.kind !== "upgrade").map((card) => ({
      fix: card.question || card.cannot_tell,
      why: card.cannot_tell,
      evidence: { excerpt: card.line, section: card.where },
    })),
  };
}

const KIND_TO_CARD: Record<SeverityKind, { kind: WorklistCard["kind"]; where: string }> = {
  no_recent_work: { kind: "dates", where: "Dates" },
  missing_dates: { kind: "dates", where: "Dates" },
  date_conflict: { kind: "dates", where: "Dates" },
  title_level_mismatch: { kind: "line", where: "Headline" },
  no_target_role: { kind: "structure", where: "Structure" },
  no_evidence_latest_role: { kind: "line", where: "Latest role" },
};

/** The item's fix sentence as the question a person can answer; the check writes them as instructions. */
function questionFrom(item: SeverityCheckItem) {
  const fix = item.fix.trim().replace(/\.$/u, "");
  return fix.endsWith("?") ? fix : `${fix}, if true?`.replace(/^(Add|Name|Say|Give|Put|State|Replace|Correct)\b/u, (verb) => `Can you ${verb.toLowerCase()}`);
}

function cardFrom(item: SeverityCheckItem): WorklistCard | null {
  const shape = KIND_TO_CARD[item.kind];
  if (!shape || !item.excerpt.trim() || !item.why.trim()) return null;
  const isAbsence = /^No (?:summary|skills|education) section present$/iu.test(item.excerpt.trim());
  const line = isAbsence
    ? item.kind === "no_target_role" ? "The page never names the job it's for." : item.excerpt.trim()
    : item.excerpt.trim();
  const kind: WorklistCard["kind"] = isAbsence ? "structure" : shape.kind;
  return {
    kind,
    where: item.section.trim() && kind === "line" ? item.section.trim() : shape.where,
    line,
    cannot_tell: item.why.trim(),
    // A gap gets the dated-line shape; the person fills every bracket.
    example: item.kind === "no_recent_work" ? "[Month Year] - Present  [Career break, caregiving, study, a job search, or freelance work, whichever is true]" : "",
    question: questionFrom(item),
  };
}

export interface WorklistSeverityMerge {
  report: WorklistReport;
  added: SeverityKind[];
  skipped: Array<{ kind: SeverityKind; reason: "already_carded" | "empty" | "promotion" }>;
}

/**
 * Adds the check's new items as cards, each placed where a recruiter hits it: a headline or target-role
 * card first, a dates card after any headline or structure card at the top, a latest-role card after those.
 * An item on a line already carded, or a promotion of an existing card, changes nothing: the worklist has
 * no Critical Miss flag to promote into.
 */
export function mergeSeverityIntoWorklist(report: WorklistReport, answer: SeverityCheckAnswer, limitNew = 2): WorklistSeverityMerge {
  const cards = [...report.cards];
  const added: SeverityKind[] = [];
  const skipped: WorklistSeverityMerge["skipped"] = [];
  const carded = new Set(cards.map((card) => canonicalSourceIdentity(card.line)));
  const hasDatesCard = cards.some((card) => card.kind === "dates");
  for (const item of answer.critical_misses.slice(0, 2)) {
    if (item.source !== "new") {
      skipped.push({ kind: item.kind, reason: "promotion" });
      continue;
    }
    const card = cardFrom(item);
    if (!card) {
      skipped.push({ kind: item.kind, reason: "empty" });
      continue;
    }
    const sameLine = carded.has(canonicalSourceIdentity(card.line));
    const sameKind = card.kind === "dates" && hasDatesCard && item.kind === "no_recent_work";
    if (sameLine || sameKind) {
      skipped.push({ kind: item.kind, reason: "already_carded" });
      continue;
    }
    if (added.length >= limitNew) continue;
    const topStructural = cards.findIndex((existing) => !(existing.kind === "structure" || existing.where.toLowerCase() === "headline"));
    const insertAt = card.kind === "line" && item.kind === "title_level_mismatch" || item.kind === "no_target_role"
      ? 0
      : Math.max(0, topStructural === -1 ? cards.length : topStructural);
    cards.splice(insertAt, 0, card);
    carded.add(canonicalSourceIdentity(card.line));
    added.push(item.kind);
  }
  return { report: { ...report, cards }, added, skipped };
}
