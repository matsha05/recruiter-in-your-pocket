"use client";

import { useState } from "react";
import { OfferArtifact } from "@/lib/types/case";
import { NegotiationIntake } from "@/components/dashboard/NegotiationIntake";
import { NegotiationStrategy } from "@/components/dashboard/NegotiationStrategy";

interface NegotiationCaseProps {
    artifact: OfferArtifact;
    roleTitle: string;
    companyName: string;
}

export function NegotiationCase({ artifact, roleTitle, companyName }: NegotiationCaseProps) {
    const [currentArtifact, setArtifact] = useState<OfferArtifact>(artifact);

    const handleStrategyGenerated = (strategy: NonNullable<OfferArtifact['strategy']>) => {
        setArtifact(prev => ({
            ...prev,
            strategy: strategy,
            status: 'countered' // Assume we are moving to counter phase
        }));
    };

    return (
        <div className="max-w-4xl mx-auto pb-24">
            {!currentArtifact.strategy ? (
                <NegotiationIntake
                    roleTitle={roleTitle}
                    companyName={companyName}
                    onAnalysisComplete={handleStrategyGenerated}
                />
            ) : (
                <NegotiationStrategy strategy={currentArtifact.strategy} />
            )}
        </div>
    );
}
