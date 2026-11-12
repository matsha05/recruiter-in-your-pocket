import { createAppError } from "../backend/errors";
import { reportSentences } from "./report-sentences";
import { getWorklistScoreLabel, NOTHING_TO_FIX_FLOOR, READY_TO_SEND_SCORE } from "../score-utils";
import {
  bannedPhrasesIn,
  inflatesOwnership,
  replaceRetiredIdiom,
  resolveCardLine,
  sameCardLine,
  sourceTagLeak,
  ungroundedTokensInExample,
  ungroundedTokensInStatement,
} from "./worklist-grounding";
import { QUOTED_KINDS, WORK_KINDS, WorklistReportSchema, type PostingMove, type WorklistCard, type WorklistReport, type ProfilePart, type PostingCovered, MAX_LINE_LENGTH } from "./worklist-schema";

/**
 * The worklist report's validator. Shape first (Zod), then the mechanical grounding, then the house
 * style rules the prompt states once and this code enforces. A refusal throws
 * OPENAI_RESPONSE_SHAPE_INVALID with the issues attached, which the repair pass reads back to the model.
 *
 * What it changes without refusing: em dashes become commas, whitespace is normalised, a duplicate card
 * on a line already carded is dropped, a quoted line is replaced by the resume's own canonical form, and
 * the rung label is written from the score. Nothing else in the model's words is edited.
 */

export interface WorklistValidationIssue {
  path: string;
  message: string;
}

type ValidationOptions = { forceGrounding?: boolean; jobDescription?: string };

function fail(issues: WorklistValidationIssue[]): never {
  const first = issues[0];
  throw createAppError(
    "OPENAI_RESPONSE_SHAPE_INVALID",
    `The model response failed the worklist contract at ${first.path}: ${first.message}.`,
    502,
    { schemaIssues: issues },
  );
}

/** House style the prompt states once: no em dashes. Fixed in place rather than refused. */
export function normaliseProse(value: string) {
  return replaceRetiredIdiom(value)
    .replace(/\s*[—–]\s*/gu, ", ")
    .replace(/\s+,/gu, ",")
    .replace(/,\s*,/gu, ",")
    .replace(/[ \t]+/gu, " ")
    .trim();
}

const sentenceKey = (value: string) => value.toLowerCase().replace(/[^\p{L}\p{N} ]+/gu, " ").replace(/\s+/gu, " ").trim();

/**
 * The note without a sentence that is, word for word, the card's own question. The report shows the note and then
 * the question as the label over the answer fields, so a note that ends by asking it says the same thing twice
 * (about one card in a thousand; live runs, November 12, 2026). A note that is nothing but the question stays:
 * a card is never left without one.
 */
export function noteWithoutItsQuestion(note: string, question: string): string {
  const asked = new Set(reportSentences(question).map(sentenceKey).filter(Boolean));
  if (asked.size === 0) return note;
  const sentences = reportSentences(note);
  const kept = sentences.filter((sentence) => !asked.has(sentenceKey(sentence)));
  return kept.length === 0 || kept.length === sentences.length ? note : kept.join(" ");
}

function normaliseCard(card: WorklistCard): WorklistCard {
  const question = normaliseProse(card.question);
  return {
    ...card,
    where: normaliseProse(card.where),
    line: card.line.replace(/\s+/gu, " ").trim(),
    cannot_tell: noteWithoutItsQuestion(normaliseProse(card.cannot_tell), question),
    // The example is the line itself; a leading bullet mark is the resume's, not the example's.
    example: normaliseProse(card.example).replace(/^[-•*]\s+/u, ""),
    question,
  };
}

/**
 * The posting's moves, held to the resume: a line that isn't on it word for word, or that sits on it more than
 * once, is dropped, never repaired, because the lists are optional and a wrong quote is worse than none. A line
 * may be moved up or trimmed, never both; without a posting there are no moves.
 */
function groundPostingMoves(moves: PostingMove[] | undefined, resumeText: string | undefined, taken: string[]): PostingMove[] {
  const kept: PostingMove[] = [];
  for (const move of moves ?? []) {
    let line = move.line.replace(/\s+/gu, " ").trim();
    if (resumeText) {
      const resolved = resolveCardLine(line, resumeText);
      if (resolved.status === "missing" || resolved.status === "ambiguous") continue;
      if (resolved.status === "resolved" && resolved.line.length <= MAX_LINE_LENGTH) line = resolved.line;
    }
    if ([...taken, ...kept.map((item) => item.line)].some((other) => sameCardLine(other, line))) continue;
    kept.push({ line, why: normaliseProse(move.why) });
  }
  return kept;
}

const sameWords = (a: string, b: string) => a.toLowerCase().replace(/[^a-z0-9]+/gu, " ").trim() === b.toLowerCase().replace(/[^a-z0-9]+/gu, " ").trim();

/** A role's header rather than its work: a short line that carries a year or "present" (employer, place, dates). */
const isDatesLine = (line: string) => line.split(/\s+/u).length <= 10 && /\b(?:(?:19|20)\d{2}|present|current)\b/iu.test(line);

/**
 * A posting's line that is no gap on a resume, whatever the model made of it: a section heading, or a rule about who
 * may be hired (citizenship, work authorization, export control). The prompt keeps these out; this is the net under it.
 */
const isNotAResumeAsk = (requirement: string) =>
  (!/[a-z]/u.test(requirement) && /\b(?:REQUIREMENTS?|QUALIFICATIONS?|RESPONSIBILITIES|SKILLS)\b/u.test(requirement))
  || /\b(?:citizen(?:ship)?|work authori[sz]ation|authori[sz]ed to work|lawful permanent resident|green card|visa sponsorship|ITAR|export[- ]control)\b/iu.test(requirement);

/** Covered requirements: the line must be on the resume, a requirement is listed once, and never also as missing. */
function groundPostingCovered(covered: PostingCovered[] | undefined, resumeText: string | undefined, missing: string[]): PostingCovered[] {
  const kept: PostingCovered[] = [];
  for (const item of covered ?? []) {
    const requirement = normaliseProse(item.requirement);
    let line = item.line.replace(/\s+/gu, " ").trim();
    if (!requirement || isNotAResumeAsk(requirement)) continue;
    // An ask for years of experience is answered by the dates, which a recruiter reads without a line pointing at
    // them; a row for one that quotes an employer-and-dates line shows nothing of the work, so it is dropped. A
    // years ask in a kind of work ("2+ years recruiting for InfoSec") answered by a line of that work stays: dropping
    // those took a person's closest matches out of the table (the live walk of November 12, 2026).
    if (/\b\d+\s*\+?\s*(?:or more\s+)?years?\b/iu.test(requirement) && isDatesLine(line)) continue;
    if (resumeText) {
      const resolved = resolveCardLine(line, resumeText);
      if (resolved.status === "missing" || resolved.status === "ambiguous") continue;
      if (resolved.status === "resolved" && resolved.line.length <= MAX_LINE_LENGTH) line = resolved.line;
    }
    if (missing.some((other) => sameWords(other, requirement)) || kept.some((other) => sameWords(other.requirement, requirement))) continue;
    kept.push({ requirement, line });
  }
  return kept;
}

function proseFields(report: WorklistReport): Array<{ path: string; value: string }> {
  const fields: Array<{ path: string; value: string }> = [{ path: "verdict", value: report.verdict }];
  report.write_up.forEach((paragraph, index) => fields.push({ path: `write_up[${index}]`, value: paragraph }));
  report.cards.forEach((card, index) => {
    fields.push({ path: `cards[${index}].cannot_tell`, value: card.cannot_tell });
    fields.push({ path: `cards[${index}].question`, value: card.question });
    fields.push({ path: `cards[${index}].where`, value: card.where });
    if (!QUOTED_KINDS.has(card.kind)) fields.push({ path: `cards[${index}].line`, value: card.line });
  });
  fields.push({ path: "fit.note", value: report.fit.note }, { path: "fit.level", value: report.fit.level }, { path: "fit.posting.summary", value: report.fit.posting.summary });
  if (report.fit.why) fields.push({ path: "fit.why", value: report.fit.why });
  (report.fit.posting.lead ?? []).forEach((move, index) => fields.push({ path: `fit.posting.lead[${index}].why`, value: move.why }));
  (report.fit.posting.trim ?? []).forEach((move, index) => fields.push({ path: `fit.posting.trim[${index}].why`, value: move.why }));
  (report.fit.posting.covered ?? []).forEach((item, index) => fields.push({ path: `fit.posting.covered[${index}].requirement`, value: item.requirement }));
  return fields;
}

function isMockRun() {
  return ["1", "true", "TRUE"].includes(String(process.env.USE_MOCK_OPENAI || "").trim());
}

const FIXED_PARTS = new Set(["headline", "about", "top skills", "education"]);
const flat = (value: string) => value.toLowerCase().replace(/[\u2018\u2019]/gu, "'").replace(/\s+/gu, " ").trim();

function groundProfileParts(parts: ProfilePart[], sourceText: string | undefined, cards: WorklistCard[]): ProfilePart[] {
  const source = sourceText ? flat(sourceText) : null;
  const seen = new Set<string>();
  const kept: ProfilePart[] = [];
  for (const draft of parts) {
    const part = { name: normaliseProse(draft.name), detail: normaliseProse(draft.detail), status: draft.status };
    const fixed = FIXED_PARTS.has(flat(part.name));
    if (fixed) part.detail = "";
    else if (source && (!source.includes(flat(part.name)) || (part.detail && !source.includes(flat(part.detail))))) continue;
    const key = `${flat(part.name)}|${flat(part.detail)}`;
    if (!part.name || seen.has(key)) continue;
    seen.add(key);
    const carded = cards.some((card) => WORK_KINDS.has(card.kind) && flat(card.where).startsWith(flat(part.name))
      // Two jobs at one employer: the card names which, by title, when it can.
      && (!part.detail || !cards.some((other) => other !== card && flat(other.where).startsWith(flat(part.name))) || flat(card.where).includes(flat(part.detail)) || flat(card.line).includes(flat(part.detail))));
    if (carded && part.status === "fine") part.status = "needs_work";
    kept.push(part);
  }
  return kept;
}

const MAX_REQUIREMENT = 200;

/**
 * A posting sometimes writes a requirement as a paragraph, and the model copies it whole. Sending the report
 * back for that costs the person a second wait, so a long requirement is cut to its first clause instead.
 */
function shortRequirement(value: unknown): unknown {
  if (typeof value !== "string" || value.trim().length <= MAX_REQUIREMENT) return value;
  const text = value.trim();
  const head = text.slice(0, MAX_REQUIREMENT);
  const clause = Math.max(head.lastIndexOf(". "), head.lastIndexOf("; "), head.lastIndexOf(": "), head.lastIndexOf(", "));
  const cut = clause > 40 ? clause : head.lastIndexOf(" ");
  return head.slice(0, cut > 0 ? cut : MAX_REQUIREMENT).replace(/[\s,;:.]+$/u, "");
}

function withShortRequirements(obj: object): object {
  const posting = (obj as { fit?: { posting?: { missing?: unknown; covered?: unknown } } }).fit?.posting;
  if (!posting || (!Array.isArray(posting.missing) && !Array.isArray(posting.covered))) return obj;
  const draft = obj as { fit: { posting: Record<string, unknown> } };
  return {
    ...draft,
    fit: {
      ...draft.fit,
      posting: {
        ...draft.fit.posting,
        ...(Array.isArray(posting.missing) ? { missing: posting.missing.map(shortRequirement) } : {}),
        ...(Array.isArray(posting.covered) ? { covered: posting.covered.map((item) => item && typeof item === "object" ? { ...item, requirement: shortRequirement((item as { requirement?: unknown }).requirement) } : item) } : {}),
      },
    },
  };
}

export function validateWorklistPayload(obj: unknown, resumeText?: string, options: ValidationOptions = {}): WorklistReport {
  if (!obj || typeof obj !== "object") {
    throw createAppError("OPENAI_RESPONSE_SHAPE_INVALID", "The model response did not match the expected format.", 502);
  }
  const parsed = WorklistReportSchema.safeParse(withShortRequirements(obj));
  if (!parsed.success) {
    fail(parsed.error.issues.map((issue) => ({ path: issue.path.join(".") || "response", message: issue.message })));
  }

  const report: WorklistReport = {
    ...parsed.data,
    verdict: normaliseProse(parsed.data.verdict),
    write_up: parsed.data.write_up.map(normaliseProse).filter(Boolean),
    cards: parsed.data.cards.map(normaliseCard),
    fit: {
      ...parsed.data.fit,
      note: normaliseProse(parsed.data.fit.note),
      level: normaliseProse(parsed.data.fit.level),
      ...(parsed.data.fit.why !== undefined ? { why: normaliseProse(parsed.data.fit.why) } : {}),
      posting: { ...parsed.data.fit.posting, summary: normaliseProse(parsed.data.fit.posting.summary) },
    },
  };

  // Tailoring exists only with a posting. An empty list is left off, so a report without moves keeps its old shape.
  {
    const { lead: draftLead, trim: draftTrim, covered: draftCovered, ...posting } = report.fit.posting;
    const hasPosting = Boolean(posting.summary);
    const groundingText = isMockRun() && !options.forceGrounding ? undefined : resumeText;
    const lead = hasPosting ? groundPostingMoves(draftLead, groundingText, []) : [];
    const trim = hasPosting ? groundPostingMoves(draftTrim, groundingText, lead.map((move) => move.line)) : [];
    posting.missing = posting.missing.filter((item) => !isNotAResumeAsk(item));
    const covered = hasPosting ? groundPostingCovered(draftCovered, groundingText, posting.missing) : [];
    report.fit = { ...report.fit, posting: { ...posting, ...(lead.length ? { lead } : {}), ...(trim.length ? { trim } : {}), ...(covered.length ? { covered } : {}) } };
  }

  // A profile's parts: names and titles are checked against the profile; a part that isn't on it is dropped,
  // and a part a card says needs work is never shown as fine.
  if (report.parts) {
    const parts = groundProfileParts(report.parts, isMockRun() && !options.forceGrounding ? undefined : resumeText, report.cards);
    if (parts.length >= 3) report.parts = parts;
    else delete report.parts;
  }

  const issues: WorklistValidationIssue[] = [];
  if (sourceTagLeak(JSON.stringify(report))) issues.push({ path: "response", message: "exposes a SOURCE catalog tag" });
  for (const field of proseFields(report)) {
    for (const phrase of bannedPhrasesIn(field.value)) issues.push({ path: field.path, message: `uses the retired phrase "${phrase}"` });
  }

  const isMockOpenAI = isMockRun();
  const shouldGround = Boolean(resumeText && (options.forceGrounding || !isMockOpenAI));

  if (resumeText && shouldGround) {
    const kept: WorklistCard[] = [];
    report.cards.forEach((card, index) => {
      const path = `cards[${index}]`;
      if (QUOTED_KINDS.has(card.kind)) {
        const resolved = resolveCardLine(card.line, resumeText);
        if (resolved.status === "missing") {
          issues.push({ path: `${path}.line`, message: `is not on the resume as written: "${card.line}"` });
          return;
        }
        if (resolved.status === "ambiguous") {
          issues.push({ path: `${path}.line`, message: `matches more than one resume line: "${card.line}"` });
          return;
        }
        // The quote is widened to the whole resume line it sits on, unless that line is longer than a report can
        // hold (a summary pasted as one paragraph). Then the model's own quote stands: it is on the resume, and a
        // line past the limit would make the saved report unreadable when it is opened again.
        if (resolved.status === "resolved" && resolved.line.length <= MAX_LINE_LENGTH) card = { ...card, line: resolved.line };
      } else {
        for (const issue of ungroundedTokensInStatement(card.line, resumeText)) {
          issues.push({ path: `${path}.line`, message: `states a ${issue.kind} the resume doesn't have: "${issue.token}"` });
        }
      }
      if (card.example) {
        for (const issue of ungroundedTokensInExample(card.example, resumeText, card.kind === "line" || card.kind === "upgrade" ? card.line : "")) {
          issues.push({ path: `${path}.example`, message: `puts a ${issue.kind} outside a bracket that the resume doesn't have: "${issue.token}"` });
        }
        if ((card.kind === "line" || card.kind === "upgrade") && inflatesOwnership(card.line, card.example)) {
          issues.push({ path: `${path}.example`, message: "turns a support verb on the line into an ownership verb" });
        }
      }
      // One card per line: the first card on a line stands, as the prompt orders them.
      if (kept.some((other) => QUOTED_KINDS.has(card.kind) && QUOTED_KINDS.has(other.kind) && sameCardLine(other.line, card.line))) return;
      kept.push(card);
    });
    report.cards = kept;
  }

  // The top band is earned, not scored (Matt, Nov 6, 2026): "Ready to send" (93+) only when no card needs work;
  // a page with no card that needs work never sits below 90; the employer lift never reaches the top band.
  // Upgrades are optional (Matt, Nov 7, 2026): they never count as work.
  const work = report.cards.filter((card) => WORK_KINDS.has(card.kind)).length;
  if (report.score >= READY_TO_SEND_SCORE && work > 0) {
    issues.push({ path: "score", message: `is ${report.score} (Ready to send) with ${work} card${work === 1 ? "" : "s"} that need${work === 1 ? "s" : ""} work; a page with any card that needs work scores at most ${READY_TO_SEND_SCORE - 1}` });
  }
  if (work === 0 && report.cards.length > 0 && report.score < NOTHING_TO_FIX_FLOOR) {
    issues.push({ path: "score", message: `is ${report.score} with no card that needs work; a page with nothing to fix scores at least ${NOTHING_TO_FIX_FLOOR}` });
  }
  if (report.lifted_by_employer && report.score >= READY_TO_SEND_SCORE) {
    issues.push({ path: "score", message: `is ${report.score} with the employer lift; the lift never reaches Ready to send` });
  }

  if (issues.length > 0) fail(issues);
  report.score_label = getWorklistScoreLabel(report.score);
  return report;
}
