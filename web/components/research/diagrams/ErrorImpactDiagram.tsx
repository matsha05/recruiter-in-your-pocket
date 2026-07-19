"use client";

import { DiagramCaption, DiagramFigure, DiagramFrame } from "@/components/shared/diagrams/DiagramPrimitives";
import { EvidenceHeader, SequenceTrace } from "@/components/shared/diagrams/EvidenceVisuals";

export function ErrorImpactDiagram() {
    return (
        <DiagramFigure className="max-w-[43rem]" label="Inference chain from a resume error to a possible callback penalty">
            <DiagramFrame>
                <EvidenceHeader index="01" label="From typo to judgment" title="A small error can change the reader's impression." note="The mistake may be minor. The reader may still make broader assumptions about care or writing ability." />
                <SequenceTrace steps={[
                    { label: "Observation", title: "An error is spotted", detail: "A typo, grammar mistake, or unexplained inconsistency.", tone: "risk" },
                    { label: "Assumption", title: "The reader assumes carelessness", detail: "One visible mistake shapes how the applicant is judged.", tone: "caution" },
                    { label: "Risk", title: "Confidence drops", detail: "The candidate can begin to feel less reliable or less prepared.", tone: "caution" },
                    { label: "Outcome", title: "The threshold tightens", detail: "In a close comparison, the margin for advancing gets smaller.", tone: "risk" },
                ]} />
            </DiagramFrame>
            <DiagramCaption kicker="Fig. 1 / After the typo" title="The larger effect comes from what the reader assumes the mistake means." />
        </DiagramFigure>
    );
}
