"use client";

import { DiagramCaption, DiagramFigure, DiagramFrame } from "@/components/shared/diagrams/DiagramPrimitives";
import { ComparisonField, EvidenceHeader } from "@/components/shared/diagrams/EvidenceVisuals";

export function SalaryLeverage() {
    return (
        <DiagramFigure className="max-w-[46rem]" label="Comparison between anchoring compensation to salary history and anchoring it to the role and market">
            <DiagramFrame>
                <EvidenceHeader index="01" label="Negotiation anchor" title="The first number frames the conversation." note="Changing the reference point changes what both sides treat as reasonable." />
                <ComparisonField
                    left={{ eyebrow: "History anchor", title: "What did you make?", tone: "quiet", items: ["Your past pay is the starting point", "The role's value comes up later"] }}
                    right={{ eyebrow: "Role anchor", title: "What is this work worth?", tone: "insight", items: ["Scope and market range set the frame", "Expectations are stated up front"] }}
                    verdict="Rules on salary history vary by location. Have a range for the role ready before anyone asks."
                />
            </DiagramFrame>
            <DiagramCaption kicker="Fig. 1 / The first number" title="Starting with the role and market range can keep past pay from setting the conversation." />
        </DiagramFigure>
    );
}
