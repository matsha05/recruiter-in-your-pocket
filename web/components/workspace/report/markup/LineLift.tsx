"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, CircleNotch, Copy, PencilSimple } from "@phosphor-icons/react";
import { LiftedTrace } from "@/components/shared/LiftedTrace";
import { ActionFeedback } from "@/components/ui/action-feedback";
import { Button } from "@/components/ui/button";
import { Analytics } from "@/lib/analytics";
import { useTransientFeedback } from "@/hooks/use-transient-feedback";
import { useLineAnswerSave } from "@/hooks/use-line-answer-save";
import { getPendingLineAnswers, liftAnswersFromStored, LINE_ANSWER_LIMITS, storedAnswersFromLift, type LineAnswersPatch, type LineSource } from "@/lib/reports/line-answers";
import {
  answeredValues,
  composeRevisedLine,
  liftSourceLine,
  liftState,
  revisedLinePolicy,
  type LiftAnswer,
  type LiftState,
} from "@/lib/reports/revised-line";
import {
  checkPolishedLine,
  fetchPolishedLine,
  POLISH_ALLOWS_JOINERS,
  type RevisedLinePolishRequest,
} from "@/lib/reports/revised-line-polish";
import { guardMessage, guardOffersExactWords, readGuardVerdict } from "./guardCopy";
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

/** Answers kept with a saved report, lined up with today's questions by `liftAnswersFromStored`. */
export interface LiftInitial {
  answers: LiftAnswer[];
  line: string | null;
  source: LineSource;
}

/** The question a fix asks when the report gave it none. */
export const DEFAULT_LIFT_QUESTION = "What would you add to this line?";

/** Resolves false when the answers or chosen line weren't kept. */
export type LiftPersistHandler = (change: LineAnswersPatch) => Promise<boolean> | boolean | void;

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
  polishContext,
  initial: storedInitial,
  onPersist,
  fixIndex = 0,
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
  /** The report this line belongs to, so the server can offer a smoother line. Absent on the sample. */
  polishContext?: RevisedLinePolishRequest["context"];
  /** Answers kept with a saved report (W3). */
  initial?: LiftInitial;
  /** Keeps the answers and the chosen line with the saved report. Absent when there is nowhere to keep them. */
  onPersist?: LiftPersistHandler;
  /** Stable position in the saved report, shared with the answer writer. */
  fixIndex?: number;
}) {
  const asked = useMemo(() => (questions.length > 0 ? questions : [DEFAULT_LIFT_QUESTION]), [questions]);
  const reportId = polishContext?.reportId;
  const [pendingSave] = useState(() => reportId ? getPendingLineAnswers(reportId, fixIndex) : null);
  // A clear or an unfinished edit in this tab takes precedence over the last server response.
  const initial = pendingSave
    ? liftAnswersFromStored({ ...pendingSave.patch, updated_at: "" }, asked) ?? undefined
    : storedInitial;
  const saveContext = useMemo(() => reportId ? { reportId, fixIndex, draft: pendingSave } : undefined, [fixIndex, pendingSave, reportId]);
  const { state: kept, schedule, retry } = useLineAnswerSave(onPersist, Boolean(storedInitial), saveContext);
  // Answers are kept by question, so a report still streaming in can add questions without losing any.
  const [byQuestion, setByQuestion] = useState<Record<string, LiftAnswer>>(() => {
    if (!initial) return {};
    return Object.fromEntries(asked.map((question, index) => [question, initial.answers[index] ?? { kind: "open" }]).filter(([, answer]) => (answer as LiftAnswer).kind !== "open"));
  });
  const askedKey = asked.join("\n");
  const answers = useMemo<LiftAnswer[]>(
    () => askedKey.split("\n").map((question) => byQuestion[question] ?? { kind: "open" }),
    [byQuestion, askedKey],
  );
  const [edited, setEdited] = useState<string | null>(initial?.source === "edited" ? initial.line : null);
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
  const resolved = answers.map((answer) => (answer.kind === "answered" ? answer.value.trim().length > 0 : answer.kind !== "open"));
  const allResolved = resolved.every(Boolean);

  // Guarded polish: the literal line shows at once; a smoother one replaces it only if it passes the guard.
  const [polished, setPolished] = useState<{ literal: string; line: string } | null>(null);
  const [useExact, setUseExact] = useState(initial?.source === "literal");
  // A kept polished line shows at once; the server is asked again only when the answers change.
  const [keptPolish] = useState(() => initial?.source === "polished" && initial.line && composed
    ? { literal: composed, line: initial.line }
    : null);
  const recoveryId = polishContext?.recoveryId;
  useEffect(() => {
    if ((!reportId && !recoveryId) || !composed || edited !== null || !allResolved) return;
    if (polished?.literal === composed || keptPolish?.literal === composed) return;
    const values = answeredValues(answers);
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      const proposal = await fetchPolishedLine({ context: { reportId, recoveryId }, excerpt, line: sourceLine.line, answers: values }, controller.signal);
      if (!proposal || controller.signal.aborted) return;
      const check = checkPolishedLine(
        { sourceLine: sourceLine.line, answers: values, literal: composed, polished: proposal },
        { allowJoiners: POLISH_ALLOWS_JOINERS },
      );
      if (check.ok) setPolished({ literal: composed, line: proposal.trim() });
    }, 1200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [allResolved, answers, composed, edited, excerpt, keptPolish?.literal, polished?.literal, recoveryId, reportId, sourceLine.line]);
  const polishedLine = polished && polished.literal === composed ? polished.line : (keptPolish && keptPolish.literal === composed ? keptPolish.line : null);
  const showPolished = edited === null && Boolean(polishedLine) && !useExact;

  const line = edited ?? (showPolished ? polishedLine! : composed);
  const policy = useMemo(() => {
    if (!line) return undefined;
    if (showPolished && composed) {
      const check = checkPolishedLine(
        { sourceLine: sourceLine.line, answers: answeredValues(answers), literal: composed, polished: line },
        { allowJoiners: POLISH_ALLOWS_JOINERS },
      );
      return { copyable: check.ok, newFacts: [] as string[], refusal: undefined };
    }
    return revisedLinePolicy({ resumeText, excerpt, line, answers });
  }, [answers, composed, excerpt, line, resumeText, showPolished, sourceLine.line]);
  const state = liftState(
    answers.map((answer, index) => (answer.kind === "answered" && !resolved[index] ? { kind: "open" } : answer)),
    policy?.copyable ? line : undefined,
  );
  const copyableLine = policy?.copyable ? line : undefined;
  const verdict = useMemo(() => readGuardVerdict(policy), [policy]);
  const guardNote = line ? guardMessage(verdict) : null;

  useEffect(() => { onChange?.({ state, line: copyableLine }); }, [copyableLine, onChange, state]);

  useEffect(() => { if (editing) editRef.current?.focus(); }, [editing]);

  const lineSource: LineSource = edited !== null ? "edited" : showPolished ? "polished" : "literal";
  const lineTooLong = lineSource !== "literal" && Boolean(copyableLine && copyableLine.length > LINE_ANSWER_LIMITS.line);
  const makePatch = useCallback((nextAnswers: LiftAnswer[], nextLine: string | null | undefined, nextSource: LineSource): LineAnswersPatch => {
    const stored = storedAnswersFromLift(asked, nextAnswers);
    return {
      fix_index: fixIndex,
      answers: stored,
      // A literal line can be rebuilt from its answers. Custom wording must remain in the
      // pending draft if the server rejects its length, never be acknowledged as a null line.
      line: stored.length && nextLine && (nextSource !== "literal" || nextLine.length <= LINE_ANSWER_LIMITS.line) ? nextLine : null,
      source: stored.length ? nextSource : "literal",
    };
  }, [asked, fixIndex]);
  const patch = useMemo(() => makePatch(answers, copyableLine, lineSource), [answers, copyableLine, lineSource, makePatch]);
  const lastScheduled = useRef(JSON.stringify(patch));
  const hasEdited = useRef(false);
  const schedulePatch = useCallback((next: LineAnswersPatch) => {
    const key = JSON.stringify(next);
    if (lastScheduled.current === key) return;
    lastScheduled.current = key;
    schedule(next);
  }, [schedule]);
  // User actions stage synchronously below so leaving during the debounce keeps them.
  // Follow later guarded polish too, but mounting a failed draft must never silently retry it.
  useEffect(() => {
    if (hasEdited.current) schedulePatch(patch);
  }, [patch, schedulePatch]);

  const setAnswer = (index: number, next: LiftAnswer) => {
    hasEdited.current = true;
    const nextAnswers = answers.map((answer, position) => position === index ? next : answer);
    const literal = composeRevisedLine(sourceLine.line, nextAnswers);
    const safe = literal && revisedLinePolicy({ resumeText, excerpt, line: literal, answers: nextAnswers }).copyable;
    schedulePatch(makePatch(nextAnswers, safe ? literal : null, "literal"));
    setByQuestion((current) => ({ ...current, [asked[index]]: next }));
    // A new answer rebuilds the line from the resume and the answers.
    setEdited(null);
    setEditing(false);
    copied.reset();
  };

  const editLine = (value: string) => {
    hasEdited.current = true;
    const safe = revisedLinePolicy({ resumeText, excerpt, line: value, answers }).copyable;
    schedulePatch(makePatch(answers, safe ? value : null, "edited"));
    setEdited(value);
  };

  const chooseLine = (exact: boolean) => {
    hasEdited.current = true;
    const selected = exact ? composed : polishedLine;
    const safe = selected && (exact
      ? revisedLinePolicy({ resumeText, excerpt, line: selected, answers }).copyable
      : composed && checkPolishedLine({ sourceLine: sourceLine.line, answers: answeredValues(answers), literal: composed, polished: selected }, { allowJoiners: POLISH_ALLOWS_JOINERS }).ok);
    schedulePatch(makePatch(answers, safe ? selected : null, exact ? "literal" : "polished"));
    setEdited(null);
    setEditing(false);
    setUseExact(exact);
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
      hasEdited.current = true;
      const literal = composeRevisedLine(liftSourceLine(excerpt, pasted).line, answers);
      const safe = literal && revisedLinePolicy({ resumeText: pasted, excerpt, line: literal, answers }).copyable;
      schedulePatch(makePatch(answers, safe ? literal : null, "literal"));
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
    <div className={styles.lift} data-testid="line-lift" data-state={state} data-kept={onPersist ? kept : undefined}>
      <LiftedTrace items={traceItems} progress={progress} ariaLabel="From your line to a revised line" className={styles.liftTrace} compact />

      <p className={styles.liftLead}>
        {asked.length > 1 ? "Answer and we'll add them to your line." : "Answer and we'll add it to your line."}
        <span className={styles.liftLeadQuiet}>Only what&apos;s true.</span>
      </p>

      <ol className={styles.liftQuestions}>
        {asked.map((question, index) => {
          const answer = answers[index];
          const inputId = `${baseId}-q${index + 1}`;
          const skipped = answer.kind === "unknown" || answer.kind === "not_mine";
          return (
            <li key={question} className={styles.liftQuestion} data-testid="lift-question" data-skipped={skipped || undefined}>
              <label id={`${inputId}-label`} htmlFor={inputId} className={styles.liftQuestionText}>{question}</label>
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
                    maxLength={LINE_ANSWER_LIMITS.text}
                    autoComplete="off"
                  />
                  <div className={styles.liftSkips}>
                    <Button type="button" variant="quiet" size="sm" aria-describedby={`${inputId}-label`} onClick={() => setAnswer(index, { kind: "unknown" })}>I don&apos;t know</Button>
                    <Button type="button" variant="quiet" size="sm" aria-describedby={`${inputId}-label`} onClick={() => setAnswer(index, { kind: "not_mine" })}>I didn&apos;t do this</Button>
                  </div>
                </>
              )}
            </li>
          );
        })}
      </ol>

      <div className={styles.revised} data-ready={copyableLine ? true : undefined}>
        {/* The label waits for a line, or for the answer that there is none to write. */}
        {(line || state === "not_mine" || state === "unknown") && (
        <div className={styles.revisedHead}>
          <p className={styles.revisedLabel}>{edited !== null ? "Your wording" : "Revised line"}</p>
          {line && (
            <div className={styles.revisedActions}>
              <Button type="button" variant="quiet" size="sm" onClick={() => setEditing((value) => !value)} aria-pressed={editing}>
                {editing ? <Check className="size-4" aria-hidden="true" /> : <PencilSimple className="size-4" aria-hidden="true" />}
                {editing ? "Done" : "Edit"}
              </Button>
              <Button type="button" variant="quiet" size="sm" onClick={handleCopy} disabled={!copyableLine} aria-disabled={!copyableLine || copying} aria-busy={copying || undefined}>
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
        )}

        {!line ? (
          (state === "not_mine" || state === "unknown") && (
            <p className={styles.revisedEmpty}>
              {state === "not_mine"
                ? "Then this one isn't yours to fix. Keep the line as it is."
                : "Keep the line as it is for now. If you can find out, it's worth adding."}
            </p>
          )
        ) : editing ? (
          <textarea
            ref={editRef}
            className={styles.revisedInput}
            value={line}
            onChange={(event) => editLine(event.target.value)}
            maxLength={LINE_ANSWER_LIMITS.line}
            aria-label="Edit your revised line"
            rows={4}
          />
        ) : (
          <p className={styles.revisedText} data-testid="revised-line">
            {edited === null && composed && !showPolished ? (
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
                ? "Every word is from your resume or your answers."
                : "The facts all come from your line or your answers."
              : guardNote}
          </p>
        )}
        {onPersist && kept !== "idle" && (
          <p className={styles.revisedNote} data-testid="line-kept" aria-live="polite">
            {lineTooLong ? "Shorten this line to 600 characters to save it."
              : kept === "kept" ? (patch.answers.length ? "Kept with this report." : "Cleared from this report.")
              : kept === "saving" ? "Keeping this with your report…"
                : "Our bad. We couldn't save these changes."}
            {kept === "failed" && !lineTooLong && <>{" "}<Button type="button" variant="quiet" size="sm" onClick={retry}>Try saving again</Button></>}
          </p>
        )}
        {line && !copyableLine && edited !== null && guardOffersExactWords(verdict) && (
          <div className={styles.liftSkips}>
            <Button type="button" variant="quiet" size="sm" onClick={() => chooseLine(true)}>Use my exact words</Button>
          </div>
        )}
        {edited === null && polishedLine && (
          <div className={styles.liftSkips}>
            <Button type="button" variant="quiet" size="sm" onClick={() => chooseLine(!useExact)} aria-pressed={useExact}>
              {showPolished ? "Use my exact words" : "Use the smoothed line"}
            </Button>
          </div>
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
