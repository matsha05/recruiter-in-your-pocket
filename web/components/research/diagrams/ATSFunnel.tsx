"use client";

import { DiagramCaption, DiagramFigure, DiagramFrame } from "@/components/shared/diagrams/DiagramPrimitives";
import { EvidenceHeader, ProcessRail } from "@/components/shared/diagrams/EvidenceVisuals";

export function ATSFunnel() {
    return (
        <DiagramFigure className="max-w-[46rem]" label="Decision-rights map showing ATS infrastructure, screening rules, recruiter review, and human hiring decisions">
            <DiagramFrame>
                <EvidenceHeader index="01" label="What the software does" title="An ATS organizes applications. People still make the decisions." note="Software may parse, sort, or filter applications. Employers decide how to use it and who moves forward." />
                <ProcessRail
                    steps={[
                        { label: "Infrastructure", title: "Store and route", detail: "Parsing, records, search, and workflow movement." },
                        { label: "Rules", title: "Screen and rank", detail: "Eligibility questions, tests, and configured filters.", tone: "caution" },
                        { label: "Recruiter", title: "Build the shortlist", detail: "Context, comparison, and role judgment.", tone: "focus" },
                        { label: "Hiring team", title: "Interview and decide", detail: "Evidence is weighed; the final call is human.", tone: "focus" },
                    ]}
                    footer={<><strong className="text-slate-900">Write for both:</strong> use a layout the software can read, then make the experience clear to the person reviewing it.</>}
                />
            </DiagramFrame>
            <DiagramCaption kicker="Fig. 1 / Software and people" title="The system handles information. The employer decides how it affects the process." />
        </DiagramFigure>
    );
}
