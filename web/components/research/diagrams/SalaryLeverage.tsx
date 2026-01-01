"use client";

export function SalaryLeverage() {
    return (
        <figure className="w-full max-w-lg mx-auto my-10">
            <div className="grid grid-cols-2 gap-4">
                <div className="p-5 border border-border/30 bg-background">
                    <h4 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">Before ban</h4>
                    <div className="space-y-3">
                        <div className="border border-border/30 p-3 text-xs text-muted-foreground">
                            Employer asks: &quot;What is your current salary?&quot;
                        </div>
                        <div className="text-sm text-muted-foreground">Anchored to past compensation.</div>
                        <p className="text-xs text-muted-foreground">
                            Offers are based on history, perpetuating pay gaps.
                        </p>
                    </div>
                </div>

                <div className="p-5 border border-brand/30 bg-brand/5">
                    <h4 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">After ban</h4>
                    <div className="space-y-3">
                        <div className="border border-brand/30 p-3 text-xs text-muted-foreground">
                            Employer asks: &quot;What are your expectations?&quot;
                        </div>
                        <div className="text-sm text-muted-foreground">Anchored to market value.</div>
                        <p className="text-xs text-muted-foreground">
                            Offers are tied to role value and market data.
                        </p>
                    </div>
                </div>
            </div>

            <figcaption className="mt-3 text-center">
                <span className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Fig. 1</span>
                <span className="block text-xs text-muted-foreground">
                    Salary history bans shift the negotiation anchor.
                </span>
            </figcaption>
        </figure>
    );
}
