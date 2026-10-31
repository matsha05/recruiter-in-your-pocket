"use client";

import { DiagramCaption, DiagramFigure, DiagramFrame } from "@/components/shared/diagrams/DiagramPrimitives";
import { EvidenceHeader } from "@/components/shared/diagrams/EvidenceVisuals";

// Ashby, "Are referred candidates more likely to get hired?" (May 2025): offer rates by source, Q3 2021 and Q4 2024.
// The "1 in N" figures are our arithmetic (100 / offer rate), rounded; Ashby publishes only the percentages.
const rows = [
    { source: "Referred", start: 12.1, end: 7.3 },
    { source: "Applied cold", start: 0.7, end: 0.2 },
];

function oneIn(rate: number) {
    const n = 100 / rate;
    return n >= 100 ? Math.round(n / 10) * 10 : Math.round(n);
}

export function ReferralOfferOddsDiagram({ figureNumber = 2 }: { figureNumber?: number }) {
    return (
        <DiagramFigure
            className="max-w-[46rem]"
            label="Offer odds by source. Referred applicants: about 1 in 8 got an offer in late 2021 and about 1 in 14 in late 2024. Cold applicants: about 1 in 140, then about 1 in 500."
        >
            <DiagramFrame>
                <EvidenceHeader
                    index={String(figureNumber).padStart(2, "0")}
                    title="Cold applications lost far more ground"
                    note="How many applicants it took to produce one offer."
                />
                <div className="px-5 pb-6 pt-6 md:px-7 md:pb-8">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-baseline gap-x-6 gap-y-4 sm:gap-x-10">
                        <span />
                        <span className="text-right text-sm text-muted-foreground">Late 2021</span>
                        <span className="text-right text-sm text-muted-foreground">Late 2024</span>
                        {rows.map((row) => (
                            <div key={row.source} className="contents">
                                <span className="border-t border-line pt-4 text-sm font-semibold text-foreground">{row.source}</span>
                                <span className="border-t border-line pt-4 text-right">
                                    <span className="font-display text-2xl font-extrabold tabular-nums tracking-tight text-muted-foreground">1 in {oneIn(row.start)}</span>
                                    <span className="mt-0.5 block text-xs tabular-nums text-muted-foreground">{row.start}% got offers</span>
                                </span>
                                <span className="border-t border-line pt-4 text-right">
                                    <span className={row.source === "Referred" ? "font-display text-2xl font-extrabold tabular-nums tracking-tight text-[hsl(var(--pen))]" : "font-display text-2xl font-extrabold tabular-nums tracking-tight text-foreground"}>1 in {oneIn(row.end)}</span>
                                    <span className="mt-0.5 block text-xs tabular-nums text-muted-foreground">{row.end}% got offers</span>
                                </span>
                            </div>
                        ))}
                    </div>
                    <p className="mt-6 border-t border-line pt-4 text-sm leading-6 text-muted-foreground">
                        Ashby publishes the percentages. The &ldquo;1 in&rdquo; figures are our arithmetic from them, rounded. The cold-application rates are small and already rounded, so treat those two as approximate.
                    </p>
                </div>
            </DiagramFrame>
            <DiagramCaption kicker={`Fig. ${figureNumber} / Ashby hiring data`} title="Both got harder. Applying cold got much harder. More than 38 million applications, 2021 to 2024." />
        </DiagramFigure>
    );
}
