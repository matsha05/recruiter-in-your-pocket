/**
 * QuickMatchCard Component — Premium Edition
 * 
 * Job card with score dial, hover-reveal delete button.
 */

import type { SavedJob } from '../../background/messages';

interface QuickMatchCardProps {
    job: SavedJob;
    onClick?: () => void;
    onDelete?: () => void;
}

export default function QuickMatchCard({ job, onClick, onDelete }: QuickMatchCardProps) {
    const score = job.score ?? 0;

    function handleDelete(e: React.MouseEvent) {
        e.stopPropagation();
        onDelete?.();
    }

    return (
        <div className="job-card" onClick={onClick}>
            <ScoreDial score={score} />
            <div className="job-info">
                <div className="job-title">{job.title}</div>
                <div className="job-meta">
                    <span className="job-company">{job.company}</span>
                    {job.source && (
                        <span className="job-source">{job.source === 'linkedin' ? 'LI' : 'IN'}</span>
                    )}
                </div>
            </div>
            <div className="job-actions">
                <button
                    className="job-delete-btn"
                    onClick={handleDelete}
                    title="Remove job"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                </button>
                <span className="job-arrow">→</span>
            </div>
        </div>
    );
}

interface ScoreDialProps {
    score: number;
}

function ScoreDial({ score }: ScoreDialProps) {
    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    const progress = (score / 100) * circumference;
    const offset = circumference - progress;
    const scoreClass = getScoreClass(score);

    return (
        <div className="score-dial">
            <svg viewBox="0 0 48 48">
                <circle
                    className="score-dial-bg"
                    cx="24"
                    cy="24"
                    r={radius}
                />
                <circle
                    className={`score-dial-progress stroke-${scoreClass}`}
                    cx="24"
                    cy="24"
                    r={radius}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                />
            </svg>
            <div className={`score-dial-text score-${scoreClass}`}>
                {score || '—'}
            </div>
        </div>
    );
}

function getScoreClass(score: number): 'success' | 'premium' | 'destructive' {
    if (score >= 85) return 'success';
    if (score >= 70) return 'premium';
    return 'destructive';
}
