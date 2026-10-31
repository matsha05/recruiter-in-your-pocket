"use client";

import { DiagramCaption, DiagramFigure, DiagramFrame } from "@/components/shared/diagrams/DiagramPrimitives";
import { EvidenceHeader } from "@/components/shared/diagrams/EvidenceVisuals";

const outcomes = ["Turned work in on time more often", "Stayed with the job more often", "Performed better"];

export function ReferralFunnelDiagram({ figureNumber = 1 }: { figureNumber?: number }) {
    return (
        <DiagramFigure className="max-w-[48rem]" label="What employers could see in a worker's profile compared with what a referral revealed in the Pallais and Sands experiments">
            <DiagramFrame>
                <EvidenceHeader index={String(figureNumber).padStart(2, "0")} title="Same on paper. Different on the job." />
                <div className="grid md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
                    <section className="border-b border-line px-5 py-6 md:border-b-0 md:border-r md:px-7 md:py-8" aria-label="On paper">
                        <h4 className="text-sm font-semibold text-muted-foreground">On paper</h4>
                        <p className="mt-4 text-data text-muted-foreground">Referred and non-referred workers with similar profiles.</p>
                        <div className="mt-5 grid grid-cols-2 gap-3" aria-hidden="true">
                            {["Referred", "Not referred"].map((name) => (
                                <div key={name} className="rounded-inset border border-line bg-card p-3">
                                    <span className="block h-1.5 w-3/4 rounded-full bg-[hsl(var(--line))]" />
                                    <span className="mt-2 block h-1.5 w-1/2 rounded-full bg-[hsl(var(--line))]" />
                                    <span className="mt-3 block text-xs text-muted-foreground">{name}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                    <section className="bg-[hsl(var(--pen-tint))] px-5 py-6 md:px-7 md:py-8" aria-label="On the job">
                        <h4 className="text-sm font-semibold text-[hsl(var(--pen))]">On the job, referred workers</h4>
                        <ul className="mt-4 grid gap-3">
                            {outcomes.map((item) => <li key={item} className="border-l-2 border-[hsl(var(--pen))] pl-3 text-base text-foreground">{item}</li>)}
                        </ul>
                    </section>
                </div>
            </DiagramFrame>
            <DiagramCaption kicker={`Fig. ${figureNumber} / Pallais & Sands`} title="The referral carried information the profile didn't. The study didn't measure interview chances." />
        </DiagramFigure>
    );
}
