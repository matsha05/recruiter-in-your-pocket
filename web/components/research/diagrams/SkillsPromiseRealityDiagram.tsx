"use client";

import { DiagramCaption, DiagramFigure, DiagramFrame } from "@/components/shared/diagrams/DiagramPrimitives";
import { ComparisonField, EvidenceHeader } from "@/components/shared/diagrams/EvidenceVisuals";

export function SkillsPromiseRealityDiagram() {
    return (
        <DiagramFigure className="max-w-[47rem]" label="Comparison between skills-first hiring promises and observed hiring practices">
            <DiagramFrame>
                <EvidenceHeader index="01" label="Policy and practice" title="Removing a degree requirement is not the same as changing who gets hired." note="In the 2024 HBS and Burning Glass analysis, nearly all observed hiring change came from 37% of the firms that removed degree requirements." />
                <ComparisonField
                    left={{ eyebrow: "Policy change", title: "Degree requirements removed", tone: "insight", items: ["A degree is no longer a stated requirement", "More applicants meet the written requirements"] }}
                    right={{ eyebrow: "Hiring outcomes", title: "Results varied by employer", tone: "quiet", items: ["Some firms hired more workers without degrees", "Others showed little change or gains that later reversed"] }}
                    verdict={<><strong className="text-foreground">For your resume:</strong> name the relevant skill, then show where you used it and what changed.</>}
                />
            </DiagramFrame>
            <DiagramCaption kicker="Fig. 1 / Policy versus practice" title="In this study, changed job requirements did not consistently lead to changed hiring." description="Harvard Business School and Burning Glass Institute (2024)." />
        </DiagramFigure>
    );
}
