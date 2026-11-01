/**
 * The Critical Miss "answer to revised line" interaction (plan item 2.2).
 *
 * The revised line is the candidate's original line plus their own answers,
 * word for word. Nothing is paraphrased, so the only words we contribute are
 * punctuation, and the existing fabrication guard (`resolveRewriteCopyPolicy`)
 * still has to pass before Copy turns on. A model-polished line would read
 * better but fails that guard (see docs/launch-readiness/71-signature-report-spec.md).
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

export type RevisedLinePolicy = RewriteCopyPolicy & {
  /** The line is the resume line and the answers, unedited. */
  composed: boolean;
  /** Numbers, names or claims in an edited line that aren't in the line or the answers. */
  newFacts: string[];
};

const isRelationshipIssue = (issue: RewriteCopyPolicy["issues"][number]) => (
  issue.code === "unsupported_content" && /relationship binding|direction binding/u.test(issue.detail)
);

function factsIn(issue: RewriteCopyPolicy["issues"][number]) {
  return issue.detail.replace(/^unsupported (?:bracket )?facts:\s*/u, "").split(/,\s*/u).filter(Boolean);
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
  if (!input.line.trim()) return { copyable: false, reason: "unsafe", issues: [], composed: false, newFacts: [] };
  const source = liftSourceLine(input.excerpt, input.resumeText);
  const composed = composeRevisedLine(source.line, input.answers) === input.line;
  const policy = resolveRewriteCopyPolicy({
    sourceText: source.full ? input.resumeText : source.line,
    original: source.line,
    draft: input.line,
    verifiedFacts: answeredValues(input.answers).map((value, index) => ({ key: `answer-${index + 1}`, value })),
  });
  if (policy.copyable || policy.reason !== "unsafe") return { ...policy, composed, newFacts: [] };
  if (composed) {
    return policy.issues.every(isRelationshipIssue)
      ? { copyable: true, reason: "ready", issues: [], composed, newFacts: [] }
      : { ...policy, composed, newFacts: [] };
  }
  const newFacts = policy.issues.filter((issue) => issue.code === "unsupported_fact").flatMap(factsIn);
  return newFacts.length === 0
    ? { copyable: true, reason: "ready", issues: [], composed, newFacts }
    : { ...policy, composed, newFacts };
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
