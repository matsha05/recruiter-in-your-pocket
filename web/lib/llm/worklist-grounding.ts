import { canonicalizeUserSourceText } from "../security/inputSanitization";
import { canonicalSourceIdentity, resolveUniqueSourceLine } from "./source-fidelity";
import { isCommonCapitalizedWord } from "./source-semantic-patterns";

/**
 * Mechanical grounding for the worklist report (brief decision 15: few principles in the prompt, a strict
 * validator). Three checks, each of which refuses a draft:
 *
 * 1. A card's quoted line is on the resume, in one piece, once.
 * 2. Every number and every name in an example sits either on the resume or inside a bracket.
 * 3. An example keeps the line's level of ownership: "helped" never becomes "led".
 *
 * Plus the phrase list the prompt no longer carries (decision 14). "Critical Miss", the name Matt retired on
 * November 5, refuses the draft. "The read", the other retired name, is rewritten to "the first pass" by the
 * validator instead: on the November 5 live set the model wrote it in passing in 11 of 47 drafts ("slows the
 * read"), and a repair call for an idiom is a second model call the person waits for.
 */

/** The one retired phrase the validator rewrites rather than refuses. */
export function replaceRetiredIdiom(value: string) {
  return value.replace(/\bthe read\b(?!\s*(?:the|a|an|your|this|that|it|them)\b)/giu, (match) => (match[0] === "T" ? "The first pass" : "the first pass"));
}

export const WORKLIST_BANNED_PHRASES = [
  "critical miss",
  "proven track record",
  "leveraging expertise",
  "strategic initiatives",
  "driving results",
  "operational excellence",
  "strong experience",
  "seasoned professional",
  "solid experience",
  "high-impact",
  "effective communicator",
  "cited bullet",
  "cited line",
  "role-level signal",
  "personal mechanism",
  "material gap",
  "harder to place",
  "your strongest pattern is",
  "the strongest pattern is",
  "your clearest pattern is",
  "your clearest strength is",
  "the open question is",
  "the unresolved question is",
  "the page supports",
  "the page currently supports",
  "the evidence supports",
  "the page establishes",
  "there is a credible story",
  "you read as",
  "the candidate",
] as const;

export function bannedPhrasesIn(value: string): string[] {
  const lowered = value.toLowerCase();
  return WORKLIST_BANNED_PHRASES.filter((phrase) => lowered.includes(phrase));
}

/** The text outside square brackets: what an example asserts as fact. */
export function outsideBrackets(value: string) {
  return value.replace(/\[[^\]]*\]/gu, " ");
}

/** Every bracketed blank in an example, in order, without the brackets. */
export function blanksOf(value: string): string[] {
  return Array.from(value.matchAll(/\[([^\]]*)\]/gu), (match) => match[1].trim()).filter(Boolean);
}

const NUMBER = /(?<![\p{L}\p{N}])[$€£¥₹]?\d[\d,]*(?:\.\d+)?(?:\s*%|\s*[kKmMbBxX](?![\p{L}]))?\+?(?![\p{L}\p{N}])/gu;

function numbersIn(value: string) {
  return Array.from(value.matchAll(NUMBER), (match) => match[0].trim());
}

/** Numbers in the resume as a set of canonical tokens ("1,200" and "1200" are the same number). */
function numberKey(value: string) {
  return value.toLowerCase().replace(/[\s,]/gu, "").replace(/^[$€£¥₹]/u, "").replace(/\+$/u, "");
}

const WORD = /[\p{L}][\p{L}\p{M}\d'’.&+#/-]*/gu;
/** Words a dated line uses that are never a name. */
const DATE_WORDS = new Set(["Present", "Current", "Today", "Now", "Ongoing"]);
const SENTENCE_START = /(?:^|[.!?;:]\s+|["“(]\s*)$/u;

/**
 * Names in a text: capitalized words that are not at a sentence start and are not ordinary capitalized
 * words (months, titles, common nouns). Acronyms count wherever they sit.
 */
function namesIn(value: string) {
  const names: string[] = [];
  for (const match of value.matchAll(WORD)) {
    const token = match[0].replace(/[.,;:'’]+$/u, "");
    if (token.length < 2 || !/^\p{Lu}/u.test(token)) continue;
    if (isCommonCapitalizedWord(token) || DATE_WORDS.has(token)) continue;
    const acronym = /^[A-Z][A-Z0-9.&+#/-]+$/u.test(token) && token.length >= 2;
    const before = value.slice(0, match.index);
    const sentenceStart = SENTENCE_START.test(before) || before.trim() === "";
    if (sentenceStart && !acronym) continue;
    names.push(token);
  }
  return names;
}

function normalizedSource(sourceText: string) {
  return canonicalizeUserSourceText(sourceText).toLowerCase();
}

export interface ExampleGroundingIssue {
  kind: "number" | "name";
  token: string;
}

/**
 * Numbers and names an example states outside its brackets that the resume (and the quoted line) do not
 * contain. Each one is an invented fact.
 */
export function ungroundedTokensInExample(example: string, resumeText: string, line = ""): ExampleGroundingIssue[] {
  const asserted = outsideBrackets(example);
  const source = normalizedSource(`${resumeText}\n${line}`);
  const sourceNumbers = new Set(numbersIn(source).map(numberKey));
  const issues: ExampleGroundingIssue[] = [];
  for (const number of numbersIn(asserted)) {
    if (!sourceNumbers.has(numberKey(number))) issues.push({ kind: "number", token: number });
  }
  for (const name of namesIn(asserted)) {
    if (!source.includes(name.toLowerCase())) issues.push({ kind: "name", token: name });
  }
  return issues;
}

const SUPPORT_VERBS = /\b(?:helped|assisted|supported|contributed|participated|aided)\b/iu;
const OWNERSHIP_VERBS = /\b(?:led|owned|drove|managed|spearheaded|directed|headed|ran)\b/iu;

/** Whether an example lifts a support verb on the line into an ownership verb outside its brackets. */
export function inflatesOwnership(line: string, example: string) {
  if (!SUPPORT_VERBS.test(line) || OWNERSHIP_VERBS.test(line)) return false;
  return OWNERSHIP_VERBS.test(outsideBrackets(example));
}

export type LineResolution =
  | { status: "resolved"; line: string }
  | { status: "missing" | "ambiguous" | "unavailable" };

/** Where a card's quoted line is on the resume: one line, once. */
export function resolveCardLine(line: string, resumeText: string): LineResolution {
  const resolved = resolveUniqueSourceLine(line, resumeText);
  if (resolved.status === "resolved") return { status: "resolved", line: resolved.line };
  if (resolved.status === "ambiguous") return { status: "ambiguous" };
  if (resolved.status === "unavailable") return { status: "unavailable" };
  return { status: "missing" };
}

/** Two cards on the same resume line. */
export function sameCardLine(a: string, b: string) {
  return canonicalSourceIdentity(a) === canonicalSourceIdentity(b);
}

/**
 * A structure or dates card states a fact in the report's words; the dates and numbers in it must still
 * come from the page.
 */
export function ungroundedTokensInStatement(statement: string, resumeText: string): ExampleGroundingIssue[] {
  return ungroundedTokensInExample(statement, resumeText).filter((issue) => issue.kind === "number");
}

export function sourceTagLeak(value: string) {
  return /\[?SOURCE_\d{3}\]?/iu.test(value);
}
