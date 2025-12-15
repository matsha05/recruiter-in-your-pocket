"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";

export function FormContentSplit() {
    return (
        <div className="w-full max-w-2xl mx-auto my-12 font-sans">
            <div className="grid md:grid-cols-2 gap-8">

                {/* Form (Spelling/Grammar) */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-border pb-2">
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                        <h4 className="font-medium text-destructive text-sm uppercase tracking-wider">The "Form" Penalty</h4>
                    </div>
                    <div className="bg-destructive/5 rounded-lg border border-destructive/10 p-6 space-y-4">
                        <p className="text-sm text-foreground/80 leading-relaxed">
                            <span className="text-destructive font-semibold">1-2 errors</span> can equal the penalty of missing a year of experience.
                        </p>
                        <div className="space-y-2">
                            <div className="flex gap-2 text-xs bg-white dark:bg-black/20 p-2 rounded">
                                <span className="text-destructive font-bold">✗</span>
                                <span className="line-through text-muted-foreground">manger</span>
                                <span className="text-foreground">Manager</span>
                            </div>
                            <div className="flex gap-2 text-xs bg-white dark:bg-black/20 p-2 rounded">
                                <span className="text-destructive font-bold">✗</span>
                                <span className="line-through text-muted-foreground">attention too detail</span>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground italic">
                            Result: Credibility drops immediately.
                        </p>
                    </div>
                </div>

                {/* Content (Skills/Experience) */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-border pb-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <h4 className="font-medium text-emerald-600 text-sm uppercase tracking-wider">The "Content" Reality</h4>
                    </div>
                    <div className="bg-emerald-500/5 rounded-lg border border-emerald-500/10 p-6 space-y-4">
                        <p className="text-sm text-foreground/80 leading-relaxed">
                            Excellent content <strong>cannot</strong> save poor form in the initial skim.
                        </p>
                        <div className="space-y-3 pt-2">
                            <div className="h-2 w-3/4 bg-emerald-500/20 rounded-full" />
                            <div className="h-2 w-full bg-emerald-500/20 rounded-full" />
                            <div className="h-2 w-5/6 bg-emerald-500/20 rounded-full" />
                        </div>
                        <p className="text-xs text-muted-foreground italic">
                            Result: Good candidates get rejected before their skills are read.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
