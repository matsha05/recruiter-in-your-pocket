"use client";

import { useEffect, useRef, useState } from "react";
import {
    ArrowRight,
    CaretDown,
    Check,
    Info,
    LockKey,
    TextAlignLeft,
    Target,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { ResumeDropzone } from "@/components/upload/ResumeDropzone";
import { cn } from "@/lib/utils";

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
    isRevision?: boolean;
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
    loadedJobContext,
    isRevision = false,
}: InputPanelProps) {
    const [fileName, setFileName] = useState<string | null>(null);
    const [showJD, setShowJD] = useState(!!loadedJobContext);
    const [showPaste, setShowPaste] = useState(false);
    const [hasRejectedResume, setHasRejectedResume] = useState(false);
    const pasteInputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (loadedJobContext) setShowJD(true);
    }, [loadedJobContext]);

    useEffect(() => {
        if (showPaste) pasteInputRef.current?.focus({ preventScroll: true });
    }, [showPaste]);

    const handleFileSelect = async (file: File) => {
        setFileName(null);
        const accepted = await onFileSelect(file);
        if (accepted !== false) setFileName(file.name);
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
        if (freeUsesRemaining > 0) return "Your first report is included";
        return "A Job Search Pass is required for another report";
    };

    const charCount = resumeText.length;
    const isShortResume = charCount > 0 && charCount < 1500;
    const hasContent = Boolean(fileName || resumeText.length > 0);

    return (
        <div
            data-visual-anchor="workspace-resume-empty"
            className="min-h-full bg-mineral px-4 pb-14 pt-9 sm:px-6 sm:pt-12 lg:pb-20 lg:pt-16"
        >
            <div className="mx-auto w-full max-w-5xl">
                <header className="mx-auto max-w-3xl text-center">
                    <p className="text-2xs font-semibold uppercase riyp-track-015 text-brand">{isRevision ? "Second read" : "Recruiter first read"}</p>
                    <h1 className="workspace-first-read-title mt-6 font-display font-semibold tracking-[-0.055em] text-foreground">
                        {isRevision ? "Now let’s see what changed." : <>Let&apos;s see what <span className="riyp-marker">lands.</span></>}
                    </h1>
                    <p className="mx-auto mt-5 max-w-xl text-lg leading-7 text-muted-foreground sm:leading-8">
                        {isRevision
                            ? "Upload the revised resume. We’ll compare its opening read with the report you just saw."
                            : "Upload the resume you’re about to send. We’ll show you what lands, where the reader has to guess, and what to change first."}
                    </p>
                </header>

                {loadedJobContext && (
                    <div className="mx-auto mt-7 flex max-w-3xl items-start gap-3 border-y border-brand/25 bg-brand/5 px-4 py-3.5">
                        <Target className="mt-0.5 size-5 shrink-0 text-brand" weight="duotone" />
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">{loadedJobContext.title}</p>
                            <p className="truncate text-xs text-muted-foreground">{loadedJobContext.company} · role context added</p>
                        </div>
                        {loadedJobContext.score != null && loadedJobContext.score > 0 && (
                            <span className="shrink-0 text-xs font-semibold text-brand">{loadedJobContext.score}% match</span>
                        )}
                    </div>
                )}

                <section className="workspace-first-read-panel relative mx-auto mt-5 overflow-hidden sm:mt-7">
                    <div>
                        {!showPaste ? (
                            <ResumeDropzone
                                variant="compact"
                                onFileSelect={handleFileSelect}
                                fileName={fileName}
                                onRemoveFile={handleRemoveFile}
                                onValidationStateChange={setHasRejectedResume}
                            />
                        ) : (
                            <div className="animate-in fade-in slide-in-from-top-2">
                                <div className="mb-3 flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-foreground">Paste your resume</p>
                                        <p className="mt-0.5 text-xs text-muted-foreground">Formatting can be rough. We only need the words.</p>
                                    </div>
                                    <button
                                        type="button"
                                        data-testid="workspace-upload-mode"
                                        onClick={() => setShowPaste(false)}
                                        className="min-h-11 shrink-0 text-sm font-medium text-brand hover:text-brand/75"
                                    >
                                        Upload a file
                                    </button>
                                </div>
                                <textarea
                                    ref={pasteInputRef}
                                    data-testid="workspace-resume-text"
                                    value={resumeText}
                                    onChange={(event) => onResumeTextChange(event.target.value)}
                                    placeholder="Paste your resume here…"
                                        className="riyp-border-paper-line min-h-60 w-full resize-y border bg-paper-muted px-4 py-4 text-base leading-7 text-foreground placeholder:text-muted-foreground focus-visible:border-brand/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/15"
                                />
                                {isShortResume && (
                                    <div className="mt-3 flex items-start gap-2 border-l-2 border-warning px-3 py-1 text-xs leading-5 text-muted-foreground">
                                        <Info className="mt-0.5 size-4 shrink-0 text-warning" />
                                        This is a short resume ({charCount} characters), so the review may have less to work with.
                                    </div>
                                )}
                            </div>
                        )}

                        {!fileName && !showPaste && (
                            <div className={cn(hasRejectedResume ? "mt-4" : "mt-3", "text-center")}>
                                <button
                                    type="button"
                                    data-testid="workspace-paste-mode"
                                    onClick={() => setShowPaste(true)}
                                    className="inline-flex min-h-11 items-center gap-2 px-3 text-lg font-medium text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    <TextAlignLeft className="size-4" />
                                    Paste the text instead
                                </button>
                            </div>
                        )}

                        <div className="riyp-border-paper-line mt-5 border-y py-2">
                            <button
                                type="button"
                                data-testid="workspace-role-toggle"
                                onClick={() => setShowJD((current) => !current)}
                                aria-expanded={showJD}
                                className="workspace-role-toggle focus-ring flex w-full items-center gap-3 text-left"
                            >
                                <Target className={cn("size-5 shrink-0", showJD ? "text-brand" : "text-muted-foreground")} weight="duotone" />
                                <span className="min-w-0 flex-1">
                                    <span className="block text-lg font-medium text-foreground">Tailor it to a role <span className="font-normal text-muted-foreground">(optional)</span></span>
                                    <span className="mt-0.5 block text-sm text-muted-foreground">Add the job posting for role-specific feedback.</span>
                                </span>
                                {jobDescription.length > 0 && <Check className="size-4 text-brand" weight="bold" />}
                                <CaretDown className={cn("size-4 text-muted-foreground transition-transform", showJD && "rotate-180")} />
                            </button>

                            {showJD && (
                                <div className="animate-in fade-in slide-in-from-top-1 pb-2">
                                    <textarea
                                        data-testid="workspace-job-description"
                                        value={jobDescription}
                                        onChange={(event) => onJobDescChange(event.target.value)}
                                        className="riyp-border-paper-line min-h-40 w-full resize-y border bg-paper-muted px-4 py-3 text-base leading-7 placeholder:text-muted-foreground focus-visible:border-brand/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/15"
                                        placeholder="Paste the job posting here…"
                                    />
                                </div>
                            )}
                        </div>

                        <Button
                            data-testid="workspace-run-report"
                            variant="brand"
                            size="lg"
                            className="mt-5 h-14 w-full text-lg font-semibold disabled:border disabled:border-border/60 disabled:bg-secondary disabled:text-muted-foreground disabled:opacity-100 disabled:shadow-none"
                            onClick={onRun}
                            disabled={!hasContent}
                            isLoading={isLoading}
                        >
                            {isLoading ? "Reading your resume…" : hasContent ? (
                                <span className="flex items-center gap-2">
                                    {isRevision ? "Compare the new read" : "See my first read"} <ArrowRight className="size-5" weight="bold" />
                                </span>
                            ) : hasRejectedResume ? "Choose a valid resume to begin" : "Choose a resume to begin"}
                        </Button>

                        <div className="riyp-border-paper-line mt-6 border-t pt-5">
                            <div className="flex items-center justify-center gap-2 text-base font-medium text-foreground">
                                <LockKey className="size-4 text-citron" weight="duotone" />
                                Private by default · {getRunHint()}
                            </div>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
}
