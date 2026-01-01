"use client";

export function ATSFunnel() {
    const stages = [
        {
            label: "Applicants",
            note: "Large volume enters the system",
            width: "100%",
            barClass: "bg-foreground/30"
        },
        {
            label: "Eligibility screening",
            note: "Explicit requirements can filter candidates",
            width: "70%",
            barClass: "bg-brand/30"
        },
        {
            label: "Human review",
            note: "A smaller subset receives close review",
            width: "35%",
            barClass: "bg-brand"
        }
    ];

    return (
        <figure className="w-full max-w-[520px] mx-auto my-10">
            <div className="space-y-6">
                {stages.map((stage, index) => (
                    <div key={stage.label} className="space-y-2">
                        <div className="flex flex-wrap justify-between gap-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                            <span>{String(index + 1).padStart(2, "0")}. {stage.label}</span>
                            <span className="text-muted-foreground/70">{stage.note}</span>
                        </div>
                        <div className="h-2 border border-border/40 bg-foreground/5">
                            <div className={`h-full ${stage.barClass}`} style={{ width: stage.width }} />
                        </div>
                    </div>
                ))}
            </div>

            <figcaption className="mt-3 text-center">
                <span className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Fig. 1</span>
                <span className="block text-xs text-muted-foreground">
                    Illustrative funnel showing how candidates move from intake to human review. Not to scale.
                </span>
            </figcaption>
        </figure>
    );
}
