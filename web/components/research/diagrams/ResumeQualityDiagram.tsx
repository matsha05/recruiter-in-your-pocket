"use client";

import { DiagramCaption, DiagramFigure, DiagramFrame } from "@/components/shared/diagrams/DiagramPrimitives";
import { EvidenceHeader } from "@/components/shared/diagrams/EvidenceVisuals";
import { Key, Mark, PenNote, UnitGrid, useSeen } from "@/components/research/figures/FigureKit";

// Bertrand & Mullainathan, American Economic Review (2004), Table 4, Panel A: callbacks per 100 resumes,
// rounded to the nearest whole callback. White names: 8.50% weaker, 10.79% stronger. Black names: 6.19% weaker,
// 6.70% stronger (p = 0.61, not significant). The NBER working paper's numbers differ slightly; these are the published ones.
const rows = [
    { group: "White-sounding names", resume: "Stronger resume", callbacks: 11, exact: "10.8" },
    { group: "White-sounding names", resume: "Weaker resume", callbacks: 9, exact: "8.5" },
    { group: "Black-sounding names", resume: "Stronger resume", callbacks: 7, exact: "6.7" },
    { group: "Black-sounding names", resume: "Weaker resume", callbacks: 6, exact: "6.2" },
];

export function ResumeQualityDiagram({ figureNumber = 2 }: { figureNumber?: number }) {
    const { ref, seen } = useSeen<HTMLDivElement>();
    return (
        <DiagramFigure
            className="max-w-[54rem]"
            label="Callbacks per 100 resumes. White-sounding names: 11 for stronger resumes, 9 for weaker. Black-sounding names: 7 for stronger, 6 for weaker, not a significant difference."
        >
            <DiagramFrame>
                <EvidenceHeader
                    index={String(figureNumber).padStart(2, "0")}
                    title="A stronger resume earned more calls, but not for everyone"
                    note="Each row is 100 fictitious resumes sent to real job ads. Highlighted dots got a callback."
                />
                <div ref={ref} className="grid gap-px bg-line md:grid-cols-2">
                    {["White-sounding names", "Black-sounding names"].map((group) => (
                        <section key={group} className="grid content-start gap-4 bg-card px-5 py-6 md:px-7" aria-label={group}>
                            <p className="text-sm font-semibold text-foreground">{group}</p>
                            {rows.filter((row) => row.group === group).map((row) => (
                                <div key={row.resume} className="grid gap-1.5">
                                    <div className="flex items-baseline justify-between text-sm text-muted-foreground">
                                        <span>{row.resume}</span>
                                        <span><span className="font-semibold text-foreground">{row.callbacks}</span> calls ({row.exact}%)</span>
                                    </div>
                                    <UnitGrid count={100} columns={25} seen={seen} toneAt={(i) => (i < row.callbacks ? (row.resume === "Stronger resume" ? "pen" : "quiet") : "faint")} />
                                </div>
                            ))}
                        </section>
                    ))}
                </div>
                <div className="grid gap-4 border-t border-line px-5 py-5 md:grid-cols-[minmax(0,1fr)_minmax(0,18rem)] md:items-center md:px-7">
                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                        <Key tone="pen">Callback, stronger resume</Key>
                        <Key tone="quiet">Callback, weaker resume</Key>
                    </div>
                    <PenNote>
                        Substance paid off: about two more calls per hundred. <Mark seen={seen}>For Black-sounding names, it barely registered.</Mark>
                    </PenNote>
                </div>
            </DiagramFrame>
            <DiagramCaption kicker={`Fig. ${figureNumber} / Bertrand & Mullainathan`} title="Stronger meant more experience, skills, and honors, not better-worded bullets. 4,870 resumes sent in Boston and Chicago, 2001–02." />
        </DiagramFigure>
    );
}
