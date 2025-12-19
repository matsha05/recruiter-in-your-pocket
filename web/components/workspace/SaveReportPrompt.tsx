"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bookmark, Loader2 } from "lucide-react";
import { toast } from "sonner";

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
                        Save this audit
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                        Enter your email to save this report and access it anytime.
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
                            "Save My Audit →"
                        )}
                    </Button>

                    <button
                        onClick={onClose}
                        className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Maybe later
                    </button>
                </div>

                <p className="text-center text-[10px] text-muted-foreground/50 mt-4">
                    We'll only email you about this report. No spam.
                </p>
            </DialogContent>
        </Dialog>
    );
}
