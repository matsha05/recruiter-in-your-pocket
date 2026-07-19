"use client";

import { DiagramCaption, DiagramFigure, DiagramFrame } from "@/components/shared/diagrams/DiagramPrimitives";
import { EvidenceHeader, FrameworkStrip } from "@/components/shared/diagrams/EvidenceVisuals";

export function StarStructureDiagram() {
    return (
        <DiagramFigure className="max-w-[46rem]" label="STAR framework showing situation, task, action, and result">
            <DiagramFrame>
                <EvidenceHeader index="01" label="A clear example" title="Give the context briefly. Spend more time on what you did and what changed." note="STAR is useful when it keeps the story complete without letting the setup take over." />
                <FrameworkStrip connector="→" steps={[
                    { symbol: "S", label: "Situation", detail: "Give only the context the listener needs." },
                    { symbol: "T", label: "Task", detail: "Name the responsibility or constraint." },
                    { symbol: "A", label: "Action", detail: "Be specific about what you owned." },
                    { symbol: "R", label: "Result", detail: "Close with what changed and how you know.", focus: true },
                ]} />
            </DiagramFrame>
            <DiagramCaption kicker="Fig. 1 / STAR" title="Context makes the example understandable. Action and result show your contribution." />
        </DiagramFigure>
    );
}
