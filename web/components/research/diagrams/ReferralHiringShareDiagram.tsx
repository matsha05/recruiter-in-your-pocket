"use client";

import { DiagramCaption, DiagramFigure, DiagramFrame } from "@/components/shared/diagrams/DiagramPrimitives";
import { EvidenceHeader } from "@/components/shared/diagrams/EvidenceVisuals";
import { Figure, Key, Mark, PenNote, UnitGrid, useSeen } from "@/components/research/figures/FigureKit";

// Brown, Setren & Topa (NY Fed Staff Report 568), Table 3: percent of each stage's pool referred by an employee.
// 62,127 applications to 315 postings, 2006–2010, at one US financial services firm with 2,000–5,000 employees.
const stages = [
    { stage: "Applied", referred: 6 },
    { stage: "Interviewed", referred: 21 },
    { stage: "Got an offer", referred: 27 },
    { stage: "Hired", referred: 29 },
];

export function ReferralHiringShareDiagram({ figureNumber = 1 }: { figureNumber?: number }) {
    const { ref, seen } = useSeen<HTMLDivElement>();
    return (
        <DiagramFigure
            className="max-w-[54rem]"
            label="Two stacks of 100 resumes. Among applications, 6 in 100 were referred by an employee. Among hires, 29 in 100 were. In between: 21 in 100 interviewees and 27 in 100 offers."
        >
            <DiagramFrame>
                <EvidenceHeader
                    index={String(figureNumber).padStart(2, "0")}
                    title="Six in the pile. Twenty-nine at the finish."
                    note="Every 100 applications, and every 100 hires, at one US financial services company. Green sheets were referred by an employee."
                />
                <div ref={ref} className="grid gap-px bg-line sm:grid-cols-2">
                    <section className="bg-card px-5 py-6 md:px-7" aria-label="Every 100 applications">
                        <div className="mb-4 flex items-baseline justify-between gap-3">
                            <p className="text-sm font-semibold text-foreground">Every 100 applications</p>
                            <Figure value="6" unit="referred" />
                        </div>
                        <UnitGrid count={100} columns={10} shape="sheet" seen={seen} toneAt={(i) => (i < 6 ? "pen" : "quiet")} />
                    </section>
                    <section className="bg-card px-5 py-6 md:px-7" aria-label="Every 100 hires">
                        <div className="mb-4 flex items-baseline justify-between gap-3">
                            <p className="text-sm font-semibold text-foreground">Every 100 who were hired</p>
                            <Figure value="29" unit="referred" />
                        </div>
                        <UnitGrid count={100} columns={10} shape="sheet" seen={seen} toneAt={(i) => (i < 29 ? "pen" : "quiet")} />
                    </section>
                </div>
                <div className="grid gap-5 border-t border-line px-5 py-5 md:grid-cols-[minmax(0,1fr)_minmax(0,16rem)] md:items-center md:px-7">
                    <ol className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm text-muted-foreground" aria-label="Referred share at each stage">
                        {stages.map((item, index) => (
                            <li key={item.stage} className="inline-flex items-baseline gap-1.5">
                                <span>{item.stage}</span>
                                <span className="font-semibold text-foreground">{index === stages.length - 1 ? <Mark seen={seen}>{item.referred}%</Mark> : `${item.referred}%`}</span>
                                {index < stages.length - 1 ? <span aria-hidden="true" className="px-1 text-[hsl(var(--pen))]">→</span> : null}
                            </li>
                        ))}
                    </ol>
                    <PenNote>Every round of review tilted further toward the people someone vouched for.</PenNote>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-line px-5 py-3 md:px-7">
                    <Key tone="pen" shape="sheet">Referred by an employee</Key>
                    <Key tone="faint" shape="sheet">Any other route</Key>
                </div>
            </DiagramFrame>
            <DiagramCaption kicker={`Fig. ${figureNumber} / Brown, Setren & Topa`} title="62,127 applications to one US financial services company, 2006–2010." />
        </DiagramFigure>
    );
}
