"use client";

import { DiagramCaption, DiagramFigure, DiagramFrame } from "@/components/shared/diagrams/DiagramPrimitives";
import { EvidenceHeader } from "@/components/shared/diagrams/EvidenceVisuals";
import { Key, Mark, PenNote, UnitGrid, useSeen, type UnitTone } from "@/components/research/figures/FigureKit";

// Harvard Business School & Burning Glass Institute (2024): firms that dropped degree requirements, by what happened next.
// The report's shares are approximate ("37 percent", "approximately 45%", "approximately one-fifth"); shown here as 37 / 45 / 18 of 100.
const toneAt = (index: number): UnitTone => (index < 37 ? "pen" : index < 82 ? "quiet" : "faint");

export function SkillsPromiseRealityDiagram({ figureNumber = 1 }: { figureNumber?: number }) {
    const { ref, seen } = useSeen<HTMLDivElement>();
    return (
        <DiagramFigure
            className="max-w-[54rem]"
            label="A grid of 100 firms that dropped degree requirements: 37 changed who they hired, about 45 changed in name only, and about 18 made gains that later reversed."
        >
            <DiagramFrame>
                <EvidenceHeader
                    index={String(figureNumber).padStart(2, "0")}
                    title="Dropping the degree often didn't change the hiring"
                    note="Every 100 firms that removed a degree requirement, by what happened to their hiring afterward."
                />
                <div ref={ref} className="grid gap-8 px-5 py-7 md:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] md:items-center md:px-7">
                    <UnitGrid count={100} columns={10} seen={seen} toneAt={toneAt} className="max-w-[17rem]" />
                    <div className="grid gap-5">
                        <div className="grid gap-2">
                            <Key tone="pen">37 hired more people without degrees</Key>
                            <Key tone="quiet">About 45 changed the posting, not the hiring</Key>
                            <Key tone="faint">About 18 hired more at first, then fewer</Key>
                        </div>
                        <PenNote>
                            The posting says skills. <Mark seen={seen}>The hiring often still says degree.</Mark> Write your skills as things you did, with results.
                        </PenNote>
                    </div>
                </div>
                <p className="border-t border-line px-5 py-4 text-sm text-muted-foreground md:px-7">
                    The report rounds these shares, so the grid shows them to the nearest firm.
                </p>
            </DiagramFrame>
            <DiagramCaption kicker={`Fig. ${figureNumber} / HBS & Burning Glass Institute`} title="Skills-Based Hiring: The Long Road from Pronouncements to Practice, 2024." />
        </DiagramFigure>
    );
}
