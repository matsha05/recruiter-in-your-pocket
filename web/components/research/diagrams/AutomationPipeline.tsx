"use client";

import { DiagramCaption, DiagramFigure, DiagramFrame } from "@/components/shared/diagrams/DiagramPrimitives";
import { EvidenceHeader, ProcessRail } from "@/components/shared/diagrams/EvidenceVisuals";

export function AutomationPipeline() {
    return (
        <DiagramFigure className="max-w-[50rem]" label="Hiring pipeline showing where automation can introduce or amplify bias">
            <DiagramFrame>
                <EvidenceHeader index="01" label="Before a person reviews the resume" title="Bias can enter earlier than the human review." note="Data, rules, and automated filters can all affect who appears in the final group." />
                <ProcessRail
                    steps={[
                        { label: "Sourcing", title: "Who sees the role", detail: "Ad delivery can affect who learns about the opening.", tone: "caution" },
                        { label: "Parsing", title: "What gets extracted", detail: "A parser can miss or misread information in some layouts.", tone: "caution" },
                        { label: "Ranking", title: "Who gets prioritized", detail: "Using gaps, schools, or titles as shortcuts can repeat past biases.", tone: "risk" },
                        { label: "Assessment", title: "Who advances", detail: "Automated scoring can make a narrow definition of fit look objective.", tone: "risk" },
                    ]}
                    footer={<><strong className="text-[hsl(var(--annotation))]">Earlier filters matter.</strong> A human reviewer may only see the candidates who made it through every previous step.</>}
                />
            </DiagramFrame>
            <DiagramCaption kicker="Fig. 1 / Before the human review" title="Reviewing the final shortlist alone can miss bias introduced earlier." />
        </DiagramFigure>
    );
}
