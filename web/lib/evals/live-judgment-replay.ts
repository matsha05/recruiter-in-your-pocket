/**
 * Replays the saved outputs of the live judgment run (docs/audits/2026-11-live-judgment/) through the
 * current validators and the severity merge, with no model call. Every saved record holds the model's
 * first draft, the repaired draft when the first was refused, and the severity check's answer when the
 * report shipped; so the replay reproduces what production would ship from those same model answers
 * under the code as it is now. Comparing two replays (before and after a validator change) says
 * exactly which runs changed, which detector refused them, and what shipped instead.
 */
import fs from "node:fs";
import path from "node:path";

import { ensureLayoutAndContentFields, validateResumeModelPayload } from "../backend/validation";
import { settleSeverityCheck } from "../reports/severity-check-service";
import { withCriticalFirst } from "../reports/report-presentation";
import { resolveEffectiveJobDescription } from "../security/effectiveJobDescription";
import { sanitizeUserInput } from "../security/inputSanitization";
import type { SeverityCheckAnswer } from "../llm/severity-check-model";
import { isWorklistReport } from "../llm/worklist-schema";
import { validateWorklistPayload } from "../llm/worklist-validator";
import { settleWorklistSeverityCheck } from "../reports/severity-check-service";

export type RefusalDetector =
  | "summary_presence"
  | "summary_contradiction"
  | "positive_contradiction"
  | "narrative_facts"
  | "narrative_meaning"
  | "ambiguous_excerpt"
  | "not_actionable"
  | "other";

export interface Refusal {
  detector: RefusalDetector;
  path: string | null;
  /** The words or facts the detector named, when it named any. */
  facts: string[];
  message: string;
}

export interface FixSummary {
  fix: string;
  excerpt: string;
  section: string;
  critical: boolean | null;
}

export interface DraftDecision {
  decision: "shipped" | "refused";
  refusal?: Refusal;
}

export interface ReplayResult {
  stem: string;
  case_id: string;
  run: number;
  batch: string;
  /** What the saved record says production did. */
  saved_outcome: string;
  saved_first_refusal: string | null;
  saved_repair_refusal: string | null;
  first_draft: DraftDecision | null;
  repaired_draft: DraftDecision | null;
  /** How the report reached the page, or why it never did. */
  outcome: "shipped_first_draft" | "shipped_after_repair" | "never_shipped" | "request_refused" | "regression_no_repair";
  /** The severity merge, when the saved run carries the check's answer. */
  severity: { applied: boolean; outcome?: string; reason?: string; added?: string[]; promoted?: number[]; led?: string | null } | null;
  verdict: string | null;
  fixes: FixSummary[];
  critical_misses: FixSummary[];
  score: number | null;
  /** The posting block, when the run had a posting: the fit sentence and the missing-requirements list that shipped. */
  jd_match_summary: string | null;
  jd_missing: string[] | null;
}

export interface SavedRun {
  stem: string;
  record: any;
  resumeText: string;
  jobDescription?: string;
}

export function classifyRefusal(message: string): Refusal {
  const text = String(message || "");
  // The worklist validator's refusals (contract v3) name the card and the check.
  let worklist = text.match(/failed the worklist contract at ([^\s:]+): (.+?)\.?$/u);
  if (worklist) {
    const [, path, reason] = worklist;
    if (/not on the resume as written|matches more than one/u.test(reason)) return { detector: "ambiguous_excerpt", path, facts: [], message: text };
    if (/outside a bracket|states a (?:number|name)/u.test(reason)) return { detector: "narrative_facts", path, facts: [reason.replace(/^.*: "/u, "").replace(/"$/u, "")], message: text };
    if (/retired phrase/u.test(reason)) return { detector: "not_actionable", path, facts: [reason], message: text };
    return { detector: "other", path, facts: [reason], message: text };
  }
  const facts = (list: string) => list.split(/,\s*/u).map((item) => item.trim().replace(/\.$/u, "")).filter(Boolean);
  let match = text.match(/at section_review\.Summary: the source contains this section/u);
  if (match) return { detector: "summary_presence", path: "section_review.Summary", facts: [], message: text };
  match = text.match(/contradicted positive source evidence at (section_review\.Summary\.missing)/u);
  if (match) return { detector: "summary_contradiction", path: match[1], facts: [], message: text };
  match = text.match(/contradicted positive source evidence at ([^\s.]+(?:\.[^\s.]+)*)\.?$/u);
  if (match) return { detector: "positive_contradiction", path: match[1], facts: [], message: text };
  match = text.match(/at ([^\s]+) unsupported narrative facts: (.+?)\.?$/u);
  if (match) {
    const named = facts(match[2]);
    // A meaning rule explains itself in a sentence; the fact audit names words.
    const meaning = named.some((fact) => /\s(?:does|do|did|is|are|not|ask|establish)\s/u.test(fact) || fact.split(/\s+/u).length > 4);
    return { detector: meaning ? "narrative_meaning" : "narrative_facts", path: match[1], facts: named, message: text };
  }
  match = text.match(/ambiguous source evidence: (.+?)\.?$/u);
  if (match) return { detector: "ambiguous_excerpt", path: match[1].split(",")[0].trim(), facts: [], message: text };
  match = text.match(/at ([^\s]+) not actionable: (.+?)\.?$/u);
  if (match) return { detector: "not_actionable", path: match[1], facts: [match[2]], message: text };
  return { detector: "other", path: null, facts: [], message: text };
}

export function loadSavedRuns(auditDir: string): SavedRun[] {
  const manifestPath = path.join(auditDir, "manifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as { cases: Array<{ id: string; resume: string; job_description?: string }> };
  const cases = new Map(manifest.cases.map((item) => [item.id, item]));
  const outputs = path.join(auditDir, "outputs");
  return fs.readdirSync(outputs)
    .filter((file) => file.endsWith(".json") && !file.startsWith("_ledger") && /__run\d+\.json$/u.test(file))
    .sort()
    .map((file) => {
      const record = JSON.parse(fs.readFileSync(path.join(outputs, file), "utf8"));
      const testCase = cases.get(record.case_id);
      if (!testCase) throw new Error(`No manifest case for ${file}`);
      const resumeText = fs.readFileSync(path.resolve(auditDir, testCase.resume), "utf8");
      const jobDescription = testCase.job_description ? fs.readFileSync(path.resolve(auditDir, testCase.job_description), "utf8") : undefined;
      return { stem: file.replace(/\.json$/u, ""), record, resumeText, jobDescription };
    });
}

function fixSummary(fix: any): FixSummary {
  return {
    fix: String(fix?.fix ?? ""),
    excerpt: String(fix?.evidence?.excerpt ?? (typeof fix?.evidence === "string" ? fix.evidence : "")),
    section: String(fix?.evidence?.section ?? fix?.section_ref ?? ""),
    critical: typeof fix?.critical === "boolean" ? fix.critical : null,
  };
}

function validateDraft(draft: any, resumeText: string, validationOptions: { jobDescription?: string; forceGrounding?: boolean }): { decision: DraftDecision; payload: any } {
  try {
    const payload = ensureLayoutAndContentFields(isWorklistReport(draft)
      ? validateWorklistPayload(structuredClone(draft), resumeText, validationOptions)
      : validateResumeModelPayload(structuredClone(draft), resumeText, validationOptions));
    return { decision: { decision: "shipped" }, payload };
  } catch (error: any) {
    return { decision: { decision: "refused", refusal: classifyRefusal(String(error?.message || error)) }, payload: null };
  }
}

/**
 * Replays one saved run. The resume goes through the same sanitizer as the provider messages, so the
 * validator sees the text the model saw.
 */
export function replaySavedRun(saved: SavedRun): ReplayResult {
  const { record } = saved;
  const base: ReplayResult = {
    stem: saved.stem,
    case_id: record.case_id,
    run: record.run,
    batch: record.batch,
    saved_outcome: record.outcome,
    saved_first_refusal: record.initial_validation_error?.message ?? null,
    saved_repair_refusal: record.repair_error?.message ?? null,
    first_draft: null,
    repaired_draft: null,
    outcome: "never_shipped",
    severity: null,
    verdict: null,
    fixes: [],
    critical_misses: [],
    score: null,
    jd_match_summary: null,
    jd_missing: null,
  };
  if (record.outcome === "request_refused" || !record.model_output) {
    return { ...base, outcome: "request_refused" };
  }
  const resumeText = sanitizeUserInput(saved.resumeText).sanitizedText;
  const effective = resolveEffectiveJobDescription(saved.jobDescription);
  const validationOptions = { forceGrounding: true, ...effective.validationOptions };

  const first = validateDraft(record.model_output, resumeText, validationOptions);
  base.first_draft = first.decision;
  let payload = first.payload;
  if (payload) {
    base.outcome = "shipped_first_draft";
  } else if (record.model_output_repaired) {
    const repaired = validateDraft(record.model_output_repaired, resumeText, validationOptions);
    base.repaired_draft = repaired.decision;
    payload = repaired.payload;
    base.outcome = payload ? "shipped_after_repair" : "never_shipped";
  } else {
    // The first draft shipped when this was recorded, so no repair exists to fall back on.
    base.outcome = "regression_no_repair";
  }
  if (!payload) return base;

  const answer: SeverityCheckAnswer | undefined = record.severity?.answer;
  let shipped = payload;
  if (answer) {
    const settled = isWorklistReport(payload)
      ? settleWorklistSeverityCheck({ payload, answer, resumeText, validationOptions })
      : settleSeverityCheck({ payload, answer, resumeText, validationOptions });
    shipped = settled.payload;
    base.severity = { applied: true, outcome: settled.outcome, reason: settled.reason, added: settled.added, promoted: settled.promoted, led: settled.led };
  } else {
    base.severity = { applied: false };
  }
  if (isWorklistReport(shipped)) {
    // A worklist report: every card is a "fix" here, the structural ones flagged, so the counts read across both shapes.
    base.fixes = shipped.cards.map((card) => ({ fix: card.question || card.cannot_tell, excerpt: card.line, section: card.where, critical: card.kind === "structure" || card.kind === "dates" }));
    base.critical_misses = base.fixes.filter((fix) => fix.critical === true);
    base.verdict = shipped.verdict;
    base.score = shipped.score;
    if (saved.jobDescription) {
      base.jd_match_summary = shipped.fit.posting.summary || null;
      base.jd_missing = shipped.fit.posting.missing;
    }
    return base;
  }
  const ordered = withCriticalFirst(shipped);
  base.fixes = (ordered.top_fixes || []).map(fixSummary);
  base.critical_misses = base.fixes.filter((fix, index) => fix.critical === true || (fix.critical === null && index === 0));
  base.verdict = typeof shipped.first_impression === "string" ? shipped.first_impression : null;
  base.score = typeof shipped.score === "number" ? shipped.score : null;
  if (saved.jobDescription) {
    base.jd_match_summary = typeof shipped.job_alignment?.jd_match_summary === "string" ? shipped.job_alignment.jd_match_summary : null;
    base.jd_missing = Array.isArray(shipped.job_alignment?.jd_keywords?.missing) ? shipped.job_alignment.jd_keywords.missing : null;
  }
  return base;
}

export function replaySavedRuns(auditDir: string) {
  return loadSavedRuns(auditDir).map(replaySavedRun);
}

// ---- Comparing two replays ----

export function refusalsByDetector(results: ReplayResult[], draft: "first_draft" | "repaired_draft") {
  const counts: Record<string, number> = {};
  for (const result of results) {
    const decision = result[draft];
    if (decision?.decision !== "refused" || !decision.refusal) continue;
    counts[decision.refusal.detector] = (counts[decision.refusal.detector] || 0) + 1;
  }
  return counts;
}

export function outcomeCounts(results: ReplayResult[]) {
  const counts: Record<string, number> = {};
  for (const result of results) counts[result.outcome] = (counts[result.outcome] || 0) + 1;
  return counts;
}

export interface ShippedChange {
  stem: string;
  before_outcome: string;
  after_outcome: string;
  before_first_fix: FixSummary | null;
  after_first_fix: FixSummary | null;
  before_critical: number;
  after_critical: number;
  before_verdict: string | null;
  after_verdict: string | null;
  why: string;
}

/** Every run whose shipped result differs between two replays, with the old and new first fix side by side. */
export function shippedChanges(before: ReplayResult[], after: ReplayResult[]): ShippedChange[] {
  const byStem = new Map(before.map((result) => [result.stem, result]));
  const changes: ShippedChange[] = [];
  for (const next of after) {
    const prev = byStem.get(next.stem);
    if (!prev) continue;
    const sameFixes = JSON.stringify(prev.fixes) === JSON.stringify(next.fixes);
    const sameVerdict = prev.verdict === next.verdict;
    if (prev.outcome === next.outcome && sameFixes && sameVerdict) continue;
    const why = prev.outcome !== next.outcome
      ? `${prev.outcome} -> ${next.outcome}`
      : !sameFixes && prev.fixes[0]?.fix !== next.fixes[0]?.fix
        ? "first fix changed"
        : !sameFixes ? "fix list changed" : "verdict changed";
    changes.push({
      stem: next.stem,
      before_outcome: prev.outcome,
      after_outcome: next.outcome,
      before_first_fix: prev.fixes[0] ?? null,
      after_first_fix: next.fixes[0] ?? null,
      before_critical: prev.critical_misses.length,
      after_critical: next.critical_misses.length,
      before_verdict: prev.verdict,
      after_verdict: next.verdict,
      why,
    });
  }
  return changes;
}

/** Whether a replay on unchanged code reproduces what the saved records say production did. */
export function savedDecisionMismatches(results: ReplayResult[]) {
  const mismatches: string[] = [];
  for (const result of results) {
    if (result.outcome === "request_refused") continue;
    const firstRefused = result.first_draft?.decision === "refused";
    if (firstRefused !== Boolean(result.saved_first_refusal)) {
      mismatches.push(`${result.stem}: first draft ${firstRefused ? "refused" : "shipped"} now, saved ${result.saved_first_refusal ? "refused" : "shipped"}`);
      continue;
    }
    if (firstRefused && result.first_draft?.refusal?.message !== result.saved_first_refusal) {
      mismatches.push(`${result.stem}: first refusal differs\n   now:   ${result.first_draft?.refusal?.message}\n   saved: ${result.saved_first_refusal}`);
    }
    const savedShipped = result.saved_outcome === "report";
    const nowShipped = result.outcome.startsWith("shipped");
    if (savedShipped !== nowShipped) mismatches.push(`${result.stem}: ${nowShipped ? "ships" : "never ships"} now, saved outcome ${result.saved_outcome}`);
  }
  return mismatches;
}
