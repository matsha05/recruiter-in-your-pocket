"use client";

import { useState, useCallback, useRef } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, AlertCircle, CloudUpload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ResumeDropzoneProps {
    onFileSelect: (file: File) => void;
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
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Use external fileName if provided, otherwise local state
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

    // Hero variant (landing page)
    if (variant === "hero") {
        return (
            <div className={cn("w-full max-w-xl mx-auto", className)}>
                <div className={cn("rounded border border-border/60 bg-card p-5 space-y-4", isProcessing && "opacity-60")}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
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
                        <input {...getInputProps()} aria-label="Upload resume file (PDF or DOCX)" />
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
                            <AlertCircle className="h-3 w-3" />
                            {error}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Compact variant (workspace)
    return (
        <div className={cn("w-full", className)}>
            {/* File uploaded state */}
            {displayFileName ? (
                <div className="flex items-center justify-between p-3 bg-brand/5 border border-brand/10 rounded animate-in fade-in slide-in-from-top-2">
                    <span className="text-sm font-medium text-brand flex items-center gap-3">
                        <div className="w-8 h-8 rounded border border-brand/20 flex items-center justify-center">
                            <FileText className="w-4 h-4" />
                        </div>
                        {displayFileName}
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive h-auto py-1 px-2 hover:bg-destructive/10"
                        onClick={handleRemoveFile}
                    >
                        Remove
                    </Button>
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
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
                            "relative flex flex-col items-center justify-center gap-3 px-4 py-6 border border-dashed rounded cursor-pointer transition-colors text-center",
                            isDragActive
                                ? "border-brand bg-brand/5"
                                : "border-border/40 hover:border-brand/40 hover:bg-brand/5",
                            isDragReject && "border-destructive/50 bg-destructive/5",
                            isProcessing && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        <input {...getInputProps()} aria-label="Upload resume file (PDF or DOCX)" />

                        <div className="w-10 h-10 rounded border border-border/60 flex items-center justify-center text-muted-foreground">
                            <CloudUpload className="w-5 h-5" strokeWidth={1.5} />
                        </div>

                        <div className="space-y-1">
                            <div className="text-sm font-medium text-foreground">
                                Drop your resume here
                            </div>
                            <div className="text-xs text-muted-foreground">
                                No login required
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 px-3 py-1.5 rounded border border-destructive/20">
                                <AlertCircle className="h-3 w-3" />
                                {error}
                            </div>
                        )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        We use your upload to generate feedback. Anonymous runs aren&apos;t stored unless you save.
                        Signed-in runs keep report history you can delete in Settings.
                    </div>
                </div>
            )}
        </div>
    );
}
