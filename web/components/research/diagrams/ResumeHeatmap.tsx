"use client";

import { DiagramCaption, DiagramFigure, DiagramFrame } from "@/components/shared/diagrams/DiagramPrimitives";
import { EvidenceHeader } from "@/components/shared/diagrams/EvidenceVisuals";

const studies = [
    {
        source: "Pina et al. / 2023",
        evidence: "Peer-reviewed eye-tracking study",
        observed: "Among 2,043 usable resume reviews, total review time and Experience-section viewing were associated with advancement decisions.",
        boundary: "Entry-level computer science resumes in a simulated screen; association does not establish causation.",
    },
    {
        source: "Fritzsche & Brannick / 2002",
        evidence: "Peer-reviewed judgment study",
        observed: "Forty recruiters judged 60 actual resumes or corresponding resume profiles; ratings and cue use differed between formats.",
        boundary: "Shows that the full artifact matters; it does not prescribe one resume layout or reading order.",
    },
    {
        source: "TheLadders / 2012",
        evidence: "Company-sponsored eye-tracking report",
        observed: "Popularized an average initial screen of roughly six seconds in its small study.",
        boundary: "Historical, directional evidence only; not a population estimate or universal recruiter timer.",
    },
];

export function ResumeHeatmap() {
    return (
        <DiagramFigure className="max-w-[56rem]" label="Evidence table summarizing three recruiter attention studies and their limits">
            <DiagramFrame>
                <EvidenceHeader
                    index="01"
                    label="Evidence hierarchy"
                    title="The stronger studies support a close read, not a countdown."
                    note="The practical conclusion is modest: make recent work and relevant evidence easy to locate, then keep each claim in context."
                />

                <div className="px-5 py-7 md:px-7 md:py-9">
                    <div className="hidden md:block">
                        <table className="w-full border-collapse text-left text-sm">
                            <caption className="sr-only">Studies of recruiter attention, observed findings, and evidence boundaries</caption>
                            <thead>
                                <tr className="border-y border-[hsl(var(--paper-line))] text-xs font-semibold uppercase riyp-track-010 text-slate-500">
                                    <th scope="col" className="py-3 pr-5">Study</th>
                                    <th scope="col" className="py-3 pr-5">What it observed</th>
                                    <th scope="col" className="py-3">What it cannot establish</th>
                                </tr>
                            </thead>
                            <tbody>
                                {studies.map((study) => (
                                    <tr key={study.source} className="border-b border-[hsl(var(--paper-line))] align-top">
                                        <th scope="row" className="w-[12rem] py-5 pr-5">
                                            <span className="block font-semibold text-teal-900">{study.source}</span>
                                            <span className="mt-1 block text-xs font-normal leading-5 text-slate-500">{study.evidence}</span>
                                        </th>
                                        <td className="py-5 pr-6 leading-6 text-slate-700">{study.observed}</td>
                                        <td className="py-5 leading-6 text-slate-500">{study.boundary}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <ol className="divide-y divide-[hsl(var(--paper-line))] border-y border-[hsl(var(--paper-line))] md:hidden">
                        {studies.map((study, index) => (
                            <li key={study.source} className="py-5">
                                <div className="flex items-baseline gap-3">
                                    <span className="text-xs tabular-nums text-slate-400">{String(index + 1).padStart(2, "0")}</span>
                                    <div>
                                        <h3 className="text-sm font-semibold text-teal-900">{study.source}</h3>
                                        <p className="mt-1 text-xs leading-5 text-slate-500">{study.evidence}</p>
                                    </div>
                                </div>
                                <dl className="mt-4 space-y-4 pl-8">
                                    <div>
                                        <dt className="text-xs font-semibold uppercase riyp-track-010 text-slate-500">Observed</dt>
                                        <dd className="mt-1 text-sm leading-6 text-slate-700">{study.observed}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-semibold uppercase riyp-track-010 text-slate-500">Limit</dt>
                                        <dd className="mt-1 text-sm leading-6 text-slate-600">{study.boundary}</dd>
                                    </div>
                                </dl>
                            </li>
                        ))}
                    </ol>
                </div>
            </DiagramFrame>
            <DiagramCaption
                kicker="Fig. 1 / Evidence summary"
                title="Make the important details easy to find. Do not design around a universal six-second rule."
                description="Source details and direct links appear in the evidence record below."
            />
        </DiagramFigure>
    );
}
