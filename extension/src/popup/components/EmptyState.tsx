/**
 * EmptyState Component — Premium Edition
 * 
 * Polished empty state matching web Jobs section design.
 * Features gradient illustration, feature hints, and engaging copy.
 */

export default function EmptyState() {
    return (
        <div className="empty-state-premium">
            {/* Visual illustration */}
            <div className="empty-illustration">
                <div className="empty-illustration-bg" />
                <div className="empty-illustration-inner">
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="empty-icon-svg"
                    >
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                </div>
            </div>

            <div className="empty-content">
                <div className="empty-state-title">No jobs captured yet</div>
                <div className="empty-state-description">
                    Browse to a LinkedIn or Indeed job posting, then click the capture button to see how your resume stacks up.
                </div>
            </div>

            {/* Feature hints */}
            <div className="empty-features">
                <div className="empty-feature">
                    <span className="empty-feature-dot empty-feature-success" />
                    <span>Match scoring</span>
                </div>
                <div className="empty-feature">
                    <span className="empty-feature-dot empty-feature-brand" />
                    <span>Gap analysis</span>
                </div>
                <div className="empty-feature">
                    <span className="empty-feature-dot empty-feature-premium" />
                    <span>Suggestions</span>
                </div>
            </div>
        </div>
    );
}
