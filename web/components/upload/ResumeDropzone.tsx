"use client";

import { useState, useCallback } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, AlertCircle, Sparkles } from "lucide-react";
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
                    "relative group cursor-pointer rounded-xl border border-dashed transition-all duration-300 ease-out",
                    "h-[420px] flex flex-col items-center justify-center text-center p-12",
                    "bg-white/50 backdrop-blur-sm dark:bg-black/20", // Glass base

                    // Border logic: Alpha-based
                    isDragActive
                        ? "border-primary/50 bg-primary/5 scale-[1.02]"
                        : "border-primary/20 hover:border-primary/40 hover:bg-primary/[0.02]",

                    isDragReject && "border-destructive/50 bg-destructive/5",

                    isProcessing && "opacity-50 cursor-not-allowed grayscale"
                )}
            >
                <input {...getInputProps()} />

                <AnimatePresence mode="wait">
                    {/* State: Dragging Over */}
                    {isDragActive ? (
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
                                <h3 className="text-lg font-medium font-sans">Drop to analyze</h3>
                                <p className="text-sm text-muted-foreground font-sans mt-1">
                                    We'll start the skim immediately.
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
                                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-white to-neutral-100 shadow-sm border border-black/5 flex items-center justify-center transform group-hover:-translate-y-2 transition-transform duration-500 ease-out">
                                    <FileText className="h-10 w-10 text-neutral-400 group-hover:text-primary transition-colors" opacity={0.5} strokeWidth={1.5} />
                                </div>
                                {/* Decorative Elements */}
                                <Sparkles className="absolute -right-4 -top-4 h-6 w-6 text-premium-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100" />
                            </div>

                            <div className="space-y-2 text-center">
                                <h3 className="text-2xl font-serif italic font-medium text-foreground tracking-tight">
                                    Drop your resume.
                                </h3>
                                <p className="text-base text-muted-foreground">
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
