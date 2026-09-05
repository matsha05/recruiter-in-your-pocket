"use client";

import { DiagramCaption, DiagramFigure, DiagramFrame } from "@/components/shared/diagrams/DiagramPrimitives";
import { EvidenceHeader, ProcessRail } from "@/components/shared/diagrams/EvidenceVisuals";

export function ATSFunnel() {
    return (
        <DiagramFigure className="max-w-[46rem]" label="Examples of parsing, filtering, and review tools documented by Greenhouse">
            <DiagramFrame>
                <EvidenceHeader index="01" label="Example: Greenhouse" title="Parsing, filtering, and review are different steps." note="Greenhouse documents tools for each. How an employer uses them depends on its hiring process." />
                <ProcessRail
                    steps={[
                        { label: "Parsing", title: "Fill in the record", detail: "Extract information from the resume into candidate fields." },
                        { label: "Filtering", title: "Find applications", detail: "Filter by status, source, education, or application fields.", tone: "caution" },
                        { label: "Review", title: "Track assessments", detail: "Record interviews, scorecards, and test results.", tone: "focus" },
                        { label: "Decision", title: "Manage next steps", detail: "Track applications awaiting a decision or an offer.", tone: "focus" },
                    ]}
                    footer={<><strong className="text-foreground">Write for both:</strong> use a layout the software can read, then make the experience clear to the person reviewing it.</>}
                />
            </DiagramFrame>
            <DiagramCaption kicker="Fig. 1 / Software and process" title="These tools do not establish one universal ATS score or rejection rule." description="Greenhouse Support: resume parsing and candidate filters." />
        </DiagramFigure>
    );
}
