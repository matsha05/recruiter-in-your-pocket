"use client";

/**
 * Skills vs Credentials Shift Diagram
 * Visualizes the industry trend toward skills-based hiring
 * Style: Research-grade timeline/trend visualization
 */
export function SkillsShiftDiagram() {
    return (
        <figure className="w-full max-w-lg mx-auto my-8">
            <div className="border border-border/30 bg-background p-4 md:p-6">
                <div className="flex justify-between mb-4 md:mb-6 text-[9px] md:text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    <span>Traditional</span>
                    <span>Emerging</span>
                </div>

                <div className="space-y-3 md:space-y-4">
                    {[
                        { left: "Degree required", right: "Skills demonstrated" },
                        { left: "X years required", right: "Relevant outcomes" },
                        { left: "Pedigree and prestige", right: "Portfolio evidence" },
                    ].map((row) => (
                        <div key={row.left} className="flex items-center gap-3">
                            <div className="flex-1 text-right">
                                <span className="text-xs text-muted-foreground line-through">{row.left}</span>
                            </div>
                            <div className="w-12 h-px bg-border/60" />
                            <div className="flex-1">
                                <span className="text-xs text-muted-foreground">{row.right}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 pt-4 border-t border-border/20 text-center">
                    <span className="font-display text-3xl font-medium text-brand">45%</span>
                    <p className="text-[10px] text-muted-foreground mt-1">
                        of companies plan to prioritize skills over degrees by 2025
                    </p>
                </div>
            </div>

            <figcaption className="mt-3 text-center">
                <span className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Fig. 1</span>
                <span className="block text-xs text-muted-foreground">
                    The shift from credentials to skills-based signals.
                </span>
            </figcaption>
        </figure>
    );
}
