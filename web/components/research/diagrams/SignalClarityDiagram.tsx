"use client";

import { ArrowRight } from "@phosphor-icons/react";
import { DiagramCaption, DiagramFigure, DiagramFrame } from "@/components/shared/diagrams/DiagramPrimitives";
import { EvidenceHeader } from "@/components/shared/diagrams/EvidenceVisuals";

export function SignalClarityDiagram() {
    return (
        <DiagramFigure className="max-w-[47rem]" label="Causal model showing how writing clarity makes existing evidence easier for a recruiter to evaluate">
            <DiagramFrame>
                <EvidenceHeader index="01" label="Making experience easy to see" title="Clear writing does not create experience. It helps the reader understand it." note="You need relevant work and a clear explanation of what you did. One cannot replace the other." />
                <div className="grid gap-0 px-5 py-7 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center md:px-7 md:py-9">
                    <div className="border-t border-line py-5">
                        <div className="riyp-evidence-label text-muted-foreground">Experience you have</div>
                        <div className="mt-3 font-display text-2xl leading-tight text-foreground">Experience and outcomes</div>
                        <p className="mt-2 text-xs leading-5 text-muted-foreground">The actual capability the employer is trying to judge.</p>
                    </div>
                    <ArrowRight className="mx-4 hidden size-4 text-muted-foreground sm:block" aria-hidden="true" />
                    <div className="border-t-2 border-cyan-bright py-5">
                        <div className="riyp-evidence-label text-brand">Clarity layer</div>
                        <div className="mt-3 font-display text-2xl leading-tight text-brand">Structure and language</div>
                        <p className="mt-2 text-xs leading-5 text-muted-foreground">The reading path that makes the evidence legible.</p>
                    </div>
                    <ArrowRight className="mx-4 hidden size-4 text-muted-foreground sm:block" aria-hidden="true" />
                    <div className="border-t-2 border-citron py-5">
                        <div className="riyp-evidence-label text-foreground">Experience the reader can find</div>
                        <div className="mt-3 font-display text-2xl leading-tight text-foreground">A faster, fairer read</div>
                        <p className="mt-2 text-xs leading-5 text-muted-foreground">The reviewer can spend time judging the evidence instead of decoding it.</p>
                    </div>
                </div>
                <div className="border-t border-line bg-proof px-5 py-4 text-sm leading-6 text-muted-foreground md:px-7"><strong className="text-foreground">Clarity is an access layer.</strong> It cannot replace weak evidence, but it can stop strong evidence from being missed.</div>
            </DiagramFrame>
            <DiagramCaption kicker="Fig. 1 / Clearer evidence" title="Better writing helps the reader understand more of the experience already there." />
        </DiagramFigure>
    );
}
