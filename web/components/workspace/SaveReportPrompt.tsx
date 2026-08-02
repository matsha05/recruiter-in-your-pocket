"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookmarkSimple } from "@phosphor-icons/react";
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
            return "Strong read. Use a verified account to keep this report and compare future versions.";
        } else if (score >= 70) {
            return `This report scored ${score}. Save it to a verified account before you close this browser view.`;
        } else {
            return `This report scored ${score}. Save it now if you want the fix list backed up while you revise.`;
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
                <DialogHeader className="mb-5 text-left">
                    <div className="mb-4 flex items-center gap-3 border-b border-border/70 pb-3 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
                        <BookmarkSimple aria-hidden="true" className="size-5" weight="duotone" />
                        <span>Report history</span>
                    </div>
                    <DialogTitle className="font-display text-2xl font-medium leading-tight">
                        Keep this report
                    </DialogTitle>
                    <DialogDescription className="text-sm leading-relaxed">
                        {getPersonalizedMessage()}
                    </DialogDescription>
                </DialogHeader>

                <div className="gap-y-4">
                    <div className="rounded border border-brand/20 bg-brand/5 p-3 text-left text-xs text-muted-foreground">
                        {saveReportTrustMessage}
                    </div>

                    {error && (
                        <div role="alert" className="border-l-2 border-destructive bg-error px-3 py-2 text-center text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    <Button
                        className="w-full"
                        onClick={handleSave}
                        isLoading={loading}
                    >
                        {loading ? "Opening secure sign-in…" : "Sign in and keep this report"}
                    </Button>

                    <Button type="button"
                        variant="ghost"
                        onClick={() => {
                            Analytics.track('save_prompt_dismissed', { score });
                            onClose();
                        }}
                        className="min-h-11 w-full text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        Maybe later
                    </Button>
                </div>

                <p className="mt-4 text-center text-xs text-muted-foreground">
                    If you skip, this browser view is not backed up to report history.
                </p>
            </DialogContent>
        </Dialog>
    );
}
