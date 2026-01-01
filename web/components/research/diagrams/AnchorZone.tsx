"use client";

export function AnchorZone() {
    return (
        <figure className="riyp-figure w-full max-w-3xl mx-auto my-10">
            <div className="riyp-figure-frame p-6">
                <div className="riyp-figure-kicker mb-4">
                    Negotiation anchor zones
                </div>

                <div className="relative h-8 flex items-center">
                    <div className="absolute left-0 right-0 h-px bg-border/60" />
                    <div className="absolute left-[15%] -top-1">
                        <div className="riyp-figure-kicker">First offer</div>
                        <div className="text-xs text-muted-foreground">$130k</div>
                    </div>
                    <div className="absolute left-[50%] -top-1">
                        <div className="riyp-figure-kicker">Package ask</div>
                        <div className="text-xs text-brand">$145k</div>
                    </div>
                    <div className="absolute left-[85%] -top-1">
                        <div className="riyp-figure-kicker">Impasse risk</div>
                        <div className="text-xs text-muted-foreground">$180k+</div>
                    </div>
                </div>

                <div className="mt-6 text-sm text-muted-foreground">
                    Anchor just below the impasse point, then justify the ask with market data.
                </div>
            </div>

            <figcaption className="mt-3">
                <span className="block riyp-figure-kicker">Fig. 1</span>
                <span className="block text-xs text-muted-foreground">Anchor placement relative to offer risk.</span>
            </figcaption>
        </figure>
    );
}
