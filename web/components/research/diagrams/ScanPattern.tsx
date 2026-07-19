"use client";

import { ArrowRight } from "@phosphor-icons/react";
import { DiagramCaption, DiagramFigure, DiagramFrame } from "@/components/shared/diagrams/DiagramPrimitives";
import { EvidenceHeader } from "@/components/shared/diagrams/EvidenceVisuals";

const transferSteps = [
    {
        index: "01",
        label: "Eye tracking",
        title: "Experience earns attention",
        body: "In the 2023 study, longer viewing of the Experience section was associated with resumes moving forward.",
    },
    {
        index: "02",
        label: "Whole document",
        title: "Context changes judgment",
        body: "Recruiters used cues differently when they saw real resumes instead of stripped-down candidate profiles.",
    },
    {
        index: "03",
        label: "Practical takeaway",
        title: "Make orientation easy",
        body: "Use stable headings, visible role information, and a predictable reading order so evidence is easier to find.",
    },
];

const notEstablished = [
    "Every resume is read in an F-pattern",
    "One layout works best for every role",
    "A two-column layout always fails",
];

export function ScanPattern() {
    return (
        <DiagramFigure className="max-w-[56rem]" label="What general scanning research can and cannot tell us about resume design">
            <DiagramFrame>
                <EvidenceHeader
                    index="01"
                    label="What carries over"
                    title="Give the reader a clear route from role to evidence."
                    note="The research does not establish one scan path. It does show that attention and judgment depend on what the full document makes available."
                />

                <div className="px-5 py-7 md:px-7 md:py-9">
                    <ol className="grid border-y border-[hsl(var(--paper-line))] lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-stretch">
                        {transferSteps.map((step, index) => (
                            <li key={step.index} className="contents">
                                <div className="border-b border-[hsl(var(--paper-line))] px-4 py-5 last:border-b-0 lg:border-b-0">
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-xs tabular-nums text-slate-400">{step.index}</span>
                                        <span className="text-[0.65rem] font-semibold uppercase riyp-track-010 text-teal-800">{step.label}</span>
                                    </div>
                                    <h3 className="mt-5 font-display text-2xl riyp-weight-560 leading-tight tracking-[-0.025em] text-slate-950 riyp-stretch-96">{step.title}</h3>
                                    <p className="mt-3 text-sm leading-6 text-slate-600">{step.body}</p>
                                </div>
                                {index < transferSteps.length - 1 ? <ArrowRight className="mx-2 hidden size-4 self-center text-slate-400 lg:block" aria-hidden="true" /> : null}
                            </li>
                        ))}
                    </ol>

                    <aside className="mt-7 grid gap-4 border-l-2 border-[hsl(var(--annotation))] bg-slate-50 px-5 py-5 md:grid-cols-[12rem_1fr] md:items-start" aria-label="Claims the cited research does not establish">
                        <h3 className="text-xs font-semibold uppercase riyp-track-010 text-[hsl(var(--annotation))]">Not established</h3>
                        <ul className="grid gap-3 text-sm leading-6 text-slate-700 sm:grid-cols-3">
                            {notEstablished.map((claim) => <li key={claim}>{claim}</li>)}
                        </ul>
                    </aside>
                </div>
            </DiagramFrame>
            <DiagramCaption
                kicker="Fig. 1 / What carries over"
                title="Make recent experience easy to enter and useful evidence easy to follow."
            />
        </DiagramFigure>
    );
}
