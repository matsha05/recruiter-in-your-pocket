"use client";

import { DiagramCaption, DiagramFigure, DiagramFrame } from "@/components/shared/diagrams/DiagramPrimitives";
import { EvidenceHeader, EvidenceTable } from "@/components/shared/diagrams/EvidenceVisuals";

export function TrustChoiceGrid() {
    return (
        <DiagramFigure className="max-w-[43rem]" label="Comparison of trust responses to human and algorithmic judgment">
            <DiagramFrame>
                <EvidenceHeader index="01" label="When advice gets it wrong" title="People are often less forgiving of an automated mistake." note="A human can explain or correct an error. A system that does not explain itself can be harder to trust again." />
                <EvidenceTable columns={["Dimension", "Human judgment", "Algorithmic judgment"]} rows={[
                    { label: "Initial trust", values: ["Higher", "Lower"], emphasis: 0 },
                    { label: "Error tolerance", values: ["More forgiving", "Less forgiving"], emphasis: 0 },
                    { label: "Recovery after error", values: ["Easier", "Harder"], emphasis: 0 },
                    { label: "Explainability", values: ["More intuitive", "Often opaque"], emphasis: 0 },
                ]} />
            </DiagramFrame>
            <DiagramCaption kicker="Fig. 1 / Trust after an error" title="Unexplained automated mistakes can damage trust quickly." />
        </DiagramFigure>
    );
}
