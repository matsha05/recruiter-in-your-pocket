"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, CircleNotch, Copy, PencilSimple } from "@phosphor-icons/react";
import { LiftedTrace } from "@/components/shared/LiftedTrace";
import { ActionFeedback } from "@/components/ui/action-feedback";
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
import styles from "./MarkedUpReport.module.css";

const traceItems = [
  { label: "Your line" },
  { label: "What's missing" },
  { label: "Your answers" },
  { label: "Revised line" },
];

export interface LiftChange {
  state: LiftState;
  line?: string;
}

function questionLead(count: number) {
  return count <= 1 ? "Answer and we'll add it to your line." : "Answer and we'll add them to your line.";
}

/**
 * Under the Critical Miss: one to three questions, and a revised line built from
 * the candidate's line and answers only (plan items 2.2 and 2.3).
 */
export function CriticalMissLift({
  excerpt,
  resumeText,
  questions,
  onChange,
  idPrefix = "miss",
}: {
  excerpt: string;
  resumeText?: string;
  /** From `liftQuestions`; with none, one open question stands in for the fix. */
  questions: string[];
  onChange?: (change: LiftChange) => void;
  idPrefix?: string;
}) {
  const asked = questions.length > 0 ? questions : ["What would you add to this line?"];
  const [answers, setAnswers] = useState<LiftAnswer[]>(() => asked.map(() => ({ kind: "open" })));
  const [edited, setEdited] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [copying, setCopying] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const copied = useTransientFeedback();
  const baseId = useId();
  const editRef = useRef<HTMLTextAreaElement>(null);

  const source = useMemo(() => liftSourceLine(excerpt, resumeText), [excerpt, resumeText]);
  const composed = useMemo(() => composeRevisedLine(source.line, answers), [answers, source.line]);
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

  useEffect(() => { onChange?.({ state, line: policy?.copyable ? line : undefined }); }, [line, onChange, policy?.copyable, state]);
  useEffect(() => { if (editing) editRef.current?.focus(); }, [editing]);

  const setAnswer = (index: number, next: LiftAnswer) => {
    setAnswers((current) => current.map((answer, at) => (at === index ? next : answer)));
    // A new answer rebuilds the line from the resume and the answers.
    setEdited(null);
    setEditing(false);
    copied.reset();
  };

  const handleCopy = async () => {
    if (!line || !policy?.copyable || copying) return;
    setCopying(true);
    setCopyError(false);
    try {
      await navigator.clipboard.writeText(line);
      copied.trigger();
    } catch {
      setCopyError(true);
    } finally {
      setCopying(false);
    }
  };

  const answeredCount = resolved.filter(Boolean).length;
  const detailsDone = answeredCount === asked.length;
  const completeSteps = 2 + (detailsDone ? 1 : 0) + (policy?.copyable && detailsDone ? 1 : 0);
  const progress = (completeSteps / traceItems.length) * 100 + (completeSteps < traceItems.length ? 100 / traceItems.length / 2 : 0);
  const written = answeredValues(answers);

  return (
    <div className={styles.lift} data-testid="critical-miss-lift" data-state={state}>
      <LiftedTrace items={traceItems} progress={progress} ariaLabel="From your line to a revised line" className={styles.liftTrace} compact />

      <p className={styles.liftLead}>
        {questionLead(asked.length)} <span className={styles.liftLeadQuiet}>Only what&apos;s true. Skip anything you don&apos;t know.</span>
      </p>

      <ol className={styles.liftQuestions}>
        {asked.map((question, index) => {
          const answer = answers[index];
          const inputId = `${baseId}-${idPrefix}-q${index + 1}`;
          const skipped = answer.kind === "unknown" || answer.kind === "not_mine";
          return (
            <li key={question} className={styles.liftQuestion} data-testid="lift-question" data-skipped={skipped || undefined}>
              <label htmlFor={inputId} className={styles.liftQuestionText}>{question}</label>
              {skipped ? (
                <p className={styles.liftSkipped}>
                  {answer.kind === "unknown" ? "Left out for now." : "Left out. It's not your work."}
                  <button type="button" className={styles.textButton} onClick={() => setAnswer(index, { kind: "open" })}>Answer it</button>
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
                    <button type="button" className={styles.textButton} onClick={() => setAnswer(index, { kind: "unknown" })}>I don&apos;t know</button>
                    <button type="button" className={styles.textButton} onClick={() => setAnswer(index, { kind: "not_mine" })}>I didn&apos;t do this</button>
                  </div>
                </>
              )}
            </li>
          );
        })}
      </ol>

      <div className={styles.revised} data-ready={policy?.copyable || undefined}>
        <div className={styles.revisedHead}>
          <p className={styles.revisedLabel}>{edited !== null ? "Your wording" : "Revised line"}</p>
          {line && (
            <div className={styles.revisedActions}>
              <button type="button" className={styles.iconText} onClick={() => setEditing((value) => !value)} aria-pressed={editing}>
                {editing ? <Check className="size-4" aria-hidden="true" /> : <PencilSimple className="size-4" aria-hidden="true" />}
                {editing ? "Done" : "Edit"}
              </button>
              <button
                type="button"
                className={styles.iconText}
                data-primary
                onClick={handleCopy}
                disabled={!policy?.copyable}
                aria-busy={copying || undefined}
              >
                {!policy?.copyable ? <><Copy className="size-4" aria-hidden="true" />Copy</> : (
                  <ActionFeedback state={copying ? "pending" : copied.active ? "success" : "idle"} states={{
                    idle: { label: "Copy", icon: <Copy className="size-4" /> },
                    pending: { label: "Copying", icon: <CircleNotch className="size-4 motion-safe:animate-spin" /> },
                    success: { label: "Copied", icon: <Check className="size-4" weight="bold" /> },
                  }} />
                )}
              </button>
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
          <p className={styles.revisedText}>
            {edited === null && composed ? (
              <>
                {source.line.replace(/[.;,:\s]+$/u, "")}:{" "}
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
            {policy?.copyable
              ? edited === null
                ? "Every word is from your resume or your answers. Reword it however you like."
                : "Your wording. The facts all come from your line or your answers."
              : policy?.newFacts.length
                ? `“${policy.newFacts.join("”, “")}” isn't in your line or your answers. If it's true, add it as an answer first.`
                : "This changes a detail from your resume. Edit it back to what's true to copy it."}
          </p>
        )}
        {!source.full && line && (
          <p className={styles.revisedNote}>We only kept the part of the line we quoted, so paste this over that part.</p>
        )}
        {copyError && <p role="status" className={styles.revisedNote}>Couldn&apos;t copy. Select the text and copy it manually.</p>}
      </div>
    </div>
  );
}
