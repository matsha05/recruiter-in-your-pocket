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
  /** Empty with a null line and literal source explicitly clears this card. */
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
  if (!Array.isArray(body.answers) || body.answers.length > LINE_ANSWER_LIMITS.answers) return null;
  if (body.answers.length === 0) {
    return body.line === null && body.source === "literal"
      ? { fix_index: fixIndex, answers: [], line: null, source: "literal" }
      : null;
  }
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
    if (!parsed || parsed.answers.length === 0) continue;
    const updatedAt = typeof record.updated_at === "string" ? record.updated_at : new Date(0).toISOString();
    out[key] = { answers: parsed.answers, line: parsed.line, source: parsed.source, updated_at: updatedAt };
  }
  return Object.keys(out).length ? out : null;
}

/** One card's stored entry, as PATCH /api/reports/:id/answers keeps it under the card's position. */
export function lineAnswerEntry(patch: LineAnswersPatch, now = new Date()): StoredLineAnswers {
  return { answers: patch.answers, line: patch.line, source: patch.source, updated_at: now.toISOString() };
}

export function mergeLineAnswers(existing: unknown, patch: LineAnswersPatch, now = new Date()): StoredLineAnswersByFix {
  const current = parseStoredLineAnswers(existing) || {};
  if (patch.answers.length === 0) {
    delete current[String(patch.fix_index)];
    return current;
  }
  return { ...current, [String(patch.fix_index)]: lineAnswerEntry(patch, now) };
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

// A report may be reopened while its previous view is still saving. Share the writer by card,
// rather than by mounted component, so the newer view cannot be overwritten by an older edit.
export interface PendingLineAnswers {
  patch: LineAnswersPatch;
  state: "saving" | "failed";
}
export type PendingLineAnswersChange = "changed" | "saved" | "discarded";

type AnswerWrite = {
  marker: symbol;
  patch: LineAnswersPatch;
  post: () => Promise<boolean>;
  promise: Promise<boolean>;
  resolve: (ok: boolean) => void;
  settled: Promise<void>;
  settle: () => void;
  ignored: boolean;
};
type CardWriter = { running: AnswerWrite | null; queued: AnswerWrite | null };

// Each card holds at most one running request and one latest queued request. Only unsaved
// edits remain in document memory; confirmed saves are not a cache of the server's answers.
const lineAnswerWrites = new Map<string, CardWriter>();
const pendingLineAnswerWrites = new Map<string, { marker: symbol; snapshot: PendingLineAnswers }>();
const pendingLineAnswerListeners = new Map<string, Set<(reason: PendingLineAnswersChange) => void>>();
let unloadWarningTarget: Window | null = null;

function lineAnswerKey(reportId: string, fixIndex: number) {
  return isReportId(reportId) && Number.isInteger(fixIndex) && fixIndex >= 0 && fixIndex < LINE_ANSWER_LIMITS.fixes
    ? `${reportId.toLowerCase()}:${fixIndex}`
    : null;
}

/** A stable snapshot of only the latest unsaved edit, suitable for useSyncExternalStore. */
export function getPendingLineAnswers(reportId: string, fixIndex: number): PendingLineAnswers | null {
  const key = lineAnswerKey(reportId, fixIndex);
  return key ? pendingLineAnswerWrites.get(key)?.snapshot ?? null : null;
}

export function subscribePendingLineAnswers(reportId: string, fixIndex: number, onChange: (reason: PendingLineAnswersChange) => void): () => void {
  const key = lineAnswerKey(reportId, fixIndex);
  if (!key) return () => undefined;
  const listeners = pendingLineAnswerListeners.get(key) ?? new Set<(reason: PendingLineAnswersChange) => void>();
  listeners.add(onChange);
  pendingLineAnswerListeners.set(key, listeners);
  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0) pendingLineAnswerListeners.delete(key);
  };
}

function notifyPendingLineAnswers(key: string, reason: PendingLineAnswersChange = "changed") {
  for (const listener of pendingLineAnswerListeners.get(key) ?? []) listener(reason);
}

function warnBeforeLeaving(event: BeforeUnloadEvent) {
  if (pendingLineAnswerWrites.size === 0) return;
  event.preventDefault();
  event.returnValue = "";
}

function syncUnloadWarning() {
  if (pendingLineAnswerWrites.size === 0) {
    unloadWarningTarget?.removeEventListener("beforeunload", warnBeforeLeaving);
    unloadWarningTarget = null;
    return;
  }
  if (typeof window === "undefined" || unloadWarningTarget === window) return;
  unloadWarningTarget?.removeEventListener("beforeunload", warnBeforeLeaving);
  window.addEventListener("beforeunload", warnBeforeLeaving);
  unloadWarningTarget = window;
}

function stageCapturedLineAnswers(key: string, patch: LineAnswersPatch) {
  const entry = { marker: Symbol(), snapshot: { patch, state: "saving" as const } };
  pendingLineAnswerWrites.set(key, entry);
  syncUnloadWarning();
  notifyPendingLineAnswers(key);
  return entry;
}

/** Protect a local edit during its debounce, before a network request has started. */
export function stageLineAnswers(reportId: string, patch: LineAnswersPatch): PendingLineAnswers | null {
  const key = lineAnswerKey(reportId, patch.fix_index);
  if (!key) return null;
  try {
    const captured = JSON.parse(JSON.stringify(patch)) as LineAnswersPatch;
    return stageCapturedLineAnswers(key, captured).snapshot;
  } catch {
    return null;
  }
}

/** Reopening a report waits for its active writes, including edits queued while waiting. */
export async function waitForLineAnswerWrites(reportId: string, signal?: AbortSignal): Promise<void> {
  if (!isReportId(reportId)) return;
  const prefix = `${reportId.toLowerCase()}:`;
  while (true) {
    if (signal?.aborted) return;
    const pending = [...lineAnswerWrites].filter(([key]) => key.startsWith(prefix)).flatMap(([, writer]) =>
      [writer.running, writer.queued].flatMap((write) => write ? [write.settled] : [])
    );
    if (pending.length === 0) return;
    await new Promise<void>((resolve) => {
      const onAbort = () => resolve();
      signal?.addEventListener("abort", onAbort, { once: true });
      void Promise.allSettled(pending).then(() => {
        signal?.removeEventListener("abort", onAbort);
        resolve();
      });
    });
  }
}

/** Call only after confirmed report deletion or confirmed account identity loss/deletion. */
export function discardPendingLineAnswers(reportId?: string): void {
  if (reportId !== undefined && !isReportId(reportId)) return;
  const prefix = reportId === undefined ? null : `${reportId.toLowerCase()}:`;
  for (const [key, writer] of lineAnswerWrites) {
    if (prefix && !key.startsWith(prefix)) continue;
    if (writer.queued) {
      writer.queued.ignored = true;
      writer.queued.resolve(false);
      writer.queued.settle();
      writer.queued = null;
    }
    if (writer.running) {
      writer.running.ignored = true;
      writer.running.resolve(false);
      // Keep the ordering barrier until the old request settles. Aborting browser fetch
      // cannot guarantee that the server stopped, and a later sign-in may reopen this card.
    }
  }
  for (const key of pendingLineAnswerWrites.keys()) {
    if (prefix && !key.startsWith(prefix)) continue;
    pendingLineAnswerWrites.delete(key);
    notifyPendingLineAnswers(key, "discarded");
  }
  syncUnloadWarning();
}

async function drainLineAnswerWrites(key: string, writer: CardWriter) {
  while (writer.queued) {
    const write = writer.queued;
    writer.queued = null;
    writer.running = write;
    const ok = await write.post();
    if (!write.ignored && pendingLineAnswerWrites.get(key)?.marker === write.marker) {
      if (ok) pendingLineAnswerWrites.delete(key);
      else pendingLineAnswerWrites.set(key, { marker: write.marker, snapshot: { patch: write.patch, state: "failed" } });
      syncUnloadWarning();
      notifyPendingLineAnswers(key, ok ? "saved" : "changed");
    }
    writer.running = null;
    write.resolve(ok && !write.ignored);
    write.settle();
  }
  if (lineAnswerWrites.get(key) === writer) lineAnswerWrites.delete(key);
}

/** Saves a card in edit order, including across report navigation. Resolves false on failure. */
export async function sendLineAnswers(reportId: string, patch: LineAnswersPatch, fetchImpl: typeof fetch = fetch, signal?: AbortSignal): Promise<boolean> {
  const key = lineAnswerKey(reportId, patch.fix_index);
  if (!key) return false;
  let body: string;
  let capturedPatch: LineAnswersPatch;
  try {
    // The queued request must contain the edit as it was made, even if its caller later mutates it.
    body = JSON.stringify(patch);
    capturedPatch = JSON.parse(body) as LineAnswersPatch;
  } catch {
    return false;
  }
  const entry = stageCapturedLineAnswers(key, capturedPatch);
  let resolve!: (ok: boolean) => void;
  const promise = new Promise<boolean>((done) => { resolve = done; });
  let settle!: () => void;
  const settled = new Promise<void>((done) => { settle = done; });
  const write: AnswerWrite = {
    marker: entry.marker, patch: capturedPatch, promise, resolve, settled, settle, ignored: false,
    post: async () => {
      if (signal?.aborted) return false;
      try {
        const response = await fetchImpl(`/api/reports/${encodeURIComponent(reportId)}/answers`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body,
          signal,
        });
        return response.ok;
      } catch {
        return false;
      }
    },
  };
  const writer = lineAnswerWrites.get(key);
  if (writer) {
    if (writer.queued) {
      writer.queued.ignored = true;
      writer.queued.resolve(false);
      writer.queued.settle();
    }
    writer.queued = write;
  } else {
    const nextWriter = { running: null, queued: write };
    lineAnswerWrites.set(key, nextWriter);
    void drainLineAnswerWrites(key, nextWriter);
  }
  return promise;
}
