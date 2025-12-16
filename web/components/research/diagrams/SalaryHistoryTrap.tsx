"use client";

import { PieChart, Lock, Unlock } from "lucide-react";

export function SalaryHistoryTrap() {
    return (
        <div className="w-full max-w-2xl mx-auto my-12 font-sans">
            <div className="grid md:grid-cols-2 gap-8">

                {/* Left: The Data (The Trap) - Destructive */}
                <div className="bg-destructive/5 border border-destructive/10 rounded-md p-8 flex flex-col items-center text-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Unlock className="w-24 h-24 text-destructive" />
                    </div>

                    <div className="relative w-40 h-40 mb-6">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                            {/* Background Circle */}
                            <path className="text-destructive/5" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2" />
                            {/* Fill Circle */}
                            <path className="text-destructive" strokeDasharray="47, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <span className="text-4xl font-display text-foreground font-medium">47%</span>
                            <span className="text-[10px] text-destructive uppercase tracking-widest mt-1">Disclose</span>
                        </div>
                    </div>
                    <p className="text-sm font-medium text-destructive border-b border-destructive/20 pb-1">Social Pressure Effect</p>
                    <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                        Candidates disclose because they believe others do, even when they don't have to.
                    </p>
                </div>

                {/* Right: The Solution (The Strategy) - Success */}
                <div className="bg-success/5 border border-success/10 rounded-md p-8 flex flex-col items-center text-center justify-center relative">
                    <div className="w-16 h-16 bg-success/10 text-success rounded-md flex items-center justify-center mb-6 border border-success/20">
                        <Lock className="w-8 h-8" />
                    </div>
                    <h4 className="text-lg font-display font-medium text-success mb-3">The Silence Strategy</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-6 font-display">
                        Recruiters interpret silence as "senior", not "evasive", if you pivot to market data.
                    </p>
                    <div className="bg-secondary/50 px-6 py-3 rounded-sm border border-success/20 text-xs font-mono text-success">
                        "I focus on market value, not history."
                    </div>
                </div>

            </div>
        </div>
    );
}
