"use client";

import { DiagramCaption, DiagramFigure, DiagramFrame } from "@/components/shared/diagrams/DiagramPrimitives";
import { EvidenceHeader } from "@/components/shared/diagrams/EvidenceVisuals";

// Sterkens et al. (2023), Table 4: change in a 0–10 interview-likelihood rating versus an error-free resume.
const rows = [
    { label: "No errors", drop: 0 },
    { label: "Two errors", drop: 0.73 },
    { label: "Five errors", drop: 1.85 },
];
const axisMax = 2;
const ticks = [0, 0.5, 1, 1.5, 2];

export function ErrorImpactDiagram({ figureNumber = 1 }: { figureNumber?: number }) {
    return (
        <DiagramFigure
            className="max-w-[46rem]"
            label="Bar chart: compared with an error-free resume, two spelling errors lowered the interview rating by 0.73 points and five errors by 1.85 points on a 0 to 10 scale."
        >
            <DiagramFrame>
                <EvidenceHeader
                    index={String(figureNumber).padStart(2, "0")}
                    title="Five errors cost almost two points out of ten"
                    note="How much lower 445 recruiters rated the chance of an interview, compared with the same resume without errors."
                />
                <div className="px-5 pb-6 pt-7 md:px-7 md:pb-8">
                    <dl className="grid gap-5">
                        {rows.map((row) => (
                            <div key={row.label} className="grid gap-1.5 sm:grid-cols-[7rem_minmax(0,1fr)] sm:items-center sm:gap-5">
                                <dt className="text-sm font-semibold text-foreground">{row.label}</dt>
                                <dd className="flex min-h-7 items-center gap-3">
                                    {row.drop === 0 ? (
                                        <span className="text-sm text-muted-foreground">The baseline</span>
                                    ) : (
                                        <>
                                            <span className="block h-7 rounded-r-md bg-[hsl(var(--pen))]" style={{ width: `${(row.drop / axisMax) * 100}%` }} aria-hidden="true" />
                                            <span className="whitespace-nowrap font-display text-xl font-extrabold tabular-nums tracking-tight text-foreground">
                                                −{row.drop.toFixed(2)}
                                                <span className="ml-1 text-sm font-semibold text-muted-foreground">points</span>
                                            </span>
                                        </>
                                    )}
                                </dd>
                            </div>
                        ))}
                    </dl>
                    <div className="mt-4 hidden grid-cols-[7rem_minmax(0,1fr)] gap-5 sm:grid" aria-hidden="true">
                        <span />
                        <div className="relative h-5 border-t border-line">
                            {ticks.map((tick) => (
                                <span key={tick} className="absolute top-1 -translate-x-1/2 text-xs tabular-nums text-muted-foreground" style={{ left: `${(tick / axisMax) * 100}%` }}>
                                    {tick === 0 ? "0" : `−${tick}`}
                                </span>
                            ))}
                        </div>
                    </div>
                    <p className="mt-6 border-t border-line pt-4 text-sm leading-6 text-muted-foreground">
                        Recruiters rated fictional resumes; nobody was actually called. One error on its own wasn&apos;t tested.
                    </p>
                </div>
            </DiagramFrame>
            <DiagramCaption kicker={`Fig. ${figureNumber} / Sterkens et al.`} title="The penalty grew with each extra error. PLOS ONE, 2023, eight occupations." />
        </DiagramFigure>
    );
}
