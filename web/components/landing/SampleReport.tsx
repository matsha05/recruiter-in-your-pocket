"use client";

import { useState, useEffect } from "react";
import { ReportStream } from "@/components/workspace/report/ReportStream";
import { ReportData } from "@/components/workspace/report/ReportTypes";
import { PocketMark, Wordmark } from "@/components/icons";

/**
 * SampleReport - Full sample report for landing page
 * 
 * Shows the complete report with all sections (Job Alignment, Bullet Rewrites, 
 * Missing Wins, etc.) so visitors can see exactly what they'll get.
 */
export function SampleReport() {
    const [report, setReport] = useState<ReportData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch("/sample-report.json")
            .then(res => res.json())
            .then(data => {
                setReport(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Failed to load sample report:", err);
                setIsLoading(false);
            });
    }, []);

    if (isLoading) {
        return (
            <div className="w-full max-w-4xl mx-auto p-8 animate-pulse">
                <div className="h-8 bg-secondary/50 rounded w-1/3 mb-4" />
                <div className="h-32 bg-secondary/30 rounded mb-4" />
                <div className="h-24 bg-secondary/20 rounded" />
            </div>
        );
    }

    if (!report) {
        return null;
    }

    return (
        <div className="w-full max-w-4xl mx-auto px-4 md:px-0">
            {/* Sample Report Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 md:px-6 py-3 md:py-4 mb-4 md:mb-6 rounded-xl border border-border/50 bg-secondary/20 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <PocketMark className="w-5 h-5 text-brand" />
                    <span className="text-sm font-semibold text-foreground">Sample Report</span>
                </div>
                <span className="text-xs font-mono text-muted-foreground">
                    See what you&apos;ll get
                </span>
            </div>

            {/* Full Report */}
            <ReportStream
                report={report}
                isSample={true}
                isGated={false}
            />
        </div>
    );
}
