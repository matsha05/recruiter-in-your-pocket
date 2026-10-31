"use client";

import { DiagramCaption, DiagramFigure, DiagramFrame } from "@/components/shared/diagrams/DiagramPrimitives";
import { ComparisonField, EvidenceHeader } from "@/components/shared/diagrams/EvidenceVisuals";

export function RecruiterSearchDiagram({ figureNumber = 1 }: { figureNumber?: number }) {
    return (
        <DiagramFigure className="max-w-[46rem]" label="What is publicly known and unknown about recruiter search">
            <DiagramFrame>
                <EvidenceHeader index={String(figureNumber).padStart(2, "0")} title="What LinkedIn says, and what it doesn't." />
                <ComparisonField
                    left={{ eyebrow: "In LinkedIn's help pages", title: "What we can support", tone: "insight", items: ["Recruiters can filter by title and skill", "The Skills filter reads your headline, titles, summary, and experience", "Shared resume details can count in some cases"] }}
                    right={{ eyebrow: "Not disclosed", title: "What remains unknown", tone: "quiet", items: ["How results are ranked", "How much each section counts"] }}
                    verdict={<><strong className="text-foreground">What you can do:</strong> use the titles and skills a recruiter would search for, wherever they honestly describe your work.</>}
                />
            </DiagramFrame>
            <DiagramCaption kicker={`Fig. ${figureNumber} / LinkedIn Recruiter Help`} title="The words on your profile are searchable. The ranking isn't public." />
        </DiagramFigure>
    );
}
