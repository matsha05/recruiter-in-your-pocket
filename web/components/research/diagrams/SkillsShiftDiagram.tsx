"use client";

import { DiagramCaption, DiagramFigure, DiagramFrame } from "@/components/shared/diagrams/DiagramPrimitives";
import { ComparisonField, EvidenceHeader } from "@/components/shared/diagrams/EvidenceVisuals";

export function SkillsShiftDiagram() {
    return (
        <DiagramFigure className="max-w-[45rem]" label="Comparison between credential-based and skills-based hiring signals">
            <DiagramFrame>
                <EvidenceHeader index="01" label="What skills-first changes" title="Employers look beyond credentials for proof you can do the work." note="The change is not simply removing degree requirements. It is giving demonstrated skills more weight." />
                <ComparisonField
                    left={{ eyebrow: "Traditional signal", title: "Credential as proxy", tone: "quiet", items: ["Degree required", "Years used as shorthand", "Pedigree stands in for proof"] }}
                    right={{ eyebrow: "Emerging signal", title: "Evidence of capability", tone: "insight", items: ["Skills demonstrated", "Relevant outcomes shown", "Portfolio or work sample attached"] }}
                    verdict="Skills-first hiring broadens the pool only when employers actually evaluate skills instead of quietly relying on the same old filters."
                />
            </DiagramFrame>
            <DiagramCaption kicker="Fig. 1 / Skills-first hiring" title="Show the skill, where you used it, and what happened as a result." />
        </DiagramFigure>
    );
}
