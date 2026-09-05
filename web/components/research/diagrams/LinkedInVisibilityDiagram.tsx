"use client";

import { DiagramCaption, DiagramFigure, DiagramFrame } from "@/components/shared/diagrams/DiagramPrimitives";
import { EvidenceHeader, ProcessRail } from "@/components/shared/diagrams/EvidenceVisuals";

export function LinkedInVisibilityDiagram({ figureNumber = 1 }: { figureNumber?: number }) {
    return (
        <DiagramFigure className="max-w-[48rem]" label="LinkedIn visibility path from profile language to recruiter discovery">
            <DiagramFrame>
                <EvidenceHeader index={String(figureNumber).padStart(2, "0")} label="How recruiters find you" title="Use clear role language before clever wording." note="Your headline, titles, and skills help a recruiter recognize a possible match. The platform and the search still affect what appears." />
                <ProcessRail steps={[
                    { label: "You control", title: "Role language", detail: "Headline, titles, skills, and experience phrasing.", tone: "focus" },
                    { label: "Platform", title: "Index and match", detail: "The system connects profile fields to a search.", tone: "context" },
                    { label: "Recruiter", title: "Open and assess", detail: "A recruiter may open profiles that appear relevant to the role.", tone: "focus" },
                    { label: "Possible outcome", title: "Discovery and outreach", detail: "Visibility can improve; no single field guarantees it.", tone: "caution" },
                ]} footer={<><strong className="text-foreground">Focus on what you can change.</strong> Make your target role and relevant skills easy to recognize. No profile field can guarantee ranking.</>} />
            </DiagramFrame>
            <DiagramCaption kicker={`Fig. ${figureNumber} / Recruiter search`} title="A clear profile can help recruiters find you. It cannot guarantee where you appear." />
        </DiagramFigure>
    );
}
