"use client";

import { DiagramCaption, DiagramFigure, DiagramFrame } from "@/components/shared/diagrams/DiagramPrimitives";
import { EvidenceHeader } from "@/components/shared/diagrams/EvidenceVisuals";

// A fictional candidate, written two ways. Both versions hold the same facts: the self-serve funnel and
// hiring a team of four at Northwind, paid search and weekly reporting at Contoso. Only the telling changes.
const versions = [
    {
        label: "The resume lists jobs",
        lines: [
            "Marketing Manager, Northwind · 2022–now",
            "Responsible for the self-serve funnel, campaigns, and hiring for a team of four",
            "Marketing Associate, Contoso · 2019–2022",
            "Responsible for paid search and weekly reporting",
        ],
        read: "Marketing person. Not sure at what level, or what they'd do here.",
        tone: "muted" as const,
    },
    {
        label: "The resume tells the story",
        lines: [
            "Growth marketer: paid search first, now a self-serve funnel and a team of four",
            "Northwind, 2022–now · Took on the self-serve funnel and hired a team of four",
            "Contoso, 2019–2022 · Ran paid search and the weekly reporting",
        ],
        read: "Growth marketer who's built a team. I can picture her running ours.",
        tone: "pen" as const,
    },
];

export function StoryReadDiagram({ figureNumber = 1 }: { figureNumber?: number }) {
    return (
        <DiagramFigure
            className="max-w-[54rem]"
            label="Two versions of the same fictional resume, with the same facts. Listed as job duties, the recruiter can't say who the person is. Told as a story, the recruiter can name them in one line and picture them in the role."
        >
            <DiagramFrame>
                <EvidenceHeader
                    index={String(figureNumber).padStart(2, "0")}
                    title="Same career, two first reads"
                    note="A fictional candidate. Same jobs, dates, and facts; only the telling changes."
                />
                <div className="grid gap-px bg-line md:grid-cols-2">
                    {versions.map((version) => (
                        <section key={version.label} className="flex flex-col bg-card p-5 md:p-7" aria-label={version.label}>
                            <p className="text-sm font-semibold text-foreground">{version.label}</p>
                            <ul className="mt-4 grid gap-2 rounded-inset border border-line bg-paper p-4">
                                {version.lines.map((line) => (
                                    <li key={line} className="text-sm leading-6 text-foreground/85">{line}</li>
                                ))}
                            </ul>
                            <p className="mt-5 text-sm text-muted-foreground">What the recruiter can say after one read</p>
                            <p
                                className={
                                    version.tone === "pen"
                                        ? "mt-1.5 border-l-2 border-[hsl(var(--pen)/0.5)] pl-3 font-serif text-base italic leading-7 text-[hsl(var(--pen))]"
                                        : "mt-1.5 border-l-2 border-line pl-3 font-serif text-base italic leading-7 text-muted-foreground"
                                }
                            >
                                &ldquo;{version.read}&rdquo;
                            </p>
                        </section>
                    ))}
                </div>
            </DiagramFrame>
            <DiagramCaption kicker={`Fig. ${figureNumber} / Worked example`} title="Nothing was added. The second version puts the same facts in an order a stranger can follow." />
        </DiagramFigure>
    );
}
