"use client";

import { useId, useState } from "react";
import { Check } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import styles from "./MarkedReport.module.css";

export interface MissFeedbackValue {
  right: boolean;
  note?: string;
}

/**
 * "Was this right?" on the Critical Miss (plan item 2.6). The answer goes to
 * /api/report-feedback, which keeps it for the eval set.
 */
export function MissFeedback({
  question,
  onSubmit,
  suggestNo = false,
}: {
  question: string;
  /** Resolves false when the answer couldn't be recorded. */
  onSubmit?: (value: MissFeedbackValue) => Promise<boolean> | boolean | void;
  /** The candidate said the line describes work they didn't do. */
  suggestNo?: boolean;
}) {
  const [answer, setAnswer] = useState<"no" | null>(null);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const noteId = useId();
  const showNote = answer === "no" || suggestNo;

  if (status === "sent") {
    return (
      <div className={styles.feedback} role="status">
        <p className={styles.feedbackDone}>
          <Check className="size-4 shrink-0 text-brand" weight="bold" aria-hidden="true" />
          Thanks. Answers like this are how we check the read.
        </p>
      </div>
    );
  }

  const send = async (value: MissFeedbackValue) => {
    setStatus("sending");
    const recorded = await onSubmit?.(value);
    setStatus(recorded === false ? "failed" : "sent");
  };

  return (
    <div className={styles.feedback} data-testid="miss-feedback">
      <fieldset>
        <legend className={styles.feedbackQuestion}>{question}</legend>
        <div className={styles.feedbackChoices}>
          <Button type="button" variant="secondary" size="sm" disabled={status === "sending"} onClick={() => send({ right: true })}>Yes</Button>
          <Button type="button" variant="secondary" size="sm" disabled={status === "sending"} aria-expanded={showNote} onClick={() => setAnswer("no")}>No</Button>
        </div>
      </fieldset>
      {showNote && (
        <div className={styles.feedbackMore}>
          <label htmlFor={noteId} className={styles.feedbackLabel}>What should it have been? <span className={styles.optional}>Optional</span></label>
          <textarea id={noteId} className={styles.feedbackInput} value={note} onChange={(event) => setNote(event.target.value)} rows={2} maxLength={600} />
          <div>
            <Button type="button" variant="secondary" size="sm" disabled={status === "sending"} onClick={() => send({ right: false, note: note.trim() || undefined })}>Send</Button>
          </div>
        </div>
      )}
      {status === "failed" && <p role="alert" className={styles.reattachError}>Couldn&apos;t send that. Try again in a moment.</p>}
    </div>
  );
}
