"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";

export function FormContentSplit() {
    return (
        <div className="w-full max-w-2xl mx-auto my-12 font-sans">
            <div className="grid md:grid-cols-2 gap-8">

                {/* Form (Spelling/Grammar) - The Trap */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-border pb-2 opacity-70">
                        <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                        <h4 className="font-medium text-muted-foreground text-sm uppercase tracking-wider">The "Form" Penalty</h4>
                    </div>
                    <div className="bg-secondary/30 rounded-md border border-border/10 p-6 space-y-4">
                        <p className="text-sm text-foreground/80 leading-relaxed font-display">
                            <span className="text-muted-foreground font-semibold">1-2 errors</span> can equal the penalty of missing a year of experience.
                        </p>
                        <div className="space-y-2">
                            <div className="flex gap-2 text-xs bg-secondary/50 p-2 rounded-sm border border-border/10">
                                <span className="text-red-400 font-bold">✗</span>
                                <span className="line-through text-muted-foreground">manger</span>
                                <span className="text-foreground">Manager</span>
                            </div>
                            <div className="flex gap-2 text-xs bg-secondary/50 p-2 rounded-sm border border-border/10">
                                <span className="text-red-400 font-bold">✗</span>
                                <span className="line-through text-muted-foreground">attention too detail</span>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground italic">
                            Result: Credibility drops immediately.
                        </p>
                    </div>
                </div>

                {/* Content (Skills/Experience) - The Leverage */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-brand/30 pb-2">
                        <CheckCircle2 className="w-4 h-4 text-brand" />
                        <h4 className="font-medium text-brand text-sm uppercase tracking-wider">The "Content" Reality</h4>
                    </div>
                    <div className="bg-brand/5 rounded-md border border-brand/20 p-6 space-y-4">
                        <p className="text-sm text-foreground/90 leading-relaxed font-display">
                            Excellent content <strong>cannot</strong> save poor form in the initial skim.
                        </p>
                        <div className="space-y-3 pt-2">
                            <div className="h-1.5 w-3/4 bg-brand/30 rounded-full" />
                            <div className="h-1.5 w-full bg-brand/40 rounded-full" />
                            <div className="h-1.5 w-5/6 bg-brand/30 rounded-full" />
                        </div>
                        <p className="text-xs text-brand/70 italic mt-auto">
                            Result: Good candidates get rejected before their skills are read.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
