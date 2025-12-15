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
                    <div className="text-center font-medium flex items-center justify-center gap-2 mb-2">
                        <User className="w-4 h-4 text-primary" /> Human
                    </div>
                    {/* Human Consistent */}
                    <div className="bg-primary/10 border-2 border-primary/20 rounded-xl p-6 text-center h-32 flex flex-col items-center justify-center relative">
                        <span className="text-2xl font-serif text-primary mb-1">High Trust</span>
                        <span className="text-xs text-primary/70 uppercase tracking-wide">Most Preferred</span>
                        <Check className="absolute top-2 right-2 w-4 h-4 text-primary" />
                    </div>
                    {/* Human Inconsistent */}
                    <div className="bg-secondary/50 border border-border rounded-xl p-6 text-center h-32 flex flex-col items-center justify-center">
                        <span className="font-medium text-foreground">Forgiven</span>
                        <span className="text-xs text-muted-foreground mt-1">"Humans make mistakes"</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="text-center font-medium flex items-center justify-center gap-2 mb-2">
                        <Cpu className="w-4 h-4 text-muted-foreground" /> Algorithm
                    </div>
                    {/* Algo Consistent */}
                    <div className="bg-secondary/30 border border-border dashed rounded-xl p-6 text-center h-32 flex flex-col items-center justify-center opacity-70">
                        <span className="font-medium text-muted-foreground">Accepted</span>
                        <span className="text-xs text-muted-foreground mt-1">Utility function</span>
                    </div>
                    {/* Algo Inconsistent */}
                    <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-center h-32 flex flex-col items-center justify-center">
                        <span className="font-medium text-destructive">Rejected</span>
                        <span className="text-xs text-destructive/70 mt-1">"Broken system"</span>
                        <X className="absolute top-2 right-2 w-4 h-4 text-destructive" />
                    </div>
                </div>
            </div>

            <p className="text-center text-xs text-muted-foreground mt-6 max-w-sm mx-auto">
                Recruiters forgive human inconsistency but punish algorithmic errors, proving they view tools as assistants, not replacements.
            </p>
        </div>
    );
}
