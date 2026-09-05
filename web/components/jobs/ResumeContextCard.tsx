"use client";

import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
    FileText,
    Upload,
    Check,
    Loader2,
    Target,
    RefreshCw,
    AlertCircle,
    Pencil,
    X
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from "@/components/providers/AuthProvider";
import { ClientActionError, getClientActionError } from "@/lib/client-action-error";

// =============================================================================
// TYPES
// =============================================================================

interface ResumeProfile {
    hasResume: boolean;
    resumePreview?: string;
    resumeFilename?: string;
    updatedAt?: string;
    skillsCount?: number;
    hasEmbedding?: boolean;
}

interface ResumeContextCardProps {
    className?: string;
    onResumeUpdated?: () => void;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function ResumeContextCard({ className, onResumeUpdated }: ResumeContextCardProps) {
    const { user, isLoading: authLoading } = useAuth();
    const [profile, setProfile] = useState<ResumeProfile | null>(null);
    const [profileError, setProfileError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const [isRenaming, setIsRenaming] = useState(false);
    const [renameValue, setRenameValue] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchProfile = useCallback(async () => {
        setProfileError(null);
        setIsLoading(true);
        try {
            const res = await fetch("/api/user/default-resume");
            if (!res.ok) {
                // Handle 401 or other errors gracefully
                if (res.status === 401) {
                    setProfile({ hasResume: false });
                    return;
                }
                throw new Error('Failed to fetch');
            }
            const data = await res.json();
            if (data.success) {
                setProfile(data.data);
            } else {
                throw new ClientActionError(data.error, 'Could not load your matching resume. Please try again.');
            }
        } catch (error) {
            console.error("[ResumeContext] Fetch error:", error);
            setProfile(null);
            setProfileError(getClientActionError(error, "Could not load your matching resume. Please try again."));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            setProfile({ hasResume: false });
            setIsLoading(false);
            return;
        }
        fetchProfile();
    }, [authLoading, fetchProfile, user]);

    const handleFile = async (file: File) => {
        if (!user) {
            toast.error("Sign in to save a default resume for job matching.");
            return;
        }

        if (file.size > 4 * 1024 * 1024) {
            toast.error("File too large. Max 4 MB.");
            return;
        }

        setFileName(file.name);
        setIsSaving(true);

        try {
            let text = "";

            // Handle TXT files directly
            if (file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt")) {
                text = await file.text();
            } else {
                // For PDF/DOCX, use parse-resume API
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

                text = parseData.text;
            }

            if (text.length < 100) {
                toast.error("Resume too short. Please upload your full resume.");
                setFileName(null);
                setIsSaving(false);
                return;
            }

            // Save to profile (include filename)
            const saveRes = await fetch("/api/user/default-resume", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resumeText: text, filename: file.name }),
            });

            const saveData = await saveRes.json();
            if (saveData.success) {
                toast.success(`Resume saved. ${saveData.data.skillsCount} skills identified.`);
                setProfile({
                    hasResume: true,
                    resumePreview: saveData.data.resumePreview,
                    resumeFilename: saveData.data.resumeFilename,
                    updatedAt: saveData.data.updatedAt,
                    skillsCount: saveData.data.skillsCount,
                    hasEmbedding: saveData.data.hasEmbedding,
                });
                onResumeUpdated?.();
            } else {
                throw new ClientActionError(saveData.error, "We couldn't save your resume. Please upload it again.");
            }
        } catch (error: any) {
            console.error("[ResumeContext] Error:", error);
            toast.error(getClientActionError(error, "We couldn't save your resume. Please upload it again."));
        } finally {
            setFileName(null);
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
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const dateOptions: Intl.DateTimeFormatOptions = {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        };
        const timeOptions: Intl.DateTimeFormatOptions = {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        };
        return `${date.toLocaleDateString('en-US', dateOptions)} at ${date.toLocaleTimeString('en-US', timeOptions)}`;
    };

    const handleRename = async () => {
        if (!renameValue.trim() || !profile || isSaving) return;
        const filename = renameValue.trim();
        setIsSaving(true);
        try {
            const res = await fetch('/api/user/default-resume', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename })
            });
            const result = await res.json().catch(() => null);
            if (!res.ok || !result?.success) {
                throw new Error('Resume rename was not confirmed');
            }
            setProfile(prev => prev ? { ...prev, resumeFilename: filename } : prev);
            setIsRenaming(false);
            toast.success('Resume renamed');
        } catch {
            toast.error("We couldn't rename your resume. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className={cn("rounded border border-border bg-card p-4 animate-pulse", className)}>
                <div className="h-4 bg-muted rounded w-1/3"></div>
            </div>
        );
    }

    if (profileError) {
        return (
            <div className={cn("border-l-2 border-destructive bg-error p-4", className)} role="alert">
                <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">{profileError}</p>
                        <p className="mt-1 text-xs text-muted-foreground">Your saved resume has not been removed.</p>
                    </div>
                    <button type="button" onClick={() => void fetchProfile()} className="inline-flex min-h-11 shrink-0 items-center px-2 text-xs font-semibold text-foreground hover:text-brand">Retry</button>
                </div>
            </div>
        );
    }

    // ===== RESUME ACTIVE STATE =====
    if (profile?.hasResume) {
        return (
            <div className={cn(
                "rounded border border-success/30 bg-success/5 p-4",
                className
            )}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="size-8 rounded bg-success/10 flex items-center justify-center">
                            <Check className="size-4 text-success" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                {isRenaming ? (
                                    <div className="flex items-center gap-1">
                                        <input
                                            type="text"
                                            value={renameValue}
                                            disabled={isSaving}
                                            onChange={(e) => setRenameValue(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleRename();
                                                if (e.key === 'Escape') setIsRenaming(false);
                                            }}
                                            className="h-6 px-1.5 text-sm font-medium border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-brand"
                                            aria-label="Resume filename"
                                            autoFocus
                                        />
                                        <button type="button"
                                            onClick={handleRename}
                                            disabled={isSaving}
                                            className="inline-flex size-11 items-center justify-center rounded text-success hover:bg-success/10"
                                            aria-label="Save resume filename"
                                        >
                                            <Check className="size-3" />
                                        </button>
                                        <button type="button"
                                            onClick={() => setIsRenaming(false)}
                                            className="inline-flex size-11 items-center justify-center rounded text-muted-foreground hover:bg-muted"
                                            aria-label="Cancel resume rename"
                                        >
                                            <X className="size-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <span className="font-medium text-foreground text-sm">
                                            {profile.resumeFilename || 'Default resume saved'}
                                        </span>
                                        <button type="button"
                                            onClick={() => {
                                                setRenameValue(profile.resumeFilename || '');
                                                setIsRenaming(true);
                                            }}
                                            className="inline-flex size-11 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                            title="Rename"
                                            aria-label="Rename resume"
                                        >
                                            <Pencil className="size-3" />
                                        </button>
                                    </>
                                )}
                                <span className="text-xs text-success bg-success/10 px-1.5 py-0.5 rounded-sm">
                                    Active
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                <span className="flex items-center gap-1">
                                    <Target className="size-3" />
                                    {profile.skillsCount} skills identified
                                </span>
                                <span>Updated {formatDate(profile.updatedAt || "")}</span>
                            </div>
                        </div>
                    </div>

                    <button type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isSaving}
                        className="inline-flex min-h-11 items-center gap-1.5 px-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                        aria-label="Upload a different resume"
                    >
                        <RefreshCw className={cn("size-3", isSaving && "animate-spin")} />
                        {isSaving ? "Updating…" : "Change"}
                    </button>
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
                    aria-label="Choose a replacement resume"
                />
            </div>
        );
    }

    if (!user) {
        return (
            <div className={cn("rounded border border-border/60 bg-card p-4", className)}>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="flex size-8 items-center justify-center rounded bg-muted/50">
                            <Upload className="size-4 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-foreground">Sign in to save your default resume</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                We compare this resume with the jobs you save.
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/auth?from=jobs"
                        className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-md bg-foreground px-4 py-2 text-xs font-semibold text-background transition-colors hover:bg-foreground/90"
                    >
                        Sign In
                    </Link>
                </div>
            </div>
        );
    }

    // ===== UPLOAD PROMPT STATE =====
    return (
        <div
            className={cn(
                "relative rounded border-2 border-dashed transition-all duration-200 cursor-pointer p-4",
                isDragOver
                    ? "border-brand bg-brand/5"
                    : "border-border/50 hover:border-brand/50 hover:bg-muted/30",
                className
            )}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => {
                if (!isSaving) fileInputRef.current?.click();
            }}
            onKeyDown={(event) => {
                if (!isSaving && (event.key === 'Enter' || event.key === ' ')) {
                    event.preventDefault();
                    fileInputRef.current?.click();
                }
            }}
            role="button"
            tabIndex={isSaving ? -1 : 0}
            aria-disabled={isSaving}
            aria-label="Upload resume for job matching"
        >
            {isSaving ? (
                <div className="flex items-center gap-3">
                    <Loader2 className="size-5 text-brand animate-spin" />
                    <div>
                        <p className="text-sm font-medium text-foreground">Saving your resume…</p>
                        {fileName && <p className="text-xs text-muted-foreground">{fileName}</p>}
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-3">
                    <div className="size-8 rounded bg-muted/50 flex items-center justify-center">
                        <Upload className="size-4 text-muted-foreground" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-foreground">
                            Upload resume for matching
                        </p>
                        <p className="text-xs text-muted-foreground">
                            PDF, DOCX, or TXT, up to 4 MB
                        </p>
                    </div>
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                }}
                className="hidden"
                aria-label="Choose a resume for job matching"
            />
        </div>
    );
}
