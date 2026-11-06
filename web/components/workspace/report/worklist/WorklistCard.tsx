"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, CircleNotch, Copy } from "@phosphor-icons/react";
import { Paper } from "@/components/materials/Paper";
import { MarkerStroke } from "@/components/materials/Pen";
import clip from "@/components/materials/Clipping.module.css";
import { ActionFeedback } from "@/components/ui/action-feedback";
import { Button } from "@/components/ui/button";
import { useSeen } from "@/hooks/use-seen";
import { useTransientFeedback } from "@/hooks/use-transient-feedback";
import { Analytics } from "@/lib/analytics";
import type { WorklistCard as Card } from "@/lib/llm/worklist-schema";
import type { LineAnswersPatch, StoredLineAnswers } from "@/lib/reports/line-answers";
import {
  blankAnswersFromStored,
  blankLabels,
  cardLabel,
  cardPosition,
  composeExample,
  exampleSegments,
  KEEP_SECONDARY_LABEL,
  storedAnswersForCard,
  type BlankAnswers,
} from "@/lib/reports/worklist-presentation";
import { cn } from "@/lib/utils";
import styles from "./Worklist.module.css";

/** The lines just above and below the quoted one, so the line reads as a clipping cut from the page. */
function neighbours(resumeText: string | undefined, line: string): { above?: string; below?: string } {
  if (!resumeText || !line) return {};
  const lines = resumeText.replace(/\r\n?/gu, "\n").split("\n").map((value) => value.trim().replace(/^[-•*]\s+/u, ""));
  const key = line.trim().replace(/^[-•*]\s+/u, "").replace(/\s+/g, " ").toLocaleLowerCase();
  const index = lines.findIndex((value) => value.replace(/\s+/g, " ").toLocaleLowerCase().includes(key));
  if (index === -1) return {};
  const pick = (from: number, step: number) => {
    for (let i = from; i >= 0 && i < lines.length; i += step) if (lines[i]) return lines[i];
    return undefined;
  };
  return { above: pick(index - 1, -1), below: pick(index + 1, 1) };
}

/** A blank's field is as wide as what it holds: its name until the person types, then their words. */
function blankWidth(label: string, value: string) {
  return `calc(${Math.min(Math.max(label.length, value.trim().length, 3) + 1, 56)}ch + 0.5em)`;
}

/** Punctuation that follows a blank stays on the blank's line, so a comma never opens the next line alone. */
const TRAILING_PUNCTUATION = /^[,.;:!?)]+/u;

export type CardState = "open" | "filled" | "left";

export interface WorklistCardProps {
  card: Card;
  index: number;
  /** Every card, so the label can say where this one sits among the ones that need work. */
  cards: ReadonlyArray<Card>;
  resumeText?: string;
  /** The sample can be played with, but nothing is kept; a saved report keeps the answers. */
  isSample?: boolean;
  initial?: StoredLineAnswers;
  onPersist?: (patch: LineAnswersPatch) => Promise<boolean> | boolean | void;
  onStateChange?: (index: number, state: CardState) => void;
}

/**
 * One entry of the worklist: where the line sits (the margin), the line as written with the marker across it
 * and what a recruiter can't tell from it (the evidence), then the question and the example with the detail in
 * (the answer). The example is the form: each blank is a field inside the sentence, in the candidate's blue,
 * and their words go into it as written. Nothing outside a bracket was invented: the validator held every fact
 * in the example to the resume. Copy waits until every blank is filled.
 */
export function WorklistCard({ card, index, cards, resumeText, isSample = false, initial, onPersist, onStateChange }: WorklistCardProps) {
  const labels = useMemo(() => blankLabels(card.example), [card.example]);
  const segments = useMemo(() => exampleSegments(card.example), [card.example]);
  const restored = useMemo(() => blankAnswersFromStored(card.example, initial), [card.example, initial]);
  const [answers, setAnswers] = useState<BlankAnswers>(() => restored?.answers ?? labels.map(() => ""));
  const [left, setLeft] = useState(restored?.left ?? false);
  const [copying, setCopying] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const copied = useTransientFeedback();
  const baseId = useId();
  const filterId = `card-marker-${baseId.replace(/[^a-zA-Z0-9]/g, "")}`;
  const { ref: lineRef, seen } = useSeen<HTMLQuoteElement>(0.6);

  const quoted = card.kind === "line" || card.kind === "keep";
  const around = quoted ? neighbours(resumeText, card.line) : {};
  const composed = useMemo(() => (left ? null : composeExample(card.example, answers)), [answers, card.example, left]);
  const state: CardState = left ? "left" : composed && labels.length > 0 ? "filled" : "open";
  const answeredAny = answers.some((answer) => answer.trim());
  const asks = card.kind !== "keep" && Boolean(card.question) && labels.length > 0;
  const fillable = asks && !left;

  useEffect(() => { onStateChange?.(index, state); }, [index, onStateChange, state]);

  // Keep the answers with the saved report once they settle; nothing is kept until something is answered or left.
  const [kept, setKept] = useState<"idle" | "saving" | "kept" | "failed">(initial ? "kept" : "idle");
  const persistKey = JSON.stringify({ answers, left, composed });
  const lastPersisted = useRef<string | null>(initial ? persistKey : null);
  useEffect(() => {
    if (!onPersist || (!answeredAny && !left) || lastPersisted.current === persistKey) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      lastPersisted.current = persistKey;
      setKept("saving");
      Promise.resolve(onPersist({ fix_index: index, answers: storedAnswersForCard(card.example, answers, left), line: composed, source: "literal" }))
        .then((ok) => { if (!cancelled) setKept(ok === false ? "failed" : "kept"); })
        .catch(() => { if (!cancelled) setKept("failed"); });
    }, 1500);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [answeredAny, answers, card.example, composed, index, left, onPersist, persistKey]);

  const setAnswer = (position: number, value: string) => {
    setAnswers((current) => current.map((answer, i) => (i === position ? value : answer)));
    setLeft(false);
    copied.reset();
  };

  const handleCopy = async () => {
    if (!composed || copying) return;
    setCopying(true);
    setCopyError(false);
    try {
      await navigator.clipboard.writeText(composed);
      copied.trigger();
      Analytics.track("worklist_line_copied", { kind: card.kind });
    } catch {
      setCopyError(true);
    } finally {
      setCopying(false);
    }
  };

  const position = cardPosition(cards, index);
  const questionId = `${baseId}-question`;

  return (
    <li id={`section-card-${index + 1}`} className={styles.card} data-kind={card.kind} data-state={state} data-sample={isSample || undefined} data-testid="worklist-card">
      {/* The margin: where the line sits on the page, and how far along the list this is. */}
      <div className={styles.margin}>
        <p className={styles.where}>
          {card.kind === "keep" && <Check className={styles.keepTick} weight="bold" aria-hidden="true" />}
          {cardLabel(card)}
        </p>
        {position && <p className={styles.whereQuiet}>{position}</p>}
        {card.kind === "keep" && cards.some((other) => other.kind !== "keep") && <p className={styles.whereQuiet}>{KEEP_SECONDARY_LABEL}</p>}
        {state === "filled" && <p className={styles.filled}><Check className="size-3.5" weight="bold" aria-hidden="true" />Filled in</p>}
      </div>

      {/* The evidence: the line as written, and what a recruiter can't tell from it. */}
      <div className={styles.evidence}>
        {card.kind === "keep" ? (
          <blockquote className={styles.keepLine}>{card.line}</blockquote>
        ) : quoted ? (
          /* The line as the site's clipping: on its strip, the neighbours fading off the cut edges, the marker across it. */
          <Paper kind="strip" className={cn(styles.strip, seen && clip.marked)}>
            {around.above && <p className={cn(clip.ghost, clip.ghostTop)} aria-hidden="true">{around.above}</p>}
            <blockquote ref={lineRef} className={styles.quote}>
              <span className={clip.line}><MarkerStroke drawn={seen} filterId={filterId} />{card.line}</span>
            </blockquote>
            {around.below && <p className={cn(clip.ghost, clip.ghostBottom)} aria-hidden="true">{around.below}</p>}
          </Paper>
        ) : (
          <p className={styles.statement}>{card.line}</p>
        )}
        <p className={styles.cannot}>{card.cannot_tell}</p>
      </div>

      {/* The answer: the question, then the example with the detail in. The blanks are the fields. */}
      {(card.example || asks) && (
        <div className={styles.answer}>
          {card.kind !== "keep" && card.question && <p className={styles.question} id={questionId}>{card.question}</p>}
          {card.example && (
            <p
              className={styles.example}
              data-testid="worklist-example"
              role={fillable ? "group" : undefined}
              aria-labelledby={fillable ? questionId : undefined}
            >
              {segments.map((segment, i) => {
                if (segment.kind === "text") {
                  const previous = segments[i - 1];
                  const text = previous?.kind === "blank" && fillable ? segment.text.replace(TRAILING_PUNCTUATION, "") : segment.text;
                  return text ? <span key={i}>{text}</span> : null;
                }
                const answer = answers[segment.index] ?? "";
                const next = segments[i + 1];
                const trailing = next?.kind === "text" ? (next.text.match(TRAILING_PUNCTUATION)?.[0] ?? "") : "";
                if (!fillable) {
                  return answer.trim()
                    ? <span key={i} className={styles.blankFilled}>{answer.trim()}</span>
                    : <span key={i} className={styles.blank} data-open="">[{segment.label}]</span>;
                }
                return (
                  <span key={i} className={styles.blankField} data-filled={answer.trim() ? "" : undefined} data-long={Math.max(segment.label.length, answer.trim().length) > 28 ? "" : undefined}>
                    <input
                      id={`${baseId}-blank-${segment.index}`}
                      type="text"
                      className={styles.blankInput}
                      style={{ width: blankWidth(segment.label, answer) }}
                      value={answer}
                      onChange={(event) => setAnswer(segment.index, event.target.value)}
                      placeholder={segment.label}
                      aria-label={segment.label}
                      autoComplete="off"
                      maxLength={300}
                      data-testid="worklist-blank"
                    />{trailing}
                  </span>
                );
              })}
            </p>
          )}
          {asks && (
            left ? (
              <p className={styles.note} data-testid="worklist-left">
                Left for now. A blank reads as a question, and recruiters don&apos;t call to ask it.{" "}
                <Button type="button" variant="quiet" size="sm" onClick={() => setLeft(false)}>Fill it in after all</Button>
              </p>
            ) : (
              <>
                <div className={styles.tools}>
                  {/* Copy appears once the line is earned: every blank filled. Until then the card asks, it doesn't offer. */}
                  {composed && (
                    <Button type="button" variant="secondary" size="sm" onClick={handleCopy} aria-busy={copying || undefined} data-testid="worklist-copy">
                      <ActionFeedback state={copying ? "pending" : copied.active ? "success" : "idle"} states={{
                        idle: { label: "Copy the line", icon: <Copy className="size-4" /> },
                        pending: { label: "Copying", icon: <CircleNotch className="size-4 motion-safe:animate-spin" /> },
                        success: { label: "Copied", icon: <Check className="size-4" weight="bold" /> },
                      }} />
                    </Button>
                  )}
                  {!answeredAny && (
                    <Button type="button" variant="quiet" size="sm" onClick={() => setLeft(true)}>I don&apos;t know yet</Button>
                  )}
                </div>
                {composed && <p className={styles.note}>Every fact in it is from your resume or your answers.</p>}
                {copyError && <p role="status" className={styles.note}>Couldn&apos;t copy. Select the text and copy it yourself.</p>}
                {onPersist && kept !== "idle" && (
                  <p className={styles.note} data-testid="worklist-kept" aria-live="polite">
                    {kept === "kept" ? "Kept with this report." : kept === "saving" ? "Keeping this with your report…" : "We couldn't keep this with your report just now. Copy the line to be safe."}
                  </p>
                )}
              </>
            )
          )}
        </div>
      )}
    </li>
  );
}
