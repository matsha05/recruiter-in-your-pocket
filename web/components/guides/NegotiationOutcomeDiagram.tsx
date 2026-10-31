"use client";

import { DiagramCaption, DiagramFigure, DiagramFrame } from "@/components/shared/diagrams/DiagramPrimitives";
import { EvidenceHeader } from "@/components/shared/diagrams/EvidenceVisuals";
import { Key, Mark, PenNote, UnitGrid, useSeen, type UnitTone } from "@/components/research/figures/FigureKit";

// Pew Research Center (April 2023). About 30% of US workers asked for more than the first offer (men 32%, women 28%).
// Of those who asked: 28% got what they asked for, 38% got more but less than asked, 35% got the first offer.
// Scaled to 100 workers and rounded: 8 got it all, 11 got more, 11 got the first offer, 70 didn't ask.
const toneAt = (index: number): UnitTone => (index < 8 ? "mark" : index < 19 ? "pen" : index < 30 ? "quiet" : "faint");

export function NegotiationOutcomeDiagram() {
    const { ref, seen } = useSeen<HTMLDivElement>();
    return (
        <DiagramFigure
            className="max-w-[54rem]"
            label="A grid of 100 workers. 70 didn't ask for more than the first offer. Of the 30 who asked, about 8 got what they asked for, 11 got more but less than they asked, and 11 got the first offer."
        >
            <DiagramFrame>
                <EvidenceHeader
                    index="01"
                    title="Seventy never asked. Most who did got more."
                    note="100 US workers, the last time they were hired. Scaled from a 2023 survey and rounded."
                />
                <div ref={ref} className="grid gap-8 px-5 py-7 md:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] md:items-center md:px-7">
                    <UnitGrid count={100} columns={10} seen={seen} toneAt={toneAt} className="max-w-[17rem]" />
                    <div className="grid gap-5">
                        <div className="grid gap-2">
                            <Key tone="mark">8 got what they asked for</Key>
                            <Key tone="pen">11 got more, but less than they asked</Key>
                            <Key tone="quiet">11 got the first offer</Key>
                            <Key tone="faint">70 didn&apos;t ask</Key>
                        </div>
                        <PenNote>
                            Of the 30 who asked, <Mark seen={seen}>19 walked away with more.</Mark> The biggest loss in this picture is the 70 who never asked.
                        </PenNote>
                    </div>
                </div>
                <p className="border-t border-line px-5 py-4 text-sm leading-6 text-muted-foreground md:px-7">
                    Self-reported. The survey didn&apos;t ask how big the increase was, or whether anyone lost an offer by asking.
                </p>
            </DiagramFrame>
            <DiagramCaption kicker="Fig. 1 / Pew Research Center" title="5,188 US workers, 2023." />
        </DiagramFigure>
    );
}
