"use client";

import { ReportData } from "./ReportTypes";
import { FirstImpressionSection } from "./FirstImpressionSection";
import { ScoreSummarySection } from "./ScoreSummarySection";
import { BulletUpgradesSection } from "./BulletUpgradesSection";
import { cn } from "@/lib/utils";

interface ReportStreamProps {
    report: ReportData;
    className?: string;
}

export function ReportStream({ report, className }: ReportStreamProps) {
    return (
        <div className={cn("max-w-3xl mx-auto pb-32 space-y-16 animate-in fade-in duration-700 slide-in-from-bottom-4", className)}>

            {/* 1. The Hook (First Impression) */}
            <FirstImpressionSection data={report} />

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            {/* 2. The Data (Score Summary) */}
            <ScoreSummarySection data={report} />

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            {/* 3. The Value (Bullet Upgrades) */}
            <BulletUpgradesSection data={report} />

            {/* Footer / CTA - Placeholder for Paywall or Next Steps */}
            <div className="text-center pt-12 text-muted-foreground text-sm">
                <p>End of Audit.</p>
            </div>
        </div>
    );
}
