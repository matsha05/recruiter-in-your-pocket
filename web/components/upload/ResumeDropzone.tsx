"use client";

import { useState, useCallback } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { m as motion, AnimatePresence } from "motion/react";
import { FileText, AlertCircle, CloudUpload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ResumeDropzoneProps {
    onFileSelect: (file: File) => void | boolean | Promise<void | boolean>;
    isProcessing?: boolean;
    className?: string;
    /** 
     * Variant controls the visual style:
     * - "hero": Premium glass effect, tall, centered (for landing page)
     * - "compact": Dashed border, smaller (for workspace)
     */
    variant?: "hero" | "compact";
    /** For compact variant: show file name when uploaded */
    fileName?: string | null;
    /** For compact variant: callback to remove file */
    onRemoveFile?: () => void;
}

export function ResumeDropzone({
    onFileSelect,
    isProcessing = false,
    className,
    variant = "hero",
    fileName,
    onRemoveFile,
}: ResumeDropzoneProps) {
    const [error, setError] = useState<string | null>(null);
    const [localFileName, setLocalFileName] = useState<string | null>(null);
    const displayFileName = fileName !== undefined ? fileName : localFileName;

    const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
        setError(null);

        // Handle rejections (wrong type, too big)
        if (fileRejections.length > 0) {
            const rejection = fileRejections[0];
            if (rejection.errors[0]?.code === "file-invalid-type") {
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
    }, [onFileSelect, variant, fileName]);

    const handleRemoveFile = () => {
        setLocalFileName(null);
        if (onRemoveFile) {
            onRemoveFile();
        }
    };

    const { getRootProps, getInputProps, isDragActive, isDragReject, open } = useDropzone({
        onDrop,
        accept: {
            "application/pdf": [".pdf"],
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
        },
        maxFiles: 1,
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
                        <input {...getInputProps()} suppressHydrationWarning aria-label="Upload resume file (PDF or DOCX)" />
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
                                Scanning for signals. Verdict in seconds.
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {error && (
                        <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 px-3 py-2 rounded border border-destructive/20">
                            <AlertCircle className="size-3" />
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
                <div className="animate-in fade-in slide-in-from-top-2 flex items-center justify-between rounded-xl border border-brand/15 bg-brand/5 p-4">
                    <span className="flex items-center gap-3 text-sm font-medium text-brand">
                        <div className="flex size-9 items-center justify-center rounded-lg border border-brand/20 bg-white/70">
                            <FileText className="size-4" />
                        </div>
                        <span className="min-w-0 truncate text-foreground">{displayFileName}</span>
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-10 rounded-lg px-3 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        onClick={handleRemoveFile}
                    >
                        Remove
                    </Button>
                </div>
            ) : (
                <div className="gap-y-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="gap-y-1">
                            <div className="text-xs font-mono uppercase tracking-wide text-muted-foreground">
                                Upload resume
                            </div>
                            <div className="text-sm text-muted-foreground">PDF or DOCX</div>
                        </div>
                        <Button
                            variant="brand"
                            size="sm"
                            onClick={open}
                            disabled={isProcessing}
                            className="min-h-11 min-w-[6.5rem] rounded-lg px-4"
                        >
                            Select file
                        </Button>
                    </div>
                    <div
                        {...getRootProps()}
                        className={cn(
                            "relative flex min-h-[11.5rem] cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border border-dashed px-5 py-8 text-center transition-all duration-300",
                            isDragActive
                                ? "border-brand/45 bg-brand/5"
                                : "border-border/45 hover:border-brand/35 hover:bg-brand/5",
                            isDragReject && "border-destructive/50 bg-destructive/5",
                            isProcessing && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        <input {...getInputProps()} suppressHydrationWarning aria-label="Upload resume file (PDF or DOCX)" />

                        <div className="flex size-14 items-center justify-center rounded-xl border border-border/70 bg-background text-muted-foreground transition-all duration-300">
                            <CloudUpload className="size-6" strokeWidth={1.5} />
                        </div>

                        <div className="gap-y-1.5">
                            <div className="text-base font-medium text-foreground">
                                Drop your resume here
                            </div>
                            <div className="text-sm text-muted-foreground">
                                No login required
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                                <AlertCircle className="size-3" />
                                {error}
                            </div>
                        )}
                    </div>
                    <div className="max-w-[36rem] text-sm leading-7 text-muted-foreground">
                        We use your upload to generate feedback. Anonymous runs are not stored automatically.
                        Signed-in runs keep report history you can delete from Reports or Settings.
                    </div>
                </div>
            )}
        </div>
    );
}
