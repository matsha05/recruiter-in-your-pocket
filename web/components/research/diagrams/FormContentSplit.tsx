"use client";

export function FormContentSplit() {
    return (
        <figure className="riyp-figure w-full max-w-2xl mx-auto my-10">
            <div className="riyp-figure-frame p-6">
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-4">
                    Penalty decomposition (illustrative)
                </div>
                <div className="space-y-4">
                    <div className="h-4 w-full border border-border/40 bg-foreground/5 flex overflow-hidden">
                        <div className="flex-1 bg-brand/30" />
                        <div className="flex-1 bg-brand/20" />
                        <div className="flex-1 bg-foreground/20" />
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-[11px] text-muted-foreground">
                        <div>
                            <div className="font-mono uppercase tracking-widest text-muted-foreground/70 text-[9px]">
                                Conscientiousness
                            </div>
                            <div>Signals attention to detail and care.</div>
                        </div>
                        <div>
                            <div className="font-mono uppercase tracking-widest text-muted-foreground/70 text-[9px]">
                                Interpersonal
                            </div>
                            <div>Raises doubts about professionalism.</div>
                        </div>
                        <div>
                            <div className="font-mono uppercase tracking-widest text-muted-foreground/70 text-[9px]">
                                Cognitive ability
                            </div>
                            <div>Suggests weaker written communication.</div>
                        </div>
                    </div>
                </div>
            </div>

            <figcaption className="mt-3 text-center">
                <span className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Fig. 1</span>
                <span className="block text-xs text-muted-foreground">
                    Illustrative breakdown of how evaluators may attribute error penalties.
                </span>
            </figcaption>
        </figure>
    );
}
