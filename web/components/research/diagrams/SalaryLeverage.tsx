"use client";

import { DiagramCaption, DiagramFigure, DiagramFrame } from "@/components/shared/diagrams/DiagramPrimitives";
import { ComparisonField, EvidenceHeader } from "@/components/shared/diagrams/EvidenceVisuals";

export function SalaryLeverage() {
    return (
        <DiagramFigure className="max-w-[46rem]" label="Comparison between anchoring compensation to salary history and anchoring it to the role and market">
            <DiagramFrame>
                <EvidenceHeader index="01" label="Negotiation anchor" title="The first number frames the conversation." note="Changing the reference point changes what both sides treat as reasonable." />
                <ComparisonField
                    left={{ eyebrow: "History anchor", title: "What did you make?", tone: "quiet", items: ["Past pay becomes the baseline", "Earlier gaps can carry forward", "The role's value enters late"] }}
                    right={{ eyebrow: "Role anchor", title: "What is this work worth?", tone: "insight", items: ["Scope and market set the frame", "Expectations become explicit", "Current value matters more than history"] }}
                    verdict="Salary-history rules vary by location. When you can, discuss the role, the market range, and the value of the work instead of letting past pay set the offer."
                />
            </DiagramFrame>
            <DiagramCaption kicker="Fig. 1 / The first number" title="Starting with the role and market range can keep past pay from setting the conversation." />
        </DiagramFigure>
    );
}
