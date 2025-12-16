"use client";

import { ReportData } from "./ReportTypes";
import { DiffView } from "../DiffView";
import { TransformArrowIcon, InsightSparkleIcon } from "@/components/icons";
import { ReportSectionHeader } from "./ReportSectionHeader";

export function BulletUpgradesSection({ data }: { data: ReportData }) {
    if (!data.rewrites || data.rewrites.length === 0) return null;

    return (
        <section className="space-y-6">
            <ReportSectionHeader
                icon={<TransformArrowIcon className="w-4 h-4 text-brand" />}
                number="03"
                title="The Red Pen"
                subtitle="How I'd rewrite these to land harder."
                badge={
                    <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded">
                        {data.rewrites.length} Critical Fixes
                    </span>
                }
            />

            <div className="space-y-8">
                {data.rewrites.map((rewrite, i) => (
                    <div key={i} className="group relative">
                        {/* Connecting Line (for stream feel) */}
                        {i !== data.rewrites!.length - 1 && (
                            <div className="absolute left-[19px] top-12 bottom-0 w-px bg-border/40 group-last:hidden" />
                        )}

                        <div className="flex gap-4">
                            {/* Number Bead */}
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-sm font-medium text-muted-foreground shadow-sm z-10 relative">
                                {i + 1}
                            </div>

                            <div className="flex-1 space-y-4 pt-1">
                                {/* Header / Label */}
                                <div className="flex items-center gap-2">
                                    {rewrite.label && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-primary/5 text-primary">
                                            {rewrite.label}
                                        </span>
                                    )}
                                </div>

                                {/* The Diff Card */}
                                <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-sm transition-shadow hover:shadow-md">
                                    <DiffView
                                        original={rewrite.original}
                                        improved={rewrite.better}
                                    />

                                    {/* Coaching Note Footer */}
                                    {rewrite.enhancement_note && (
                                        <div className="bg-secondary/20 border-t border-border/50 px-4 py-3 flex gap-3 text-sm text-muted-foreground">
                                            <InsightSparkleIcon className="w-4 h-4 text-premium flex-shrink-0 mt-0.5" />
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-premium block">Recruiter Note</span>
                                                <p className="leading-snug">{rewrite.enhancement_note}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
