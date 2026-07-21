"use client";

import { DiagramCaption, DiagramFigure, DiagramFrame } from "@/components/shared/diagrams/DiagramPrimitives";
import { EvidenceHeader, EvidenceTable } from "@/components/shared/diagrams/EvidenceVisuals";

export function ResumeLengthMythDiagram() {
    return (
        <DiagramFigure className="max-w-[44rem]" label="Working guideline relating resume length to experience depth">
            <DiagramFrame>
                <EvidenceHeader index="01" label="Choosing a length" title="Use the space you need. Make every line useful." note="Relevant experience matters more than a universal one-page rule." />
                <EvidenceTable columns={["Career depth", "Useful range", "Editorial test"]} rows={[
                    { label: "Early career", values: ["Usually 1 page", "Can every line help this application?"] },
                    { label: "Mid career", values: ["Often 1–2 pages", "Does page one create a reason to continue?"], emphasis: 0 },
                    { label: "Senior / complex scope", values: ["Often 2 pages", "Is the added depth relevant, not merely complete?"] },
                ]} />
                <p className="border-t border-line px-5 py-4 text-xs leading-5 text-muted-foreground md:px-7"><strong className="text-foreground">Working guideline, not law.</strong> Role, geography, field, and career history can change the right answer.</p>
            </DiagramFrame>
            <DiagramCaption kicker="Fig. 1 / Resume length" title="Choose the length based on what the reader needs to evaluate you." />
        </DiagramFigure>
    );
}
