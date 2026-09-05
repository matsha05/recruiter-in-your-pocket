"use client";

import { ArrowRight } from "@phosphor-icons/react";
import { DiagramCaption, DiagramFigure, DiagramFrame } from "@/components/shared/diagrams/DiagramPrimitives";
import { EvidenceHeader } from "@/components/shared/diagrams/EvidenceVisuals";

const transferSteps = [
    {
        index: "01",
        label: "Eye tracking",
        title: "Time spent on experience",
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
        title: "Make key details easy to find",
        body: "Use familiar headings and clear role titles and dates. Keep related details together.",
    },
];

const notEstablished = [
    "Every resume is read in an F-pattern",
    "One layout works best for every role",
    "A two-column layout always fails",
];

export function ScanPattern({ figureNumber = 1 }: { figureNumber?: number }) {
    return (
        <DiagramFigure className="max-w-[56rem]" label="What general scanning research can and cannot tell us about resume design">
            <DiagramFrame>
                <EvidenceHeader
                    index={String(figureNumber).padStart(2, "0")}
                    label="Research and practical advice"
                    title="Help the reader find your roles and results."
                    note="The studies below examine attention and judgment. They do not establish one ideal layout or reading order."
                />

                <div className="px-5 py-7 md:px-7 md:py-9">
                    <ol className="grid border-y border-line lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-stretch">
                        {transferSteps.map((step, index) => (
                            <li key={step.index} className="contents">
                                <div className="border-b border-line px-4 py-5 last:border-b-0 lg:border-b-0">
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-xs tabular-nums text-muted-foreground">{step.index}</span>
                                        <span className="text-[0.65rem] font-semibold uppercase riyp-track-010 text-brand">{step.label}</span>
                                    </div>
                                    <h3 className="mt-5 font-display text-2xl riyp-weight-560 leading-tight tracking-[-0.025em] text-foreground riyp-stretch-96">{step.title}</h3>
                                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{step.body}</p>
                                </div>
                                {index < transferSteps.length - 1 ? <ArrowRight className="mx-2 hidden size-4 self-center text-muted-foreground lg:block" aria-hidden="true" /> : null}
                            </li>
                        ))}
                    </ol>

                    <aside className="mt-7 grid gap-4 border-l-2 border-cyan-bright bg-proof px-5 py-5 md:grid-cols-[12rem_1fr] md:items-start" aria-label="Claims the cited research does not establish">
                        <h3 className="text-xs font-semibold uppercase riyp-track-010 text-brand">Not established</h3>
                        <ul className="grid gap-3 text-sm leading-6 text-muted-foreground sm:grid-cols-3">
                            {notEstablished.map((claim) => <li key={claim}>{claim}</li>)}
                        </ul>
                    </aside>
                </div>
            </DiagramFrame>
            <DiagramCaption
                kicker={`Fig. ${figureNumber} / Research and advice`}
                title="Clear headings are practical advice, not proof that every recruiter reads the same way."
            />
        </DiagramFigure>
    );
}
