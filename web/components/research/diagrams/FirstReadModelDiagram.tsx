"use client";

import { CheckCircle, Quotes } from "@phosphor-icons/react";
import { DiagramCaption, DiagramFigure } from "@/components/shared/diagrams/DiagramPrimitives";
import { LiftedTrace } from "@/components/shared/LiftedTrace";

const dimensions = [
    {
        title: "Story",
        score: 84,
        question: "Can a reader follow the roles, progression, and direction?",
        receipt: "The progression is clear, but the target role is not named up front.",
    },
    {
        title: "Impact",
        score: 82,
        question: "Does the resume show what changed because of the work?",
        receipt: "Results appear, but two strong bullets still hide the size of the work.",
    },
    {
        title: "Clarity",
        score: 88,
        question: "Are role and ownership easy to place?",
        receipt: "The candidate's decisions and responsibilities are consistently specific.",
    },
    {
        title: "Readability",
        score: 90,
        question: "Can a reader find the useful evidence quickly?",
        receipt: "Headings, dates, and recent experience are easy to scan.",
    },
];

const reviewPath = [
    { label: "Evidence", detail: "What the resume actually says" },
    { label: "Review", detail: "What is clear and what remains open" },
    { label: "First action", detail: "The most useful place to begin" },
];

export function FirstReadModelDiagram() {
    return (
        <DiagramFigure className="max-w-[62rem]" label="Worked example showing a first-read score, four diagnostic scores, and the evidence behind them">
            <div className="overflow-hidden border-y border-line bg-paper">
                <div className="grid lg:grid-cols-[18rem_minmax(0,1fr)]">
                    <section className="flex flex-col justify-between border-b border-line bg-surface-sky p-6 lg:border-b-0 lg:border-r lg:p-8" aria-label="Worked first-read score">
                        <div>
                            <p className="riyp-type-0625 font-bold uppercase riyp-track-016 text-brand">Worked example</p>
                            <p className="mt-6 font-display text-[clamp(5rem,10vw,8rem)] riyp-weight-520 leading-[0.78] tracking-[-0.07em] text-foreground">85</p>
                            <p className="mt-4 text-sm font-semibold text-foreground">Clear and specific</p>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">The document is easy to understand. Missing scope keeps the strongest work from reading even better.</p>
                        </div>
                        <div className="mt-8 border-t border-line pt-5">
                            <div className="flex items-start gap-3">
                                <Quotes className="mt-0.5 size-5 shrink-0 text-brand" weight="duotone" aria-hidden="true" />
                                <p className="text-sm leading-6 text-foreground">“Led onboarding across teams” needs the team count and result.</p>
                            </div>
                            <p className="mt-4 text-xs leading-5 text-muted-foreground">This is the receipt: the exact line behind the main question.</p>
                        </div>
                    </section>

                    <section className="p-6 lg:p-8" aria-label="Four score diagnostics">
                        <div className="flex flex-col gap-3 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="riyp-type-0625 font-bold uppercase riyp-track-016 text-brand">What drove it</p>
                                <h3 className="mt-2 font-display text-3xl riyp-weight-540 tracking-[-0.03em] text-foreground">Four views of the same resume</h3>
                            </div>
                            <p className="max-w-[18rem] text-xs leading-5 text-muted-foreground">Diagnostics explain the review. They are not four separate hiring predictions.</p>
                        </div>

                        <ol className="divide-y divide-line">
                            {dimensions.map((dimension) => (
                                <li key={dimension.title} className="grid gap-3 py-5 md:grid-cols-[7rem_minmax(0,1fr)_2.5rem] md:items-start md:gap-6">
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">{dimension.title}</p>
                                        <p className="mt-1 text-xs text-muted-foreground">{dimension.score} / 100</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium leading-6 text-foreground">{dimension.question}</p>
                                        <p className="mt-1 text-sm leading-6 text-muted-foreground">{dimension.receipt}</p>
                                        <progress className="research-progress mt-3" max="100" value={dimension.score}>{dimension.score}%</progress>
                                    </div>
                                    <CheckCircle className="size-5 text-brand md:mt-0.5" weight="duotone" aria-hidden="true" />
                                </li>
                            ))}
                        </ol>
                    </section>
                </div>

                <div className="border-t border-line bg-proof px-6 py-6 md:px-8">
                    <LiftedTrace
                        items={reviewPath}
                        progress={100}
                        ariaLabel="How resume evidence becomes a first action in the report"
                    />
                </div>
            </div>
            <DiagramCaption kicker="Fig. 1 / Score and evidence" title="The number stays visible. The evidence makes it useful." />
        </DiagramFigure>
    );
}
