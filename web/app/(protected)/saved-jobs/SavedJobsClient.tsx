"use client";

import { useState } from "react";
import { Trash2, ExternalLink, FileText } from "lucide-react";
import { getScoreColor } from "@/lib/score-utils";

interface SavedJob {
    id: string;
    external_id: string;
    title: string;
    company: string;
    url: string;
    source: string;
    job_description_preview: string;
    score: number | null;
    created_at: string;
}

interface SavedJobsClientProps {
    initialJobs: SavedJob[];
}

export default function SavedJobsClient({ initialJobs }: SavedJobsClientProps) {
    const [jobs, setJobs] = useState(initialJobs);
    const [deletedJob, setDeletedJob] = useState<SavedJob | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    async function handleDelete(job: SavedJob) {
        setIsDeleting(job.id);

        // Optimistically remove
        setJobs(prev => prev.filter(j => j.id !== job.id));
        setDeletedJob(job);

        try {
            const res = await fetch(`/api/extension/delete-job?id=${job.id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                throw new Error("Failed to delete");
            }
        } catch (error) {
            console.error("[SavedJobs] Delete error:", error);
            // Restore on failure
            setJobs(prev => [job, ...prev].sort((a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            ));
            setDeletedJob(null);
        } finally {
            setIsDeleting(null);
        }
    }

    async function handleUndo() {
        if (!deletedJob) return;

        // Restore to UI
        setJobs(prev => [deletedJob, ...prev].sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ));

        // TODO: Re-create in database (would need a separate endpoint)
        setDeletedJob(null);
    }

    function handleDismissUndo() {
        setDeletedJob(null);
    }

    if (jobs.length === 0 && !deletedJob) {
        return (
            <div className="text-center py-16">
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-6 h-6 text-muted-foreground" />
                </div>
                <h2 className="text-lg font-medium text-foreground mb-2">No jobs captured yet</h2>
                <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
                    Install the RIYP browser extension and browse to a LinkedIn or Indeed job posting.
                    Click the floating &quot;Capture JD&quot; button to save jobs here.
                </p>
                <a
                    href="/workspace"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                    Upload a Resume Instead
                </a>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Job List */}
            <div className="space-y-3">
                {jobs.map((job) => (
                    <div
                        key={job.id}
                        className="group relative flex items-center gap-4 p-4 bg-card border rounded-lg hover:border-border/60 hover:shadow-sm transition-all"
                    >
                        {/* Score Dial */}
                        <ScoreDial score={job.score ?? 0} />

                        {/* Job Info */}
                        <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-foreground text-sm truncate">
                                {job.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-muted-foreground text-xs truncate">
                                    {job.company}
                                </span>
                                <span className="text-muted-foreground/50 text-xs">•</span>
                                <span className="text-muted-foreground/70 text-xs uppercase tracking-wide">
                                    {job.source === "linkedin" ? "LinkedIn" : job.source === "indeed" ? "Indeed" : job.source}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <a
                                href={job.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                title="Open job posting"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </a>
                            <button
                                onClick={() => handleDelete(job)}
                                disabled={isDeleting === job.id}
                                className="p-2 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                                title="Remove job"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Undo Toast */}
            {deletedJob && (
                <UndoToast
                    message={`Removed "${deletedJob.title.slice(0, 30)}..."`}
                    onUndo={handleUndo}
                    onDismiss={handleDismissUndo}
                />
            )}
        </div>
    );
}

// Score Dial Component
function ScoreDial({ score }: { score: number }) {
    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    const progress = (score / 100) * circumference;
    const offset = circumference - progress;
    const color = getScoreColor(score);

    return (
        <div className="relative w-12 h-12 flex-shrink-0">
            <svg viewBox="0 0 48 48" className="w-full h-full -rotate-90">
                <circle
                    cx="24"
                    cy="24"
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-muted"
                />
                <circle
                    cx="24"
                    cy="24"
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="transition-all duration-500"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span
                    className="text-xs font-display font-medium tabular-nums"
                    style={{ color }}
                >
                    {score || "—"}
                </span>
            </div>
        </div>
    );
}

// Undo Toast Component
function UndoToast({
    message,
    onUndo,
    onDismiss
}: {
    message: string;
    onUndo: () => void;
    onDismiss: () => void;
}) {
    // Auto-dismiss after 5 seconds
    useState(() => {
        const timer = setTimeout(onDismiss, 5000);
        return () => clearTimeout(timer);
    });

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-3 bg-foreground text-background rounded-lg shadow-lg text-sm animate-in slide-in-from-bottom fade-in duration-200">
            <span className="truncate max-w-xs">{message}</span>
            <button
                onClick={onUndo}
                className="px-3 py-1 bg-primary text-primary-foreground rounded text-xs font-medium hover:bg-primary/90 transition-colors"
            >
                Undo
            </button>
        </div>
    );
}
