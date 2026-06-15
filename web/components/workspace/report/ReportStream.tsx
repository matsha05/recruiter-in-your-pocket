import { ArrowRight, Plus } from "lucide-react";
import { useRef } from "react";
import { ReportData } from "./ReportTypes";
import { FirstImpressionSection } from "./FirstImpressionSection";
import { ScoreSummarySection } from "./ScoreSummarySection";
import { EvidenceLedgerSection } from "./EvidenceLedgerSection";
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
    hasPaidAccess?: boolean;
}

export function ReportStream({
    report,
    className,
    isSample = false,
    onNewReport,
    freeUsesRemaining = 1,
    onUpgrade,
    hasJobDescription = false,
    isGated = false,
    justUnlocked = false,
    highlightSection = null,
    hasPaidAccess = false
}: ReportStreamProps) {
    const bulletUpgradesRef = useRef<HTMLDivElement>(null);
    const missingWinsRef = useRef<HTMLDivElement>(null);
    const jobAlignmentRef = useRef<HTMLDivElement>(null);

    // Determine footer state
    const isExhausted = !isSample && freeUsesRemaining <= 0 && !hasPaidAccess;

    return (
        <div className={cn("mx-auto max-w-3xl gap-y-12 pb-28 md:gap-y-14", className)}>

            {/* 1. The Hook (First Impression) */}
            <div id="section-first-impression" className="animate-in fade-in slide-in-from-bottom-4 duration-500 scroll-mt-24">
                <FirstImpressionSection data={report} />
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-border/80 to-transparent animate-in fade-in duration-700 delay-100" />

            {/* 2. The Data (Score Summary) */}
            <div id="section-score-summary" className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 scroll-mt-24">
                <ScoreSummarySection data={report} />
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-border/80 to-transparent animate-in fade-in duration-700 delay-200" />

            {/* 3. Evidence Ledger */}
            <div
                id="section-evidence-ledger"
                className={cn(
                    "animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 rounded transition-colors",
                    highlightSection === 'evidence_ledger' && "unlock-highlight"
                )}
            >
                <EvidenceLedgerSection data={report} isGated={isGated} onUpgrade={onUpgrade} />
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-border/80 to-transparent animate-in fade-in duration-700 delay-350" />

            {/* 4. The Value (Bullet Upgrades) */}
            <div
                id="section-bullet-upgrades"
                ref={bulletUpgradesRef}
                className={cn(
                    "animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500 rounded transition-colors",
                    highlightSection === 'bullet_upgrades' && "unlock-highlight"
                )}
            >
                <BulletUpgradesSection data={report} isGated={isGated} onUpgrade={onUpgrade} />
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-border/80 to-transparent animate-in fade-in duration-700 delay-550" />

            {/* 5. Missing Wins (Uncover Hidden Achievements) */}
            <div
                id="section-missing-wins"
                ref={missingWinsRef}
                className={cn(
                    "animate-in fade-in slide-in-from-bottom-4 duration-500 delay-700 rounded transition-colors",
                    highlightSection === 'missing_wins' && "unlock-highlight"
                )}
            >
                <MissingWinsSection data={report} isGated={isGated} onUpgrade={onUpgrade} />
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-border/80 to-transparent animate-in fade-in duration-700 delay-750" />

            {/* 6. Role Fit */}
            <div
                id="section-job-alignment"
                ref={jobAlignmentRef}
                className={cn(
                    "animate-in fade-in slide-in-from-bottom-4 duration-500 delay-900 rounded transition-colors",
                    highlightSection === 'job_alignment' && "unlock-highlight"
                )}
            >
                <JobAlignmentSection data={report} hasJobDescription={hasJobDescription} isGated={isGated} onUpgrade={onUpgrade} />
            </div>

            {/* Report Footer */}
            <div className="gap-y-5 pt-6 md:pt-8">
                <div className="h-px bg-gradient-to-r from-brand/20 via-brand/40 to-brand/20" />

                <div className="gap-y-5 text-center">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Next pass
                    </h3>

                    {isSample ? (
                        // Sample report - CTA to run their own
                        <div className="gap-y-3">
                            <p className="mx-auto max-w-md text-sm text-muted-foreground">
                                This is a sample report. Ready to see yours?
                            </p>
                            {onNewReport && (
                                <Button
                                    variant="brand"
                                    size="lg"
                                    onClick={onNewReport}
                                >
                                    Run Your Free Report
                                    <ArrowRight className="size-4 ml-2" />
                                </Button>
                            )}
                        </div>
                    ) : isExhausted && onUpgrade ? (
                        // Exhausted free reports - upgrade CTA
                        <div className="gap-y-3">
                            <p className="text-sm text-muted-foreground">
                                That was your free report. Want to run another version?
                            </p>
                            <Button
                                variant="premium"
                                onClick={onUpgrade}
                            >
                                <InsightSparkleIcon className="size-4 mr-2" />
                                Unlock More Reports
                            </Button>
                        </div>
                    ) : onNewReport ? (
                        // Has credits - run another
                        <div className="gap-y-3">
                            <p className="text-sm text-muted-foreground">
                                {hasPaidAccess
                                    ? "Paid access is active. Run the next role-specific report when you need it."
                                    : freeUsesRemaining > 0
                                        ? `You have ${freeUsesRemaining} free report${freeUsesRemaining > 1 ? 's' : ''} remaining.`
                                        : 'Ready to run another version?'}
                            </p>
                            <Button
                                variant="brand"
                                onClick={onNewReport}
                            >
                                <Plus className="size-4 mr-2" />
                                Run Another Report
                            </Button>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
