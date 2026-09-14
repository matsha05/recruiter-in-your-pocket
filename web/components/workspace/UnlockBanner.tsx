"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { X, ArrowRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InsightSparkleIcon } from "@/components/icons";
import { UI_TRANSITION } from "@/lib/animation";

const DISMISSED_BANNERS_KEY = 'riyp_dismissed_unlock_banners:v1';

function dismissedBanners(): Record<string, boolean> {
    try {
        const value = JSON.parse(localStorage.getItem(DISMISSED_BANNERS_KEY) || '{}');
        return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    } catch {
        return {};
    }
}

function rememberDismissal(reportId?: string) {
    if (!reportId) return;
    try {
        localStorage.setItem(DISMISSED_BANNERS_KEY, JSON.stringify({ ...dismissedBanners(), [reportId]: true }));
    } catch {
        // Dismissing this notice still works when browser storage is unavailable.
    }
}

interface UnlockBannerProps {
    reportId?: string;
    onJumpToRewrites: () => void;
    onDownloadPdf: () => void;
}

export function UnlockBanner({ reportId, onJumpToRewrites, onDownloadPdf }: UnlockBannerProps) {
    const [isDismissed, setIsDismissed] = useState(true);
    const dismissedForNotice = useRef(false);
    const reducedMotion = useReducedMotion();

    // Reserve the actual notice height before report navigation measures its target.
    useLayoutEffect(() => {
        // The same restored report can receive its stored identity after the notice
        // appears. A new report unmounts this notice; saving it must not reopen it.
        dismissedForNotice.current ||= Boolean(reportId && dismissedBanners()[reportId]);
        setIsDismissed(dismissedForNotice.current);
        if (dismissedForNotice.current) rememberDismissal(reportId);
    }, [reportId]);

    const handleDismiss = () => {
        dismissedForNotice.current = true;
        setIsDismissed(true);
        rememberDismissal(reportId);
    };

    return (
        <AnimatePresence initial={false}>
            {!isDismissed && <m.div
                key="pass-ready"
                data-testid="pass-ready-banner-shell"
                data-report-id={reportId || "unsaved"}
                className="mb-8 w-full overflow-hidden"
                initial={reducedMotion ? false : { opacity: 0.7 }}
                animate={{ height: "auto", opacity: 1, marginBottom: 32 }}
                exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                transition={reducedMotion ? { duration: 0 } : UI_TRANSITION}
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
                                    You now have five additional reports to use with a revised resume or another job posting.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <Button
                                    variant="premium"
                                    size="sm"
                                    onClick={onJumpToRewrites}
                                >
                                    See suggested changes
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
            </m.div>}
        </AnimatePresence>
    );
}
