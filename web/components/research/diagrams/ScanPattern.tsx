"use client";

/**
 * ScanPattern - F-Pattern Eye-Tracking Visualization
 * Research UI Contract compliant: no motion, no gradients, no glows.
 */
export function ScanPattern() {
    return (
        <figure className="w-full max-w-[420px] mx-auto my-8">
            <div className="relative aspect-[1/1.35] border border-border/30 bg-background overflow-hidden">
                {/* Resume skeleton */}
                <div className="absolute inset-0 p-5 space-y-3">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1.5">
                            <div className="h-5 w-32 bg-foreground/15" />
                            <div className="h-2.5 w-24 bg-foreground/8" />
                        </div>
                        <div className="space-y-1 text-right">
                            <div className="h-2 w-20 bg-foreground/6" />
                            <div className="h-2 w-16 bg-foreground/6" />
                        </div>
                    </div>

                    <div className="h-px w-full bg-border/30 my-2" />

                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                            <div className="h-3.5 w-28 bg-foreground/12" />
                            <div className="h-2 w-14 bg-foreground/6" />
                        </div>
                        <div className="h-2.5 w-20 bg-foreground/8" />
                        <div className="space-y-1 pt-1">
                            <div className="h-1.5 w-full bg-foreground/4" />
                            <div className="h-1.5 w-[92%] bg-foreground/4" />
                            <div className="h-1.5 w-[85%] bg-foreground/4" />
                        </div>
                    </div>

                    <div className="space-y-1.5 pt-2">
                        <div className="flex justify-between items-center">
                            <div className="h-3.5 w-24 bg-foreground/10" />
                            <div className="h-2 w-14 bg-foreground/6" />
                        </div>
                        <div className="h-2.5 w-18 bg-foreground/6" />
                        <div className="space-y-1 pt-1">
                            <div className="h-1.5 w-full bg-foreground/4" />
                            <div className="h-1.5 w-[78%] bg-foreground/4" />
                        </div>
                    </div>

                    <div className="space-y-1.5 pt-2">
                        <div className="flex justify-between items-center">
                            <div className="h-3.5 w-26 bg-foreground/10" />
                            <div className="h-2 w-14 bg-foreground/6" />
                        </div>
                        <div className="space-y-1 pt-1">
                            <div className="h-1.5 w-full bg-foreground/4" />
                            <div className="h-1.5 w-[82%] bg-foreground/4" />
                        </div>
                    </div>

                    <div className="space-y-1.5 pt-3">
                        <div className="h-3 w-20 bg-foreground/8" />
                        <div className="h-2 w-32 bg-foreground/5" />
                    </div>

                    <div className="space-y-1.5 pt-2">
                        <div className="h-3 w-14 bg-foreground/8" />
                        <div className="flex flex-wrap gap-1.5">
                            <div className="h-3 w-10 bg-foreground/4" />
                            <div className="h-3 w-8 bg-foreground/4" />
                            <div className="h-3 w-12 bg-foreground/4" />
                            <div className="h-3 w-9 bg-foreground/4" />
                        </div>
                    </div>
                </div>

                {/* F-pattern emphasis */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute left-4 right-4 h-2 bg-brand/25" style={{ top: "20px" }} />
                    <div className="absolute left-4 h-2 w-[70%] bg-brand/20" style={{ top: "88px" }} />
                    <div className="absolute left-4 h-2 w-[45%] bg-brand/15" style={{ top: "152px" }} />
                    <div className="absolute left-4 w-2 bg-brand/15" style={{ top: "60px", bottom: "40px" }} />
                </div>
            </div>

            <figcaption className="mt-3 text-center">
                <span className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Fig. 1</span>
                <span className="block text-xs text-muted-foreground">Eye-tracking F-pattern across a resume page.</span>
            </figcaption>
        </figure>
    );
}
