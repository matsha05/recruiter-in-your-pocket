"use client";

import { DiagramCaption, DiagramFigure, DiagramFrame } from "@/components/shared/diagrams/DiagramPrimitives";
import { EvidenceHeader } from "@/components/shared/diagrams/EvidenceVisuals";
import { Figure, Mark, PenNote, UnitGrid, useSeen } from "@/components/research/figures/FigureKit";

// Ashby, "Are referred candidates more likely to get hired?" (May 2025): offer rates by source, Q4 2024.
// Referred 7.3% → about 1 offer per 14 applicants; inbound 0.2% → about 1 per 500. "1 in N" is our arithmetic.

export function ReferralOfferOddsDiagram({ figureNumber = 2 }: { figureNumber?: number }) {
    const { ref, seen } = useSeen<HTMLDivElement>();
    return (
        <DiagramFigure
            className="max-w-[54rem]"
            label="Dot fields. In late 2024, about 1 in 14 referred applicants got an offer, shown as 14 dots with one highlighted. About 1 in 500 cold applicants did, shown as 500 dots with one highlighted."
        >
            <DiagramFrame>
                <EvidenceHeader
                    index={String(figureNumber).padStart(2, "0")}
                    title="One offer. Count the applicants behind it."
                    note="Each dot is one applicant. The highlighted dot got the offer. Late 2024."
                />
                <div ref={ref} className="grid gap-px bg-line md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
                    <section className="flex flex-col gap-5 bg-card px-5 py-6 md:px-7" aria-label="Referred applicants">
                        <div>
                            <p className="text-sm font-semibold text-foreground">Referred</p>
                            <Figure value="1 in 14" className="mt-1 block" />
                        </div>
                        <UnitGrid count={14} columns={7} seen={seen} className="max-w-[9.5rem]" toneAt={(i) => (i === 0 ? "mark" : "pen")} />
                        <PenNote className="mt-auto">Fourteen people. Small enough that every one of them gets read.</PenNote>
                    </section>
                    <section className="flex flex-col gap-5 bg-card px-5 py-6 md:px-7" aria-label="Cold applicants">
                        <div>
                            <p className="text-sm font-semibold text-foreground">Applied cold</p>
                            <Figure value="1 in 500" className="mt-1 block" />
                        </div>
                        <UnitGrid count={500} columns={25} seen={seen} toneAt={(i) => (i === 0 ? "mark" : "quiet")} />
                        <p className="text-sm text-muted-foreground">
                            In late 2021 it was about 1 in 8 referred and 1 in 140 cold. Both got harder. <Mark seen={seen}>Cold got far harder.</Mark>
                        </p>
                    </section>
                </div>
                <p className="border-t border-line px-5 py-4 text-sm text-muted-foreground md:px-7">
                    Ashby publishes the offer rates (7.3% referred, 0.2% cold). The &ldquo;1 in&rdquo; counts are our arithmetic, rounded; the cold rate is itself rounded, so treat 500 as approximate.
                </p>
            </DiagramFrame>
            <DiagramCaption kicker={`Fig. ${figureNumber} / Ashby hiring data`} title="More than 38 million applications, 2021 to 2024." />
        </DiagramFigure>
    );
}
