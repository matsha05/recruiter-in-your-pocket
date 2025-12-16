"use client";

import { useState } from "react";
import { Case, ResumeArtifact, InterviewPlanArtifact, OfferArtifact } from "@/lib/types/case";
import { StudioShell } from "@/components/layout/StudioShell";
import { ResumeCase } from "@/components/dashboard/ResumeCase";
import { InterviewCase } from "@/components/dashboard/InterviewCase";
import { NegotiationCase } from "@/components/dashboard/NegotiationCase";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

interface CaseViewProps {
    caseFile: Case;
}

export function CaseView({ caseFile }: CaseViewProps) {
    const [activeCase, setActiveCase] = useState(caseFile);
    const [isSaving, setIsSaving] = useState(false);

    // Auto-save handler (to be passed down)
    const handleArtifactUpdate = async (type: 'resume' | 'interview_plan' | 'offer', content: any) => {
        setIsSaving(true);
        try {
            const res = await fetch(`/api/cases/${activeCase.id}/artifact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, content })
            });
            if (!res.ok) throw new Error("Failed to save");

            // In a real app we'd revalidate, but for local state:
            // We assume safe.
        } catch (e) {
            console.error(e);
            alert("Failed to save changes.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <StudioShell showSidebar={true}>
            <div className="max-w-6xl mx-auto py-8">

                {/* Header */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-display font-semibold">
                                {activeCase.role_context.title || "Untitled Case"}
                            </h1>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{activeCase.role_context.company_name}</span>
                                <span>•</span>
                                <span className="uppercase tracking-wider font-mono">{activeCase.id.slice(0, 8)}...</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {isSaving ? (
                            <span className="text-xs text-muted-foreground animate-pulse">Saving...</span>
                        ) : (
                            <span className="text-xs text-muted-foreground flex items-center gap-1"><Save className="w-3 h-3" /> Saved</span>
                        )}
                        <Badge variant="outline" className="uppercase tracking-wider">
                            {activeCase.current_stage}
                        </Badge>
                    </div>
                </div>

                {/* Content based on Stage */}
                {activeCase.current_stage === 'applying' && activeCase.resume && (
                    <ResumeCase artifact={activeCase.resume} />
                )}

                {activeCase.current_stage === 'interviewing' && activeCase.interview_plan && (
                    <InterviewCase
                        artifact={activeCase.interview_plan}
                        roleTitle={activeCase.role_context.title}
                        companyName={activeCase.role_context.company_name}
                    // We need to modify InterviewCase to accept 'onUpdate' or handle saving internally.
                    // For this "Phase 6", we'll just allow basic viewing/interaction.
                    // Ideally, StoryBank calls 'handleArtifactUpdate'.
                    />
                )}

                {activeCase.current_stage === 'negotiating' && (
                    <NegotiationCase
                        artifact={activeCase.offer || { id: 'temp', status: 'received', components: { base_salary: 0 } }}
                        roleTitle={activeCase.role_context.title}
                        companyName={activeCase.role_context.company_name}
                    // Need to wire update
                    />
                )}

            </div>
        </StudioShell>
    );
}
