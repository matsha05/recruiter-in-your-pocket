"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { FileText, Upload, Check, Loader2, Target, RefreshCw, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ClientActionError, getClientActionError } from "@/lib/client-action-error";

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
    const [isRemoving, setIsRemoving] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchProfile = useCallback(async () => {
        setLoadError(null);
        setIsLoading(true);
        try {
            const res = await fetch("/api/user/default-resume");
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data.success) throw new ClientActionError(data.error, "We couldn't load your default resume. Please try again.");
            setProfile(data.data);
        } catch (error) {
            console.error("[DefaultResume] Fetch error:", error);
            setLoadError(getClientActionError(error, "We couldn't load your default resume. Please try again."));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleFile = async (file: File) => {
        if (file.size > 4 * 1024 * 1024) {
            toast.error("File too large. Please use a file under 4 MB.");
            return;
        }

        // Accept .txt files directly
        if (file.type === "text/plain" || file.name.endsWith(".txt")) {
            const text = await file.text();
            if (text.length < 100) {
                toast.error("Resume too short. Please upload your full resume.");
                setFileName(null);
                return;
            }
            setFileName(file.name);
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
                    toast.error(new ClientActionError(parseData.message, "We couldn't read this file. Try a different PDF, DOCX, or TXT file.").message);
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

                setFileName(file.name);
                setPendingText(text);
                await saveResume(text);
            } catch (error: any) {
                console.error("[DefaultResume] Parse error:", error);
                toast.error("We couldn't read this file. Try a different PDF, DOCX, or TXT file.");
                setFileName(null);
            } finally {
                setIsSaving(false);
            }
            return;
        }

        toast.error("Please upload a PDF, DOCX, or TXT file.");
        setFileName(null);
    };

    const removeResume = async () => {
        if (!window.confirm("Remove your default resume? Saved reports stay in history, but the extension won't calculate new match scores until you add another resume.")) {
            return;
        }

        setIsRemoving(true);
        try {
            const res = await fetch("/api/user/default-resume", { method: "DELETE" });
            const data = await res.json();
            if (!data.success) {
                throw new ClientActionError(data.error, "We couldn't remove your default resume. Please try again.");
            }
            toast.success("Default resume removed");
            setProfile({ hasResume: false });
            setFileName(null);
            setPendingText(null);
        } catch (error: any) {
            console.error("[DefaultResume] Remove error:", error);
            toast.error(getClientActionError(error, "We couldn't remove your default resume. Please try again."));
        } finally {
            setIsRemoving(false);
        }
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
                toast.success(`Resume saved. ${data.data.skillsCount} skills identified.`);
                setProfile({
                    hasResume: true,
                    resumePreview: data.data.resumePreview,
                    updatedAt: data.data.updatedAt,
                    skillsCount: data.data.skillsCount,
                    hasEmbedding: data.data.hasEmbedding,
                });
                setPendingText(null);
            } else {
                throw new ClientActionError(data.error, "We couldn't save your resume. Please upload it again.");
            }
        } catch (error: any) {
            console.error("[DefaultResume] Save error:", error);
            toast.error(getClientActionError(error, "We couldn't save your resume. Please upload it again."));
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
            <section className={cn("app-card p-6", className)} role="status" aria-live="polite">
                <div className="flex min-h-20 items-center gap-3 text-muted-foreground">
                    <Loader2 className="size-4 animate-spin motion-reduce:animate-none" />
                    <span className="text-sm">Loading…</span>
                </div>
            </section>
        );
    }

    if (loadError) {
        return (
            <section className={cn("border-l-2 border-destructive bg-error-surface p-6", className)} role="alert">
                <h3 className="font-semibold text-destructive">Default resume could not load</h3>
                <p className="mt-2 text-sm leading-6 text-destructive/80">{loadError}</p>
                <p className="mt-2 text-sm leading-6 text-destructive/80">Your saved resume has not been changed.</p>
                <button type="button" onClick={() => void fetchProfile()} className="mt-4 inline-flex min-h-11 items-center gap-2 border border-destructive/40 bg-background px-4 py-2 text-sm font-medium text-destructive">
                    <RefreshCw className="size-4" />
                    Try again
                </button>
            </section>
        );
    }

    // ===== ACTIVE STATE: Resume saved =====
    if (profile?.hasResume) {
        return (
            <section className={cn("relative overflow-hidden border-l-2 border-success bg-success/5 p-6", className)} aria-busy={isSaving || isRemoving}>
                <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex size-12 shrink-0 items-center justify-center border border-success/25 bg-success/10">
                        <Check className="size-5 text-success" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground">Default resume saved</h3>
                            <span className="border-l-2 border-success bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                                Active
                            </span>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3">
                            Save a job through the extension to compare it with this resume.
                        </p>

                        {/* Stats */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm mb-3">
                            <span className="flex items-center gap-1.5">
                                <Target className="size-3.5 text-success" />
                                <strong>{profile.skillsCount}</strong> skills identified
                            </span>
                            <span className="text-muted-foreground/70 text-xs">
                                Updated {formatDate(profile.updatedAt || "")}
                            </span>
                        </div>

                        {/* Change / remove controls */}
                        <div className="flex flex-wrap items-center gap-3">
                            <button type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isSaving || isRemoving}
                                className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-success transition-colors hover:text-success/80"
                            >
                            <RefreshCw className={cn("size-3.5", isSaving && "animate-spin")} />
                            {isSaving ? "Updating…" : "Change Resume"}
                        </button>
                            <button type="button"
                                onClick={removeResume}
                                disabled={isSaving || isRemoving}
                                className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-destructive"
                            >
                                <Trash2 className={cn("size-3.5", isRemoving && "animate-pulse")} />
                                {isRemoving ? "Removing…" : "Remove"}
                            </button>
                        </div>
                        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                            Stored until you replace or remove it. We keep raw resume text for matching, plus derived skills, seniority signals, and a short preview.
                        </p>
                    </div>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    aria-label="Choose a replacement default resume file"
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
        <section className={cn("app-card p-6", className)} aria-busy={isSaving}>
            <div className="flex items-start gap-4 mb-5">
                <div className="flex size-12 shrink-0 items-center justify-center border border-brand/20 bg-brand/10">
                    <FileText className="size-5 text-brand" />
                </div>
                <div>
                    <h3 className="font-semibold text-foreground mb-1">Upload Your Resume</h3>
                    <p className="text-sm text-muted-foreground">
                        Compare this resume with jobs you save through the extension. This does not use a report credit.
                    </p>
                </div>
            </div>

            {/* Drop zone */}
            <button
                type="button"
                aria-label="Choose a default resume file"
                disabled={isSaving}
                className={cn(
                    "relative w-full cursor-pointer border-2 border-dashed transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 disabled:cursor-wait",
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
                        <div className="flex flex-col items-center gap-2" role="status" aria-live="polite">
                            <Loader2 className="size-8 text-brand animate-spin" />
                            <p className="text-sm font-medium text-foreground">Saving your resume…</p>
                            {fileName && <p className="text-xs text-muted-foreground">{fileName}</p>}
                        </div>
                    ) : (
                        <>
                            <Upload className="size-8 text-muted-foreground/50 mx-auto mb-2" />
                            <p className="text-sm font-medium text-foreground mb-1">
                                Choose a file or drop it here
                            </p>
                            <p className="text-xs text-muted-foreground">
                                PDF, DOCX, or TXT, up to 4 MB
                            </p>
                        </>
                    )}
                </div>
            </button>

            {/* Privacy note */}
            <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground/70">
                <ShieldCheck className="size-3.5" />
                <span>Saved as your default resume for matching until you replace or remove it.</span>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                aria-label="Choose a default resume file"
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
