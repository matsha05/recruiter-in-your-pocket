/**
 * Questions first for the page that isn't ready (Matt, Nov 5, 2026: "probably questions first";
 * the questions come from "a quick first read"). The first read runs as it always has; when it
 * lands on the bottom rung, the person sees the questions a recruiter would ask instead of the
 * report, answers what they can, and the report is written again from the page plus their
 * answers. The answers go into the resume the way the revised line already builds them (the
 * line, a colon, the answers, word for word) and the unchanged prompt reads the result. No new
 * prompt, no invented facts: every added word is the person's.
 */

import type { ReportData } from "@/components/workspace/report/ReportTypes";
import { canonicalSourceIdentity, resolveUniqueSourceLine } from "../llm/source-fidelity";
import { reconcileReport } from "./report-integrity";
import { buildIndependentQuestionPresentation, missingFromResume, readCriticalMisses, withCriticalFirst } from "./report-presentation";
import { composeRevisedLine, liftQuestions, marginNoteFromFix } from "./revised-line";
import { reportTone, type ReportTone } from "./score-band";

/** The most questions the screen asks before writing the report. */
export const ASK_FIRST_MAX_QUESTIONS = 8;
/** Questions per marked line, so three lines leave room for the rest of the page. */
const QUESTIONS_PER_FIX = 2;
/** A rebuild is free; this caps how many one identity can ask for in a day. */
export const ASK_FIRST_REBUILDS_PER_DAY = 3;
/** The heading the answers that don't belong to a line go under, at the end of the resume. */
export const ASK_FIRST_ADDED_HEADING = "Added after the first read";

/** RIYP_ASK_FIRST: "0"/"false"/"off" turns the questions-first path off; unset means on. */
export function isAskFirstEnabled(value = process.env.RIYP_ASK_FIRST) {
  const normalized = String(value ?? "").trim().toLowerCase();
  return !["0", "false", "off"].includes(normalized);
}

export type AskFirstKind =
  /** A marked line on the page; the answer goes into that line. */
  | "line"
  /** The time since the last dated role; the answer is its own dated line. */
  | "since"
  /** The page has no headline or summary; the answer becomes one line at the top. */
  | "headline"
  /** Something the page lacks, with no line to attach it to. */
  | "missing"
  /** One of the report's open questions, not tied to a line. */
  | "general";

export interface AskFirstQuestion {
  id: string;
  /** Position of the fix this question belongs to, or null for a general question. */
  fixIndex: number | null;
  kind: AskFirstKind;
  /** The line the question is about, copied from the resume; empty for a general question. */
  excerpt: string;
  section?: string;
  /** The recruiter's note on the line, in the model's own words. Empty for a general question. */
  note: string;
  /** The question to answer. Empty when the note itself is the ask. */
  question: string;
}

/**
 * Three honest states for a question (Matt, Nov 5, 2026): "did" (the answer goes into the line), "related"
 * (the person did related work, which goes on the page as its own line, never into this one), and "none"
 * (left out). The value is the person's words either way.
 */
export type AskFirstRelation = "did" | "related" | "none";
export interface AskFirstAnswer {
  value: string;
  relation: AskFirstRelation;
}
export type AskFirstAnswers = Record<string, AskFirstAnswer | undefined>;

type Fix = NonNullable<ReportData["top_fixes"]>[number];

function excerptOf(fix: Fix | undefined) {
  if (!fix?.evidence) return "";
  return typeof fix.evidence === "string" ? fix.evidence : fix.evidence.excerpt || "";
}

function sectionOf(fix: Fix | undefined) {
  if (!fix?.evidence || typeof fix.evidence === "string") return fix?.section_ref || undefined;
  return fix.evidence.section || fix.section_ref || undefined;
}

const SINCE_FIX = /^add one dated line covering/iu;

function kindOf(fix: Fix): AskFirstKind {
  const text = fix.fix || fix.text || "";
  if (SINCE_FIX.test(text.trim())) return "since";
  const missing = missingFromResume(excerptOf(fix));
  if (missing) return /summary|headline|objective/iu.test(missing) ? "headline" : "missing";
  return "line";
}

/**
 * What the field asks for, in the field, when the recruiter's note is the ask: the note says what to add,
 * the placeholder says the shape of the answer. Never an example answer.
 */
export function askFirstPlaceholder(kind: AskFirstKind, relation: AskFirstRelation = "did") {
  if (relation === "related") return "The related work, as you'd put it on the page";
  if (kind === "since") return "What you've done since, with dates";
  if (kind === "headline") return "The title you're applying for, as the posting writes it";
  return "Your answer";
}

export function reportToneOf(report: Pick<ReportData, "score" | "top_fixes" | "more_critical">): ReportTone {
  return reportTone(report.score, readCriticalMisses(report));
}

/** Whether this report's page gets the questions first: the bottom rung, with a line to ask about. */
export function askFirstOffered(report: Pick<ReportData, "score" | "top_fixes" | "more_critical"> & { contract_version?: string }) {
  // The worklist report asks on each card instead (Nov 5, 2026); the questions-first screen is the v2 report's.
  if (report.contract_version === "v3") return false;
  return reportToneOf(report) === "not_ready" && (report.top_fixes || []).length > 0;
}

/**
 * The questions, in the order a recruiter would ask them: each marked line's own questions first
 * (the Critical Misses lead, so the dated gap and the headline come before a duty bullet when the
 * severity check found them), then the report's open questions, up to eight in all.
 */
export function buildAskFirstQuestions(report: ReportData): AskFirstQuestion[] {
  const integrity = reconcileReport(withCriticalFirst(report));
  const fixes = (integrity.report.top_fixes || []).slice(0, 3);
  const out: AskFirstQuestion[] = [];
  fixes.forEach((fix, fixIndex) => {
    const text = fix.fix || fix.text || "";
    const excerpt = excerptOf(fix);
    if (!text.trim() || !excerpt.trim()) return;
    const kind = kindOf(fix);
    const asked = liftQuestions(integrity.fixQuestions[fixIndex] || []);
    // With no question of its own, the note is the ask (one voice per row).
    const questions = asked.length > 0 ? asked.slice(0, QUESTIONS_PER_FIX) : [""];
    questions.forEach((question) => {
      out.push({
        id: `fix-${fixIndex}-${out.length}`,
        fixIndex,
        kind,
        excerpt: kind === "line" || kind === "since" ? excerpt : "",
        section: sectionOf(fix),
        note: marginNoteFromFix(text),
        question,
      });
    });
  });
  const general = buildIndependentQuestionPresentation(integrity.report.ideas?.questions || []);
  for (const { question, originalIndex } of general) {
    if (out.length >= ASK_FIRST_MAX_QUESTIONS) break;
    out.push({ id: `general-${originalIndex}`, fixIndex: null, kind: "general", excerpt: "", note: "", question: question.question.trim() });
  }
  return out.slice(0, ASK_FIRST_MAX_QUESTIONS);
}

function cleanAnswer(value: string | undefined) {
  return (value || "").trim().replace(/\s+/gu, " ");
}

/** The answered value, or nothing for a question left out. */
function answerOf(answer: AskFirstAnswer | undefined) {
  if (!answer || answer.relation === "none") return { value: "", relation: "none" as const };
  return { value: cleanAnswer(answer.value), relation: answer.relation };
}

/**
 * The resume with the answers in it. A line's answers are composed into that line exactly as the
 * revised line does (`composeRevisedLine`); related work is never written into the line it was asked
 * about, it goes on the page as its own line; a headline answer becomes one line under the name; the
 * rest go under one heading at the end, each answer as its own line, as written. Nothing else moves.
 */
export function composeAskFirstResume(resumeText: string, questions: readonly AskFirstQuestion[], answers: AskFirstAnswers): { text: string; answered: number } {
  const lines = resumeText.replace(/\r\n?/gu, "\n").split("\n");
  const byLine = new Map<string, { excerpt: string; values: string[] }>();
  const headline: string[] = [];
  const added: string[] = [];
  let answered = 0;
  for (const question of questions) {
    const { value, relation } = answerOf(answers[question.id]);
    if (!value) continue;
    answered += 1;
    if (question.kind === "line" && relation === "did") {
      const key = canonicalSourceIdentity(question.excerpt);
      const entry = byLine.get(key) || { excerpt: question.excerpt, values: [] };
      entry.values.push(value);
      byLine.set(key, entry);
    } else if (question.kind === "headline") {
      headline.push(value);
    } else {
      added.push(value);
    }
  }
  if (answered === 0) return { text: resumeText, answered };

  for (const { excerpt, values } of byLine.values()) {
    const resolved = resolveUniqueSourceLine(excerpt, resumeText);
    if (resolved.status !== "resolved") {
      added.push(...values);
      continue;
    }
    const index = lines.findIndex((line) => canonicalSourceIdentity(line) === resolved.line);
    if (index === -1) {
      added.push(...values);
      continue;
    }
    const composed = composeRevisedLine(lines[index], values.map((value) => ({ kind: "answered" as const, value })));
    if (composed) lines[index] = composed;
  }
  if (headline.length > 0) {
    const name = lines.findIndex((line) => line.trim());
    lines.splice(name + 1, 0, ...headline);
  }
  let text = lines.join("\n").replace(/\s+$/u, "");
  if (added.length > 0) text += `\n\n${ASK_FIRST_ADDED_HEADING}\n${added.map((value) => `- ${value}`).join("\n")}`;
  return { text, answered };
}
