"use client";

import { DiagramCaption, DiagramFigure, DiagramFrame } from "@/components/shared/diagrams/DiagramPrimitives";
import { ComparisonField, EvidenceHeader } from "@/components/shared/diagrams/EvidenceVisuals";

export function OptimizationBoundaryDiagram() {
    return (
        <DiagramFigure className="max-w-[46rem]" label="Boundary between resume factors a candidate can improve and hiring factors outside the candidate's control">
            <DiagramFrame>
                <EvidenceHeader index="01" label="What a resume can change" title="Make the work easier to understand. Do not confuse that with controlling the outcome." note="A clear resume can answer avoidable questions. It cannot erase market conditions, bias, or another person's preferences." />
                <ComparisonField
                    left={{ eyebrow: "Inside your control", title: "What you can make clearer", tone: "teal", items: ["Writing clarity", "Specific evidence", "Structure and formatting", "Language relevant to the role"] }}
                    right={{ eyebrow: "Outside your control", title: "Conditions you cannot fix", tone: "quiet", items: ["Structural or algorithmic bias", "Market timing", "Reviewer preference", "The final candidate pool"] }}
                    verdict={<><strong className="text-slate-950">Keep the promise honest:</strong> make your experience easy to understand without pretending the resume controls the whole outcome.</>}
                />
            </DiagramFrame>
            <DiagramCaption kicker="Fig. 1 / What a resume can change" title="A better resume can answer avoidable questions. It cannot make the hiring decision." />
        </DiagramFigure>
    );
}
