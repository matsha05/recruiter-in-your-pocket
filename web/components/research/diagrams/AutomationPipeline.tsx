"use client";

export function AutomationPipeline() {
    const steps = [
        {
            stage: "Sourcing",
            automation: "Ad Delivery",
            risk: "Old ads only shown to certain demographics",
        },
        {
            stage: "Screening",
            automation: "Resume Parsing",
            risk: "Non-standard formats parsed incorrectly",
        },
        {
            stage: "Selection",
            automation: "Ranking Algo",
            risk: "Bias against gaps or 'non-target' schools",
        },
        {
            stage: "Interview",
            automation: "Scoring",
            risk: "Standardized questions with biased grading",
            highlight: true,
        }
    ];

    return (
        <figure className="w-full overflow-x-auto py-8">
            <div className="min-w-[620px] flex items-stretch gap-4">
                {steps.map((s, i) => (
                    <div key={i} className="flex-1 flex items-center">
                        <div className={`flex-1 flex flex-col h-full border border-border/40 p-4 ${s.highlight ? "bg-brand/5 border-brand/30" : "bg-background"}`}>
                            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                                {s.stage}
                            </div>
                            <div className="mt-2 text-sm font-medium text-foreground">
                                {s.automation}
                            </div>
                            <div className="mt-3 text-[11px] text-muted-foreground">
                                Risk: {s.risk}
                            </div>
                        </div>
                        {i < steps.length - 1 && (
                            <div className="mx-2 h-px w-6 bg-border/60" />
                        )}
                    </div>
                ))}
            </div>

            <figcaption className="mt-3 text-center">
                <span className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Fig. 1</span>
                <span className="block text-xs text-muted-foreground">
                    Automation handoffs where bias can compound.
                </span>
            </figcaption>
        </figure>
    );
}
