"use client";

import { useState, useCallback, useRef, ChangeEvent } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, AlertCircle, CloudUpload } from "lucide-react";
import { InsightSparkleIcon } from "@/components/icons";
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

    const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
        onDrop,
        accept: {
            "application/pdf": [".pdf"],
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
        },
        maxFiles: 1,
        disabled: isProcessing,
        multiple: false,
    });

    // Hero variant (landing page)
    if (variant === "hero") {
        return (
            <div className={cn("w-full max-w-xl mx-auto", className)}>
                <div
                    {...getRootProps()}
                    className={cn(
                        "relative group cursor-pointer rounded-2xl border transition-all duration-500 ease-out",
                        "h-[420px] flex flex-col items-center justify-center text-center p-12",
                        "bg-gradient-to-b from-white/80 to-white/40 dark:from-white/5 dark:to-transparent backdrop-blur-xl",
                        "shadow-[0_8px_32px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.06)]",

                        isDragActive
                            ? "border-primary/40 bg-primary/5 scale-[1.01]"
                            : "border-primary/10 hover:border-primary/20",

                        isDragReject && "border-destructive/50 bg-destructive/5",
                        isProcessing && "opacity-50 cursor-not-allowed grayscale"
                    )}
                >
                    <input {...getInputProps()} aria-label="Upload resume file (PDF or DOCX)" />

                    <AnimatePresence mode="wait">
                        {isProcessing ? (
                            <motion.div
                                key="processing"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex flex-col items-center gap-6"
                            >
                                <div className="relative">
                                    <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-brand/20 to-brand/10 flex items-center justify-center animate-pulse">
                                        <FileText className="h-8 w-8 text-brand" strokeWidth={1.5} />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-brand flex items-center justify-center shadow-lg">
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        >
                                            <Upload className="h-3.5 w-3.5 text-white" />
                                        </motion.div>
                                    </div>
                                </div>
                                <div className="space-y-2 text-center">
                                    <p className="text-lg font-display font-medium text-foreground">
                                        Scanning for signals...
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Verdict in ~3 seconds.
                                    </p>
                                </div>
                            </motion.div>
                        ) : isDragActive ? (
                            <motion.div
                                key="drag-active"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex flex-col items-center gap-4"
                            >
                                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                                    <Upload className="h-8 w-8 text-primary" />
                                </div>
                                <div>
                                    <p className="text-lg font-medium font-sans">Drop to analyze</p>
                                    <p className="text-sm text-muted-foreground font-sans mt-1">
                                        We&apos;ll analyze it right away.
                                    </p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="idle"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center gap-8"
                            >
                                <div className="relative">
                                    <motion.div
                                        animate={{ scale: [1, 1.03, 1] }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                        className="h-20 w-20 rounded-2xl bg-gradient-to-br from-white to-neutral-100 shadow-sm border border-black/5 flex items-center justify-center transform group-hover:-translate-y-2 transition-transform duration-500 ease-out"
                                    >
                                        <FileText className="h-10 w-10 text-neutral-400 group-hover:text-primary transition-colors" opacity={0.5} strokeWidth={1.5} />
                                    </motion.div>
                                    <InsightSparkleIcon className="absolute -right-4 -top-4 h-6 w-6 text-premium-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100" />
                                </div>

                                <div className="space-y-3 text-center">
                                    <p className="text-3xl font-serif italic font-medium text-foreground tracking-tight">
                                        Drop your resume.
                                    </p>
                                    <p className="text-base text-muted-foreground font-medium">
                                        PDF or DOCX
                                    </p>
                                </div>

                                <Button variant="studio" size="lg" className="mt-4 pointer-events-none group-hover:scale-105 transition-transform px-8 h-12 text-base">
                                    Analyze
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute bottom-12 left-0 right-0 flex justify-center z-10"
                        >
                            <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 px-3 py-1.5 rounded-full border border-destructive/20 backdrop-blur-md">
                                <AlertCircle className="h-3 w-3" />
                                {error}
                            </div>
                        </motion.div>
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
                <div className="flex items-center justify-between p-3 bg-brand/5 border border-brand/10 rounded-lg animate-in fade-in slide-in-from-top-2">
                    <span className="text-sm font-medium text-brand flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-brand/10 flex items-center justify-center">
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
                <div
                    {...getRootProps()}
                    className={cn(
                        "relative flex flex-col items-center justify-center gap-4 p-10 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-300 group",
                        isDragActive
                            ? "border-brand bg-brand/5 scale-[1.01]"
                            : "border-border/30 hover:border-brand/40 hover:bg-muted/20",
                        isDragReject && "border-destructive/50 bg-destructive/5",
                        isProcessing && "opacity-50 cursor-not-allowed"
                    )}
                >
                    <input {...getInputProps()} aria-label="Upload resume file (PDF or DOCX)" />

                    <div className={cn(
                        "w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-300",
                        isDragActive ? "bg-brand/10 text-brand" : "bg-muted text-muted-foreground group-hover:bg-brand/5 group-hover:text-brand"
                    )}>
                        <CloudUpload className="w-8 h-8" strokeWidth={1.5} />
                    </div>

                    <div className="text-center space-y-1.5">
                        <div className="text-lg font-medium text-foreground group-hover:text-brand transition-colors">
                            Drop your resume here
                        </div>
                        <div className="text-sm text-muted-foreground/80">
                            Supports PDF or DOCX
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 px-3 py-1.5 rounded-full border border-destructive/20">
                            <AlertCircle className="h-3 w-3" />
                            {error}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
