"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Loader2, Zap } from "lucide-react";
import { streamResumeFeedback } from "@/lib/api";
import { OfferArtifact } from "@/lib/types/case";

interface NegotiationIntakeProps {
    onAnalysisComplete: (strategy: NonNullable<OfferArtifact["strategy"]>) => void;
    roleTitle: string;
    companyName: string;
}

export function NegotiationIntake({ onAnalysisComplete, roleTitle, companyName }: NegotiationIntakeProps) {
    const [offerDetails, setOfferDetails] = useState("");
    const [userGoals, setUserGoals] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleAnalyze = async () => {
        if (!offerDetails || !userGoals) return;
        setIsAnalyzing(true);

        // Construct the "Job Description" equivalent for the API
        // In the route handler, 'text' -> Offer Details, 'jobDescription' -> Context + Goals
        const context = `Context for Role: ${roleTitle} at ${companyName}\nUser Goals: ${userGoals}`;

        try {
            // We use 'streamResumeFeedback' but with negotiation mode. 
            // Note: In api.ts, the first arg is 'text' (Offer Details), second is 'jobDescription' (Context)
            const res = await streamResumeFeedback(offerDetails, context, () => { }, "case_negotiation");

            if (res.ok && res.report) {
                // The report IS the strategy object (validated by validateCaseNegotiationPayload)
                onAnalysisComplete(res.report);
            } else {
                alert("Could not generate strategy. Please try again.");
            }
        } catch (e) {
            console.error(e);
            alert("Analysis failed.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto py-8 space-y-8">
            <div className="text-center">
                <h2 className="font-serif text-2xl font-medium mb-2">Offer Intake</h2>
                <p className="text-muted-foreground">Paste your offer details and tell us what matters to you.</p>
            </div>

            <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Offer Details</label>
                        <Textarea
                            placeholder="Paste the email, breakdown of base/equity/bonus, etc..."
                            className="h-40 font-mono text-sm"
                            value={offerDetails}
                            onChange={(e) => setOfferDetails(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">What is your goal?</label>
                        <Textarea
                            placeholder="e.g. I want to max base salary, I care about work-life balance, I have a competing offer..."
                            className="h-24 text-sm"
                            value={userGoals}
                            onChange={(e) => setUserGoals(e.target.value)}
                        />
                    </div>

                    <Button
                        size="lg"
                        className="w-full gap-2"
                        onClick={handleAnalyze}
                        disabled={!offerDetails || !userGoals || isAnalyzing}
                    >
                        {isAnalyzing ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" /> Generating Strategy...
                            </>
                        ) : (
                            <>
                                <Zap className="w-4 h-4" /> Build Negotiation Strategy
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
