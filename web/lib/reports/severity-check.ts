import { canonicalSourceIdentity, isExactAbsenceSentinel } from "../llm/source-fidelity";
import type { SeverityCheckAnswer, SeverityCheckItem, SeverityKind } from "../llm/severity-check-model";
import { structuralGapKind } from "./report-integrity";

/**
 * Merging the severity check into a finished report (Matt, wave 3: "i dont want to lie to people and say
 * they have one critical miss if there are more"). The first fix is the report's Critical Miss and its text
 * never changes. Each further Critical Miss either promotes Fix 2 or Fix 3, when the check says that fix
 * already names the problem, or is added after the first fix. A new one on the line Fix 2 or Fix 3 cites
 * replaces that fix: one fix per line, and the new one asks for what makes it serious. Critical Misses come
 * first; the report keeps at most three fixes.
 *
 * One exception to the order (judgment wave, November 5, 2026; docs/audits/2026-11-judgment-wave.md): when
 * the check finds an unexplained stretch of time (`no_recent_work`) or a title above the work
 * (`title_level_mismatch`) and the model's first fix is a line edit on a duty line, the structural miss
 * leads and the model's fix becomes the second Critical Miss. In the live run the gap sat behind a line
 * edit in 8 of 8 cases while the Verdict named the gap, so the page contradicted itself. The model's fix
 * is still shipped exactly as written; only its position changes.
 */

type Fix = Record<string, any>;
type Report = { top_fixes?: Fix[]; more_critical?: boolean; [key: string]: unknown };

export type SeveritySkip = { kind: SeverityKind; reason: "no_such_fix" | "duplicates_first_fix" | "already_flagged" | "empty" };

export interface SeverityMerge {
  report: Report;
  added: SeverityKind[];
  promoted: number[];
  /** Existing fixes (1 = Fix 2, 2 = Fix 3) that a new Critical Miss on the same line replaced. */
  replaced: number[];
  skipped: SeveritySkip[];
  /** The added Critical Miss that leads the report ahead of the model's first fix, when the rule applied. */
  led: SeverityKind | null;
}

/** The structural kinds that lead the report when the model's first fix is a line edit on a duty line. */
export const LEADING_SEVERITY_KINDS: readonly SeverityKind[] = ["no_recent_work", "title_level_mismatch"];

const DATE_RANGE = /^\s*(?:[A-Za-z]{3,9}\.?\s+)?(?:19|20)\d{2}\s*(?:[-–—]|to)\s*(?:(?:[A-Za-z]{3,9}\.?\s+)?(?:19|20)\d{2}|present|current)\s*$/iu;
const BULLET = /^\s*[-*•●◦▪▫‣⁃]\s+/u;

function excerptOf(fix: Fix | undefined) {
  const evidence = fix?.evidence;
  return canonicalSourceIdentity(typeof evidence === "string" ? evidence : String(evidence?.excerpt || ""));
}

function rawExcerptOf(fix: Fix | undefined) {
  const evidence = fix?.evidence;
  return typeof evidence === "string" ? evidence : String(evidence?.excerpt || "");
}

/**
 * A line edit on a duty line: the fix cites a real bullet or sentence from the work history (not a summary,
 * headline, title or date line, and not an absence marker) and asks for detail on it rather than naming a
 * structural problem of its own. Only such a fix yields the lead to a structural Critical Miss.
 */
export function isDutyLineEdit(fix: Fix | undefined): boolean {
  if (!fix || typeof fix.fix !== "string") return false;
  const excerpt = excerptOf(fix);
  const raw = rawExcerptOf(fix);
  if (!excerpt || isExactAbsenceSentinel(excerpt) || DATE_RANGE.test(excerpt)) return false;
  const section = String(fix.evidence?.section ?? fix.section_ref ?? "");
  if (/summary|objective|profile|headline|header|title/iu.test(section)) return false;
  if (structuralGapKind(`${fix.fix} ${fix.why ?? ""}`)) return false;
  // A role or title line is short; a duty line is a bullet or a sentence of some length.
  return BULLET.test(raw) || excerpt.split(/\s+/u).filter(Boolean).length >= 6;
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
  const replaced: number[] = [];
  const skipped: SeveritySkip[] = [];
  // In priority order after the first fix: an index into the existing fixes, or a new fix.
  const critical: Array<number | Fix> = [];
  const kindOf = new Map<Fix, SeverityKind>();
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
      const sameLine = fixes.findIndex((fix, position) => position > 0 && excerptOf(fix) === excerpt);
      if (sameLine > 0 && (promoted.includes(sameLine) || replaced.includes(sameLine))) {
        skipped.push({ kind: item.kind, reason: "already_flagged" });
        continue;
      }
      if (added.length >= limitNew) continue;
      const fix = newFix(item);
      kindOf.set(fix, item.kind);
      critical.push(fix);
      added.push(item.kind);
      if (sameLine > 0) replaced.push(sameLine);
      continue;
    }
    if (index < 1 || index >= fixes.length) {
      skipped.push({ kind: item.kind, reason: "no_such_fix" });
      continue;
    }
    if (promoted.includes(index) || replaced.includes(index)) {
      skipped.push({ kind: item.kind, reason: "already_flagged" });
      continue;
    }
    critical.push(index);
    promoted.push(index);
  }
  // The structural miss leads when the first fix is a line edit on a duty line; the first fix follows it unchanged.
  const leader = critical.find((entry) => typeof entry !== "number" && LEADING_SEVERITY_KINDS.includes(kindOf.get(entry)!));
  const led = leader && isDutyLineEdit(first) ? kindOf.get(leader as Fix)! : null;
  const ordered = led ? [leader!, first, ...critical.filter((entry) => entry !== leader)] : [first, ...critical];
  const misses = ordered.map((entry) => (typeof entry === "number" ? fixes[entry] : entry))
    .filter(Boolean)
    .map((fix) => ({ ...fix, critical: true }));
  const rest = fixes.slice(1)
    .filter((_, offset) => !promoted.includes(offset + 1) && !replaced.includes(offset + 1))
    .map((fix) => ({ ...fix, critical: false }));
  const topFixes = [...misses, ...rest].slice(0, 3);
  const count = topFixes.filter((fix) => fix.critical).length;
  return {
    report: { ...report, top_fixes: topFixes, more_critical: answer.more_critical === true && count === 3 },
    added,
    promoted,
    replaced,
    skipped,
    led,
  };
}

function sameFix(a: Fix | undefined, b: Fix | undefined) {
  return Boolean(a && b) && String(a?.fix) === String(b?.fix) && excerptOf(a) === excerptOf(b);
}

/** Whether a validated report still leads with the same first fix: the check may never change it. */
export function sameFirstFix(before: Report, after: Report) {
  return sameFix(before.top_fixes?.[0], after.top_fixes?.[0]);
}

/**
 * Whether the validated merged report keeps the model's first fix unchanged, in the position the merge gave
 * it: first, or second behind the structural miss that led. When a miss led, the validated report must
 * still lead with it; the validator may reorder or drop fixes, and then the merge does not ship.
 */
export function keepsFirstFix(before: Report, merged: SeverityMerge, after: Report) {
  if (!merged.led) return sameFirstFix(before, after);
  return sameFix(merged.report.top_fixes?.[0], after.top_fixes?.[0]) && sameFix(before.top_fixes?.[0], after.top_fixes?.[1]);
}

export function criticalCount(report: Report) {
  const fixes = Array.isArray(report.top_fixes) ? report.top_fixes : [];
  return fixes.some((fix) => typeof fix?.critical === "boolean") ? fixes.filter((fix) => fix?.critical === true).length : Math.min(fixes.length, 1);
}

/**
 * RIYP_SEVERITY_CHECK: "1"/"true" turns the check on, "0"/"false" off; unset means the default. On since the
 * gate passed (November 2: under-count 8 of 8, over-count 4 of 4, no vetoes, no smoke or golden regressions;
 * tests/fixtures/results/summary_severity_check_v1_2026-11-02.md).
 */
export const SEVERITY_CHECK_DEFAULT = true;

export function isSeverityCheckEnabled(value = process.env.RIYP_SEVERITY_CHECK) {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (["1", "true", "on"].includes(normalized)) return true;
  if (["0", "false", "off"].includes(normalized)) return false;
  return SEVERITY_CHECK_DEFAULT;
}

/**
 * The worklist report (contract v3) cards the structural problems itself. On the November 5, 2026 live set
 * the check added a card to 1 of 47 worklist reports (docs/audits/2026-11-worklist-run.md), so the second
 * call is off for it unless RIYP_SEVERITY_CHECK says "1" outright. The v2 report keeps the default above.
 */
export function isSeverityCheckEnabledForWorklist(value = process.env.RIYP_SEVERITY_CHECK) {
  return ["1", "true", "on"].includes(String(value ?? "").trim().toLowerCase());
}
