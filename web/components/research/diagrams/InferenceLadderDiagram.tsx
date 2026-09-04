"use client";

import { DiagramCaption, DiagramFigure, DiagramFrame } from "@/components/shared/diagrams/DiagramPrimitives";
import { EvidenceHeader, EvidenceTable } from "@/components/shared/diagrams/EvidenceVisuals";

export function InferenceLadderDiagram({ figureNumber = 1 }: { figureNumber?: number }) {
    return (
        <DiagramFigure className="max-w-[46rem]" label="Applicant perceptions rated lower when resumes contained two or five spelling errors">
            <DiagramFrame>
                <EvidenceHeader index={String(figureNumber).padStart(2, "0")} label="Perceptions measured" title="Errors also changed impressions of the applicant." note="Recruiters rated three areas lower with two or five spelling errors." />
                <EvidenceTable columns={["Perception", "What recruiters were asked to judge"]} rows={[
                    { label: "Interpersonal skills", values: ["Communication and working with others"] },
                    { label: "Conscientiousness", values: ["Care, organization, and responsibility"] },
                    { label: "Mental abilities", values: ["Learning, problem-solving, and knowledge"] },
                ]} />
            </DiagramFrame>
            <DiagramCaption kicker={`Fig. ${figureNumber} / Recruiter perceptions`} title="These are impressions, not measured job performance." description="Sterkens et al., PLOS ONE (2023), Sections 2.3 and 3.3." />
        </DiagramFigure>
    );
}
