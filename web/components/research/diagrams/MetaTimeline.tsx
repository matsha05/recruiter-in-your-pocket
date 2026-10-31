"use client";

import { DiagramCaption, DiagramFigure, DiagramFrame } from "@/components/shared/diagrams/DiagramPrimitives";
import { EvidenceHeader } from "@/components/shared/diagrams/EvidenceVisuals";

// Quillian et al. (2017), PNAS: average callback ratios in US field experiments, 1989–2015.
const groups = [
    { group: "Black applicants", white: 136, trend: "No significant change since 1989" },
    { group: "Latino applicants", white: 124, trend: "Some evidence the gap narrowed" },
];
const axisMax = 140;

export function MetaTimeline({ figureNumber = 1 }: { figureNumber?: number }) {
    return (
        <DiagramFigure
            className="max-w-[50rem]"
            label="Bar chart: for every 100 callbacks to Black applicants, white applicants with equivalent resumes got 136. For every 100 to Latino applicants, white applicants got 124."
        >
            <DiagramFrame>
                <EvidenceHeader
                    index={String(figureNumber).padStart(2, "0")}
                    title="Same resume, more callbacks for white applicants"
                    note="Callbacks for every 100 received by the comparison group, across US field experiments since 1989."
                />
                <div className="grid gap-px bg-line md:grid-cols-2">
                    {groups.map((item) => (
                        <section key={item.group} className="bg-card px-5 pb-6 pt-6 md:px-7" aria-label={`Compared with ${item.group}`}>
                            <p className="text-sm font-semibold text-foreground">Compared with {item.group}</p>
                            <dl className="mt-5 grid gap-3">
                                <div className="grid gap-1.5">
                                    <dt className="text-sm text-muted-foreground">{item.group}</dt>
                                    <dd className="flex items-center gap-3">
                                        <span className="block h-6 rounded-r-md bg-[hsl(var(--text-strong)/0.18)]" style={{ width: `${(100 / axisMax) * 100}%` }} aria-hidden="true" />
                                        <span className="text-sm font-semibold tabular-nums text-muted-foreground">100</span>
                                    </dd>
                                </div>
                                <div className="grid gap-1.5">
                                    <dt className="text-sm text-muted-foreground">White applicants</dt>
                                    <dd className="flex items-center gap-3">
                                        <span className="block h-6 rounded-r-md bg-[hsl(var(--pen))]" style={{ width: `${(item.white / axisMax) * 100}%` }} aria-hidden="true" />
                                        <span className="font-display text-xl font-extrabold tabular-nums tracking-tight text-foreground">{item.white}</span>
                                    </dd>
                                </div>
                            </dl>
                            <p className="mt-5 border-t border-line pt-3 text-sm text-muted-foreground">{item.trend}</p>
                        </section>
                    ))}
                </div>
            </DiagramFrame>
            <DiagramCaption kicker={`Fig. ${figureNumber} / Quillian et al.`} title="A better-written resume doesn't close this gap. 28 experiments, 55,842 applications, fieldwork through 2015." />
        </DiagramFigure>
    );
}
