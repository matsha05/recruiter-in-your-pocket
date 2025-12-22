"use client";

import { useState, useRef, ChangeEvent } from "react";
import { CloudUpload, FileText, ArrowRight, Loader2, Info } from "lucide-react";
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
            return "1 free review remaining";
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
                    <h1 className="font-display text-3xl md:text-4xl text-foreground">This is what they see.</h1>
                    <div className="flex items-center justify-center gap-2 text-muted-foreground text-lg">
                        <SixSecondIcon className="w-5 h-5 text-brand" />
                        <p>6 seconds. That's your window.</p>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-card border border-border shadow-sm rounded-md overflow-hidden">

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
                                "relative flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-md cursor-pointer transition-all duration-normal",
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
                                <div className="text-sm font-medium text-foreground">Drop your resume. We'll show you what they see.</div>
                                <div className="text-xs text-muted-foreground">PDF or DOCX</div>
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

                        {/* Trust Module */}
                        <TrustBadges variant="inline" />

                        {/* File Tag */}
                        {fileName && (
                            <div className="flex items-center justify-between px-3 py-2 bg-brand/5 border border-brand/10 rounded-md animate-in fade-in slide-in-from-top-2">
                                <span className="text-sm font-medium text-brand flex items-center gap-2">
                                    <FileText className="w-3.5 h-3.5" />
                                    {fileName}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-muted-foreground hover:text-destructive h-auto py-1 px-2"
                                    onClick={handleRemoveFile}
                                >
                                    Remove
                                </Button>
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
                            placeholder="Paste your resume here if you prefer..."
                            aria-label="Resume content"
                            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 min-h-[150px] leading-relaxed"
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
                        <p className="text-xs text-muted-foreground">
                            Paste a job posting to see exactly how you match—or skip for a general review.
                        </p>
                        <textarea
                            value={jobDescription}
                            onChange={(e) => onJobDescChange(e.target.value)}
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]"
                            placeholder="Paste the job description to see how well you align..."
                            aria-label="Job description (optional)"
                        />
                    </div>

                    {/* Section 3: Intent Question (Pain Priming) */}
                    <div className="p-6 md:p-8 space-y-4 border-t border-border/50 bg-background">
                        <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm tracking-wide text-foreground">Where are you getting stuck?</span>
                            <span className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground/60">Optional</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { id: "no-response", label: "Not hearing back" },
                                { id: "screens", label: "Failing recruiter screens" },
                                { id: "tailoring", label: "Unsure how to tailor" },
                                { id: "career-switch", label: "Career switch" },
                            ].map((option) => (
                                <button
                                    key={option.id}
                                    type="button"
                                    className="text-left px-3 py-2 rounded border border-border/50 text-sm text-muted-foreground hover:border-brand/50 hover:bg-brand/5 transition-colors"
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Footer / Action */}
                    <div className="p-6 md:p-8 border-t border-border/50 bg-background">
                        <Button
                            variant="brand"
                            size="lg"
                            className="w-full"
                            onClick={onRun}
                            disabled={!resumeText.trim()}
                            isLoading={isLoading}
                        >
                            {isLoading ? (
                                "Analyzing..."
                            ) : (
                                <>
                                    See What They See
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </>
                            )}
                        </Button>
                        <p className="text-center text-xs text-muted-foreground mt-3">
                            Takes about 30 seconds · {getRunHint()}
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}

