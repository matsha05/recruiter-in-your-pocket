/**
 * RecentJobsList Component — Premium Edition
 * 
 * List of recently captured jobs with match scores.
 * Primary click: Opens workspace for analysis
 * Secondary action: Opens original job posting
 */

import { useId, useState } from 'react';
import type { SavedJob } from '../../background/messages';
import QuickMatchCard from './QuickMatchCard';

interface RecentJobsListProps {
    jobs: SavedJob[];
    onJobClick: (job: SavedJob) => void;
    onOpenOriginal: (job: SavedJob) => void;
    onDeleteJob: (job: SavedJob) => void;
}

export default function RecentJobsList({ jobs, onJobClick, onOpenOriginal, onDeleteJob }: RecentJobsListProps) {
    const [showAll, setShowAll] = useState(false);
    const listId = useId();
    const visibleJobs = showAll ? jobs : jobs.slice(0, 5);

    return (
        <div className="animate-in">
            <div className="section-header">
                <span className="section-title">Saved jobs ({jobs.length})</span>
                {jobs.length > 5 && (
                    <button
                        type="button"
                        className="btn btn-ghost"
                        aria-expanded={showAll}
                        aria-controls={listId}
                        onClick={() => setShowAll((expanded) => !expanded)}
                    >
                        {showAll ? 'Show recent' : `View all ${jobs.length}`}
                    </button>
                )}
            </div>

            <div id={listId} className="jobs-list">
                {visibleJobs.map((job) => (
                    <QuickMatchCard
                        key={job.id}
                        job={job}
                        onClick={() => onJobClick(job)}
                        onOpenOriginal={() => onOpenOriginal(job)}
                        onDelete={() => onDeleteJob(job)}
                    />
                ))}
            </div>
        </div>
    );
}
