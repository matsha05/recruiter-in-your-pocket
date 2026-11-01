"use client";

import { DiagramCaption, DiagramFigure, DiagramFrame } from "@/components/shared/diagrams/DiagramPrimitives";
import { EvidenceHeader, ProcessRail } from "@/components/shared/diagrams/EvidenceVisuals";

export function AutomationPipeline() {
    return (
        <DiagramFigure className="max-w-[50rem]" label="The four hiring stages Upturn describes, sourcing, screening, interviewing, and selection, and where automated tools can introduce or amplify bias">
            <DiagramFrame>
                <EvidenceHeader index="01" label="Four stages of hiring" title="Bias can enter earlier than the human review." note="Data, rules, and automated filters can all affect who appears in the final group." />
                <ProcessRail
                    steps={[
                        { label: "Sourcing", title: "Who sees the role", detail: "Ad platforms choose who is shown a job ad, partly by predicting who will engage with it.", tone: "caution" },
                        { label: "Screening", title: "Who gets through", detail: "Tools extract and interpret resume text, and knockout questions can reject applicants automatically.", tone: "risk" },
                        { label: "Interviewing", title: "How answers are judged", detail: "Some tools analyze recorded video interviews, which can make a narrow idea of fit look objective.", tone: "risk" },
                        { label: "Selection", title: "Who gets the offer", detail: "Tools rarely make the final call, but every earlier step shaped who is left to choose from.", tone: "caution" },
                    ]}
                    footer={<><strong className="text-brand">Earlier filters matter.</strong> A human reviewer may only see the candidates who made it through every previous step.</>}
                />
            </DiagramFrame>
            <DiagramCaption kicker="Fig. 1 / Upturn, Help Wanted (2018)" title="Stages as Upturn names them. Reviewing the final shortlist alone can miss bias introduced earlier." />
        </DiagramFigure>
    );
}
