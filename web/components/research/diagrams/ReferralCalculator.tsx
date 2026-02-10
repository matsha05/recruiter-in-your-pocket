"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { DiagramFigure, DiagramFrame, DiagramHeader } from "@/components/shared/diagrams/DiagramPrimitives";

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

    const paperShadow = "0 0 0 1px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)";

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0
        }).format(value);
    };

    return (
        <DiagramFigure className="max-w-2xl font-sans">
            <DiagramFrame className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-500">
                <DiagramHeader
                    label="Referral ROI Calculator"
                    rightSlot={(
                        <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 bg-white px-2 py-1 rounded border border-slate-200">
                            Interactive
                        </span>
                    )}
                />

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
                            color="bg-slate-400"
                        />
                        <InputGroup
                            label="Referral Callback Rate"
                            value={referralRate}
                            setValue={setReferralRate}
                            min={10}
                            max={90}
                            step={5}
                            suffix="%"
                            color="bg-slate-700"
                        />
                    </div>

                    {/* Visualization */}
                    <div className="space-y-6 pt-4 border-t border-slate-100">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-xs font-medium text-slate-400 uppercase tracking-wider">
                                <span>Applications Needed for 1 Interview</span>
                            </div>

                            {/* Cold Bar */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-500">Cold Apply ({coldRate}%)</span>
                                    <span className="font-mono text-slate-900">{stats.coldAppsNeeded} apps</span>
                                </div>
                                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-slate-300"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${stats.coldBarPercent}%` }}
                                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                                    />
                                </div>
                            </div>

                            {/* Referral Bar */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-700 font-medium">Referral ({referralRate}%)</span>
                                    <span className="font-mono text-slate-700 font-medium">{stats.referralAppsNeeded} apps</span>
                                </div>
                                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-slate-700"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${stats.referralBarPercent}%` }}
                                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Summary Box */}
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <span className="block text-xs uppercase tracking-wide text-slate-500 font-medium">Time Saved</span>
                                <span className="block font-display text-2xl font-medium text-slate-900">
                                    {stats.hoursSaved} hours
                                </span>
                            </div>

                            <div className="hidden md:block w-px h-10 bg-slate-200" />

                            <div className="space-y-1">
                                <span className="block text-xs uppercase tracking-wide text-slate-500 font-medium">Value Created</span>
                                <span className="block font-display text-2xl font-medium text-slate-900">
                                    {formatCurrency(stats.timeSavingsValue)}
                                </span>
                            </div>

                            <div className="md:text-right text-xs text-slate-500 max-w-[150px] leading-relaxed">
                                Avoids sending <strong className="text-slate-900">{stats.appsSaved}</strong> unnecessary applications.
                            </div>
                        </div>
                    </div>
                </div>
            </DiagramFrame>

            <figcaption className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                <span className="font-medium text-slate-900">Fig. 2</span>
                <span>Referral efficiency model.</span>
            </figcaption>
        </DiagramFigure>
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
                <label className="text-sm font-medium text-slate-500">{label}</label>
                <span className="font-mono text-sm text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    {format ? format(value) : value}{suffix && <span className="text-slate-400 ml-0.5">{suffix}</span>}
                </span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-700"
            />
        </div>
    );
}
