"use client";

import sampleReport from "@/public/sample-report.json";
import { DiagramCaption, DiagramFigure } from "@/components/shared/diagrams/DiagramPrimitives";
import { LiftedTrace } from "@/components/shared/LiftedTrace";
import { ScoreBand } from "@/components/workspace/report/markup/ScoreBand";

// Every line below is one the sample report shows, so the figure quotes what a reader of the report actually
// sees: the verdict, the band, and the first card (the line as written, what a recruiter can't tell from it).
type SampleCard = { kind: string; where: string; line: string; cannot_tell: string; example: string; question: string };
const cards = sampleReport.cards as SampleCard[];
const firstCard = cards.find((card) => card.kind !== "keep");
const keepCard = cards.find((card) => card.kind === "keep");
const cardAbout = (pattern: RegExp) => cards.find((card) => card.kind !== "keep" && pattern.test(`${card.cannot_tell} ${card.question}`));

const weighs = [
    {
        title: "The results you show",
        question: "Does each example say what changed because of your work?",
        finding: cardAbout(/what (?:changed|happened|followed)|result/iu)?.cannot_tell,
    },
    {
        title: "How clearly each line reads",
        question: "Can a recruiter tell what you did, and how much you owned, on the first pass?",
        finding: cardAbout(/what you (?:actually )?did|hides the job|your contribution/iu)?.cannot_tell,
    },
    {
        title: "How your experience fits together",
        question: "Does the resume point at the role you want next?",
        finding: cardAbout(/job you want|role you(?:'re| are) seeking|target/iu)?.cannot_tell,
    },
    {
        title: "How easy the text is to follow",
        question: "Reading the text alone, can someone find your roles, dates, and results quickly?",
        finding: keepCard?.cannot_tell,
    },
];

// When the sample has no note for a part, the figure says so rather than dropping the row.
const NO_NOTE = "The sample report has no note here.";

const reviewPath = [
    { label: "Your lines" },
    { label: "What a recruiter can't tell" },
    { label: "The line with the detail in" },
];

export function FirstReadModelDiagram() {
    return (
        <DiagramFigure className="max-w-[62rem]" label="Worked example from the sample report: the verdict, the band, the first line that needs work, and the four things behind the band">
            <div className="overflow-hidden rounded-sheet border border-line bg-card">
                <div className="grid lg:grid-cols-[20rem_minmax(0,1fr)]">
                    <section className="flex flex-col justify-between gap-8 border-b border-line bg-muted p-6 lg:border-b-0 lg:border-r lg:p-8" aria-label="How the sample report opens">
                        <div>
                            <p className="riyp-verdict-label text-brand">Verdict</p>
                            <p className="mt-3 font-serif text-lg text-foreground">{sampleReport.verdict}</p>
                        </div>
                        <div className="flex flex-col gap-5">
                        <div className="border-t border-line pt-1">
                            <ScoreBand score={sampleReport.score} />
                        </div>
                        <div className="rounded-xl border border-line p-4">
                            <p className="text-label font-semibold text-[hsl(var(--brass))]">{firstCard?.where}</p>
                            <p className="mt-1.5 font-serif text-base text-foreground">{firstCard?.line}</p>
                            {firstCard?.cannot_tell && <p className="mt-1.5 text-sm text-[hsl(var(--pen))]">{firstCard.cannot_tell}</p>}
                        </div>
                        </div>
                    </section>

                    <section className="p-6 lg:p-8" aria-label="What goes into the band">
                        <div className="border-b border-line pb-5">
                            <h3 className="font-display text-heading text-foreground">What goes into the band</h3>
                        </div>
                        <ol className="divide-y divide-line">
                            {weighs.map((item) => (
                                <li key={item.title} className="grid gap-2 py-5 md:grid-cols-[11rem_minmax(0,1fr)] md:gap-6">
                                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                                    <div>
                                        <p className="text-sm text-foreground">{item.question}</p>
                                        {item.finding
                                            ? <p className="mt-2 border-l-2 border-[hsl(var(--pen)/0.35)] pl-3 text-note text-[hsl(var(--pen))]">{item.finding}</p>
                                            : <p className="mt-2 text-sm text-muted-foreground">{NO_NOTE}</p>}
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
                        ariaLabel="How the lines on your resume become the cards"
                    />
                </div>
            </div>
            <DiagramCaption kicker="Fig. 1" title="The band summarizes; the written read tells you what to change first." />
        </DiagramFigure>
    );
}
