"use client";

import { Check, X, User, Cpu } from "lucide-react";

export function TrustChoiceGrid() {
    return (
        <div className="w-full max-w-lg mx-auto my-12 font-sans">
            <h3 className="text-center text-sm font-medium uppercase tracking-wider text-muted-foreground mb-6">
                Recruiter Trust Matrix
            </h3>

            <div className="grid grid-cols-[auto_1fr_1fr] gap-4">
                {/* Labels */}
                <div className="flex flex-col justify-center gap-20 pt-12 text-xs font-semibold uppercase text-muted-foreground [writing-mode:vertical-lr] rotate-180">
                    <span>Inconsistent</span>
                    <span>Consistent</span>
                </div>

                {/* Cols */}
                <div className="space-y-4">
                    <div className="text-center font-medium flex items-center justify-center gap-2 mb-2 text-foreground/80">
                        <User className="w-4 h-4 text-gold" /> Human
                    </div>
                    {/* Human Consistent - Gold Standard */}
                    <div className="bg-gradient-to-br from-gold/10 to-transparent border border-gold/30 rounded-xl p-6 text-center h-32 flex flex-col items-center justify-center relative shadow-[0_0_20px_-10px_rgba(251,191,36,0.2)]">
                        <span className="text-2xl font-serif text-gold mb-1">High Trust</span>
                        <span className="text-[10px] text-gold/70 uppercase tracking-widest">Most Preferred</span>
                        <Check className="absolute top-2 right-2 w-4 h-4 text-gold" />
                    </div>
                    {/* Human Inconsistent - Forgiven (Slate) */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center h-32 flex flex-col items-center justify-center opacity-80 hover:opacity-100 transition-opacity">
                        <span className="font-medium text-slate-200">Forgiven</span>
                        <span className="text-xs text-slate-400 mt-1 font-serif italic">"Humans make mistakes"</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="text-center font-medium flex items-center justify-center gap-2 mb-2 text-muted-foreground">
                        <Cpu className="w-4 h-4" /> Algorithm
                    </div>
                    {/* Algo Consistent - Muted */}
                    <div className="bg-neutral-900 border border-white/5 dashed rounded-xl p-6 text-center h-32 flex flex-col items-center justify-center opacity-50 grayscale">
                        <span className="font-medium text-muted-foreground">Accepted</span>
                        <span className="text-xs text-muted-foreground mt-1">Utility function</span>
                    </div>
                    {/* Algo Inconsistent - Rejected (Luminous Rose) */}
                    <div className="bg-gradient-to-br from-rose-500/10 to-transparent border border-rose-500/20 rounded-xl p-6 text-center h-32 flex flex-col items-center justify-center shadow-[0_0_15px_-5px_rgba(244,63,94,0.1)]">
                        <span className="font-medium text-rose-400">Rejected</span>
                        <span className="text-xs text-rose-400/70 mt-1 uppercase tracking-wide">"Broken system"</span>
                        <X className="absolute top-2 right-2 w-4 h-4 text-rose-400" />
                    </div>
                </div>
            </div>

            <p className="text-center text-xs text-muted-foreground mt-6 max-w-sm mx-auto">
                Recruiters forgive human inconsistency but punish algorithmic errors, proving they view tools as assistants, not replacements.
            </p>
        </div>
    );
}
