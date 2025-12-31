/**
 * EmptyState Component — Premium Edition
 * 
 * Refined empty state with subtle visual hierarchy.
 */

export default function EmptyState() {
    return (
        <div className="empty-state">
            <div className="empty-state-icon">
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="empty-icon-svg"
                >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
            </div>
            <div className="empty-state-title">No jobs captured yet</div>
            <div className="empty-state-description">
                Browse to a LinkedIn or Indeed job posting, then click the floating capture button to get your match score.
            </div>
        </div>
    );
}
