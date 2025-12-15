"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";

export function AnchorZone() {
    return (
        <div className="w-full max-w-3xl mx-auto my-12 font-sans py-8 px-4">
            <div className="relative h-24 flex items-center">

                {/* Track */}
                <div className="absolute left-0 right-0 h-3 bg-muted/30 rounded-full overflow-hidden">
                    <div className="h-full w-[60%] bg-gradient-to-r from-emerald-500/20 to-emerald-500/40 absolute left-0" />
                    <div className="h-full w-[25%] bg-amber-500/20 absolute left-[60%]" />
                    <div className="h-full w-[15%] bg-destructive/20 absolute right-0" />
                </div>

                {/* Point 1: First Offer */}
                <div className="absolute left-[15%] flex flex-col items-center group">
                    <div className="w-4 h-4 bg-background border-4 border-muted-foreground rounded-full shadow-sm z-10 mb-4" />
                    <div className="absolute top-8 w-max text-center opacity-70 group-hover:opacity-100 transition-opacity">
                        <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">First Offer</span>
                        <span className="font-mono text-sm text-foreground">$130k</span>
                    </div>
                </div>

                {/* Point 2: Healthy Anchor */}
                <div className="absolute left-[50%] flex flex-col items-center group">
                    <div className="w-5 h-5 bg-background border-4 border-emerald-500 rounded-full shadow-lg z-10 mb-4 scale-110" />
                    <div className="absolute top-8 w-max text-center">
                        <span className="block text-xs font-bold uppercase tracking-wider text-emerald-600">Package Ask</span>
                        <span className="font-mono text-sm text-foreground">$145k</span>
                    </div>
                </div>

                {/* Point 3: Danger Zone */}
                <div className="absolute left-[85%] flex flex-col items-center group">
                    <div className="w-6 h-6 bg-background border-4 border-destructive rounded-full shadow-sm z-10 mb-4 flex items-center justify-center text-[10px] text-destructive font-bold">!</div>
                    <div className="absolute top-8 w-max text-center">
                        <span className="block text-xs font-bold uppercase tracking-wider text-destructive">Impasse Risk</span>
                        <span className="font-mono text-sm text-foreground">$180k+</span>
                    </div>
                </div>

                {/* Zone Labels */}
                <div className="absolute -top-6 left-[30%] text-xs font-medium text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Zone of Agreement
                </div>
                <div className="absolute -top-6 right-[5%] text-xs font-medium text-destructive flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Walk-away Zone
                </div>

            </div>

            <div className="mt-8 p-4 bg-muted/10 rounded-lg border border-border/50 text-center">
                <p className="text-sm text-muted-foreground">
                    Research shows you want to anchor <strong>just below</strong> the impasse point. <br />
                    Correct for "First Offer" anchoring by responding with a <strong>Package Ask</strong>.
                </p>
            </div>
        </div>
    );
}
