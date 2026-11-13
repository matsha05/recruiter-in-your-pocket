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

/**
 * Where a quote is on the resume, when its last word may be cut short. The model's limit can close a quote inside
 * a word: a live report of November 13, 2026 quoted a bullet as far as "executive leadership and key bu". A resume
 * has no such word, so the quote read as not on the page, the draft was refused, the person waited through a
 * second draft, and that draft dropped the card. A quote that isn't found is looked for again without its last
 * word, and stands when that finds one line and the line carries the quote character for character, cut word
 * and all. The quote that comes back ends on a whole word.
 */
export function locateQuote(quote: string, resumeText: string): { quote: string; resolved: LineResolution } {
  const resolved = resolveCardLine(quote, resumeText);
  if (resolved.status !== "missing") return { quote, resolved };
  const whole = quote.replace(/\s+\S*$/u, "");
  if (whole === quote) return { quote, resolved };
  const again = resolveCardLine(whole, resumeText);
  const copied = again.status === "resolved" && again.line.includes(canonicalSourceIdentity(quote));
  return copied ? { quote: whole, resolved: again } : { quote, resolved };
}

const ABBREVIATION = /(?:\b(?:e\.g|i\.e|etc|vs|inc|ltd|co|corp|sr|jr|dr|mr|ms|mrs|st|no|approx|dept)|\b\p{Lu})\.$/iu;
/** A bullet's mark. A file read can put two bullets on one line, so the mark ends a sentence wherever it sits. */
const BULLET_MARKS = "•●◦▪▫‣⁃";

/** Where each sentence of a line ends, the line's own end included. */
function sentenceEnds(line: string) {
  const ends: number[] = [line.length];
  for (const match of line.matchAll(new RegExp(`[.!?]["”')\\]]*(?=\\s+(?:[${BULLET_MARKS}]\\s*)?["“(\\[]?[\\p{Lu}\\d])`, "gu"))) {
    if (match[0][0] === "." && ABBREVIATION.test(line.slice(0, match.index + 1))) continue;
    ends.push(match.index + match[0].length);
  }
  for (const match of line.matchAll(new RegExp(`\\s+[${BULLET_MARKS}](?=\\s)`, "gu"))) ends.push(match.index);
  return ends.sort((a, b) => a - b);
}

/**
 * Whether a quote that starts at `start` may stop at this index: at the end of the line, on a mark that ends a
 * sentence, or just before a mark that closes a clause, and never inside a parenthesis it opened. A point inside
 * a number or a name ("3.5", "Node.js") and the point of an abbreviation close nothing.
 */
function isClauseBreak(line: string, start: number, index: number) {
  if (index <= start || /\s/u.test(line[index - 1])) return false;
  const quoted = line.slice(start, index);
  if ((quoted.match(/\(/gu) ?? []).length > (quoted.match(/\)/gu) ?? []).length) return false;
  if (index === line.length) return true;
  const rest = line.slice(index);
  if (/[.!?]["”')\]]*$/u.test(quoted) && /^\s/u.test(rest)) return !ABBREVIATION.test(quoted);
  return new RegExp(`^(?:[,;:](?=\\s)|\\s+[(–—${BULLET_MARKS}]|\\s+-\\s)`, "u").test(rest);
}

/** Where the sentence holding `index` starts: at the line's first word, or past the sentence and bullet mark before it. */
function sentenceStart(line: string, index: number) {
  const previous = sentenceEnds(line).filter((end) => end <= index).pop() ?? 0;
  const lead = line.slice(previous).match(new RegExp(`^[\\s${BULLET_MARKS}*–—-]*`, "u"))?.[0].length ?? 0;
  return Math.min(previous + lead, index);
}

/** Where the quote sits on the line: the one place it stands as whole words. */
function quoteStart(line: string, quote: string) {
  const edge = /[\p{L}\p{M}\p{N}]/u;
  for (let start = line.indexOf(quote); start !== -1; start = line.indexOf(quote, start + 1)) {
    const before = start === 0 ? "" : line[start - 1];
    const after = line[start + quote.length] ?? "";
    if (!edge.test(before) && !edge.test(after)) return start;
  }
  return -1;
}

/**
 * The quote for a resume line longer than the model can quote whole (a long bullet, or a summary or an About
 * section pasted as one paragraph). The model quotes a bounded part of such a line, and its limit can land
 * mid-sentence at either end: the quote stops short, or it starts partway in so that it reaches the end.
 *
 * Its end: a quote that stops at a break, the end of a sentence or of a clause, is left alone, since what comes
 * before a clause break reads as a statement. One that stops anywhere else runs on to the end of its sentence.
 * When that is too long to show, the end moves to the nearest clause break: forward when that fits, back when
 * that keeps at least half of the quote. With no break to move to, the end stands.
 *
 * Its start: a quote that begins where a sentence begins is left alone, so one sentence of several stays the one
 * the model chose. One that begins partway into a sentence ("achieving a 300% reduction…") goes back to the
 * start of that sentence when the result fits, since what follows a clause break rarely reads without what came
 * before it. When it doesn't fit, the start stands.
 *
 * The result is always text from the line, in one piece.
 */
export function quoteWithinLine(quote: string, line: string, max: number) {
  const identity = canonicalSourceIdentity(quote);
  const start = identity ? quoteStart(line, identity) : -1;
  if (start === -1) return quote;
  const end = quoteEnd(line, start, start + identity.length, max);
  const from = sentenceStart(line, start);
  return line.slice(end - from <= max ? from : start, end).trim();
}

/** Where a quote that sits at `start`..`end` of the line should stop. */
function quoteEnd(line: string, start: number, end: number, max: number) {
  if (isClauseBreak(line, start, end)) return end;
  const sentenceEnd = sentenceEnds(line).find((value) => value >= end) ?? line.length;
  if (sentenceEnd - start <= max) return sentenceEnd;
  for (let index = end + 1; index <= line.length && index - start <= max; index += 1) {
    if (isClauseBreak(line, start, index)) return index;
  }
  for (let index = end - 1; index - start >= (end - start) / 2; index -= 1) {
    if (isClauseBreak(line, start, index)) return index;
  }
  return end;
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
