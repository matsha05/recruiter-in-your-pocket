"use client";

import { useState, useEffect } from "react";
import { ReportData } from "./ReportTypes";
import { InsightSparkleIcon, TransformArrowIcon } from "@/components/icons";
import { ReportSectionHeader } from "./ReportSectionHeader";
import { Button } from "@/components/ui/button";
import { saveUnlockContext } from "@/lib/unlock/unlockContext";
import { Analytics } from "@/lib/analytics";
import { Lock, ChevronDown, ChevronUp } from "lucide-react";
import { RedPenCard } from "@/components/shared/RedPenCard";
import { UnlockValueList } from "@/components/shared/UnlockValueList";

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
            <section className="gap-y-6">
                <ReportSectionHeader
                    icon={<TransformArrowIcon className="size-4 text-brand" />}
                    number="04"
                    title="Suggested Rewrites"
                    subtitle="Line edits based on the facts already in your resume."
                />
                <div className="rounded border border-success/20 bg-success/5 p-6 flex items-start gap-4">
                    <div className="size-10 rounded bg-success/10 flex items-center justify-center shrink-0">
                        <InsightSparkleIcon className="size-5 text-success" />
                    </div>
                    <div>
                        <h3 className="font-display font-medium text-foreground text-lg mb-1">
                            No rewrite is needed here
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            The existing lines are specific enough to understand without another rewrite.
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
        <section className="gap-y-8">
            <ReportSectionHeader
                icon={<TransformArrowIcon className="size-4 text-brand" />}
                number="04"
                title="Suggested Rewrites"
                subtitle="Keep the original beside every suggestion and verify each fact."
            />

            <div className="gap-y-4">
                {/* System Status Line */}
                <div className="flex items-center gap-2 px-1">
                    <div className="size-1.5 rounded-full bg-brand" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {data.rewrites.length} rewrites ready
                    </span>
                </div>

                {/* Hero Rewrite */}
                <RedPenCard
                    title="Highest-leverage rewrite"
                    before={heroRewrite.original}
                    after={heroRewrite.better}
                    className="border-brand/20"
                />

                {/* Remaining Rewrites */}
                {remainingRewrites.length > 0 && (
                    <div className="gap-y-6">
                        {isGated ? (
                            // Gated View
                            <div className="gap-y-4">
                                {/* Blurred Card */}
                                <RedPenCard
                                    title="Locked Rewrite"
                                    before={remainingRewrites[0].original}
                                    after={remainingRewrites[0].better} // It handles locking internally but we want explicit gating layout
                                    isLocked={true}
                                    onUnlock={handleUnlock}
                                />

                                <div className="rounded border border-premium/20 bg-premium/5 p-4 gap-y-3">
                                    <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                                        <Lock className="size-3.5 text-premium" />
                                        See the remaining rewrites
                                    </div>
                                    <UnlockValueList
                                        items={[
                                            "The rest of the rewrites",
                                            "Why each change may help",
                                            "Export the full report"
                                        ]}
                                        dense
                                    />
                                    {onUpgrade && (
                                        <Button
                                            variant="premium"
                                            size="sm"
                                            onClick={handleUnlock}
                                            className="w-full"
                                        >
                                            See all suggested rewrites
                                        </Button>
                                    )}
                                </div>

                                <div className="text-center">
                                    <p className="text-xs text-muted-foreground">
                                        {remainingRewrites.length} more suggested rewrite{remainingRewrites.length > 1 ? 's' : ''}.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            // Unlocked View
                            <>
                                {visibleRewrites.map((rewrite, i) => (
                                    <RedPenCard
                                        key={`${rewrite.label}-${rewrite.original}`}
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
                                                <ChevronUp className="size-4 mr-2" />
                                                Show less
                                            </>
                                        ) : (
                                            <>
                                                <ChevronDown className="size-4 mr-2" />
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
