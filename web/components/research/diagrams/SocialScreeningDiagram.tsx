"use client";

import { DiagramCaption, DiagramFigure, DiagramFrame } from "@/components/shared/diagrams/DiagramPrimitives";
import { ComparisonField, EvidenceHeader } from "@/components/shared/diagrams/EvidenceVisuals";

export function SocialScreeningDiagram() {
    return (
        <DiagramFigure className="max-w-[46rem]" label="Comparison of facts public profiles can verify and personal conclusions they cannot reliably establish">
            <DiagramFrame>
                <EvidenceHeader index="01" label="Evidence versus inference" title="A public profile can confirm a fact. It is much worse at proving a trait." note="Social content can shape a hiring judgment even when the connection to job performance is weak or untested." />
                <ComparisonField
                    left={{
                        eyebrow: "Reasonable to verify",
                        title: "Facts tied to the work",
                        tone: "teal",
                        items: ["Titles and dates", "Published work or portfolio pieces", "Professional credentials and links"],
                    }}
                    right={{
                        eyebrow: "Easy to overread",
                        title: "Personal conclusions",
                        tone: "quiet",
                        items: ["Personality from a post", "Future performance from interests", "Professionalism from an incomplete profile"],
                    }}
                    verdict={<><strong className="text-slate-950">The boundary:</strong> keep public facts accurate. Do not mistake a cleaned-up feed for a valid job assessment.</>}
                />
            </DiagramFrame>
            <DiagramCaption kicker="Fig. 1 / Evidence and inference" title="Online screening can change a judgment. That does not make every judgment valid." description="Baker, Grimm & Ofek-Shanny (2024); SIOP Social Media and Selection white paper." />
        </DiagramFigure>
    );
}
