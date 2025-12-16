"use client";

import { TrendingUp, ArrowUp } from "lucide-react";

export function LevelLadder() {
    const levels = [
        { name: "L3", title: "Junior", scope: "Tasks", comp: "1.0x", h: 16 },
        { name: "L4", title: "Mid-Level", scope: "Features", comp: "1.3x", h: 24 },
        { name: "L5", title: "Senior", scope: "Strategy", comp: "1.8x", h: 32 },
        { name: "L6", title: "Staff", scope: "Direction", comp: "2.5x", h: 40 },
    ];

    return (
        <div className="w-full max-w-2xl mx-auto my-12 font-sans">
            <div className="flex items-end justify-center gap-4 h-64 border-b border-border pb-4 relative">

                {levels.map((lvl, i) => (
                    <div key={i} className="flex flex-col items-center group relative w-1/4">
                        {/* Bar */}
                        <div
                            className="w-full bg-neutral-900 border border-white/10 rounded-t-lg shadow-sm group-hover:bg-gold/5 group-hover:border-gold/30 transition-all duration-300 relative overflow-hidden"
                            style={{ height: `${lvl.h * 4}px` }}
                        >
                            <div className="absolute bottom-0 w-full h-1 bg-white/10 group-hover:bg-gold/50 transition-colors" />
                        </div>

                        {/* Label */}
                        <div className="mt-4 text-center">
                            <span className="block text-sm font-bold text-foreground font-serif">{lvl.name}</span>
                            <span className="block text-xs text-muted-foreground uppercase tracking-wider scale-90">{lvl.title}</span>
                        </div>

                        {/* Hover Detail */}
                        <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 bg-neutral-900 border border-gold/20 text-foreground text-[10px] px-3 py-1.5 rounded shadow-xl whitespace-nowrap z-10 font-mono">
                            <span className="text-gold">Scope:</span> {lvl.scope} • <span className="text-gold">Comp:</span> {lvl.comp}
                        </div>
                    </div>
                ))}

                {/* The "Hidden Lever" Arrow */}
                <div className="absolute top-10 right-[15%] flex flex-col items-center text-gold animate-pulse">
                    <span className="text-[10px] font-bold uppercase tracking-widest mb-2 font-mono">The Big Jump</span>
                    <TrendingUp className="w-8 h-8 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                </div>
            </div>

            <div className="text-center mt-8 max-w-md mx-auto">
                <p className="text-sm text-muted-foreground font-medium font-serif">
                    Negotiating base salary gets you +5%. <br />
                    Negotiating <span className="text-gold border-b border-gold/30 pb-0.5">Level</span> gets you +30% to +50%.
                </p>
            </div>
        </div>
    );
}
