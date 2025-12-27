"use client";

import { Check, X, User, Cpu } from "lucide-react";

export function TrustChoiceGrid() {
    return (
        <div className="w-full max-w-xl mx-auto my-12 font-sans">
            <h3 className="text-center text-sm font-medium uppercase tracking-wider text-muted-foreground mb-8">
                Recruiter Trust Matrix
            </h3>

            <div className="relative">
                {/* X-Axis Label (Top) */}
                <div className="flex justify-center mb-4">
                    <div className="grid grid-cols-2 gap-4 w-full max-w-md pl-20">
                        <div className="text-center font-medium flex items-center justify-center gap-2 text-foreground/80">
                            <User className="w-4 h-4 text-brand" /> Human
                        </div>
                        <div className="text-center font-medium flex items-center justify-center gap-2 text-muted-foreground">
                            <Cpu className="w-4 h-4" /> Algorithm
                        </div>
                    </div>
                </div>

                {/* Grid with Y-Axis Labels */}
                <div className="flex">
                    {/* Y-Axis Labels */}
                    <div className="flex flex-col justify-around pr-4 w-20 shrink-0">
                        <div className="text-xs font-semibold uppercase text-muted-foreground text-right py-8">
                            Consistent
                        </div>
                        <div className="text-xs font-semibold uppercase text-muted-foreground text-right py-8">
                            Inconsistent
                        </div>
                    </div>

                    {/* 2x2 Matrix */}
                    <div className="grid grid-cols-2 gap-3 flex-1">
                        {/* Row 1: Consistent */}
                        {/* Human + Consistent = High Trust */}
                        <div className="bg-brand/5 border border-brand/20 rounded-md p-5 text-center flex flex-col items-center justify-center relative h-28">
                            <span className="text-xl font-display text-brand mb-1">High Trust</span>
                            <span className="text-[10px] text-brand/70 uppercase tracking-widest">Most Preferred</span>
                            <Check className="absolute top-2 right-2 w-4 h-4 text-brand" />
                        </div>

                        {/* Algorithm + Consistent = Accepted */}
                        <div className="bg-secondary/20 border border-border/10 rounded-md p-5 text-center flex flex-col items-center justify-center opacity-60 h-28">
                            <span className="font-medium text-muted-foreground">Accepted</span>
                            <span className="text-xs text-muted-foreground mt-1">Utility function</span>
                        </div>

                        {/* Row 2: Inconsistent */}
                        {/* Human + Inconsistent = Forgiven */}
                        <div className="bg-secondary/20 border border-border/10 rounded-md p-5 text-center flex flex-col items-center justify-center h-28">
                            <span className="font-medium text-foreground/80">Forgiven</span>
                            <span className="text-xs text-muted-foreground mt-1 font-display italic">&quot;Humans make mistakes&quot;</span>
                        </div>

                        {/* Algorithm + Inconsistent = Rejected */}
                        <div className="bg-destructive/5 border border-destructive/10 rounded-md p-5 text-center flex flex-col items-center justify-center relative h-28">
                            <span className="font-medium text-destructive">Rejected</span>
                            <span className="text-xs text-destructive/70 mt-1 uppercase tracking-wide">&quot;Broken system&quot;</span>
                            <X className="absolute top-2 right-2 w-4 h-4 text-destructive/70" />
                        </div>
                    </div>
                </div>
            </div>

            <p className="text-center text-xs text-muted-foreground mt-6 max-w-sm mx-auto">
                Recruiters forgive human inconsistency but punish algorithmic errors, proving they view tools as assistants, not replacements.
            </p>
        </div>
    );
}
