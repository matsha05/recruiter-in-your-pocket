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
import styles from "./InputPanel.module.css";

interface InputPanelProps {
    resumeText: string;
    jobDescription: string;
    onResumeTextChange: (text: string) => void;
    onJobDescChange: (text: string) => void;
    onFileSelect: (file: File) => void | boolean | Promise<void | boolean>;
    commandUploadName?: string | null;
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
    commandUploadName,
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
        if (!commandUploadName) return;
        setFileName(commandUploadName);
        setShowPaste(false);
        setHasRejectedResume(false);
    }, [commandUploadName]);

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
            className={styles.root}
        >
            <div className={styles.content}>
                <header className={styles.intro}>
                    <p className={styles.eyebrow}>{isRevision ? "Resume comparison" : "Resume review"}</p>
                    <h1 className={styles.title}>
                        {isRevision ? "Now let’s see what changed." : "Start with your resume."}
                    </h1>
                    <p className={styles.description}>
                        {isRevision
                            ? "Upload your revision to see what improved and what still needs attention."
                            : "Add the resume you’re about to send. We’ll look at the whole document, show you what’s clear, and help you decide what to change first."}
                    </p>
                </header>

                {loadedJobContext && (
                    <div className={styles.jobContext}>
                        <Target className="mt-0.5 size-5 shrink-0 text-brand" weight="duotone" />
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">{loadedJobContext.title}</p>
                            <p className="truncate text-xs text-muted-foreground">{loadedJobContext.company} · job posting added</p>
                        </div>
                        {loadedJobContext.score != null && loadedJobContext.score > 0 && (
                            <span className="shrink-0 text-xs font-semibold text-brand">{loadedJobContext.score}% match</span>
                        )}
                    </div>
                )}

                <section className={styles.sheet} aria-label="Resume input">
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
                            <div className="animate-in fade-in slide-in-from-top-2 motion-reduce:animate-none">
                                <div className={styles.pasteHeader}>
                                    <div>
                                        <p className="text-base font-semibold text-foreground">Paste your resume</p>
                                        <p className="mt-1 text-sm leading-5 text-muted-foreground">Formatting can be rough. We only need the words.</p>
                                    </div>
                                    <button
                                        type="button"
                                        data-testid="workspace-upload-mode"
                                        onClick={() => setShowPaste(false)}
                                        className={styles.textAction}
                                    >
                                        Upload a file
                                    </button>
                                </div>
                                <label htmlFor="workspace-resume-text" className="sr-only">Resume text</label>
                                <textarea
                                    id="workspace-resume-text"
                                    ref={pasteInputRef}
                                    data-testid="workspace-resume-text"
                                    value={resumeText}
                                    onChange={(event) => onResumeTextChange(event.target.value)}
                                    placeholder="Paste your resume here…"
                                    className={cn(styles.field, styles.resumeField)}
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
                                    className={styles.textAction}
                                >
                                    <TextAlignLeft className="size-4" />
                                    Paste the text instead
                                </button>
                            </div>
                        )}

                        <div className={styles.jobSection}>
                            <button
                                type="button"
                                data-testid="workspace-role-toggle"
                                onClick={() => setShowJD((current) => !current)}
                                aria-expanded={showJD}
                                className={cn(styles.roleToggle, "focus-ring")}
                            >
                                <Target className={cn("size-5 shrink-0", showJD ? "text-brand" : "text-muted-foreground")} weight="duotone" />
                                <span className="min-w-0 flex-1">
                                    <span className="block text-base font-semibold text-foreground">Compare with a job <span className="font-normal text-muted-foreground">(optional)</span></span>
                                    <span className="mt-0.5 block text-sm text-muted-foreground">Add a posting to see how your experience fits.</span>
                                </span>
                                {jobDescription.length > 0 && <Check className="size-4 text-brand" weight="bold" />}
                                <CaretDown className={cn("size-4 text-muted-foreground transition-transform", showJD && "rotate-180")} />
                            </button>

                            {showJD && (
                                <div className="animate-in fade-in slide-in-from-top-1 pb-3 motion-reduce:animate-none">
                                    <label htmlFor="workspace-job-description" className="sr-only">Job posting</label>
                                    <textarea
                                        id="workspace-job-description"
                                        data-testid="workspace-job-description"
                                        value={jobDescription}
                                        onChange={(event) => onJobDescChange(event.target.value)}
                                        className={styles.field}
                                        placeholder="Paste the job posting here…"
                                    />
                                </div>
                            )}
                        </div>

                        <Button
                            data-testid="workspace-run-report"
                            variant="brand"
                            size="lg"
                            className={styles.runAction}
                            onClick={onRun}
                            disabled={!hasContent}
                            isLoading={isLoading}
                        >
                            {isLoading ? "Reading your resume…" : hasContent ? (
                                <span className="flex items-center gap-2">
                                    {isRevision ? "Compare my revision" : "Get my report"} <ArrowRight className="size-5" weight="bold" />
                                </span>
                            ) : hasRejectedResume ? "Choose a valid resume to begin" : "Choose a resume to begin"}
                        </Button>

                        <div className={styles.privacy}>
                            <div className="flex items-start justify-center gap-2">
                                <LockKey className="mt-0.5 size-4 shrink-0 text-brand" weight="duotone" />
                                <span>Private by default · {getRunHint()}</span>
                            </div>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
}
