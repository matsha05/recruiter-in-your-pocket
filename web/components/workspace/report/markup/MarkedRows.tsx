"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, LockKey } from "@phosphor-icons/react";
import { Mark, useSeen } from "@/components/research/figures/FigureKit";
import { Button } from "@/components/ui/button";
import { JOB_SEARCH_PASS_DECISION } from "@/lib/billing/pricing";
import { marginNoteFromFix } from "@/lib/reports/revised-line";
import { cn } from "@/lib/utils";
import type { ReportData } from "../ReportTypes";
import { LineLift, type LiftChange, type ResumeSource } from "./LineLift";
import { MissFeedback, type MissFeedbackValue } from "./MissFeedback";
import styles from "./MarkedReport.module.css";

type Fix = NonNullable<ReportData["top_fixes"]>[number];

export function excerptOf(fix?: Fix) {
  if (!fix?.evidence) return "";
  return typeof fix.evidence === "string" ? fix.evidence : fix.evidence.excerpt || "";
}

function sectionOf(fix?: Fix) {
  if (!fix?.evidence || typeof fix.evidence === "string") return fix?.section_ref;
  return fix.evidence.section || fix.section_ref;
}

/** The quoted line as the reader sees it on the page, without the resume's bullet mark. */
export function quotedLine(fix?: Fix) {
  return excerptOf(fix).trim().replace(/^[-•*]\s+/u, "");
}

interface LiftProps {
  resumeText?: string;
  source: ResumeSource;
  questions: string[];
  onReattach?: (text: string) => string | null;
}

/** A hidden suggestion keeps its place in the page; after Hide, focus lands on "Bring it back". */
function HiddenRow({ label, onRestore, focus }: { label: string; onRestore: () => void; focus: boolean }) {
  const restoreRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (focus) restoreRef.current?.focus(); }, [focus]);
  return (
    <div className={styles.hiddenRow}>
      <p>{label} hidden. It stays hidden on this device.</p>
      <Button ref={restoreRef} type="button" variant="quiet" size="sm" onClick={onRestore}>Bring it back</Button>
    </div>
  );
}

/**
 * Focus follows the reader's own Hide and Bring it back, never a fix that was
 * already hidden when the page loaded.
 */
function useHideFocus(hidden: boolean, onHide: () => void, onRestore: () => void) {
  const rowRef = useRef<HTMLLIElement>(null);
  const [byReader, setByReader] = useState<"hid" | "restored" | null>(null);
  useEffect(() => {
    if (byReader === "restored" && !hidden) rowRef.current?.focus();
  }, [byReader, hidden]);
  return {
    rowRef,
    focusRestore: byReader === "hid",
    hide: () => { setByReader("hid"); onHide(); },
    restore: () => { setByReader("restored"); onRestore(); },
  };
}

export function CriticalMissRow({
  fix,
  why,
  nothingCritical,
  hidden,
  onHide,
  onRestore,
  onLiftChange,
  liftState,
  feedback,
  ...lift
}: LiftProps & {
  fix: Fix;
  why?: string;
  nothingCritical: boolean;
  hidden: boolean;
  onHide: () => void;
  onRestore: () => void;
  onLiftChange: (change: LiftChange) => void;
  liftState: LiftChange["state"];
  /** Omitted on the sample, which has no one to ask. */
  feedback?: { question: string; onSubmit: (value: MissFeedbackValue) => Promise<boolean> };
}) {
  const { ref: lineRef, seen } = useSeen<HTMLQuoteElement>(0.6);
  const { rowRef, focusRestore, hide, restore } = useHideFocus(hidden, onHide, onRestore);
  const label = nothingCritical ? "Nothing critical" : "Critical Miss";
  const [openLift, setOpenLift] = useState(!nothingCritical);

  if (hidden) {
    return (
      <li id="section-fix-1" className={styles.row} data-kind="miss" data-testid="critical-miss">
        <HiddenRow label={label} onRestore={restore} focus={focusRestore} />
      </li>
    );
  }

  return (
    <li ref={rowRef} tabIndex={-1} id="section-fix-1" className={styles.row} data-kind="miss" data-optional={nothingCritical || undefined} data-state={liftState} data-testid="critical-miss">
      <div className={styles.lineCell}>
        {sectionOf(fix) && <p className={styles.lineSection}>{sectionOf(fix)}</p>}
        {nothingCritical ? (
          <blockquote className={styles.inkLine}>{quotedLine(fix)}</blockquote>
        ) : (
          <blockquote ref={lineRef} className={styles.missLine}><Mark seen={seen}>{quotedLine(fix)}</Mark></blockquote>
        )}
      </div>
      <div className={styles.noteCell}>
        <div className={styles.noteHead}>
          <p className={styles.missLabel}>
            <span className="riyp-verdict-label">{label}</span>
            {liftState === "addressed" && <span className={styles.addressed}><Check className="size-3.5" weight="bold" aria-hidden="true" />Addressed</span>}
          </p>
          <p className={styles.missDefinition}>{nothingCritical ? "An optional refinement" : "The one thing to fix first"}</p>
        </div>
        <p className={cn(styles.penNote, (seen || nothingCritical) && styles.penNoteIn)}>{marginNoteFromFix(fix.fix || fix.text || "")}</p>
        {why && <p className={styles.penWhy}>{why}</p>}
        <div className={styles.rowTools}>
          {!openLift && <Button type="button" variant="quiet" size="sm" onClick={() => setOpenLift(true)}>Work on this line</Button>}
          <Button type="button" variant="quiet" size="sm" onClick={hide} aria-label={`Hide this suggestion: ${label}`}>Hide</Button>
        </div>
      </div>
      {openLift && (
        <div className={styles.liftCell}>
          <LineLift excerpt={excerptOf(fix)} onChange={onLiftChange} {...lift} />
        </div>
      )}
      {feedback && (
        <div className={styles.feedbackCell}>
          <MissFeedback question={feedback.question} onSubmit={feedback.onSubmit} suggestNo={liftState === "not_mine"} />
        </div>
      )}
    </li>
  );
}

export function FixRow({
  fix,
  index,
  why,
  whatToAdd,
  hidden,
  locked,
  onHide,
  onRestore,
  onUnlock,
  ...lift
}: LiftProps & {
  fix: Fix;
  index: number;
  why?: string;
  whatToAdd: string[];
  hidden: boolean;
  locked?: boolean;
  onHide: () => void;
  onRestore: () => void;
  onUnlock?: () => void;
}) {
  const [openLift, setOpenLift] = useState(false);
  const { rowRef, focusRestore, hide, restore } = useHideFocus(hidden, onHide, onRestore);
  const label = `Fix ${index + 1}`;
  const id = `section-fix-${index + 1}`;

  if (locked) {
    return (
      <li id={id} className={styles.row} data-kind="fix">
        <div className={styles.hiddenRow}>
          <p>{label} is part of the Job Search Pass.</p>
          <Button type="button" variant="primary" size="sm" onClick={onUnlock}><LockKey className="size-4" aria-hidden="true" />{JOB_SEARCH_PASS_DECISION.cta}</Button>
        </div>
      </li>
    );
  }

  if (hidden) {
    return <li id={id} className={styles.row} data-kind="fix"><HiddenRow label={label} onRestore={restore} focus={focusRestore} /></li>;
  }

  return (
    <li ref={rowRef} tabIndex={-1} id={id} className={styles.row} data-kind="fix" data-testid="fix-row">
      <div className={styles.lineCell}>
        {sectionOf(fix) && <p className={styles.lineSection}>{sectionOf(fix)}</p>}
        <blockquote className={styles.inkLine}>{quotedLine(fix)}</blockquote>
      </div>
      <div className={styles.noteCell}>
        <div className={styles.noteHead}><p className={styles.fixLabel}>{label}</p></div>
        <p className={styles.penNote}>{marginNoteFromFix(fix.fix || fix.text || "")}</p>
        {why && <p className={styles.penWhy}>{why}</p>}
        {/* With the questions open, the lift asks them; they aren't listed twice. */}
        {!openLift && whatToAdd.length > 0 && (
          <div className={styles.toAdd}>
            <p className={styles.toAddLabel}>What to add</p>
            <ul className={styles.toAddList}>{whatToAdd.map((question) => <li key={question}>{question}</li>)}</ul>
          </div>
        )}
        <div className={styles.rowTools}>
          {!openLift && <Button type="button" variant="quiet" size="sm" onClick={() => setOpenLift(true)}>Work on this line</Button>}
          <Button type="button" variant="quiet" size="sm" onClick={hide} aria-label={`Hide this suggestion: ${label}`}>Hide</Button>
        </div>
      </div>
      {openLift && (
        <div className={styles.liftCell}>
          <LineLift excerpt={excerptOf(fix)} {...lift} />
        </div>
      )}
    </li>
  );
}

/** A note on the page that isn't tied to one line: the structural gap, or the line to keep. */
export function PageNote({ kind, children }: { kind: "gap" | "keep"; children: ReactNode }) {
  return <li className={kind === "gap" ? styles.gapRow : styles.keepNote} data-testid={kind === "gap" ? "structural-gaps" : "keep-note"}>{children}</li>;
}
