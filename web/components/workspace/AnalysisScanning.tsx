"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import type { GenerationStage } from "@/lib/generation-stage";
import { cn } from "@/lib/utils";
import styles from "./AnalysisScanning.module.css";

type AnalysisMode = "resume" | "linkedin";

type AnalysisStep = {
    id: string;
    label: string;
    detail: string;
};

const RESUME_STEPS: AnalysisStep[] = [
    {
        id: "normalize",
        label: "Read your resume",
        detail: "Sections, roles, dates, and visible structure",
    },
    {
        id: "evidence",
        label: "Review your experience",
        detail: "Your responsibilities, decisions, and results",
    },
    {
        id: "review",
        label: "Check for missing details",
        detail: "Anything unclear or easy for a recruiter to miss",
    },
    {
        id: "prioritize",
        label: "Recommend changes",
        detail: "What to revise first in your resume",
    },
];

const LINKEDIN_STEPS: AnalysisStep[] = [
    {
        id: "ingest",
        label: "Read the profile",
        detail: "Headline, experience, and visible details",
    },
    {
        id: "evidence",
        label: "Review your experience",
        detail: "Your achievements, skills, and responsibilities",
    },
    {
        id: "review",
        label: "Check for missing details",
        detail: "Anything unclear or easy for a recruiter to miss",
    },
    {
        id: "prioritize",
        label: "Recommend changes",
        detail: "What to revise first in your profile",
    },
];

// The phases the resume stream reports. A step is done only when the stream moves past it.
const LIVE_STEPS: Array<AnalysisStep & { stage: GenerationStage; now: string }> = [
    {
        id: "sending",
        stage: "sending",
        label: "Send your resume",
        now: "Sending your resume",
        detail: "Encrypted in transit",
    },
    {
        id: "reading",
        stage: "reading",
        label: "Read your resume",
        now: "Reading your resume",
        detail: "Roles, dates, results, and what a recruiter would look for",
    },
    {
        id: "writing",
        stage: "writing",
        label: "Write your report",
        now: "Writing your report",
        detail: "What comes through, what slips past, and what to fix first",
    },
    {
        id: "checking",
        stage: "checking",
        label: "Check every quote",
        now: "Checking every quote against your resume",
        detail: "Every line we quote has to appear in your resume",
    },
];

function liveStepIndex(stage: GenerationStage) {
    // A retry starts the read over; it is still the reading step.
    const current = stage === "retrying" ? "reading" : stage;
    return Math.max(0, LIVE_STEPS.findIndex((step) => step.stage === current));
}

function formatElapsed(ms: number) {
    const seconds = Math.max(0, Math.floor(ms / 1000));
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

// The September live corpus included completed reviews taking up to 117 seconds.
// Do not encourage a second generation while the first is within that observed range.
const LONG_WAIT_MS = 120_000;

interface AnalysisScanningProps {
    mode?: AnalysisMode;
    startedAt?: number | null;
    /** The stream's current phase. Omit when the caller can't report one; null means the run is just starting. */
    stage?: GenerationStage | null;
    onCancel?: () => void;
    onRetry?: () => void;
    className?: string;
}

export default function AnalysisScanning({
    mode = "resume",
    startedAt = null,
    stage,
    onCancel,
    onRetry,
    className,
}: AnalysisScanningProps) {
    const startRef = useRef<number>(0);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const [elapsedMs, setElapsedMs] = useState(0);

    // The run starts from wherever the visitor scrolled to on the form, which on a
    // phone is near the button. Open at the heading so the wait, and Stop, are in view.
    useEffect(() => {
        titleRef.current?.scrollIntoView({ block: "start" });
        titleRef.current?.focus({ preventScroll: true });
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

    const steps = useMemo(() => (mode === "linkedin" ? LINKEDIN_STEPS : RESUME_STEPS), [mode]);
    const isSlow = elapsedMs > LONG_WAIT_MS;
    const subject = mode === "linkedin" ? "profile" : "resume";
    const isLive = stage !== undefined;
    const liveStage: GenerationStage = stage ?? "sending";
    const currentIndex = liveStepIndex(liveStage);
    const nowLabel = liveStage === "retrying" ? "Starting the read again" : LIVE_STEPS[currentIndex].now;

    return (
        <div className={cn(styles.root, className)}>
            <section className={styles.content} aria-labelledby="analysis-title" aria-busy="true">
                <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
                    {isSlow
                        ? `Still working on your ${subject} report. You can keep waiting, retry, or stop.`
                        : isLive
                            ? `${nowLabel}.`
                            : `Reading your ${subject}. This usually takes one to two minutes.`}
                </p>
                <header className={styles.intro}>
                    <h2 id="analysis-title" ref={titleRef} tabIndex={-1} className={styles.title}>
                        Reading your {subject} like a recruiter would.
                    </h2>
                    <p className="max-w-2xl text-base text-muted-foreground">
                        This usually takes one to two minutes. Keep this tab open; your report replaces this screen when it&apos;s ready.
                    </p>
                </header>
                {!isSlow && onCancel ? (
                    <div className="mt-6">
                        <Button variant="secondary" size="sm" onClick={onCancel} className="min-w-36 text-foreground">Stop</Button>
                    </div>
                ) : null}
                {isSlow ? (
                    <aside className="mt-7 rounded-xl border border-warning/35 bg-warning/10 px-5 py-4 sm:flex sm:items-center sm:justify-between sm:gap-6" aria-label="Report still in progress">
                        <div>
                            <p className="font-medium text-foreground">Still going. Longer resumes can take a little more time.</p>
                            <p className="mt-1 text-sm text-muted-foreground">If you retry and this one also finishes, both count as reports. Waiting is usually the better bet.</p>
                        </div>
                        <div className="mt-4 flex shrink-0 gap-2 sm:mt-0">
                            {onRetry ? <Button variant="secondary" size="sm" onClick={onRetry}>Retry</Button> : null}
                            {onCancel ? <Button variant="quiet" size="sm" onClick={onCancel}>Stop</Button> : null}
                        </div>
                    </aside>
                ) : null}
                <div className={styles.sheet}>
                    <div className={styles.sheetHeader}>
                        <p className="inline-flex min-w-0 items-center gap-2 text-sm font-semibold text-foreground">
                            <span className="relative flex size-2 shrink-0" aria-hidden="true">
                                <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-35 motion-reduce:hidden" />
                                <span className="relative inline-flex size-2 rounded-full bg-brand" />
                            </span>
                            {isLive ? nowLabel : "What we\u2019re looking at"}
                        </p>
                        <p className={styles.elapsed} data-testid="analysis-elapsed">
                            {formatElapsed(elapsedMs)} <span className="text-muted-foreground">elapsed</span>
                        </p>
                    </div>
                    {isLive && liveStage === "retrying" ? (
                        <p className="border-b border-line px-5 py-3 text-sm text-muted-foreground sm:px-8">
                            The first pass came back incomplete, so we started it again.
                        </p>
                    ) : null}
                    {isLive ? (
                        <ol aria-label="Report progress" className="px-5 sm:px-8" data-testid="analysis-stages">
                            {LIVE_STEPS.map((step, index) => {
                                const state = index < currentIndex ? "done" : index === currentIndex ? "current" : "upcoming";
                                return (
                                    <li key={step.id} className={styles.reviewRow} data-state={state} aria-current={state === "current" ? "step" : undefined}>
                                        <span className={cn(styles.stepMarker, state === "done" && styles.stepMarkerDone, state === "current" && styles.stepMarkerCurrent)} aria-hidden="true">
                                            {state === "done" ? <Check className="size-4" weight="bold" /> : index + 1}
                                        </span>
                                        <p className={cn("text-base font-semibold", state === "upcoming" ? "text-muted-foreground" : "text-foreground")}>
                                            <span className="sr-only">{state === "done" ? "Done: " : state === "current" ? "Now: " : "Next: "}</span>
                                            {step.label}
                                        </p>
                                        <p className={styles.stepDetail}>{step.detail}</p>
                                    </li>
                                );
                            })}
                        </ol>
                    ) : (
                        <ol aria-label={`What we look at in your ${subject}`} className="px-5 sm:px-8">
                            {steps.map((step, index) => (
                                <li key={step.id} className={styles.reviewRow}>
                                    <span className={styles.stepMarker} aria-hidden="true">{index + 1}</span>
                                    <p className="text-base font-semibold text-foreground">{step.label}</p>
                                    <p className={styles.stepDetail}>{step.detail}</p>
                                </li>
                            ))}
                        </ol>
                    )}
                </div>
            </section>
        </div>
    );
}
