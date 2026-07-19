"use client";

import { DiagramCaption, DiagramFigure, DiagramFrame } from "@/components/shared/diagrams/DiagramPrimitives";
import { EvidenceHeader, EvidenceTable } from "@/components/shared/diagrams/EvidenceVisuals";

export function ReferralQuantifiedDiagram() {
    return (
        <DiagramFigure className="max-w-[46rem]" label="Study-specific comparison of referred and non-referred candidate outcomes">
            <DiagramFrame>
                <EvidenceHeader index="01" label="What the experiments found" title="Referrals carried information about performance and persistence." note="Three field experiments in one online labor market; these are observed differences in that setting, not universal hiring rates." />
                <EvidenceTable columns={["Observed outcome", "Difference", "What it suggests"]} rows={[
                    { label: "Submitted work on time", values: ["+11 percentage points", "Referrals contained information about follow-through"], emphasis: 0 },
                    { label: "Continued the job", values: ["+20 percentage points", "Referrals contained information about persistence"], emphasis: 0 },
                    { label: "Job performance", values: ["Higher", "The signal extended beyond visible worker characteristics"], emphasis: 0 },
                ]} />
                <p className="border-t border-line px-5 py-4 text-xs leading-5 text-muted-foreground md:px-7">Pallais &amp; Sands studied 1,266 workers in an online labor market. Role, company, relationship strength, and labor conditions can materially change the effect.</p>
            </DiagramFrame>
            <DiagramCaption kicker="Fig. 1 / The observed difference" title="A useful referral can reveal information a resume does not carry." description="Pallais & Sands, Journal of Political Economy (2016); summary by J-PAL." />
        </DiagramFigure>
    );
}
