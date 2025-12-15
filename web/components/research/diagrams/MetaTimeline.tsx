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
                    <p className="text-sm text-muted-foreground">"Are Emily and Greg More Employable than Lakisha and Jamal?" sets the benchmark.</p>
                </div>

                {/* 2017 Meta */}
                <div className="relative">
                    <div className="absolute -left-[43px] bg-primary border-4 border-background w-6 h-6 rounded-full shadow-sm" />
                    <span className="text-xs font-bold text-primary mb-1 block">2017 META-ANALYSIS</span>
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-5">
                        <h4 className="text-lg font-serif font-medium text-primary mb-2">The Quillian et al. Synthesis</h4>
                        <p className="text-sm text-foreground/90 mb-3">
                            Aggregated data from <strong>123</strong> field experiments covering <strong>55,000+</strong> applications.
                        </p>
                        <div className="flex items-start gap-3 text-xs bg-background/50 p-3 rounded border border-primary/10">
                            <ArrowRight className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                            <span className="leading-relaxed">
                                <strong>Finding:</strong> No decrease in hiring discrimination against African Americans over 25 years, despite diversity initiatives.
                            </span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
