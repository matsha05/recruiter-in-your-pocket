"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    Briefcase,
    Search,
    Filter,
    ExternalLink,
    MoreHorizontal,
    Trash2,
    ArrowUpRight
} from 'lucide-react';
import ResumeContextCard from './ResumeContextCard';
import ConfirmModal from '@/components/shared/ConfirmModal';

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

const STATUS_CONFIG: Record<JobStatus, { label: string; color: string }> = {
    saved: { label: 'Saved', color: 'bg-muted text-muted-foreground' },
    interested: { label: 'Interested', color: 'bg-blue-500/10 text-blue-600' },
    applying: { label: 'Applying', color: 'bg-amber-500/10 text-amber-600' },
    interviewing: { label: 'Interviewing', color: 'bg-purple-500/10 text-purple-600' },
    archived: { label: 'Archived', color: 'bg-muted/50 text-muted-foreground' },
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function JobsClient() {
    const router = useRouter();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');
    const [refreshKey, setRefreshKey] = useState(0);

    // Delete modal state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Fetch jobs on mount
    useEffect(() => {
        async function fetchJobs() {
            try {
                const res = await fetch('/api/extension/saved-jobs');
                if (res.ok) {
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
                }
            } catch (err) {
                console.error('Failed to fetch jobs:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchJobs();
    }, [refreshKey]);

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
        router.push(`/jobs/${job.id}`);
    }, [router]);

    // Handle open original
    const handleOpenOriginal = useCallback((e: React.MouseEvent, job: Job) => {
        e.stopPropagation();
        window.open(job.url, '_blank');
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
            }
        } catch (err) {
            console.error('Failed to delete job:', err);
        } finally {
            setDeleteLoading(false);
        }
    }, [jobToDelete]);

    // Handle resume update - refresh jobs to recalculate scores
    const handleResumeUpdated = useCallback(() => {
        setRefreshKey(k => k + 1);
    }, []);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-1">
                <h1 className="text-2xl font-display font-semibold tracking-tight text-foreground">
                    Jobs
                </h1>
                <p className="text-muted-foreground">
                    Track and compare jobs with recruiter-grade match insights.
                </p>
            </div>

            {/* Resume Context Card */}
            <ResumeContextCard onResumeUpdated={handleResumeUpdated} />

            {/* Toolbar */}
            <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search jobs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-9 pl-9 pr-4 rounded-md border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                    />
                </div>

                {/* Status Filter */}
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as JobStatus | 'all')}
                    className="h-9 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                >
                    <option value="all">All Status</option>
                    <option value="saved">Saved</option>
                    <option value="interested">Interested</option>
                    <option value="applying">Applying</option>
                    <option value="interviewing">Interviewing</option>
                    <option value="archived">Archived</option>
                </select>
            </div>

            {/* Jobs List */}
            <div className="border border-border rounded-lg overflow-hidden bg-card">
                {loading ? (
                    <div className="p-8 text-center text-muted-foreground">
                        Loading jobs...
                    </div>
                ) : filteredJobs.length === 0 ? (
                    <EmptyState hasJobs={jobs.length > 0} />
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
    const score = job.match_score ?? 0;
    const statusConfig = STATUS_CONFIG[job.status];
    const capturedDate = new Date(job.captured_at);
    const timeAgo = getTimeAgo(capturedDate);

    return (
        <div
            className="group flex items-center gap-4 px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors"
            onClick={onClick}
        >
            {/* Score Dial */}
            <ScoreDial score={score} />

            {/* Job Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground truncate">
                        {job.title}
                    </h3>
                    <span className={cn(
                        "px-2 py-0.5 text-xs font-medium rounded-full shrink-0",
                        statusConfig.color
                    )}>
                        {statusConfig.label}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
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

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={onOpenOriginal}
                    className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    title="Open original posting"
                >
                    <ExternalLink className="h-4 w-4" />
                </button>
                <button
                    onClick={onDelete}
                    className="p-2 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    title="Delete job"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

// =============================================================================
// SCORE DIAL COMPONENT
// =============================================================================

function ScoreDial({ score }: { score: number }) {
    const radius = 16;
    const circumference = 2 * Math.PI * radius;
    const progress = (score / 100) * circumference;
    const offset = circumference - progress;
    const scoreClass = getScoreClass(score);

    const colors = {
        success: { stroke: 'stroke-success', text: 'text-success' },
        premium: { stroke: 'stroke-premium', text: 'text-premium' },
        destructive: { stroke: 'stroke-destructive', text: 'text-destructive' },
    };

    return (
        <div className="relative w-10 h-10 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 40 40">
                <circle
                    cx="20"
                    cy="20"
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-muted/30"
                />
                <circle
                    cx="20"
                    cy="20"
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
                "absolute inset-0 flex items-center justify-center text-xs font-semibold",
                colors[scoreClass].text
            )}>
                {score > 0 ? score : '—'}
            </div>
        </div>
    );
}

// =============================================================================
// EMPTY STATE
// =============================================================================

function EmptyState({ hasJobs }: { hasJobs: boolean }) {
    if (hasJobs) {
        return (
            <div className="p-8 text-center">
                <p className="text-muted-foreground">No jobs match your filters.</p>
            </div>
        );
    }

    return (
        <div className="p-12 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-muted/50 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-2">
                <h3 className="font-medium text-foreground">No jobs captured yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    Save your first job from LinkedIn or Indeed using the RIYP extension to start comparing matches.
                </p>
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
