"use client";

export function ATSFunnel() {
    const layers = [
        {
            label: "Data capture and storage (ATS)",
            note: "Parsing, profile storage, search, workflow routing",
            barClass: "bg-foreground/20"
        },
        {
            label: "Screening logic",
            note: "Eligibility rules, assessments, ranking, filters",
            barClass: "bg-brand/20"
        },
        {
            label: "Human decision points",
            note: "Shortlist, interview selection, final hire",
            barClass: "bg-brand"
        }
    ];

    return (
        <figure className="riyp-figure w-full max-w-[520px] mx-auto my-10">
            <div className="riyp-figure-frame p-6 space-y-6">
                {layers.map((layer, index) => (
                    <div key={layer.label} className="space-y-2">
                        <div className="flex flex-wrap justify-between gap-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                            <span>{String(index + 1).padStart(2, "0")}. {layer.label}</span>
                            <span className="text-muted-foreground/70">{layer.note}</span>
                        </div>
                        <div className="h-2 border border-border/40 bg-foreground/5 rounded">
                            <div className={`h-full ${layer.barClass}`} />
                        </div>
                    </div>
                ))}
            </div>

            <figcaption className="mt-3 text-center">
                <span className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Fig. 1</span>
                <span className="block text-xs text-muted-foreground">
                    Decision rights map showing where automation can operate and where humans decide. Not to scale.
                </span>
            </figcaption>
        </figure>
    );
}
