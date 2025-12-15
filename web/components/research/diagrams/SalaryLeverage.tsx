"use client";

import { Lock, Unlock, TrendingUp, TrendingDown } from "lucide-react";

export function SalaryLeverage() {
    return (
        <div className="w-full max-w-lg mx-auto my-12 font-sans">
            <div className="grid grid-cols-2 gap-4">

                {/* Before Ban */}
                <div className="relative p-6 rounded-xl border border-border bg-muted/20 opacity-70">
                    <div className="absolute top-3 right-3">
                        <Unlock className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <h4 className="font-medium text-muted-foreground mb-4 text-sm uppercase tracking-wide">Before Ban</h4>
                    <div className="space-y-4">
                        <div className="bg-background rounded p-3 border border-border/50 text-xs">
                            <span className="block text-muted-foreground mb-1">Employer asks:</span>
                            "What is your current salary?"
                        </div>
                        <div className="flex items-center gap-2 text-destructive text-sm font-medium">
                            <TrendingDown className="w-4 h-4" />
                            <span>Anchored Low</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Offers generated based on <strong>history</strong>, perpetuating pay gaps.
                        </p>
                    </div>
                </div>

                {/* After Ban */}
                <div className="relative p-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                    <div className="absolute top-3 right-3">
                        <Lock className="w-4 h-4 text-emerald-600" />
                    </div>
                    <h4 className="font-medium text-emerald-600 mb-4 text-sm uppercase tracking-wide">After Ban</h4>
                    <div className="space-y-4">
                        <div className="bg-background rounded p-3 border border-emerald-500/20 text-xs shadow-sm">
                            <span className="block text-muted-foreground mb-1">Employer asks:</span>
                            "What are your expectations?"
                        </div>
                        <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                            <TrendingUp className="w-4 h-4" />
                            <span>Market Rate</span>
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
