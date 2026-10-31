"use client";

import { DiagramCaption, DiagramFigure, DiagramFrame } from "@/components/shared/diagrams/DiagramPrimitives";
import { EvidenceHeader } from "@/components/shared/diagrams/EvidenceVisuals";

// A fictional candidate, written two ways. Same jobs, same dates; only the telling changes.
const versions = [
    {
        label: "The resume lists jobs",
        lines: [
            "Marketing Manager, Northwind · 2022–now",
            "Responsible for campaigns, content, and analytics",
            "Marketing Associate, Contoso · 2019–2022",
            "Supported marketing initiatives across channels",
        ],
        read: "Marketing person. Not sure at what level, or what they'd do here.",
        tone: "muted" as const,
    },
    {
        label: "The resume tells the story",
        lines: [
            "Growth marketer who builds the team as the product grows",
            "Northwind · Hired and led a team of four after launch",
            "Took the self-serve funnel from launch to the first paying enterprise customers",
            "Contoso · Ran paid search; built the reporting the team still uses",
        ],
        read: "Growth marketer, ready to lead. I can see her running our launch.",
        tone: "pen" as const,
    },
];

export function StoryReadDiagram({ figureNumber = 1 }: { figureNumber?: number }) {
    return (
        <DiagramFigure
            className="max-w-[54rem]"
            label="Two versions of the same fictional resume. Listed as job duties, the recruiter can't say who the person is. Told as a story, the recruiter can name them in one line and picture them in the role."
        >
            <DiagramFrame>
                <EvidenceHeader
                    index={String(figureNumber).padStart(2, "0")}
                    title="Same career, two first reads"
                    note="A fictional candidate. Same jobs and dates; only the telling changes."
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
            <DiagramCaption kicker={`Fig. ${figureNumber} / Worked example`} title="The facts didn't change. What changed is whether a stranger can put themselves in your shoes." />
        </DiagramFigure>
    );
}
