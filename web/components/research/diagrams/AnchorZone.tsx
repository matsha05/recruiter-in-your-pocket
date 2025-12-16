"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";

export function AnchorZone() {
    return (
        <div className="w-full max-w-3xl mx-auto my-12 font-sans py-8 px-4">
            <div className="relative h-24 flex items-center">

                {/* Track - Gradient of risk/reward */}
                <div className="absolute left-0 right-0 h-1.5 bg-neutral-900 rounded-full overflow-hidden border border-white/5">
                    {/* Safe Zone (Emerald) */}
                    <div className="h-full w-[60%] bg-gradient-to-r from-emerald-500/20 via-emerald-500/40 to-emerald-500/20 absolute left-0" />
                    {/* Tension Zone (Amber/Gold) */}
                    <div className="h-full w-[25%] bg-gradient-to-r from-amber-500/20 to-rose-500/20 absolute left-[60%]" />
                    {/* Danger Zone (Rose) */}
                    <div className="h-full w-[15%] bg-rose-500/30 absolute right-0" />
                </div>

                {/* Point 1: First Offer (The Anchor) - Indigo/Tech */}
                <div className="absolute left-[15%] flex flex-col items-center group">
                    <div className="w-3 h-3 bg-neutral-900 border-2 border-indigo-400 rounded-full shadow-[0_0_10px_rgba(129,140,248,0.3)] z-10 mb-5 transition-transform group-hover:scale-125" />
                    <div className="absolute top-8 w-max text-center opacity-60 group-hover:opacity-100 transition-opacity">
                        <span className="block text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-1">First Offer</span>
                        <span className="font-mono text-xs text-indigo-300">$130k</span>
                    </div>
                </div>

                {/* Point 2: Healthy Anchor (The Strategy) - Gold */}
                <div className="absolute left-[50%] flex flex-col items-center group">
                    <div className="w-5 h-5 bg-neutral-900 border-[3px] border-gold rounded-full shadow-[0_0_20px_rgba(251,191,36,0.5)] z-20 mb-5 scale-110 group-hover:scale-125 transition-transform" />
                    <div className="absolute top-8 w-max text-center">
                        <span className="block text-[10px] font-bold uppercase tracking-widest text-gold mb-1">Package Ask</span>
                        <span className="font-mono text-sm text-foreground bg-gold/10 px-2 py-0.5 rounded border border-gold/20 shadow-[0_0_15px_-5px_rgba(251,191,36,0.3)]">$145k</span>
                    </div>
                </div>

                {/* Point 3: Impasse (The Risk) - Rose */}
                <div className="absolute left-[85%] flex flex-col items-center group">
                    <div className="w-3 h-3 bg-neutral-900 border-2 border-rose-500 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.4)] z-10 mb-5 flex items-center justify-center text-[8px] text-rose-500 font-bold transition-transform group-hover:scale-125">!</div>
                    <div className="absolute top-8 w-max text-center opacity-60 group-hover:opacity-100 transition-opacity">
                        <span className="block text-[10px] font-bold uppercase tracking-widest text-rose-500 mb-1">Impasse Risk</span>
                        <span className="font-mono text-xs text-rose-400 border-b border-dashed border-rose-500/30">$180k+</span>
                    </div>
                </div>

                {/* Zone Labels - Floating and subtle */}
                <div className="absolute -top-10 left-[25%]">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/10 text-[10px] uppercase tracking-widest font-bold text-emerald-500/90 shadow-sm">
                        <CheckCircle2 className="w-3 h-3" /> Zone of Agreement
                    </div>
                </div>
                <div className="absolute -top-10 right-[2%]">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/5 border border-rose-500/10 text-[10px] uppercase tracking-widest font-bold text-rose-500/80 shadow-sm">
                        <AlertTriangle className="w-3 h-3" /> Walk-away
                    </div>
                </div>

            </div>

            <div className="mt-8 p-4 bg-neutral-900 rounded-lg border border-white/10 text-center shadow-inner">
                <p className="text-sm text-muted-foreground font-serif">
                    Research shows you want to anchor <strong>just below</strong> the impasse point. <br />
                    Correct for "First Offer" anchoring by responding with a <span className="text-gold font-medium">Package Ask</span>.
                </p>
            </div>
        </div>
    );
}
