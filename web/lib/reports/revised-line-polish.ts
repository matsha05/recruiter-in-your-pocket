/**
 * Guarded polish for the revised line (Matt, Nov 1: "Guarded polish now").
 *
 * The literal line is the candidate's line plus their answers, word for word. A model may smooth it into
 * one bullet (reorder, drop filler, fix tense), and this deterministic check decides whether the smoothed
 * line may replace the literal one. It runs on the server after the model and again in the browser.
 * Anything it doesn't pass falls back to the literal line.
 *
 * The rule, in order:
 * 1. Every number, and every capitalized name, comes from the original line or the answers.
 * 2. Every other word, stemmed, comes from the original line or the answers. With `allowJoiners`, a short
 *    list of joining words is also allowed; without it, "every word is from your resume or your answers"
 *    is literally true.
 * 3. The existing fabrication guard passes, with the answers as the candidate's facts. Only its
 *    multi-verb relationship check may be waived, and only when the literal line fails it too.
 * 4. Nothing the candidate gave is lost: each answer, and every number and name in the line, is still there.
 */

import { compareSourceBoundRewrite } from "../llm/source-fidelity";
import { stemWord } from "./observation-tokens";
import { answerInLine } from "./revised-line";

/** Words that only join parts of a bullet. Scope and intensity words ("each", "all", "led") are not here. */
export const POLISH_JOINERS: ReadonlySet<string> = new Set(["a", "an", "the", "and", "to", "for", "of", "with", "by", "in", "on", "at"]);

export const POLISH_MAX_LENGTH = 400;

/**
 * Whether a polish may add the joining words above. Off: then "Every word is from your resume or your
 * answers" stays literally true. The eval reports both, so this can be switched on evidence.
 */
export const POLISH_ALLOWS_JOINERS = false;

export type PolishRejection =
  | "empty"
  | "too_long"
  | "new_number"
  | "new_name"
  | "new_word"
  | "dropped_fact"
  | "dropped_answer"
  | "guard";

export type PolishCheck =
  | { ok: true; joiners: string[] }
  | { ok: false; reason: PolishRejection; detail: string };

const wordPattern = /[\p{L}\p{N}][\p{L}\p{N}'’&+]*/gu;
const numberPattern = /[$€£]?\d[\d,.]*(?:%|[kmb](?![\p{L}]))?/giu;

function words(text: string) {
  return (text.normalize("NFKC").match(wordPattern) || []).flatMap((word) => word.split(/[-‐-―]/u)).filter(Boolean);
}

function normalizeWord(word: string) {
  return word.toLocaleLowerCase().replace(/['’]s$/u, "").replace(/['’]/gu, "");
}

function stems(text: string) {
  return new Set(words(text).map((word) => stemWord(normalizeWord(word))));
}

function numbers(text: string) {
  return new Set((text.normalize("NFKC").match(numberPattern) || []).map((value) => value.toLowerCase().replace(/[.,]+$/u, "").replace(/,/gu, "")));
}

/** Capitalized words that aren't just the start of the line or of a sentence. */
function names(text: string) {
  const found = new Set<string>();
  const normalized = text.normalize("NFKC");
  for (const match of normalized.matchAll(/[\p{Lu}][\p{L}\p{N}&+.'’-]*/gu)) {
    const before = normalized.slice(0, match.index ?? 0);
    if (!before.trim() || /[.!?:;]\s*$/u.test(before)) continue;
    if (match[0] === "I") continue;
    found.add(match[0].toLocaleLowerCase().replace(/[.'’]+$/u, ""));
  }
  return found;
}

const isRelationshipIssue = (detail: string) => /relationship binding|direction binding/u.test(detail);

export function checkPolishedLine(input: {
  /** The original resume line (the whole line when the resume is here, else the quoted excerpt). */
  sourceLine: string;
  /** The candidate's written answers. */
  answers: readonly string[];
  /** The literal composition the polish replaces. */
  literal: string;
  polished: string;
}, options: { allowJoiners?: boolean } = {}): PolishCheck {
  const polished = input.polished.trim();
  if (!polished) return { ok: false, reason: "empty", detail: "no line" };
  if (polished.length > POLISH_MAX_LENGTH || polished.length > input.literal.length * 1.5 + 20) {
    return { ok: false, reason: "too_long", detail: `${polished.length} characters` };
  }
  const allowed = [input.sourceLine, ...input.answers].join("\n");

  const allowedNumbers = numbers(allowed);
  const newNumbers = [...numbers(polished)].filter((value) => !allowedNumbers.has(value));
  if (newNumbers.length) return { ok: false, reason: "new_number", detail: newNumbers.join(", ") };

  const allowedWords = new Set(words(allowed).map(normalizeWord));
  const newNames = [...names(polished)].filter((name) => !allowedWords.has(name) && !names(allowed).has(name));
  if (newNames.length) return { ok: false, reason: "new_name", detail: newNames.join(", ") };

  const allowedStems = stems(allowed);
  const joiners: string[] = [];
  const newWords: string[] = [];
  for (const word of words(polished)) {
    const normalized = normalizeWord(word);
    if (/\d/u.test(normalized) || allowedStems.has(stemWord(normalized))) continue;
    if (options.allowJoiners && POLISH_JOINERS.has(normalized)) joiners.push(normalized);
    else newWords.push(normalized);
  }
  if (newWords.length) return { ok: false, reason: "new_word", detail: [...new Set(newWords)].join(", ") };

  const issues = compareSourceBoundRewrite({
    sourceText: input.sourceLine,
    sourceLocator: input.sourceLine,
    candidate: polished,
    verifiedFacts: input.answers.map((value, index) => ({ key: `answer-${index + 1}`, value })),
  }).issues;
  const literalIssues = compareSourceBoundRewrite({
    sourceText: input.sourceLine,
    sourceLocator: input.sourceLine,
    candidate: input.literal,
    verifiedFacts: input.answers.map((value, index) => ({ key: `answer-${index + 1}`, value })),
  }).issues;
  const literalFailsRelationships = literalIssues.some((issue) => isRelationshipIssue(issue.detail));
  for (const issue of issues) {
    // Dropping filler ("Duties included", "efforts") is the point; dropping a fact is not.
    if (issue.code === "dropped_fact" && issue.detail.startsWith("dropped source content")) continue;
    if (issue.code === "unsupported_content" && isRelationshipIssue(issue.detail) && literalFailsRelationships) continue;
    if (issue.code === "dropped_fact") return { ok: false, reason: "dropped_fact", detail: issue.detail };
    return { ok: false, reason: "guard", detail: issue.detail };
  }

  const lost = input.answers.filter((answer) => answer.trim() && !answerInLine(answer, polished));
  if (lost.length) return { ok: false, reason: "dropped_answer", detail: lost.join(" | ") };
  const keptNumbers = numbers(polished);
  const droppedNumbers = [...numbers(input.sourceLine)].filter((value) => !keptNumbers.has(value));
  if (droppedNumbers.length) return { ok: false, reason: "dropped_fact", detail: droppedNumbers.join(", ") };

  return { ok: true, joiners: [...new Set(joiners)] };
}

/** What the browser sends to /api/revise-line. The report context proves the line belongs to a real report. */
export interface RevisedLinePolishRequest {
  context: { reportId?: string; recoveryId?: string };
  /** The quoted line from the report's fix. */
  excerpt: string;
  /** The whole resume line when the resume is here, else the excerpt. */
  line: string;
  answers: string[];
}

export const POLISH_LIMITS = { excerpt: 400, line: 600, answer: 300, answers: 3 } as const;

/** Asks the server for a polished line. Resolves null on any failure, so the literal line stays. */
export async function fetchPolishedLine(request: RevisedLinePolishRequest, signal?: AbortSignal): Promise<string | null> {
  try {
    const response = await fetch("/api/revise-line", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal,
    });
    if (!response.ok) return null;
    const body = await response.json().catch(() => null);
    return typeof body?.line === "string" ? body.line : null;
  } catch {
    return null;
  }
}
