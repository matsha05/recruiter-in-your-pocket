"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";

export function AnchorZone() {
    return (
        <div className="w-full max-w-3xl mx-auto my-12 font-sans py-8 px-4">
            <div className="relative h-24 flex items-center">

                {/* Track - Gradient of risk/reward */}
                <div className="absolute left-0 right-0 h-1.5 bg-neutral-900 rounded-full overflow-hidden border border-white/5">
                    {/* Safe Zone (Success) */}
                    <div className="h-full w-[60%] bg-gradient-to-r from-success/20 via-success/40 to-success/20 absolute left-0" />
                    {/* Tension Zone (Premium/Gold) */}
                    <div className="h-full w-[25%] bg-gradient-to-r from-premium/20 to-destructive/20 absolute left-[60%]" />
                    {/* Danger Zone (Destructive) */}
                    <div className="h-full w-[15%] bg-destructive/30 absolute right-0" />
                </div>

                {/* Point 1: First Offer (The Anchor) - Indigo/Tech */}
                <div className="absolute left-[15%] flex flex-col items-center group">
                    <div className="w-3 h-3 bg-background border-2 border-slate rounded-full z-10 mb-5 transition-transform group-hover:scale-125" />
                    <div className="absolute top-8 w-max text-center opacity-60 group-hover:opacity-100 transition-opacity">
                        <span className="block text-[10px] font-bold uppercase tracking-widest text-slate mb-1">First Offer</span>
                        <span className="font-mono text-xs text-muted-foreground">$130k</span>
                    </div>
                </div>

                {/* Point 2: Healthy Anchor (The Strategy) - Gold */}
                <div className="absolute left-[50%] flex flex-col items-center group">
                    <div className="w-5 h-5 bg-background border-[3px] border-brand rounded-full z-20 mb-5 scale-110 group-hover:scale-125 transition-transform" />
                    <div className="absolute top-8 w-max text-center">
                        <span className="block text-[10px] font-bold uppercase tracking-widest text-brand mb-1">Package Ask</span>
                        <span className="font-mono text-sm text-foreground bg-brand/10 px-2 py-0.5 rounded-sm border border-brand/20">$145k</span>
                    </div>
                </div>

                {/* Point 3: Impasse (The Risk) - Destructive */}
                <div className="absolute left-[85%] flex flex-col items-center group">
                    <div className="w-3 h-3 bg-neutral-900 border-2 border-destructive rounded-full shadow-[0_0_10px_hsl(var(--destructive)/0.4)] z-10 mb-5 flex items-center justify-center text-[8px] text-destructive font-bold transition-transform group-hover:scale-125">!</div>
                    <div className="absolute top-8 w-max text-center opacity-60 group-hover:opacity-100 transition-opacity">
                        <span className="block text-[10px] font-bold uppercase tracking-widest text-destructive mb-1">Impasse Risk</span>
                        <span className="font-mono text-xs text-destructive/80 border-b border-dashed border-destructive/30">$180k+</span>
                    </div>
                </div>

                {/* Zone Labels - Floating and subtle */}
                <div className="absolute -top-10 left-[25%]">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/5 border border-success/10 text-[10px] uppercase tracking-widest font-bold text-success/90 shadow-sm">
                        <CheckCircle2 className="w-3 h-3" /> Zone of Agreement
                    </div>
                </div>
                <div className="absolute -top-10 right-[2%]">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-destructive/5 border border-destructive/10 text-[10px] uppercase tracking-widest font-bold text-destructive/80 shadow-sm">
                        <AlertTriangle className="w-3 h-3" /> Walk-away
                    </div>
                </div>

            </div>

            <div className="mt-8 p-4 bg-secondary/20 rounded-md border border-border/10 text-center">
                <p className="text-sm text-muted-foreground font-display">
                    Research shows you want to anchor <strong>just below</strong> the impasse point. <br />
                    Correct for "First Offer" anchoring by responding with a <span className="text-brand font-medium">Package Ask</span>.
                </p>
            </div>
        </div>
    );
}
