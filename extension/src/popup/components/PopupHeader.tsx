/**
 * PopupHeader Component
 * 
 * Premium brand header with RIYP logo mark and status.
 */

import type { JobSyncStatus } from '../../background/messages';

interface PopupHeaderProps {
    user?: { email: string; firstName?: string } | null;
    authenticated?: boolean;
    syncStatus?: JobSyncStatus | null;
}

export default function PopupHeader({ user, authenticated = false, syncStatus }: PopupHeaderProps) {
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
                        <span className="popup-status-badge">{syncStatus === 'offline' ? 'Offline' : 'Sync on'}</span>
                    </>
                ) : (
                    <span className="popup-status-text">{syncStatus === 'offline' ? 'Offline' : authenticated ? "Checking sync…" : "Local only"}</span>
                )}
            </div>
        </header>
    );
}
