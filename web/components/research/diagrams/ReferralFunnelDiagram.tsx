"use client";

import { ArrowRight } from "@phosphor-icons/react";
import { DiagramCaption, DiagramFigure, DiagramFrame } from "@/components/shared/diagrams/DiagramPrimitives";
import { EvidenceHeader } from "@/components/shared/diagrams/EvidenceVisuals";

const stages = ["Application", "Screen", "Interview"];

function FlowLine({ referred }: { referred?: boolean }) {
    return (
        <div className="grid grid-cols-[5rem_1fr] items-start gap-4">
            <div className={referred ? "riyp-evidence-label pt-3 text-teal-800" : "riyp-evidence-label pt-3 text-slate-400"}>{referred ? "Referred" : "Cold"}</div>
            <div>
                <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center">
                    {stages.map((stage, index) => (
                        <div key={stage} className="contents">
                            <div className={referred && stage === "Screen" ? "border-t-2 border-teal-800 py-3 text-center text-xs font-semibold text-teal-900" : "border-t border-slate-300 py-3 text-center text-xs font-medium text-slate-600"}>{stage}</div>
                            {index < stages.length - 1 ? <ArrowRight className="mx-1 size-3 text-slate-400" aria-hidden="true" /> : null}
                        </div>
                    ))}
                </div>
                {referred ? <div className="ml-[36%] mt-2 border-l border-teal-800 pl-4"><span className="riyp-evidence-label text-teal-800">Context enters here</span><p className="mt-1 text-xs leading-5 text-slate-500">A known person adds information the application cannot carry alone.</p></div> : <p className="mt-2 text-xs leading-5 text-slate-400">The resume reaches screening without an additional source of context.</p>}
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
                    <div className="border-t border-dashed border-slate-300" />
                    <FlowLine referred />
                </div>
                <div className="border-t border-[hsl(var(--paper-line))] bg-[hsl(var(--paper-muted))] px-5 py-4 text-sm leading-6 text-slate-700 md:px-7"><strong className="text-slate-950">The advantage is informational:</strong> someone helps interpret the candidate before the screen begins.</div>
            </DiagramFrame>
            <DiagramCaption kicker="Fig. 1 / Referral context" title="A referral can help your application get understood. It cannot guarantee the outcome." />
        </DiagramFigure>
    );
}
