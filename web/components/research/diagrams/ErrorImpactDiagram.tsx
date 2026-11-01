"use client";

import { DiagramCaption, DiagramFigure, DiagramFrame } from "@/components/shared/diagrams/DiagramPrimitives";
import { EvidenceHeader } from "@/components/shared/diagrams/EvidenceVisuals";
import { Figure, PenNote, useSeen } from "@/components/research/figures/FigureKit";

// Sterkens et al. (2023), Table 4: change in a 0–10 interview-likelihood rating versus the same resume without errors.
// The five-error loss is the figure's one highlight; the two-error loss stays in quiet ink.
const rows = [
    { label: "Two errors", lost: 0.73, highlight: false },
    { label: "Five errors", lost: 1.85, highlight: true },
];

/**
 * A ten-point ruler with the points lost measured off from zero. The study reports
 * only the difference, so the ruler shows the size of the loss and never implies
 * what the error-free resume scored.
 */
function Ruler({ lost, seen, highlight }: { lost: number; seen: boolean; highlight: boolean }) {
    return (
        <div className="relative" aria-hidden="true">
            <div className="relative h-8 overflow-hidden rounded-md border border-[hsl(var(--text-strong)/0.14)] bg-card">
                <div
                    className={`absolute inset-y-0 left-0 ${highlight ? "bg-[hsl(var(--highlight))]" : "bg-[hsl(var(--text-strong)/0.2)]"} transition-transform duration-slow ease-snap motion-reduce:transition-none`}
                    style={{ width: `${lost * 10}%`, transform: seen ? "scaleX(1)" : "scaleX(0)", transformOrigin: "left center" }}
                />
                {Array.from({ length: 9 }, (_, i) => (
                    <span key={i} className="absolute inset-y-0 w-px bg-[hsl(var(--text-strong)/0.12)]" style={{ left: `${(i + 1) * 10}%` }} />
                ))}
            </div>
            <div className="mt-1 flex justify-between text-xs text-muted-foreground"><span>0</span><span>10 points</span></div>
        </div>
    );
}

/** A resume line with misspellings circled in pen. */
function CircledLine() {
    const circled = "rounded-[999px] border-[1.5px] border-[hsl(var(--pen))] px-1 py-px -mx-0.5";
    return (
        <p className="rounded-inset border border-line bg-paper px-4 py-3 text-base text-foreground">
            Led <span className={circled}>onbaording</span> for 40 new hires and <span className={circled}>recieved</span> the team&apos;s <span className={circled}>excellance</span> award.
        </p>
    );
}

export function ErrorImpactDiagram({ figureNumber = 1 }: { figureNumber?: number }) {
    const { ref, seen } = useSeen<HTMLDivElement>();
    return (
        <DiagramFigure
            className="max-w-[54rem]"
            label="Two ten-point rulers. Compared with the same resume without errors, two spelling errors cost 0.73 points on a 0–10 interview rating, and five errors cost 1.85 points."
        >
            <DiagramFrame>
                <EvidenceHeader
                    index={String(figureNumber).padStart(2, "0")}
                    title="Five typos cost almost two points out of ten"
                    note="How much lower 445 recruiters rated the chance of an interview, against the same resume without errors."
                />
                <div ref={ref} className="grid gap-7 px-5 py-7 md:grid-cols-[minmax(0,1fr)_minmax(0,17rem)] md:px-7">
                    <div className="grid content-start gap-6">
                        <CircledLine />
                        {rows.map((row) => (
                            <div key={row.label} className="grid gap-2">
                                <div className="flex items-baseline justify-between gap-3">
                                    <p className="text-sm font-semibold text-foreground">{row.label}</p>
                                    <Figure value={`−${row.lost.toFixed(2)}`} unit="points" className="text-heading" />
                                </div>
                                <Ruler lost={row.lost} seen={seen} highlight={row.highlight} />
                            </div>
                        ))}
                    </div>
                    <PenNote className="self-center">
                        Two typos cost you a little. By five, the reader starts wondering what else was rushed.
                    </PenNote>
                </div>
                <p className="border-t border-line px-5 py-4 text-sm text-muted-foreground md:px-7">
                    The example line is ours. In the study, recruiters rated fictional resumes; nobody was actually called. One error on its own wasn&apos;t tested.
                </p>
            </DiagramFrame>
            <DiagramCaption kicker={`Fig. ${figureNumber} / Sterkens et al.`} title="PLOS ONE, 2023. 445 recruiters across eight occupations." />
        </DiagramFigure>
    );
}
