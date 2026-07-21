"use client";

import { ArrowRight } from "@phosphor-icons/react";
import { DiagramCaption, DiagramFigure, DiagramFrame } from "@/components/shared/diagrams/DiagramPrimitives";
import { EvidenceHeader } from "@/components/shared/diagrams/EvidenceVisuals";

const stages = ["Application", "Screen", "Interview"];

function FlowLine({ referred }: { referred?: boolean }) {
    return (
        <div className="grid grid-cols-[5rem_1fr] items-start gap-4">
            <div className={referred ? "riyp-evidence-label pt-3 text-brand" : "riyp-evidence-label pt-3 text-muted-foreground"}>{referred ? "Referred" : "Cold"}</div>
            <div>
                <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center">
                    {stages.map((stage, index) => (
                        <div key={stage} className="contents">
                            <div className={referred && stage === "Screen" ? "border-t-2 border-cyan-bright py-3 text-center text-xs font-semibold text-brand" : "border-t border-line py-3 text-center text-xs font-medium text-muted-foreground"}>{stage}</div>
                            {index < stages.length - 1 ? <ArrowRight className="mx-1 size-3 text-muted-foreground" aria-hidden="true" /> : null}
                        </div>
                    ))}
                </div>
                {referred ? <div className="ml-[36%] mt-2 border-l-2 border-cyan-bright pl-4"><span className="riyp-evidence-label text-brand">Context enters here</span><p className="mt-1 text-xs leading-5 text-muted-foreground">A known person adds information the application cannot carry alone.</p></div> : <p className="mt-2 text-xs leading-5 text-muted-foreground">The resume reaches screening without an additional source of context.</p>}
            </div>
        </div>
    );
}

export function ReferralFunnelDiagram() {
    return (
        <DiagramFigure className="max-w-[48rem]" label="Comparison of cold and referred applications showing where referrer context enters the hiring process">
            <DiagramFrame>
                <EvidenceHeader index="01" label="What a referral adds" title="The reviewer starts with more context about you." note="A referral does not replace fit. It can explain why your experience deserves a closer look." />
                <div className="space-y-8 px-5 py-7 md:px-7 md:py-9">
                    <FlowLine />
                    <div className="border-t border-dashed border-line" />
                    <FlowLine referred />
                </div>
                <div className="border-t border-line bg-proof px-5 py-4 text-sm leading-6 text-muted-foreground md:px-7"><strong className="text-foreground">The advantage is informational:</strong> someone helps interpret the candidate before the screen begins.</div>
            </DiagramFrame>
            <DiagramCaption kicker="Fig. 1 / Referral context" title="A referral can help your application get understood. It cannot guarantee the outcome." />
        </DiagramFigure>
    );
}
