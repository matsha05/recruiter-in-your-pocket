"use client";

import { DiagramCaption, DiagramFigure, DiagramFrame } from "@/components/shared/diagrams/DiagramPrimitives";
import { EvidenceHeader, FrameworkStrip } from "@/components/shared/diagrams/EvidenceVisuals";

export function ImpactFormulaDiagram() {
    return (
        <DiagramFigure className="max-w-[43rem]" label="Framework for writing a resume bullet using result, scale, and method">
            <DiagramFrame>
                <EvidenceHeader index="01" label="One way to write a bullet" title="Explain the result and how you achieved it." note="Use a number when it helps explain the result. Include only details you can support." />
                <FrameworkStrip
                    connector="+"
                    steps={[
                        { symbol: "X", label: "Result", detail: "What changed because of your work.", focus: true },
                        { symbol: "Y", label: "Scale", detail: "A number or detail that gives the result context." },
                        { symbol: "Z", label: "Method", detail: "What you did to create the result." },
                    ]}
                    example={<><span className="riyp-evidence-label text-brand">Illustrative example</span><p className="mt-2 font-display text-xl leading-snug text-foreground">Cut onboarding time 32% by coordinating training across product, sales, and support.</p><p className="mt-2 text-xs leading-5 text-muted-foreground">The number and details belong to this example. Use your own verified facts.</p></>}
                />
            </DiagramFrame>
            <DiagramCaption kicker="Fig. 1 / Result + scale + method" title="A useful bullet shows the result and gives the reader the context needed to understand it." />
        </DiagramFigure>
    );
}
