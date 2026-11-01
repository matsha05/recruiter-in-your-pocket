"use client";

import { DiagramCaption, DiagramFigure, DiagramFrame } from "@/components/shared/diagrams/DiagramPrimitives";
import { EvidenceHeader } from "@/components/shared/diagrams/EvidenceVisuals";
import { Figure, Key, Mark, PenNote, UnitGrid, useSeen } from "@/components/research/figures/FigureKit";

// Quillian et al. (2017), PNAS: average callback ratios in the 24 US field experiments since 1989
// (resume audits and in-person audits pooled; 54,318 applications), fieldwork through 2015.
const groups = [
    { group: "Black applicants", white: 136, trend: "No significant change since 1989." },
    { group: "Latino applicants", white: 124, trend: "Some evidence the gap narrowed." },
];

export function MetaTimeline({ figureNumber = 1 }: { figureNumber?: number }) {
    const { ref, seen } = useSeen<HTMLDivElement>();
    return (
        <DiagramFigure
            className="max-w-[54rem]"
            label="Callback tallies. For every 100 callbacks to Black applicants, matched white applicants got 136. For every 100 to Latino applicants, white applicants got 124. The extra callbacks are highlighted."
        >
            <DiagramFrame>
                <EvidenceHeader
                    index={String(figureNumber).padStart(2, "0")}
                    title="Matched applicants. More callbacks for white applicants."
                    note="Each dot is one callback. For every 100 to the comparison group, white applicants got the number shown."
                />
                <div ref={ref} className="grid gap-px bg-line md:grid-cols-2">
                    {groups.map((item) => (
                        <section key={item.group} className="flex flex-col gap-4 bg-card px-5 py-6 md:px-7" aria-label={`Compared with ${item.group}`}>
                            <p className="text-sm font-semibold text-foreground">Compared with {item.group}</p>
                            <div className="grid gap-1.5">
                                <div className="flex items-baseline justify-between text-sm text-muted-foreground"><span>{item.group}</span><span className="font-semibold">100</span></div>
                                <UnitGrid count={100} columns={20} seen={seen} toneAt={() => "quiet"} />
                            </div>
                            <div className="grid gap-1.5">
                                <div className="flex items-baseline justify-between text-sm text-muted-foreground"><span>White applicants</span><Figure value={item.white} className="text-heading" /></div>
                                <UnitGrid count={item.white} columns={20} seen={seen} toneAt={(i) => (i < 100 ? "pen" : "mark")} />
                            </div>
                            <p className="mt-auto border-t border-line pt-3 text-sm text-muted-foreground">{item.trend}</p>
                        </section>
                    ))}
                </div>
                <div className="grid gap-4 border-t border-line px-5 py-5 md:grid-cols-[minmax(0,1fr)_minmax(0,18rem)] md:items-center md:px-7">
                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                        <Key tone="quiet">Callbacks to the comparison group</Key>
                        <Key tone="pen">The same number to white applicants</Key>
                        <Key tone="mark">The extra callbacks</Key>
                    </div>
                    <PenNote>
                        The applicants were matched on paper or in person. Our read: <Mark seen={seen}>better wording can&apos;t close this gap.</Mark>
                    </PenNote>
                </div>
            </DiagramFrame>
            <DiagramCaption kicker={`Fig. ${figureNumber} / Quillian et al.`} title="24 experiments since 1989, resume and in-person audits, 54,318 applications, fieldwork through 2015." />
        </DiagramFigure>
    );
}
