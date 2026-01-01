import { ArrowRight, Plus } from "lucide-react";
import { useRef } from "react";
import { ReportData } from "./ReportTypes";
import { FirstImpressionSection } from "./FirstImpressionSection";
import { ScoreSummarySection } from "./ScoreSummarySection";
import { BulletUpgradesSection } from "./BulletUpgradesSection";
import { MissingWinsSection } from "./MissingWinsSection";
import { JobAlignmentSection } from "./JobAlignmentSection";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { InsightSparkleIcon } from "@/components/icons";

interface ReportStreamProps {
    report: ReportData;
    className?: string;
    isSample?: boolean;
    onNewReport?: () => void;
    freeUsesRemaining?: number;
    onUpgrade?: () => void;
    hasJobDescription?: boolean;
    isGated?: boolean;
    justUnlocked?: boolean;
    highlightSection?: string | null;
}

export function ReportStream({
    report,
    className,
    isSample = false,
    onNewReport,
    freeUsesRemaining = 2,
    onUpgrade,
    hasJobDescription = false,
    isGated = false,
    justUnlocked = false,
    highlightSection = null
}: ReportStreamProps) {
    const bulletUpgradesRef = useRef<HTMLDivElement>(null);
    const missingWinsRef = useRef<HTMLDivElement>(null);
    const jobAlignmentRef = useRef<HTMLDivElement>(null);

    // Determine footer state
    const isExhausted = !isSample && freeUsesRemaining <= 0;

    return (
        <div className={cn("max-w-3xl mx-auto pb-32 space-y-16", className)}>

            {/* 1. The Hook (First Impression) */}
            <div id="section-first-impression" className="animate-in fade-in slide-in-from-bottom-4 duration-500 scroll-mt-24">
                <FirstImpressionSection data={report} />
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent animate-in fade-in duration-700 delay-100" />

            {/* 2. The Data (Score Summary) */}
            <div id="section-score-summary" className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 scroll-mt-24">
                <ScoreSummarySection data={report} />
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent animate-in fade-in duration-700 delay-200" />

            {/* 3. The Value (Bullet Upgrades) */}
            <div
                id="section-bullet-upgrades"
                ref={bulletUpgradesRef}
                className={cn(
                    "animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 rounded transition-colors",
                    highlightSection === 'bullet_upgrades' && "unlock-highlight"
                )}
            >
                <BulletUpgradesSection data={report} isGated={isGated} onUpgrade={onUpgrade} />
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent animate-in fade-in duration-700 delay-350" />

            {/* 4. Missing Wins (Uncover Hidden Achievements) */}
            <div
                id="section-missing-wins"
                ref={missingWinsRef}
                className={cn(
                    "animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500 rounded transition-colors",
                    highlightSection === 'missing_wins' && "unlock-highlight"
                )}
            >
                <MissingWinsSection data={report} isGated={isGated} onUpgrade={onUpgrade} />
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent animate-in fade-in duration-700 delay-550" />

            {/* 5. Where You Compete (Job Alignment) */}
            <div
                id="section-job-alignment"
                ref={jobAlignmentRef}
                className={cn(
                    "animate-in fade-in slide-in-from-bottom-4 duration-500 delay-700 rounded transition-colors",
                    highlightSection === 'job_alignment' && "unlock-highlight"
                )}
            >
                <JobAlignmentSection data={report} hasJobDescription={hasJobDescription} isGated={isGated} onUpgrade={onUpgrade} />
            </div>

            {/* Report Footer - "What's next?" */}
            <div className="pt-8 space-y-6">
                <div className="h-px bg-gradient-to-r from-brand/20 via-brand/40 to-brand/20" />

                <div className="text-center space-y-6">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        What&apos;s next?
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
                                >
                                    Run Your Free Review
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            )}
                        </div>
                    ) : isExhausted && onUpgrade ? (
                        // Exhausted free reports - upgrade CTA
                        <div className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                That was your free review. Want to run another version?
                            </p>
                            <Button
                                variant="premium"
                                onClick={onUpgrade}
                            >
                                <InsightSparkleIcon className="w-4 h-4 mr-2" />
                                Get More Reviews
                            </Button>
                        </div>
                    ) : onNewReport ? (
                        // Has credits - run another
                        <div className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                {freeUsesRemaining > 0
                                    ? `You have ${freeUsesRemaining} free review${freeUsesRemaining > 1 ? 's' : ''} remaining.`
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
