"use client";

import { useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import {
    CheckCircle2,
    FileText,
    Gauge,
    Loader2,
    Search,
    Sparkles,
    UserRound
} from "lucide-react";
import { SixSecondIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AnalysisMode = "resume" | "linkedin";

type AnalysisStep = {
    id: string;
    label: string;
    detail: string;
    durationMs: number;
    icon: ComponentType<{ className?: string }>;
};

const RESUME_STEPS: AnalysisStep[] = [
    {
        id: "normalize",
        label: "Normalizing structure",
        detail: "Sections, role signals, and layout cues",
        durationMs: 6000,
        icon: FileText
    },
    {
        id: "evidence",
        label: "Extracting evidence",
        detail: "Impact verbs, metrics, and scope",
        durationMs: 12000,
        icon: Search
    },
    {
        id: "scoring",
        label: "Scoring recruiter signal",
        detail: "Confidence bands + priority ordering",
        durationMs: 9000,
        icon: Gauge
    },
    {
        id: "rewrites",
        label: "Drafting actions",
        detail: "Rewrites, gaps, and next steps",
        durationMs: 9000,
        icon: Sparkles
    }
];

const LINKEDIN_STEPS: AnalysisStep[] = [
    {
        id: "ingest",
        label: "Parsing profile",
        detail: "Headline, experience, and signals",
        durationMs: 6000,
        icon: UserRound
    },
    {
        id: "evidence",
        label: "Extracting evidence",
        detail: "Achievements, keywords, and clarity",
        durationMs: 12000,
        icon: Search
    },
    {
        id: "scoring",
        label: "Scoring recruiter signal",
        detail: "Clarity, relevance, differentiation",
        durationMs: 9000,
        icon: Gauge
    },
    {
        id: "rewrites",
        label: "Drafting actions",
        detail: "Headline and positioning upgrades",
        durationMs: 9000,
        icon: Sparkles
    }
];

const LONG_WAIT_MS = 45_000;

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
    className
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
        const timer = setInterval(() => {
            setElapsedMs(Date.now() - startRef.current);
        }, 250);
        return () => clearInterval(timer);
    }, []);

    const steps = useMemo(() => (mode === "linkedin" ? LINKEDIN_STEPS : RESUME_STEPS), [mode]);
    const totalMs = steps.reduce((sum, step) => sum + step.durationMs, 0);
    const progress = Math.min(95, Math.max(4, (elapsedMs / totalMs) * 100));
    const isSlow = elapsedMs > LONG_WAIT_MS;

    const activeIndex = useMemo(() => {
        let acc = 0;
        for (let i = 0; i < steps.length; i += 1) {
            acc += steps[i].durationMs;
            if (elapsedMs < acc) return i;
        }
        return steps.length - 1;
    }, [elapsedMs, steps]);

    const headline =
        mode === "linkedin" ? "Analyzing your LinkedIn profile" : "Analyzing your resume";

    return (
        <div className={cn("flex flex-col items-center justify-center h-full p-8 animate-in fade-in duration-500", className)}>
            <div className="w-full max-w-xl space-y-8">
                <div className="text-center space-y-2">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                        Analysis in progress
                    </div>
                    <h2 className="font-display text-3xl md:text-4xl text-foreground tracking-tight">
                        {headline}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        We extract evidence before advice. You&apos;ll see the first meaningful insight as soon as it&apos;s ready.
                    </p>
                </div>

                <div className="rounded-xl border border-border/60 bg-card p-5 space-y-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary/70 overflow-hidden">
                        <div
                            className="h-full bg-brand transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <ul className="space-y-3 pt-2">
                        {steps.map((step, index) => {
                            const isComplete = index < activeIndex;
                            const isActive = index === activeIndex;
                            const Icon = step.icon;
                            return (
                                <li key={step.id} className="flex items-start gap-3">
                                    <div
                                        className={cn(
                                            "mt-0.5 h-7 w-7 rounded-full border flex items-center justify-center",
                                            isComplete && "border-success/40 bg-success/10 text-success",
                                            isActive && "border-brand/40 bg-brand/10 text-brand",
                                            !isComplete && !isActive && "border-border/40 text-muted-foreground"
                                        )}
                                    >
                                        {isComplete ? (
                                            <CheckCircle2 className="h-4 w-4" />
                                        ) : isActive ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Icon className="h-4 w-4" />
                                        )}
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className={cn(
                                            "text-sm font-medium",
                                            isActive ? "text-foreground" : "text-muted-foreground"
                                        )}>
                                            {step.label}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {step.detail}
                                        </p>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                <p className="text-[11px] text-muted-foreground/70 flex items-center justify-center gap-1.5">
                    <SixSecondIcon className="w-3.5 h-3.5" />
                    Typical time: 20–30 seconds
                </p>

                {isSlow && (
                    <div className="rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm text-center space-y-3">
                        <p className="font-medium text-warning">Taking longer than usual.</p>
                        <p className="text-xs text-muted-foreground">
                            You can keep waiting or retry. Retrying may consume another review if the current run completes.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-2">
                            {onRetry && (
                                <Button variant="outline" size="sm" onClick={onRetry}>
                                    Retry
                                </Button>
                            )}
                            {onCancel && (
                                <Button variant="ghost" size="sm" onClick={onCancel}>
                                    Stop
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
