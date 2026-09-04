"use client";

import { DiagramCaption, DiagramFigure, DiagramFrame } from "@/components/shared/diagrams/DiagramPrimitives";
import { EvidenceHeader, EvidenceTable } from "@/components/shared/diagrams/EvidenceVisuals";

export function ErrorImpactDiagram({ figureNumber = 1 }: { figureNumber?: number }) {
    return (
        <DiagramFigure className="max-w-[46rem]" label="Differences in hypothetical interview ratings on a zero-to-ten scale">
            <DiagramFrame>
                <EvidenceHeader index={String(figureNumber).padStart(2, "0")} label="Observed rating differences" title="Two and five errors both lowered interview ratings." note="445 recruiters rated fictitious graduate resumes across eight occupations." />
                <EvidenceTable columns={["Spelling errors", "Change in 0–10 interview rating"]} rows={[
                    { label: "0 errors", values: ["Reference group"] },
                    { label: "2 errors", values: ["−0.73 points"], emphasis: 0 },
                    { label: "5 errors", values: ["−1.85 points"], emphasis: 0 },
                ]} />
                <p className="border-t border-line px-5 py-4 text-xs leading-5 text-muted-foreground md:px-7">Compared with error-free resumes. These are hypothetical interview ratings, not observed callback rates. A single error was not tested.</p>
            </DiagramFrame>
            <DiagramCaption kicker={`Fig. ${figureNumber} / Measured differences`} title="The larger penalty occurred with five errors." description="Sterkens et al., PLOS ONE (2023), Table 4." />
        </DiagramFigure>
    );
}
