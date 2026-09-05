"use client";

import { ArrowRight } from "@phosphor-icons/react";
import { DiagramCaption, DiagramFigure, DiagramFrame } from "@/components/shared/diagrams/DiagramPrimitives";
import { EvidenceHeader } from "@/components/shared/diagrams/EvidenceVisuals";

export function SignalClarityDiagram() {
    return (
        <DiagramFigure className="max-w-[47rem]" label="Explanation of how clear writing can help a recruiter understand a candidate's experience">
            <DiagramFrame>
                <EvidenceHeader index="01" label="How writing can help" title="Make it easier to understand what you did." note="The researchers propose that clearer writing helps employers recognize the experience a candidate already has." />
                <div className="grid gap-0 px-5 py-7 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center md:px-7 md:py-9">
                    <div className="border-t border-line py-5">
                        <div className="riyp-evidence-label text-muted-foreground">Your experience</div>
                        <div className="mt-3 font-display text-2xl leading-tight text-foreground">What you did</div>
                        <p className="mt-2 text-xs leading-5 text-muted-foreground">Your responsibilities, decisions, and results.</p>
                    </div>
                    <ArrowRight className="mx-4 hidden size-4 text-muted-foreground sm:block" aria-hidden="true" />
                    <div className="border-t-2 border-cyan-bright py-5">
                        <div className="riyp-evidence-label text-brand">Your resume</div>
                        <div className="mt-3 font-display text-2xl leading-tight text-brand">How you explain it</div>
                        <p className="mt-2 text-xs leading-5 text-muted-foreground">Clear sentences and headings help the reader find those details.</p>
                    </div>
                    <ArrowRight className="mx-4 hidden size-4 text-muted-foreground sm:block" aria-hidden="true" />
                    <div className="border-t-2 border-citron py-5">
                        <div className="riyp-evidence-label text-foreground">The review</div>
                        <div className="mt-3 font-display text-2xl leading-tight text-foreground">What the employer understands</div>
                        <p className="mt-2 text-xs leading-5 text-muted-foreground">The reader can assess your experience with fewer unanswered questions.</p>
                    </div>
                </div>
                <div className="border-t border-line bg-proof px-5 py-4 text-sm leading-6 text-muted-foreground md:px-7"><strong className="text-foreground">Keep the facts intact.</strong> Improve how you explain your experience without adding responsibilities or results you cannot support.</div>
            </DiagramFrame>
            <DiagramCaption kicker="Fig. 1 / Proposed explanation" title="The study tested writing assistance, not a guaranteed result from any particular rewrite." />
        </DiagramFigure>
    );
}
