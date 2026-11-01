"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, CircleNotch, Copy, PencilSimple } from "@phosphor-icons/react";
import { LiftedTrace } from "@/components/shared/LiftedTrace";
import { ActionFeedback } from "@/components/ui/action-feedback";
import { Button } from "@/components/ui/button";
import { Analytics } from "@/lib/analytics";
import { useTransientFeedback } from "@/hooks/use-transient-feedback";
import {
  answeredValues,
  composeRevisedLine,
  liftSourceLine,
  liftState,
  revisedLinePolicy,
  type LiftAnswer,
  type LiftState,
} from "@/lib/reports/revised-line";
import styles from "./MarkedReport.module.css";

const traceItems = [
  { label: "Your line" },
  { label: "What's missing" },
  { label: "Your answers" },
  { label: "Revised line" },
];

export interface LiftChange {
  state: LiftState;
  /** The revised line, once its facts check out. */
  line?: string;
}

/** Why the full resume line isn't here, so the note under the line can say so accurately. */
export type ResumeSource = "attached" | "recovered" | "saved" | "sample";

const missingSourceNote: Record<Exclude<ResumeSource, "attached">, string> = {
  recovered: "This page was reloaded, so your resume isn't here anymore. The line is built on the part we quoted.",
  saved: "Saved reports don't keep your resume, so the line is built on the part we quoted.",
  sample: "This example only has the part of the line it quotes.",
};

/**
 * Questions under a marked line, and a revised line built from the candidate's
 * line and answers only (plan items 2.2 and 2.3). Copy turns on only when the
 * facts check out against the existing fabrication guard.
 */
export function LineLift({
  excerpt,
  resumeText,
  source,
  questions,
  onChange,
  onReattach,
}: {
  excerpt: string;
  /** The resume, when this visit has it (or the candidate pasted it back). */
  resumeText?: string;
  source: ResumeSource;
  /** From `liftQuestions`; with none, one open question stands in for the fix. */
  questions: string[];
  onChange?: (change: LiftChange) => void;
  /** Paste the resume back in to work on the whole line. Returns an error to show, if any. */
  onReattach?: (text: string) => string | null;
}) {
  const asked = questions.length > 0 ? questions : ["What would you add to this line?"];
  const [answers, setAnswers] = useState<LiftAnswer[]>(() => asked.map(() => ({ kind: "open" })));
  const [edited, setEdited] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [copying, setCopying] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [reattaching, setReattaching] = useState(false);
  const [pasted, setPasted] = useState("");
  const [reattachError, setReattachError] = useState<string | null>(null);
  const copied = useTransientFeedback();
  const baseId = useId();
  const editRef = useRef<HTMLTextAreaElement>(null);

  const sourceLine = useMemo(() => liftSourceLine(excerpt, resumeText), [excerpt, resumeText]);
  const composed = useMemo(() => composeRevisedLine(sourceLine.line, answers), [answers, sourceLine.line]);
  const line = edited ?? composed;
  const policy = useMemo(
    () => (line ? revisedLinePolicy({ resumeText, excerpt, line, answers }) : undefined),
    [answers, excerpt, line, resumeText],
  );
  const resolved = answers.map((answer) => (answer.kind === "answered" ? answer.value.trim().length > 0 : answer.kind !== "open"));
  const state = liftState(
    answers.map((answer, index) => (answer.kind === "answered" && !resolved[index] ? { kind: "open" } : answer)),
    policy?.copyable ? line : undefined,
  );
  const copyableLine = policy?.copyable ? line : undefined;

  useEffect(() => { onChange?.({ state, line: copyableLine }); }, [copyableLine, onChange, state]);
  useEffect(() => { if (editing) editRef.current?.focus(); }, [editing]);

  const setAnswer = (index: number, next: LiftAnswer) => {
    setAnswers((current) => current.map((answer, at) => (at === index ? next : answer)));
    // A new answer rebuilds the line from the resume and the answers.
    setEdited(null);
    setEditing(false);
    copied.reset();
  };

  const handleCopy = async () => {
    if (!copyableLine || copying) return;
    setCopying(true);
    setCopyError(false);
    try {
      await navigator.clipboard.writeText(copyableLine);
      copied.trigger();
      Analytics.track("sm1_fix_copied");
    } catch {
      setCopyError(true);
    } finally {
      setCopying(false);
    }
  };

  const handleReattach = () => {
    const error = onReattach?.(pasted) ?? null;
    setReattachError(error);
    if (!error) {
      setReattaching(false);
      setPasted("");
      setEdited(null);
    }
  };

  const detailsDone = resolved.every(Boolean);
  const completeSteps = 2 + (detailsDone ? 1 : 0) + (copyableLine && detailsDone ? 1 : 0);
  const progress = (completeSteps / traceItems.length) * 100 + (completeSteps < traceItems.length ? 100 / traceItems.length / 2 : 0);
  const written = answeredValues(answers);

  return (
    <div className={styles.lift} data-testid="line-lift" data-state={state}>
      <LiftedTrace items={traceItems} progress={progress} ariaLabel="From your line to a revised line" className={styles.liftTrace} compact />

      <p className={styles.liftLead}>
        {asked.length > 1 ? "Answer and we'll add them to your line." : "Answer and we'll add it to your line."}
        <span className={styles.liftLeadQuiet}>Only what&apos;s true. Skip anything you don&apos;t know.</span>
      </p>

      <ol className={styles.liftQuestions}>
        {asked.map((question, index) => {
          const answer = answers[index];
          const inputId = `${baseId}-q${index + 1}`;
          const skipped = answer.kind === "unknown" || answer.kind === "not_mine";
          return (
            <li key={question} className={styles.liftQuestion} data-testid="lift-question" data-skipped={skipped || undefined}>
              <label htmlFor={inputId} className={styles.liftQuestionText}>{question}</label>
              {skipped ? (
                <p className={styles.liftSkipped}>
                  {answer.kind === "unknown" ? "Left out for now." : "Left out. It's not your work."}
                  <Button type="button" variant="quiet" size="sm" onClick={() => setAnswer(index, { kind: "open" })}>Answer it</Button>
                </p>
              ) : (
                <>
                  <input
                    id={inputId}
                    type="text"
                    className={styles.liftInput}
                    value={answer.kind === "answered" ? answer.value : ""}
                    onChange={(event) => setAnswer(index, { kind: "answered", value: event.target.value })}
                    autoComplete="off"
                  />
                  <div className={styles.liftSkips}>
                    <Button type="button" variant="quiet" size="sm" onClick={() => setAnswer(index, { kind: "unknown" })}>I don&apos;t know</Button>
                    <Button type="button" variant="quiet" size="sm" onClick={() => setAnswer(index, { kind: "not_mine" })}>I didn&apos;t do this</Button>
                  </div>
                </>
              )}
            </li>
          );
        })}
      </ol>

      <div className={styles.revised} data-ready={copyableLine ? true : undefined}>
        <div className={styles.revisedHead}>
          <p className={styles.revisedLabel}>{edited !== null ? "Your wording" : "Revised line"}</p>
          {line && (
            <div className={styles.revisedActions}>
              <Button type="button" variant="quiet" size="sm" onClick={() => setEditing((value) => !value)} aria-pressed={editing}>
                {editing ? <Check className="size-4" aria-hidden="true" /> : <PencilSimple className="size-4" aria-hidden="true" />}
                {editing ? "Done" : "Edit"}
              </Button>
              <Button type="button" variant="quiet" size="sm" onClick={handleCopy} disabled={!copyableLine} aria-busy={copying || undefined}>
                {!copyableLine ? <><Copy className="size-4" aria-hidden="true" />Copy</> : (
                  <ActionFeedback state={copying ? "pending" : copied.active ? "success" : "idle"} states={{
                    idle: { label: "Copy", icon: <Copy className="size-4" /> },
                    pending: { label: "Copying", icon: <CircleNotch className="size-4 motion-safe:animate-spin" /> },
                    success: { label: "Copied", icon: <Check className="size-4" weight="bold" /> },
                  }} />
                )}
              </Button>
            </div>
          )}
        </div>

        {!line ? (
          <p className={styles.revisedEmpty}>
            {state === "not_mine"
              ? "Then this one isn't yours to fix. Keep the line as it is."
              : state === "unknown"
                ? "Keep the line as it is for now. If you can find out, it's worth adding."
                : "Your line shows up here as you answer."}
          </p>
        ) : editing ? (
          <textarea
            ref={editRef}
            className={styles.revisedInput}
            value={line}
            onChange={(event) => setEdited(event.target.value)}
            aria-label="Edit your revised line"
            rows={4}
          />
        ) : (
          <p className={styles.revisedText} data-testid="revised-line">
            {edited === null && composed ? (
              <>
                {sourceLine.line.replace(/[.;,:\s]+$/u, "")}:{" "}
                {written.map((value, index) => (
                  <span key={`${index}-${value}`}>
                    <span className={styles.yours}>{value}</span>{index < written.length - 1 ? "; " : "."}
                  </span>
                ))}
              </>
            ) : line}
          </p>
        )}

        {line && (
          <p className={styles.revisedNote} aria-live="polite">
            {copyableLine
              ? edited === null
                ? "Every word is from your resume or your answers. Reword it however you like."
                : "Your wording. The facts all come from your line or your answers."
              : policy?.newFacts.length
                ? `“${policy.newFacts.join("”, “")}” isn't in your line or your answers. If it's true, add it as an answer first.`
                : "This changes a detail from your resume. Edit it back to what's true to copy it."}
          </p>
        )}
        {copyError && <p role="status" className={styles.revisedNote}>Couldn&apos;t copy. Select the text and copy it manually.</p>}

        {!sourceLine.full && source !== "attached" && (
          reattaching ? (
            <div className={styles.reattach}>
              <label htmlFor={`${baseId}-resume`} className={styles.revisedLabel}>Paste the resume you ran this report on</label>
              <textarea id={`${baseId}-resume`} className={styles.reattachInput} value={pasted} onChange={(event) => setPasted(event.target.value)} rows={5} />
              {reattachError && <p role="alert" className={styles.reattachError}>{reattachError}</p>}
              <div className={styles.liftSkips}>
                <Button type="button" variant="secondary" size="sm" onClick={handleReattach} disabled={!pasted.trim()}>Use this resume</Button>
                <Button type="button" variant="quiet" size="sm" onClick={() => { setReattaching(false); setReattachError(null); }}>Cancel</Button>
              </div>
              <p className={styles.revisedNote}>It stays in this tab. We don&apos;t send it anywhere.</p>
            </div>
          ) : (
            <p className={styles.revisedNote}>
              {missingSourceNote[source]}{" "}
              {source !== "sample" && onReattach && (
                <Button type="button" variant="quiet" size="sm" onClick={() => setReattaching(true)}>Paste your resume to work on the whole line</Button>
              )}
            </p>
          )
        )}
      </div>
    </div>
  );
}
