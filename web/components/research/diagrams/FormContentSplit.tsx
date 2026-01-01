"use client";

export function FormContentSplit() {
    return (
        <figure className="w-full max-w-2xl mx-auto my-10">
            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3 border-t border-border/40 pt-3">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Form penalty</div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        1-2 errors can cost as much as missing a year of experience.
                    </p>
                    <div className="text-[11px] text-muted-foreground">
                        Example: manger -&gt; manager, attention too detail
                    </div>
                    <p className="text-xs text-muted-foreground">Result: credibility drops immediately.</p>
                </div>

                <div className="space-y-3 border-t border-brand/30 pt-3 bg-brand/5 p-4">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Content reality</div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Strong content cannot compensate for weak form in the initial skim.
                    </p>
                    <div className="space-y-2 pt-2">
                        <div className="h-1 w-3/4 bg-brand/30" />
                        <div className="h-1 w-full bg-brand/40" />
                        <div className="h-1 w-5/6 bg-brand/30" />
                    </div>
                    <p className="text-xs text-muted-foreground">Result: good candidates are filtered out early.</p>
                </div>
            </div>

            <figcaption className="mt-3 text-center">
                <span className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Fig. 1</span>
                <span className="block text-xs text-muted-foreground">
                    Form errors dominate the initial impression even when content is strong.
                </span>
            </figcaption>
        </figure>
    );
}
