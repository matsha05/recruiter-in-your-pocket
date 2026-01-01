"use client";

/**
 * Referral Information Channel Diagram
 * Visualizes how referrals add information into the screening stage.
 */
export function ReferralFunnelDiagram() {
    return (
        <figure className="riyp-figure w-full max-w-md mx-auto my-8">
            <div className="riyp-figure-frame p-4 md:p-6">
                <div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground mb-6">
                    Information channel model
                </div>

                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="riyp-figure-kicker w-20">
                            Cold
                        </div>
                        <div className="flex-1 grid grid-cols-3 gap-3">
                            <div className="border border-border/40 p-3 text-xs text-muted-foreground">Applicant</div>
                            <div className="border border-border/40 p-3 text-xs text-muted-foreground">Screening</div>
                            <div className="border border-border/40 p-3 text-xs text-muted-foreground">Interview</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="riyp-figure-kicker w-20">
                            Referred
                        </div>
                        <div className="flex-1 grid grid-cols-4 gap-3">
                            <div className="border border-border/40 p-3 text-xs text-muted-foreground">Applicant</div>
                            <div className="border border-brand/40 bg-brand/5 p-3 text-xs text-foreground">Info packet</div>
                            <div className="border border-border/40 p-3 text-xs text-muted-foreground">Screening</div>
                            <div className="border border-border/40 p-3 text-xs text-muted-foreground">Interview</div>
                        </div>
                    </div>
                </div>
            </div>

            <figcaption className="mt-3">
                <span className="block riyp-figure-kicker">Fig. 1</span>
                <span className="block text-xs text-muted-foreground">
                    Referrals add information that can change how screening is interpreted.
                </span>
            </figcaption>
        </figure>
    );
}
