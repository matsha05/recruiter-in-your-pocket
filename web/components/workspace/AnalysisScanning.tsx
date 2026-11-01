"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

    return (
        <div className={cn(styles.root, className)}>
            <section className={styles.content} aria-labelledby="analysis-title" aria-busy="true">
                <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
                    {isSlow
                        ? `Still working on your ${subject} report. You can keep waiting, retry, or stop.`
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
                        <Button variant="outline" size="sm" onClick={onCancel} className="min-w-36 border-foreground bg-transparent text-foreground">Stop</Button>
                    </div>
                ) : null}
                {isSlow ? (
                    <aside className="mt-7 rounded-xl border border-warning/35 bg-warning/10 px-5 py-4 sm:flex sm:items-center sm:justify-between sm:gap-6" aria-label="Report still in progress">
                        <div>
                            <p className="font-medium text-foreground">Still going. Longer resumes can take a little more time.</p>
                            <p className="mt-1 text-sm leading-5 text-muted-foreground">If you retry and this one also finishes, both count as reports. Waiting is usually the better bet.</p>
                        </div>
                        <div className="mt-4 flex shrink-0 gap-2 sm:mt-0">
                            {onRetry ? <Button variant="outline" size="sm" onClick={onRetry}>Retry</Button> : null}
                            {onCancel ? <Button variant="ghost" size="sm" onClick={onCancel}>Stop</Button> : null}
                        </div>
                    </aside>
                ) : null}
                <div className={styles.sheet}>
                    <div className={styles.sheetHeader}>
                        <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                            <span className="relative flex size-2" aria-hidden="true">
                                <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-35 motion-reduce:hidden" />
                                <span className="relative inline-flex size-2 rounded-full bg-brand" />
                            </span>
                            What we&apos;re looking at
                        </p>
                    </div>
                    <ol aria-label={`What we look at in your ${subject}`} className="px-5 sm:px-8">
                        {steps.map((step, index) => (
                            <li key={step.id} className={styles.reviewRow}>
                                <span className="flex size-9 items-center justify-center rounded-full" aria-hidden="true">
                                    <span className="flex size-9 items-center justify-center rounded-full border border-line bg-proof text-sm font-semibold text-muted-foreground">
                                        {index + 1}
                                    </span>
                                </span>
                                <p className="text-base font-semibold text-foreground">{step.label}</p>
                                <p className={styles.stepDetail}>{step.detail}</p>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>
        </div>
    );
}
