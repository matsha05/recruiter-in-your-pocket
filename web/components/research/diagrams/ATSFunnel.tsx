"use client";

export function ATSFunnel() {
    return (
        <figure className="w-full max-w-[520px] mx-auto my-10">
            <div className="space-y-6">
                <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                        <span>1. Applicants</span>
                        <span>1,000 candidates</span>
                    </div>
                    <div className="h-2 border border-border/40 bg-foreground/5">
                        <div className="h-full bg-foreground/30" style={{ width: "100%" }} />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                        <span>2. ATS screening</span>
                        <span>800 pass (80%)</span>
                    </div>
                    <div className="flex h-2 border border-border/40 bg-background">
                        <div className="h-full bg-brand/30" style={{ width: "80%" }} />
                        <div className="h-full bg-foreground/10" style={{ width: "20%" }} />
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                        Auto-rejections are typically knockout criteria.
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                        <span>3. Human review</span>
                        <span>50 seen (5%)</span>
                    </div>
                    <div className="flex h-2 border border-border/40 bg-background">
                        <div className="h-full bg-brand" style={{ width: "5%" }} />
                        <div className="h-full bg-foreground/10" style={{ width: "95%" }} />
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                        The bottleneck is human attention, not ATS filters.
                    </div>
                </div>
            </div>

            <figcaption className="mt-3 text-center">
                <span className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Fig. 1</span>
                <span className="block text-xs text-muted-foreground">
                    Applicant flow through ATS screening and human review.
                </span>
            </figcaption>
        </figure>
    );
}
