"use client";

import { DiagramCaption, DiagramFigure, DiagramFrame } from "@/components/shared/diagrams/DiagramPrimitives";
import { ComparisonField, EvidenceHeader } from "@/components/shared/diagrams/EvidenceVisuals";

export function SkillsPromiseRealityDiagram() {
    return (
        <DiagramFigure className="max-w-[47rem]" label="Comparison between skills-first hiring promises and observed hiring practices">
            <DiagramFrame>
                <EvidenceHeader index="01" label="Policy and practice" title="Removing a degree requirement is not the same as changing who gets hired." note="In the 2024 HBS and Burning Glass analysis, nearly all observed hiring change came from 37% of the firms that removed degree requirements." />
                <ComparisonField
                    left={{ eyebrow: "What hiring promises", title: "Ability over pedigree", tone: "teal", items: ["Skills matter more than degrees", "Potential widens the talent pool", "Demonstrated ability should lead"] }}
                    right={{ eyebrow: "What practice still does", title: "Old proxies remain", tone: "quiet", items: ["Degree screens persist", "Familiar titles still reassure", "Adoption trails stated intent"] }}
                    verdict={<><strong className="text-foreground">Write for both:</strong> name the relevant skill, then show where you used it and what changed.</>}
                />
            </DiagramFrame>
            <DiagramCaption kicker="Fig. 1 / Policy versus practice" title="The promise is real. The hiring change is still concentrated in a minority of employers." description="Harvard Business School and Burning Glass Institute (2024)." />
        </DiagramFigure>
    );
}
