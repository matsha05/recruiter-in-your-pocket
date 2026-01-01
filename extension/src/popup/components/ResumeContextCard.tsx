/**
 * ResumeContextCard Component — Extension Edition
 * 
 * Compact resume context card showing:
 * - Active resume name
 * - Skills count badge
 * - "Active" status indicator
 * - "Change" action that opens webapp
 * 
 * Mirrors the web Jobs section's ResumeContextCard.
 */

import { useState, useEffect } from 'react';
import { API_BASE } from '../../background/api';

interface ResumeProfile {
    hasResume: boolean;
    resumeFilename?: string;
    skillsCount?: number;
    hasEmbedding?: boolean;
}

interface ResumeContextCardProps {
    className?: string;
}

export default function ResumeContextCard({ className }: ResumeContextCardProps) {
    const [profile, setProfile] = useState<ResumeProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    async function fetchProfile() {
        try {
            const res = await fetch(`${API_BASE}/api/user/default-resume`, {
                method: 'GET',
                credentials: 'include',
            });

            if (!res.ok) {
                if (res.status === 401) {
                    setProfile({ hasResume: false });
                    return;
                }
                throw new Error('Failed to fetch');
            }

            const data = await res.json();
            if (data.success) {
                setProfile(data.data);
            } else {
                setProfile({ hasResume: false });
            }
        } catch (error) {
            console.error('[RIYP] Resume fetch error:', error);
            setProfile({ hasResume: false });
        } finally {
            setIsLoading(false);
        }
    }

    function handleChangeResume() {
        chrome.runtime.sendMessage({
            type: 'OPEN_WEBAPP',
            payload: { path: '/jobs' }
        });
    }

    // Loading state
    if (isLoading) {
        return (
            <div className={`resume-context-card resume-context-loading ${className || ''}`}>
                <div className="skeleton" style={{ width: 24, height: 24, borderRadius: '50%' }} />
                <div className="skeleton" style={{ width: 120, height: 12 }} />
            </div>
        );
    }

    // No resume state
    if (!profile?.hasResume) {
        return (
            <div
                className={`resume-context-card resume-context-empty ${className || ''}`}
                onClick={handleChangeResume}
            >
                <div className="resume-context-icon resume-context-icon-empty">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                </div>
                <div className="resume-context-info">
                    <span className="resume-context-title">Upload resume for matching</span>
                    <span className="resume-context-subtitle">Get instant match scores</span>
                </div>
                <span className="resume-context-arrow">→</span>
            </div>
        );
    }

    // Active resume state
    return (
        <div className={`resume-context-card resume-context-active ${className || ''}`}>
            <div className="resume-context-icon resume-context-icon-active">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            </div>
            <div className="resume-context-info">
                <div className="resume-context-header">
                    <span className="resume-context-title">{profile.resumeFilename || 'Resume Active'}</span>
                    <span className="resume-context-badge">Active</span>
                </div>
                <div className="resume-context-meta">
                    <span className="resume-context-skills">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="resume-context-skills-icon">
                            <circle cx="12" cy="12" r="10" />
                            <circle cx="12" cy="12" r="3" />
                        </svg>
                        {profile.skillsCount} skills
                    </span>
                    {profile.hasEmbedding && (
                        <span className="resume-context-semantic">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="resume-context-semantic-icon">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                            AI matching
                        </span>
                    )}
                </div>
            </div>
            <button
                className="resume-context-change"
                onClick={handleChangeResume}
            >
                Change
            </button>
        </div>
    );
}
