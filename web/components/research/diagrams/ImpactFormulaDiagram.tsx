"use client";

import { DiagramCaption, DiagramFigure, DiagramFrame } from "@/components/shared/diagrams/DiagramPrimitives";
import { EvidenceHeader, FrameworkStrip } from "@/components/shared/diagrams/EvidenceVisuals";

export function ImpactFormulaDiagram() {
    return (
        <DiagramFigure className="max-w-[43rem]" label="Framework for writing a resume bullet using result, scale, and method">
            <DiagramFrame>
                <EvidenceHeader index="01" label="Writing a stronger bullet" title="What changed, the scale, and how you did it." note="Lead with the result. Add only details you can verify." />
                <FrameworkStrip
                    connector="+"
                    steps={[
                        { symbol: "X", label: "Result", detail: "What changed because of your work.", focus: true },
                        { symbol: "Y", label: "Scale", detail: "A number or detail that gives the result context." },
                        { symbol: "Z", label: "Method", detail: "What you did to create the result." },
                    ]}
                    example={<><span className="riyp-evidence-label text-brand">In practice</span><p className="mt-2 font-display text-xl leading-snug text-foreground">Cut onboarding time 32% by aligning product, sales, and support.</p></>}
                />
            </DiagramFrame>
            <DiagramCaption kicker="Fig. 1 / Result + scale + method" title="A useful bullet shows the result and gives the reader the context needed to understand it." />
        </DiagramFigure>
    );
}
