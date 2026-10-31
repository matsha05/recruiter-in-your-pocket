"use client";

import { DiagramCaption, DiagramFigure, DiagramFrame } from "@/components/shared/diagrams/DiagramPrimitives";
import { EvidenceHeader } from "@/components/shared/diagrams/EvidenceVisuals";

// Ghayad (2013), Table A.5: share of fictitious resumes that got an interview request, by time out of work and industry experience.
const rows = [
    { status: "Still employed", same: 14.67, different: 5.83 },
    { status: "Out 1–3 months", same: 16.11, different: 8.33 },
    { status: "Out 4–6 months", same: 12.22, different: 4.17 },
    { status: "Out 7+ months", same: 1.94, different: 0.56 },
];
const axisMax = 18;
const ticks = [0, 5, 10, 15];

function Bar({ value, tone }: { value: number; tone: "same" | "different" }) {
    return (
        <span className="flex items-center gap-2.5">
            <span
                className={tone === "same" ? "block h-5 min-w-1 rounded-r-md bg-[hsl(var(--pen))]" : "block h-5 min-w-1 rounded-r-md bg-[hsl(var(--text-strong)/0.18)]"}
                style={{ width: `${(value / axisMax) * 100}%` }}
                aria-hidden="true"
            />
            <span className={tone === "same" ? "whitespace-nowrap text-sm font-bold text-foreground" : "whitespace-nowrap text-sm text-muted-foreground"}>
                {value < 1 ? value.toFixed(1) : Math.round(value)}%
            </span>
        </span>
    );
}

export function GapPivotDiagram({ figureNumber = 1 }: { figureNumber?: number }) {
    return (
        <DiagramFigure
            className="max-w-[46rem]"
            label="Bar chart of interview requests. With experience in the same industry: 15% while employed, 16% after 1 to 3 months out, 12% after 4 to 6 months, 2% after 7 or more. From a different industry: 6%, 8%, 4%, and under 1%."
        >
            <DiagramFrame>
                <EvidenceHeader
                    index={String(figureNumber).padStart(2, "0")}
                    title="After six months out, even the right experience stopped helping"
                    note="Share of fictitious resumes that got an interview request, by time out of work."
                />
                <div className="px-5 pb-6 pt-6 md:px-7 md:pb-8">
                    <div className="mb-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground" aria-hidden="true">
                        <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-[hsl(var(--pen))]" />Experience in the same industry</span>
                        <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-[hsl(var(--text-strong)/0.18)]" />Experience in a different industry</span>
                    </div>
                    <dl className="grid gap-5">
                        {rows.map((row) => (
                            <div key={row.status} className="grid gap-1.5 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:items-center sm:gap-5">
                                <dt className="text-sm font-semibold text-foreground">{row.status}</dt>
                                <dd className="grid gap-1.5">
                                    <Bar value={row.same} tone="same" />
                                    <Bar value={row.different} tone="different" />
                                </dd>
                            </div>
                        ))}
                    </dl>
                    <div className="mt-4 hidden grid-cols-[8.5rem_minmax(0,1fr)] gap-5 sm:grid" aria-hidden="true">
                        <span />
                        <div className="relative h-5 border-t border-line">
                            {ticks.map((tick) => (
                                <span key={tick} className="absolute top-1 -translate-x-1/2 text-xs text-muted-foreground" style={{ left: `${(tick / axisMax) * 100}%` }}>{tick}%</span>
                            ))}
                        </div>
                    </div>
                    <p className="mt-6 border-t border-line pt-4 text-sm leading-6 text-muted-foreground">
                        About 3,360 resumes sent to 600 US job ads. Each bar after &ldquo;Still employed&rdquo; is 360 resumes, so the smallest differences are rough.
                    </p>
                </div>
            </DiagramFrame>
            <DiagramCaption kicker={`Fig. ${figureNumber} / Ghayad`} title="Switching industries roughly halved the response. A long gap nearly erased it. Unpublished working paper, 2013." />
        </DiagramFigure>
    );
}
