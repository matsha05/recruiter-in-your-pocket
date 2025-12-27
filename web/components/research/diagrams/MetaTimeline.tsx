"use client";

import { Layers, ArrowRight } from "lucide-react";

export function MetaTimeline() {
    return (
        <div className="w-full max-w-2xl mx-auto my-12 font-sans">
            <h3 className="text-center font-medium mb-8 flex items-center justify-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                Aggregating 25 Years of Field Experiments
            </h3>

            <div className="relative border-l-2 border-border ml-6 md:ml-12 pl-8 space-y-8 py-4">

                {/* 1990s */}
                <div className="relative">
                    <div className="absolute -left-[41px] bg-background border-2 border-muted-foreground/30 w-5 h-5 rounded-full" />
                    <span className="text-xs font-mono text-muted-foreground mb-1 block">1990 - 2000</span>
                    <h4 className="font-medium text-foreground">Early Audit Studies</h4>
                    <p className="text-sm text-muted-foreground">Individual studies show resume callbacks vary by name/origin.</p>
                </div>

                {/* 2000s */}
                <div className="relative">
                    <div className="absolute -left-[41px] bg-background border-2 border-muted-foreground/30 w-5 h-5 rounded-full" />
                    <span className="text-xs font-mono text-muted-foreground mb-1 block">2004</span>
                    <h4 className="font-medium text-foreground">Bertrand & Mullainathan</h4>
                    <p className="text-sm text-muted-foreground">&quot;Are Emily and Greg More Employable than Lakisha and Jamal?&quot; sets the benchmark.</p>
                </div>

                {/* 2017 Meta - The Gold Standard */}
                <div className="relative">
                    <div className="absolute -left-[43px] bg-background border-4 border-brand w-6 h-6 rounded-full" />
                    <span className="text-xs font-bold text-brand mb-1 block tracking-widest">2017 META-ANALYSIS</span>
                    <div className="bg-brand/5 border border-brand/20 rounded-md p-5">
                        <h4 className="text-lg font-display font-medium text-brand mb-2">The Quillian et al. Synthesis</h4>
                        <p className="text-sm text-foreground/90 mb-3 font-display leading-relaxed">
                            Aggregated data from <strong>123</strong> field experiments covering <span className="text-brand font-mono">55,000+</span> applications.
                        </p>
                        <div className="flex items-start gap-3 text-xs bg-secondary/30 p-3 rounded-sm border border-brand/20">
                            <ArrowRight className="w-4 h-4 text-brand mt-0.5 shrink-0" />
                            <span className="leading-relaxed text-muted-foreground">
                                <strong className="text-brand">Finding:</strong> No decrease in hiring discrimination against African Americans over 25 years, despite diversity initiatives.
                            </span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
