"use client";

/**
 * Resume Length Comparison Diagram
 * Visualizes the relationship between experience level and optimal resume length
 * Style: Research-grade bar chart, monochrome + teal accent
 */
export function ResumeLengthChart() {
    const data = [
        { label: "0-5 years", pages: 1, optimal: true, width: 35 },
        { label: "5-10 years", pages: 1.5, optimal: false, width: 52 },
        { label: "10+ years", pages: 2, optimal: true, width: 70 },
    ];

    return (
        <figure className="w-full max-w-md mx-auto my-8">
            <div className="relative border border-border/30 bg-background p-4 md:p-6">
                <p className="md:hidden text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-4 text-center">
                    Resume length by experience
                </p>

                <div className="hidden md:block absolute -left-2 top-1/2 -translate-y-1/2 -rotate-90">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                        Experience
                    </span>
                </div>

                <div className="space-y-3 md:space-y-4 md:pl-4">
                    {data.map((row) => (
                        <div key={row.label} className="flex items-center gap-3">
                            <span className="font-mono text-[10px] text-muted-foreground w-16 text-right">
                                {row.label}
                            </span>
                            <div className="flex-1 h-2 bg-foreground/5 border border-border/30">
                                <div
                                    className={`h-full ${row.optimal ? "bg-brand/40" : "bg-foreground/20"}`}
                                    style={{ width: `${row.width}%` }}
                                />
                            </div>
                            <span className={`font-mono text-xs w-10 ${row.optimal ? "text-brand font-medium" : "text-muted-foreground"}`}>
                                {row.pages}p
                            </span>
                        </div>
                    ))}
                </div>

                <div className="mt-6 pt-4 border-t border-border/20">
                    <div className="flex justify-between px-4">
                        <span className="font-mono text-[9px] text-muted-foreground">0</span>
                        <span className="font-mono text-[9px] text-muted-foreground">1 page</span>
                        <span className="font-mono text-[9px] text-muted-foreground">2 pages</span>
                    </div>
                </div>

                <div className="flex justify-center gap-6 mt-4 text-[10px]">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-brand/40" />
                        <span className="text-muted-foreground">Optimal</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-foreground/20" />
                        <span className="text-muted-foreground">Variable</span>
                    </div>
                </div>
            </div>

            <figcaption className="mt-3 text-center">
                <span className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Fig. 1</span>
                <span className="block text-xs text-muted-foreground">
                    Optimal resume length by experience level.
                </span>
            </figcaption>
        </figure>
    );
}
