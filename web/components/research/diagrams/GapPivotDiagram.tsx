"use client";

import { DiagramCaption, DiagramFigure, DiagramFrame } from "@/components/shared/diagrams/DiagramPrimitives";
import { EvidenceHeader } from "@/components/shared/diagrams/EvidenceVisuals";
import { Key, Mark, PenNote, useSeen } from "@/components/research/figures/FigureKit";

// Ghayad (2013), Table A.5: interview-request rate by time out of work and industry experience.
const points = [
    { label: "Employed", same: 14.67, different: 5.83 },
    { label: "Out 1–3 mo", same: 16.11, different: 8.33 },
    { label: "Out 4–6 mo", same: 12.22, different: 4.17 },
    { label: "Out 7+ mo", same: 1.94, different: 0.56 },
];

const W = 520;
const H = 300;
const pad = { top: 36, right: 28, bottom: 44, left: 44 };
const yMax = 18;
const x = (i: number) => pad.left + (i * (W - pad.left - pad.right)) / (points.length - 1);
const y = (v: number) => pad.top + (1 - v / yMax) * (H - pad.top - pad.bottom);
const path = (key: "same" | "different") => points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p[key]).toFixed(1)}`).join(" ");

export function GapPivotDiagram({ figureNumber = 1 }: { figureNumber?: number }) {
    const { ref, seen } = useSeen<HTMLDivElement>();
    const draw = { strokeDasharray: 1, strokeDashoffset: seen ? 0 : 1 };
    return (
        <DiagramFigure
            className="max-w-[54rem]"
            label="Line chart of interview requests. With experience in the same industry: 15% while employed, 16% after 1 to 3 months out, 12% after 4 to 6 months, 2% after 7 or more. From a different industry: 6%, 8%, 4%, and under 1%."
        >
            <DiagramFrame>
                <EvidenceHeader
                    index={String(figureNumber).padStart(2, "0")}
                    title="After six months out, even the right experience stopped helping"
                    note="Share of fictitious resumes that got an interview request, by time out of work."
                />
                <div ref={ref} className="grid gap-6 px-5 py-6 md:grid-cols-[minmax(0,1fr)_minmax(0,14rem)] md:items-center md:px-7">
                    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full overflow-visible" role="presentation" aria-hidden="true">
                        {[0, 5, 10, 15].map((tick) => (
                            <g key={tick}>
                                <line x1={pad.left} x2={W - pad.right} y1={y(tick)} y2={y(tick)} stroke="hsl(var(--text-strong) / 0.08)" />
                                <text x={pad.left - 10} y={y(tick) + 4} textAnchor="end" className="fill-[hsl(var(--muted-foreground))] text-sm">{tick}%</text>
                            </g>
                        ))}
                        {points.map((p, i) => (
                            <text key={p.label} x={x(i)} y={H - 12} textAnchor="middle" className="fill-[hsl(var(--muted-foreground))] text-sm">{p.label}</text>
                        ))}
                        {/* The six-month line, where the cliff starts. */}
                        <rect x={(x(2) + x(3)) / 2} y={pad.top - 8} width={x(3) - (x(2) + x(3)) / 2 + 22} height={H - pad.top - pad.bottom + 8} rx={6} fill="hsl(var(--highlight) / 0.22)" />
                        <text x={(x(2) + x(3)) / 2 + 8} y={pad.top + 8} className="fill-[hsl(var(--brass))] text-xs font-semibold">Past six months</text>
                        <path d={path("different")} pathLength={1} fill="none" stroke="hsl(var(--text-strong) / 0.35)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={draw} className="transition-[stroke-dashoffset] duration-[900ms] ease-snap motion-reduce:transition-none" />
                        <path d={path("same")} pathLength={1} fill="none" stroke="hsl(var(--pen))" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" style={draw} className="transition-[stroke-dashoffset] duration-[900ms] ease-snap motion-reduce:transition-none" />
                        {points.map((p, i) => (
                            <g key={`${p.label}-dots`}>
                                <circle cx={x(i)} cy={y(p.different)} r={4.5} fill="hsl(var(--card))" stroke="hsl(var(--text-strong) / 0.45)" strokeWidth={2} />
                                <circle cx={x(i)} cy={y(p.same)} r={5} fill="hsl(var(--pen))" stroke="hsl(var(--card))" strokeWidth={2} />
                            </g>
                        ))}
                        <text x={x(1)} y={y(points[1].same) - 14} textAnchor="middle" className="fill-[hsl(var(--foreground))] text-sm font-semibold">16%</text>
                        <text x={x(3) - 14} y={y(points[3].same) - 12} textAnchor="end" className="fill-[hsl(var(--foreground))] text-sm font-semibold">2%</text>
                    </svg>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Key tone="pen">Experience in the same industry</Key>
                            <Key tone="quiet">Experience in a different industry</Key>
                        </div>
                        <PenNote>
                            A career change roughly halves the response. <Mark seen={seen}>A long current gap nearly erases it.</Mark>
                        </PenNote>
                    </div>
                </div>
                <p className="border-t border-line px-5 py-4 text-sm text-muted-foreground md:px-7">
                    About 3,360 resumes sent to 600 US job ads. Each point after &ldquo;Employed&rdquo; is 360 resumes, so small differences are rough.
                </p>
            </DiagramFrame>
            <DiagramCaption kicker={`Fig. ${figureNumber} / Ghayad`} title="Unpublished working paper, 2013." />
        </DiagramFigure>
    );
}
