"use client";

import { PieChart, Lock, Unlock } from "lucide-react";

export function SalaryHistoryTrap() {
    return (
        <div className="w-full max-w-2xl mx-auto my-12 font-sans">
            <div className="grid md:grid-cols-2 gap-8">

                {/* Left: The Data (The Trap) - Luminous Rose */}
                <div className="bg-rose-500/5 border border-rose-500/10 rounded-md p-8 flex flex-col items-center text-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Unlock className="w-24 h-24 text-rose-500" />
                    </div>

                    <div className="relative w-40 h-40 mb-6">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                            {/* Background Circle */}
                            <path className="text-rose-500/5" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2" />
                            {/* Fill Circle */}
                            <path className="text-rose-500" strokeDasharray="47, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <span className="text-4xl font-display text-foreground font-medium">47%</span>
                            <span className="text-[10px] text-rose-500 uppercase tracking-widest mt-1">Disclose</span>
                        </div>
                    </div>
                    <p className="text-sm font-medium text-rose-500 border-b border-rose-500/20 pb-1">Social Pressure Effect</p>
                    <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                        Candidates disclose because they believe others do, even when they don't have to.
                    </p>
                </div>

                {/* Right: The Solution (The Strategy) - Luminous Emerald */}
                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-md p-8 flex flex-col items-center text-center justify-center relative">
                    <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-md flex items-center justify-center mb-6 border border-emerald-500/20">
                        <Lock className="w-8 h-8" />
                    </div>
                    <h4 className="text-lg font-display font-medium text-emerald-500 mb-3">The Silence Strategy</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-6 font-display">
                        Recruiters interpret silence as "senior", not "evasive", if you pivot to market data.
                    </p>
                    <div className="bg-secondary/50 px-6 py-3 rounded-sm border border-emerald-500/20 text-xs font-mono text-emerald-500">
                        "I focus on market value, not history."
                    </div>
                </div>

            </div>
        </div>
    );
}
