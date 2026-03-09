"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bookmark, Loader2 } from "lucide-react";
import { Analytics } from "@/lib/analytics";
import { saveReportTrustMessage } from "@/lib/trust/messages";

interface SaveReportPromptProps {
    isOpen: boolean;
    onClose: () => void;
    report: any;
    onRequestAuth: () => Promise<void> | void;
}

/**
 * SaveReportPrompt - Appears after a guest generates a report
 * Allows them to save the report by entering their email
 */
export default function SaveReportPrompt({
    isOpen,
    onClose,
    report,
    onRequestAuth
}: SaveReportPromptProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Extract score for personalized messaging
    const score = report?.score || 0;
    const getPersonalizedMessage = () => {
        if (score >= 85) {
            return "Great score! Create a secure account to keep this report in your history and compare future versions.";
        } else if (score >= 70) {
            return `Your score is ${score}. Create a secure account to track your improvements as you refine your resume.`;
        } else {
            return `Your score is ${score}. Create an account to keep this report and come back after making the suggested changes.`;
        }
    };

    const handleSave = async () => {
        setLoading(true);
        setError(null);

        try {
            await onRequestAuth();
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setError(null);
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-[380px] p-6">
                <DialogHeader className="text-center mb-4">
                    <div className="flex justify-center mb-3">
                        <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center">
                            <Bookmark className="w-6 h-6 text-brand" />
                        </div>
                    </div>
                    <DialogTitle className="font-display text-xl font-medium">
                        Save this review securely
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                        {getPersonalizedMessage()}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="rounded border border-brand/20 bg-brand/5 p-3 text-left text-xs text-muted-foreground">
                        {saveReportTrustMessage}
                    </div>

                    {error && (
                        <div className="text-destructive text-sm text-center bg-destructive/10 p-2 rounded">
                            {error}
                        </div>
                    )}

                    <Button
                        className="w-full"
                        onClick={handleSave}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Opening secure sign-in...
                            </>
                        ) : (
                            "Sign in to save this review →"
                        )}
                    </Button>

                    <button
                        onClick={() => {
                            Analytics.track('save_prompt_dismissed', { score });
                            onClose();
                        }}
                        className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Maybe later
                    </button>
                </div>

                <p className="text-center text-[10px] text-muted-foreground/50 mt-4">
                    Save requires a verified account so your report stays attached to the right owner.
                </p>
            </DialogContent>
        </Dialog>
    );
}
