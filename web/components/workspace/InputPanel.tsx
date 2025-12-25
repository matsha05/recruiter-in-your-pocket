"use client";

import { useState, useRef, ChangeEvent } from "react";
import { CloudUpload, FileText, ArrowRight, Info, ChevronDown, AlignLeft } from "lucide-react";
import { SixSecondIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { TrustBadges } from "@/components/shared/TrustBadges";
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
    const [showJD, setShowJD] = useState(false);
    const [showPaste, setShowPaste] = useState(false);
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
            return "No login required";
        } else if (freeUsesRemaining === 1) {
            return "Your first review is free";
        } else {
            return "Upgrade to continue";
        }
    };

    const charCount = resumeText.length;
    const isShortResume = charCount > 0 && charCount < 1500;
    const hasContent = fileName || resumeText.length > 0;

    return (
        <div className="flex justify-center p-6 md:p-12 min-h-full">
            <div className="w-full max-w-xl space-y-6">

                {/* Hero Header */}
                <div className="text-center space-y-2 mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <h1 className="font-display text-4xl md:text-5xl text-foreground tracking-tight">
                        This is what they see.
                    </h1>
                    <div className="flex items-center justify-center gap-2 text-muted-foreground pt-2">
                        <SixSecondIcon className="w-5 h-5 text-brand" />
                        <p className="text-lg font-medium">6 seconds. That's your window.</p>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-card border border-border/60 shadow-lg shadow-black/5 rounded-xl overflow-hidden transition-all hover:border-border/80">

                    {/* Section 1: The Input (Hero) */}
                    <div className="p-6 md:p-8 space-y-6">

                        {/* Dropzone - The Primary Action */}
                        <div
                            className={cn(
                                "relative flex flex-col items-center justify-center gap-4 p-10 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-300 group",
                                isDragOver
                                    ? "border-brand bg-brand/5 scale-[1.01]"
                                    : "border-border/30 hover:border-brand/40 hover:bg-muted/20"
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
                            <div className={cn(
                                "w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-300",
                                isDragOver ? "bg-brand/10 text-brand" : "bg-muted text-muted-foreground group-hover:bg-brand/5 group-hover:text-brand"
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

                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                onChange={handleFileChange}
                                onClick={(e) => e.stopPropagation()}
                                aria-label="Upload resume file (PDF or DOCX)"
                            />
                        </div>

                        {/* File Success State */}
                        {fileName && (
                            <div className="flex items-center justify-between p-3 bg-brand/5 border border-brand/10 rounded-lg animate-in fade-in slide-in-from-top-2">
                                <span className="text-sm font-medium text-brand flex items-center gap-3">
                                    <div className="w-8 h-8 rounded bg-brand/10 flex items-center justify-center">
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    {fileName}
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
                        )}

                        {/* Paste Text Toggle */}
                        {!fileName && (
                            <div className="space-y-4">
                                {!showPaste ? (
                                    <div className="text-center">
                                        <button
                                            onClick={() => setShowPaste(true)}
                                            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md border border-border/40 hover:border-brand/40 hover:bg-brand/5"
                                        >
                                            <AlignLeft className="w-4 h-4" />
                                            Or paste text instead
                                        </button>
                                    </div>
                                ) : (
                                    <div className="animate-in fade-in slide-in-from-top-2 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Paste Text</span>
                                            <button
                                                onClick={() => setShowPaste(false)}
                                                className="text-xs text-muted-foreground hover:text-foreground"
                                            >
                                                Upload file instead
                                            </button>
                                        </div>
                                        <textarea
                                            value={resumeText}
                                            onChange={(e) => onResumeTextChange(e.target.value)}
                                            placeholder="Paste your resume content here..."
                                            className="flex w-full rounded-lg border border-border/60 bg-background px-4 py-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand focus-visible:border-brand/40 disabled:cursor-not-allowed disabled:opacity-50 min-h-[200px] leading-relaxed resize-none"
                                            autoFocus
                                        />
                                        {isShortResume && (
                                            <div className="flex gap-2 text-warning text-xs items-center bg-warning/10 border border-warning/20 px-3 py-2 rounded-lg">
                                                <Info className="w-3.5 h-3.5" />
                                                <span>Short resume detected ({charCount} chars). Results may vary.</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Divider */}
                        <div className="border-t border-border/40" />

                        {/* Additional Options */}
                        <div className="space-y-2">
                            <button
                                type="button"
                                onClick={() => setShowJD(!showJD)}
                                className="w-full flex items-center justify-between text-sm group"
                            >
                                <span className={cn("flex items-center gap-2 transition-colors", showJD ? "text-foreground font-medium" : "text-muted-foreground group-hover:text-foreground")}>
                                    <AlignLeft className="w-4 h-4" />
                                    Tailor to a job description
                                    <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/50 bg-secondary px-1.5 py-0.5 rounded ml-2">Optional</span>
                                </span>
                                <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform duration-200", showJD && "rotate-180")} />
                            </button>

                            {showJD && (
                                <div className="pt-2 animate-in fade-in slide-in-from-top-1">
                                    <textarea
                                        value={jobDescription}
                                        onChange={(e) => onJobDescChange(e.target.value)}
                                        className="flex w-full rounded-md border border-input bg-muted/30 px-3 py-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[120px] resize-none"
                                        placeholder="Paste the job posting here to see your match score..."
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer CTA */}
                    <div className="p-6 md:p-8 bg-secondary/30 border-t border-border/50">
                        <Button
                            variant="brand"
                            size="lg"
                            className="w-full shadow-lg shadow-brand/20 h-12 text-base font-medium transition-transform active:scale-[0.99]"
                            onClick={onRun}
                            disabled={!hasContent}
                            isLoading={isLoading}
                        >
                            {isLoading ? "Running Analysis..." : (
                                <span className="flex items-center gap-2">
                                    See What They See <ArrowRight className="w-4 h-4" />
                                </span>
                            )}
                        </Button>

                        <div className="mt-4 flex flex-col items-center gap-2">
                            <TrustBadges variant="inline" />
                            <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest font-medium">
                                {getRunHint()}
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
