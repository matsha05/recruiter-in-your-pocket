/**
 * QuickMatchCard Component — Premium Edition
 * 
 * Job card with score dial, hover-reveal actions.
 * Primary click: Opens workspace for analysis
 * Secondary icon: Opens original job posting
 */

import type { SavedJob } from '../../background/messages';

interface QuickMatchCardProps {
    job: SavedJob;
    onClick?: () => void;
    onOpenOriginal?: () => void;
    onDelete?: () => void;
}

export default function QuickMatchCard({ job, onClick, onOpenOriginal, onDelete }: QuickMatchCardProps) {
    const score = job.score ?? 0;

    function handleDelete(e: React.MouseEvent) {
        e.stopPropagation();
        onDelete?.();
    }

    function handleOpenOriginal(e: React.MouseEvent) {
        e.stopPropagation();
        onOpenOriginal?.();
    }

    // Time since capture
    const capturedAgo = getTimeAgo(job.capturedAt);

    return (
        <div className="job-card" onClick={onClick} title="Open analysis">
            <ScoreDial score={score} />
            <div className="job-info">
                <div className="job-title-row">
                    <span className="job-title">{job.title}</span>
                    {job.status && job.status !== 'saved' && (
                        <span className={`job-status-pill status-${job.status}`}>
                            {getStatusLabel(job.status)}
                        </span>
                    )}
                </div>
                <div className="job-meta">
                    <span className="job-company">{job.company}</span>
                    {job.source && (
                        <span className="job-source">{job.source === 'linkedin' ? 'LI' : 'IN'}</span>
                    )}
                </div>
                {score > 0 && (
                    <div className="job-alignment">
                        <span className={`alignment-badge ${getRoleAlignmentClass(score)}`}>
                            {getRoleAlignmentLabel(score)}
                        </span>
                    </div>
                )}
                <div className="job-status">
                    <span className="job-status-text">
                        Captured {capturedAgo} • {score > 0 ? `${getScoreBandLabel(score)}: ${score}%` : 'Ready to analyze'}
                    </span>
                </div>
            </div>
            <div className="job-actions">
                <button
                    className="job-action-btn job-external-btn"
                    onClick={handleOpenOriginal}
                    title="Open original posting"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                </button>
                <button
                    className="job-action-btn job-delete-btn"
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

function getScoreBandLabel(score: number): string {
    if (score >= 86) return 'Excellent Fit';
    if (score >= 71) return 'Strong Match';
    if (score >= 41) return 'Plausible Fit';
    if (score >= 16) return 'Career Stretch';
    return 'Not a Match';
}

function getRoleAlignmentLabel(score: number): string {
    if (score >= 71) return 'Role Match';
    if (score >= 41) return 'Adjacent Role';
    if (score >= 16) return 'Different Field';
    return 'Mismatch';
}

function getRoleAlignmentClass(score: number): string {
    if (score >= 71) return 'alignment-match';
    if (score >= 41) return 'alignment-adjacent';
    return 'alignment-mismatch';
}

function getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
        saved: 'Saved',
        interested: 'Interested',
        applying: 'Applying',
        interviewing: 'Interviewing',
        archived: 'Archived',
    };
    return labels[status] || status;
}

function getTimeAgo(timestamp: number | string | undefined): string {
    if (!timestamp) return 'recently';

    // Convert string to number if needed
    const ts = typeof timestamp === 'string' ? new Date(timestamp).getTime() : timestamp;

    // Validate it's a valid number
    if (isNaN(ts) || ts <= 0) return 'recently';

    const seconds = Math.floor((Date.now() - ts) / 1000);
    if (seconds < 0 || isNaN(seconds)) return 'recently';
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}
