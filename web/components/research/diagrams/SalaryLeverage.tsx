"use client";

import { Lock, Unlock, TrendingUp, TrendingDown } from "lucide-react";

export function SalaryLeverage() {
    return (
        <div className="w-full max-w-lg mx-auto my-12 font-sans">
            <div className="grid grid-cols-2 gap-4">

                {/* Before Ban (The Trap) */}
                <div className="relative p-6 rounded-md border border-border/10 bg-secondary/20 opacity-60 grayscale hover:grayscale-0 transition-all duration-normal">
                    <div className="absolute top-3 right-3 opacity-50">
                        <Unlock className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <h4 className="font-medium text-muted-foreground mb-4 text-sm uppercase tracking-wide">Before Ban</h4>
                    <div className="space-y-4">
                        <div className="bg-secondary/50 rounded-sm p-3 border border-border/10 text-xs font-mono text-muted-foreground">
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
                <div className="relative p-6 rounded-md border border-brand/30 bg-brand/5">
                    <div className="absolute top-3 right-3">
                        <Lock className="w-4 h-4 text-brand" />
                    </div>
                    <h4 className="font-medium text-brand mb-4 text-sm uppercase tracking-wide flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                        After Ban
                    </h4>
                    <div className="space-y-4">
                        <div className="bg-secondary/50 rounded-sm p-3 border border-brand/20 text-xs font-mono text-brand">
                            <span className="block text-[10px] text-brand/60 mb-1 font-sans">Employer asks:</span>
                            "What are your expectations?"
                        </div>
                        <div className="flex items-center gap-2 text-brand text-sm font-medium">
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
