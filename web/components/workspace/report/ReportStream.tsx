"use client";

import { ReportData } from "./ReportTypes";
import { FirstImpressionSection } from "./FirstImpressionSection";
import { ScoreSummarySection } from "./ScoreSummarySection";
import { BulletUpgradesSection } from "./BulletUpgradesSection";
import { MissingWinsSection } from "./MissingWinsSection";
import { JobAlignmentSection } from "./JobAlignmentSection";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, Plus, Sparkles } from "lucide-react";

interface ReportStreamProps {
    report: ReportData;
    className?: string;
    isSample?: boolean;
    onNewReport?: () => void;
    freeUsesRemaining?: number;
    onUpgrade?: () => void;
    hasJobDescription?: boolean;
}

export function ReportStream({
    report,
    className,
    isSample = false,
    onNewReport,
    freeUsesRemaining = 2,
    onUpgrade,
    hasJobDescription = false
}: ReportStreamProps) {

    // Determine footer state
    const isExhausted = !isSample && freeUsesRemaining <= 0;

    return (
        <div className={cn("max-w-3xl mx-auto pb-32 space-y-16", className)}>

            {/* 1. The Hook (First Impression) */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <FirstImpressionSection data={report} />
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent animate-in fade-in duration-700 delay-100" />

            {/* 2. The Data (Score Summary) */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
                <ScoreSummarySection data={report} />
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent animate-in fade-in duration-700 delay-200" />

            {/* 3. The Value (Bullet Upgrades) */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
                <BulletUpgradesSection data={report} />
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent animate-in fade-in duration-700 delay-350" />

            {/* 4. Missing Wins (Uncover Hidden Achievements) */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
                <MissingWinsSection data={report} />
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent animate-in fade-in duration-700 delay-550" />

            {/* 5. Where You Compete (Job Alignment) */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-700">
                <JobAlignmentSection data={report} hasJobDescription={hasJobDescription} />
            </div>

            {/* Report Footer - "What's next?" */}
            <div className="pt-8 space-y-6">
                <div className="h-px bg-gradient-to-r from-brand/20 via-brand/40 to-brand/20" />

                <div className="text-center space-y-6">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        What's next?
                    </h3>

                    {isSample ? (
                        // Sample report - CTA to run their own
                        <div className="space-y-3">
                            <p className="text-sm text-muted-foreground max-w-md mx-auto">
                                This is what a recruiter sees. Ready to see yours?
                            </p>
                            {onNewReport && (
                                <Button
                                    variant="brand"
                                    size="lg"
                                    onClick={onNewReport}
                                    className="shadow-lg shadow-brand/20"
                                >
                                    Run Your Free Report
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            )}
                        </div>
                    ) : isExhausted && onUpgrade ? (
                        // Exhausted free reports - upgrade CTA
                        <div className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                That was your free audit. Want to run another version?
                            </p>
                            <Button
                                variant="premium"
                                onClick={onUpgrade}
                            >
                                <Sparkles className="w-4 h-4 mr-2" />
                                Get More Audits
                            </Button>
                        </div>
                    ) : onNewReport ? (
                        // Has credits - run another
                        <div className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                {freeUsesRemaining > 0
                                    ? `You have ${freeUsesRemaining} free audit${freeUsesRemaining > 1 ? 's' : ''} remaining.`
                                    : 'Ready to analyze another version?'}
                            </p>
                            <Button
                                variant="brand"
                                onClick={onNewReport}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Run Another
                            </Button>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}


