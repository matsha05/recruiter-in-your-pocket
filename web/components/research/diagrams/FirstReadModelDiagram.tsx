"use client";

import sampleReport from "@/public/sample-report.json";
import { DiagramCaption, DiagramFigure } from "@/components/shared/diagrams/DiagramPrimitives";
import { LiftedTrace } from "@/components/shared/LiftedTrace";

// Every line below comes from the public sample report, so the figure shows what a report actually says.
const criticalMiss = sampleReport.top_fixes[0];

const weighs = [
    {
        title: "The results you show",
        question: "Does each example say what changed because of your work?",
        finding: sampleReport.gaps[0],
    },
    {
        title: "How clearly each line reads",
        question: "Can a recruiter tell what you did, and how much you owned, on the first pass?",
        finding: sampleReport.strengths[0],
    },
    {
        title: "How your experience fits together",
        question: "Does the resume point at the role you want next?",
        finding: sampleReport.gaps[2],
    },
    {
        title: "How easy the page is to scan",
        question: "Can someone find your roles, dates, and results quickly?",
        finding: sampleReport.section_review.Skills.working,
    },
];

const reviewPath = [
    { label: "Your lines", detail: "What the resume actually says" },
    { label: "The read", detail: "What comes through and what slips past" },
    { label: "Critical Miss", detail: "The one change to make first" },
];

export function FirstReadModelDiagram() {
    return (
        <DiagramFigure className="max-w-[62rem]" label="Worked example from the sample report: the Verdict, the First Impression score, the Critical Miss, and the four things the score weighs">
            <div className="overflow-hidden rounded-sheet border border-line bg-card">
                <div className="grid lg:grid-cols-[20rem_minmax(0,1fr)]">
                    <section className="flex flex-col justify-between gap-8 border-b border-line bg-muted p-6 lg:border-b-0 lg:border-r lg:p-8" aria-label="How the sample report opens">
                        <div>
                            <p className="riyp-verdict-label text-brand">Verdict</p>
                            <p className="mt-3 font-serif text-lg leading-7 text-foreground">{sampleReport.first_impression}</p>
                        </div>
                        <div className="flex flex-col gap-5">
                        <div className="flex items-baseline gap-3 border-t border-line pt-5">
                            <p className="font-display text-4xl font-extrabold tabular-nums tracking-tight text-foreground">{sampleReport.score}<span className="ml-0.5 text-base font-medium text-muted-foreground">/100</span></p>
                            <p className="text-sm text-muted-foreground">First Impression score</p>
                        </div>
                        <div className="rounded-xl border border-[hsl(var(--miss-line))] bg-[hsl(var(--miss-surface))] p-4">
                            <p className="riyp-verdict-label text-[hsl(var(--brass))]">Critical Miss</p>
                            <p className="mt-1.5 text-base font-bold leading-6 text-foreground">{criticalMiss.fix}</p>
                            <p className="mt-1.5 text-sm leading-6 text-foreground/80">{criticalMiss.why}</p>
                        </div>
                        </div>
                    </section>

                    <section className="p-6 lg:p-8" aria-label="What the score weighs">
                        <div className="border-b border-line pb-5">
                            <h3 className="font-display text-report-title tracking-tight text-foreground">What the score weighs</h3>
                            <p className="mt-2 max-w-[34rem] text-sm leading-6 text-muted-foreground">Four things a recruiter notices. The report explains each one in words; there are no separate sub-scores.</p>
                        </div>
                        <ol className="divide-y divide-line">
                            {weighs.map((item) => (
                                <li key={item.title} className="grid gap-2 py-5 md:grid-cols-[11rem_minmax(0,1fr)] md:gap-6">
                                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                                    <div>
                                        <p className="text-sm leading-6 text-foreground">{item.question}</p>
                                        <p className="mt-2 border-l-2 border-[hsl(var(--pen)/0.35)] pl-3 font-serif text-[0.95rem] italic leading-6 text-[hsl(var(--pen))]">{item.finding}</p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </section>
                </div>

                <div className="border-t border-line bg-proof px-6 py-6 md:px-8">
                    <LiftedTrace
                        items={reviewPath}
                        progress={100}
                        ariaLabel="How the lines on your resume become the Critical Miss"
                    />
                </div>
            </div>
            <DiagramCaption kicker="Fig. 1 / From the sample report" title="The number summarizes; the written read tells you what to change first." />
        </DiagramFigure>
    );
}
