"use client";

import { DiagramCaption, DiagramFigure, DiagramFrame } from "@/components/shared/diagrams/DiagramPrimitives";
import { EvidenceHeader, EvidenceTable } from "@/components/shared/diagrams/EvidenceVisuals";

export function MetaTimeline() {
    return (
        <DiagramFigure className="max-w-[50rem]" label="Timeline summarizing a meta-analysis of US hiring discrimination field experiments from 1989 through 2015">
            <DiagramFrame>
                <EvidenceHeader index="01" label="What the meta-analysis found" title="The overall callback gap persisted, but the trend differed by group." note="The authors synthesized 28 US field experiments representing 55,842 applications to 26,326 positions. Trend analysis focused on 24 studies conducted since 1989." />
                <EvidenceTable columns={["Finding", "Observed result", "Time trend"]} rows={[
                    { label: "Black applicants", values: ["White applicants received 36% more callbacks on average", "No significant decline detected since 1989"], emphasis: 0 },
                    { label: "Latino applicants", values: ["White applicants received 24% more callbacks on average", "Modest evidence of decline"], emphasis: 0 },
                    { label: "Study scale", values: ["28 experiments · 55,842 applications", "Fieldwork through 2015"] },
                ]} />
            </DiagramFrame>
            <DiagramCaption kicker="Fig. 1 / Persistence over time" title="The long-run result is not a universal decline; the trends differ by group." description="Quillian et al. (2017), US field experiments with fieldwork through December 2015." />
        </DiagramFigure>
    );
}
