/**
 * AuthPrompt Component — Premium Edition
 * 
 * Elegant auth prompt with refined visual design.
 */

interface AuthPromptProps {
    onLogin: () => void;
}

export default function AuthPrompt({ onLogin }: AuthPromptProps) {
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
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
            </div>
            <div className="empty-state-title">Sign in to sync</div>
            <div className="empty-state-description">
                Connect your RIYP account to save jobs across devices and get personalized match scores.
            </div>
            <button className="btn btn-primary" onClick={onLogin} style={{ marginTop: 8 }}>
                Sign In
                <span className="btn-arrow">→</span>
            </button>
        </div>
    );
}
