"use client";

export function SalaryHistoryTrap() {
    return (
        <figure className="riyp-figure w-full max-w-2xl mx-auto my-10">
            <div className="riyp-figure-frame p-6 grid md:grid-cols-2 gap-8">
                <div className="border border-border/30 bg-background p-6 text-center">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">Social pressure</div>
                    <div className="text-3xl font-display text-foreground font-medium">47%</div>
                    <div className="text-xs text-muted-foreground mt-2">Disclose salary history</div>
                    <p className="text-xs text-muted-foreground mt-3">
                        Candidates disclose because they assume everyone else does.
                    </p>
                </div>

                <div className="border border-brand/30 bg-brand/5 p-6 text-center">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">Strategy</div>
                    <div className="text-lg font-display font-medium text-foreground mb-2">The silence strategy</div>
                    <p className="text-xs text-muted-foreground mb-4">
                        Pivot to market value instead of salary history.
                    </p>
                    <div className="border border-brand/30 p-3 text-xs text-muted-foreground">
                        &quot;I focus on market value, not history.&quot;
                    </div>
                </div>
            </div>

            <figcaption className="mt-3 text-center">
                <span className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Fig. 1</span>
                <span className="block text-xs text-muted-foreground">
                    Salary history pressure and the recommended response.
                </span>
            </figcaption>
        </figure>
    );
}
