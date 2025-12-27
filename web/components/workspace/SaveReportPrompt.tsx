"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bookmark, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Analytics } from "@/lib/analytics";

interface SaveReportPromptProps {
    isOpen: boolean;
    onClose: () => void;
    report: any;
    onSuccess?: (email: string) => void;
}

/**
 * SaveReportPrompt - Appears after a guest generates a report
 * Allows them to save the report by entering their email
 */
export default function SaveReportPrompt({
    isOpen,
    onClose,
    report,
    onSuccess
}: SaveReportPromptProps) {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Extract score for personalized messaging
    const score = report?.score || 0;
    const getPersonalizedMessage = () => {
        if (score >= 85) {
            return "Great score! Save this report to share with others or compare future versions.";
        } else if (score >= 70) {
            return `Your score is ${score}. Save this report to track your improvements as you refine your resume.`;
        } else {
            return `Your score is ${score}. Save this report and come back after making the suggested changes.`;
        }
    };

    const handleSave = async () => {
        if (!email.trim()) {
            setError("Please enter your email");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/reports", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: email.trim(),
                    report
                })
            });

            const result = await res.json();

            if (result.ok) {
                toast.success("Report saved!", {
                    description: "Check your email to access it anytime."
                });
                onSuccess?.(email.trim());
                onClose();
            } else {
                setError(result.message || "Failed to save report");
            }
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setEmail("");
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
                        Save this review
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                        {getPersonalizedMessage()}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <Label htmlFor="save-email" className="text-muted-foreground text-sm mb-2 block">
                            Your email
                        </Label>
                        <Input
                            id="save-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="bg-background border-border/60 focus:border-brand/40"
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && email.trim()) {
                                    handleSave();
                                }
                            }}
                            autoFocus
                        />
                    </div>

                    {error && (
                        <div className="text-destructive text-sm text-center bg-destructive/10 p-2 rounded">
                            {error}
                        </div>
                    )}

                    <Button
                        className="w-full"
                        onClick={handleSave}
                        disabled={!email.trim() || loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Save My Review →"
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
                    We&apos;ll only email you about this report. No spam.
                </p>
            </DialogContent>
        </Dialog>
    );
}
