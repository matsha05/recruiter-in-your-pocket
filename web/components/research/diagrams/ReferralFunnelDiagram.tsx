"use client";

/**
 * Referral Funnel Diagram
 * Compares application source success rates
 * Style: Research-grade funnel/bar comparison
 */
export function ReferralFunnelDiagram() {
    const sources = [
        { label: "Job Board", rate: 3, interviews: "3-5%", hires: "~1%", width: 15 },
        { label: "Company Site", rate: 5, interviews: "5-8%", hires: "~2%", width: 25 },
        { label: "Referral", rate: 45, interviews: "40-60%", hires: "~15%", width: 100, highlight: true },
    ];

    return (
        <figure className="w-full max-w-md mx-auto my-8">
            <div className="border border-border/30 bg-background p-4 md:p-6">
                <div className="flex justify-between text-[9px] font-mono uppercase tracking-widest text-muted-foreground mb-4 md:mb-6">
                    <span>Source</span>
                    <span>Interview rate</span>
                </div>

                <div className="space-y-4">
                    {sources.map((source) => (
                        <div key={source.label} className="space-y-1">
                            <div className="flex justify-between items-center">
                                <span className={`text-xs ${source.highlight ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                                    {source.label}
                                </span>
                                <span className={`text-xs font-mono ${source.highlight ? "text-brand font-medium" : "text-muted-foreground"}`}>
                                    {source.interviews}
                                </span>
                            </div>
                            <div className="h-2 bg-foreground/5 border border-border/30">
                                <div
                                    className={`h-full ${source.highlight ? "bg-brand/40" : "bg-foreground/20"}`}
                                    style={{ width: `${source.width}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 pt-4 border-t border-border/20 text-center">
                    <div className="inline-flex items-baseline gap-2">
                        <span className="font-display text-3xl font-medium text-brand">5-10×</span>
                        <span className="text-xs text-muted-foreground">more likely to be hired</span>
                    </div>
                </div>

                <p className="text-center text-[10px] text-muted-foreground mt-4">
                    Referrals are 7% of applicants but 40% of hires
                </p>
            </div>

            <figcaption className="mt-3 text-center">
                <span className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Fig. 1</span>
                <span className="block text-xs text-muted-foreground">
                    Interview success rate by application source.
                </span>
            </figcaption>
        </figure>
    );
}
