"use client";

import { DiagramCaption, DiagramFigure, DiagramFrame } from "@/components/shared/diagrams/DiagramPrimitives";
import { EvidenceHeader } from "@/components/shared/diagrams/EvidenceVisuals";

// Brown, Setren & Topa, Table 3: percent of each stage's pool by how the candidate applied (62,127 applicants, one US firm).
const stages = [
    { stage: "Applied", referred: 6.1, jobBoard: 60.1 },
    { stage: "Interviewed", referred: 21.4, jobBoard: 40.0 },
    { stage: "Got an offer", referred: 27.3, jobBoard: 23.6 },
    { stage: "Hired", referred: 29.1, jobBoard: 23.5 },
];
const axisMax = 70;
const ticks = [0, 10, 20, 30, 40, 50, 60, 70];

function Bar({ value, tone }: { value: number; tone: "referred" | "jobBoard" }) {
    return (
        <span className="flex items-center gap-2.5">
            <span
                className={tone === "referred" ? "block h-5 rounded-r-md bg-[hsl(var(--pen))]" : "block h-5 rounded-r-md bg-[hsl(var(--text-strong)/0.18)]"}
                style={{ width: `${(value / axisMax) * 100}%` }}
                aria-hidden="true"
            />
            <span className={tone === "referred" ? "whitespace-nowrap text-sm font-bold tabular-nums text-foreground" : "whitespace-nowrap text-sm tabular-nums text-muted-foreground"}>
                {Math.round(value)}%
            </span>
        </span>
    );
}

export function ReferralHiringShareDiagram({ figureNumber = 1 }: { figureNumber?: number }) {
    return (
        <DiagramFigure
            className="max-w-[46rem]"
            label="Bar chart: referred candidates were 6% of applicants, 21% of interviewees, 27% of offers, and 29% of hires. Job board applicants were 60% of applicants and 24% of hires."
        >
            <DiagramFrame>
                <EvidenceHeader
                    index={String(figureNumber).padStart(2, "0")}
                    title="Referrals were 6% of applicants and 29% of hires"
                    note="Share of each stage's candidates, by how they applied."
                />
                <div className="px-5 pb-6 pt-6 md:px-7 md:pb-8">
                    <div className="mb-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground" aria-hidden="true">
                        <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-[hsl(var(--pen))]" />Referred by an employee</span>
                        <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-[hsl(var(--text-strong)/0.18)]" />Applied through a job board</span>
                    </div>
                    <dl className="grid gap-5">
                        {stages.map((item) => (
                            <div key={item.stage} className="grid gap-1.5 sm:grid-cols-[8rem_minmax(0,1fr)] sm:items-center sm:gap-5">
                                <dt className="text-sm font-semibold text-foreground">{item.stage}</dt>
                                <dd className="grid gap-1.5">
                                    <Bar value={item.referred} tone="referred" />
                                    <Bar value={item.jobBoard} tone="jobBoard" />
                                </dd>
                            </div>
                        ))}
                    </dl>
                    <div className="mt-4 hidden grid-cols-[8rem_minmax(0,1fr)] gap-5 sm:grid" aria-hidden="true">
                        <span />
                        <div className="relative h-5 border-t border-line">
                            {ticks.map((tick) => (
                                <span key={tick} className="absolute top-1 -translate-x-1/2 text-xs tabular-nums text-muted-foreground" style={{ left: `${(tick / axisMax) * 100}%` }}>{tick}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </DiagramFrame>
            <DiagramCaption kicker={`Fig. ${figureNumber} / Brown, Setren & Topa`} title="Each step of the process tilted further toward referred candidates. One large US company, 62,127 applicants." />
        </DiagramFigure>
    );
}
