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
                    <div className="border-t border-slate-400 py-5">
                        <div className="riyp-evidence-label text-slate-500">Experience you have</div>
                        <div className="mt-3 font-display text-2xl leading-tight text-slate-950">Experience and outcomes</div>
                        <p className="mt-2 text-xs leading-5 text-slate-500">The actual capability the employer is trying to judge.</p>
                    </div>
                    <ArrowRight className="mx-4 hidden size-4 text-slate-400 sm:block" aria-hidden="true" />
                    <div className="border-t-2 border-teal-800 py-5">
                        <div className="riyp-evidence-label text-teal-800">Clarity layer</div>
                        <div className="mt-3 font-display text-2xl leading-tight text-teal-950">Structure and language</div>
                        <p className="mt-2 text-xs leading-5 text-slate-500">The reading path that makes the evidence legible.</p>
                    </div>
                    <ArrowRight className="mx-4 hidden size-4 text-slate-400 sm:block" aria-hidden="true" />
                    <div className="border-t border-[hsl(var(--brass))] py-5">
                        <div className="riyp-evidence-label text-[hsl(var(--brass))]">Experience the reader can find</div>
                        <div className="mt-3 font-display text-2xl leading-tight text-slate-950">A faster, fairer read</div>
                        <p className="mt-2 text-xs leading-5 text-slate-500">The reviewer can spend time judging the evidence instead of decoding it.</p>
                    </div>
                </div>
                <div className="border-t border-[hsl(var(--paper-line))] bg-[hsl(var(--paper-muted))] px-5 py-4 text-sm leading-6 text-slate-700 md:px-7"><strong className="text-slate-950">Clarity is an access layer.</strong> It cannot replace weak evidence, but it can stop strong evidence from being missed.</div>
            </DiagramFrame>
            <DiagramCaption kicker="Fig. 1 / Clearer evidence" title="Better writing helps the reader understand more of the experience already there." />
        </DiagramFigure>
    );
}
