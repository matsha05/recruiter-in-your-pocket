"use client";

import { useMemo, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { PrincipalRecruiterIcon, SignalRadarIcon } from "@/components/icons";
import { ReportSectionHeader } from "@/components/workspace/report/ReportSectionHeader";
import type { ReportData } from "@/components/workspace/report/ReportTypes";
import { getScoreColor } from "@/lib/score-utils";

type HeroReportArtifactProps = {
    data: ReportData;
    playbackSeconds: number;
};

function SignalBar({
    label,
    value,
    inView,
    duration,
    delay,
}: {
    label: string;
    value: number;
    inView: boolean;
    duration: number;
    delay: number;
}) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-300">{label}</span>
                <span className="font-mono font-medium text-slate-900 dark:text-slate-100">{value}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <motion.div
                    className="h-full rounded-full bg-brand"
                    initial={{ width: 0 }}
                    animate={{ width: inView ? `${value}%` : 0 }}
                    transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
                />
            </div>
        </div>
    );
}

function getConfidenceLabel(score: number) {
    if (score >= 85) return "High confidence";
    if (score >= 70) return "Medium confidence";
    return "Low confidence";
}

export function HeroReportArtifact({ data, playbackSeconds }: HeroReportArtifactProps) {
    const artifactRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(artifactRef, { once: true, amount: 0.4 });

    const score = data.score ?? 0;
    const verdict = data.score_comment_short || data.first_impression || "Strong story. Weak quantified impact.";
    const criticalMiss = data.biggest_gap_example || "Impact metrics missing in two recent roles.";

    const firstFix = data.top_fixes?.[0];
    const evidence =
        typeof firstFix?.evidence === "string"
            ? firstFix.evidence
            : firstFix?.evidence?.excerpt || "Led migration across 4 services.";
    const action = firstFix?.fix || firstFix?.text || "Add one measurable business outcome per recent role.";

    const signalRows = useMemo(
        () => [
            { key: "story", label: "Story", value: data.subscores?.story ?? 92 },
            { key: "impact", label: "Impact", value: data.subscores?.impact ?? 78 },
            { key: "clarity", label: "Clarity", value: data.subscores?.clarity ?? 85 },
            { key: "readability", label: "Readability", value: data.subscores?.readability ?? 68 },
        ],
        [data.subscores?.clarity, data.subscores?.impact, data.subscores?.readability, data.subscores?.story]
    );

    const prioritySequence = useMemo(() => {
        return signalRows
            .filter((item) => item.key !== "story")
            .sort((a, b) => a.value - b.value)
            .slice(0, 3)
            .map((item) => item.label);
    }, [signalRows]);

    const barDuration = Math.min(Math.max(playbackSeconds, 4.5), 8);
    const headingClassName =
        "space-y-1.5 [&_h2]:text-[10px] [&_h2]:tracking-[0.14em] [&_h2]:font-semibold [&_p]:text-[15px] [&_p]:leading-[1.35] [&_p]:font-medium";

    return (
        <div
            ref={artifactRef}
            className="card-marketing overflow-hidden rounded-[14px] bg-white/95 shadow-[0_22px_56px_-38px_rgba(2,6,23,0.36)] dark:bg-slate-900/80"
        >
            <div className="border-b border-border/60 bg-muted/20 px-5 py-3 md:px-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <PrincipalRecruiterIcon className="h-4 w-4 text-brand" />
                        <span className="text-label-mono">Recruiter briefing</span>
                    </div>
                    <span className="text-label-mono text-muted-foreground">Sample report</span>
                </div>
            </div>

            <div className="space-y-3.5 p-4 md:p-5">
                <div className="rounded-md border border-border/60 bg-white/90 p-3.5 dark:bg-slate-900/65">
                    <ReportSectionHeader
                        icon={<PrincipalRecruiterIcon className="h-3.5 w-3.5 text-brand" />}
                        number="01"
                        title="First-pass verdict"
                        subtitle={verdict}
                        className={headingClassName}
                        badge={<span className="text-label-mono text-muted-foreground">{getConfidenceLabel(score)}</span>}
                    />
                </div>

                <div className="grid gap-2.5 sm:grid-cols-2">
                    <div className="rounded-md border border-amber-200/80 bg-amber-50/70 px-4 py-3 dark:bg-amber-900/20">
                        <div className="mb-1.5 text-[11px] uppercase tracking-[0.14em] text-amber-700">Critical miss</div>
                        <p className="text-[14px] leading-relaxed text-slate-700 dark:text-slate-200">{criticalMiss}</p>
                    </div>

                    <div className="rounded-md border border-border/60 bg-white/90 px-4 py-3 dark:bg-slate-900/65">
                        <div className="mb-1.5 text-label-mono text-muted-foreground">Evidence to rewrite</div>
                        <p className="text-[14px] leading-relaxed text-slate-800 dark:text-slate-100">{evidence}</p>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Rewrite: {action}</p>
                    </div>
                </div>

                <div className="rounded-md border border-border/60 bg-white/90 p-3.5 dark:bg-slate-900/65">
                    <div className="mb-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-label-mono">
                            <SignalRadarIcon className="h-3.5 w-3.5 text-brand" />
                            Signal analysis
                        </div>
                        <span className="text-label-mono text-muted-foreground">{playbackSeconds.toFixed(1)}s window</span>
                    </div>
                    <div className="space-y-3">
                        {signalRows.map((signal) => (
                            <SignalBar
                                key={signal.key}
                                label={signal.label}
                                value={signal.value}
                                inView={isInView}
                                duration={barDuration}
                                delay={0}
                            />
                        ))}
                    </div>
                </div>

                <div className="flex items-end justify-between gap-4 border-t border-border/60 pt-3.5">
                    <div className="min-w-0">
                        <div className="text-base font-medium text-slate-700 dark:text-slate-200">Sample Signal Score</div>
                        <div className="mt-1 text-label-mono text-muted-foreground">
                            Priority: {prioritySequence.join(", ")}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-label-mono text-muted-foreground">{getConfidenceLabel(score)}</div>
                        <span className={`text-metric ${getScoreColor(score)}`}>{score}/100</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
