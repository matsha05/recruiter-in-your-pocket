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
import { MIN_RESUME_CHARS } from "@/lib/resume-input";
import { POSTING_READ_ADD_RESUME, POSTING_READ_INCLUDED_HINT, RESUME_ON_FILE_KEEP, RESUME_ON_FILE_KEPT, RESUME_ON_FILE_LOADED, RESUME_ON_FILE_OFFER, RESUME_ON_FILE_REMOVE, RESUME_ON_FILE_REMOVED } from "@/lib/reports/posting-read-terms";
import type { ResumeOnFileState } from "./hooks/useResumeOnFile";
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
    /** The server has answered what's left. Signed in and unknown: no free-report promise, no hint. */
    freeStatusKnown?: boolean;
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
    /** Arrived from a report's "Read it against a posting": the resume is kept, so open the posting field and focus it. */
    focusPosting?: boolean;
    /** A LinkedIn profile review takes LinkedIn's own PDF export: no pasted text, no posting (Nov 10, 2026). */
    document?: "resume" | "linkedin";
    /** With a pass, reading an already-read resume against a posting spends no report; say so once the posting is in. */
    postingReadIncluded?: boolean;
    /** Keeping the resume on file for posting reads (components/workspace/hooks/useResumeOnFile.ts). */
    resumeOnFile?: { state: ResumeOnFileState; onKeep: () => void; onRemove: () => void } | null;
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
    freeStatusKnown = true,
    user,
    onOpenLastReport,
    loadedJobContext,
    isRevision = false,
    focusPosting = false,
    document = "resume",
    postingReadIncluded = false,
    resumeOnFile = null,
}: InputPanelProps) {
    const isProfile = document === "linkedin";
    const [fileName, setFileName] = useState<string | null>(null);
    const [showJD, setShowJD] = useState(!!loadedJobContext || focusPosting);
    const postingRef = useRef<HTMLTextAreaElement>(null);
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
        if (!focusPosting) return;
        setShowJD(true);
        // After the field mounts: the resume is already here, so the posting is the one thing left to add.
        const frame = requestAnimationFrame(() => postingRef.current?.focus({ preventScroll: false }));
        return () => cancelAnimationFrame(frame);
    }, [focusPosting]);

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

    // The line under the button says what the next report costs, only when the button can't.
    const getRunHint = () => {
        if (postingReadIncluded && jobDescription.trim().length > 0) return POSTING_READ_INCLUDED_HINT;
        const membership = user?.membership;
        if (membership === "monthly" || membership === "lifetime") return null;
        if (membership === "credit") {
            const paid = Number(user?.paidUsesLeft || 0);
            return `${paid} ${paid === 1 ? "report" : "reports"} left on your pass`;
        }
        if (user && !freeStatusKnown) return null;
        if (freeUsesRemaining > 0) return null;
        if (!user) return "Sign in for your free report, or get a Job Search Pass";
        return "Another report needs a Job Search Pass";
    };

    // A pass holder or a signed-in person whose status hasn't loaded yet is never promised a free report.
    const hasPass = Boolean(user?.membership && user.membership !== "free");
    const runLabel = isRevision
        ? "Compare my revision"
        : hasPass || (user && !freeStatusKnown) || freeUsesRemaining <= 0 ? "Get my report" : "Get your free report";

    const charCount = resumeText.trim().length;
    const isTooShort = charCount > 0 && charCount < MIN_RESUME_CHARS;
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
                    <h1 className={styles.title}>
                        {isRevision ? "Now let’s see what changed." : isProfile ? "Let’s read your LinkedIn profile." : "Let’s see what they see."}
                    </h1>
                    {isProfile && (
                        <p className="mt-3 max-w-[34rem] text-base text-muted-foreground" data-testid="workspace-linkedin-help">
                            On your LinkedIn profile, choose Resources (or the ⋯ button), then Save to PDF. Upload that file here.{" "}
                            <a href="https://www.linkedin.com/in/me" target="_blank" rel="noopener noreferrer" className="riyp-link-quiet">Open your profile</a>
                        </p>
                    )}
                    {postingReadIncluded && !isProfile && !fileName && resumeText.trim().length === 0 && (
                        <p className="mt-3 max-w-[34rem] text-base text-muted-foreground" data-testid="workspace-posting-read-help">
                            {POSTING_READ_ADD_RESUME} {POSTING_READ_INCLUDED_HINT}
                        </p>
                    )}
                    {onOpenLastReport && !isProfile && (
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
                            <p className="truncate text-xs text-muted-foreground">{loadedJobContext.company}</p>
                        </div>
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

                <section className={styles.sheet} aria-label={isProfile ? "LinkedIn profile input" : "Resume input"}>
                    <div>
                        {!showPaste || isProfile ? (
                            <ResumeDropzone
                                document={document}
                                onFileSelect={handleFileSelect}
                                fileName={fileName}
                                onRemoveFile={handleRemoveFile}
                                onValidationStateChange={setHasRejectedResume}
                                readyLabel={isTooShort ? "Too short to review" : undefined}
                            />
                        ) : (
                            <div className="ui-state-enter">
                                <div className={styles.pasteHeader}>
                                    <p className="text-base font-semibold text-foreground">Paste your resume</p>
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
                            </div>
                        )}

                        {showReadPreview && (
                            <details className={cn("ui-disclosure group", styles.readPreview)} open={isTooShort || undefined} data-testid="workspace-read-preview">
                                <summary className={cn(styles.readSummary, "focus-ring riyp-surface-link")}>
                                    <span className="min-w-0 flex-1">
                                        <span className="block text-sm font-semibold text-foreground">What we read</span>
                                        <span className="mt-0.5 block text-sm text-muted-foreground">
                                            {wordCount} {wordCount === 1 ? "word" : "words"}
                                        </span>
                                    </span>
                                    <CaretDown data-affordance className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
                                </summary>
                                {isTooShort && (
                                    <p id="workspace-resume-length" data-testid="workspace-resume-too-short" className={styles.lengthGuard}>
                                        <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                                        <span>{isProfile ? `We could only read ${charCount} characters, and we need at least ${MIN_RESUME_CHARS}. Save a fresh PDF from your LinkedIn profile and upload that.` : `We could only read ${charCount} characters, and we need at least ${MIN_RESUME_CHARS}. A scanned or image-only PDF often does this. Paste the text instead.`}</span>
                                    </p>
                                )}
                                <pre className={styles.readText} tabIndex={0} aria-label="Text we read from your file">{resumeText.trim()}</pre>
                                {!isProfile && <button type="button" data-testid="workspace-edit-read-text" onClick={handleEditReadText} className={styles.textAction}>
                                    <TextAlignLeft className="size-4" aria-hidden="true" />
                                    {isTooShort ? "Paste the text instead" : "Fix the text"}
                                </button>}
                            </details>
                        )}

                        {!fileName && !showPaste && !isProfile && (
                            <div className={cn(hasRejectedResume ? "mt-4" : "mt-3", "flex flex-wrap items-center justify-center gap-x-6")}>
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
                                {/* The sample stays within reach of a visitor deciding whether to hand over the file (Impeccable 12). */}
                                {!user && !isRevision && (
                                    <Link href="/sample-report" className="riyp-link-quiet inline-flex min-h-11 items-center text-sm" data-testid="workspace-sample-link">See Jordan&apos;s report</Link>
                                )}
                            </div>
                        )}

                        {/* The privacy line sits where the decision is made, under the file picker (Impeccable 13). */}
                        <p className={cn(styles.privacy, "mt-4 flex items-start gap-2")} data-testid="workspace-privacy-line">
                            <LockKey className="mt-0.5 size-4 shrink-0 text-brand" weight="bold" aria-hidden="true" />
                            <span>
                                {isProfile
                                    ? "OpenAI writes the review from the PDF you upload, and we don’t opt it into model training. We never sign in to your LinkedIn account."
                                    : user
                                        ? "OpenAI writes the report from your resume, and we don’t opt it into model training."
                                        : "OpenAI writes the report from your resume. We don’t store the resume or opt it into model training."}{" "}
                                <Link href="/privacy" className="riyp-link-quiet">How we handle your data</Link>
                            </span>
                        </p>

                        {resumeOnFile && postingReadIncluded && !isProfile && resumeText.trim().length > 0 && (
                            <p className="mt-4 text-sm text-muted-foreground" role="status" data-testid="resume-on-file" data-state={resumeOnFile.state.status}>
                                {resumeOnFile.state.status === "loaded" ? (
                                    <>{RESUME_ON_FILE_LOADED}{" "}<button type="button" className="riyp-link-quiet" onClick={resumeOnFile.onRemove} data-testid="resume-on-file-remove">{RESUME_ON_FILE_REMOVE}</button></>
                                ) : resumeOnFile.state.status === "kept" ? (
                                    <>{RESUME_ON_FILE_KEPT}{" "}<button type="button" className="riyp-link-quiet" onClick={resumeOnFile.onRemove} data-testid="resume-on-file-remove">{RESUME_ON_FILE_REMOVE}</button></>
                                ) : resumeOnFile.state.status === "removed" ? (
                                    RESUME_ON_FILE_REMOVED
                                ) : resumeOnFile.state.status === "error" ? (
                                    resumeOnFile.state.message
                                ) : (
                                    <>{RESUME_ON_FILE_OFFER}{" "}<button type="button" className="riyp-link-quiet" onClick={resumeOnFile.onKeep} disabled={resumeOnFile.state.status === "saving"} data-testid="resume-on-file-keep">{RESUME_ON_FILE_KEEP}</button></>
                                )}
                            </p>
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
                                <Target className={cn(styles.roleIcon, "size-5 shrink-0", showJD ? "text-brand" : "text-muted-foreground")} weight="bold" />
                                <span className="min-w-0 flex-1">
                                    <span className="block text-base font-semibold text-foreground">Compare with a job <span className="font-normal text-muted-foreground">(optional)</span></span>
                                </span>
                                {jobDescription.length > 0 && <Check className="size-4 text-brand" weight="bold" />}
                                <CaretDown className={cn("size-4 text-muted-foreground transition-transform", showJD && "rotate-180")} />
                            </button>

                            {showJD && (
                                <div id="workspace-job-context" className="ui-state-enter pb-3">
                                    <label htmlFor="workspace-job-description" className="sr-only">Job posting</label>
                                    <textarea
                                        ref={postingRef}
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
                            loadingLabel={isProfile ? "Reading your profile…" : "Reading your resume…"}
                        >
                            {generationPaused ? "Reports are paused" : isTooShort ? (isProfile ? "That PDF is too short to review" : "Add more of your resume to begin") : hasContent ? (
                                <span className="flex items-center gap-2">
                                    {runLabel} <ArrowRight className="size-5" weight="bold" />
                                </span>
                            ) : isProfile ? "Choose your LinkedIn PDF to begin" : showPaste ? "Paste your resume to begin" : hasRejectedResume ? "Choose a valid resume to begin" : "Choose a resume to begin"}
                        </Button>

                        {getRunHint() && (
                            <div className={styles.privacy}>
                                <p className={styles.runHint}>{getRunHint()}</p>
                            </div>
                        )}
                    </div>
                </section>

            </div>
        </div>
    );
}
