"use client";

import { DiagramCaption, DiagramFigure, DiagramFrame } from "@/components/shared/diagrams/DiagramPrimitives";
import { EvidenceHeader } from "@/components/shared/diagrams/EvidenceVisuals";
import { PenNote } from "@/components/research/figures/FigureKit";

// Published differences only (Pallais & Sands, 2016). Base rates are not shown because the figure
// compares the gap, not the rates themselves.
const differences = [
    { label: "Submitted work on time", points: 11 },
    { label: "Continued the job", points: 20 },
];
const axisMax = 25;
const ticks = [0, 5, 10, 15, 20, 25];

export function ReferralQuantifiedDiagram({ figureNumber = 1 }: { figureNumber?: number }) {
    return (
        <DiagramFigure className="max-w-[46rem]" label="Bar chart: referred workers were 11 percentage points more likely to submit work on time and 20 points more likely to continue the job">
            <DiagramFrame>
                <EvidenceHeader index={String(figureNumber).padStart(2, "0")} title="How much more often referred workers came through" note="Difference from comparable non-referred workers, in percentage points." />
                <div className="px-5 pb-6 pt-7 md:px-7 md:pb-8">
                    <dl className="grid gap-6">
                        {differences.map((item) => (
                            <div key={item.label} className="grid gap-2 sm:grid-cols-[11rem_minmax(0,1fr)] sm:items-center sm:gap-5">
                                <dt className="text-sm font-semibold text-foreground">{item.label}</dt>
                                <dd className="flex items-center gap-3">
                                    <span className="block h-7 rounded-r-md bg-[hsl(var(--pen))]" style={{ width: `${(item.points / axisMax) * 100}%` }} aria-hidden="true" />
                                    <span className="whitespace-nowrap font-display text-xl font-extrabold tracking-tight text-foreground">+{item.points}<span className="ml-1 text-sm font-semibold text-muted-foreground">points</span></span>
                                </dd>
                            </div>
                        ))}
                    </dl>
                    <div className="mt-4 hidden grid-cols-[11rem_minmax(0,1fr)] gap-5 sm:grid" aria-hidden="true">
                        <span />
                        <div className="relative h-5 border-t border-line">
                            {ticks.map((tick) => (
                                <span key={tick} className="absolute top-1 -translate-x-1/2 text-xs tabular-nums text-muted-foreground" style={{ left: `${(tick / axisMax) * 100}%` }}>{tick}</span>
                            ))}
                        </div>
                    </div>
                    <PenNote className="mt-6">The person who vouched for them knew something the profile didn&apos;t show.</PenNote>
                </div>
            </DiagramFrame>
            <DiagramCaption kicker={`Fig. ${figureNumber} / Pallais & Sands`} title="Referred workers did better work and were more likely to want to stay on." />
        </DiagramFigure>
    );
}
