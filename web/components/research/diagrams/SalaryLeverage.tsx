"use client";

export function SalaryLeverage() {
    return (
        <figure className="riyp-figure w-full max-w-lg mx-auto my-10">
            <div className="riyp-figure-frame p-6 grid grid-cols-2 gap-4">
                <div className="p-5 border border-border/30 bg-background">
                    <h4 className="riyp-figure-kicker mb-3">Before ban</h4>
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
                    <h4 className="riyp-figure-kicker mb-3">After ban</h4>
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

            <figcaption className="mt-3">
                <span className="block riyp-figure-kicker">Fig. 1</span>
                <span className="block text-xs text-muted-foreground">
                    Salary history bans shift the negotiation anchor.
                </span>
            </figcaption>
        </figure>
    );
}
