/**
 * The report's first screen (W1, Nov 2026): what the header row and the opening read show, derived
 * from data the report already carries. Nothing here is a prediction; every string comes from the
 * report, the resume, or the clock.
 */

import { reportSentences } from "../llm/report-sentences";

/** A first sentence shorter than this isn't worth splitting off; the Verdict shows whole. */
export const VERDICT_LEAD_MIN_LENGTH = 40;

/** Abbreviations the sentence helper can't tell from a sentence end. */
const AMBIGUOUS_END = /\b(?:[A-Z]|Inc|Co|Ltd|Corp|Jr|Sr|St|Mr|Mrs|Ms|Dr|vs|No|approx|etc|est|dept)\.$/u;

export interface VerdictSplit {
  /** The sentence the first screen leads with. The whole Verdict when it can't be split safely. */
  lead: string;
  /** The rest of the Verdict, behind "Read the rest" on phones. Null when the lead is the whole Verdict. */
  rest: string | null;
}

/**
 * The Verdict's first sentence, with the rest behind a disclosure on phones. Falls back to the full
 * Verdict when the first sentence is short, when there is only one, or when the split looks wrong
 * (an abbreviation, or a continuation that starts in lowercase or with a digit).
 */
export function splitVerdict(verdict: string): VerdictSplit {
  const whole = verdict.trim().replace(/\s+/gu, " ");
  const sentences = reportSentences(whole);
  if (sentences.length < 2) return { lead: whole, rest: null };
  const lead = sentences[0];
  const rest = sentences.slice(1).join(" ");
  if (lead.length < VERDICT_LEAD_MIN_LENGTH || AMBIGUOUS_END.test(lead) || /^[\p{Ll}\d]/u.test(rest)) {
    return { lead: whole, rest: null };
  }
  return { lead, rest };
}

type RoleFit = { best_fit_roles?: string[]; seniority_read?: string } | undefined | null;

/** The role the report reads the resume toward: its first best-fit role, when it names one. */
export function targetRoleOf(roleFit: RoleFit): string | null {
  const role = roleFit?.best_fit_roles?.find((value) => typeof value === "string" && value.trim());
  return role ? role.trim() : null;
}

/** Longest `seniority_read` that still reads as a chip, not a sentence. */
const READ_AS_MAX_LENGTH = 32;

/**
 * "Read as: entry level": the level the resume reads at, from `role_fit.seniority_read`. The model
 * usually writes a sentence there ("The current title is …; the resume does not state …"), which is
 * not a chip, so the chip appears only for a short label. It states how the page reads, never what
 * will happen.
 */
export function readAsChip(roleFit: RoleFit): string | null {
  const read = roleFit?.seniority_read?.trim().replace(/\s+/gu, " ").replace(/\.$/u, "");
  if (!read || read.length > READ_AS_MAX_LENGTH || /[.;:,()]/u.test(read)) return null;
  // "Early career" reads as a label; "early career" reads as part of the sentence "Read as: …".
  const lowered = /^[A-Z][a-z]/u.test(read) ? read.charAt(0).toLocaleLowerCase() + read.slice(1) : read;
  return lowered;
}

const NAME_LINE = /^[\p{Lu}][\p{L}'’.-]*(?:\s+[\p{Lu}][\p{L}'’.-]*){1,4}$/u;
/** Words a resume's first line uses for a title or heading, never for a name. */
const NOT_A_NAME = new Set(["resume", "cv", "curriculum", "vitae", "profile", "summary", "objective", "experience", "education", "skills", "contact", "engineer", "manager", "director", "developer", "designer", "analyst", "specialist", "consultant", "coordinator", "associate", "assistant", "intern", "senior", "junior", "lead", "staff", "principal", "head", "chief", "officer", "president", "founder", "student", "graduate", "candidate", "professional", "portfolio", "page", "draft", "version", "final", "updated", "revised", "original", "restored"]);

/**
 * The candidate's name, from the first line of the resume this visit holds. Only a line that looks
 * like a name counts: two to five capitalized words, letters only, none of them a title or heading
 * word. An email, a heading, a job title or a sentence gives nothing, and the row says "Your resume
 * report" instead. Kept in memory with the resume; never stored by this code.
 */
export function candidateNameOf(resumeText?: string | null): string | null {
  const line = resumeText?.split(/\r?\n/u).map((value) => value.trim()).find(Boolean);
  if (!line || line.length > 48) return null;
  const words = line.split(/\s+/u);
  const shouting = words.every((word) => word === word.toLocaleUpperCase());
  const cased = shouting ? words.map((word) => word.charAt(0) + word.slice(1).toLocaleLowerCase()).join(" ") : line;
  if (!NAME_LINE.test(cased) || words.some((word) => NOT_A_NAME.has(word.toLocaleLowerCase().replace(/[.,:]+$/u, "")))) return null;
  return cased;
}

/** "read in 1 min 12 s", from the time the report took to arrive. */
export function formatReadTime(ms: number): string | null {
  if (!Number.isFinite(ms) || ms < 1000) return null;
  const seconds = Math.round(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  if (minutes === 0) return `read in ${remainder} s`;
  return remainder === 0 ? `read in ${minutes} min` : `read in ${minutes} min ${remainder} s`;
}

/** "Fix 2 of 3": a fix's place among the report's fixes, so a phone that hides the heading still orders them. */
export function fixPositionLabel(index: number, total: number) {
  return total > 1 ? `Fix ${index + 1} of ${total}` : `Fix ${index + 1}`;
}
