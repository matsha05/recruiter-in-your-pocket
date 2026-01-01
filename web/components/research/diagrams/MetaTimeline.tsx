"use client";

export function MetaTimeline() {
    return (
        <figure className="w-full max-w-2xl mx-auto my-10">
            <div className="text-center text-sm text-muted-foreground mb-6">
                Aggregating 25 years of field experiments
            </div>

            <div className="relative border-l-2 border-border ml-6 md:ml-10 pl-6 space-y-8 py-2">
                <div className="relative">
                    <div className="absolute -left-[29px] bg-background border border-border/60 w-3 h-3" />
                    <span className="text-[10px] font-mono text-muted-foreground mb-1 block">1990 - 2000</span>
                    <h4 className="font-medium text-foreground">Early audit studies</h4>
                    <p className="text-sm text-muted-foreground">Resume callbacks vary by name and origin.</p>
                </div>

                <div className="relative">
                    <div className="absolute -left-[29px] bg-background border border-border/60 w-3 h-3" />
                    <span className="text-[10px] font-mono text-muted-foreground mb-1 block">2004</span>
                    <h4 className="font-medium text-foreground">Bertrand and Mullainathan</h4>
                    <p className="text-sm text-muted-foreground">
                        &quot;Are Emily and Greg More Employable than Lakisha and Jamal?&quot; sets the benchmark.
                    </p>
                </div>

                <div className="relative">
                    <div className="absolute -left-[30px] bg-background border border-brand/40 w-4 h-4" />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1 block">2017 meta-analysis</span>
                    <div className="border border-brand/30 bg-brand/5 p-4">
                        <h4 className="text-lg font-display font-medium text-foreground mb-2">Quillian et al. synthesis</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                            Aggregates 123 field experiments across 55,000+ applications.
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Finding: no decrease in hiring discrimination over 25 years.
                        </p>
                    </div>
                </div>
            </div>

            <figcaption className="mt-3 text-center">
                <span className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Fig. 1</span>
                <span className="block text-xs text-muted-foreground">
                    Timeline of key discrimination studies and the 2017 synthesis.
                </span>
            </figcaption>
        </figure>
    );
}
