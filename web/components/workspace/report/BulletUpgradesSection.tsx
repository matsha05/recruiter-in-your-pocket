"use client";

import { useState, useEffect } from "react";
import { ReportData } from "./ReportTypes";
import { TransformArrowIcon } from "@/components/icons";
import { ReportSectionHeader } from "./ReportSectionHeader";
import { Button } from "@/components/ui/button";
import { saveUnlockContext } from "@/lib/unlock/unlockContext";
import { Analytics } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { Sparkles, Lock, ChevronDown, ChevronUp } from "lucide-react";
import { RedPenCard } from "@/components/shared/RedPenCard";

interface BulletUpgradesSectionProps {
    data: ReportData;
    isGated?: boolean;
    onUpgrade?: () => void;
}

export function BulletUpgradesSection({ data, isGated = false, onUpgrade }: BulletUpgradesSectionProps) {
    const [showAll, setShowAll] = useState(false);

    // SM1: Track when fixes are rendered
    useEffect(() => {
        if (data.rewrites && data.rewrites.length > 0) {
            Analytics.track('sm1_fixes_rendered', { count: data.rewrites.length });
        }
    }, [data.rewrites]);

    if (!data.rewrites || data.rewrites.length === 0) {
        return (
            <section className="space-y-6">
                <ReportSectionHeader
                    icon={<TransformArrowIcon className="w-4 h-4 text-brand" />}
                    number="03"
                    title="The Red Pen"
                    subtitle="How I'd rewrite these to land harder."
                />
                <div className="rounded-lg border border-success/20 bg-success/5 p-6 flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                        <Sparkles className="h-5 w-5 text-success" />
                    </div>
                    <div>
                        <h3 className="font-display font-medium text-foreground text-lg mb-1">
                            Zero Critical Issues Detected
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Your bullets are landing with authority. Our heuristics found high verb impact and strong measurable outcomes.
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    const heroRewrite = data.rewrites[0];
    const remainingRewrites = data.rewrites.slice(1);
    const visibleRewrites = showAll ? remainingRewrites : remainingRewrites.slice(0, 2);
    const hiddenCount = remainingRewrites.length - 2;

    const handleUnlock = () => {
        if (onUpgrade) {
            saveUnlockContext({ section: 'bullet_upgrades' });
            Analytics.paywallCtaClicked('bullet_upgrades');
            onUpgrade();
        }
    };

    return (
        <section className="space-y-8">
            <ReportSectionHeader
                icon={<TransformArrowIcon className="w-4 h-4 text-brand" />}
                number="03"
                title="The Red Pen"
                subtitle="How I'd rewrite these to land harder."
            />

            <div className="space-y-4">
                {/* System Status Line */}
                <div className="flex items-center gap-2 px-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {data.rewrites.length} Opportunities Identified
                    </span>
                </div>

                {/* Hero Rewrite */}
                <RedPenCard
                    title="High-Priority Rewrite"
                    before={heroRewrite.original}
                    after={heroRewrite.better}
                    className="border-brand/20 shadow-md"
                />

                {/* Remaining Rewrites */}
                {remainingRewrites.length > 0 && (
                    <div className="space-y-6">
                        {isGated ? (
                            // Gated View
                            <div className="relative">
                                {/* Blurred Card */}
                                <RedPenCard
                                    title="Locked Rewrite"
                                    before={remainingRewrites[0].original}
                                    after={remainingRewrites[0].better} // It handles locking internally but we want explicit gating layout
                                    isLocked={true}
                                    onUnlock={handleUnlock}
                                />
                                <div className="mt-4 text-center">
                                    <p className="text-xs text-muted-foreground">
                                        {remainingRewrites.length} bullet{remainingRewrites.length > 1 ? 's' : ''} that made me pause. See why.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            // Unlocked View
                            <>
                                {visibleRewrites.map((rewrite, i) => (
                                    <RedPenCard
                                        key={i}
                                        title={rewrite.label || `Rewrite #${i + 2}`}
                                        before={rewrite.original}
                                        after={rewrite.better}
                                    />
                                ))}

                                {hiddenCount > 0 && (
                                    <Button
                                        variant="ghost"
                                        className="w-full text-muted-foreground"
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
                            </>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}
