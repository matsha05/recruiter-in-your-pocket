"use client";

import { DiagramCaption, DiagramFigure, DiagramFrame } from "@/components/shared/diagrams/DiagramPrimitives";
import { ComparisonField, EvidenceHeader } from "@/components/shared/diagrams/EvidenceVisuals";

export function SocialScreeningDiagram() {
    return (
        <DiagramFigure className="max-w-[46rem]" label="Comparison of professional details someone can check and personal conclusions a profile cannot reliably establish">
            <DiagramFrame>
                <EvidenceHeader index="01" label="Facts and assumptions" title="A profile is not a reliable personality assessment." note="Someone can check your professional details without drawing reliable conclusions about how you would perform at work." />
                <ComparisonField
                    left={{
                        eyebrow: "Reasonable to verify",
                        title: "Facts tied to the work",
                        tone: "insight",
                        items: ["Titles and dates", "Published work or portfolio pieces", "Professional credentials and links"],
                    }}
                    right={{
                        eyebrow: "Not reliably established",
                        title: "Personal conclusions",
                        tone: "quiet",
                        items: ["Personality from a post", "Future performance from interests", "Professionalism from an incomplete profile"],
                    }}
                    verdict={<><strong className="text-foreground">For your own profile:</strong> check your titles, dates, credentials, and work links. A profile review alone cannot establish whether someone is suitable for a job.</>}
                />
            </DiagramFrame>
            <DiagramCaption kicker="Fig. 1 / Evidence and inference" title="Online screening can change a judgment. That does not make every judgment valid." description="Baker, Grimm & Ofek-Shanny (2024); SIOP Social Media and Selection white paper." />
        </DiagramFigure>
    );
}
