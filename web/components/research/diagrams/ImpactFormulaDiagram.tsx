"use client";

/**
 * Impact Formula Diagram (Laszlo Bock)
 * Visualizes the X → Y → Z formula for resume bullets
 * Style: Research-grade formula breakdown
 */
export function ImpactFormulaDiagram() {
    return (
        <figure className="riyp-figure w-full max-w-lg mx-auto my-8">
            <div className="riyp-figure-frame p-6">
                <div className="flex items-center justify-center gap-3 md:gap-4 mb-6">
                    <div className="">
                        <div className="w-12 h-12 border border-brand/30 bg-brand/5 rounded-md flex items-center justify-center">
                            <span className="font-display text-xl font-medium text-brand">X</span>
                        </div>
                        <p className="text-[9px] font-mono uppercase text-muted-foreground mt-2">Result</p>
                    </div>

                    <span className="text-muted-foreground">→</span>

                    <div className="">
                        <div className="w-12 h-12 border border-border/30 bg-foreground/5 rounded-md flex items-center justify-center">
                            <span className="font-display text-xl font-medium text-foreground">Y</span>
                        </div>
                        <p className="text-[9px] font-mono uppercase text-muted-foreground mt-2">Metric</p>
                    </div>

                    <span className="text-muted-foreground">→</span>

                    <div className="">
                        <div className="w-12 h-12 border border-border/30 bg-foreground/5 rounded-md flex items-center justify-center">
                            <span className="font-display text-xl font-medium text-foreground">Z</span>
                        </div>
                        <p className="text-[9px] font-mono uppercase text-muted-foreground mt-2">Method</p>
                    </div>
                </div>

                <div className="border-t border-border/20 pt-5">
                    <p className="riyp-figure-kicker mb-2">
                        Example
                    </p>
                    <div className="border border-border/20 p-4 text-sm text-foreground leading-relaxed">
                        <span className="text-brand font-medium">&quot;Grew revenue by 40%</span>
                        <span className="text-muted-foreground"> as measured by </span>
                        <span className="text-foreground">quarterly MRR,</span>
                        <span className="text-muted-foreground"> by </span>
                        <span className="text-foreground">implementing a usage-based pricing model.&quot;</span>
                    </div>
                </div>

                <div className="flex justify-center gap-6 mt-5 text-[10px] text-muted-foreground">
                    <span>Accomplished [X]</span>
                    <span>Measured by [Y]</span>
                    <span>By doing [Z]</span>
                </div>
            </div>

            <figcaption className="mt-3">
                <span className="block riyp-figure-kicker">Fig. 1</span>
                <span className="block text-xs text-muted-foreground">
                    The Laszlo Bock formula for high-impact resume bullets.
                </span>
            </figcaption>
        </figure>
    );
}
