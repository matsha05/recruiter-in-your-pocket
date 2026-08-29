"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, Info } from "lucide-react";
import { PrincipalRecruiterIcon } from "@/components/icons";
import { ReportData } from "./ReportTypes";
import { cn } from "@/lib/utils";
import { Peek, PeekHeader, PeekTitle, PeekDescription, PeekContent } from "@/components/ui/peek";
import { Button } from "@/components/ui/button";
import { getScoreColor, getScoreLabel } from "@/lib/score-utils";

export function FirstImpressionSection({ data }: { data: ReportData }) {
    const [animatedScore, setAnimatedScore] = useState(0);
    const [showBadge, setShowBadge] = useState(false);
    const [showFirstPassNote, setShowFirstPassNote] = useState(false);
    const [peekOpen, setPeekOpen] = useState(false);

    const firstImpressionText = data.first_impression || data.score_comment_long || data.score_comment_short || data.summary;
    const targetScore = data.score || 0;
    const scoreBand = { label: getScoreLabel(targetScore), colorClass: getScoreColor(targetScore) };
    const primaryFix = data.top_fixes?.find((item) => item.fix || item.text);
    const primaryAction = primaryFix?.fix || primaryFix?.text;
    const primaryEvidence = typeof primaryFix?.evidence === "string"
        ? primaryFix.evidence
        : primaryFix?.evidence?.excerpt;
    const primaryEvidenceSection = typeof primaryFix?.evidence === "object"
        ? primaryFix.evidence.section
        : undefined;
    const priorityText = primaryAction || data.biggest_gap_example;
    const evidenceText = primaryEvidence || (primaryAction ? data.biggest_gap_example : undefined);
    const whyItMatters = primaryFix?.why
        || "When a line is vague, the reviewer has to infer your role or the result. Adding the missing detail makes the claim easier to evaluate.";

    // Score animation with badge reveal
    useEffect(() => {
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReducedMotion) {
            setAnimatedScore(targetScore);
            setShowBadge(true);
            setShowFirstPassNote(true);
            return;
        }

        if (targetScore <= 0) {
            setAnimatedScore(targetScore);
            setShowBadge(true);
            setShowFirstPassNote(true);
            return;
        }
        setAnimatedScore(0);
        setShowBadge(false);
        setShowFirstPassNote(false);
        const duration = 700;
        const startTime = Date.now();
        let animationFrameId = 0;
        let badgeTimer: ReturnType<typeof setTimeout> | undefined;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Smooth ease-out cubic for premium feel
            const eased = 1 - Math.pow(1 - progress, 3);
            setAnimatedScore(Math.round(targetScore * eased));

            if (progress < 1) {
                animationFrameId = requestAnimationFrame(animate);
            } else {
                badgeTimer = setTimeout(() => {
                    setShowBadge(true);
                    setShowFirstPassNote(true);
                }, 100);
            }
        };
        animationFrameId = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animationFrameId);
            if (badgeTimer) clearTimeout(badgeTimer);
        };
    }, [targetScore]);

    return (
        <section className="gap-y-5 md:gap-y-6">
            {/* Section Header with horizontal line decoration */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-6 h-px bg-border" />
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <PrincipalRecruiterIcon className="size-4 text-brand" />
                        01. First read
                    </h2>
                </div>
                <Link
                    href="/research/how-we-score"
                    className="text-xs font-medium text-muted-foreground transition-colors hover:text-brand"
                    target="_blank"
                    rel="noopener"
                >
                    <span className="md:hidden">How it works</span>
                    <span className="hidden md:inline">How this review works</span>
                    {" →"}
                </Link>
            </div>

            {/* The report's signature moment: score with the judgment and its receipts. */}
            <div className="riyp-report-rule overflow-hidden border-y">
                <div className="grid md:grid-cols-[minmax(0,1fr)_12rem]">
                    <div className="order-1 flex items-end justify-between gap-5 border-b bg-black/[0.018] px-5 py-5 md:order-2 md:flex-col md:items-start md:justify-between md:gap-8 md:border-b-0 md:border-l md:p-7">
                        <div>
                            <p className="riyp-type-10px font-bold uppercase riyp-track-015 text-muted-foreground">Clarity summary</p>
                            <div className="mt-2 flex items-baseline gap-1.5 md:block">
                                <p className="font-display text-5xl riyp-weight-560 leading-none riyp-track-n05 tabular-nums text-foreground">{animatedScore}</p>
                                <p className="text-xs text-muted-foreground md:mt-1">/100</p>
                            </div>
                        </div>

                        <div className="max-w-36 text-right md:max-w-none md:text-left">
                            <div className={cn(
                                "transition-[opacity,transform] duration-150 ease-out motion-reduce:transition-none",
                                showBadge ? "translate-y-0 scale-100 opacity-100" : "translate-y-2 scale-[0.96] opacity-0"
                            )}>
                                <span className={cn(
                                    "inline-flex items-center justify-end gap-1.5 text-xs font-bold uppercase riyp-track-012 md:justify-start",
                                    scoreBand.colorClass
                                )}>
                                    <CheckCircle2 className="size-3" /> {scoreBand.label}
                                </span>
                            </div>
                            <p className={cn(
                                "mt-2 text-xs leading-5 text-muted-foreground transition-[opacity,transform] duration-150 motion-reduce:transition-none",
                                showFirstPassNote ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                            )}>
                                Not a prediction of interviews or offers.
                            </p>
                        </div>
                    </div>

                    <div className="riyp-report-rule order-2 flex flex-col py-7 md:order-1 md:py-9 md:pr-10">
                        <div className="order-2 pt-6 md:order-1 md:pt-0">
                            <p className="riyp-type-10px font-bold uppercase riyp-track-017 text-brand">Likely takeaway</p>

                            <h3 className="riyp-report-verdict mt-3 max-w-[30ch] font-display riyp-weight-520 text-foreground riyp-stretch-96">
                                {firstImpressionText}
                                {data.first_impression_takeaway && (
                                    <> <span className="font-medium">{data.first_impression_takeaway}</span></>
                                )}
                            </h3>
                        </div>

                        {priorityText && (
                            <div className="riyp-border-paper-line order-1 border-b pb-6 md:order-2 md:mt-7 md:border-b-0 md:border-t md:pb-0 md:pt-5">
                                <div className="mb-2 flex items-center justify-between gap-2">
                                    <span className="riyp-type-10px font-bold uppercase riyp-track-015 riyp-text-annotation">
                                        {primaryAction ? "Start here" : "Most important question"}
                                    </span>
                                    <Peek
                                        open={peekOpen}
                                        onOpenChange={setPeekOpen}
                                        trigger={
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={cn(
                                                    "min-h-11 px-3 text-xs transition-colors",
                                                    peekOpen
                                                        ? "bg-brand/10 text-brand hover:bg-brand/10 hover:text-brand"
                                                        : "text-muted-foreground hover:text-foreground"
                                                )}
                                            >
                                                <Info className="size-3 mr-1" />
                                                Why it matters
                                            </Button>
                                        }
                                        side="right"
                                        title="Why this matters"
                                    >
                                        <PeekHeader>
                                            <PeekTitle>How a reviewer may read it</PeekTitle>
                                            <PeekDescription>
                                                The context behind this question
                                            </PeekDescription>
                                        </PeekHeader>
                                        <PeekContent>
                                            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                                                {whyItMatters}
                                            </p>
                                        </PeekContent>
                                    </Peek>
                                </div>
                                <p className="max-w-[40rem] text-base font-medium leading-6 text-foreground">
                                    {priorityText}
                                </p>
                                {evidenceText && (
                                    <blockquote className="riyp-border-annotation mt-4 border-l-2 pl-4">
                                        <p className="riyp-type-10px font-bold uppercase riyp-track-013 text-muted-foreground">
                                            {primaryEvidenceSection ? `Evidence · ${primaryEvidenceSection}` : "Evidence from the resume"}
                                        </p>
                                        <p className="mt-1.5 text-sm leading-6 text-muted-foreground">&ldquo;{evidenceText}&rdquo;</p>
                                    </blockquote>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
