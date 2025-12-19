"use client";

import { useState } from "react";
import { ReportData } from "./ReportTypes";
import { TransformArrowIcon } from "@/components/icons";
import { ReportSectionHeader } from "./ReportSectionHeader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, CheckCircle, Copy, ChevronDown, ChevronUp } from "lucide-react";

export function BulletUpgradesSection({ data }: { data: ReportData }) {
    const [heroRevealed, setHeroRevealed] = useState(false);
    const [showAll, setShowAll] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    if (!data.rewrites || data.rewrites.length === 0) {
        return (
            <section className="space-y-6">
                <ReportSectionHeader
                    icon={<TransformArrowIcon className="w-4 h-4 text-brand" />}
                    number="03"
                    title="The Red Pen"
                    subtitle="How I'd rewrite these to land harder."
                />
                <div className="rounded-lg border border-border bg-secondary/10 p-5 text-sm text-muted-foreground">
                    No rewrite candidates were returned. This usually means the input was too short, not bullet-based, or too hard to parse cleanly.
                </div>
            </section>
        );
    }

    const heroRewrite = data.rewrites[0];
    const remainingRewrites = data.rewrites.slice(1);
    const visibleRewrites = showAll ? remainingRewrites : remainingRewrites.slice(0, 2);
    const hiddenCount = remainingRewrites.length - 2;

    const handleCopy = async (text: string, index: number) => {
        await navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <section className="space-y-8">
            <ReportSectionHeader
                icon={<TransformArrowIcon className="w-4 h-4 text-brand" />}
                number="03"
                title="The Red Pen"
                subtitle="How I'd rewrite these to land harder."
            />

            {/* Hero Rewrite - Interactive, matching landing page style */}
            <div
                className={cn(
                    "relative rounded-lg border bg-card overflow-hidden cursor-pointer transition-all duration-300",
                    heroRevealed
                        ? "border-border"
                        : "border-border hover:border-premium/40"
                )}
                onClick={() => !heroRevealed && setHeroRevealed(true)}
            >
                <div className="p-6">
                    {!heroRevealed ? (
                        // Before State
                        <div className="space-y-3">
                            <p className="text-base text-destructive line-through decoration-destructive/40">
                                {heroRewrite.original}
                            </p>
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-premium">
                                <span>Tap to Rewrite</span>
                                <ArrowRight className="w-3 h-3" />
                            </div>
                        </div>
                    ) : (
                        // After State
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                                <div className="space-y-2">
                                    <p className="text-base text-foreground">
                                        {heroRewrite.better}
                                    </p>
                                    {heroRewrite.enhancement_note && (
                                        <p className="text-xs text-muted-foreground">
                                            {heroRewrite.enhancement_note}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopy(heroRewrite.better, -1);
                                }}
                                className={cn(
                                    copiedIndex === -1
                                        ? "bg-success/10 text-success hover:bg-success/20"
                                        : ""
                                )}
                            >
                                {copiedIndex === -1 ? <CheckCircle className="w-3 h-3 mr-1.5" /> : <Copy className="w-3 h-3 mr-1.5" />}
                                {copiedIndex === -1 ? "Copied" : "Copy"}
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Remaining Rewrites - Clean compact list */}
            {remainingRewrites.length > 0 && (
                <div className="space-y-3">
                    {visibleRewrites.map((rewrite, i) => (
                        <div key={i} className="rounded-lg border border-border bg-card p-5 space-y-4">
                            {/* Before/After */}
                            <div className="space-y-2">
                                <p className="text-sm text-destructive/70 line-through decoration-destructive/30">
                                    {rewrite.original}
                                </p>
                                <p className="text-sm text-foreground">
                                    {rewrite.better}
                                </p>
                            </div>

                            {/* Footer: Coaching + Copy */}
                            <div className="flex items-center justify-between pt-2 border-t border-border/50">
                                {rewrite.enhancement_note && (
                                    <p className="text-xs text-muted-foreground flex-1 pr-4">
                                        {rewrite.enhancement_note}
                                    </p>
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCopy(rewrite.better, i)}
                                    className={cn(
                                        "flex-shrink-0",
                                        copiedIndex === i
                                            ? "bg-success/10 text-success hover:bg-success/20"
                                            : ""
                                    )}
                                >
                                    {copiedIndex === i ? <CheckCircle className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                                    {copiedIndex === i ? "Copied" : "Copy"}
                                </Button>
                            </div>
                        </div>
                    ))}

                    {/* Show More / Less */}
                    {hiddenCount > 0 && (
                        <Button
                            variant="ghost"
                            className="w-full"
                            onClick={() => setShowAll(!showAll)}
                        >
                            {showAll ? (
                                <>
                                    <ChevronUp className="w-4 h-4 mr-2" />
                                    Show less
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="w-4 h-4 mr-2" />
                                    Show {hiddenCount} more
                                </>
                            )}
                        </Button>
                    )}
                </div>
            )}
        </section>
    );
}
