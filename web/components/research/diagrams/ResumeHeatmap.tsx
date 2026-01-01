"use client";

/**
 * ResumeHeatmap - Aggregate gaze focus by section.
 * Research UI Contract compliant: no gradients, no blur, no motion.
 */
export function ResumeHeatmap() {
    return (
        <figure className="w-full max-w-[400px] mx-auto my-8">
            <div className="relative aspect-[1/1.4] border border-border/30 bg-background overflow-hidden">
                <div className="absolute inset-0 p-6 space-y-4">
                    <div className="space-y-2">
                        <div className="h-6 w-1/2 bg-foreground/15" />
                        <div className="h-3 w-1/3 bg-foreground/8" />
                    </div>

                    <div className="h-px w-full bg-border/30 my-4" />

                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <div className="h-4 w-1/3 bg-foreground/10" />
                            <div className="h-3 w-16 bg-foreground/5" />
                        </div>
                        <div className="h-3 w-1/4 bg-foreground/5" />
                        <div className="space-y-1 pt-1">
                            <div className="h-2 w-full bg-foreground/5" />
                            <div className="h-2 w-11/12 bg-foreground/5" />
                            <div className="h-2 w-10/12 bg-foreground/5" />
                        </div>
                    </div>

                    <div className="space-y-2 pt-2">
                        <div className="flex justify-between">
                            <div className="h-4 w-1/3 bg-foreground/10" />
                            <div className="h-3 w-16 bg-foreground/5" />
                        </div>
                        <div className="h-3 w-1/4 bg-foreground/5" />
                        <div className="space-y-1 pt-1">
                            <div className="h-2 w-full bg-foreground/5" />
                            <div className="h-2 w-11/12 bg-foreground/5" />
                        </div>
                    </div>

                    <div className="space-y-2 pt-4">
                        <div className="h-3 w-20 bg-foreground/10" />
                        <div className="h-2 w-1/2 bg-foreground/5" />
                    </div>

                    <div className="space-y-2 pt-4">
                        <div className="flex justify-between">
                            <div className="h-4 w-1/3 bg-foreground/10" />
                            <div className="h-3 w-16 bg-foreground/5" />
                        </div>
                        <div className="space-y-1 pt-1">
                            <div className="h-2 w-full bg-foreground/5" />
                            <div className="h-2 w-4/5 bg-foreground/5" />
                        </div>
                    </div>

                    <div className="space-y-2 pt-6 pb-4">
                        <div className="h-4 w-1/5 bg-foreground/10" />
                        <div className="h-2 w-full bg-foreground/5" />
                        <div className="h-2 w-4/5 bg-foreground/5" />
                    </div>
                </div>

                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-3 left-3 w-40 h-20 bg-brand/20" />
                    <div className="absolute top-24 left-3 w-32 h-14 bg-brand/15" />
                    <div className="absolute top-24 right-4 w-20 h-12 bg-brand/10" />
                    <div className="absolute top-44 left-3 w-28 h-12 bg-brand/10" />
                    <div className="absolute top-60 left-3 w-24 h-10 bg-brand/10" />
                    <div className="absolute bottom-16 left-3 w-24 h-12 bg-brand/10" />
                </div>
            </div>

            <figcaption className="mt-3 text-center">
                <span className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Fig. 1</span>
                <span className="block text-xs text-muted-foreground">
                    Aggregated gaze duration across recruiter scans.
                </span>
            </figcaption>
        </figure>
    );
}
