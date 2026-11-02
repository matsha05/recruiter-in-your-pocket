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
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ResumeDropzone } from "@/components/upload/ResumeDropzone";
import { MIN_RESUME_CHARS, SHORT_RESUME_CHARS } from "@/lib/resume-input";
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
    onOpenLastReport?: () => void;
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
    onOpenLastReport,
    loadedJobContext,
    isRevision = false,
}: InputPanelProps) {
    const [fileName, setFileName] = useState<string | null>(null);
    const [showJD, setShowJD] = useState(!!loadedJobContext);
    // The panel remounts after a failed run; reopen pasted text instead of hiding it behind the upload view.
    const [showPaste, setShowPaste] = useState(() => !commandUploadName && resumeText.trim().length > 0);
    const [hasRejectedResume, setHasRejectedResume] = useState(false);
    const [isReadingFile, setIsReadingFile] = useState(false);
    const pasteInputRef = useRef<HTMLTextAreaElement>(null);
    // Learn about an operator pause before anyone uploads, not after a failed run.
    const [generationPaused, setGenerationPaused] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        fetch("/api/generation-status", { cache: "no-store", signal: controller.signal })
            .then((response) => (response.ok ? response.json() : null))
            .then((data) => setGenerationPaused(data?.paused === true))
            .catch(() => { /* Unknown means not paused; the run itself still enforces the pause. */ });
        return () => controller.abort();
    }, []);

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
        setIsReadingFile(true);
        setFileName(null);
        try {
            const accepted = await onFileSelect(file);
            if (accepted !== false) setFileName(file.name);
            return accepted;
        } finally {
            setIsReadingFile(false);
        }
    };

    const handleRemoveFile = () => {
        setFileName(null);
        onResumeTextChange("");
    };

    // The extracted text becomes ordinary pasted text the visitor can correct.
    const handleEditReadText = () => {
        setFileName(null);
        setShowPaste(true);
    };

    const getRunHint = () => {
        const membership = user?.membership;
        if (membership === "monthly" || membership === "lifetime") return "Paid access active";
        if (membership === "credit") {
            const paid = Number(user?.paidUsesLeft || 0);
            return `${paid} ${paid === 1 ? "report" : "reports"} left on your pass`;
        }
        if (freeUsesRemaining > 0) return "Your first report is free";
        if (!user) return "Sign in for your free report, or get a Job Search Pass";
        return "Another report needs a Job Search Pass";
    };

    const charCount = resumeText.trim().length;
    const isTooShort = charCount > 0 && charCount < MIN_RESUME_CHARS;
    const isShortResume = charCount >= MIN_RESUME_CHARS && charCount < SHORT_RESUME_CHARS;
    const hasContent = Boolean(fileName || resumeText.length > 0);
    const wordCount = charCount > 0 ? resumeText.trim().split(/\s+/).length : 0;
    const showReadPreview = Boolean(fileName && !showPaste && charCount > 0);

    return (
        <div
            data-visual-anchor="workspace-resume-empty"
            className={styles.root}
        >
            <div className={styles.content}>
                <header className={styles.intro}>
                    <p className={styles.eyebrow}>{isRevision ? "Re-check" : "New report"}</p>
                    <h1 className={styles.title}>
                        {isRevision ? "Now let’s see what changed." : "Let’s see what they see."}
                    </h1>
                    <p className={styles.description}>
                        {isRevision
                            ? "Add the new version. We’ll put it beside the last one and show you whether the Critical Miss changed."
                            : "Add the resume you’re about to send. We’ll read the whole thing and show you what comes through, what slips past, and what to fix first."}
                    </p>
                    {onOpenLastReport && (
                        <button type="button" data-testid="workspace-open-last-report" onClick={onOpenLastReport} className="riyp-link mt-3 min-h-11 text-sm font-semibold">
                            Open your last report
                        </button>
                    )}
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

                {generationPaused && (
                    <div className={styles.pausedNotice} role="status">
                        <Info className="mt-0.5 size-5 shrink-0 text-foreground" weight="duotone" aria-hidden="true" />
                        <div>
                            <p className="font-medium text-foreground">New reports are paused for now.</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                We&apos;re fixing a problem, so an upload won&apos;t run yet. Saved reports still open.{" "}
                                <Link href="/status" className="riyp-link font-medium text-foreground">Check status</Link>
                            </p>
                        </div>
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
                                readyLabel={isTooShort ? "Too short to review" : undefined}
                            />
                        ) : (
                            <div className="ui-state-enter">
                                <div className={styles.pasteHeader}>
                                    <div>
                                        <p className="text-base font-semibold text-foreground">Paste your resume</p>
                                        <p className="mt-1 text-sm text-muted-foreground">Formatting can be rough. We only need the words.</p>
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
                                    aria-describedby={isTooShort ? "workspace-resume-length" : undefined}
                                    aria-invalid={isTooShort || undefined}
                                    className={cn(styles.field, styles.resumeField)}
                                />
                                {isTooShort && (
                                    <p id="workspace-resume-length" data-testid="workspace-resume-too-short" className={styles.lengthGuard}>
                                        <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                                        <span>That&apos;s {charCount} characters. We need at least {MIN_RESUME_CHARS} to review it, so add the whole resume, including your experience.</span>
                                    </p>
                                )}
                                {isShortResume && (
                                    <div className="mt-3 flex items-start gap-2 border-l-2 border-warning px-3 py-1 text-xs text-muted-foreground">
                                        <Info className="mt-0.5 size-4 shrink-0 text-warning" />
                                        This is a short resume ({charCount} characters), so the review may have less to work with.
                                    </div>
                                )}
                            </div>
                        )}

                        {showReadPreview && (
                            <details className={cn("ui-disclosure group", styles.readPreview)} open={isTooShort || undefined} data-testid="workspace-read-preview">
                                <summary className={cn(styles.readSummary, "focus-ring riyp-surface-link")}>
                                    <span className="min-w-0 flex-1">
                                        <span className="block text-sm font-semibold text-foreground">What we read</span>
                                        <span className="mt-0.5 block text-sm text-muted-foreground">
                                            {wordCount} {wordCount === 1 ? "word" : "words"} from your file. Check that nothing is missing.
                                        </span>
                                    </span>
                                    <CaretDown data-affordance className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
                                </summary>
                                {isTooShort && (
                                    <p id="workspace-resume-length" data-testid="workspace-resume-too-short" className={styles.lengthGuard}>
                                        <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                                        <span>We could only read {charCount} characters, and we need at least {MIN_RESUME_CHARS}. A scanned or image-only PDF often does this. Paste the text instead.</span>
                                    </p>
                                )}
                                <pre className={styles.readText} tabIndex={0} aria-label="Text we read from your file">{resumeText.trim()}</pre>
                                <button type="button" data-testid="workspace-edit-read-text" onClick={handleEditReadText} className={styles.textAction}>
                                    <TextAlignLeft className="size-4" aria-hidden="true" />
                                    {isTooShort ? "Paste the text instead" : "Fix the text"}
                                </button>
                            </details>
                        )}

                        {!fileName && !showPaste && (
                            <div className={cn(hasRejectedResume ? "mt-4" : "mt-3", "text-center")}>
                                <button
                                    type="button"
                                    data-testid="workspace-paste-mode"
                                    onClick={() => setShowPaste(true)}
                                    disabled={isReadingFile}
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
                                aria-controls="workspace-job-context"
                                className={cn(styles.roleToggle, "focus-ring")}
                            >
                                <Target className={cn(styles.roleIcon, "size-5 shrink-0", showJD ? "text-brand" : "text-muted-foreground")} weight="duotone" />
                                <span className="min-w-0 flex-1">
                                    <span className="block text-base font-semibold text-foreground">Compare with a job <span className="font-normal text-muted-foreground">(optional)</span></span>
                                    <span className="mt-0.5 block text-sm text-muted-foreground">Add a posting to see how your experience fits.</span>
                                </span>
                                {jobDescription.length > 0 && <Check className="size-4 text-brand" weight="bold" />}
                                <CaretDown className={cn("size-4 text-muted-foreground transition-transform", showJD && "rotate-180")} />
                            </button>

                            {showJD && (
                                <div id="workspace-job-context" className="ui-state-enter pb-3">
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
                            variant="primary"
                            className={styles.runAction}
                            onClick={onRun}
                            disabled={!hasContent || isTooShort || isReadingFile || generationPaused}
                            isLoading={isLoading}
                            loadingLabel="Reading your resume…"
                        >
                            {generationPaused ? "Reports are paused" : isTooShort ? "Add more of your resume to begin" : hasContent ? (
                                <span className="flex items-center gap-2">
                                    {isRevision ? "Compare my revision" : freeUsesRemaining > 0 ? "Get your free report" : "Get my report"} <ArrowRight className="size-5" weight="bold" />
                                </span>
                            ) : showPaste ? "Paste your resume to begin" : hasRejectedResume ? "Choose a valid resume to begin" : "Choose a resume to begin"}
                        </Button>

                        <div className={styles.privacy}>
                            <p className={styles.runHint}>{getRunHint()}</p>
                            <p className="mt-2 flex items-start justify-center gap-2" data-testid="workspace-privacy-line">
                                <LockKey className="mt-0.5 size-4 shrink-0 text-brand" weight="duotone" aria-hidden="true" />
                                <span>
                                    {user
                                        ? "OpenAI writes the report from your resume, and we don’t opt it into model training. Saved reports keep a short preview and the lines they quote."
                                        : "OpenAI writes the report from your resume. We don’t store the resume or opt it into model training."}{" "}
                                    <Link href="/privacy" className="riyp-link-quiet">How we handle your data</Link>
                                </span>
                            </p>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
}
