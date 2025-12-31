/**
 * RecentJobsList Component — Premium Edition
 * 
 * List of recently captured jobs with match scores and delete functionality.
 */

import type { SavedJob } from '../../background/messages';
import QuickMatchCard from './QuickMatchCard';

interface RecentJobsListProps {
    jobs: SavedJob[];
    onJobClick: (job: SavedJob) => void;
    onDeleteJob: (job: SavedJob) => void;
}

export default function RecentJobsList({ jobs, onJobClick, onDeleteJob }: RecentJobsListProps) {
    function handleViewAll() {
        chrome.runtime.sendMessage({ type: 'OPEN_WEBAPP', payload: { path: '/saved-jobs' } });
    }

    return (
        <div className="animate-in">
            <div className="section-header">
                <span className="section-title">RECENT JOBS ({jobs.length})</span>
                {jobs.length > 5 && (
                    <button className="btn btn-ghost" onClick={handleViewAll}>
                        View All
                    </button>
                )}
            </div>

            <div className="jobs-list">
                {jobs.slice(0, 5).map((job) => (
                    <QuickMatchCard
                        key={job.id}
                        job={job}
                        onClick={() => onJobClick(job)}
                        onDelete={() => onDeleteJob(job)}
                    />
                ))}
            </div>
        </div>
    );
}
