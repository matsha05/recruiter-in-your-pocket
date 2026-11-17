import { QUOTED_KINDS, WORK_KINDS, type WorklistCard, type WorklistReport } from "../llm/worklist-schema";
import { canonicalSourceIdentity } from "../llm/source-fidelity";
import { scoreMoved } from "../score-utils";
import type { StoredLineAnswer, StoredLineAnswers } from "./line-answers";
import { reportDocumentKind, type ReportDocumentKind } from "./report-document";

/**
 * The report's fixed words, by what it was written about. A LinkedIn profile review (Nov 10, 2026) is the same
 * report with the profile named where the resume was, and without the two things a profile doesn't have: a
 * posting to read it against, and a moment it gets sent.
 */
export interface ReportWording {
  cardsTitle: string;
  cardsLead: string;
  nothingTitle: string;
  unlisted: string;
  upgradesLeadClean: string;
  factsNote: string;
  leftBlank: string;
  readyEnding: string;
  readyNote: string;
  addressed: (count: number) => string;
  firstPassLabel: string;
  header: string;
  scoreNote: string;
  /** What the source file leaves out, said once under the cards. Only a profile export has one. */
  sourceLimits: string | null;
  /**
   * The one thing the export can't show that we still have a view on (Matt, Nov 10, 2026: the public Open to Work
   * frame isn't helping candidates). Advice, labelled as ours, with no number: recruiters disagree about the
   * frame, and LinkedIn's own figures count messages, not hires.
   */
  sourceAdvice: string | null;
  /** The section after the cards: where the experience points (a resume), or the words a recruiter would search (a profile). */
  fitTitle: string;
  fitListLabel: string;
  /** With a posting: what it asks for that isn't here, and what is here but buried. */
  postingMissingLabel: string;
  postingMissingHow: string;
  postingLeadLabel: string;
  postingLeadHow: string;
}

const RESUME_WORDING: ReportWording = {
  cardsTitle: "Lines that need work.",
  cardsLead: "Top to bottom, the way a recruiter reads.",
  nothingTitle: "Nothing here needs work.",
  unlisted: "Lines not listed are fine as written.",
  upgradesLeadClean: "Your resume probably isn't what stands between you and the call now. Who can refer you, and which jobs you aim at, matter more. If you want it even stronger, start here.",
  factsNote: "Every fact in it is from your resume or your answers.",
  leftBlank: "Left blank, and that's fine. Not every line needs every detail. Let's make sure the rest of your resume gives a recruiter something to grab onto.",
  readyEnding: "This is killer! Send it.",
  readyNote: "Every line says what you did and what changed, so your resume won't be the reason you don't get the call. Read it against the posting you're going for, and look at whether anyone can bring you in.",
  addressed: (count) => `${count > 1 ? "Your lines are ready. Drop them" : "Your line is ready. Drop it"} into your resume and see what changed.`,
  firstPassLabel: "The job your resume was read for",
  header: "Your resume report",
  scoreNote: "The band is what a recruiter would do with your resume after one pass. The number says where in the band you sit. Neither predicts interviews or offers.",
  sourceLimits: null,
  sourceAdvice: null,
  fitTitle: "Roles your experience points toward.",
  fitListLabel: "Roles to consider",
  postingMissingLabel: "What the posting asks for that your resume doesn't show",
  postingMissingHow: "If you've done it, say where. If you haven't, leave it out.",
  postingLeadLabel: "Move these up for this posting",
  postingLeadHow: "They're already on your resume, further down than this posting needs.",
};

const PROFILE_WORDING: ReportWording = {
  cardsTitle: "Parts of your profile that need work.",
  cardsLead: "Top to bottom, the way your profile is laid out.",
  nothingTitle: "Nothing here needs work.",
  unlisted: "Parts not listed are fine as written.",
  upgradesLeadClean: "Your profile probably isn't what stands between you and a recruiter's message now. Who can refer you, and which jobs you go after, matter more. If you want it even stronger, start here.",
  factsNote: "Every fact in it is from your profile or your answers.",
  leftBlank: "Left blank, and that's fine. Not every part needs every detail. Let's make sure the rest of your profile gives a recruiter something to grab onto.",
  readyEnding: "This is killer! There's nothing left to fix.",
  readyNote: "Every part says what you do and what changed, so your profile won't be the reason a recruiter doesn't message you. Who can refer you, and which jobs you go after, matter more now.",
  addressed: (count) => `${count > 1 ? "Your lines are ready. Paste them" : "Your line is ready. Paste it"} into your profile and see what changed.`,
  firstPassLabel: "The job your profile was read for",
  header: "Your LinkedIn profile review",
  scoreNote: "The band is what a recruiter would do after landing on your profile. The number says where in the band you sit. Neither predicts messages, interviews or offers, and neither says how often you show up in a search.",
  sourceLimits: "LinkedIn's PDF leaves out your photo, your banner, your recommendations and your full skills list, so this review says nothing about them.",
  fitTitle: "The words a recruiter would search for.",
  fitListLabel: "Titles on your profile",
  postingMissingLabel: "Words from this posting that aren't on your profile",
  postingMissingHow: "A search for this job can't match a word that isn't there. Add the ones that describe your work, and leave out the rest.",
  postingLeadLabel: "Bring these forward for this posting",
  postingLeadHow: "They're already on your profile, where a recruiter reaches them late.",
  sourceAdvice: "It also can't show whether the green Open to Work frame is on your photo. Our advice: leave the frame off and use the recruiters-only setting. Recruiters who filter for people who are looking will still see you, and your photo won't lead with the search.",
};

export function reportWording(document: ReportDocumentKind): ReportWording {
  return document === "linkedin" ? PROFILE_WORDING : RESUME_WORDING;
}

/** The wording for a report as it stands: fresh, saved or recovered. */
export function wordingFor(report: unknown): ReportWording {
  return reportWording(reportDocumentKind(report));
}

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

/** The cards that need work: not the keep card, and not an upgrade, which is optional (Nov 7, 2026). */
export function workCards(report: Pick<WorklistReport, "cards">) {
  return report.cards.filter((card) => WORK_KINDS.has(card.kind));
}

/** The optional upgrades on a resume that already works. */
export function upgradeCards(report: Pick<WorklistReport, "cards">) {
  return report.cards.filter((card) => card.kind === "upgrade");
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
    return { title: wordingFor(report).nothingTitle, lead: null };
  }
  return { title: wordingFor(report).cardsTitle, lead: wordingFor(report).cardsLead };
}

/** The line under the cards. Only when the page has lines the cards didn't list. */
export const UNLISTED_LINES_NOTE = RESUME_WORDING.unlisted;

/** The label on a card: the model's `where`, with the keep card named as such. */
export function cardLabel(card: Pick<WorklistCard, "kind" | "where">) {
  return card.kind === "keep" ? "Don't touch this one" : card.where;
}

/** "3 of 12": the card's place among the cards that need work, once there are enough to lose count of. */
export function cardPosition(cards: ReadonlyArray<Pick<WorklistCard, "kind">>, index: number): string | null {
  const work = cards.map((card, i) => ({ card, i })).filter(({ card }) => WORK_KINDS.has(card.kind));
  if (work.length < 3 || !WORK_KINDS.has(cards[index]?.kind)) return null;
  const position = work.findIndex(({ i }) => i === index);
  return position === -1 ? null : `${position + 1} of ${work.length}`;
}

export const KEEP_SECONDARY_LABEL = "Write the others like it.";
/**
 * The upgrades' own group, after the list (three reviewers, Nov 7, 2026): a strong resume keeps "Nothing here needs
 * work.", and the upgrades sit under their own heading. With nothing to fix, the lead says Matt's point, that the
 * resume probably isn't the blocker now; with lines still to fix, it says the upgrades come after them.
 */
export const UPGRADES_HEADING = "Ways to make it even better.";
export function upgradesLead(report: Pick<WorklistReport, "cards">) {
  return workCards(report).length === 0
    ? wordingFor(report).upgradesLeadClean
    : "Optional, once the lines above are done.";
}
/** An upgrade's way out: the fact may simply not exist, and that's an answer, not a gap. */
export const UPGRADE_LEAVE_LABEL = "Not true for me";

/** The role the header row names for a worklist report: the first fit role. */
export function worklistTargetRole(report: Pick<WorklistReport, "fit">) {
  return report.fit.roles.find((role) => role.trim())?.trim() || null;
}

/**
 * Whether the report keeps a fit section after the cards: only without a posting, for where else the experience
 * points. With a posting, its fit is in the first pass (Nov 7, 2026).
 */
export function hasRoleSection(report: Pick<WorklistReport, "fit">) {
  return !report.fit.posting.summary && Boolean(report.fit.note || fitListRoles(report).length > 0);
}

/**
 * The titles listed in the fit section. A resume's first title is the job it was read for, which the first pass
 * already names, so a list of one says nothing new and is left out; two or more are the directions the resume
 * points. A profile's list is the titles on the profile, shown whatever their number.
 */
export function fitListRoles(report: Pick<WorklistReport, "fit">): string[] {
  const roles = [...new Set(report.fit.roles.map((role) => role.trim()).filter(Boolean))].slice(0, 4);
  if (reportDocumentKind(report) === "linkedin") return roles;
  return roles.length > 1 ? roles : [];
}

/** Headings for the fit section, with and without a posting. */
export function fitHeading(report: Pick<WorklistReport, "fit">) {
  return report.fit.posting.summary ? "How your experience fits this role." : wordingFor(report).fitTitle;
}

/**
 * The finished lines (components/workspace/report/worklist/FinishedLines.tsx): every line the person filled in,
 * as written and as it reads now, with one button to copy them all.
 */
export function finishedLinesWording(document: "resume" | "linkedin" = "resume") {
  const profile = document === "linkedin";
  return {
    title: "Your finished lines.",
    lead: profile
      ? "Each one is your own text with your answers in, in the order your profile shows them. The blue words are the ones you added."
      : "Each one is your own line with your answers in, in resume order. The blue words are the ones you added.",
    copyOne: "Copy the line",
    copyAll: (count: number) => `Copy all ${count} lines`,
  };
}

/** The requirements table on a posting read: what the posting asks for, and the resume line that answers each. */
export const POSTING_TABLE_LABEL = "What this posting asks for";
export const POSTING_COVERED_LABEL = "Your resume answers it here";
export const POSTING_NOT_COVERED = "Not on your resume";

/** The profile's parts and how each stands (lib/llm/worklist-schema.ts, ProfilePartSchema). */
export const PARTS_LABEL = "Your whole profile, part by part";
export const PART_STATUS_LABEL: Record<"fine" | "needs_work" | "empty", string> = {
  fine: "Fine as written",
  needs_work: "Needs work",
  empty: "Nothing here yet",
};

export const POSTING_MISSING_LABEL = "What the posting asks for that your resume doesn't show";
/**
 * Under the missing list (the first-read wave, Nov 7, 2026): recruiters read a resume that mirrors a posting's
 * words as generic or worse, so the list is questions to answer, never keywords to paste.
 */
export const POSTING_MISSING_HOW = "If you've done it, say where. If you haven't, leave it out.";

/**
 * Tailoring to the posting (Nov 10, 2026): lines already on the resume that answer it and sit too low, and lines
 * it doesn't ask about, when the resume needs the room. Both are for this posting only, and neither changes a
 * word: the person moves or trims in their own file.
 */
export const POSTING_LEAD_LABEL = "Move these up for this posting";
export const POSTING_LEAD_HOW = "They're already on your resume, further down than this posting needs.";
export const POSTING_TRIM_LABEL = "Trim these first if you need the room";
export const POSTING_TRIM_HOW = "Good lines this posting doesn't ask about. Keep them for the next one.";

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
 * writes "senior, leads projects, no direct reports", so the first clause (to a comma or a semicolon) is the answer
 * and the rest the reason. When the answer only repeats the job ("Data analyst" for a Data Analyst), the cell says
 * nothing a reader can use, so it isn't shown (three reviewers, Nov 7, 2026).
 */
export function worklistLevelParts(level: string | null, role?: string | null) {
  const text = (level || "").trim();
  if (!text) return null;
  const cut = text.search(/[,;]/u);
  const head = (cut === -1 ? text : text.slice(0, cut)).trim();
  const rest = cut === -1 ? "" : text.slice(cut + 1).trim();
  const plain = (value: string) => value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  if (role && plain(head) === plain(role)) return null;
  const cap = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
  return { level: cap(head), because: rest ? `${cap(rest).replace(/[.;,]+$/u, "")}.` : null };
}

/** The posting's missing list as first shown: all of a short list; the first two of a long one (the must-haves lead). */
export function postingMissingShown(missing: string[]) {
  return missing.length > 3 ? missing.slice(0, 2) : missing;
}

// ---- Text written to screening software (lib/reports/screener-text.ts) ----

type ScreenerKind = NonNullable<WorklistReport["screener_text"]>[number]["kind"];

/** The label over lines written to screening software: the action first (three reviewers, Nov 7, 2026). */
export function screenerTitle(many: boolean) {
  return many ? "Take these lines out before you send it." : "Take this line out before you send it.";
}
const SCREENER_WHAT: Record<ScreenerKind, string> = {
  instruction: "an instruction written to AI screening software",
  score: "a score written for screening software to read back",
  posting_copy: "the posting's own text, pasted into your resume",
  keyword_repeat: "a keyword list repeated for a scanner",
};
const ORDINALS = ["first", "second", "third"];

/**
 * What each finding is, in its own sentence, then why it matters, claiming only what's true: the line may be set in
 * white, software reads it as text, and it can show up when the file is opened or copied. "Often" is the
 * practitioners' account (Peditto, Sharghi, Altman), not a measured rate.
 */
export function screenerNote(findings: ReadonlyArray<{ kind: ScreenerKind }>) {
  if (findings.length === 0) return "";
  if (findings.length === 1) {
    return `This is ${SCREENER_WHAT[findings[0].kind]}. It may be set in white, where you won't see it; software still reads it as text, and a recruiter can see it too. Recruiters who find a line like this often stop reading there.`;
  }
  const what = findings.map((finding, index) => `The ${ORDINALS[index] ?? "next"} is ${SCREENER_WHAT[finding.kind]}.`).join(" ");
  return `${what} Lines like these may be set in white, where you won't see them; software still reads them as text, and a recruiter can see them too. Recruiters who find one often stop reading there.`;
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
  return QUOTED_KINDS.has(card.kind) ? canonicalSourceIdentity(card.line) : `${card.kind}:${canonicalSourceIdentity(card.line)}`;
}

/**
 * Compares two worklist reports on one resume the way a person would: which of the lines they worked on
 * are off the list, which are still there, and how far the score moved. A line that left the list is no
 * longer a card; that doesn't prove it's fixed, so the copy never says so. The score is said only when it moved
 * by more than two reads of an unchanged page do (scoreMoved): "Down 3" after a good rewrite would be the model's
 * wobble passed off as a result.
 */
export function compareWorklists(previous: Pick<WorklistReport, "cards" | "score">, current: Pick<WorklistReport, "cards" | "score">, since = "last time"): WorklistComparison {
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
  const sum = !scoreMoved(delta) ? null : delta > 0 ? `Up ${delta} since ${since}. That's the right direction!` : `Down ${Math.abs(delta)} since ${since}.`;
  return { gone, still, added, delta, title, intro, sum };
}

// ---- An older report beside a worklist report (live test, November 12, 2026) ----
// A report saved before November 6, 2026 names its top one to three problems; a worklist report lists every
// line that needs work, and its score is worked out differently. So the two can be compared on one thing only:
// whether the lines the older report led with are still on the list. The longer list and the score are said
// to be what they are, a different report, never a change in the resume.

/** One of an older report's top problems: the resume line it quoted, and its note. */
export interface EarlierProblem {
  line: string;
  note: string;
}

export interface AcrossShapesComparison {
  /** The older report's problems whose line is no longer on the list. */
  gone: EarlierProblem[];
  /** The older report's problems whose line is still on the list. */
  still: EarlierProblem[];
  /** Every line that needs work now, in reading order. */
  now: WorklistCard[];
  title: string;
  intro: string;
  /** Why the list is longer and the scores aren't compared. */
  note: string;
}

export const ACROSS_SHAPES_NOTE = "The earlier report named only its top problems and scored your resume differently. This one lists every line that needs work, so a longer list or a different score doesn't mean a weaker resume.";

export function compareAcrossShapes(earlier: readonly EarlierProblem[], current: Pick<WorklistReport, "cards">): AcrossShapesComparison {
  const now = workCards(current);
  const identities = now.map((card) => canonicalSourceIdentity(card.line).toLocaleLowerCase()).filter(Boolean);
  const onList = (problem: EarlierProblem) => {
    const identity = canonicalSourceIdentity(problem.line).toLocaleLowerCase();
    return Boolean(identity) && identities.some((line) => line === identity || line.includes(identity) || identity.includes(line));
  };
  const problems = earlier.filter((problem) => problem.line.trim());
  const still = problems.filter(onList);
  const gone = problems.filter((problem) => !onList(problem));
  const needWorkClause = now.length === 0
    ? "nothing in this version needs work"
    : `${now.length} ${now.length === 1 ? "line needs" : "lines need"} work in this version`;
  const needWork = `${needWorkClause[0].toUpperCase()}${needWorkClause.slice(1)}.`;
  let title: string;
  let intro: string;
  if (problems.length === 0) {
    title = needWork;
    intro = "";
  } else if (gone.length === 0) {
    title = problems.length === 1 ? "The line the earlier report led with is still on the list." : "The lines the earlier report led with are still on the list.";
    intro = needWork;
  } else if (still.length === 0) {
    title = problems.length === 1 ? "The line the earlier report led with is off the list." : "The lines the earlier report led with are off the list.";
    intro = needWork;
  } else {
    title = `${gone.length} of the ${problems.length} lines the earlier report led with ${gone.length === 1 ? "is" : "are"} off the list.`;
    intro = `${still.length === 1 ? "One is" : `${still.length} are`} still there, and ${needWorkClause}.`;
  }
  return { gone, still, now, title, intro, note: ACROSS_SHAPES_NOTE };
}
