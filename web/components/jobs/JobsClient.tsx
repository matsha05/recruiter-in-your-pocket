"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    Briefcase,
    Chrome,
    Search,
    Filter,
    ExternalLink,
    Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import ResumeContextCard from './ResumeContextCard';
import ConfirmModal from '@/components/shared/ConfirmModal';
import { AppPageIntro } from '@/components/layout/AppPageIntro';
import { useAuth } from '@/components/providers/AuthProvider';

// =============================================================================
// TYPES
// =============================================================================

type JobStatus = 'saved' | 'interested' | 'applying' | 'interviewing' | 'archived';

interface Job {
    id: string;
    external_id?: string;
    title: string;
    company: string;
    location?: string;
    url: string;
    source: 'linkedin' | 'indeed';
    status: JobStatus;
    match_score: number | null;
    captured_at: string;
    job_description_text?: string;
}

// =============================================================================
// STATUS CONFIG
// =============================================================================

const STATUS_CONFIG: Record<JobStatus, { label: string; color: string; bgColor: string }> = {
    saved: { label: 'Saved', color: 'text-muted-foreground', bgColor: 'bg-muted' },
    interested: { label: 'Interested', color: 'text-brand', bgColor: 'bg-brand/10' },
    applying: { label: 'Applying', color: 'text-premium', bgColor: 'bg-premium/10' },
    interviewing: { label: 'Interviewing', color: 'text-success', bgColor: 'bg-success/10' },
    archived: { label: 'Archived', color: 'text-muted-foreground/70', bgColor: 'bg-muted/30' },
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function JobsClient() {
    const { push } = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');
    const [refreshKey, setRefreshKey] = useState(0);

    // Delete modal state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Fetch jobs on mount
    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            setJobs([]);
            setLoadError(null);
            setLoading(false);
            return;
        }

        async function fetchJobs() {
            setLoading(true);
            setLoadError(null);
            try {
                const res = await fetch('/api/extension/saved-jobs');
                if (!res.ok) {
                    throw new Error('We could not load your saved jobs.');
                }
                const data = await res.json();
                // Map API response to our Job type
                const mappedJobs: Job[] = (data.jobs || []).map((j: any) => ({
                    id: j.id,
                    external_id: j.externalId,
                    title: j.title,
                    company: j.company,
                    location: j.location,
                    url: j.url,
                    source: j.source || 'linkedin',
                    status: j.status || 'saved',
                    match_score: j.score,
                    captured_at: j.capturedAt,
                }));
                setJobs(mappedJobs);
            } catch (err) {
                console.error('Failed to fetch jobs:', err);
                setLoadError(err instanceof Error ? err.message : 'We could not load your saved jobs.');
            } finally {
                setLoading(false);
            }
        }
        fetchJobs();
    }, [authLoading, refreshKey, user]);

    // Filter jobs
    const filteredJobs = jobs.filter(job => {
        const matchesSearch = searchQuery === '' ||
            job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.company.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Handle job click - navigate to job detail
    const handleJobClick = useCallback((job: Job) => {
        push(`/jobs/${job.id}`);
    }, [push]);

    // Handle open original
    const handleOpenOriginal = useCallback((e: React.MouseEvent, job: Job) => {
        e.stopPropagation();
        window.open(job.url, '_blank', 'noopener,noreferrer');
    }, []);

    // Open delete modal
    const handleDeleteClick = useCallback((e: React.MouseEvent, job: Job) => {
        e.stopPropagation();
        setJobToDelete(job);
        setDeleteModalOpen(true);
    }, []);

    // Confirm delete
    const handleConfirmDelete = useCallback(async () => {
        if (!jobToDelete) return;

        setDeleteLoading(true);
        try {
            const res = await fetch(`/api/extension/saved-jobs/${jobToDelete.id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setJobs(prev => prev.filter(j => j.id !== jobToDelete.id));
                setDeleteModalOpen(false);
                setJobToDelete(null);
                toast.success('Job removed');
            } else {
                throw new Error('We could not delete that job.');
            }
        } catch (err) {
            console.error('Failed to delete job:', err);
            toast.error(err instanceof Error ? err.message : 'We could not delete that job.');
        } finally {
            setDeleteLoading(false);
        }
    }, [jobToDelete]);

    // Handle resume update - refresh jobs to recalculate scores
    const handleResumeUpdated = useCallback(() => {
        setRefreshKey(k => k + 1);
    }, []);

    const activeJobs = jobs.filter((job) => job.status !== 'archived').length;
    const trackedSources = new Set(jobs.map((job) => job.source)).size;

    return (
        <div data-visual-anchor="jobs-page" className="gap-y-6">
            <AppPageIntro
                anchor="jobs-page"
                eyebrow="Opportunity tracker"
                title="Jobs"
                description="Track saved roles, compare fit, and keep the recruiter-grade context next to every application."
                meta={
                    <>
                        <span className="inline-flex items-center border-l-2 border-cyan-bright bg-surface-sky px-3 py-1 text-xs font-medium text-muted-foreground">
                            {activeJobs} active role{activeJobs === 1 ? "" : "s"}
                        </span>
                        <span className="inline-flex items-center border-l-2 border-line bg-paper-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                            {trackedSources || 1} source{trackedSources === 1 ? "" : "s"}
                        </span>
                    </>
                }
                actions={(
                    <div className="flex flex-wrap items-center gap-2">
                        <Link
                            href="/extension"
                            className="inline-flex min-h-11 items-center gap-2 rounded-md border border-foreground bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-paper-muted"
                        >
                            <Chrome className="size-4" />
                            Install extension
                        </Link>
                        <Link
                            href="/workspace"
                            className="inline-flex min-h-11 items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
                        >
                            Get report
                        </Link>
                    </div>
                )}
            />

            {/* Resume Context Card */}
            <ResumeContextCard onResumeUpdated={handleResumeUpdated} />

            {/* Toolbar */}
            <div className="app-card flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between md:px-5">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                    <label htmlFor="jobs-search" className="sr-only">Search saved jobs</label>
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                        id="jobs-search"
                        type="text"
                        placeholder="Search jobs…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="min-h-11 w-full rounded border border-border bg-background pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                    />
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-2">
                    <label htmlFor="jobs-status-filter" className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        <Filter className="size-3.5" />
                        Status
                    </label>
                    <select
                        id="jobs-status-filter"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as JobStatus | 'all')}
                        className="min-h-11 rounded border border-border bg-background px-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                    >
                        <option value="all">All Status</option>
                        <option value="saved">Saved</option>
                        <option value="interested">Interested</option>
                        <option value="applying">Applying</option>
                        <option value="interviewing">Interviewing</option>
                        <option value="archived">Archived</option>
                    </select>
                </div>
            </div>

            <div className="border-l-2 border-cyan-bright bg-surface-sky px-4 py-3 text-sm text-muted-foreground">
                Saved jobs are easiest to build from the extension. Capture a supported role while you browse, then return here when you want to compare fit and move it forward.
            </div>

            {/* Jobs List */}
            <div className="app-card overflow-hidden">
                {loading ? (
                    <div className="p-10 text-center text-muted-foreground">
                        Loading jobs…
                    </div>
                ) : loadError ? (
                    <div className="p-10 text-center" role="alert">
                        <p className="text-sm font-medium text-foreground">Saved jobs are unavailable right now.</p>
                        <p className="mt-1 text-sm text-muted-foreground">{loadError}</p>
                        <button
                            type="button"
                            onClick={() => setRefreshKey((key) => key + 1)}
                            className="mt-4 min-h-11 rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background transition-colors hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                        >
                            Try again
                        </button>
                    </div>
                ) : filteredJobs.length === 0 ? (
                    <EmptyState hasJobs={jobs.length > 0} signedIn={Boolean(user)} />
                ) : (
                    <div className="divide-y divide-border">
                        {filteredJobs.map((job) => (
                            <JobRow
                                key={job.id}
                                job={job}
                                onClick={() => handleJobClick(job)}
                                onOpenOriginal={(e) => handleOpenOriginal(e, job)}
                                onDelete={(e) => handleDeleteClick(e, job)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setJobToDelete(null);
                }}
                onConfirm={handleConfirmDelete}
                title="Delete Job"
                description={jobToDelete ? `Are you sure you want to delete "${jobToDelete.title}" from your saved jobs? This action cannot be undone.` : ''}
                confirmText="Delete"
                cancelText="Cancel"
                variant="destructive"
                loading={deleteLoading}
            />
        </div>
    );
}

// =============================================================================
// JOB ROW COMPONENT
// =============================================================================

interface JobRowProps {
    job: Job;
    onClick: () => void;
    onOpenOriginal: (e: React.MouseEvent) => void;
    onDelete: (e: React.MouseEvent) => void;
}

function JobRow({ job, onClick, onOpenOriginal, onDelete }: JobRowProps) {
    const statusConfig = STATUS_CONFIG[job.status];
    const capturedDate = new Date(job.captured_at);
    const timeAgo = getTimeAgo(capturedDate);

    return (
        <article className="group flex flex-col items-stretch gap-2 p-2 transition-colors hover:bg-muted/20 sm:flex-row sm:items-center sm:gap-4 sm:p-4">
            <button
                type="button"
                onClick={onClick}
                aria-label={`Open ${job.title} at ${job.company}`}
                className="flex min-w-0 flex-1 items-center gap-3 rounded-md p-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 sm:gap-4"
            >
                {/* Score Dial */}
                <ScoreDial score={job.match_score} />

                {/* Job Info */}
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate font-medium text-foreground">
                            {job.title}
                        </h3>
                        <span className={cn(
                            "shrink-0 rounded px-2.5 py-0.5 text-xs font-medium",
                            statusConfig.bgColor,
                            statusConfig.color
                        )}>
                            {statusConfig.label}
                        </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <span>{job.company}</span>
                        {job.location && (
                            <>
                                <span className="text-border">•</span>
                                <span className="truncate">{job.location}</span>
                            </>
                        )}
                        <span className="text-border">•</span>
                        <span className="text-xs opacity-70">{timeAgo}</span>
                    </div>
                </div>
            </button>

            {/* Actions */}
            <div className="flex w-full items-center justify-end gap-1 border-t border-line px-2 pt-2 opacity-80 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 sm:w-auto sm:border-0 sm:p-0">
                <button type="button"
                    onClick={onOpenOriginal}
                    className="inline-flex size-11 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    title="Open original posting"
                    aria-label={`Open the original posting for ${job.title}`}
                >
                    <ExternalLink className="size-4" />
                </button>
                <button type="button"
                    onClick={onDelete}
                    className="inline-flex size-11 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
                    title="Delete job"
                    aria-label={`Delete ${job.title}`}
                >
                    <Trash2 className="size-4" />
                </button>
            </div>
        </article>
    );
}

// =============================================================================
// SCORE DIAL COMPONENT
// =============================================================================

function ScoreDial({ score }: { score: number | null }) {
    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    const progress = ((score ?? 0) / 100) * circumference;
    const offset = circumference - progress;
    const scoreClass = score === null ? 'neutral' : getScoreClass(score);

    const colors = {
        success: { stroke: 'stroke-success', text: 'text-success' },
        premium: { stroke: 'stroke-premium', text: 'text-premium' },
        destructive: { stroke: 'stroke-destructive', text: 'text-destructive' },
        neutral: { stroke: 'stroke-muted-foreground/25', text: 'text-muted-foreground' },
    };

    return (
        <div
            className="relative size-12 shrink-0"
            aria-label={score === null ? 'Match score not available' : `Match score ${score} out of 100`}
        >
            <svg aria-hidden="true" className="size-full -rotate-90" viewBox="0 0 48 48">
                <circle
                    cx="24"
                    cy="24"
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-muted/20"
                />
                <circle
                    cx="24"
                    cy="24"
                    r={radius}
                    fill="none"
                    strokeWidth="3"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className={colors[scoreClass].stroke}
                />
            </svg>
            <div className={cn(
                "absolute inset-0 flex items-center justify-center text-sm font-semibold",
                colors[scoreClass].text
            )}>
                {score === null ? '—' : score}
            </div>
        </div>
    );
}

// =============================================================================
// EMPTY STATE
// =============================================================================

function EmptyState({ hasJobs, signedIn }: { hasJobs: boolean; signedIn: boolean }) {
    if (hasJobs) {
        return (
            <div className="p-8 text-center">
                <p className="text-muted-foreground">No jobs match your filters.</p>
            </div>
        );
    }

    if (!signedIn) {
        return (
            <div className="gap-y-5 border-y border-border bg-card p-8 text-center sm:p-16">
                <div className="mx-auto flex size-20 items-center justify-center rounded-md border border-border bg-mineral">
                    <Briefcase className="size-8 text-brand/60" />
                </div>
                <div className="gap-y-3">
                    <h3 className="font-display text-lg font-medium text-foreground">Sign in to see saved jobs</h3>
                    <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
                        Your job tracker is tied to your account, so we only load saved roles and default resume context after you sign in.
                    </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3">
                    <Link
                        href="/auth?from=jobs"
                        className="inline-flex min-h-11 items-center gap-2 rounded-md bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ink-deep"
                    >
                        Sign In
                    </Link>
                    <Link
                        href="/workspace"
                        className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted/40"
                    >
                        Open Workspace
                    </Link>
                    <Link
                        href="/extension"
                        className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted/40"
                    >
                        Install extension
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="gap-y-6 border-y border-border bg-card p-8 text-center sm:p-16">
            {/* Visual illustration */}
            <div className="relative mx-auto size-20">
                <div className="absolute inset-0 rounded-md border border-brand/20 bg-mineral" />
                <div className="absolute inset-2 flex items-center justify-center rounded-sm bg-card">
                    <Briefcase className="size-8 text-brand/60" />
                </div>
            </div>
            <div className="gap-y-3">
                <h3 className="font-display text-lg font-medium text-foreground">No jobs captured yet</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                    Save your first job from LinkedIn or Indeed using the RIYP extension, and we&apos;ll show you how your resume stacks up.
                </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                    href="/extension"
                    className="inline-flex min-h-11 items-center gap-2 rounded-md bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ink-deep"
                >
                    Install extension
                </Link>
                <Link
                    href="/workspace"
                    className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted/40"
                >
                    Get report manually
                </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-5 pt-2 sm:gap-8">
                <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
                    <div className="size-2 rounded-full bg-success/40" />
                    <span>Match scoring</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
                    <div className="size-2 rounded-full bg-brand/40" />
                    <span>Gap analysis</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
                    <div className="size-2 rounded-full bg-premium/40" />
                    <span>Tailored suggestions</span>
                </div>
            </div>
        </div>
    );
}

// =============================================================================
// UTILITIES
// =============================================================================

function getScoreClass(score: number): 'success' | 'premium' | 'destructive' {
    if (score >= 85) return 'success';
    if (score >= 70) return 'premium';
    return 'destructive';
}

function getTimeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
}
