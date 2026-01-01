"use client";

import { useMemo, useState } from "react";

export function ReferralCalculator() {
    const [salary, setSalary] = useState("");
    const [coldRate, setColdRate] = useState("");
    const [referralRate, setReferralRate] = useState("");
    const [minutesPerApp, setMinutesPerApp] = useState("");

    const parsed = useMemo(() => {
        const salaryNum = Number(salary);
        const coldRateNum = Number(coldRate);
        const referralRateNum = Number(referralRate);
        const minutesNum = Number(minutesPerApp);

        if (!salaryNum || !coldRateNum || !referralRateNum || !minutesNum) {
            return null;
        }

        if (coldRateNum <= 0 || referralRateNum <= 0 || minutesNum <= 0) {
            return null;
        }

        const coldCallbackRate = coldRateNum / 100;
        const referralCallbackRate = referralRateNum / 100;
        const coldAppsNeeded = Math.round(1 / coldCallbackRate);
        const referralAppsNeeded = Math.round(1 / referralCallbackRate);
        const appsSaved = Math.max(coldAppsNeeded - referralAppsNeeded, 0);
        const hoursSaved = Math.round((appsSaved * minutesNum) / 60);
        const hourlyRate = salaryNum / 2080;
        const timeSavingsValue = Math.round(hoursSaved * hourlyRate);

        return {
            salaryNum,
            coldAppsNeeded,
            referralAppsNeeded,
            appsSaved,
            hoursSaved,
            timeSavingsValue
        };
    }, [salary, coldRate, referralRate, minutesPerApp]);

    const formatSalary = (value: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0
        }).format(value);
    };

    return (
        <figure className="riyp-figure w-full max-w-lg mx-auto my-8">
            <div className="riyp-figure-frame p-6">
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-4">
                    Referral ROI calculator
                </div>

                <div className="grid md:grid-cols-2 gap-6 text-sm text-muted-foreground">
                    <label className="space-y-2">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/70">Annual salary (USD)</span>
                        <input
                            value={salary}
                            onChange={(event) => setSalary(event.target.value)}
                            placeholder="100000"
                            className="w-full rounded-md border border-border/40 bg-background px-3 py-2 text-sm text-foreground"
                        />
                    </label>
                    <label className="space-y-2">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/70">Minutes per application</span>
                        <input
                            value={minutesPerApp}
                            onChange={(event) => setMinutesPerApp(event.target.value)}
                            placeholder="30"
                            className="w-full rounded-md border border-border/40 bg-background px-3 py-2 text-sm text-foreground"
                        />
                    </label>
                    <label className="space-y-2">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/70">Cold callback rate (%)</span>
                        <input
                            value={coldRate}
                            onChange={(event) => setColdRate(event.target.value)}
                            placeholder="4"
                            className="w-full rounded-md border border-border/40 bg-background px-3 py-2 text-sm text-foreground"
                        />
                    </label>
                    <label className="space-y-2">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/70">Referral callback rate (%)</span>
                        <input
                            value={referralRate}
                            onChange={(event) => setReferralRate(event.target.value)}
                            placeholder="50"
                            className="w-full rounded-md border border-border/40 bg-background px-3 py-2 text-sm text-foreground"
                        />
                    </label>
                </div>

                {!parsed ? (
                    <div className="mt-5 border-t border-border/20 pt-4 text-xs text-muted-foreground">
                        Enter your own rates or a published benchmark to see the savings. We do not assume numbers here.
                    </div>
                ) : (
                    <div className="mt-5 border-t border-border/20 pt-4 space-y-2">
                        <div className="text-sm text-foreground">
                            One referral saves about {parsed.appsSaved} applications.
                        </div>
                        <div className="text-xs text-muted-foreground">
                            That is roughly {parsed.hoursSaved} hours, worth {formatSalary(parsed.timeSavingsValue)} of time.
                        </div>
                        <div className="text-[10px] text-muted-foreground/70">
                            Based on a {formatSalary(parsed.salaryNum)} salary and your entered callback rates.
                        </div>
                    </div>
                )}
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
