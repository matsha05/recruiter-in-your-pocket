"use client";

import { DiagramCaption, DiagramFigure, DiagramFrame } from "@/components/shared/diagrams/DiagramPrimitives";
import { ComparisonField, EvidenceHeader } from "@/components/shared/diagrams/EvidenceVisuals";

export function RecruiterSearchDiagram() {
    return (
        <DiagramFigure className="max-w-[46rem]" label="What is publicly known and unknown about recruiter search">
            <DiagramFrame>
                <EvidenceHeader index="01" label="What we know" title="LinkedIn explains some search features, not its full ranking system." note="We can use published documentation and studies. We cannot honestly promise a secret way to rank first." />
                <ComparisonField
                    left={{ eyebrow: "Published or observable", title: "What we can support", tone: "insight", items: ["Platform scale and activity", "Recruiter usage surveys", "Skills-first sourcing findings"] }}
                    right={{ eyebrow: "Not disclosed", title: "What remains unknown", tone: "quiet", items: ["Exact ranking weights", "Search-scoring logic", "The complete visibility model"] }}
                    verdict={<><strong className="text-foreground">The useful advice:</strong> use accurate role language and complete your profile. Ignore anyone promising a secret ranking formula.</>}
                />
            </DiagramFrame>
            <DiagramCaption kicker="Fig. 1 / What is public" title="Good advice stops where the public evidence stops." />
        </DiagramFigure>
    );
}
