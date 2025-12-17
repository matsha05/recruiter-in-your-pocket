"use client";

import { ReportData } from "./ReportTypes";
import { FirstImpressionSection } from "./FirstImpressionSection";
import { RecruiterNote } from "./RecruiterNote";
import { ScoreSummarySection } from "./ScoreSummarySection";
import { BulletUpgradesSection } from "./BulletUpgradesSection";
import { MissingWinsSection } from "./MissingWinsSection";
import { JobAlignmentSection } from "./JobAlignmentSection";
import { cn } from "@/lib/utils";
import { ArrowRight, Plus, Sparkles } from "lucide-react";

interface ReportStreamProps {
    report: ReportData;
    className?: string;
    isSample?: boolean;
    onNewReport?: () => void;
    freeUsesRemaining?: number;
    onUpgrade?: () => void;
}

export function ReportStream({
    report,
    className,
    isSample = false,
    onNewReport,
    freeUsesRemaining = 2,
    onUpgrade
}: ReportStreamProps) {

    // Determine footer state
    const isExhausted = !isSample && freeUsesRemaining <= 0;

    // Generate fallback verdict based on score if not provided
    const getDefaultVerdict = (score?: number): string => {
        if (!score) return "This one needs more context before I can make a call.";
        if (score >= 85) return "This would go straight to my interview pile.";
        if (score >= 70) return "There's something here, but I'd need to see more before reaching out.";
        if (score >= 60) return "The foundation is there, but the story isn't landing yet.";
        return "I'd move on to the next resume.";
    };

    const verdict = report.recruiter_note || getDefaultVerdict(report.score);

    return (
        <div className={cn("max-w-3xl mx-auto pb-32 space-y-16 animate-in fade-in duration-700 slide-in-from-bottom-4", className)}>

            {/* 1. The Hook (First Impression) */}
            <FirstImpressionSection data={report} />

            {/* The Recruiter's Verdict - Singular Judgment Moment */}
            <RecruiterNote verdict={verdict} />

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            {/* 2. The Data (Score Summary) */}
            <ScoreSummarySection data={report} />

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            {/* 3. The Value (Bullet Upgrades) */}
            <BulletUpgradesSection data={report} />

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            {/* 4. Missing Wins (Uncover Hidden Achievements) */}
            <MissingWinsSection data={report} />

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            {/* 5. Where You Compete (Job Alignment) */}
            <JobAlignmentSection data={report} />

            {/* Report Footer - Contextual CTA */}
            <div className="pt-8 space-y-6">
                <div className="h-px bg-gradient-to-r from-brand/20 via-brand/40 to-brand/20" />
                <div className="text-center space-y-4">
                    <p className="text-sm font-medium text-foreground">
                        That's the full picture.
                    </p>

                    {isExhausted && onUpgrade ? (
                        // Exhausted free reports - upgrade CTA
                        <div className="space-y-2">
                            <p className="text-xs text-muted-foreground">
                                You've used your free reports.
                            </p>
                            <button
                                onClick={onUpgrade}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-premium text-white hover:bg-premium/90 transition-colors"
                            >
                                <Sparkles className="w-4 h-4" />
                                Unlock Unlimited
                            </button>
                        </div>
                    ) : onNewReport ? (
                        // Has credits - show appropriate new report button
                        <button
                            onClick={onNewReport}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-brand text-white hover:bg-brand/90 transition-colors"
                        >
                            {isSample ? (
                                <>
                                    Run Your Free Report
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" />
                                    Run Another
                                </>
                            )}
                        </button>
                    ) : null}
                </div>
            </div>
        </div>
    );
}



