"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calculator, ArrowRight, Briefcase } from "lucide-react";

export function ReferralCalculator() {
    const [salary, setSalary] = useState(100000);

    // Research-backed rates
    const coldCallbackRate = 0.04; // 4% callback rate from cold applications
    const referralCallbackRate = 0.50; // 50% callback rate from referrals

    const results = useMemo(() => {
        // Applications needed to get 1 interview
        const coldAppsNeeded = Math.round(1 / coldCallbackRate);
        const referralAppsNeeded = Math.round(1 / referralCallbackRate);
        const appsSaved = coldAppsNeeded - referralAppsNeeded;

        // Time saved (assuming 30 min per tailored application)
        const hoursSaved = Math.round((appsSaved * 30) / 60);

        // Value of time (assuming hourly = salary / 2080)
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
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(value);
    };

    const formatNumber = (value: number) => {
        return new Intl.NumberFormat('en-US').format(value);
    };

    return (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border/50 bg-muted/30">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Calculator className="w-4 h-4" />
                    <span>Referral ROI Calculator</span>
                </div>
            </div>

            {/* Input Section */}
            <div className="p-6 space-y-6">
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-foreground">
                            Target Salary
                        </label>
                        <span className="text-lg font-serif font-semibold text-brand">
                            {formatSalary(salary)}
                        </span>
                    </div>
                    <input
                        type="range"
                        min={50000}
                        max={300000}
                        step={5000}
                        value={salary}
                        onChange={(e) => setSalary(Number(e.target.value))}
                        className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer accent-brand [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>$50K</span>
                        <span>$300K</span>
                    </div>
                </div>

                {/* Results */}
                <div className="pt-4 border-t border-border/50">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Cold Applications */}
                        <div className="space-y-1">
                            <div className="text-xs text-muted-foreground uppercase tracking-wide">
                                Cold Applications
                            </div>
                            <div className="text-2xl font-serif font-bold text-muted-foreground">
                                {results.coldAppsNeeded}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                apps per interview
                            </div>
                        </div>

                        {/* Referral Applications */}
                        <div className="space-y-1">
                            <div className="text-xs text-muted-foreground uppercase tracking-wide">
                                With Referrals
                            </div>
                            <motion.div
                                key={results.referralAppsNeeded}
                                initial={{ scale: 1.1, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-2xl font-serif font-bold text-brand"
                            >
                                {results.referralAppsNeeded}
                            </motion.div>
                            <div className="text-xs text-muted-foreground">
                                apps per interview
                            </div>
                        </div>
                    </div>
                </div>

                {/* Key Insight */}
                <motion.div
                    key={salary}
                    initial={{ opacity: 0.8 }}
                    animate={{ opacity: 1 }}
                    className="p-4 bg-brand/5 border border-brand/10 rounded-lg"
                >
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                            <Briefcase className="w-4 h-4 text-brand" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-foreground">
                                One referral saves you {results.appsSaved} applications
                            </p>
                            <p className="text-xs text-muted-foreground">
                                That&apos;s roughly {results.hoursSaved} hours of application time,
                                worth {formatSalary(results.timeSavingsValue)} of your time.
                            </p>
                        </div>
                    </div>
                </motion.div>

                <p className="text-xs text-muted-foreground/70">
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
        </div>
    );
}
