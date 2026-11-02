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
 * SaveReportPrompt - Opens when a guest chooses to keep a completed report.
 * Saving continues through verified sign-in before the report reaches history.
 */
export default function SaveReportPrompt({
    isOpen,
    onClose,
    report,
    onRequestAuth
}: SaveReportPromptProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Keep the score in analytics; saving is useful at every score.
    const score = report?.score || 0;

    const handleSave = async () => {
        setLoading(true);
        setError(null);

        try {
            await onRequestAuth();
        } catch {
            setError("Sign-in could not open. Try again to save this report.");
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
                    <BookmarkSimple aria-hidden="true" className="mb-3 size-6 text-brand" weight="duotone" />
                    <DialogTitle className="font-display text-heading">
                        Save this report
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                        Sign in and it&apos;ll be in My reports when you come back to revise.
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
                        {loading ? "Opening sign-in…" : "Sign in to save"}
                    </Button>

                    <Button type="button"
                        variant="quiet"
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
                    Skip it, and this browser can still bring the report back for up to 24 hours. It won’t be saved to My reports.
                </p>
            </DialogContent>
        </Dialog>
    );
}
