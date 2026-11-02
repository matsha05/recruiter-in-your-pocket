import { canonicalSourceIdentity } from "../llm/source-fidelity";
import type { SeverityCheckAnswer, SeverityCheckItem, SeverityKind } from "../llm/severity-check-model";

/**
 * Merging the severity check into a finished report (Matt, wave 3: "i dont want to lie to people and say
 * they have one critical miss if there are more"). The first fix is the report's Critical Miss and never
 * changes. Each further Critical Miss either promotes Fix 2 or Fix 3, when it already names the problem,
 * or is added after the first fix. Critical Misses come first; the report keeps at most three fixes.
 */

type Fix = Record<string, any>;
type Report = { top_fixes?: Fix[]; more_critical?: boolean; [key: string]: unknown };

export type SeveritySkip = { kind: SeverityKind; reason: "no_such_fix" | "duplicates_first_fix" | "already_flagged" | "empty" };

export interface SeverityMerge {
  report: Report;
  added: SeverityKind[];
  promoted: number[];
  skipped: SeveritySkip[];
}

function excerptOf(fix: Fix | undefined) {
  const evidence = fix?.evidence;
  return canonicalSourceIdentity(typeof evidence === "string" ? evidence : String(evidence?.excerpt || ""));
}

function newFix(item: SeverityCheckItem): Fix {
  const section = item.section.trim() || "Experience";
  return {
    fix: item.fix.trim(),
    why: item.why.trim(),
    confidence: "high",
    evidence: { excerpt: item.excerpt.trim(), section },
    impact_level: "high",
    effort: item.effort,
    section_ref: section,
  };
}

/**
 * Applies the answer to the report. `limitNew` caps how many new fixes are added (promotions always apply),
 * so a report whose additions fail validation can be retried with fewer of them.
 */
export function mergeSeverityCheck(report: Report, answer: SeverityCheckAnswer, limitNew = 2): SeverityMerge {
  const fixes = Array.isArray(report.top_fixes) ? report.top_fixes : [];
  const first = fixes[0];
  const added: SeverityKind[] = [];
  const promoted: number[] = [];
  const skipped: SeveritySkip[] = [];
  // In priority order after the first fix: an index into the existing fixes, or a new fix.
  const critical: Array<number | Fix> = [];
  for (const item of answer.critical_misses.slice(0, 2)) {
    let index = item.source === "fix_2" ? 1 : item.source === "fix_3" ? 2 : -1;
    if (item.source === "new") {
      const excerpt = canonicalSourceIdentity(item.excerpt);
      if (!excerpt || !item.fix.trim() || !item.why.trim()) {
        skipped.push({ kind: item.kind, reason: "empty" });
        continue;
      }
      if (excerpt === excerptOf(first)) {
        skipped.push({ kind: item.kind, reason: "duplicates_first_fix" });
        continue;
      }
      // A new fix on the line Fix 2 or Fix 3 already cites is that fix: promote it instead of a duplicate.
      index = fixes.findIndex((fix, position) => position > 0 && excerptOf(fix) === excerpt);
      if (index < 0) {
        if (added.length >= limitNew) continue;
        critical.push(newFix(item));
        added.push(item.kind);
        continue;
      }
    }
    if (index < 1 || index >= fixes.length) {
      skipped.push({ kind: item.kind, reason: "no_such_fix" });
      continue;
    }
    if (promoted.includes(index)) {
      skipped.push({ kind: item.kind, reason: "already_flagged" });
      continue;
    }
    critical.push(index);
    promoted.push(index);
  }
  const misses = [first, ...critical.map((entry) => (typeof entry === "number" ? fixes[entry] : entry))]
    .filter(Boolean)
    .map((fix) => ({ ...fix, critical: true }));
  const rest = fixes.slice(1)
    .filter((_, offset) => !promoted.includes(offset + 1))
    .map((fix) => ({ ...fix, critical: false }));
  const topFixes = [...misses, ...rest].slice(0, 3);
  const count = topFixes.filter((fix) => fix.critical).length;
  return {
    report: { ...report, top_fixes: topFixes, more_critical: answer.more_critical === true && count === 3 },
    added,
    promoted,
    skipped,
  };
}

/** Whether a validated report still leads with the same first fix: the check may never change it. */
export function sameFirstFix(before: Report, after: Report) {
  const a = before.top_fixes?.[0];
  const b = after.top_fixes?.[0];
  return Boolean(a && b) && String(a?.fix) === String(b?.fix) && excerptOf(a) === excerptOf(b);
}

export function criticalCount(report: Report) {
  const fixes = Array.isArray(report.top_fixes) ? report.top_fixes : [];
  return fixes.some((fix) => typeof fix?.critical === "boolean") ? fixes.filter((fix) => fix?.critical === true).length : Math.min(fixes.length, 1);
}

/** RIYP_SEVERITY_CHECK: "1"/"true" turns the check on, "0"/"false" off; unset means the default. */
export const SEVERITY_CHECK_DEFAULT = false;

export function isSeverityCheckEnabled(value = process.env.RIYP_SEVERITY_CHECK) {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (["1", "true", "on"].includes(normalized)) return true;
  if (["0", "false", "off"].includes(normalized)) return false;
  return SEVERITY_CHECK_DEFAULT;
}
