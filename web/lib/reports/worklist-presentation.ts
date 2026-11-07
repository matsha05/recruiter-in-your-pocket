import type { WorklistCard, WorklistReport } from "../llm/worklist-schema";
import { canonicalSourceIdentity } from "../llm/source-fidelity";
import type { StoredLineAnswer, StoredLineAnswers } from "./line-answers";

/**
 * What the worklist report shows and says, apart from the model's words: the example's blanks and how
 * the person's answers fill them, the headings, and the re-check comparison. Pure functions, shared by
 * the web report and the PDF so both print the same line.
 */

export type ExampleSegment = { kind: "text"; text: string } | { kind: "blank"; label: string; index: number };

/** The example split into its text and its bracketed blanks, in order. */
export function exampleSegments(example: string): ExampleSegment[] {
  const segments: ExampleSegment[] = [];
  let index = 0;
  let last = 0;
  for (const match of example.matchAll(/\[([^\]]*)\]/gu)) {
    const start = match.index ?? 0;
    if (start > last) segments.push({ kind: "text", text: example.slice(last, start) });
    segments.push({ kind: "blank", label: match[1].trim(), index });
    index += 1;
    last = start + match[0].length;
  }
  if (last < example.length) segments.push({ kind: "text", text: example.slice(last) });
  return segments;
}

export function blankLabels(example: string): string[] {
  return exampleSegments(example).flatMap((segment) => (segment.kind === "blank" ? [segment.label] : []));
}

/** An answer per blank, by position; empty strings for blanks left open. */
export type BlankAnswers = string[];

function clean(value: string | undefined) {
  return (value || "").replace(/\s+/gu, " ").trim();
}

/** The example with every answered blank filled, or null while any blank is open. Punctuation stays the example's. */
export function composeExample(example: string, answers: BlankAnswers): string | null {
  const segments = exampleSegments(example);
  let out = "";
  for (const segment of segments) {
    if (segment.kind === "text") {
      out += segment.text;
      continue;
    }
    const answer = clean(answers[segment.index]);
    if (!answer) return null;
    out += answer;
  }
  return out.replace(/\s+([,.;:])/gu, "$1").replace(/\s{2,}/gu, " ").trim();
}

/** Whether a card has something for the person to fill in. */
export function cardHasBlanks(card: Pick<WorklistCard, "example">) {
  return blankLabels(card.example).length > 0;
}

/** The cards that need work: everything but the keep card. */
export function workCards(report: Pick<WorklistReport, "cards">) {
  return report.cards.filter((card) => card.kind !== "keep");
}

/**
 * Stored answers for a card (`reports.line_answers`, keyed by card position): one entry per blank, the blank's
 * label as the question, so a saved report reopened elsewhere fills the same blanks.
 */
export function storedAnswersForCard(example: string, answers: BlankAnswers, left: boolean): StoredLineAnswer[] {
  return blankLabels(example).map((label, index) => {
    const text = clean(answers[index]);
    if (left) return { question: label, kind: "unknown" as const };
    return text ? { question: label, kind: "answered" as const, text } : { question: label, kind: "unknown" as const };
  }).filter((answer) => answer.kind === "answered" || left);
}

/** The blanks filled from a saved report's answers, lined up by the blank's label. */
export function blankAnswersFromStored(example: string, stored: StoredLineAnswers | undefined): { answers: BlankAnswers; left: boolean } | null {
  if (!stored) return null;
  const labels = blankLabels(example);
  const byLabel = new Map(stored.answers.map((answer) => [answer.question, answer] as const));
  const answers = labels.map((label) => {
    const found = byLabel.get(label);
    return found?.kind === "answered" ? found.text : "";
  });
  const left = labels.length > 0 && labels.every((label) => byLabel.get(label)?.kind === "unknown");
  if (!left && answers.every((answer) => !answer)) return null;
  return { answers, left };
}

/** The headings over the cards, by how many there are. */
export function cardsHeading(report: Pick<WorklistReport, "cards">): { title: string; lead: string | null } {
  const work = workCards(report).length;
  if (work === 0) {
    // No lead: the ending says "This is killer! Send it." and what else matters, so the heading stays plain.
    return { title: "Nothing here needs work.", lead: null };
  }
  return { title: "Lines that need work.", lead: "Top to bottom, the way a recruiter reads." };
}

/** The line under the cards. Only when the page has lines the cards didn't list. */
export const UNLISTED_LINES_NOTE = "Lines not listed are fine as written.";

/** The label on a card: the model's `where`, with the keep card named as such. */
export function cardLabel(card: Pick<WorklistCard, "kind" | "where">) {
  return card.kind === "keep" ? "Don't touch this one" : card.where;
}

/** "3 of 12": the card's place among the cards that need work, once there are enough to lose count of. */
export function cardPosition(cards: ReadonlyArray<Pick<WorklistCard, "kind">>, index: number): string | null {
  const work = cards.map((card, i) => ({ card, i })).filter(({ card }) => card.kind !== "keep");
  if (work.length < 3 || cards[index]?.kind === "keep") return null;
  const position = work.findIndex(({ i }) => i === index);
  return position === -1 ? null : `${position + 1} of ${work.length}`;
}

export const KEEP_SECONDARY_LABEL = "Write the others like it.";

/** The role the header row names for a worklist report: the first fit role. */
export function worklistTargetRole(report: Pick<WorklistReport, "fit">) {
  return report.fit.roles.find((role) => role.trim())?.trim() || null;
}

/**
 * Whether the report keeps a fit section after the cards: only without a posting, for where else the experience
 * points. With a posting, its fit is in the first pass (Nov 7, 2026).
 */
export function hasRoleSection(report: Pick<WorklistReport, "fit">) {
  return !report.fit.posting.summary && Boolean(report.fit.note || report.fit.roles.length > 0);
}

/** Headings for the fit section, with and without a posting. */
export function fitHeading(report: Pick<WorklistReport, "fit">) {
  return report.fit.posting.summary ? "How your experience fits this role." : "Roles your experience points toward.";
}

export const POSTING_MISSING_LABEL = "What the posting asks for that your resume doesn't show";
/**
 * Under the missing list (the first-read wave, Nov 7, 2026): recruiters read a resume that mirrors a posting's
 * words as generic or worse, so the list is questions to answer, never keywords to paste.
 */
export const POSTING_MISSING_HOW = "If you've done it, say where. If you haven't, leave it out.";

/**
 * The job the score was judged for and the level a recruiter would put the person at (prompt FIT, Nov 7, 2026):
 * the first thing a recruiter decides, so it sits with the score instead of under the cards. With a posting,
 * the posting's title is the second role.
 */
export function worklistReadFor(report: Pick<WorklistReport, "fit">) {
  const roles = report.fit.roles.map((role) => role.trim()).filter(Boolean);
  const hasPosting = Boolean(report.fit.posting.summary);
  return {
    role: roles[0] || null,
    level: report.fit.level.trim() || null,
    postingRole: hasPosting ? roles[1] || null : null,
    hasPosting,
  };
}

/**
 * The level as the first pass shows it: the level itself, then the fact on the resume that sets it. The prompt
 * writes "senior, leads projects, no direct reports", so the first clause is the answer and the rest the reason.
 */
export function worklistLevelParts(level: string | null) {
  const text = (level || "").trim();
  if (!text) return null;
  const comma = text.indexOf(",");
  const head = (comma === -1 ? text : text.slice(0, comma)).trim();
  const rest = comma === -1 ? "" : text.slice(comma + 1).trim();
  const cap = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
  return { level: cap(head), because: rest ? `${cap(rest).replace(/[.;,]+$/u, "")}.` : null };
}

// ---- Text written to screening software (lib/reports/screener-text.ts) ----

type ScreenerKind = NonNullable<WorklistReport["screener_text"]>[number]["kind"];

export function screenerTitle(many: boolean) {
  return many ? "Take these out before you send it." : "Take this out before you send it.";
}
const SCREENER_WHAT: Record<ScreenerKind, string> = {
  instruction: "This line is written to AI screening software, not to a person.",
  score: "This is a score written for screening software to read back.",
  posting_copy: "This is the posting's own text, pasted into your resume.",
  keyword_repeat: "This is a keyword list repeated for a scanner.",
};
/** What a finding is, then why it matters; the same sentence for every kind. */
export function screenerNote(kind: ScreenerKind, many: boolean) {
  if (many) {
    return "These lines are written to screening software, not to a person. They may be set in white, so you might not see them in your file. Screening software reads them as plain text, so a recruiter sees them too, and they're the lines they remember.";
  }
  return `${SCREENER_WHAT[kind]} It may be set in white, so you might not see it in your file. Screening software reads it as plain text, so a recruiter sees it too, and it's the line they remember.`;
}

// ---- The re-check (two worklist reports on the same resume) ----

export interface WorklistComparison {
  /** Lines carded last time and not this time. */
  gone: WorklistCard[];
  /** Lines carded both times. */
  still: WorklistCard[];
  /** Lines carded this time that weren't last time. */
  added: WorklistCard[];
  delta: number | null;
  title: string;
  intro: string;
  sum: string | null;
}

function cardKey(card: WorklistCard) {
  return card.kind === "line" || card.kind === "keep" ? canonicalSourceIdentity(card.line) : `${card.kind}:${canonicalSourceIdentity(card.line)}`;
}

/**
 * Compares two worklist reports on one resume the way a person would: which of the lines they worked on
 * are off the list, which are still there, and how far the score moved. A line that left the list is no
 * longer a card; that doesn't prove it's fixed, so the copy never says so.
 */
export function compareWorklists(previous: WorklistReport, current: WorklistReport): WorklistComparison {
  const before = workCards(previous);
  const after = workCards(current);
  const afterKeys = new Set(after.map(cardKey));
  const beforeKeys = new Set(before.map(cardKey));
  const gone = before.filter((card) => !afterKeys.has(cardKey(card)));
  const still = before.filter((card) => afterKeys.has(cardKey(card)));
  const added = after.filter((card) => !beforeKeys.has(cardKey(card)));
  const delta = current.score - previous.score;
  const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
  let title: string;
  let intro: string;
  if (before.length === 0 && after.length === 0) {
    title = "Still nothing that needs work.";
    intro = "Both versions came back clean.";
  } else if (gone.length === 0) {
    title = "The same lines are on the list.";
    intro = "None of them came off the list this time. Let's start with the first one again.";
  } else if (still.length === 0 && added.length === 0) {
    title = before.length === 1 ? "The line you worked on is off the list." : "Every line you worked on is off the list.";
    intro = "Nothing in this version needs work now.";
  } else {
    title = `${count(gone.length, "line is", "lines are")} off the list.`;
    intro = [
      still.length > 0 ? `${count(still.length, "is", "are")} still there.` : null,
      added.length > 0 ? `${count(added.length, "new one came", "new ones came")} up.` : null,
    ].filter(Boolean).join(" ");
  }
  // One earned exclamation point on a real win (Matt, November 6, 2026); never on a drop.
  const sum = delta === 0 ? null : delta > 0 ? `Up ${delta} since last time. That's the right direction!` : `Down ${Math.abs(delta)} since last time.`;
  return { gone, still, added, delta, title, intro, sum };
}
