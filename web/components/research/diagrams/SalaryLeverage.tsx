"use client";

import { Lock, Unlock, TrendingUp, TrendingDown } from "lucide-react";

export function SalaryLeverage() {
    return (
        <div className="w-full max-w-lg mx-auto my-12 font-sans">
            <div className="grid grid-cols-2 gap-4">

                {/* Before Ban (The Trap) */}
                <div className="relative p-6 rounded-xl border border-white/5 bg-white/5 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                    <div className="absolute top-3 right-3 opacity-50">
                        <Unlock className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <h4 className="font-medium text-muted-foreground mb-4 text-sm uppercase tracking-wide">Before Ban</h4>
                    <div className="space-y-4">
                        <div className="bg-neutral-900 rounded p-3 border border-white/10 text-xs font-mono text-muted-foreground">
                            <span className="block text-[10px] text-zinc-500 mb-1 font-sans">Employer asks:</span>
                            "What is your current salary?"
                        </div>
                        <div className="flex items-center gap-2 text-zinc-500 text-sm font-medium">
                            <TrendingDown className="w-4 h-4" />
                            <span>Anchored to Past</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Offers generated based on <strong>history</strong>, perpetuating pay gaps.
                        </p>
                    </div>
                </div>

                {/* After Ban (The Leverage) */}
                <div className="relative p-6 rounded-xl border border-gold/30 bg-gradient-to-br from-gold/10 to-transparent shadow-[0_0_30px_-15px_rgba(251,191,36,0.2)]">
                    <div className="absolute top-3 right-3">
                        <Lock className="w-4 h-4 text-gold" />
                    </div>
                    <h4 className="font-medium text-gold mb-4 text-sm uppercase tracking-wide flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                        After Ban
                    </h4>
                    <div className="space-y-4">
                        <div className="bg-neutral-900 rounded p-3 border border-gold/20 text-xs font-mono text-gold/90 shadow-sm">
                            <span className="block text-[10px] text-gold/50 mb-1 font-sans">Employer asks:</span>
                            "What are your expectations?"
                        </div>
                        <div className="flex items-center gap-2 text-gold text-sm font-medium">
                            <TrendingUp className="w-4 h-4" />
                            <span>Anchored to Market</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Offers generated based on <strong>role value</strong> and market data.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
