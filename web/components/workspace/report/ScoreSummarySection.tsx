"use client";

import { ReportData } from "./ReportTypes";
import { cn } from "@/lib/utils";
import { getScoreColor } from "@/lib/score-utils";
import { SignalRadarIcon } from "@/components/icons";
import { ReportSectionHeader } from "./ReportSectionHeader";

export function ScoreSummarySection({ data }: { data: ReportData }) {
    // Story first (most important), then others
    const subscores = [
        { key: 'story', label: 'Story', score: data.subscores?.story },
        { key: 'impact', label: 'Impact', score: data.subscores?.impact },
        { key: 'clarity', label: 'Clarity', score: data.subscores?.clarity },
        { key: 'readability', label: 'Readability', score: data.subscores?.readability },
    ];

    const hasSubscores = Boolean(data.subscores);
    const strengths = data.strengths?.slice(0, 5) || [];
    const gaps = data.gaps?.slice(0, 5) || [];
    const hasLists = strengths.length > 0 || gaps.length > 0;
    const topActions = [
        ...(data.top_fixes || []).slice(0, 3).map((fix) => ({
            text: fix.fix || fix.text || "Clarify this part of the resume",
            impact: fix.impact_level === "high" ? "High" : "Medium"
        })),
        ...(data.next_steps || []).slice(0, 2).map((step) => ({
            text: step,
            impact: "Medium"
        })),
        ...(data.gaps || []).slice(0, 2).map((gap) => ({
            text: `Fix gap: ${gap}`,
            impact: "Medium"
        }))
    ].slice(0, 3);

    const evidenceSnapshot = (data.top_fixes || [])
        .filter((fix) => fix.evidence && (typeof fix.evidence === "string" ? fix.evidence.trim() : fix.evidence.excerpt?.trim()))
        .slice(0, 3)
        .map((fix) => ({
            evidence: typeof fix.evidence === "string" ? fix.evidence : fix.evidence?.excerpt || "",
            action: fix.fix || fix.text || "Clarify this part of the resume",
            section: typeof fix.evidence === "string" ? fix.section_ref : fix.evidence?.section || fix.section_ref
        }));

    return (
        <section className="gap-y-8">
            <ReportSectionHeader
                icon={<SignalRadarIcon className="size-4 text-brand" />}
                number="02"
                title="What the Resume Shows"
                subtitle="What is clear, what needs context, and what to change first."
            />

            {topActions.length > 0 && (
                <div className="rounded border border-brand/20 bg-brand/5 p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">
                        Start here
                    </h3>
                    <ul className="gap-y-2">
                        {topActions.map((action, i) => (
                            <li key={`${action.text}-${i}`} className="flex items-start justify-between gap-3 text-sm">
                                <span className="text-foreground/90 leading-relaxed">{action.text}</span>
                                <span
                                    className={cn(
                                        "shrink-0 text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded",
                                        action.impact === "High"
                                            ? "bg-success/15 text-success"
                                            : "bg-premium/15 text-premium"
                                    )}
                                >
                                    {action.impact}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {evidenceSnapshot.length > 0 && (
                <div className="rounded border border-border/60 bg-card p-5 gap-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                            Evidence from the resume
                        </h3>
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">
                            What shaped the review
                        </span>
                    </div>
                    <div className="gap-y-3">
                        {evidenceSnapshot.map((item, index) => (
                            <div key={`${item.evidence}-${index}`} className="rounded border border-border/50 bg-secondary/10 p-4">
                                <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                                    <span>Evidence</span>
                                    {item.section && (
                                        <>
                                            <span>•</span>
                                            <span>{item.section}</span>
                                        </>
                                    )}
                                </div>
                                <p className="mt-2 text-sm text-foreground/90 leading-relaxed">
                                    “{item.evidence}”
                                </p>
                                <div className="mt-3 text-xs text-muted-foreground">
                                    <span className="font-medium text-foreground/70">Action:</span> {item.action}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Subscores Grid - Story emphasized as most important */}
            {hasSubscores ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {subscores.map((item, index) => item.score !== undefined && (
                        <div
                            key={item.key}
                            className={cn(
                                "bg-card border border-border/60 p-4 rounded flex flex-col items-center justify-center text-center gap-1 transition-all hover:border-brand/30",
                                index === 0 && "ring-1 ring-brand/10 bg-brand/5" // Story gets subtle emphasis
                            )}
                        >
                            <span className={cn(
                                "font-display riyp-weight-560 tabular-nums text-3xl tracking-tight",
                                getScoreColor(item.score)
                            )}>
                                {item.score}
                            </span>
                            <span className="text-label text-muted-foreground">
                                {item.label}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="rounded border border-border/60 bg-secondary/10 p-5 text-sm text-muted-foreground">
                    Subscores were not available for this run.
                </div>
            )}

            {/* Strengths & Gaps - Clean lists, equal weight */}
            {hasLists ? (
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Working */}
                    <div className="gap-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                            What is clear
                        </h3>
                        <ul className="gap-y-3">
                            {strengths.length > 0 ? strengths.map((s, i) => (
                                <li key={s} className="text-sm leading-relaxed text-muted-foreground">
                                    {s}
                                </li>
                            )) : (
                                <li className="text-sm leading-relaxed text-muted-foreground/70">No strengths were returned.</li>
                            )}
                        </ul>
                    </div>

                    {/* Missing */}
                    <div className="gap-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-premium">
                            What needs context
                        </h3>
                        <ul className="gap-y-3">
                            {gaps.length > 0 ? gaps.map((s, i) => (
                                <li key={s} className="text-sm leading-relaxed text-muted-foreground">
                                    {s}
                                </li>
                            )) : (
                                <li className="text-sm leading-relaxed text-muted-foreground/70">No gaps were returned.</li>
                            )}
                        </ul>
                    </div>
                </div>
            ) : (
                <div className="rounded border border-border/60 bg-secondary/10 p-5 text-sm text-muted-foreground">
                    This part of the review was not available for this run.
                </div>
            )}
        </section>
    );
}
