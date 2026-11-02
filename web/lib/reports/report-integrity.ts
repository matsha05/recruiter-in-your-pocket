/**
 * Deterministic post-generation pass shared by the web report and the PDF.
 *
 * The model writes strengths, fixes, questions and gaps independently, so the
 * same resume line can come back as "leave this alone" and "fix this", and the
 * same observation can appear in four fields. This pass gives every resume line
 * one disposition (fix, then keep, then ask), moves questions to the fix they
 * belong to, drops restatements of a fix, and lifts structural gaps (an
 * unexplained stretch of time, an unclear target role) into the opening read.
 *
 * It never writes new prose: it only selects, moves or hides model text.
 * Lines are identified from the report itself (fix evidence and rewrite
 * originals), so saved reports without their resume reconcile the same way.
 */

import type { ReportData } from "@/components/workspace/report/ReportTypes";
import { observationTokens } from "./observation-tokens";
import { buildReportRewritePresentation } from "./report-presentation";

type ReportFix = NonNullable<ReportData["top_fixes"]>[number];
type ReportQuestion = NonNullable<NonNullable<ReportData["ideas"]>["questions"]>[number];

export type StructuralGapKind = "employment_gap" | "target_role" | "level";

export type IntegrityDecision =
  | { kind: "keep_dropped"; path: string; line: string; criticalMiss: boolean }
  | { kind: "question_moved"; path: string; fix: number }
  | { kind: "question_dropped"; path: string; reason: "duplicates_fix" | "duplicates_keep" }
  | { kind: "structural_gap_surfaced"; path: string; structural: StructuralGapKind }
  | { kind: "repeat_dropped"; path: string; of: string };

export interface ReportIntegrity {
  /** The report with each observation left in exactly one place. */
  report: ReportData;
  /** Missing-detail questions for each of `report.top_fixes`, in order. */
  fixQuestions: string[][];
  /** Whether each fix's `why` is a reason (true) or was itself a list of questions now in `fixQuestions`. */
  fixWhyIsReason: boolean[];
  /** Structural gaps the model found, shown in the opening read instead of the collapsed notes. */
  structuralGaps: Array<{ text: string; kind: StructuralGapKind }>;
  decisions: IntegrityDecision[];
}

// ============================================
// LINE MATCHING
// ============================================

function isNumeric(token: string) {
  return /\d/.test(token);
}

/** A resume line the report already gives a fix disposition. */
interface LineAnchor {
  id: string;
  fixIndex?: number;
  tokens: Set<string>;
}

function evidenceText(fix: ReportFix) {
  if (!fix?.evidence) return "";
  return typeof fix.evidence === "string" ? fix.evidence : fix.evidence.excerpt || "";
}

function fixText(fix: ReportFix) {
  return fix?.fix || fix?.text || "";
}

function buildAnchors(report: ReportData): LineAnchor[] {
  // Keep positions aligned with top_fixes; a missing entry just has no words to match.
  const fixes = list(report.top_fixes).map((fix) => fix || {});
  const { fixes: presented, independentRewrites } = buildReportRewritePresentation(fixes, list(report.rewrites));
  const anchors: LineAnchor[] = fixes.map((fix, fixIndex) => {
    const tokens = observationTokens(`${evidenceText(fix)} ${fixText(fix)}`);
    for (const token of observationTokens(presented[fixIndex]?.rewrite?.original)) tokens.add(token);
    return { id: `fix-${fixIndex}`, fixIndex, tokens };
  });
  for (const { rewrite, originalIndex } of independentRewrites) {
    anchors.push({ id: `rewrite-${originalIndex}`, tokens: observationTokens(rewrite.original) });
  }
  return anchors;
}

function anchorWeights(anchors: LineAnchor[]) {
  const frequency = new Map<string, number>();
  for (const anchor of anchors) {
    for (const token of anchor.tokens) frequency.set(token, (frequency.get(token) || 0) + 1);
  }
  return (token: string) => {
    const count = frequency.get(token) || 0;
    if (count === 0) return 0;
    return (isNumeric(token) ? 1.5 : 1) / count;
  };
}

interface AnchorMatch {
  anchor: LineAnchor;
  /** Shared words, weighted toward words only this line uses. */
  score: number;
  /** Share of the item's own words that come from this line. */
  coverage: number;
}

function matchAnchors(tokens: Set<string>, anchors: LineAnchor[], weight: (token: string) => number): AnchorMatch[] {
  return anchors
    .map((anchor) => {
      let score = 0;
      let shared = 0;
      for (const token of tokens) {
        if (!anchor.tokens.has(token)) continue;
        score += weight(token);
        shared += 1;
      }
      return { anchor, score, coverage: tokens.size > 0 ? shared / tokens.size : 0 };
    })
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score || right.coverage - left.coverage);
}

/**
 * The item is about this line: it shares distinctive words with it (two words,
 * or a number and a word) and most of what it says comes from that line. Shared
 * vocabulary alone is not enough; "financial reporting" in a skills line is not
 * the reporting bullet.
 */
const LINE_SCORE = 1.5;
const LINE_COVERAGE = 0.4;
/** A next step is a repeat only when nearly all of it comes from one fix. */
const REPEAT_COVERAGE = 0.6;

function meets(match: AnchorMatch | undefined, score: number, coverage: number) {
  return Boolean(match && match.score >= score && match.coverage >= coverage);
}

function isOnLine(match: AnchorMatch | undefined): match is AnchorMatch {
  return meets(match, LINE_SCORE, LINE_COVERAGE);
}

/**
 * Critique that restates a fix may quote a different part of the same line, so
 * three distinctive shared words also count. Strengths never use this looser
 * test: dropping a real strength costs more than showing one extra note.
 */
const RESTATEMENT_SCORE = 2.5;
const RESTATEMENT_COVERAGE = 0.25;

function restatesLine(match: AnchorMatch | undefined): match is AnchorMatch {
  return meets(match, LINE_SCORE, LINE_COVERAGE) || meets(match, RESTATEMENT_SCORE, RESTATEMENT_COVERAGE);
}

function lineFor(
  tokens: Set<string>,
  anchors: LineAnchor[],
  weight: (token: string) => number,
  accepts: (match: AnchorMatch | undefined) => match is AnchorMatch = isOnLine,
) {
  const matches = matchAnchors(tokens, anchors, weight).filter(accepts);
  const [best, next] = matches;
  if (!best) return undefined;
  // An item that sits equally between two fixes is not about either one line.
  if (next && next.score === best.score && next.coverage === best.coverage) return undefined;
  return best;
}

function sharesLine(item: Set<string>, other: Set<string>) {
  let shared = 0;
  for (const token of item) if (other.has(token)) shared += 1;
  return shared >= 2 && item.size > 0 && shared / item.size >= LINE_COVERAGE;
}

// ============================================
// STRUCTURAL GAPS
// ============================================

const MONTH_YEAR = String.raw`(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}`;

const STRUCTURAL_PATTERNS: Array<{ kind: StructuralGapKind; pattern: RegExp }> = [
  {
    kind: "employment_gap",
    pattern: new RegExp([
      String.raw`\bno (?:\w+ )?(?:later|subsequent|recent|current|dated) (?:\w+ )?(?:activity|role|position|work|employment)`,
      String.raw`\bno activity (?:after|since)\b`,
      String.raw`\blists no activity\b`,
      String.raw`\bdoes not (?:describe|show|list) any (?:activity|work|role)\b.{0,40}\b(?:after|since)\b`,
      String.raw`\b(?:ends?|ended) in ${MONTH_YEAR}\b.{0,80}\b(?:no|nothing|without)\b`,
      String.raw`\b(?:after|since) ${MONTH_YEAR}\b.{0,60}\b(?:no|nothing|unclear|not (?:shown|described|listed))\b`,
      String.raw`\bnot accompanied by a later\b`,
      String.raw`\b(?:employment|career|work[- ]history) gap\b`,
      String.raw`\bgap in (?:your )?(?:employment|work history|dates)\b`,
      // How a fix or the Verdict names the same issue.
      String.raw`\bwhat you(?:'ve| have) (?:been doing|done) since\b`,
      String.raw`\b(?:period|time|stretch) (?:since|after) (?:${MONTH_YEAR}|your last)\b`,
      String.raw`\bcurrent (?:status|activity) (?:is )?unclear\b`,
      String.raw`\bended in ${MONTH_YEAR}\b`,
    ].join("|"), "i"),
  },
  {
    kind: "target_role",
    pattern: /\b(?:target(?:ed)? role|intended (?:next )?role|next role|whether you want to|which (?:role|job) you(?:'re| are) (?:applying|targeting|pursuing))\b/i,
  },
  {
    kind: "level",
    pattern: /\bseniority\b.{0,60}\b(?:unclear|doesn't match|does not match|mismatch|hard to (?:tell|place))\b|\b(?:title|level) (?:overstates|understates|doesn't match|does not match)\b/i,
  },
];

export function structuralGapKind(text: string | null | undefined): StructuralGapKind | undefined {
  const value = String(text || "");
  return STRUCTURAL_PATTERNS.find(({ pattern }) => pattern.test(value))?.kind;
}

// ============================================
// QUESTIONS
// ============================================

function sentences(text: string) {
  return text.split(/(?<=[.!?])\s+/).map((sentence) => sentence.trim()).filter(Boolean);
}

/** A `why` written entirely as questions is a list of missing details, not a reason. */
export function questionsInWhy(why: string | null | undefined): string[] {
  const parts = sentences(String(why || ""));
  if (parts.length === 0 || !parts.every((sentence) => sentence.endsWith("?"))) return [];
  return parts;
}

function questionText(question: ReportQuestion) {
  return typeof question?.question === "string" ? question.question.trim() : "";
}

// ============================================
// THE PASS
// ============================================

function isCopy(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/** Streaming and stored reports can be partial; treat anything that isn't a list as empty. */
function list<T>(value: T[] | undefined | null): T[] {
  return Array.isArray(value) ? value : [];
}

/** Most of one note is already in the other, in at least three distinctive words. */
function nearDuplicate(left: Set<string>, right: Set<string>) {
  let shared = 0;
  for (const token of left) if (right.has(token)) shared += 1;
  return shared >= 3 && shared / Math.min(left.size, right.size) >= 0.5;
}

interface RenderedNote {
  path: string;
  tokens: Set<string>;
  /** Section notes are boilerplate per section; matching wording in two sections is not a repeat. */
  section?: boolean;
}

interface MatchContext {
  anchors: LineAnchor[];
  weight: (token: string) => number;
  rendered: RenderedNote[];
}

function matchContext(report: ReportData): Omit<MatchContext, "rendered"> {
  const anchors = buildAnchors(report);
  return { anchors, weight: anchorWeights(anchors) };
}

/** The earlier place this note already appears in full, if any. */
/**
 * note: a gap or example, which often restates one fix in other words.
 * question: a fix's question when squarely about that line; otherwise an ask, never a repeat of a note.
 * section: per-section notes; a repeat only when it says what another note already said.
 * plan: a next step; it may gather earlier notes, so it repeats only when it is one fix again.
 */
type NoteKind = "note" | "question" | "section" | "plan";

function repeatOf(tokens: Set<string>, context: MatchContext, kind: NoteKind): string | undefined {
  if (kind === "plan") {
    const [best, next] = matchAnchors(tokens, context.anchors, context.weight);
    // A step that ties several fixes together, or adds its own instruction, is a plan rather than a repeat.
    if (isOnLine(best) && best.coverage >= REPEAT_COVERAGE && best.anchor.fixIndex !== undefined && !(next && next.score >= 1)) {
      return `top_fixes[${best.anchor.fixIndex}]`;
    }
    return undefined;
  }
  if (kind !== "section") {
    const line = lineFor(tokens, context.anchors, context.weight, kind === "note" ? restatesLine : isOnLine);
    if (line) return line.anchor.fixIndex !== undefined ? `top_fixes[${line.anchor.fixIndex}]` : line.anchor.id;
  }
  if (kind === "question") return undefined;
  // Matching boilerplate in two sections ("Nothing important is missing") is not a repeat.
  return context.rendered.find((note) => !(kind === "section" && note.section) && nearDuplicate(tokens, note.tokens))?.path;
}

function verdictNotes(report: ReportData): RenderedNote[] {
  const verdict = report.first_impression || report.first_impression_takeaway || report.summary;
  return [
    { path: "first_impression", tokens: observationTokens(verdict) },
    { path: "score_comment_short", tokens: observationTokens(report.score_comment_short) },
  ].filter((note) => note.tokens.size > 0);
}

function fixNotes(report: ReportData): RenderedNote[] {
  return list(report.top_fixes).map((fix, index) => ({
    path: `top_fixes[${index}]`,
    tokens: observationTokens(`${fixText(fix)} ${fix?.why || ""}`),
  }));
}

export function reconcileReport(input: ReportData): ReportIntegrity {
  const report: ReportData = { ...input };
  const decisions: IntegrityDecision[] = [];
  const fixes = list(input.top_fixes);
  const base = matchContext(input);
  const { anchors, weight } = base;
  const fixQuestions: string[][] = fixes.map((fix) => [...questionsInWhy(fix?.why)]);
  const fixWhyIsReason = fixes.map((fix) => isCopy(fix?.why) && questionsInWhy(fix.why).length === 0);

  // 1. Fix outranks keep: a strength on a line the report asks you to change is not "working".
  const keptStrengths: Array<{ text: string; tokens: Set<string>; path: string }> = [];
  list(input.strengths).forEach((strength, index) => {
    if (!isCopy(strength)) return;
    const tokens = observationTokens(strength);
    const line = matchAnchors(tokens, anchors, weight).find(isOnLine);
    if (line) {
      decisions.push({ kind: "keep_dropped", path: `strengths[${index}]`, line: line.anchor.id, criticalMiss: isCriticalFix(input, line.anchor.fixIndex) });
      return;
    }
    keptStrengths.push({ text: strength, tokens, path: `strengths[${index}]` });
  });
  report.strengths = keptStrengths.map(({ text }) => text);

  // 2. Notes render in reading order, and one already said in full (by a fix,
  // the Verdict, or an earlier note) is not said again. Structural gaps come
  // first because they move up into the opening read.
  const context: MatchContext = { ...base, rendered: [...verdictNotes(input), ...fixNotes(input)] };
  const structuralGaps: ReportIntegrity["structuralGaps"] = [];
  const gapCandidates: Array<{ text: string; tokens: Set<string>; path: string }> = [];
  list(input.gaps).forEach((gap, index) => {
    if (!isCopy(gap)) return;
    const path = `gaps[${index}]`;
    const tokens = observationTokens(gap);
    const structural = structuralGapKind(gap);
    if (!structural) {
      gapCandidates.push({ text: gap, tokens, path });
      return;
    }
    const of = context.rendered.find((note) => nearDuplicate(tokens, note.tokens))?.path;
    if (of) {
      decisions.push({ kind: "repeat_dropped", path, of });
      return;
    }
    structuralGaps.push({ text: gap, kind: structural });
    context.rendered.push({ path, tokens });
    decisions.push({ kind: "structural_gap_surfaced", path, structural });
  });
  // 3. Keep outranks ask: a question about a fix line is that fix's missing detail,
  // and a question about a line we said to leave alone would contradict Keep.
  const remainingQuestions: ReportQuestion[] = [];
  list(input.ideas?.questions).forEach((question, index) => {
    const text = questionText(question);
    if (!text) return;
    const path = `ideas.questions[${index}]`;
    const tokens = observationTokens(text);
    const line = lineFor(tokens, anchors, weight);
    if (line?.anchor.fixIndex !== undefined) {
      const existing = fixQuestions[line.anchor.fixIndex];
      if (!existing.some((item) => item.toLocaleLowerCase() === text.toLocaleLowerCase())) existing.push(text);
      decisions.push({ kind: "question_moved", path, fix: line.anchor.fixIndex });
      return;
    }
    if (line) {
      decisions.push({ kind: "question_dropped", path, reason: "duplicates_fix" });
      return;
    }
    const withReason = observationTokens(`${text} ${question.why || ""}`);
    if (keptStrengths.some((kept) => sharesLine(tokens, kept.tokens) || sharesLine(withReason, kept.tokens))) {
      decisions.push({ kind: "question_dropped", path, reason: "duplicates_keep" });
      return;
    }
    context.rendered.push({ path, tokens });
    remainingQuestions.push(question);
  });
  if (input.ideas) report.ideas = { ...input.ideas, questions: remainingQuestions };

  const keepNote = (path: string, value: string | null | undefined, kind: NoteKind = "note") => {
    if (!isCopy(value)) return false;
    const tokens = observationTokens(value);
    const of = repeatOf(tokens, context, kind);
    if (of) {
      decisions.push({ kind: "repeat_dropped", path, of });
      return false;
    }
    context.rendered.push({ path, tokens, section: kind === "section" });
    return true;
  };

  if (!keepNote("biggest_gap_example", input.biggest_gap_example)) report.biggest_gap_example = undefined;
  report.gaps = gapCandidates.filter(({ text, path }) => keepNote(path, text)).map(({ text }) => text);

  if (input.section_review && typeof input.section_review === "object") {
    const sectionReview: NonNullable<ReportData["section_review"]> = {};
    for (const [name, review] of Object.entries(input.section_review)) {
      if (!review) continue;
      const next = { ...review };
      // A section's "What works" that repeats a strength we already show is said once, as the strength.
      const keptAs = isCopy(next.working)
        ? keptStrengths.find((kept) => nearDuplicate(observationTokens(next.working), kept.tokens))?.path
        : undefined;
      if (keptAs) {
        decisions.push({ kind: "repeat_dropped", path: `section_review.${name}.working`, of: keptAs });
        next.working = "";
      }
      for (const field of ["missing", "fix"] as const) {
        if (isCopy(next[field]) && !keepNote(`section_review.${name}.${field}`, next[field], "section")) next[field] = "";
      }
      sectionReview[name] = next;
    }
    report.section_review = sectionReview;
  }

  report.next_steps = list(input.next_steps)
    .filter((step, index) => keepNote(`next_steps[${index}]`, step, "plan"));

  return { report, fixQuestions, fixWhyIsReason, structuralGaps, decisions };
}

// ============================================
// SLOTS AND AUDITS (shared by the UI, the PDF and the evals)
// ============================================

/** What a fix card shows besides its title and original line. */
export function fixCardSlots(integrity: ReportIntegrity, index: number): { why?: string; whatToAdd: string[] } {
  const fix = integrity.report.top_fixes?.[index];
  // The Critical Miss gives its reason in the opening read, so its card only lists what to add.
  const why = index > 0 && integrity.fixWhyIsReason[index] ? fix?.why : undefined;
  return { why, whatToAdd: integrity.fixQuestions[index] || [] };
}

/** A report can flag up to three Critical Misses; one saved before the flag existed has one, the first fix. */
export function isCriticalFix(report: ReportData, index: number | undefined) {
  if (index === undefined) return false;
  const fixes = list(report.top_fixes);
  return fixes.some((fix) => typeof fix?.critical === "boolean") ? fixes[index]?.critical === true : index === 0;
}

/** Whether the report says the resume has more serious problems than the three Critical Misses it lists. */
export function hasMoreCriticalMisses(report: ReportData) {
  return report.more_critical === true && list(report.top_fixes).filter((fix) => fix?.critical === true).length === 3;
}

/** The reason shown beside the Critical Miss in the opening read. */
export function criticalMissReason(integrity: ReportIntegrity): string | undefined {
  return integrity.fixWhyIsReason[0] ? integrity.report.top_fixes?.[0]?.why : undefined;
}

export interface KeepFixCollision {
  strength: string;
  line: string;
  criticalMiss: boolean;
}

/** Strengths that sit on a line the report also tells the candidate to fix. */
export function auditKeepFixCollisions(report: ReportData): KeepFixCollision[] {
  const { anchors, weight } = matchContext(report);
  return list(report.strengths).flatMap((strength, index) => {
    if (!isCopy(strength)) return [];
    const line = matchAnchors(observationTokens(strength), anchors, weight).find(isOnLine);
    return line ? [{ strength: `strengths[${index}]`, line: line.anchor.id, criticalMiss: isCriticalFix(report, line.anchor.fixIndex) }] : [];
  });
}

export interface ObservationRepeat {
  path: string;
  of: string;
}

/**
 * Notes that repeat an observation already made in full elsewhere in the report.
 * Without `integrity`, every field is read as the model wrote it. With it, the
 * audit reads the reconciled report the way the web report and PDF render it.
 * Narrative paragraphs (summary, score explanations) are not counted.
 */
export function auditRepeats(report: ReportData, integrity?: Pick<ReportIntegrity, "structuralGaps">): ObservationRepeat[] {
  const base = matchContext(report);
  const context: MatchContext = { ...base, rendered: [...verdictNotes(report), ...fixNotes(report)] };
  const repeats: ObservationRepeat[] = [];
  const check = (path: string, value: string | null | undefined, kind: NoteKind = "note") => {
    if (!isCopy(value)) return;
    const tokens = observationTokens(value);
    const of = repeatOf(tokens, context, kind);
    if (of) repeats.push({ path, of });
    context.rendered.push({ path, tokens, section: kind === "section" });
  };
  list(integrity?.structuralGaps).forEach((gap, index) => check(`structural_gaps[${index}]`, gap.text));
  // Before reconciliation, a question about a fix line restates that fix. Afterwards those questions sit on the fix card.
  list(report.ideas?.questions).forEach((question, index) => check(`ideas.questions[${index}]`, questionText(question), "question"));
  check("biggest_gap_example", report.biggest_gap_example);
  list(report.gaps).forEach((gap, index) => check(`gaps[${index}]`, gap));
  const strengths = list(report.strengths).flatMap((strength, index) => (
    isCopy(strength) ? [{ path: `strengths[${index}]`, tokens: observationTokens(strength) }] : []
  ));
  for (const [name, review] of Object.entries(report.section_review || {})) {
    if (isCopy(review?.working)) {
      const tokens = observationTokens(review.working);
      const of = strengths.find((strength) => nearDuplicate(tokens, strength.tokens))?.path;
      if (of) repeats.push({ path: `section_review.${name}.working`, of });
    }
    for (const field of ["missing", "fix"] as const) check(`section_review.${name}.${field}`, review?.[field], "section");
  }
  list(report.next_steps).forEach((step, index) => check(`next_steps[${index}]`, step, "plan"));
  return repeats;
}

/**
 * The fix whose line a short note points at (a takeaway, an example), if exactly one.
 * Short labels such as "Explain the readmissions result" need only one distinctive word.
 */
export function fixLineOf(report: ReportData, text: string | null | undefined, short = false): number | undefined {
  if (!isCopy(text)) return undefined;
  const { anchors, weight } = matchContext(report);
  const accepts = short
    ? (match: AnchorMatch | undefined): match is AnchorMatch => meets(match, 1, 0.5)
    : restatesLine;
  return lineFor(observationTokens(text), anchors, weight, accepts)?.anchor.fixIndex;
}
