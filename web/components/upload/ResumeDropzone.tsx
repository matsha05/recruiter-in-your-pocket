"use client";

import { useState, useCallback } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { m as motion, AnimatePresence } from "motion/react";
import { FilePdf, FileText, UploadSimple, WarningCircle, X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { ChangeEvent } from "react";

interface ResumeDropzoneProps {
    onFileSelect: (file: File) => void | boolean | Promise<void | boolean>;
    isProcessing?: boolean;
    className?: string;
    /** 
     * Variant controls the visual style:
     * - "hero": Compact landing-page upload prompt
     * - "compact": Source-desk upload treatment for the workspace
     */
    variant?: "hero" | "compact";
    /** For compact variant: show file name when uploaded */
    fileName?: string | null;
    /** For compact variant: callback to remove file */
    onRemoveFile?: () => void;
    /** Reports whether the current file selection is invalid. */
    onValidationStateChange?: (hasError: boolean) => void;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

function formatMegabytes(bytes: number) {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function ResumeDropzone({
    onFileSelect,
    isProcessing = false,
    className,
    variant = "hero",
    fileName,
    onRemoveFile,
    onValidationStateChange,
}: ResumeDropzoneProps) {
    const [error, setError] = useState<string | null>(null);
    const [rejectedFile, setRejectedFile] = useState<File | null>(null);
    const [localFileName, setLocalFileName] = useState<string | null>(null);
    const displayFileName = fileName !== undefined ? fileName : localFileName;

    const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
        setError(null);
        setRejectedFile(null);
        onValidationStateChange?.(false);

        const selectedFile = acceptedFiles[0] ?? fileRejections[0]?.file;
        if (selectedFile && selectedFile.size > MAX_FILE_SIZE_BYTES) {
            setRejectedFile(selectedFile);
            setError(`This file is ${formatMegabytes(selectedFile.size)}. Choose a PDF or DOCX under 10 MB.`);
            onValidationStateChange?.(true);
            return;
        }

        // Handle rejections (wrong type, too big)
        if (fileRejections.length > 0) {
            const rejection = fileRejections[0];
            setRejectedFile(rejection.file);
            onValidationStateChange?.(true);
            if (rejection.errors.some((item) => item.code === "file-too-large")) {
                setError(`This file is ${formatMegabytes(rejection.file.size)}. Choose a PDF or DOCX under 10 MB.`);
            } else if (rejection.errors[0]?.code === "file-invalid-type") {
                setError("Please upload a PDF or DOCX file.");
            } else {
                setError(rejection.errors[0]?.message || "Could not read file");
            }
            return;
        }

        if (acceptedFiles.length > 0) {
            if (variant === "compact" && fileName === undefined) {
                setLocalFileName(acceptedFiles[0].name);
            }
            onFileSelect(acceptedFiles[0]);
        }
    }, [onFileSelect, variant, fileName, onValidationStateChange]);

    const handleRemoveFile = () => {
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
        setLocalFileName(null);
        setRejectedFile(selectedFile);
        setError(`This file is ${formatMegabytes(selectedFile.size)}. Choose a PDF or DOCX under 10 MB.`);
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
        disabled: isProcessing,
        multiple: false,
        noClick: false,
        noKeyboard: true,
    });

    if (variant === "hero") {
        return (
            <div className={cn("w-full max-w-xl mx-auto", className)}>
                <div className={cn("rounded border border-border/60 bg-card p-5 gap-y-4", isProcessing && "opacity-60")}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <div className="text-xs font-mono uppercase tracking-wide text-muted-foreground">
                                Upload resume
                            </div>
                            <div className="text-xs text-muted-foreground">PDF or DOCX</div>
                        </div>
                        <Button
                            variant="brand"
                            size="sm"
                            onClick={open}
                            disabled={isProcessing}
                            className="px-3"
                        >
                            Select file
                        </Button>
                    </div>

                    <div
                        {...getRootProps()}
                        className={cn(
                            "rounded border border-dashed px-4 py-8 text-center transition-colors cursor-pointer hover:border-brand/40 hover:bg-brand/5",
                            isDragActive ? "border-brand/60 bg-brand/5 text-foreground" : "border-border/40 text-muted-foreground",
                            isDragReject && "border-destructive/50 bg-destructive/5 text-destructive"
                        )}
                    >
                        <input {...getInputProps()} onChangeCapture={handleNativeFileChange} suppressHydrationWarning aria-label="Upload resume file (PDF or DOCX)" />
                        <div className="text-sm font-medium">Drop your resume here</div>
                        <div className="text-xs text-muted-foreground mt-1">No login required</div>
                    </div>

                    <AnimatePresence mode="wait">
                        {isProcessing && (
                            <motion.div
                                key="processing"
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 6 }}
                                className="text-xs text-muted-foreground"
                            >
                                Building your first-read report.
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {error && (
                        <div className="flex items-center gap-2 border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                            <WarningCircle className="size-3" />
                            {error}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={cn("w-full", className)}>
            {displayFileName ? (
                <div className="animate-in fade-in slide-in-from-top-2 flex min-h-40 items-center justify-between gap-4 border border-brand/25 bg-brand/5 p-5 sm:p-6">
                    <span className="flex min-w-0 items-center gap-4 text-sm font-medium text-brand">
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand/10">
                            <FileText className="size-5" weight="duotone" />
                        </span>
                        <span className="min-w-0">
                            <span className="block truncate text-base font-medium text-foreground">{displayFileName}</span>
                            <span className="mt-1 block text-xs font-normal text-muted-foreground">Ready for a first read</span>
                        </span>
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                    className="min-h-11 shrink-0 px-3 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        onClick={handleRemoveFile}
                    >
                        Remove
                    </Button>
                </div>
            ) : rejectedFile && error ? (
                <div className="workspace-upload-drop animate-in fade-in slide-in-from-top-2 flex flex-col items-center justify-center border border-dashed border-destructive/55 bg-error-surface px-6 py-8">
                    <div className="workspace-error-file flex w-full items-center justify-between gap-4 border border-line bg-background px-5 py-4">
                        <div className="flex min-w-0 items-center gap-4">
                            <span className="flex size-11 shrink-0 items-center justify-center text-destructive">
                                <FilePdf className="size-10" weight="duotone" />
                            </span>
                            <div className="min-w-0">
                                <p className="truncate text-xl font-semibold text-foreground">{rejectedFile.name}</p>
                                <p className="mt-1 text-base tabular-nums text-muted-foreground">{formatMegabytes(rejectedFile.size)}</p>
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
                        <p role="alert" className="text-lg font-medium leading-6">{error}</p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setRejectedFile(null);
                            setError(null);
                            onValidationStateChange?.(false);
                            window.setTimeout(open, 0);
                        }}
                        className="workspace-error-action mt-5 border-foreground bg-background text-foreground hover:border-foreground hover:bg-background"
                    >
                        Choose another file
                    </Button>
                </div>
            ) : (
                <div>
                    <div
                        {...getRootProps()}
                        className={cn(
                            "workspace-upload-drop group relative flex cursor-pointer flex-col items-center justify-center border border-dashed px-5 py-8 text-center transition-all duration-150",
                            isDragActive
                                ? "border-brand/55 bg-brand/5"
                                : "border-border/55 bg-paper-muted/45 hover:border-brand/45 hover:bg-brand/5",
                            isDragReject && "border-destructive/50 bg-destructive/5",
                            isProcessing && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        <input {...getInputProps()} onChangeCapture={handleNativeFileChange} suppressHydrationWarning aria-label="Upload resume file (PDF or DOCX)" />

                        <span className="flex items-center justify-center text-cyan-bright transition-transform duration-150 group-hover:-translate-y-0.5">
                            <UploadSimple className="size-11" weight="regular" />
                        </span>

                        <div className="mt-5">
                            <p className="font-display text-2xl riyp-weight-520 leading-tight text-foreground">
                                Drop your resume here
                            </p>
                            <p className="mt-2 text-lg leading-6 text-muted-foreground">
                                PDF or DOCX · 10 MB max
                            </p>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(event) => {
                                event.stopPropagation();
                                open();
                            }}
                            disabled={isProcessing}
                            className="mt-5 min-h-12 border-foreground bg-paper px-6 text-lg text-foreground hover:border-foreground hover:bg-paper"
                        >
                            Choose a file
                        </Button>

                    </div>
                </div>
            )}
        </div>
    );
}
