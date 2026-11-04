"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import type { GenerationStage } from "@/lib/generation-stage";
import { cn } from "@/lib/utils";
import styles from "./AnalysisScanning.module.css";

type AnalysisMode = "resume" | "linkedin";

/**
 * The stages the stream reports, plus the severity check's own event once the server emits it (W2
 * contract: `{ "type": "stage", "stage": "severity" }`). Until it ships, the fourth chip covers that call.
 */
export type WaitStage = GenerationStage | "severity";

type WaitStep = {
    id: WaitStage;
    /** The chip. */
    label: string;
    /** What the status line says while this is the stage. */
    now: string;
    /** The word the pen writes beside the line it is on. */
    cursor: string;
    /** How far down the resume the pen sits during this stage: a function of the stage, never of time. */
    at: number;
};

const WAIT_STEPS: WaitStep[] = [
    { id: "sending", label: "Sent", now: "Sending your resume", cursor: "sending", at: 0 },
    { id: "reading", label: "Reading", now: "Reading your resume", cursor: "reading", at: 0.15 },
    { id: "writing", label: "Writing the notes", now: "Writing the notes", cursor: "writing", at: 0.5 },
    { id: "checking", label: "Checking every quote", now: "Checking every quote against your resume", cursor: "checking", at: 0.82 },
    { id: "severity", label: "Checking for more misses", now: "Looking for anything else that could cost an interview", cursor: "checking", at: 1 },
];

function stepIndexFor(stage: string): number {
    // A retry starts the read over; it is still the reading step. A stage this build doesn't know
    // (the server shipped first) counts as checking, the stage that covers the tail.
    const current = stage === "retrying" ? "reading" : stage;
    const index = WAIT_STEPS.findIndex((step) => step.id === current);
    return index === -1 ? 3 : index;
}

function formatElapsed(ms: number) {
    const seconds = Math.max(0, Math.floor(ms / 1000));
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

// The September live corpus included completed reviews taking up to 117 seconds.
// Do not encourage a second generation while the first is within that observed range.
const LONG_WAIT_MS = 120_000;

/** Lines of the pasted resume, as the sheet draws them. */
type SheetLine = { text: string; kind: "name" | "heading" | "blank" | "text" };

function sheetLines(resumeText: string): SheetLine[] {
    const lines = resumeText.replace(/\r\n?/gu, "\n").split("\n").map((line) => line.trim());
    let named = false;
    return lines.map((text) => {
        if (!text) return { text, kind: "blank" as const };
        if (!named) {
            named = true;
            return { text, kind: "name" as const };
        }
        // A short all-caps line with no digits is a section heading ("EXPERIENCE"), unlike "GPA: 3.4/4.0".
        const heading = text.length <= 40 && text === text.toLocaleUpperCase() && /\p{L}/u.test(text) && !/\d/u.test(text);
        return { text, kind: heading ? "heading" as const : "text" as const };
    });
}

interface AnalysisScanningProps {
    mode?: AnalysisMode;
    startedAt?: number | null;
    /** The stream's current phase. Omit when the caller can't report one; null means the run is just starting. */
    stage?: WaitStage | null;
    /** The resume this run is reading, drawn dimmed on the sheet. Held in memory only; never sent anywhere from here. */
    resumeText?: string;
    onCancel?: () => void;
    onRetry?: () => void;
    className?: string;
}

/**
 * The wait (W2, Nov 2026): the person's own resume on the sheet with the pen on the line the stream
 * says it's reading, five named stages, and the clock. Nothing here advances on a timer; the pen and
 * the chips move only when the server reports a stage.
 */
export default function AnalysisScanning({
    mode = "resume",
    startedAt = null,
    stage,
    resumeText,
    onCancel,
    onRetry,
    className,
}: AnalysisScanningProps) {
    const startRef = useRef<number>(0);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const sheetRef = useRef<HTMLDivElement>(null);
    const [elapsedMs, setElapsedMs] = useState(0);
    const reducedMotion = useReducedMotion();

    // The run starts from wherever the visitor scrolled to on the form, which on a phone is near the
    // button. Open at the heading (its scroll margin keeps it clear of the sticky header), with the
    // sheet and Stop in view.
    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            titleRef.current?.scrollIntoView({ block: "start" });
            titleRef.current?.focus({ preventScroll: true });
        });
        return () => cancelAnimationFrame(frame);
    }, []);

    useEffect(() => {
        if (startRef.current === 0) {
            startRef.current = typeof startedAt === "number" ? startedAt : Date.now();
        } else if (typeof startedAt === "number" && startedAt !== startRef.current) {
            startRef.current = startedAt;
        }
        setElapsedMs(Date.now() - startRef.current);
    }, [startedAt]);

    useEffect(() => {
        const timer = window.setInterval(() => {
            setElapsedMs(Date.now() - startRef.current);
        }, 250);
        return () => window.clearInterval(timer);
    }, []);

    const isSlow = elapsedMs > LONG_WAIT_MS;
    const subject = mode === "linkedin" ? "profile" : "resume";
    const isLive = stage !== undefined;
    const liveStage: WaitStage = stage ?? "sending";
    const currentIndex = stepIndexFor(liveStage);
    const nowLabel = liveStage === "retrying" ? "Starting the read again" : WAIT_STEPS[currentIndex].now;

    const lines = useMemo(() => (mode === "resume" && resumeText?.trim() ? sheetLines(resumeText) : []), [mode, resumeText]);
    // The pen's line is a function of the stage: the name at the start, the last line of text at the end.
    // Headings are skipped; the pen reads what was written under them.
    const contentIndexes = useMemo(() => lines.flatMap((line, index) => (line.kind === "text" || line.kind === "name" ? [index] : [])), [lines]);
    const cursorLine = contentIndexes.length > 0
        ? contentIndexes[Math.round(WAIT_STEPS[currentIndex].at * (contentIndexes.length - 1))]
        : -1;

    // The sheet follows the pen when the stage changes, and only then.
    useEffect(() => {
        const sheet = sheetRef.current;
        if (!sheet || cursorLine < 0) return;
        const line = sheet.querySelector<HTMLElement>(`[data-line="${cursorLine}"]`);
        if (!line) return;
        sheet.scrollTo({ top: Math.max(0, line.offsetTop - sheet.clientHeight * 0.4), behavior: reducedMotion ? "auto" : "smooth" });
    }, [cursorLine, reducedMotion]);

    return (
        <div className={cn(styles.root, className)}>
            <section className={styles.content} aria-labelledby="analysis-title" aria-busy="true">
                <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
                    {isSlow
                        ? `Still working on your ${subject} report. You can keep waiting, retry, or stop.`
                        : isLive
                            ? `${nowLabel}.`
                            : `Reading your ${subject}. This usually takes under two minutes.`}
                </p>

                <header className={styles.intro}>
                    <h2 id="analysis-title" ref={titleRef} tabIndex={-1} className={styles.title}>
                        Reading your {subject}.
                    </h2>
                    <p className={styles.elapsed} data-testid="analysis-elapsed">
                        <span className={styles.clock}>{formatElapsed(elapsedMs)}</span>
                        <span className={styles.elapsedNote}> · usually under two minutes</span>
                    </p>
                </header>

                <ol aria-label="Report progress" className={styles.chips} data-testid="analysis-stages">
                    {WAIT_STEPS.map((step, index) => {
                        const state = !isLive ? "upcoming" : index < currentIndex ? "done" : index === currentIndex ? "current" : "upcoming";
                        return (
                            <li key={step.id} className={styles.chip} data-state={state} aria-current={state === "current" ? "step" : undefined}>
                                <span className="sr-only">{state === "done" ? "Done: " : state === "current" ? "Now: " : "Next: "}</span>
                                {step.label}
                            </li>
                        );
                    })}
                </ol>

                {isLive && liveStage === "retrying" ? (
                    <p className={styles.retry}>The first pass came back incomplete, so we started it again.</p>
                ) : null}

                {isSlow ? (
                    <aside className={styles.slow} aria-label="Report still in progress">
                        <div>
                            <p className={styles.slowTitle}>Still going. Longer resumes can take a little more time.</p>
                            <p className={styles.slowNote}>If you retry and this one also finishes, both count as reports. Waiting is usually the better bet.</p>
                        </div>
                        <div className={styles.slowActions}>
                            {onRetry ? <Button variant="secondary" size="sm" onClick={onRetry}>Retry</Button> : null}
                            {onCancel ? <Button variant="quiet" size="sm" onClick={onCancel}>Stop</Button> : null}
                        </div>
                    </aside>
                ) : null}

                {lines.length > 0 && (
                    /* The person's own page, dimmed, with the pen on the line the stream is reading. Decorative for
                       assistive technology: the status line above says the same thing in words. */
                    <div ref={sheetRef} className={styles.sheet} data-testid="analysis-sheet" data-stage={WAIT_STEPS[currentIndex].id} aria-hidden="true">
                        <div className={styles.document}>
                            {lines.map((line, index) => {
                                const state = index < cursorLine ? "read" : index === cursorLine ? "current" : "ahead";
                                return (
                                    <p
                                        key={index}
                                        data-line={index}
                                        data-state={state}
                                        className={cn(styles.line, line.kind === "name" && styles.name, line.kind === "heading" && styles.heading, line.kind === "blank" && styles.blank)}
                                    >
                                        {line.text || " "}
                                        {state === "current" && <span className={styles.cursor}>{WAIT_STEPS[currentIndex].cursor}</span>}
                                    </p>
                                );
                            })}
                        </div>
                    </div>
                )}

                <footer className={styles.foot}>
                    <p className={styles.footNote}>Keep this tab open.</p>
                    {!isSlow && onCancel ? <Button variant="quiet" size="sm" onClick={onCancel} className={styles.stop}>Stop</Button> : null}
                </footer>
            </section>
        </div>
    );
}
