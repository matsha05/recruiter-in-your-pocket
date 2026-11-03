"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, LockKey } from "@phosphor-icons/react";
import { Mark, useSeen } from "@/components/research/figures/FigureKit";
import { Button } from "@/components/ui/button";
import { JOB_SEARCH_PASS_DECISION } from "@/lib/billing/pricing";
import { fixPositionLabel } from "@/lib/reports/report-opening";
import { missingFromResume } from "@/lib/reports/report-presentation";
import { marginNoteFromFix } from "@/lib/reports/revised-line";
import type { RevisedLinePolishRequest } from "@/lib/reports/revised-line-polish";
import { cn } from "@/lib/utils";
import type { ReportData } from "../ReportTypes";
import { LineLift, type LiftChange, type LiftInitial, type LiftPersistHandler, type ResumeSource } from "./LineLift";
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

/** A resume's own heading ("EXPERIENCE") in sentence case; uppercase stays reserved for the Verdict and Critical Miss labels. */
function sectionLabel(fix?: Fix) {
  const section = sectionOf(fix)?.trim();
  if (!section) return undefined;
  return section === section.toLocaleUpperCase() ? section.charAt(0) + section.slice(1).toLocaleLowerCase() : section;
}

/** The quoted line as the reader sees it on the page, without the resume's bullet mark. */
export function quotedLine(fix?: Fix) {
  return excerptOf(fix).trim().replace(/^[-•*]\s+/u, "");
}

/** Whether the fix marks a line on the resume, rather than something the resume doesn't have. */
export function marksLine(fix?: Fix) {
  return !missingFromResume(excerptOf(fix));
}

/** Where the line would be, for a fix about something the resume doesn't have. Nothing is quoted. */
function MissingLine({ fix, critical }: { fix: Fix; critical?: boolean }) {
  return <p className={cn(styles.missingLine, critical && styles.missingLineMiss)}>{missingFromResume(excerptOf(fix))}</p>;
}

function WhatToAdd({ questions }: { questions: string[] }) {
  if (questions.length === 0) return null;
  return (
    <div className={styles.toAdd}>
      <p className={styles.toAddLabel}>What to add</p>
      <ul className={styles.toAddList}>{questions.map((question) => <li key={question}>{question}</li>)}</ul>
    </div>
  );
}

interface LiftProps {
  resumeText?: string;
  source: ResumeSource;
  questions: string[];
  onReattach?: (text: string) => string | null;
  polishContext?: RevisedLinePolishRequest["context"];
  /** Answers kept with a saved report, so the revised line survives a reload (W3). */
  initial?: LiftInitial;
  /** Keeps the answers with the saved report as they change. Absent on the sample and anonymous reports. */
  onPersist?: LiftPersistHandler;
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

/**
 * A Critical Miss: its line carries the highlighter, and the questions under it build the revised line.
 * A report has one to three, the first being the one to fix first. Each gets the same treatment; only the
 * first sweeps and asks "Was this right?".
 */
export function CriticalMissRow({
  fix,
  index,
  label,
  definition,
  why,
  hidden,
  onHide,
  onRestore,
  onLiftChange,
  liftState,
  feedback,
  ...lift
}: LiftProps & {
  fix: Fix;
  /** Position among all fixes; the first critical fix is 0. */
  index: number;
  /** `Critical Miss`, or `Critical Miss 2` when there are several. */
  label: string;
  /** What a Critical Miss is, when no count heading above says it. */
  definition?: string;
  why?: string;
  hidden: boolean;
  onHide: () => void;
  onRestore: () => void;
  onLiftChange: (change: LiftChange) => void;
  liftState: LiftChange["state"];
  /** Only on the first, and omitted on the sample, which has no one to ask. */
  feedback?: { question: string; onSubmit: (value: MissFeedbackValue) => Promise<boolean> };
}) {
  const first = index === 0;
  const onPage = marksLine(fix);
  const { ref: lineRef, seen: sweptIn } = useSeen<HTMLQuoteElement>(0.6);
  // The highlighter sweeps once, on the first; any later critical line is already marked.
  const seen = first && onPage ? sweptIn : true;
  const { rowRef, focusRestore, hide, restore } = useHideFocus(hidden, onHide, onRestore);
  const id = `section-fix-${index + 1}`;
  const testId = first ? "critical-miss" : "critical-fix";

  if (hidden) {
    return (
      <li id={id} className={styles.row} data-kind="miss" data-testid={testId}>
        <HiddenRow label={label} onRestore={restore} focus={focusRestore} />
      </li>
    );
  }

  return (
    <li ref={rowRef} tabIndex={-1} id={id} className={styles.row} data-kind="miss" data-first={first || undefined} data-state={liftState} data-testid={testId}>
      <div className={styles.lineCell}>
        {sectionOf(fix) && <p className={styles.lineSection}>{sectionOf(fix)}</p>}
        {onPage
          ? <blockquote ref={first ? lineRef : undefined} className={styles.missLine}><Mark seen={seen}>{quotedLine(fix)}</Mark></blockquote>
          : <MissingLine fix={fix} critical />}
      </div>
      <div className={styles.noteCell}>
        <div className={styles.noteHead}>
          <p className={styles.missLabel}>
            <span className="riyp-verdict-label">{label}</span>
            {sectionLabel(fix) && <span className={styles.missSection}>· {sectionLabel(fix)}</span>}
            {liftState === "addressed" && <span className={styles.addressed}><Check className="size-3.5" weight="bold" aria-hidden="true" />Addressed</span>}
          </p>
          {definition && <p className={styles.missDefinition}>{definition}</p>}
        </div>
        <p className={cn(styles.penNote, seen && styles.penNoteIn)}>{marginNoteFromFix(fix.fix || fix.text || "")}</p>
        {why && <p className={styles.penWhy}>{why}</p>}
        {/* Nothing on the page to revise: the questions are what to add. */}
        {!onPage && <WhatToAdd questions={lift.questions} />}
        <div className={styles.rowTools}>
          <Button type="button" variant="quiet" size="sm" onClick={hide} aria-label={`Hide this suggestion: ${label}`}>Hide</Button>
        </div>
      </div>
      {onPage && (
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
  total,
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
  /** How many fixes the report shows, so the label reads "Fix 2 of 3" where the heading is out of view. */
  total: number;
  why?: string;
  whatToAdd: string[];
  hidden: boolean;
  locked?: boolean;
  onHide: () => void;
  onRestore: () => void;
  onUnlock?: () => void;
}) {
  const [openLift, setOpenLift] = useState(false);
  const onPage = marksLine(fix);
  const { rowRef, focusRestore, hide, restore } = useHideFocus(hidden, onHide, onRestore);
  const label = fixPositionLabel(index, total);
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
        {onPage ? <blockquote className={styles.inkLine}>{quotedLine(fix)}</blockquote> : <MissingLine fix={fix} />}
      </div>
      <div className={styles.noteCell}>
        <div className={styles.noteHead}><p className={styles.fixLabel}>{label}</p></div>
        <p className={styles.penNote}>{marginNoteFromFix(fix.fix || fix.text || "")}</p>
        {why && <p className={styles.penWhy}>{why}</p>}
        {/* With the questions open, the lift asks them; they aren't listed twice. */}
        {!openLift && <WhatToAdd questions={whatToAdd} />}
        <div className={styles.rowTools}>
          {!openLift && onPage && <Button type="button" variant="quiet" size="sm" onClick={() => setOpenLift(true)}>Work on this line</Button>}
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
