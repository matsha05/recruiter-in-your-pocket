"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LockKey } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
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

// The September live corpus included completed reviews taking up to 117 seconds.
// Do not encourage a second generation while the first is within that observed range.
const LONG_WAIT_MS = 120_000;

interface AnalysisScanningProps {
    mode?: AnalysisMode;
    startedAt?: number | null;
    onCancel?: () => void;
    onRetry?: () => void;
    className?: string;
}

export default function AnalysisScanning({
    mode = "resume",
    startedAt = null,
    onCancel,
    onRetry,
    className,
}: AnalysisScanningProps) {
    const startRef = useRef<number>(0);
    const [elapsedMs, setElapsedMs] = useState(0);

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

    return (
        <div className={cn(styles.root, className)}>
            <section className={styles.content} aria-labelledby="analysis-title" aria-busy="true">
                <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
                    {isSlow
                        ? `We are still working on your ${subject} report. You can keep waiting, retry, or stop.`
                        : `Building your ${subject} report. Keep this tab open.`}
                </p>
                <header className={styles.intro}>
                    <div>
                        <p className="tracking-wider text-xs font-semibold uppercase text-brand">Building your report</p>
                        <h2 id="analysis-title" className={styles.title}>
                            Reviewing your {subject}.
                        </h2>
                    </div>
                    <p className="max-w-2xl text-base text-muted-foreground">
                        We&apos;re checking what your {subject} tells a recruiter about your experience and where more detail would help.
                    </p>
                </header>

                <div className={styles.sheet}>
                    <div className={styles.sheetHeader}>
                        <p className="tracking-wider text-xs font-semibold uppercase text-foreground">Your report</p>
                        <p className="text-sm text-muted-foreground">What the report is checking</p>
                        <p className="inline-flex items-center gap-2 text-xs font-semibold text-brand">
                            <span className="relative flex size-2" aria-hidden="true">
                                <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-35 motion-reduce:hidden" />
                                <span className="relative inline-flex size-2 rounded-full bg-brand" />
                            </span>
                            In progress
                        </p>
                    </div>

                    <ol aria-label={`Four parts of the review for this ${subject}`} className="px-5 sm:px-8">
                        {steps.map((step, index) => (
                            <li key={step.id} className={styles.reviewRow}>
                                <span className="flex size-9 items-center justify-center rounded-full" aria-hidden="true">
                                    <span className="flex size-9 items-center justify-center rounded-full border border-line bg-proof font-mono text-xs font-semibold text-muted-foreground">
                                        {String(index + 1).padStart(2, "0")}
                                    </span>
                                </span>
                                <p className="text-base font-semibold text-foreground">{step.label}</p>
                                <p className={styles.stepDetail}>{step.detail}</p>
                            </li>
                        ))}
                    </ol>

                    <div className="grid gap-2 border-t border-line bg-proof/40 px-5 py-4 sm:grid-cols-[8rem_1fr] sm:items-baseline sm:px-8">
                        <p className="tracking-wider text-xs font-semibold uppercase text-muted-foreground">What we cover</p>
                        <p className="text-sm leading-5 text-muted-foreground">These are the areas being reviewed. They do not show how much time is left.</p>
                    </div>
                </div>

                <div className="mt-6 flex flex-col items-start gap-4">
                    <div className="flex items-start gap-2.5 text-sm leading-6 text-muted-foreground">
                        <LockKey className="mt-1 size-4 shrink-0 text-brand" weight="duotone" aria-hidden="true" />
                        <p>Keep this tab open. Your report will replace this screen as soon as the review is ready.</p>
                    </div>
                    {!isSlow && onCancel ? <Button variant="outline" size="sm" onClick={onCancel} className="min-w-36 border-foreground bg-transparent text-foreground">Stop</Button> : null}
                </div>

                {isSlow ? (
                    <aside className="mt-7 rounded-xl border border-warning/35 bg-warning/10 px-5 py-4 sm:flex sm:items-center sm:justify-between sm:gap-6" aria-label="Review still in progress">
                        <div>
                            <p className="font-medium text-foreground">Still working on your report.</p>
                            <p className="mt-1 text-xs leading-5 text-muted-foreground">You can keep waiting or retry. A retry may use another report if this review finishes in the background.</p>
                        </div>
                        <div className="mt-4 flex shrink-0 gap-2 sm:mt-0">
                            {onRetry ? <Button variant="outline" size="sm" onClick={onRetry}>Retry</Button> : null}
                            {onCancel ? <Button variant="ghost" size="sm" onClick={onCancel}>Stop</Button> : null}
                        </div>
                    </aside>
                ) : null}
            </section>
        </div>
    );
}
