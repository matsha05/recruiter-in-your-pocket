"use client";

import { PieChart, Lock, Unlock } from "lucide-react";

export function SalaryHistoryTrap() {
    return (
        <div className="w-full max-w-2xl mx-auto my-12 font-sans">
            <div className="grid md:grid-cols-2 gap-8">

                {/* Left: The Data */}
                <div className="bg-card border border-border rounded-xl p-8 flex flex-col items-center text-center shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Unlock className="w-24 h-24" />
                    </div>

                    <div className="relative w-40 h-40 mb-6">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                            {/* Background Circle */}
                            <path className="text-muted/20" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                            {/* Fill Circle */}
                            <path className="text-rose-500" strokeDasharray="47, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <span className="text-4xl font-serif text-foreground">47%</span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Disclose</span>
                        </div>
                    </div>
                    <p className="text-sm font-medium text-foreground">Social Pressure Effect</p>
                    <p className="text-xs text-muted-foreground mt-2">
                        Candidates disclose because they believe others do, even when they don't have to.
                    </p>
                </div>

                {/* Right: The Solution */}
                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-8 flex flex-col items-center text-center justify-center relative shadow-sm">
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                        <Lock className="w-8 h-8" />
                    </div>
                    <h4 className="text-lg font-serif font-medium text-emerald-700 dark:text-emerald-400 mb-2">The Silence Strategy</h4>
                    <p className="text-sm text-foreground/80 leading-relaxed mb-4">
                        Recruiters interpret silence as "senior", not "evasive", if you pivot to market data.
                    </p>
                    <div className="bg-background/80 px-4 py-2 rounded border border-emerald-500/20 text-xs font-mono text-emerald-800 dark:text-emerald-300">
                        "I focus on market value, not history."
                    </div>
                </div>

            </div>
        </div>
    );
}
