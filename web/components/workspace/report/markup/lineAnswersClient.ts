/**
 * The answers and the chosen line, kept with a signed-in report (W3, Nov 2026) so a saved report and
 * the PDF carry the revised line. Contract (Engine): `PATCH /api/reports/:id/answers` with
 * `{ fix_index, answers: [{ question, kind, text? }], line, source }`, owner-only, and
 * `GET /api/reports/:id` returns them. Until the route ships, a failed write is silent: the line is
 * still here for this visit, and nothing else changes.
 */

import type { LiftAnswer } from "@/lib/reports/revised-line";

export type StoredAnswer = { question: string; kind: "open" | "unknown" | "not_mine"; text?: string };

export interface StoredLineAnswers {
  fix_index: number;
  answers: StoredAnswer[];
  line: string;
  source: "literal" | "polished" | "edited";
}

/** Reads whatever the report route returned, under the field the contract names or beside the report. */
export function readStoredLineAnswers(payload: unknown): StoredLineAnswers[] {
  if (!payload || typeof payload !== "object") return [];
  const body = payload as Record<string, unknown>;
  const report = body.report && typeof body.report === "object" ? (body.report as Record<string, unknown>) : null;
  const candidates = [body.line_answers, body.answers, report?.line_answers];
  const list = candidates.find((value) => Array.isArray(value)) as unknown[] | undefined;
  if (!list) return [];
  return list.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const item = entry as Record<string, unknown>;
    if (typeof item.fix_index !== "number" || typeof item.line !== "string" || !Array.isArray(item.answers)) return [];
    const answers = item.answers.flatMap((answer) => {
      if (!answer || typeof answer !== "object") return [];
      const value = answer as Record<string, unknown>;
      if (typeof value.question !== "string") return [];
      const kind = value.kind === "unknown" || value.kind === "not_mine" ? value.kind : "open";
      return [{ question: value.question, kind, text: typeof value.text === "string" ? value.text : undefined } satisfies StoredAnswer];
    });
    const source = item.source === "polished" || item.source === "edited" ? item.source : "literal";
    return [{ fix_index: item.fix_index, answers, line: item.line, source }];
  });
}

/** A stored answer back into the lift's own answer shape. */
export function liftAnswerFrom(answer: StoredAnswer): LiftAnswer {
  if (answer.kind === "unknown" || answer.kind === "not_mine") return { kind: answer.kind };
  return answer.text?.trim() ? { kind: "answered", value: answer.text } : { kind: "open" };
}

export function storedAnswerFrom(question: string, answer: LiftAnswer): StoredAnswer {
  if (answer.kind === "answered") return { question, kind: "open", text: answer.value };
  if (answer.kind === "unknown" || answer.kind === "not_mine") return { question, kind: answer.kind };
  return { question, kind: "open" };
}

/** Stores the answers and the line with the report. Resolves false when they weren't stored. */
export async function storeLineAnswers(reportId: string, payload: StoredLineAnswers, fetchImpl: typeof fetch = fetch): Promise<boolean> {
  try {
    const response = await fetchImpl(`/api/reports/${encodeURIComponent(reportId)}/answers`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(payload),
    });
    return response.ok;
  } catch {
    return false;
  }
}
