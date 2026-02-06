"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, ArrowRight, Info, ChevronDown, AlignLeft, Target, ShieldCheck } from "lucide-react";
import { SixSecondIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { TrustBadges } from "@/components/shared/TrustBadges";
import { ResumeDropzone } from "@/components/upload/ResumeDropzone";
import { cn } from "@/lib/utils";

interface InputPanelProps {
    resumeText: string;
    jobDescription: string;
    onResumeTextChange: (text: string) => void;
    onJobDescChange: (text: string) => void;
    onFileSelect: (file: File) => void;
    onRun: () => void;
    isLoading: boolean;
    freeUsesRemaining: number;
    user?: any | null;
    onSampleReport?: () => void;
    loadedJobContext?: {
        id: string;
        title: string;
        company: string;
        score?: number | null;
    } | null;
}

export default function InputPanel({
    resumeText,
    jobDescription,
    onResumeTextChange,
    onJobDescChange,
    onFileSelect,
    onRun,
    isLoading,
    freeUsesRemaining,
    user,
    onSampleReport,
    loadedJobContext
}: InputPanelProps) {
    const [fileName, setFileName] = useState<string | null>(null);
    const [showJD, setShowJD] = useState(!!loadedJobContext);
    const [showPaste, setShowPaste] = useState(false);

    const handleFileSelect = (file: File) => {
        setFileName(file.name);
        onFileSelect(file);
    };

    const handleRemoveFile = () => {
        setFileName(null);
    };

    const getRunHint = () => {
        const membership = user?.membership;
        if (membership === "monthly" || membership === "lifetime") return "Paid access active";
        if (membership === "credit") {
            const paid = Number(user?.paidUsesLeft || 0);
            return `${paid} paid review${paid === 1 ? "" : "s"} remaining`;
        }
        if (freeUsesRemaining > 0) return "1 free review available";
        return "Upgrade to continue";
    };

    const charCount = resumeText.length;
    const isShortResume = charCount > 0 && charCount < 1500;
    const hasContent = fileName || resumeText.length > 0;

    return (
        <div className="flex justify-center p-6 md:p-12 min-h-full relative">
            {/* Subtle gradient background like landing hero */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand/5 via-transparent to-transparent pointer-events-none" />
            <div className="w-full max-w-xl space-y-6 relative z-10">

                {/* Hero Header */}
                <div className="text-center space-y-2 mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <h1 className="font-display text-4xl md:text-5xl text-foreground tracking-tight">
                        This is what they see.
                    </h1>
                    <div className="flex items-center justify-center gap-2 text-muted-foreground pt-2">
                        <SixSecondIcon className="w-5 h-5 text-brand" />
                        <p className="text-lg font-medium">7.4 seconds. That&apos;s your window.</p>
                    </div>
                </div>

                {/* Job Context Banner - from Extension */}
                {loadedJobContext && (
                    <div className="animate-in fade-in slide-in-from-top-2 bg-brand/5 border border-brand/20 rounded p-4 mb-4">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded bg-brand/10 flex items-center justify-center shrink-0">
                                <Target className="w-5 h-5 text-brand" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-medium text-foreground truncate">
                                        {loadedJobContext.title}
                                    </span>
                                    {loadedJobContext.score != null && loadedJobContext.score > 0 && (
                                        <span className="text-xs font-bold text-brand bg-brand/10 px-2 py-0.5 rounded">
                                            {loadedJobContext.score}% match
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground truncate">
                                    {loadedJobContext.company}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Card */}
                <div className="bg-white dark:bg-card border border-border/40 rounded-xl overflow-hidden transition-all hover:shadow-sm">

                    {/* Section 1: The Input (Hero) */}
                    <div className="p-6 md:p-8 space-y-6">

                        {/* Dropzone - Unified Component */}
                        <ResumeDropzone
                            variant="compact"
                            onFileSelect={handleFileSelect}
                            fileName={fileName}
                            onRemoveFile={handleRemoveFile}
                        />

                        <div className="rounded border border-brand/20 bg-brand/5 p-4">
                            <div className="flex items-start gap-3">
                                <ShieldCheck className="w-4 h-4 text-brand mt-0.5 shrink-0" />
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-foreground">Before you run</p>
                                    <p className="text-xs text-muted-foreground">
                                        Your upload is encrypted in transit. Anonymous runs aren&apos;t stored unless you save a report.
                                        Signed-in runs keep report history and a short resume preview you can delete in Settings.
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        <Link href="/security" className="underline underline-offset-4 hover:text-foreground">Security</Link>
                                        {" · "}
                                        <Link href="/privacy" className="underline underline-offset-4 hover:text-foreground">Privacy</Link>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Paste Text Toggle */}
                        {!fileName && (
                            <div className="space-y-4">
                                {!showPaste ? (
                                    <div className="text-center">
                                        <button
                                            onClick={() => setShowPaste(true)}
                                            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded border border-border/40 hover:border-brand/40 hover:bg-brand/5"
                                        >
                                            <AlignLeft className="w-4 h-4" />
                                            Or paste text instead
                                        </button>
                                        {onSampleReport && (
                                            <button
                                                onClick={onSampleReport}
                                                className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:text-brand/80 transition-colors px-3 py-1.5"
                                            >
                                                <FileText className="w-4 h-4" />
                                                See example report
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="animate-in fade-in slide-in-from-top-2 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Paste Text</span>
                                            <div className="flex items-center gap-3">
                                                {onSampleReport && (
                                                    <button
                                                        onClick={onSampleReport}
                                                        className="text-xs font-medium text-brand hover:text-brand/80 transition-colors"
                                                    >
                                                        See example
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setShowPaste(false)}
                                                    className="text-xs text-muted-foreground hover:text-foreground"
                                                >
                                                    Upload file instead
                                                </button>
                                            </div>
                                        </div>
                                        <textarea
                                            value={resumeText}
                                            onChange={(e) => onResumeTextChange(e.target.value)}
                                            placeholder="Paste your resume content here..."
                                            className="flex w-full rounded border border-border/60 bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand focus-visible:border-brand/40 disabled:cursor-not-allowed disabled:opacity-50 min-h-[200px] leading-relaxed resize-none"
                                            autoFocus
                                        />
                                        {isShortResume && (
                                            <div className="flex gap-2 text-warning text-xs items-center bg-warning/10 border border-warning/20 px-3 py-2 rounded">
                                                <Info className="w-3.5 h-3.5" />
                                                <span>Short resume detected ({charCount} chars). Add more detail for best results.</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Divider */}
                        <div className="border-t border-border/40" />

                        {/* JD Matching - First-Class Feature */}
                        <div className="space-y-3">
                            <button
                                type="button"
                                onClick={() => setShowJD(!showJD)}
                                className={cn(
                                    "w-full flex items-center justify-between p-4 rounded border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
                                    showJD
                                        ? "bg-brand/5 border-brand/30"
                                        : "bg-muted/30 border-border/40 hover:border-brand/30 hover:bg-brand/5"
                                )}
                            >
                                <div className="flex items-start gap-3 text-left">
                                    <div className={cn(
                                        "w-8 h-8 rounded flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors",
                                        showJD ? "bg-brand/20 text-brand" : "bg-muted text-muted-foreground"
                                    )}>
                                        <Target className="w-4 h-4" strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <span className={cn(
                                            "block text-sm font-medium transition-colors",
                                            showJD ? "text-brand" : "text-foreground"
                                        )}>
                                            Check fit for a specific job
                                        </span>
                                        <span className="block text-xs text-muted-foreground mt-0.5">
                                            See your match score + missing skills
                                        </span>
                                    </div>
                                </div>
                                <ChevronDown className={cn(
                                    "w-4 h-4 text-muted-foreground transition-transform duration-200 flex-shrink-0",
                                    showJD && "rotate-180 text-brand"
                                )} />
                            </button>

                            {showJD && (
                                <div className="animate-in fade-in slide-in-from-top-1 space-y-2">
                                    <textarea
                                        value={jobDescription}
                                        onChange={(e) => onJobDescChange(e.target.value)}
                                        className="flex w-full rounded border border-brand/30 bg-brand/5 px-4 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand min-h-[140px] resize-none"
                                        placeholder="Paste the full job posting here...

Example: We are looking for a Senior Product Manager with 5+ years of experience in B2B SaaS..."
                                        autoFocus
                                    />
                                    {jobDescription.length > 0 && (
                                        <div className="flex items-center gap-2 text-xs text-brand">
                                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand" />
                                            JD detected — your report will include a match score
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer CTA */}
                    <div className="p-6 md:p-8 bg-secondary/30 border-t border-border/50">
                        <Button
                            variant="brand"
                            size="lg"
                            className="w-full h-12 text-base font-medium transition-transform active:scale-[0.99]"
                            onClick={onRun}
                            disabled={!hasContent}
                            isLoading={isLoading}
                        >
                            {isLoading ? "Running Analysis..." : (
                                <span className="flex items-center gap-2">
                                    See What They See <ArrowRight className="w-4 h-4" />
                                </span>
                            )}
                        </Button>

                        <div className="mt-4 flex flex-col items-center gap-2">
                            <TrustBadges variant="inline" />
                            <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest font-medium">
                                {getRunHint()}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                                <Link href="/security" className="underline underline-offset-4 hover:text-foreground">Data handling</Link>
                                {" · "}
                                <Link href="/methodology" className="underline underline-offset-4 hover:text-foreground">Scoring methodology</Link>
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
