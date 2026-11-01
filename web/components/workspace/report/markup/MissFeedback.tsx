"use client";

import { useId, useState } from "react";
import { Check } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import styles from "./MarkedUpReport.module.css";

export interface MissFeedbackValue {
  right: boolean;
  note?: string;
}

/** "Was this right?" on the Critical Miss. Answers feed the eval set (plan item 2.6). */
export function MissFeedback({
  onSubmit,
  suggestNo = false,
}: {
  onSubmit?: (value: MissFeedbackValue) => void;
  /** The candidate said the Critical Miss describes work they didn't do. */
  suggestNo?: boolean;
}) {
  const [answer, setAnswer] = useState<"yes" | "no" | null>(null);
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);
  const noteId = useId();
  const choice = answer ?? (suggestNo ? "no" : null);

  if (sent) {
    return (
      <div className={styles.feedback} role="status">
        <p className={styles.feedbackDone}>
          <Check className="size-4 shrink-0 text-brand" weight="bold" aria-hidden="true" />
          Thanks. Answers like this are how we check the read.
        </p>
      </div>
    );
  }

  const send = (value: MissFeedbackValue) => {
    onSubmit?.(value);
    setSent(true);
  };

  return (
    <div className={styles.feedback} data-testid="miss-feedback">
      <fieldset>
        <legend className={styles.feedbackQuestion}>Was this the right thing to fix first?</legend>
        <div className={styles.feedbackChoices}>
          <button type="button" className={styles.choice} aria-pressed={choice === "yes"} onClick={() => send({ right: true })}>Yes</button>
          <button type="button" className={styles.choice} aria-pressed={choice === "no"} onClick={() => setAnswer("no")}>No</button>
        </div>
      </fieldset>
      {choice === "no" && (
        <div className={styles.feedbackMore}>
          <label htmlFor={noteId} className={styles.feedbackLabel}>What should it have been? <span className={styles.optional}>Optional</span></label>
          <textarea id={noteId} className={styles.feedbackInput} value={note} onChange={(event) => setNote(event.target.value)} rows={2} />
          <Button type="button" variant="outline" size="sm" className="justify-self-start" onClick={() => send({ right: false, note: note.trim() || undefined })}>Send</Button>
        </div>
      )}
    </div>
  );
}
