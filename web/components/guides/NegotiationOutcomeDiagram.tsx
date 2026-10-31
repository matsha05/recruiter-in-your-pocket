"use client";

import { DiagramCaption, DiagramFigure, DiagramFrame } from "@/components/shared/diagrams/DiagramPrimitives";
import { EvidenceHeader } from "@/components/shared/diagrams/EvidenceVisuals";

// Pew Research Center (April 2023): US workers who asked for more than the first offer, by what happened.
const outcomes = [
    { name: "Got what they asked for", share: 28, fill: "bg-[hsl(var(--pen))]" },
    { name: "Got more, but less than they asked", share: 38, fill: "bg-[hsl(var(--pen)/0.45)]" },
    { name: "Got the first offer", share: 35, fill: "bg-[hsl(var(--text-strong)/0.14)]" },
];

export function NegotiationOutcomeDiagram() {
    return (
        <DiagramFigure
            className="max-w-[50rem]"
            label="Of US workers who asked for more than the first offer, 28% got what they asked for, 38% got more but less than they asked, and 35% got the first offer. About 3 in 10 workers asked at all."
        >
            <DiagramFrame>
                <EvidenceHeader
                    index="01"
                    title="Two in three people who asked got more"
                    note="US workers who asked for more than the first offer the last time they were hired, by what happened."
                />
                <div className="px-5 pb-6 pt-7 md:px-7 md:pb-8">
                    <div className="flex h-10 gap-0.5 overflow-hidden rounded-lg" aria-hidden="true">
                        {outcomes.map((outcome) => (
                            <span key={outcome.name} className={outcome.fill} style={{ flexGrow: outcome.share, flexBasis: 0 }} />
                        ))}
                    </div>
                    <dl className="mt-6 grid gap-5 sm:grid-cols-3">
                        {outcomes.map((outcome) => (
                            <div key={outcome.name} className="grid content-start gap-1">
                                <dt className="flex items-start gap-2 text-sm font-semibold text-foreground">
                                    <span className={`mt-1 h-3 w-3 shrink-0 rounded-sm ${outcome.fill}`} aria-hidden="true" />
                                    {outcome.name}
                                </dt>
                                <dd className="font-display text-2xl font-extrabold tracking-tight text-foreground">{outcome.share}%</dd>
                            </div>
                        ))}
                    </dl>
                    <p className="mt-6 border-t border-line pt-4 text-sm leading-6 text-muted-foreground">
                        Only about 3 in 10 workers asked at all. The survey is self-reported and didn&apos;t ask how big the increase was.
                    </p>
                </div>
            </DiagramFrame>
            <DiagramCaption kicker="Fig. 1 / Pew Research Center" title="Asking rarely got everything. It usually got something. 5,188 US workers, 2023." />
        </DiagramFigure>
    );
}
