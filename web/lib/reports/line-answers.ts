/**
 * The answers a signed-in reader gives under a Critical Miss, and the revised line they chose, kept
 * with the saved report (W3: "the answer you can keep"). Stored as `reports.line_answers`, a JSON object
 * keyed by the fix's position ("0", "1", "2"; on the worklist report, the card's position, up to "11", with
 * each blank's label as the question). It holds only what the reader typed and the line built
 * from it; never the resume. It is returned by GET /api/reports/:id, written by PATCH
 * /api/reports/:id/answers, printed by the PDF, and deleted with the report or the account.
 */

import type { LiftAnswer } from "./revised-line";

/** The worklist report (Nov 5, 2026) keeps one entry per card, up to its twelve cards and six blanks each. */
export const LINE_ANSWER_LIMITS = { fixes: 12, answers: 6, question: 300, text: 300, line: 600, body: 8 * 1024 } as const;

export type StoredLineAnswer =
  | { question: string; kind: "answered"; text: string }
  | { question: string; kind: "unknown" | "not_mine" };

export type LineSource = "literal" | "polished" | "edited";

export interface StoredLineAnswers {
  answers: StoredLineAnswer[];
  /** The revised line as the reader last saw it, or null when they cleared it. */
  line: string | null;
  source: LineSource;
  /** ISO time of the last change. */
  updated_at: string;
}

/** `reports.line_answers`: one entry per fix position. */
export type StoredLineAnswersByFix = Record<string, StoredLineAnswers>;

export interface LineAnswersPatch {
  fix_index: number;
  answers: StoredLineAnswer[];
  line: string | null;
  source: LineSource;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

function clean(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const text = value.replace(/\s+/gu, " ").trim();
  return text.length > 0 && text.length <= max ? text : null;
}

function parseAnswer(value: unknown): StoredLineAnswer | null {
  if (!value || typeof value !== "object") return null;
  const body = value as Record<string, unknown>;
  const question = clean(body.question, LINE_ANSWER_LIMITS.question);
  if (!question) return null;
  if (body.kind === "unknown" || body.kind === "not_mine") return { question, kind: body.kind };
  if (body.kind === "answered") {
    const text = clean(body.text, LINE_ANSWER_LIMITS.text);
    return text ? { question, kind: "answered", text } : null;
  }
  return null;
}

/** The request body, or null when any part is out of bounds. */
export function parseLineAnswersPatch(value: unknown): LineAnswersPatch | null {
  if (!value || typeof value !== "object") return null;
  const body = value as Record<string, unknown>;
  const fixIndex = body.fix_index;
  if (typeof fixIndex !== "number" || !Number.isInteger(fixIndex) || fixIndex < 0 || fixIndex >= LINE_ANSWER_LIMITS.fixes) return null;
  if (!Array.isArray(body.answers) || body.answers.length === 0 || body.answers.length > LINE_ANSWER_LIMITS.answers) return null;
  const answers = body.answers.map(parseAnswer);
  if (answers.some((answer) => answer === null)) return null;
  const line = body.line === null ? null : clean(body.line, LINE_ANSWER_LIMITS.line);
  if (body.line !== null && !line) return null;
  if (body.source !== "literal" && body.source !== "polished" && body.source !== "edited") return null;
  return { fix_index: fixIndex, answers: answers as StoredLineAnswer[], line, source: body.source };
}

/** What a stored column should look like; anything else reads as empty rather than breaking the report. */
export function parseStoredLineAnswers(value: unknown): StoredLineAnswersByFix | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const out: StoredLineAnswersByFix = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (!/^(?:[0-9]|1[01])$/u.test(key) || !entry || typeof entry !== "object") continue;
    const record = entry as Record<string, unknown>;
    const parsed = parseLineAnswersPatch({ fix_index: Number(key), answers: record.answers, line: record.line ?? null, source: record.source });
    if (!parsed) continue;
    const updatedAt = typeof record.updated_at === "string" ? record.updated_at : new Date(0).toISOString();
    out[key] = { answers: parsed.answers, line: parsed.line, source: parsed.source, updated_at: updatedAt };
  }
  return Object.keys(out).length ? out : null;
}

export function mergeLineAnswers(existing: unknown, patch: LineAnswersPatch, now = new Date()): StoredLineAnswersByFix {
  const current = parseStoredLineAnswers(existing) || {};
  return {
    ...current,
    [String(patch.fix_index)]: { answers: patch.answers, line: patch.line, source: patch.source, updated_at: now.toISOString() },
  };
}

/** The stored answers for a fix, lined up with the questions the report asks today (by question text). */
export function liftAnswersFromStored(stored: StoredLineAnswers | undefined, questions: readonly string[]): {
  answers: LiftAnswer[];
  line: string | null;
  source: LineSource;
} | null {
  if (!stored) return null;
  const byQuestion = new Map(stored.answers.map((answer) => [answer.question, answer] as const));
  const answers: LiftAnswer[] = questions.map((question) => {
    const found = byQuestion.get(question);
    if (!found) return { kind: "open" };
    return found.kind === "answered" ? { kind: "answered", value: found.text } : { kind: found.kind };
  });
  if (answers.every((answer) => answer.kind === "open")) return null;
  return { answers, line: stored.line, source: stored.source };
}

export function storedAnswersFromLift(questions: readonly string[], answers: readonly LiftAnswer[]): StoredLineAnswer[] {
  const out: StoredLineAnswer[] = [];
  questions.forEach((question, index) => {
    const answer = answers[index];
    if (!answer || answer.kind === "open") return;
    if (answer.kind === "answered") {
      const text = answer.value.replace(/\s+/gu, " ").trim();
      if (text) out.push({ question, kind: "answered", text });
      return;
    }
    out.push({ question, kind: answer.kind });
  });
  return out;
}

export function isReportId(value: unknown): value is string {
  return typeof value === "string" && UUID.test(value);
}

/** Saves one fix's answers with the report. Resolves false when nothing was kept, so the report can say so. */
export async function sendLineAnswers(reportId: string, patch: LineAnswersPatch, fetchImpl: typeof fetch = fetch, signal?: AbortSignal): Promise<boolean> {
  if (!isReportId(reportId)) return false;
  try {
    const response = await fetchImpl(`/api/reports/${encodeURIComponent(reportId)}/answers`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
      signal,
    });
    return response.ok;
  } catch {
    return false;
  }
}
