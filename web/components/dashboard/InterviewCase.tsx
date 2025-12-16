"use client";

import { useState } from "react";
import { InterviewPlanArtifact } from "@/lib/types/case";
import { StoryBank } from "@/components/dashboard/StoryBank";
import { StudioShell } from "@/components/layout/StudioShell"; // Import strictly for layout usage if needed

import { InterviewCoach } from "@/components/dashboard/InterviewCoach";

// We will implement InterviewCoach in the next step, for now stub it or inline it?
// Let's create a placeholder for now, or just use StoryBank for this step so I can verify.
// The user asked for "Story Bank data model & UI" and "Coach feedback UI".

interface InterviewCaseProps {
    artifact: InterviewPlanArtifact;
    roleTitle: string;
    companyName: string;
}

export function InterviewCase({ artifact, roleTitle, companyName }: InterviewCaseProps) {
    const [plan, setPlan] = useState(artifact);

    return (
        <div className="space-y-12 max-w-4xl mx-auto pb-24">

            {/* 1. Story Bank Section */}
            <section>
                <StoryBank artifact={plan} onUpdate={setPlan} />
            </section>

            {/* 2. Coach Section */}
            <section className="pt-8 border-t border-border">
                <InterviewCoach roleTitle={roleTitle} companyName={companyName} />
            </section>
        </div>
    );
}
