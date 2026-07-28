"use client";

import { DiagramCaption, DiagramFigure, DiagramFrame } from "@/components/shared/diagrams/DiagramPrimitives";
import { EvidenceHeader, SequenceTrace } from "@/components/shared/diagrams/EvidenceVisuals";

export function InferenceLadderDiagram({ figureNumber = 1 }: { figureNumber?: number }) {
    return (
        <DiagramFigure className="max-w-[41rem]" label="Ladder showing how a visible resume error can become a screening judgment">
            <DiagramFrame>
                <EvidenceHeader index={String(figureNumber).padStart(2, "0")} label="How a typo becomes a judgment" title="A reader sees one mistake and may assume much more." note="The typo is visible. The conclusions about care or writing ability are assumptions." />
                <SequenceTrace steps={[
                    { label: "Observed", title: "Error spotted", detail: "The one thing the reviewer actually knows.", tone: "risk" },
                    { label: "Assumed", title: "Low attention to detail", detail: "A trait is inferred from a single signal.", tone: "caution" },
                    { label: "Assessed", title: "Higher execution risk", detail: "The assumption becomes a prediction about future work.", tone: "caution" },
                    { label: "Applied", title: "A stricter screen", detail: "The candidate now has more doubt to overcome.", tone: "risk" },
                ]} />
            </DiagramFrame>
            <DiagramCaption kicker={`Fig. ${figureNumber} / From error to assumption`} title="One visible mistake can shape how the rest of the resume is read." />
        </DiagramFigure>
    );
}
