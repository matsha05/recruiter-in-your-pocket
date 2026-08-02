"use client";

import { useEffect, useState } from "react";
import { X, ArrowRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { InsightSparkleIcon } from "@/components/icons";

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
        const dismissedReports = JSON.parse(localStorage.getItem('riyp_dismissed_unlock_banners:v1') || '{}');
        let timer: ReturnType<typeof setTimeout> | undefined;
        if (!dismissedReports[reportId]) {
            setIsDismissed(false);
            // Small delay for entrance animation
            timer = setTimeout(() => setIsVisible(true), 500);
        }

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [reportId]);

    const handleDismiss = () => {
        setIsVisible(false);
        setTimeout(() => {
            setIsDismissed(true);
            const dismissedReports = JSON.parse(localStorage.getItem('riyp_dismissed_unlock_banners:v1') || '{}');
            dismissedReports[reportId] = true;
            localStorage.setItem('riyp_dismissed_unlock_banners:v1', JSON.stringify(dismissedReports));
        }, 300);
    };

    if (isDismissed) return null;

    return (
        <div
            data-testid="pass-ready-banner-shell"
            className={cn(
                "mb-8 w-full overflow-hidden transition-all duration-150 ease-out motion-reduce:transition-none",
                isVisible ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            )}
        >
            <div
                data-testid="pass-ready-banner"
                className="relative overflow-hidden rounded border border-premium/20 bg-premium/5 p-4 md:p-6"
                role="status"
                aria-live="polite"
            >
                {/* Background Sparkle Decoration */}
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <InsightSparkleIcon className="size-16 text-premium" />
                </div>

                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 gap-y-4">
                        <div className="gap-y-1">
                            <h3 className="text-base font-display font-semibold text-foreground flex items-center gap-2">
                                <InsightSparkleIcon className="size-4 text-premium" />
                                Your Job Search Pass is ready.
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                This report is unchanged. Use your 5 additional reports for a revised resume or another important role.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <Button
                                variant="premium"
                                size="sm"
                                onClick={onJumpToRewrites}
                            >
                                Jump to Rewrites
                                <ArrowRight className="size-3.5 ml-2" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onDownloadPdf}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <Download className="size-3.5 mr-2" />
                                Download PDF
                            </Button>
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDismiss}
                        className="size-11 p-0 text-muted-foreground hover:text-foreground"
                        aria-label="Dismiss banner"
                    >
                        <X className="size-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
