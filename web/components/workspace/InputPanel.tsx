"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, ArrowRight, Info, ChevronDown, AlignLeft, Target, ShieldCheck } from "lucide-react";
import { SixSecondIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { TrustBadges } from "@/components/shared/TrustBadges";
import { ResumeDropzone } from "@/components/upload/ResumeDropzone";
import { cn } from "@/lib/utils";
import { workspaceTrustMessage } from "@/lib/trust/messages";

interface InputPanelProps {
    resumeText: string;
    jobDescription: string;
    onResumeTextChange: (text: string) => void;
    onJobDescChange: (text: string) => void;
    onFileSelect: (file: File) => void | boolean | Promise<void | boolean>;
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

    useEffect(() => {
        if (loadedJobContext) setShowJD(true);
    }, [loadedJobContext]);

    const handleFileSelect = async (file: File) => {
        setFileName(null);
        const accepted = await onFileSelect(file);
        if (accepted !== false) {
            setFileName(file.name);
        }
    };

    const handleRemoveFile = () => {
        setFileName(null);
        onResumeTextChange("");
    };

    const getRunHint = () => {
        const membership = user?.membership;
        if (membership === "monthly" || membership === "lifetime") return "Paid access active";
        if (membership === "credit") {
            const paid = Number(user?.paidUsesLeft || 0);
            return `${paid} paid report${paid === 1 ? "" : "s"} remaining`;
        }
        if (freeUsesRemaining > 0) return "first report available";
        return "Upgrade to continue";
    };

    const charCount = resumeText.length;
    const isShortResume = charCount > 0 && charCount < 1500;
    const hasContent = Boolean(fileName || resumeText.length > 0);

    return (
        <div data-visual-anchor="workspace-resume-empty" className="flex min-h-full justify-center p-6 md:p-12">
            <div className="w-full max-w-[44rem] gap-y-6">

                <div className="mb-8 gap-y-2 text-center animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <h1 className="font-display text-4xl tracking-tight text-foreground md:text-5xl">
                        Get the first-read brief.
                    </h1>
                    <div className="flex items-center justify-center gap-2 pt-2 text-muted-foreground">
                        <SixSecondIcon className="size-5 shrink-0 text-brand" />
                        <p className="text-lg font-medium">Upload or paste the resume. Add a job only when it matters.</p>
                    </div>
                </div>

                {/* Job Context Banner - from Extension */}
                {loadedJobContext && (
                    <div className="mb-4 animate-in fade-in slide-in-from-top-2 rounded-xl border border-brand/20 bg-brand/5 p-4">
                        <div className="flex items-start gap-3">
                            <div className="size-10 rounded bg-brand/10 flex items-center justify-center shrink-0">
                                <Target className="size-5 text-brand" />
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
                                    {loadedJobContext.company} · saved job context loaded
                                    </p>
                                </div>
                            </div>
                        </div>
                )}

                {/* Main Card */}
                <div className="bg-white dark:bg-card border border-border/45 rounded-2xl overflow-hidden shadow-[0_20px_48px_-40px_rgba(15,23,42,0.18)]">

                    {/* Section 1: The Input (Hero) */}
                    <div className="p-6 md:p-8 gap-y-6">

                        {/* Dropzone - Unified Component */}
                        <ResumeDropzone
                            variant="compact"
                            onFileSelect={handleFileSelect}
                            fileName={fileName}
                            onRemoveFile={handleRemoveFile}
                        />

                        <div className="rounded-xl border border-brand/20 bg-brand/5 p-4 md:p-5">
                            <div className="flex items-start gap-3">
                                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand" />
                                <div className="gap-y-1.5">
                                    <p className="text-sm font-medium text-foreground">{workspaceTrustMessage.title}</p>
                                    <p className="text-sm leading-7 text-muted-foreground">
                                        {workspaceTrustMessage.body} {workspaceTrustMessage.detail}
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
                            <div className="gap-y-4">
                                {!showPaste ? (
                                    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 pt-1">
                                        <button type="button"
                                            onClick={() => setShowPaste(true)}
                                            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border/45 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-brand/35 hover:bg-brand/5 hover:text-foreground"
                                        >
                                            <AlignLeft className="size-4" />
                                            Paste text instead
                                        </button>
                                        {onSampleReport && (
                                            <button type="button"
                                                onClick={onSampleReport}
                                                className="inline-flex min-h-11 items-center gap-2 px-3 py-2 text-sm font-medium text-brand transition-colors hover:text-brand/80"
                                            >
                                                <FileText className="size-4" />
                                                See example report
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="animate-in fade-in slide-in-from-top-2 gap-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Paste text</span>
                                            <div className="flex items-center gap-3">
                                                {onSampleReport && (
                                                    <button type="button"
                                                        onClick={onSampleReport}
                                                        className="min-h-11 text-xs font-medium text-brand transition-colors hover:text-brand/80"
                                                    >
                                                        See example report
                                                    </button>
                                                )}
                                                <button type="button"
                                                    onClick={() => setShowPaste(false)}
                                                    className="min-h-11 text-xs text-muted-foreground hover:text-foreground"
                                                >
                                                    Use file upload
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
                                        <div className="flex items-center gap-2 rounded border border-warning/20 bg-warning/10 px-3 py-2 text-xs text-warning">
                                            <Info className="size-3.5" />
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
                        <div className="gap-y-3">
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
                                        "size-8 rounded flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors",
                                        showJD ? "bg-brand/20 text-brand" : "bg-muted text-muted-foreground"
                                    )}>
                                        <Target className="size-4" strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <span className={cn(
                                            "block text-sm font-medium transition-colors",
                                            showJD ? "text-brand" : "text-foreground"
                                        )}>
                                            Check fit for a specific job
                                        </span>
                                        <span className="block text-xs text-muted-foreground mt-0.5">
                                            Optional: paste a posting to include role fit and missing signals
                                        </span>
                                    </div>
                                </div>
                                <ChevronDown className={cn(
                                    "size-4 text-muted-foreground transition-transform duration-200 flex-shrink-0",
                                    showJD && "rotate-180 text-brand"
                                )} />
                            </button>

                            {showJD && (
                                <div className="animate-in fade-in slide-in-from-top-1 gap-y-2">
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
                                            <span className="inline-block size-1.5 rounded-full bg-brand" />
                                            Job context loaded. This report will name fit, gaps, and missing signals.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer CTA */}
                    <div className="border-t border-border/50 bg-secondary/20 p-6 md:p-8">
                        <Button
                            variant="brand"
                            size="lg"
                            className="h-12 w-full text-base font-medium transition-transform active:scale-[0.99]"
                            onClick={onRun}
                            disabled={!hasContent}
                            isLoading={isLoading}
                        >
                            {isLoading ? "Running Analysis..." : (
                                <span className="flex items-center gap-2">
                                    Get Recruiter Brief <ArrowRight className="size-4" />
                                </span>
                            )}
                        </Button>

                        <div className="mt-4 flex flex-col items-center gap-2.5 text-center">
                            <TrustBadges variant="inline" className="flex-wrap justify-center gap-x-3 gap-y-1 text-xs" />
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground/70">
                                {getRunHint()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                <Link href="/security" className="underline underline-offset-4 hover:text-foreground">Data handling</Link>
                                {" · "}
                                <Link href="/methodology" className="underline underline-offset-4 hover:text-foreground">Scoring methodology</Link>
                                {" · "}
                                <Link href="/extension" className="underline underline-offset-4 hover:text-foreground">Chrome extension</Link>
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
