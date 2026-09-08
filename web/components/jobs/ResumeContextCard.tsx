"use client";

import { Button } from "@/components/ui/button";
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
            <div className={cn("animate-pulse rounded-2xl border border-border bg-card p-5 motion-reduce:animate-none sm:rounded-3xl sm:p-6", className)}>
                <div className="h-4 bg-muted rounded w-1/3"></div>
            </div>
        );
    }

    if (profileError) {
        return (
            <div className={cn("rounded-2xl border border-destructive/30 bg-error-surface p-5 sm:rounded-3xl sm:p-6", className)} role="alert">
                <div className="flex min-w-0 items-start gap-3">
                    <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">{profileError}</p>
                        <p className="mt-1 text-xs text-muted-foreground">Your saved resume has not been removed.</p>
                    </div>
                    <button type="button" onClick={() => void fetchProfile()} className="inline-flex min-h-11 shrink-0 items-center rounded-xl px-3 text-sm font-medium text-foreground hover:bg-muted hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">Retry</button>
                </div>
            </div>
        );
    }

    // ===== RESUME ACTIVE STATE =====
    if (profile?.hasResume) {
        return (
            <div className={cn(
                "rounded-2xl border border-border bg-card p-5 sm:rounded-3xl sm:p-6",
                className
            )}>
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 items-start gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-success/10">
                            <Check className="size-4 text-success" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                {isRenaming ? (
                                    <div className="flex w-full min-w-0 items-center gap-1">
                                        <input
                                            type="text"
                                            value={renameValue}
                                            disabled={isSaving}
                                            onChange={(e) => setRenameValue(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleRename();
                                                if (e.key === 'Escape') setIsRenaming(false);
                                            }}
                                            className="min-h-12 w-full min-w-0 flex-1 rounded-md border border-input bg-background px-3 text-base font-medium focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                                            aria-label="Resume filename"
                                            autoFocus
                                        />
                                        <button type="button"
                                            onClick={handleRename}
                                            disabled={isSaving}
                                            className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl text-success hover:bg-success/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                                            aria-label="Save resume filename"
                                        >
                                            <Check className="size-3" />
                                        </button>
                                        <button type="button"
                                            onClick={() => setIsRenaming(false)}
                                            className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                                            aria-label="Cancel resume rename"
                                        >
                                            <X className="size-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <span className="min-w-0 break-words text-base font-medium text-foreground">
                                            {profile.resumeFilename || 'Default resume saved'}
                                        </span>
                                        <button type="button"
                                            onClick={() => {
                                                setRenameValue(profile.resumeFilename || '');
                                                setIsRenaming(true);
                                            }}
                                            className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                                            title="Rename"
                                            aria-label="Rename resume"
                                        >
                                            <Pencil className="size-3" />
                                        </button>
                                    </>
                                )}
                                <span className="rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                                    Active
                                </span>
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs leading-5 text-muted-foreground">
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
                        className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
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
            <div className={cn("rounded-2xl border border-border bg-card p-5 sm:rounded-3xl sm:p-6", className)}>
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 items-start gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                            <Upload className="size-4 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-foreground">Sign in to save your default resume</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                We compare this resume with the jobs you save.
                            </p>
                        </div>
                    </div>
                    <Button asChild className="shrink-0">
                      <Link
                          href="/auth?from=jobs"
                      >
                          Sign In
                      </Link>
                    </Button>
                </div>
            </div>
        );
    }

    // ===== UPLOAD PROMPT STATE =====
    return (
        <div
            className={cn(
                "relative cursor-pointer rounded-2xl border border-dashed border-input bg-card p-5 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 sm:rounded-3xl sm:p-6",
                isDragOver
                    ? "border-brand bg-brand/10"
                    : "border-input hover:border-brand hover:bg-brand/5",
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
                <div className="flex min-w-0 items-start gap-3">
                    <Loader2 className="size-5 text-brand animate-spin" />
                    <div>
                        <p className="text-sm font-medium text-foreground">Saving your resume…</p>
                        {fileName && <p className="text-xs text-muted-foreground">{fileName}</p>}
                    </div>
                </div>
            ) : (
                <div className="flex min-w-0 items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
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
