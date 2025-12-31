"use client";

import { useState, useEffect, useCallback } from "react";
import { FileText, Upload, Check, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DefaultResumeSectionProps {
    className?: string;
}

interface ResumeProfile {
    hasResume: boolean;
    resumePreview?: string;
    updatedAt?: string;
    skillsCount?: number;
}

export default function DefaultResumeSection({ className }: DefaultResumeSectionProps) {
    const [profile, setProfile] = useState<ResumeProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [resumeText, setResumeText] = useState("");
    const [showTextarea, setShowTextarea] = useState(false);

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

    const handleSaveResume = async () => {
        if (!resumeText.trim() || resumeText.length < 100) {
            toast.error("Please paste your full resume (at least 100 characters)");
            return;
        }

        setIsSaving(true);
        try {
            const res = await fetch("/api/user/default-resume", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resumeText }),
            });

            const data = await res.json();
            if (data.success) {
                toast.success("Resume profile saved! Your skills have been indexed.");
                setProfile({
                    hasResume: true,
                    resumePreview: data.data.resumePreview,
                    updatedAt: data.data.updatedAt,
                    skillsCount: data.data.skillsCount,
                });
                setShowTextarea(false);
                setResumeText("");
            } else {
                throw new Error(data.error || "Failed to save");
            }
        } catch (error: any) {
            console.error("[DefaultResume] Save error:", error);
            toast.error(error.message || "Failed to save resume profile");
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // For now, only support text files. PDF parsing would require additional setup.
        if (file.type === "text/plain") {
            const text = await file.text();
            setResumeText(text);
            setShowTextarea(true);
        } else {
            toast.error("Please paste your resume text directly, or upload a .txt file");
        }
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
            <section className={cn("bg-card border border-border/60 rounded-lg p-6 shadow-sm", className)}>
                <div className="flex items-center gap-3 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Loading resume profile...</span>
                </div>
            </section>
        );
    }

    return (
        <section className={cn("bg-card border border-border/60 rounded-lg p-6 md:p-8 shadow-sm", className)}>
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-brand" />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4 mb-1">
                        <h3 className="text-lg font-medium text-foreground">Default Resume</h3>
                        {profile?.hasResume && (
                            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                                <Check className="w-3 h-3" />
                                Active
                            </span>
                        )}
                    </div>

                    <p className="text-sm text-muted-foreground mb-4">
                        {profile?.hasResume
                            ? "Your resume is indexed for instant job matching via the browser extension."
                            : "Save your resume to get instant match scores when capturing jobs."}
                    </p>

                    {profile?.hasResume && !showTextarea ? (
                        <div className="space-y-3">
                            <div className="bg-muted/30 rounded-md border border-border/10 p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <p className="text-sm text-foreground/80 line-clamp-2 mb-2">
                                            &ldquo;{profile.resumePreview}...&rdquo;
                                        </p>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <span>{profile.skillsCount} skills indexed</span>
                                            <span>•</span>
                                            <span>Updated {formatDate(profile.updatedAt || "")}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowTextarea(true)}
                                className="inline-flex items-center gap-2 text-sm text-brand hover:text-brand/80 font-medium transition-colors"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                                Update Resume
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {showTextarea || !profile?.hasResume ? (
                                <>
                                    <div className="relative">
                                        <textarea
                                            value={resumeText}
                                            onChange={(e) => setResumeText(e.target.value)}
                                            placeholder="Paste your resume text here..."
                                            rows={8}
                                            className="w-full bg-background border border-border/20 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand/20 focus:border-brand/40 transition-all placeholder:text-muted-foreground/40 resize-none"
                                        />
                                        {resumeText.length > 0 && (
                                            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground/50">
                                                {resumeText.length.toLocaleString()} chars
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={handleSaveResume}
                                            disabled={isSaving || resumeText.length < 100}
                                            className="px-4 py-2 bg-brand text-white hover:bg-brand/90 rounded-md font-medium text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {isSaving && <Loader2 className="w-3 h-3 animate-spin" />}
                                            Save Resume Profile
                                        </button>

                                        <label className="px-4 py-2 bg-secondary text-foreground hover:bg-secondary/80 rounded-md font-medium text-sm transition-all cursor-pointer border border-border/10 inline-flex items-center gap-2">
                                            <Upload className="w-3.5 h-3.5" />
                                            Upload .txt
                                            <input
                                                type="file"
                                                accept=".txt"
                                                onChange={handleFileUpload}
                                                className="hidden"
                                            />
                                        </label>

                                        {showTextarea && profile?.hasResume && (
                                            <button
                                                onClick={() => {
                                                    setShowTextarea(false);
                                                    setResumeText("");
                                                }}
                                                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/20 rounded-md p-3 border border-border/5">
                                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                        <span>
                                            We extract skills and create an embedding for matching. Raw resume text is not stored.
                                        </span>
                                    </div>
                                </>
                            ) : null}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
