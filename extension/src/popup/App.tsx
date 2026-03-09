import { useState, useEffect, useCallback } from 'react';
import type { SavedJob, AuthUser } from '../background/messages';
import PopupHeader from './components/PopupHeader';
import ResumeContextCard from './components/ResumeContextCard';
import RecentJobsList from './components/RecentJobsList';
import EmptyState from './components/EmptyState';
import AuthPrompt from './components/AuthPrompt';
import Onboarding from './components/Onboarding';
import UndoToast from './components/UndoToast';
import { popupContent } from './content';

type PopupState = 'loading' | 'onboarding' | 'unauthenticated' | 'empty' | 'jobs' | 'error';

export default function App() {
    const [state, setState] = useState<PopupState>('loading');
    const [jobs, setJobs] = useState<SavedJob[]>([]);
    const [user, setUser] = useState<AuthUser | null>(null);
    const [authenticated, setAuthenticated] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [deletedJob, setDeletedJob] = useState<SavedJob | null>(null);

    useEffect(() => {
        initialize();
    }, []);

    async function initialize() {
        try {
            // Check onboarding status
            const result = await chrome.storage.local.get('riyp_onboarding_complete');
            if (!result.riyp_onboarding_complete) {
                setState('onboarding');
                return;
            }

            // Check auth status
            const authResponse = await chrome.runtime.sendMessage({ type: 'CHECK_AUTH' });
            const isAuthenticated = Boolean(authResponse.success && authResponse.data?.authenticated);
            if (authResponse.success) {
                setAuthenticated(isAuthenticated);
                if (authResponse.data?.user) {
                    setUser(authResponse.data.user);
                }
            }

            await loadJobs(isAuthenticated);
        } catch (err) {
            console.error('[RIYP] Init error:', err);
            setError('Failed to initialize');
            setState('error');
        }
    }

    async function loadJobs(authenticatedOverride = authenticated) {
        try {
            setState('loading');
            const response = await chrome.runtime.sendMessage({ type: 'GET_JOBS' });

            if (response.success) {
                const savedJobs = response.data as SavedJob[];
                setJobs(savedJobs);
                if (savedJobs.length > 0) {
                    setState('jobs');
                } else if (!authenticatedOverride) {
                    setState('unauthenticated');
                } else {
                    setState('empty');
                }
            } else {
                if (response.error?.includes('Not authenticated') || response.error?.includes('AUTH_REQUIRED')) {
                    setState('unauthenticated');
                } else {
                    throw new Error(response.error || 'Failed to load jobs');
                }
            }
        } catch (err) {
            console.error('[RIYP] Failed to load jobs:', err);
            setError(err instanceof Error ? err.message : 'Failed to load jobs');
            setState('error');
        }
    }

    function handleOpenStudio() {
        const path = state === 'jobs' ? '/jobs' : '/workspace';
        chrome.runtime.sendMessage({ type: 'OPEN_WEBAPP', payload: { path } });
    }

    function handleLogin() {
        chrome.runtime.sendMessage({ type: 'OPEN_WEBAPP', payload: { path: '/auth?from=extension&next=/jobs' } });
    }

    function handleJobClick(job: SavedJob) {
        // Primary action: Open job detail page with Match Insights
        chrome.runtime.sendMessage({
            type: 'OPEN_WEBAPP',
            payload: { path: `/jobs/${job.id}` }
        });
    }

    function handleOpenOriginal(job: SavedJob) {
        // Secondary action: Open original job posting
        chrome.tabs.create({ url: job.url });
    }

    const handleDeleteJob = useCallback(async (job: SavedJob) => {
        // Optimistically remove from UI
        setJobs(prev => prev.filter(j => j.id !== job.id));
        if (!authenticated) {
            setDeletedJob(job);
        }

        // If no jobs left, show empty state
        if (jobs.length <= 1) {
            setState(authenticated ? 'empty' : 'unauthenticated');
        }

        // Delete in background
        try {
            await chrome.runtime.sendMessage({ type: 'DELETE_JOB', payload: { jobId: job.id } });
        } catch (err) {
            console.error('[RIYP] Delete failed:', err);
            // Restore job on failure
            setJobs(prev => [job, ...prev]);
            setDeletedJob(null);
            setState('jobs');
        }
    }, [authenticated, jobs.length]);

    const handleUndo = useCallback(async () => {
        if (!deletedJob) return;

        // Restore to UI
        setJobs(prev => [deletedJob, ...prev].sort((a, b) => b.capturedAt - a.capturedAt));
        setState('jobs');

        // Restore to storage
        const storage = await chrome.storage.local.get('riyp_extension_data');
        const data = storage.riyp_extension_data || { savedJobs: [] };
        data.savedJobs = [deletedJob, ...(data.savedJobs || [])];
        await chrome.storage.local.set({ riyp_extension_data: data });

        setDeletedJob(null);
    }, [deletedJob]);

    const handleUndoDismiss = useCallback(() => {
        setDeletedJob(null);
    }, []);

    async function handleOnboardingComplete() {
        await chrome.storage.local.set({ riyp_onboarding_complete: true });
        await loadJobs();
    }

    function handleRetryLoadJobs() {
        void loadJobs();
    }

    return (
        <div className="popup-container">
            <PopupHeader user={user} authenticated={authenticated} />

            <div className="popup-content">
                {state === 'loading' && <LoadingSkeleton />}

                {state === 'onboarding' && (
                    <Onboarding onComplete={handleOnboardingComplete} />
                )}

                {state === 'unauthenticated' && (
                    <AuthPrompt onLogin={handleLogin} />
                )}

                {state === 'empty' && (
                    <>
                        <ResumeContextCard />
                        <EmptyState />
                    </>
                )}

                {state === 'jobs' && (
                    <>
                        <ResumeContextCard />
                        <RecentJobsList
                            jobs={jobs}
                            onJobClick={handleJobClick}
                            onOpenOriginal={handleOpenOriginal}
                            onDeleteJob={handleDeleteJob}
                        />
                    </>
                )}

                {state === 'error' && (
                    <div className="empty-state">
                        <div className="empty-state-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="empty-icon-svg">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                        </div>
                        <div className="empty-state-title">Something went wrong</div>
                        <div className="empty-state-description">{error}</div>
                        <button className="btn btn-secondary" onClick={handleRetryLoadJobs}>
                            Try Again
                        </button>
                    </div>
                )}
            </div>

            <div className="popup-footer">
                <p className="popup-footer-note">
                    {popupContent.footer[state].title}
                </p>
                <button className="btn btn-primary" onClick={handleOpenStudio}>
                    {popupContent.footer[state].cta}
                    <span className="btn-arrow">→</span>
                </button>
            </div>

            {deletedJob && !authenticated && (
                <UndoToast
                    message={`Removed "${deletedJob.title.slice(0, 30)}..."`}
                    onUndo={handleUndo}
                    onDismiss={handleUndoDismiss}
                />
            )}
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="animate-in">
            <div className="section-header">
                <div className="skeleton" style={{ width: 100, height: 12 }} />
            </div>
            {[1, 2, 3].map((i) => (
                <div key={i} className="job-card" style={{ opacity: 0.6 }}>
                    <div className="skeleton" style={{ width: 44, height: 44, borderRadius: '50%' }} />
                    <div className="job-info">
                        <div className="skeleton" style={{ width: '70%', height: 13, marginBottom: 6 }} />
                        <div className="skeleton" style={{ width: '50%', height: 12 }} />
                    </div>
                </div>
            ))}
        </div>
    );
}
