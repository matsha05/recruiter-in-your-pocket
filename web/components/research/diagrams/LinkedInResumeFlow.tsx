"use client";

import { DiagramCaption, DiagramFigure, DiagramFrame } from "@/components/shared/diagrams/DiagramPrimitives";
import { EvidenceHeader, ProcessRail } from "@/components/shared/diagrams/EvidenceVisuals";

export function LinkedInResumeFlow() {
    return (
        <DiagramFigure className="max-w-[47rem]" label="Flow showing LinkedIn as a discovery surface and the resume as an evaluation surface">
            <DiagramFrame>
                <EvidenceHeader index="01" label="Two tools, two jobs" title="LinkedIn can help people find you. Your resume helps them evaluate you." note="The facts should match, even when the amount of detail changes." />
                <ProcessRail steps={[
                    { label: "Discovery", title: "LinkedIn", detail: "Searchable identity, role fit, and a reason to click.", tone: "focus" },
                    { label: "Handoff", title: "Shared story", detail: "Titles, dates, scope, and direction should reconcile." },
                    { label: "Evaluation", title: "Resume", detail: "Curated proof, context, and outcomes for this role.", tone: "focus" },
                    { label: "Decision", title: "Interview", detail: "The evidence becomes questions, validation, and judgment." },
                ]} footer="Your LinkedIn and resume should agree on the facts. They do not need to repeat each other word for word." />
            </DiagramFrame>
            <DiagramCaption kicker="Fig. 1 / From search to review" title="LinkedIn helps with discovery. The resume provides the detail for a closer review." />
        </DiagramFigure>
    );
}
