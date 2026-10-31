"use client";

import { DiagramCaption, DiagramFigure, DiagramFrame } from "@/components/shared/diagrams/DiagramPrimitives";
import { EvidenceHeader } from "@/components/shared/diagrams/EvidenceVisuals";

// Harvard Business School & Burning Glass Institute (2024): firms that dropped degree requirements, by what happened to hiring.
// The report gives these as approximate shares ("37 percent", "approximately 45%", "approximately one-fifth").
const segments = [
    { name: "Real change", share: 37, shown: "37%", detail: "Hired more people without degrees. Almost all of the change came from these firms.", tone: "pen" as const },
    { name: "In name only", share: 45, shown: "About 45%", detail: "Dropped the requirement from the posting. Hired the same way.", tone: "quiet" as const },
    { name: "Backslid", share: 18, shown: "About 1 in 5", detail: "Hired more at first, then ended up hiring fewer.", tone: "line" as const },
];

const fill = {
    pen: "bg-[hsl(var(--pen))]",
    quiet: "bg-[hsl(var(--text-strong)/0.22)]",
    line: "bg-[hsl(var(--text-strong)/0.1)]",
};

export function SkillsPromiseRealityDiagram({ figureNumber = 1 }: { figureNumber?: number }) {
    return (
        <DiagramFigure
            className="max-w-[50rem]"
            label="Stacked bar of firms that removed degree requirements: 37% changed who they hired, about 45% changed in name only, and about one in five made gains that later reversed."
        >
            <DiagramFrame>
                <EvidenceHeader
                    index={String(figureNumber).padStart(2, "0")}
                    title="Dropping the degree rarely changed the hiring"
                    note="Firms that removed degree requirements, by what happened to their hiring afterward."
                />
                <div className="px-5 pb-6 pt-7 md:px-7 md:pb-8">
                    <div className="flex h-10 gap-0.5 overflow-hidden rounded-lg" aria-hidden="true">
                        {segments.map((segment) => (
                            <span key={segment.name} className={fill[segment.tone]} style={{ flexGrow: segment.share, flexBasis: 0 }} />
                        ))}
                    </div>
                    <dl className="mt-6 grid gap-5 sm:grid-cols-3">
                        {segments.map((segment) => (
                            <div key={segment.name} className="grid content-start gap-1">
                                <dt className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                    <span className={`h-3 w-3 shrink-0 rounded-sm ${fill[segment.tone]} ${segment.tone === "line" ? "ring-1 ring-inset ring-[hsl(var(--text-strong)/0.2)]" : ""}`} aria-hidden="true" />
                                    {segment.name}
                                </dt>
                                <dd className="font-display text-2xl font-extrabold tabular-nums tracking-tight text-foreground">{segment.shown}</dd>
                                <dd className="text-sm leading-6 text-muted-foreground">{segment.detail}</dd>
                            </div>
                        ))}
                    </dl>
                    <p className="mt-6 border-t border-line pt-4 text-sm leading-6 text-muted-foreground">
                        The report rounds these shares, so they don&apos;t add to exactly 100%.
                    </p>
                </div>
            </DiagramFrame>
            <DiagramCaption kicker={`Fig. ${figureNumber} / HBS & Burning Glass Institute`} title="Changing the posting is easy. Changing the hiring is the hard part. 2024." />
        </DiagramFigure>
    );
}
