"use client";

import { ArrowRight } from "@phosphor-icons/react";
import { DiagramCaption, DiagramFigure, DiagramFrame } from "@/components/shared/diagrams/DiagramPrimitives";
import { EvidenceHeader } from "@/components/shared/diagrams/EvidenceVisuals";

export function PageTwoGateDiagram() {
    return (
        <DiagramFigure className="max-w-[43rem]" label="One way to organize relevant experience across a two-page resume">
            <DiagramFrame>
                <EvidenceHeader index="01" label="Organizing two pages" title="Put your most relevant experience first." note="Use a second page when it adds information that helps the employer assess your experience." />
                <div className="grid items-stretch px-5 py-7 sm:grid-cols-[1fr_5rem_1fr] md:px-7 md:py-9">
                    <section className="border-t-2 border-cyan-bright py-5 sm:py-6">
                        <div className="font-display text-6xl riyp-weight-540 leading-none tabular-nums text-brand">01</div>
                        <div className="riyp-evidence-label mt-5 text-brand">Page one</div>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">Role fit, recent experience, credible results, and a clear structure.</p>
                    </section>
                    <div className="flex min-h-16 items-center justify-center text-muted-foreground sm:min-h-0" aria-hidden="true">
                        <div className="flex size-11 items-center justify-center border border-dashed border-line bg-paper"><ArrowRight className="size-4" /></div>
                    </div>
                    <section className="border-t border-line py-5 sm:py-6">
                        <div className="font-display text-6xl riyp-weight-540 leading-none tabular-nums text-muted-foreground">02</div>
                        <div className="riyp-evidence-label mt-5 text-muted-foreground">Page two</div>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">Relevant earlier roles, additional projects, publications, or specialist experience.</p>
                    </section>
                </div>
                <div className="border-t border-line bg-proof px-5 py-4 text-sm leading-6 text-muted-foreground md:px-7"><strong className="text-foreground">The test:</strong> does page two add evidence that helps someone judge your fit?</div>
            </DiagramFrame>
            <DiagramCaption kicker="Fig. 1 / Page order" title="Keep a second page for useful detail, not material you are reluctant to cut." />
        </DiagramFigure>
    );
}
