"use client";

import { useEffect, useState } from "react";
import { X, Sparkles, ArrowRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UnlockBannerProps {
    reportId: string;
    onJumpToRewrites: () => void;
    onDownloadPdf: () => void;
}

export function UnlockBanner({ reportId, onJumpToRewrites, onDownloadPdf }: UnlockBannerProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissed, setIsDismissed] = useState(true);

    useEffect(() => {
        // Check if dismissed for this specific report
        const dismissedReports = JSON.parse(localStorage.getItem('riyp_dismissed_unlock_banners') || '{}');
        if (!dismissedReports[reportId]) {
            setIsDismissed(false);
            // Small delay for entrance animation
            setTimeout(() => setIsVisible(true), 500);
        }
    }, [reportId]);

    const handleDismiss = () => {
        setIsVisible(false);
        setTimeout(() => {
            setIsDismissed(true);
            const dismissedReports = JSON.parse(localStorage.getItem('riyp_dismissed_unlock_banners') || '{}');
            dismissedReports[reportId] = true;
            localStorage.setItem('riyp_dismissed_unlock_banners', JSON.stringify(dismissedReports));
        }, 300);
    };

    if (isDismissed) return null;

    return (
        <div
            className={cn(
                "w-full transition-all duration-500 ease-out overflow-hidden mb-8",
                isVisible ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
            )}
        >
            <div className="relative rounded-lg border border-premium/20 bg-premium/5 p-4 md:p-6 overflow-hidden">
                {/* Background Sparkle Decoration */}
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Sparkles className="w-16 h-16 text-premium" />
                </div>

                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-4">
                        <div className="space-y-1">
                            <h3 className="text-base font-display font-semibold text-foreground flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-premium" />
                                Your full review is unlocked
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Start with the next rewrite below, then export when you're ready.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <Button
                                variant="premium"
                                size="sm"
                                onClick={onJumpToRewrites}
                                className="h-9"
                            >
                                Jump to Rewrites
                                <ArrowRight className="w-3.5 h-3.5 ml-2" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onDownloadPdf}
                                className="h-9 text-muted-foreground hover:text-foreground"
                            >
                                <Download className="w-3.5 h-3.5 mr-2" />
                                Download PDF
                            </Button>
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDismiss}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                        aria-label="Dismiss banner"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
