"use client";

import { useState, useRef, ChangeEvent } from "react";
import { CloudUpload, FileText, ArrowRight, Loader2, Info } from "lucide-react";
import { SixSecondIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

interface InputPanelProps {
    resumeText: string;
    jobDescription: string;
    onResumeTextChange: (text: string) => void;
    onJobDescChange: (text: string) => void;
    onFileSelect: (file: File) => void;
    onRun: () => void;
    isLoading: boolean;
    freeUsesRemaining: number;
}

export default function InputPanel({
    resumeText,
    jobDescription,
    onResumeTextChange,
    onJobDescChange,
    onFileSelect,
    onRun,
    isLoading,
    freeUsesRemaining
}: InputPanelProps) {
    const [fileName, setFileName] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileName(file.name);
            onFileSelect(file);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            setFileName(file.name);
            onFileSelect(file);
        }
    };

    const handleRemoveFile = () => {
        setFileName(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const getRunHint = () => {
        if (freeUsesRemaining >= 2) {
            return "No login required to start.";
        } else if (freeUsesRemaining === 1) {
            return "1 free report remaining";
        } else {
            return "Upgrade to keep analyzing";
        }
    };

    const charCount = resumeText.length;
    const isShortResume = charCount > 0 && charCount < 1500;

    return (
        <div className="flex justify-center p-6 md:p-12 min-h-full">
            <div className="w-full max-w-2xl space-y-8">

                {/* Header */}
                <div className="text-center space-y-3">
                    <h1 className="font-display text-3xl md:text-4xl text-foreground">Prepare your Audit</h1>
                    <div className="flex items-center justify-center gap-2 text-muted-foreground text-lg">
                        <SixSecondIcon className="w-5 h-5 text-brand" />
                        <p>See what a Principal Recruiter sees in 6 seconds.</p>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-card border border-border/10 shadow-sm rounded-md overflow-hidden">

                    {/* Section 1: Resume */}
                    <div className="p-6 md:p-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-primary" />
                                <span className="font-semibold text-sm tracking-wide">YOUR RESUME</span>
                            </div>
                            <span className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground bg-secondary px-2 py-1 rounded">Required</span>
                        </div>

                        {/* Dropzone */}
                        <div
                            className={cn(
                                "relative flex flex-col items-center justify-center gap-3 p-8 border border-dashed rounded-md cursor-pointer transition-all duration-normal",
                                isDragOver
                                    ? "border-brand bg-brand/5"
                                    : "border-border/60 hover:border-brand/50 hover:bg-muted/30"
                            )}
                            onClick={(e) => {
                                if (e.target === e.currentTarget || !(e.target as HTMLElement).closest('input')) {
                                    fileInputRef.current?.click();
                                }
                            }}
                            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                            onDragLeave={() => setIsDragOver(false)}
                            onDrop={handleDrop}
                        >
                            <CloudUpload className={cn("w-10 h-10 transition-colors", isDragOver ? "text-brand" : "text-muted-foreground/60")} strokeWidth={1.5} />
                            <div className="text-center space-y-1">
                                <div className="text-sm font-medium text-foreground">Click to upload or drag and drop</div>
                                <div className="text-xs text-muted-foreground">PDF or DOCX (Text is parsed locally)</div>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                onChange={handleFileChange}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>

                        {/* Trust Module */}
                        <div className="flex items-center justify-center gap-6 text-[11px] text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                                <svg className="w-3 h-3 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                End-to-end encrypted
                            </span>
                            <span className="flex items-center gap-1.5">
                                <svg className="w-3 h-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Auto-deleted in 24h
                            </span>
                            <span className="flex items-center gap-1.5">
                                <svg className="w-3 h-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                                Never shared or sold
                            </span>
                        </div>

                        {/* File Tag */}
                        {fileName && (
                            <div className="flex items-center justify-between px-3 py-2 bg-brand/5 border border-brand/10 rounded-md animate-in fade-in slide-in-from-top-2">
                                <span className="text-sm font-medium text-brand flex items-center gap-2">
                                    <FileText className="w-3.5 h-3.5" />
                                    {fileName}
                                </span>
                                <button
                                    className="text-muted-foreground hover:text-destructive text-xs transition-colors px-2 py-1"
                                    onClick={handleRemoveFile}
                                >
                                    Remove
                                </button>
                            </div>
                        )}

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border/50" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">Or paste text</span>
                            </div>
                        </div>

                        <textarea
                            value={resumeText}
                            onChange={(e) => onResumeTextChange(e.target.value)}
                            placeholder="Paste your resume content here if you don't have a file..."
                            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 min-h-[150px] font-mono text-xs leading-relaxed"
                        />

                        {isShortResume && (
                            <div className="flex gap-3 p-3 bg-premium/10 border border-premium/20 rounded-md text-premium text-sm">
                                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <p className="text-xs leading-snug">
                                    Your resume looks short ({charCount} chars). You might get limited feedback.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Section 2: JD (Optional) */}
                    <div className="p-6 md:p-8 space-y-4 border-t border-border/50 bg-muted/20">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-muted-foreground" />
                                <span className="font-semibold text-sm tracking-wide text-muted-foreground">JOB DESCRIPTION</span>
                            </div>
                            <span className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground/60">Optional</span>
                        </div>
                        <textarea
                            value={jobDescription}
                            onChange={(e) => onJobDescChange(e.target.value)}
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]"
                            placeholder="Paste the job description to see how well you align..."
                        />
                    </div>

                    {/* Footer / Action */}
                    <div className="p-6 md:p-8 border-t border-border/50 bg-background">
                        <button
                            onClick={onRun}
                            disabled={isLoading || !resumeText.trim()}
                            className={cn(
                                "w-full flex items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-medium text-white shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
                                "bg-brand hover:bg-brand/90"
                            )}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    See How Recruiters Read You
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                        <p className="text-center text-xs text-muted-foreground mt-3">
                            {getRunHint()}
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}

