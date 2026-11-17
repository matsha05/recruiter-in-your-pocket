"use client";

import { FILE_UNREADABLE_MESSAGE } from "@/lib/reports/file-read";
import { useState, useCallback, useEffect, useRef, type MouseEvent as ReactMouseEvent } from "react";
import { useDropzone, type DropEvent, type FileRejection } from "react-dropzone";
import { CircleNotch, FilePdf, FileText, WarningCircle, X } from "@phosphor-icons/react";
import { Paper } from "@/components/materials/Paper";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { ChangeEvent } from "react";
import styles from "./ResumeDropzone.module.css";

interface ResumeDropzoneProps {
    onFileSelect: (file: File) => void | boolean | Promise<void | boolean>;
    isProcessing?: boolean;
    className?: string;
    /** Show file name when uploaded */
    fileName?: string | null;
    /** Callback to remove file */
    onRemoveFile?: () => void;
    /** Reports whether the current file selection is invalid. */
    onValidationStateChange?: (hasError: boolean) => void;
    /** Replaces "Ready to review" when the file was read but can't be reviewed. */
    readyLabel?: string;
    /** Replaces "Remove" when the card shows something other than a file just chosen (a resume kept on file). */
    removeLabel?: string;
    /** What is being uploaded; a LinkedIn profile PDF gets its own words (Nov 10, 2026). */
    document?: "resume" | "linkedin";
}

const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024;

function formatMegabytes(bytes: number) {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function ResumeDropzone({
    onFileSelect,
    isProcessing = false,
    className,
    fileName,
    readyLabel = "Ready to review",
    removeLabel,
    document = "resume",
    onRemoveFile,
    onValidationStateChange,
}: ResumeDropzoneProps) {
    const [error, setError] = useState<string | null>(null);
    const [rejectedFile, setRejectedFile] = useState<File | null>(null);
    const [localFileName, setLocalFileName] = useState<string | null>(null);
    const [readingFileName, setReadingFileName] = useState<string | null>(null);
    const selectionRef = useRef({ id: 0, pending: false });
    const successActionRef = useRef<HTMLButtonElement>(null);
    const chooseActionRef = useRef<HTMLButtonElement>(null);
    const shouldMoveFocusOnSuccessRef = useRef(false);
    const shouldRestoreChooseFocusRef = useRef(false);
    const displayFileName = fileName !== undefined ? fileName : localFileName;
    const isBusy = isProcessing || readingFileName !== null;

    useEffect(() => () => {
        selectionRef.current.id += 1;
    }, []);

    useEffect(() => {
        if (!displayFileName || isBusy || !shouldMoveFocusOnSuccessRef.current) return;

        shouldMoveFocusOnSuccessRef.current = false;
        const frame = window.requestAnimationFrame(() => {
            successActionRef.current?.focus({ preventScroll: true });
        });
        return () => window.cancelAnimationFrame(frame);
    }, [displayFileName, isBusy]);

    useEffect(() => {
        if (displayFileName || error || !shouldRestoreChooseFocusRef.current) return;
        shouldRestoreChooseFocusRef.current = false;
        const frame = window.requestAnimationFrame(() => chooseActionRef.current?.focus({ preventScroll: true }));
        return () => window.cancelAnimationFrame(frame);
    }, [displayFileName, error]);

    const onDrop = useCallback(async (acceptedFiles: File[], fileRejections: FileRejection[], event: DropEvent) => {
        if (isProcessing || selectionRef.current.pending) return;
        if (!Array.isArray(event) && event.type === "drop") {
            shouldMoveFocusOnSuccessRef.current = false;
        }
        setError(null);
        setRejectedFile(null);
        onValidationStateChange?.(false);

        const selectedFile = acceptedFiles[0] ?? fileRejections[0]?.file;
        if (selectedFile && selectedFile.size > MAX_FILE_SIZE_BYTES) {
            shouldMoveFocusOnSuccessRef.current = false;
            setRejectedFile(selectedFile);
            setError(`This file is ${formatMegabytes(selectedFile.size)}. Choose a PDF or DOCX under 4 MB.`);
            onValidationStateChange?.(true);
            return;
        }

        // Handle rejections (wrong type, too big)
        if (fileRejections.length > 0) {
            shouldMoveFocusOnSuccessRef.current = false;
            const rejection = fileRejections[0];
            setRejectedFile(rejection.file);
            onValidationStateChange?.(true);
            if (rejection.errors.some((item) => item.code === "file-too-large")) {
                setError(`This file is ${formatMegabytes(rejection.file.size)}. Choose a PDF or DOCX under 4 MB.`);
            } else if (rejection.errors[0]?.code === "file-invalid-type") {
                setError("That file type won’t open here. Choose a PDF or DOCX.");
            } else {
                setError(rejection.errors[0]?.message || "We couldn’t read this file. Try another PDF or DOCX.");
            }
            return;
        }

        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            const selectionId = ++selectionRef.current.id;
            selectionRef.current.pending = true;
            setReadingFileName(file.name);
            try {
                const accepted = await onFileSelect(file);
                if (selectionId !== selectionRef.current.id) return;
                if (accepted === false) {
                    setRejectedFile(file);
                    setError(FILE_UNREADABLE_MESSAGE);
                    onValidationStateChange?.(true);
                    shouldMoveFocusOnSuccessRef.current = false;
                } else if (fileName === undefined) {
                    setLocalFileName(file.name);
                }
            } catch {
                if (selectionId !== selectionRef.current.id) return;
                setRejectedFile(file);
                setError("We couldn’t read this file. Try again or choose another PDF or DOCX.");
                onValidationStateChange?.(true);
                shouldMoveFocusOnSuccessRef.current = false;
            } finally {
                if (selectionId === selectionRef.current.id) {
                    selectionRef.current.pending = false;
                    setReadingFileName(null);
                }
            }
        }
    }, [onFileSelect, fileName, isProcessing, onValidationStateChange]);

    const handleRemoveFile = (event: ReactMouseEvent<HTMLButtonElement>) => {
        shouldRestoreChooseFocusRef.current = event.detail === 0;
        shouldMoveFocusOnSuccessRef.current = false;
        setLocalFileName(null);
        setRejectedFile(null);
        setError(null);
        onValidationStateChange?.(false);
        if (onRemoveFile) {
            onRemoveFile();
        }
    };

    const handleNativeFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.currentTarget.files?.[0];
        if (!selectedFile || selectedFile.size <= MAX_FILE_SIZE_BYTES) return;

        event.stopPropagation();
        shouldMoveFocusOnSuccessRef.current = false;
        setLocalFileName(null);
        setRejectedFile(selectedFile);
        setError(`This file is ${formatMegabytes(selectedFile.size)}. Choose a PDF or DOCX under 4 MB.`);
        onValidationStateChange?.(true);
    };

    const { getRootProps, getInputProps, isDragActive, isDragReject, open } = useDropzone({
        onDrop,
        accept: {
            "application/pdf": [".pdf"],
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
        },
        maxFiles: 1,
        maxSize: MAX_FILE_SIZE_BYTES,
        disabled: isBusy,
        multiple: false,
        noClick: false,
        noKeyboard: true,
    });

    const openFilePicker = (event: ReactMouseEvent<HTMLButtonElement>) => {
        shouldMoveFocusOnSuccessRef.current = event.detail === 0;
        open();
    };

    const handleDropzonePointerDown = useCallback(() => {
        shouldMoveFocusOnSuccessRef.current = false;
    }, []);

    return (
        <div className={cn("w-full", className)}>
            <input {...getInputProps()} onChangeCapture={handleNativeFileChange} suppressHydrationWarning aria-label={document === "linkedin" ? "Upload your LinkedIn profile PDF" : "Upload resume file (PDF or DOCX)"} />
            {readingFileName || (displayFileName && !error) ? (
                <Paper kind="plain" className={cn(styles.accepted, "ui-state-enter")} aria-busy={isBusy}>
                    <span
                        role="status"
                        aria-live="polite"
                        aria-atomic="true"
                        className="flex min-w-0 items-center gap-4 text-sm font-medium text-brand"
                    >
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand/10">
                            {isBusy ? <CircleNotch aria-hidden="true" className="size-5 animate-spin motion-reduce:animate-none" /> : <FileText aria-hidden="true" className="size-5" weight="duotone" />}
                        </span>
                        <span className="min-w-0">
                            <span className="block truncate text-base font-medium text-foreground">{readingFileName || displayFileName}</span>
                            <span className="mt-1 block text-xs font-normal text-muted-foreground">{isBusy ? (document === "linkedin" ? "Reading your LinkedIn PDF…" : "Reading your resume file…") : readyLabel}</span>
                        </span>
                    </span>
                    <Button
                        ref={successActionRef}
                        aria-label={removeLabel ?? `Remove ${displayFileName}`}
                        variant="quiet"
                        size="sm"
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={handleRemoveFile}
                        disabled={isBusy}
                   >
                        {removeLabel ?? "Remove"}
                    </Button>
                </Paper>
            ) : rejectedFile && error ? (
                <Paper kind="plain" className={styles.rejected}>
                    <div className={styles.rejectedFile}>
                        <div className="flex min-w-0 items-center gap-4">
                            <span className="flex size-11 shrink-0 items-center justify-center text-destructive">
                                <FilePdf className="size-10" weight="duotone" />
                            </span>
                            <div className="min-w-0">
                                <p className="truncate text-base font-semibold text-foreground">{rejectedFile.name}</p>
                                <p className="mt-1 text-sm tabular-nums text-muted-foreground">{formatMegabytes(rejectedFile.size)}</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            aria-label={`Remove ${rejectedFile.name}`}
                            onClick={handleRemoveFile}
                            className="focus-ring inline-flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        >
                            <X className="size-4" weight="bold" />
                        </button>
                    </div>
                    <div className="mt-5 flex items-center gap-2 text-destructive">
                        <WarningCircle className="size-5 shrink-0" weight="bold" />
                        <p role="alert" className="text-base">{error}</p>
                    </div>
                    <Button
                        type="button"
                        variant="primary"
                        onClick={() => {
                            setRejectedFile(null);
                            setError(null);
                            onValidationStateChange?.(false);
                            open();
                        }}
                        className="mt-5"
                   >
                        Choose another file
                    </Button>
                </Paper>
            ) : (
                <Paper
                    kind="plain"
                    {...getRootProps()}
                    onPointerDown={handleDropzonePointerDown}
                    className={cn(
                        styles.drop,
                        isDragActive && styles.dragActive,
                        isDragReject && styles.dragRejected,
                        isBusy && styles.processing
                    )}
                >
                    <div className={styles.details}>
                        <p className={styles.title}>
                            <span className={styles.desktopTitle}>{document === "linkedin" ? "Drop your LinkedIn PDF here." : "Drop your resume here."}</span>
                            <span className={styles.mobileTitle}>{document === "linkedin" ? "Add your LinkedIn PDF." : "Add your resume."}</span>
                        </p>
                        <p className={styles.quiet}>{document === "linkedin" ? "The PDF LinkedIn saves for you, up to 4 MB." : "PDF or Word, up to 4 MB."}</p>
                    </div>
                    <Button
                        type="button"
                        ref={chooseActionRef}
                        variant="quiet"
                        size="sm"
                        onClick={(event) => {
                            event.stopPropagation();
                            openFilePicker(event);
                        }}
                        disabled={isBusy}
                        className={styles.chooseButton}
                    >
                        Choose a file
                    </Button>
                </Paper>
            )}
        </div>
    );
}
