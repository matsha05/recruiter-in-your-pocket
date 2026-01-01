"use client";

/**
 * Referral Funnel Diagram
 * Compares application source success rates
 * Style: Research-grade funnel/bar comparison
 */
export function ReferralFunnelDiagram() {
    const sources = [
        { label: "Job Board", rank: "Lower", highlight: false },
        { label: "Company Site", rank: "Medium", highlight: false },
        { label: "Referral", rank: "Highest", highlight: true },
    ];

    return (
        <figure className="w-full max-w-md mx-auto my-8">
            <div className="border border-border/30 bg-background p-4 md:p-6">
                <div className="flex justify-between text-[9px] font-mono uppercase tracking-widest text-muted-foreground mb-4 md:mb-6">
                    <span>Source</span>
                    <span>Interview likelihood</span>
                </div>

                <div className="space-y-4">
                    {sources.map((source) => (
                        <div key={source.label} className="space-y-1">
                            <div className="flex justify-between items-center">
                                <span className={`text-xs ${source.highlight ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                                    {source.label}
                                </span>
                                <span className={`text-xs font-mono ${source.highlight ? "text-brand font-medium" : "text-muted-foreground"}`}>
                                    {source.rank}
                                </span>
                            </div>
                            <div className="h-2 bg-foreground/5 border border-border/30">
                                <div
                                    className={`h-full ${source.highlight ? "bg-brand/40" : "bg-foreground/20"}`}
                                    style={{ width: "100%" }}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <p className="text-center text-[10px] text-muted-foreground mt-6">
                    Qualitative ordering based on referral research, not a quantitative scale.
                </p>
            </div>

            <figcaption className="mt-3 text-center">
                <span className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Fig. 1</span>
                <span className="block text-xs text-muted-foreground">
                    Interview likelihood by application source.
                </span>
            </figcaption>
        </figure>
    );
}
