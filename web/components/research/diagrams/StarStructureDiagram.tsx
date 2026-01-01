"use client";

/**
 * STAR Method Structure Diagram
 * Visualizes the Situation-Task-Action-Result framework
 * Style: Research-grade step flow
 */
export function StarStructureDiagram() {
    const steps = [
        { letter: "S", label: "Situation", desc: "Context", highlight: false },
        { letter: "T", label: "Task", desc: "Your role", highlight: false },
        { letter: "A", label: "Action", desc: "What you did", highlight: false },
        { letter: "R", label: "Result", desc: "The outcome", highlight: true },
    ];

    return (
        <figure className="riyp-figure w-full max-w-lg mx-auto my-8">
            <div className="riyp-figure-frame p-4 md:p-6">
                <div className="flex items-start justify-between gap-1 md:gap-4">
                    {steps.map((step) => (
                        <div key={step.letter} className="flex flex-col items-center flex-1">
                            <div className={`w-10 h-10 md:w-14 md:h-14 border rounded-md ${step.highlight ? "border-brand/30 bg-brand/5" : "border-border/30 bg-foreground/5"} flex items-center justify-center`}>
                                <span className={`font-display text-lg md:text-2xl font-medium ${step.highlight ? "text-brand" : "text-foreground"}`}>
                                    {step.letter}
                                </span>
                            </div>
                            <p className={`text-[10px] md:text-xs font-medium mt-2 ${step.highlight ? "text-brand" : "text-foreground"}`}>
                                {step.label}
                            </p>
                            <p className="text-[8px] md:text-[9px] text-muted-foreground hidden md:block">{step.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-8 pt-4 border-t border-border/20">
                    <p className="riyp-figure-kicker mb-3">
                        On a resume
                    </p>
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                        <span>[S+T implied]</span>
                        <span>→</span>
                        <span>Action</span>
                        <span>→</span>
                        <span className="text-brand font-medium">Result</span>
                    </div>
                </div>
            </div>

            <figcaption className="mt-3">
                <span className="block riyp-figure-kicker">Fig. 1</span>
                <span className="block text-xs text-muted-foreground">
                    The STAR framework for behavioral responses.
                </span>
            </figcaption>
        </figure>
    );
}
