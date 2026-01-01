"use client";

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
import { InsightSparkleIcon } from "@/components/icons";

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
    const [profile, setProfile] = useState<ResumeProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const [isRenaming, setIsRenaming] = useState(false);
    const [renameValue, setRenameValue] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchProfile = useCallback(async () => {
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
                setProfile({ hasResume: false });
            }
        } catch (error) {
            console.error("[ResumeContext] Fetch error:", error);
            setProfile({ hasResume: false });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleFile = async (file: File) => {
        if (file.size > 10 * 1024 * 1024) {
            toast.error("File too large. Max 10MB.");
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
                    toast.error(parseData.message || "Failed to parse file");
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
                toast.success(`Resume indexed! ${saveData.data.skillsCount} skills detected.`);
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
                throw new Error(saveData.error || "Failed to save");
            }
        } catch (error: any) {
            console.error("[ResumeContext] Error:", error);
            toast.error(error.message || "Failed to process resume");
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
        if (!renameValue.trim() || !profile) return;
        setIsSaving(true);
        try {
            const res = await fetch('/api/user/default-resume', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename: renameValue.trim() })
            });
            if (res.ok) {
                setProfile(prev => prev ? { ...prev, resumeFilename: renameValue.trim() } : prev);
                toast.success('Resume renamed');
            }
        } catch {
            toast.error('Failed to rename');
        } finally {
            setIsSaving(false);
            setIsRenaming(false);
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

    // ===== RESUME ACTIVE STATE =====
    if (profile?.hasResume) {
        return (
            <div className={cn(
                "rounded border border-success/30 bg-success/5 p-4",
                className
            )}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-success/10 flex items-center justify-center">
                            <Check className="w-4 h-4 text-success" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                {isRenaming ? (
                                    <div className="flex items-center gap-1">
                                        <input
                                            type="text"
                                            value={renameValue}
                                            onChange={(e) => setRenameValue(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleRename();
                                                if (e.key === 'Escape') setIsRenaming(false);
                                            }}
                                            className="h-6 px-1.5 text-sm font-medium border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-brand"
                                            autoFocus
                                        />
                                        <button
                                            onClick={handleRename}
                                            disabled={isSaving}
                                            className="p-1 text-success hover:bg-success/10 rounded"
                                        >
                                            <Check className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() => setIsRenaming(false)}
                                            className="p-1 text-muted-foreground hover:bg-muted rounded"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <span className="font-medium text-foreground text-sm">
                                            {profile.resumeFilename || 'Resume Locked In'}
                                        </span>
                                        <button
                                            onClick={() => {
                                                setRenameValue(profile.resumeFilename || '');
                                                setIsRenaming(true);
                                            }}
                                            className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                                            title="Rename"
                                        >
                                            <Pencil className="w-3 h-3" />
                                        </button>
                                    </>
                                )}
                                <span className="text-xs text-success bg-success/10 px-1.5 py-0.5 rounded-sm">
                                    Active
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                <span className="flex items-center gap-1">
                                    <Target className="w-3 h-3" />
                                    {profile.skillsCount} skills
                                </span>
                                {profile.hasEmbedding && (
                                    <span className="flex items-center gap-1 text-warning">
                                        <InsightSparkleIcon className="w-3 h-3" />
                                        Semantic matching
                                    </span>
                                )}
                                <span>Updated {formatDate(profile.updatedAt || "")}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isSaving}
                        className="text-xs text-muted-foreground hover:text-foreground font-medium inline-flex items-center gap-1.5 transition-colors"
                    >
                        <RefreshCw className={cn("w-3 h-3", isSaving && "animate-spin")} />
                        {isSaving ? "Updating..." : "Change"}
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
                />
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
            onClick={() => fileInputRef.current?.click()}
        >
            {isSaving ? (
                <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-brand animate-spin" />
                    <div>
                        <p className="text-sm font-medium text-foreground">Indexing skills...</p>
                        {fileName && <p className="text-xs text-muted-foreground">{fileName}</p>}
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-muted/50 flex items-center justify-center">
                        <Upload className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-foreground">
                            Upload resume for matching
                        </p>
                        <p className="text-xs text-muted-foreground">
                            PDF, DOCX, or TXT • Get instant match scores
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
            />
        </div>
    );
}
