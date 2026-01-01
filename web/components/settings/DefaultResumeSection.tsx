"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { FileText, Upload, Check, Loader2, Target, RefreshCw, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { InsightSparkleIcon } from "@/components/icons";

interface DefaultResumeSectionProps {
    className?: string;
}

interface ResumeProfile {
    hasResume: boolean;
    resumePreview?: string;
    updatedAt?: string;
    skillsCount?: number;
    hasEmbedding?: boolean;
}

export default function DefaultResumeSection({ className }: DefaultResumeSectionProps) {
    const [profile, setProfile] = useState<ResumeProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const [pendingText, setPendingText] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchProfile = useCallback(async () => {
        try {
            const res = await fetch("/api/user/default-resume");
            const data = await res.json();
            if (data.success) {
                setProfile(data.data);
            }
        } catch (error) {
            console.error("[DefaultResume] Fetch error:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleFile = async (file: File) => {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            toast.error("File too large. Please use a file under 10MB.");
            return;
        }

        setFileName(file.name);

        // Accept .txt files directly
        if (file.type === "text/plain" || file.name.endsWith(".txt")) {
            const text = await file.text();
            if (text.length < 100) {
                toast.error("Resume too short. Please upload your full resume.");
                setFileName(null);
                return;
            }
            setPendingText(text);
            await saveResume(text);
            return;
        }

        // For PDF and DOCX, use the parse-resume API
        const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
        const isDocx = file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.name.toLowerCase().endsWith(".docx");

        if (isPdf || isDocx) {
            setIsSaving(true);
            try {
                const formData = new FormData();
                formData.append("file", file);

                const parseRes = await fetch("/api/parse-resume", {
                    method: "POST",
                    body: formData,
                });

                const parseData = await parseRes.json();

                if (!parseData.ok) {
                    toast.error(parseData.message || "Failed to parse file");
                    setFileName(null);
                    setIsSaving(false);
                    return;
                }

                const text = parseData.text;
                if (text.length < 100) {
                    toast.error("Resume too short. Please upload your full resume.");
                    setFileName(null);
                    setIsSaving(false);
                    return;
                }

                setPendingText(text);
                await saveResume(text);
            } catch (error: any) {
                console.error("[DefaultResume] Parse error:", error);
                toast.error("Failed to parse file. Try pasting your resume text.");
                setFileName(null);
            } finally {
                setIsSaving(false);
            }
            return;
        }

        toast.error("Please upload a PDF, DOCX, or TXT file.");
        setFileName(null);
    };

    const saveResume = async (text: string) => {
        setIsSaving(true);
        try {
            const res = await fetch("/api/user/default-resume", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resumeText: text }),
            });

            const data = await res.json();
            if (data.success) {
                toast.success(`Resume indexed! ${data.data.skillsCount} skills detected.`);
                setProfile({
                    hasResume: true,
                    resumePreview: data.data.resumePreview,
                    updatedAt: data.data.updatedAt,
                    skillsCount: data.data.skillsCount,
                    hasEmbedding: data.data.hasEmbedding,
                });
                setPendingText(null);
            } else {
                throw new Error(data.error || "Failed to save");
            }
        } catch (error: any) {
            console.error("[DefaultResume] Save error:", error);
            toast.error(error.message || "Failed to save resume");
            setPendingText(null);
            setFileName(null);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Yesterday";
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    };

    if (isLoading) {
        return (
            <section className={cn("bg-card border border-border/60 rounded-xl p-6 shadow-sm", className)}>
                <div className="flex items-center gap-3 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Loading...</span>
                </div>
            </section>
        );
    }

    // ===== ACTIVE STATE: Resume saved =====
    if (profile?.hasResume) {
        return (
            <section className={cn("relative overflow-hidden bg-gradient-to-br from-emerald-50/50 to-teal-50/30 dark:from-emerald-950/20 dark:to-teal-950/10 border border-emerald-200/60 dark:border-emerald-800/40 rounded-xl p-6 shadow-sm", className)}>
                <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                        <Check className="w-5 h-5 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground">Resume Locked In</h3>
                            <span className="text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full font-medium">
                                Active
                            </span>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3">
                            Capture jobs from LinkedIn to see instant match scores.
                        </p>

                        {/* Stats */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm mb-3">
                            <span className="flex items-center gap-1.5">
                                <Target className="w-3.5 h-3.5 text-emerald-600" />
                                <strong>{profile.skillsCount}</strong> skills
                            </span>
                            {profile.hasEmbedding && (
                                <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                                    <InsightSparkleIcon className="w-3.5 h-3.5" />
                                    Semantic matching on
                                </span>
                            )}
                            <span className="text-muted-foreground/70 text-xs">
                                Updated {formatDate(profile.updatedAt || "")}
                            </span>
                        </div>

                        {/* Change button */}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isSaving}
                            className="text-sm text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-medium inline-flex items-center gap-1.5 transition-colors"
                        >
                            <RefreshCw className={cn("w-3.5 h-3.5", isSaving && "animate-spin")} />
                            {isSaving ? "Updating..." : "Change Resume"}
                        </button>
                    </div>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFile(file);
                    }}
                    className="hidden"
                />
            </section>
        );
    }

    // ===== EMPTY STATE: Upload prompt =====
    return (
        <section className={cn("bg-card border border-border/60 rounded-xl p-6 shadow-sm", className)}>
            <div className="flex items-start gap-4 mb-5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand/10 to-brand/5 border border-brand/20 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-brand" />
                </div>
                <div>
                    <h3 className="font-semibold text-foreground mb-1">Upload Your Resume</h3>
                    <p className="text-sm text-muted-foreground">
                        Get instant match scores when you capture jobs. No credits needed.
                    </p>
                </div>
            </div>

            {/* Drop zone */}
            <div
                className={cn(
                    "relative rounded-lg border-2 border-dashed transition-all duration-200 cursor-pointer",
                    isDragOver
                        ? "border-brand bg-brand/5"
                        : "border-border/50 hover:border-brand/50 hover:bg-muted/30"
                )}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <div className="py-8 text-center">
                    {isSaving ? (
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-8 h-8 text-brand animate-spin" />
                            <p className="text-sm font-medium text-foreground">Indexing skills...</p>
                            {fileName && <p className="text-xs text-muted-foreground">{fileName}</p>}
                        </div>
                    ) : (
                        <>
                            <Upload className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                            <p className="text-sm font-medium text-foreground mb-1">
                                Drop your resume here
                            </p>
                            <p className="text-xs text-muted-foreground">
                                PDF, DOCX, or TXT
                            </p>
                        </>
                    )}
                </div>
            </div>

            {/* Privacy note */}
            <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground/70">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>We extract skills only. Raw text is not stored.</span>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                }}
                className="hidden"
            />
        </section>
    );
}
