"use client";

import { useMemo } from "react";

export function ReferralCalculator() {
    const salary = 100000;

    const coldCallbackRate = 0.04;
    const referralCallbackRate = 0.5;

    const results = useMemo(() => {
        const coldAppsNeeded = Math.round(1 / coldCallbackRate);
        const referralAppsNeeded = Math.round(1 / referralCallbackRate);
        const appsSaved = coldAppsNeeded - referralAppsNeeded;
        const hoursSaved = Math.round((appsSaved * 30) / 60);
        const hourlyRate = salary / 2080;
        const timeSavingsValue = Math.round(hoursSaved * hourlyRate);

        return {
            coldAppsNeeded,
            referralAppsNeeded,
            appsSaved,
            hoursSaved,
            timeSavingsValue
        };
    }, [salary]);

    const formatSalary = (value: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0
        }).format(value);
    };

    return (
        <figure className="w-full max-w-lg mx-auto my-8">
            <div className="border border-border/30 bg-background p-6">
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-4">
                    Referral ROI example
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">Cold applications</div>
                        <div className="text-2xl font-display font-medium text-muted-foreground">
                            {results.coldAppsNeeded}
                        </div>
                        <div className="text-xs text-muted-foreground">Apps per interview</div>
                    </div>

                    <div className="space-y-1">
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">With referrals</div>
                        <div className="text-2xl font-display font-medium text-brand">
                            {results.referralAppsNeeded}
                        </div>
                        <div className="text-xs text-muted-foreground">Apps per interview</div>
                    </div>
                </div>

                <div className="mt-5 border-t border-border/20 pt-4 space-y-2">
                    <div className="text-sm text-foreground">
                        One referral saves about {results.appsSaved} applications.
                    </div>
                    <div className="text-xs text-muted-foreground">
                        That is roughly {results.hoursSaved} hours, worth {formatSalary(results.timeSavingsValue)} of time.
                    </div>
                    <div className="text-[10px] text-muted-foreground/70">
                        Example assumes a {formatSalary(salary)} salary and published callback rates.
                    </div>
                </div>

                <p className="text-[10px] text-muted-foreground/70 mt-4">
                    Based on callback rates from{" "}
                    <a
                        href="https://www.nber.org/papers/w21357"
                        target="_blank"
                        rel="noopener"
                        className="underline hover:text-muted-foreground transition-colors"
                    >
                        NBER research
                    </a>{" "}and{" "}
                    <a
                        href="https://www.nber.org/papers/w25920"
                        target="_blank"
                        rel="noopener"
                        className="underline hover:text-muted-foreground transition-colors"
                    >
                        Friebel et al.
                    </a>
                </p>
            </div>

            <figcaption className="mt-3 text-center">
                <span className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Fig. 2</span>
                <span className="block text-xs text-muted-foreground">
                    Referral efficiency compared to cold applications.
                </span>
            </figcaption>
        </figure>
    );
}
