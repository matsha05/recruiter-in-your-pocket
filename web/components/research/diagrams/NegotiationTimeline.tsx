"use client";

export function NegotiationTimeline() {
    const steps = [
        {
            title: "Offer delivered",
            desc: "You receive the initial numbers.",
            action: "Ask for time to review",
        },
        {
            title: "Clarify package",
            desc: "Understand constraints first.",
            action: "Ask for band, level, levers",
        },
        {
            title: "Counter once",
            desc: "Do not negotiate piecemeal.",
            action: "Package ask + brief rationale",
            highlight: true,
        },
        {
            title: "Trade levers",
            desc: "If base is stuck, move elsewhere.",
            action: "Trade sign-on, equity, start date",
        },
        {
            title: "Close fast",
            desc: "Commit in writing when aligned.",
            action: "Confirm in writing",
        }
    ];

    return (
        <figure className="riyp-figure w-full my-10 overflow-x-auto">
            <div className="riyp-figure-frame p-6 min-w-[820px] relative">
                <div className="absolute top-[24px] left-[8%] right-[8%] h-px bg-border/60" />

                <div className="grid grid-cols-5 gap-4">
                    {steps.map((step) => (
                        <div key={step.title} className="flex flex-col items-center text-center">
                            <div className={`w-3 h-3 border border-border/60 rounded-full ${step.highlight ? "bg-brand/40" : "bg-foreground/20"}`} />
                            <h4 className="font-medium text-foreground mt-3 text-sm">{step.title}</h4>
                            <p className="text-[11px] text-muted-foreground mb-3 h-8 leading-snug px-2 max-w-[140px] mx-auto">
                                {step.desc}
                            </p>
                            <div className="text-[10px] font-mono uppercase tracking-wide text-muted-foreground">
                                {step.action}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <figcaption className="mt-4 text-center">
                <span className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Fig. 1</span>
                <span className="block text-xs text-muted-foreground">
                    A five-step negotiation cadence from offer to close.
                </span>
            </figcaption>
        </figure>
    );
}
