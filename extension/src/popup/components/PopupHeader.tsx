/**
 * PopupHeader Component
 * 
 * Premium brand header with RIYP logo mark and status.
 */

interface PopupHeaderProps {
    user?: { email: string; firstName?: string } | null;
}

export default function PopupHeader({ user }: PopupHeaderProps) {
    return (
        <header className="popup-header">
            <div className="popup-logo">
                <div className="popup-logo-mark">R</div>
                <span className="popup-logo-text">Recruiter in Your Pocket</span>
            </div>
            <div className="popup-status">
                {user ? (
                    <>
                        <span className="popup-status-dot" />
                        <span>{user.firstName || user.email.split('@')[0]}</span>
                    </>
                ) : (
                    <span className="popup-status-text">Not signed in</span>
                )}
            </div>
        </header>
    );
}
