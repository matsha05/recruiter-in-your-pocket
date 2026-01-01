"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function ReferralCalculator() {
    // Default values for better initial state
    const [salary, setSalary] = useState(120000);
    const [coldRate, setColdRate] = useState(2);
    const [referralRate, setReferralRate] = useState(40);
    const [minutesPerApp, setMinutesPerApp] = useState(45);

    const stats = useMemo(() => {
        // Avoid division by zero
        const safeColdRate = Math.max(coldRate, 0.1) / 100;
        const safeReferralRate = Math.max(referralRate, 0.1) / 100;

        const coldAppsNeeded = Math.round(1 / safeColdRate);
        const referralAppsNeeded = Math.round(1 / safeReferralRate);

        const appsSaved = Math.max(coldAppsNeeded - referralAppsNeeded, 0);
        const hoursSaved = Math.round((appsSaved * minutesPerApp) / 60);

        const hourlyRate = salary / 2080;
        const timeSavingsValue = Math.round(hoursSaved * hourlyRate);

        // Calculate ratios for the bar chart
        const maxApps = Math.max(coldAppsNeeded, referralAppsNeeded);
        const coldBarPercent = (coldAppsNeeded / maxApps) * 100;
        const referralBarPercent = (referralAppsNeeded / maxApps) * 100;

        return {
            coldAppsNeeded,
            referralAppsNeeded,
            appsSaved,
            hoursSaved,
            timeSavingsValue,
            coldBarPercent,
            referralBarPercent
        };
    }, [salary, coldRate, referralRate, minutesPerApp]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0
        }).format(value);
    };

    return (
        <figure className="my-12 w-full max-w-2xl mx-auto font-sans">
            <div className="rounded-xl border border-border/40 bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-500">
                {/* Header */}
                <div className="bg-muted/30 px-6 py-4 border-b border-border/40 flex items-center justify-between">
                    <span className="font-display font-medium text-foreground tracking-tight">Referral ROI Calculator</span>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground bg-background px-2 py-1 rounded border border-border/40">Interactive</span>
                </div>

                <div className="p-6 md:p-8 space-y-8">
                    {/* Controls */}
                    <div className="grid md:grid-cols-2 gap-8">
                        <InputGroup
                            label="Annual Salary"
                            value={salary}
                            setValue={setSalary}
                            min={30000}
                            max={500000}
                            step={5000}
                            format={(v) => formatCurrency(v)}
                        />
                        <InputGroup
                            label="Minutes per App"
                            value={minutesPerApp}
                            setValue={setMinutesPerApp}
                            min={5}
                            max={120}
                            step={5}
                            suffix="min"
                        />
                        <InputGroup
                            label="Cold Callback Rate"
                            value={coldRate}
                            setValue={setColdRate}
                            min={0.5}
                            max={20}
                            step={0.5}
                            suffix="%"
                            color="bg-muted-foreground"
                        />
                        <InputGroup
                            label="Referral Callback Rate"
                            value={referralRate}
                            setValue={setReferralRate}
                            min={10}
                            max={90}
                            step={5}
                            suffix="%"
                            color="bg-brand"
                        />
                    </div>

                    {/* Visualization */}
                    <div className="space-y-6 pt-4 border-t border-border/40">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                <span>Applications Needed for 1 Interview</span>
                            </div>

                            {/* Cold Bar */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground">Cold Apply ({coldRate}%)</span>
                                    <span className="font-mono text-foreground">{stats.coldAppsNeeded} apps</span>
                                </div>
                                <div className="h-3 w-full bg-muted/20 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-muted-foreground/40"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${stats.coldBarPercent}%` }}
                                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                                    />
                                </div>
                            </div>

                            {/* Referral Bar */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-xs">
                                    <span className="text-brand font-medium">Referral ({referralRate}%)</span>
                                    <span className="font-mono text-brand font-medium">{stats.referralAppsNeeded} apps</span>
                                </div>
                                <div className="h-3 w-full bg-muted/20 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-brand"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${stats.referralBarPercent}%` }}
                                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Summary Box */}
                        <div className="bg-brand/5 border border-brand/10 rounded-lg p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <span className="block text-xs uppercase tracking-wide text-brand/80 font-medium">Time Saved</span>
                                <span className="block font-display text-2xl font-medium text-foreground">
                                    {stats.hoursSaved} hours
                                </span>
                            </div>

                            <div className="hidden md:block w-px h-10 bg-brand/10" />

                            <div className="space-y-1">
                                <span className="block text-xs uppercase tracking-wide text-brand/80 font-medium">Value Created</span>
                                <span className="block font-display text-2xl font-medium text-foreground">
                                    {formatCurrency(stats.timeSavingsValue)}
                                </span>
                            </div>

                            <div className="md:text-right text-xs text-muted-foreground max-w-[150px] leading-relaxed">
                                Avoids sending <strong className="text-foreground">{stats.appsSaved}</strong> unnecessary applications.
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <figcaption className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Fig. 2</span>
                <span>Referral efficiency model.</span>
            </figcaption>
        </figure>
    );
}

function InputGroup({
    label,
    value,
    setValue,
    min,
    max,
    step,
    format,
    suffix,
    color = "bg-primary"
}: {
    label: string,
    value: number,
    setValue: (v: number) => void,
    min: number,
    max: number,
    step: number,
    format?: (v: number) => string,
    suffix?: string,
    color?: string
}) {
    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-muted-foreground">{label}</label>
                <span className="font-mono text-sm text-foreground bg-muted/30 px-2 py-0.5 rounded">
                    {format ? format(value) : value}{suffix && <span className="text-muted-foreground ml-0.5">{suffix}</span>}
                </span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-brand"
            />
        </div>
    );
}
