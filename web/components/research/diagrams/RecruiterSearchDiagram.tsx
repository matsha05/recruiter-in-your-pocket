"use client";

import { DiagramCaption, DiagramFigure, DiagramFrame } from "@/components/shared/diagrams/DiagramPrimitives";
import { ComparisonField, EvidenceHeader } from "@/components/shared/diagrams/EvidenceVisuals";

export function RecruiterSearchDiagram({ figureNumber = 1 }: { figureNumber?: number }) {
    return (
        <DiagramFigure className="max-w-[46rem]" label="What is publicly known and unknown about recruiter search">
            <DiagramFrame>
                <EvidenceHeader index={String(figureNumber).padStart(2, "0")} label="What is public" title="LinkedIn does not disclose its full ranking system." note="Published documentation explains some search features. It does not tell us exactly where a profile will appear." />
                <ComparisonField
                    left={{ eyebrow: "Published or observable", title: "What we can support", tone: "insight", items: ["Platform scale and activity", "Recruiter usage surveys", "Skills-first sourcing findings"] }}
                    right={{ eyebrow: "Not disclosed", title: "What remains unknown", tone: "quiet", items: ["Exact ranking weights", "Search-scoring logic", "The complete visibility model"] }}
                    verdict={<><strong className="text-foreground">What you can do:</strong> describe your roles and skills accurately, and fill in relevant profile sections. No wording guarantees a search position.</>}
                />
            </DiagramFrame>
            <DiagramCaption kicker={`Fig. ${figureNumber} / What is public`} title="Platform documentation and usage studies answer different questions about recruiter search." />
        </DiagramFigure>
    );
}
