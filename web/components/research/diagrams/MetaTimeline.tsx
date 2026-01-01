"use client";

export function MetaTimeline() {
    return (
        <figure className="riyp-figure w-full max-w-2xl mx-auto my-10">
            <div className=" text-sm text-muted-foreground mb-6">
                What resumes can control vs what they cannot
            </div>

            <div className="riyp-figure-frame p-6">
                <div className="relative mx-auto w-56 h-56">
                    <div className="absolute inset-0 rounded-full border border-border/40" />
                    <div className="absolute inset-8 rounded-full border border-brand/40 bg-brand/5" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className=" text-xs text-muted-foreground space-y-2">
                            <div>
                                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
                                    Systemic
                                </div>
                                <div>Market bias, gatekeeping, algorithmic exposure</div>
                            </div>
                            <div className="pt-2">
                                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
                                    Controllable
                                </div>
                                <div>Clarity, structure, proof, consistency</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <figcaption className="mt-3">
                <span className="block riyp-figure-kicker">Fig. 1</span>
                <span className="block text-xs text-muted-foreground">
                    A bounded-control view of what resumes can improve versus systemic factors.
                </span>
            </figcaption>
        </figure>
    );
}
