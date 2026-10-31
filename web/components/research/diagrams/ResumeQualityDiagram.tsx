"use client";

import { DiagramCaption, DiagramFigure, DiagramFrame } from "@/components/shared/diagrams/DiagramPrimitives";
import { EvidenceHeader } from "@/components/shared/diagrams/EvidenceVisuals";

// Bertrand & Mullainathan (2004), Table 4, Panel A: callback rates by resume quality and the name on the resume.
const groups = [
    { group: "White-sounding names", lower: 8.8, higher: 11.31, note: "29% more callbacks, statistically significant" },
    { group: "Black-sounding names", lower: 6.41, higher: 6.99, note: "No significant difference" },
];
const axisMax = 12;

function Bar({ value, tone }: { value: number; tone: "higher" | "lower" }) {
    return (
        <span className="flex items-center gap-2.5">
            <span
                className={tone === "higher" ? "block h-6 rounded-r-md bg-[hsl(var(--pen))]" : "block h-6 rounded-r-md bg-[hsl(var(--text-strong)/0.18)]"}
                style={{ width: `${(value / axisMax) * 100}%` }}
                aria-hidden="true"
            />
            <span className={tone === "higher" ? "whitespace-nowrap font-display text-lg font-extrabold tracking-tight text-foreground" : "whitespace-nowrap text-sm font-semibold text-muted-foreground"}>
                {value.toFixed(1)}%
            </span>
        </span>
    );
}

export function ResumeQualityDiagram({ figureNumber = 2 }: { figureNumber?: number }) {
    return (
        <DiagramFigure
            className="max-w-[50rem]"
            label="Bar chart: with white-sounding names, stronger resumes got callbacks 11.3% of the time against 8.8% for weaker ones. With Black-sounding names, 7.0% against 6.4%, not a significant difference."
        >
            <DiagramFrame>
                <EvidenceHeader
                    index={String(figureNumber).padStart(2, "0")}
                    title="A stronger resume earned more callbacks, but not for everyone"
                    note="Callback rate for fictitious resumes sent to real job ads in Boston and Chicago."
                />
                <div className="px-5 pt-6 md:px-7">
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground" aria-hidden="true">
                        <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-[hsl(var(--pen))]" />Stronger resume</span>
                        <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-[hsl(var(--text-strong)/0.18)]" />Weaker resume</span>
                    </div>
                </div>
                <div className="mt-5 grid gap-px border-t border-line bg-line md:grid-cols-2">
                    {groups.map((item) => (
                        <section key={item.group} className="bg-card px-5 pb-6 pt-5 md:px-7" aria-label={item.group}>
                            <p className="text-sm font-semibold text-foreground">{item.group}</p>
                            <div className="mt-4 grid gap-2">
                                <Bar value={item.higher} tone="higher" />
                                <Bar value={item.lower} tone="lower" />
                            </div>
                            <p className="mt-4 border-t border-line pt-3 text-sm text-muted-foreground">{item.note}</p>
                        </section>
                    ))}
                </div>
            </DiagramFrame>
            <DiagramCaption kicker={`Fig. ${figureNumber} / Bertrand & Mullainathan`} title="Stronger meant more experience, skills, and honors, not better-worded bullets. About 5,000 resumes, 2004." />
        </DiagramFigure>
    );
}
