/**
 * The Critical Miss "answer to revised line" interaction (plan item 2.2).
 *
 * The revised line is the candidate's original line plus their own answers,
 * word for word. Nothing is paraphrased, so the only words we contribute are
 * punctuation, and the existing fabrication guard (`resolveRewriteCopyPolicy`)
 * still has to pass before Copy turns on. A model-polished line would read
 * better but fails that guard (see docs/launch-readiness/72-signature-report-spec.md).
 *
 * Like the integrity pass, this never writes new prose: questions are split or
 * trimmed model text, and the line is the candidate's text.
 */

import { observationTokens } from "./observation-tokens";
import { resolveRewriteCopyPolicy, type RewriteCopyPolicy } from "./report-presentation";
import { canonicalSourceIdentity, resolveUniqueSourceLine } from "../llm/source-fidelity";

export const MAX_LIFT_QUESTIONS = 3;

/** What the candidate said about one question. */
export type LiftAnswer =
  | { kind: "open" }
  | { kind: "answered"; value: string }
  | { kind: "unknown" }
  | { kind: "not_mine" };

export type LiftState = "open" | "addressed" | "partly" | "unknown" | "not_mine";

const questionStart = /^(?:who|what|which|how|where|when|why|did|do|does|was|were|is|are|can)\b/iu;

function sentenceCase(value: string) {
  return value.charAt(0).toLocaleUpperCase() + value.slice(1);
}

/**
 * One question per input. A compound model question ("Which report did you
 * prepare, and who used it?") becomes two when both halves are questions.
 */
export function liftQuestions(questions: readonly string[], max = MAX_LIFT_QUESTIONS): string[] {
  const out: string[] = [];
  for (const raw of questions) {
    const question = raw.trim();
    if (!question) continue;
    const split = question.match(/^(.+?),\s+and\s+(.+\?)$/u);
    if (split && questionStart.test(split[1]) && questionStart.test(split[2])) {
      out.push(`${split[1].trim()}?`, sentenceCase(split[2].trim()));
    } else {
      out.push(question.endsWith("?") ? question : `${question}?`);
    }
  }
  const seen = new Set<string>();
  return out.filter((question) => {
    const key = question.toLocaleLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, max);
}

/**
 * The fix as a margin note. Beside its own line, "In the BrightWave recruitment
 * bullet," only repeats what the reader can see, so the locator clause goes.
 */
export function marginNoteFromFix(fix: string): string {
  const trimmed = fix.trim();
  const withoutLocator = trimmed.replace(
    /^In (?:the|your) [^,]{1,80}?\b(?:bullet|line|entry|role|section|summary|headline)s?,\s+/iu,
    "",
  );
  return withoutLocator === trimmed ? trimmed : sentenceCase(withoutLocator);
}

/** The full resume line when the resume is here, otherwise the quoted excerpt. */
export function liftSourceLine(excerpt: string, resumeText?: string) {
  const resolved = resolveUniqueSourceLine(excerpt, resumeText);
  if (resolved.status === "resolved") return { line: resolved.line, full: true };
  return { line: canonicalSourceIdentity(excerpt), full: false };
}

function cleanAnswer(value: string) {
  return value.trim().replace(/\s+/gu, " ").replace(/[.;,:\s]+$/u, "");
}

export function answeredValues(answers: readonly LiftAnswer[]) {
  return answers.flatMap((answer) => (
    answer.kind === "answered" && cleanAnswer(answer.value) ? [cleanAnswer(answer.value)] : []
  ));
}

/** The original line with the candidate's answers added after it, as they wrote them. */
export function composeRevisedLine(sourceLine: string, answers: readonly LiftAnswer[]): string | undefined {
  const values = answeredValues(answers);
  if (values.length === 0) return undefined;
  const base = sourceLine.trim().replace(/[.;,:\s]+$/u, "");
  return `${base}: ${values.join("; ")}.`;
}

/**
 * Why Copy is off, in terms the candidate can act on (W3: the guard names its objection).
 *
 * - `new_fact`: a number, a name or a tracked claim ("led") that is in neither the line nor an answer.
 * - `new_word`: a word that is in neither; `nearest` holds the closest word that is, when one exists
 *   ("web app" when the line says "web application").
 * - `lost_fact`: a number or name from the original line that the edit dropped.
 * - `binding`: the guard can't tell which action a metric or result in the edited line belongs to.
 * - `empty`: nothing to copy. `source`: the line can't be checked against the resume.
 */
export type RevisedLineRefusal = {
  kind: "new_fact" | "new_word" | "lost_fact" | "binding" | "empty" | "source";
  /** The offending words, in the candidate's spelling. */
  tokens: string[];
  /** For `new_word`: the word from the line or the answers each token most resembles, when any. */
  nearest?: string[];
};

export type RevisedLinePolicy = RewriteCopyPolicy & {
  /** The line is the resume line and the answers, unedited. */
  composed: boolean;
  /** Numbers, names or claims in an edited line that aren't in the line or the answers. */
  newFacts: string[];
  /** Set when `copyable` is false; absent otherwise. */
  refusal?: RevisedLineRefusal;
};

/**
 * The relationship checks (metric, direction, responsibility and unresolved bindings) refuse a quarter of
 * real fix lines unchanged, so they are waived for the exact composition, which adds words but moves none.
 */
const isBindingIssue = (issue: RewriteCopyPolicy["issues"][number]) => (
  issue.code === "unsupported_content" && /\bbinding:/u.test(issue.detail)
);

function factsIn(issue: RewriteCopyPolicy["issues"][number]) {
  return issue.detail.replace(/^unsupported (?:bracket )?facts:\s*/u, "").split(/,\s*/u).filter(Boolean);
}

function listIn(issue: RewriteCopyPolicy["issues"][number], prefix: RegExp) {
  return issue.detail.replace(prefix, "").split(/,\s*/u).map((item) => item.trim()).filter(Boolean);
}

/** The words of a line or an answer, as typed, for naming the nearest allowed word. */
function typedWords(text: string) {
  return (text.normalize("NFKC").match(/[\p{L}\p{N}][\p{L}\p{N}'’&+-]*/gu) || []);
}

/**
 * The allowed word an unsupported token most resembles: the same first four letters, or one that
 * contains the other. "app" finds "application"; "warehous" finds "warehouse"; "55" finds nothing.
 */
export function nearestAllowedWord(token: string, allowedText: string): string | undefined {
  const needle = token.toLocaleLowerCase();
  if (!/\p{L}/u.test(needle)) return undefined;
  const candidates = [...new Set(typedWords(allowedText))];
  const scored = candidates
    .map((word) => ({ word, key: word.toLocaleLowerCase() }))
    .filter(({ key }) => key !== needle && key.length >= 3 && (
      key.startsWith(needle) || needle.startsWith(key) || (needle.length >= 4 && key.slice(0, 4) === needle.slice(0, 4))
    ))
    .sort((a, b) => Math.abs(a.key.length - needle.length) - Math.abs(b.key.length - needle.length));
  return scored[0]?.word;
}

function refusalFor(issues: RewriteCopyPolicy["issues"], allowedText: string): RevisedLineRefusal {
  const newFacts = issues.filter((issue) => issue.code === "unsupported_fact").flatMap(factsIn);
  if (newFacts.length) return { kind: "new_fact", tokens: [...new Set(newFacts)] };
  const lost = issues.filter((issue) => issue.code === "dropped_fact" && issue.detail.startsWith("dropped source facts"))
    .flatMap((issue) => listIn(issue, /^dropped source facts:\s*/u));
  if (lost.length) return { kind: "lost_fact", tokens: [...new Set(lost)] };
  const unsupported = issues.filter((issue) => issue.code === "unsupported_content" && issue.detail.startsWith("unsupported content"))
    .flatMap((issue) => listIn(issue, /^unsupported content:\s*/u));
  if (unsupported.length) {
    const tokens = [...new Set(unsupported)];
    const nearest = tokens.map((token) => nearestAllowedWord(token, allowedText)).filter((word): word is string => Boolean(word));
    return { kind: "new_word", tokens, ...(nearest.length ? { nearest: [...new Set(nearest)] } : {}) };
  }
  if (issues.some(isBindingIssue)) return { kind: "binding", tokens: [] };
  const droppedContent = issues.filter((issue) => issue.code === "dropped_fact").flatMap((issue) => listIn(issue, /^dropped source content:\s*/u));
  if (droppedContent.length) return { kind: "lost_fact", tokens: [...new Set(droppedContent)] };
  if (issues.some((issue) => issue.code.startsWith("source_"))) return { kind: "source", tokens: [] };
  return { kind: "binding", tokens: [] };
}

/** The sentence under the line when Copy is off. Every message ends on what to do; none suggests adding anything untrue. */
export function describeRefusal(refusal: RevisedLineRefusal | undefined): string {
  if (!refusal) return "";
  const quote = (tokens: string[]) => tokens.map((token) => `“${token}”`).join(", ");
  switch (refusal.kind) {
    case "new_fact":
      return `${quote(refusal.tokens)} isn't in your line or your answers. If it's true, add it as an answer first.`;
    case "new_word":
      return refusal.nearest?.length
        ? `${quote(refusal.tokens)} isn't in your line or your answers, but ${quote(refusal.nearest)} is. Use the word you wrote, or add the new one as an answer.`
        : `${quote(refusal.tokens)} isn't in your line or your answers. Use the words you wrote, or add it as an answer.`;
    case "lost_fact":
      return `${quote(refusal.tokens)} from your line is missing. Put it back, or keep the line as it was.`;
    case "binding":
      return "We can't tell which part of your line the new words belong to. Use my exact words, or add them as an answer.";
    case "source":
      return "This line can't be checked against your resume here. Paste your resume back in to work on it.";
    case "empty":
    default:
      return "";
  }
}

/**
 * Copy turns on only when the facts are real: every number, name and claim comes
 * from the resume line or the candidate's answers, checked by the existing guard.
 *
 * - The unedited composition passes the guard with one waiver. Its relationship
 *   check stops a rewrite from attaching a metric to a different action, and it
 *   refuses lines it can't parse (about a quarter of real fix lines, unchanged).
 *   Nothing here was rewritten, so that check is waived for the exact composition.
 * - An edited line may reword freely, but a new fact (a number, a name, a claim
 *   like "led") has to arrive through an answer first.
 *
 * Without the resume, the quoted excerpt stands in as the source, since the
 * report already checked it against the resume.
 */
export function revisedLinePolicy(input: {
  resumeText?: string;
  excerpt: string;
  line: string;
  answers: readonly LiftAnswer[];
}): RevisedLinePolicy {
  if (!input.line.trim()) return { copyable: false, reason: "unsafe", issues: [], composed: false, newFacts: [], refusal: { kind: "empty", tokens: [] } };
  const source = liftSourceLine(input.excerpt, input.resumeText);
  const values = answeredValues(input.answers);
  const composed = composeRevisedLine(source.line, input.answers) === input.line;
  const policy = resolveRewriteCopyPolicy({
    sourceText: source.full ? input.resumeText : source.line,
    original: source.line,
    draft: input.line,
    verifiedFacts: values.map((value, index) => ({ key: `answer-${index + 1}`, value })),
  });
  if (policy.copyable) return { ...policy, composed, newFacts: [] };
  const allowedText = [source.line, ...values].join("\n");
  if (policy.reason !== "unsafe") {
    return { ...policy, composed, newFacts: [], refusal: policy.reason === "source_unavailable" ? { kind: "source", tokens: [] } : { kind: "new_fact", tokens: [] } };
  }
  if (composed) {
    // Nothing was moved or reworded, so only the binding checks can fire, and they are waived.
    return policy.issues.every(isBindingIssue)
      ? { copyable: true, reason: "ready", issues: [], composed, newFacts: [] }
      : { ...policy, composed, newFacts: [], refusal: refusalFor(policy.issues, allowedText) };
  }
  // An edit may reword, reorder and drop words freely; only a new protected fact (a number, a name, a
  // tracked claim such as "led") has to arrive through an answer first.
  const blocking = policy.issues.filter((issue) => issue.code === "unsupported_fact");
  if (blocking.length === 0) return { copyable: true, reason: "ready", issues: [], composed, newFacts: [] };
  const refusal = refusalFor(blocking, allowedText);
  return { ...policy, composed, newFacts: refusal.tokens, refusal };
}

/** Whether a written answer is still in the line (the candidate may have edited it). */
export function answerInLine(answer: string, line: string) {
  const answerTokens = observationTokens(answer);
  if (answerTokens.size === 0) return false;
  const lineTokens = observationTokens(line);
  let present = 0;
  for (const token of answerTokens) if (lineTokens.has(token)) present += 1;
  return present / answerTokens.size >= 0.6;
}

/**
 * "Addressed" means the line now carries the fact the Critical Miss asked for:
 * every question the candidate could answer is answered in the line.
 */
export function liftState(answers: readonly LiftAnswer[], line?: string): LiftState {
  if (answers.length === 0 || answers.some((answer) => answer.kind === "open")) return "open";
  if (answers.every((answer) => answer.kind === "not_mine")) return "not_mine";
  const written = answers.filter((answer): answer is Extract<LiftAnswer, { kind: "answered" }> => answer.kind === "answered");
  if (written.length === 0) return "unknown";
  const carried = line ? written.filter((answer) => answerInLine(answer.value, line)).length : 0;
  if (carried === 0) return "open";
  return carried === written.length && answers.every((answer) => answer.kind !== "unknown") ? "addressed" : "partly";
}
