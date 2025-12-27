"use client";

import { useState, useCallback } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { InsightSparkleIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ResumeDropzoneProps {
    onFileSelect: (file: File) => void;
    isProcessing?: boolean;
    className?: string;
}

export function ResumeDropzone({
    onFileSelect,
    isProcessing = false,
    className
}: ResumeDropzoneProps) {
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
        setError(null);

        // Handle rejections (wrong type, too big)
        if (fileRejections.length > 0) {
            const rejection = fileRejections[0];
            if (rejection.errors[0]?.code === "file-invalid-type") {
                setError("Please upload a PDF file.");
            } else {
                setError(rejection.errors[0]?.message || "Could not read file");
            }
            return;
        }

        if (acceptedFiles.length > 0) {
            onFileSelect(acceptedFiles[0]);
        }
    }, [onFileSelect]);

    const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
        onDrop,
        accept: {
            "application/pdf": [".pdf"],
        },
        maxFiles: 1,
        disabled: isProcessing,
        multiple: false,
    });

    return (
        <div className={cn("w-full max-w-xl mx-auto", className)}>
            <div
                {...getRootProps()}
                className={cn(
                    "relative group cursor-pointer rounded-2xl border transition-all duration-500 ease-out",
                    "h-[420px] flex flex-col items-center justify-center text-center p-12",
                    "bg-gradient-to-b from-white/80 to-white/40 dark:from-white/5 dark:to-transparent backdrop-blur-xl", // Premium glass gradient
                    "shadow-[0_8px_32px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.06)]", // Soft elevated shadow

                    // Border logic: Alpha-based solid, not dashed
                    isDragActive
                        ? "border-primary/40 bg-primary/5 scale-[1.01]"
                        : "border-primary/10 hover:border-primary/20",

                    isDragReject && "border-destructive/50 bg-destructive/5",

                    isProcessing && "opacity-50 cursor-not-allowed grayscale"
                )}
            >
                <input {...getInputProps()} aria-label="Upload resume file (PDF only)" />

                <AnimatePresence mode="wait">
                    {/* State: Processing */}
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
                            {/* State: Idle */}
                            {/* Icon / Brand Mark */}
                            <div className="relative">
                                <motion.div
                                    animate={{ scale: [1, 1.03, 1] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                    className="h-20 w-20 rounded-2xl bg-gradient-to-br from-white to-neutral-100 shadow-sm border border-black/5 flex items-center justify-center transform group-hover:-translate-y-2 transition-transform duration-500 ease-out"
                                >
                                    <FileText className="h-10 w-10 text-neutral-400 group-hover:text-primary transition-colors" opacity={0.5} strokeWidth={1.5} />
                                </motion.div>
                                {/* Decorative Elements */}
                                <InsightSparkleIcon className="absolute -right-4 -top-4 h-6 w-6 text-premium-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100" />
                            </div>

                            <div className="space-y-3 text-center">
                                <p className="text-3xl font-serif italic font-medium text-foreground tracking-tight">
                                    Drop your resume.
                                </p>
                                <p className="text-base text-muted-foreground font-medium">
                                    PDF only.
                                </p>
                            </div>

                            <Button variant="studio" size="lg" className="mt-4 pointer-events-none group-hover:scale-105 transition-transform px-8 h-12 text-base">
                                Analyze
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer removed - info now in body */}

                {/* Error State */}
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
