"use client";

import { useState } from "react";
import { Check, CircleNotch, Copy } from "@phosphor-icons/react";
import { Paper } from "@/components/materials/Paper";
import { ActionFeedback } from "@/components/ui/action-feedback";
import { Button } from "@/components/ui/button";
import { useTransientFeedback } from "@/hooks/use-transient-feedback";
import { Analytics } from "@/lib/analytics";
import { QUOTED_KINDS, type WorklistCard } from "@/lib/llm/worklist-schema";
import { cardLabel, exampleSegments, finishedLinesWording, type BlankAnswers } from "@/lib/reports/worklist-presentation";
import { cn } from "@/lib/utils";
import styles from "./Worklist.module.css";

export type FinishedLine = { line: string; answers: BlankAnswers };

/**
 * The finished lines (Nov 11, 2026): every line whose blanks the person filled, in the report's order, as it was
 * written and as it reads now, with one button that copies them all. The report asked a question per line; this
 * is where the answers come back as something to paste into the resume tonight.
 *
 * Nothing here is new writing. Each line is the card's example with the person's own words in the blanks, and
 * their words are set in the candidate's blue, so what came from the resume and what came from them stay apart.
 */
export function FinishedLines({ cards, finished, document = "resume" }: {
  cards: ReadonlyArray<WorklistCard>;
  finished: Readonly<Record<number, FinishedLine>>;
  document?: "resume" | "linkedin";
}) {
  const wording = finishedLinesWording(document);
  const copied = useTransientFeedback();
  const [copying, setCopying] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const rows = cards.flatMap((card, index) => (finished[index] ? [{ card, index, ...finished[index] }] : []));
  if (rows.length === 0) return null;

  const handleCopyAll = async () => {
    if (copying) return;
    setCopying(true);
    setCopyError(false);
    try {
      await navigator.clipboard.writeText(rows.map((row) => row.line).join("\n"));
      copied.trigger();
      Analytics.track("worklist_lines_copied", { count: rows.length });
    } catch {
      setCopyError(true);
    } finally {
      setCopying(false);
    }
  };

  return (
    <section id="section-finished" className={cn(styles.page, styles.finished, "scroll-mt-36")} aria-labelledby="finished-title" data-testid="finished-lines">
      <h2 id="finished-title" className={styles.sectionTitle}>{wording.title}</h2>
      <p className={styles.sectionLead}>{wording.lead}</p>
      <ol className={styles.finishedList}>
        {rows.map((row) => (
          <li key={row.index} data-testid="finished-line">
            <p className={styles.where}>{cardLabel(row.card)}</p>
            {QUOTED_KINDS.has(row.card.kind) && <p className={styles.finishedBefore}><span className="sr-only">As written: </span>{row.card.line}</p>}
            <Paper kind="strip" className={styles.strip}>
              <p className={styles.quote}>
                <span className="sr-only">Now: </span>
                {exampleSegments(row.card.example).map((segment, i) => segment.kind === "text"
                  ? <span key={i}>{segment.text}</span>
                  : <span key={i} className={styles.blankFilled}>{(row.answers[segment.index] ?? "").trim()}</span>)}
              </p>
            </Paper>
          </li>
        ))}
      </ol>
      <div className={styles.tools}>
        <Button type="button" variant="secondary" size="sm" onClick={handleCopyAll} aria-busy={copying || undefined} data-testid="finished-copy-all">
          <ActionFeedback state={copying ? "pending" : copied.active ? "success" : "idle"} states={{
            idle: { label: rows.length === 1 ? wording.copyOne : wording.copyAll(rows.length), icon: <Copy className="size-4" /> },
            pending: { label: "Copying", icon: <CircleNotch className="size-4 motion-safe:animate-spin" /> },
            success: { label: "Copied", icon: <Check className="size-4" weight="bold" /> },
          }} />
        </Button>
      </div>
      {copyError && <p role="status" className={styles.note}>Couldn&apos;t copy. Select the lines and copy them yourself.</p>}
    </section>
  );
}
