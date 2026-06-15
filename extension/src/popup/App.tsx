import { useReducer, useEffect, useCallback } from 'react';
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

type AppState = {
    view: PopupState;
    jobs: SavedJob[];
    user: AuthUser | null;
    authenticated: boolean;
    error: string | null;
    deletedJob: SavedJob | null;
};

type AppAction =
    | { type: 'patch'; patch: Partial<AppState> }
    | { type: 'jobsLoaded'; jobs: SavedJob[]; authenticated: boolean }
    | { type: 'deleteOptimistic'; job: SavedJob; authenticated: boolean }
    | { type: 'deleteFailed'; job: SavedJob }
    | { type: 'undoDelete'; job: SavedJob };

const initialAppState: AppState = {
    view: 'loading',
    jobs: [],
    user: null,
    authenticated: false,
    error: null,
    deletedJob: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
    switch (action.type) {
        case 'patch':
            return { ...state, ...action.patch };
        case 'jobsLoaded': {
            const view =
                action.jobs.length > 0
                    ? 'jobs'
                    : action.authenticated
                        ? 'empty'
                        : 'unauthenticated';
            return { ...state, jobs: action.jobs, view };
        }
        case 'deleteOptimistic': {
            const jobs = state.jobs.filter((job) => job.id !== action.job.id);
            return {
                ...state,
                jobs,
                deletedJob: action.authenticated ? state.deletedJob : action.job,
                view: jobs.length > 0 ? 'jobs' : action.authenticated ? 'empty' : 'unauthenticated',
            };
        }
        case 'deleteFailed':
            return {
                ...state,
                jobs: [action.job, ...state.jobs],
                deletedJob: null,
                view: 'jobs',
            };
        case 'undoDelete':
            return {
                ...state,
                jobs: [action.job, ...state.jobs].sort((a, b) => b.capturedAt - a.capturedAt),
                deletedJob: null,
                view: 'jobs',
            };
        default:
            return state;
    }
}

export default function App() {
    const [{ view, jobs, user, authenticated, error, deletedJob }, dispatch] = useReducer(appReducer, initialAppState);

    useEffect(() => {
        initialize();
    }, []);

    async function initialize() {
        try {
            // Check onboarding status
            const result = await chrome.storage.local.get('riyp_onboarding_complete');
            if (!result.riyp_onboarding_complete) {
                dispatch({ type: 'patch', patch: { view: 'onboarding' } });
                return;
            }

            // Check auth status
            const authResponse = await chrome.runtime.sendMessage({ type: 'CHECK_AUTH' });
            const isAuthenticated = Boolean(authResponse.success && authResponse.data?.authenticated);
            if (authResponse.success) {
                dispatch({
                    type: 'patch',
                    patch: {
                        authenticated: isAuthenticated,
                        user: authResponse.data?.user ?? null,
                    },
                });
            }

            await loadJobs(isAuthenticated);
        } catch (err) {
            console.error('[RIYP] Init error:', err);
            dispatch({ type: 'patch', patch: { error: 'Failed to initialize', view: 'error' } });
        }
    }

    async function loadJobs(authenticatedOverride = authenticated) {
        try {
            dispatch({ type: 'patch', patch: { view: 'loading' } });
            const response = await chrome.runtime.sendMessage({ type: 'GET_JOBS' });

            if (response.success) {
                const savedJobs = response.data as SavedJob[];
                dispatch({ type: 'jobsLoaded', jobs: savedJobs, authenticated: authenticatedOverride });
            } else {
                if (response.error?.includes('Not authenticated') || response.error?.includes('AUTH_REQUIRED')) {
                    dispatch({ type: 'patch', patch: { view: 'unauthenticated' } });
                } else {
                    throw new Error(response.error || 'Failed to load jobs');
                }
            }
        } catch (err) {
            console.error('[RIYP] Failed to load jobs:', err);
            dispatch({
                type: 'patch',
                patch: {
                    error: err instanceof Error ? err.message : 'Failed to load jobs',
                    view: 'error',
                },
            });
        }
    }

    function handleOpenStudio() {
        const hasSyncedJobs = jobs.some(isSyncedJob);
        const path = view === 'jobs' && hasSyncedJobs ? '/jobs' : '/workspace';
        chrome.runtime.sendMessage({ type: 'OPEN_WEBAPP', payload: { path } });
    }

    function handleLogin() {
        chrome.runtime.sendMessage({ type: 'OPEN_WEBAPP', payload: { path: '/auth?from=extension&next=/jobs' } });
    }

    function handleJobClick(job: SavedJob) {
        if (!isSyncedJob(job)) {
            chrome.runtime.sendMessage({
                type: 'OPEN_WEBAPP',
                payload: { path: buildLocalWorkspacePath(job) }
            });
            return;
        }

        // Primary action: Open synced job detail page with Match Insights
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
        dispatch({ type: 'deleteOptimistic', job, authenticated });

        // Delete in background
        try {
            await chrome.runtime.sendMessage({ type: 'DELETE_JOB', payload: { jobId: job.id } });
        } catch (err) {
            console.error('[RIYP] Delete failed:', err);
            dispatch({ type: 'deleteFailed', job });
        }
    }, [authenticated]);

    const handleUndo = useCallback(async () => {
        if (!deletedJob) return;

        dispatch({ type: 'undoDelete', job: deletedJob });

        // Restore to storage
        const storage = await chrome.storage.local.get('riyp_extension_data');
        const data = storage.riyp_extension_data || { savedJobs: [] };
        data.savedJobs = [deletedJob, ...(data.savedJobs || [])];
        await chrome.storage.local.set({ riyp_extension_data: data });

    }, [deletedJob]);

    const handleUndoDismiss = useCallback(() => {
        dispatch({ type: 'patch', patch: { deletedJob: null } });
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
                {view === 'loading' && <LoadingSkeleton />}

                {view === 'onboarding' && (
                    <Onboarding onComplete={handleOnboardingComplete} />
                )}

                {view === 'unauthenticated' && (
                    <AuthPrompt onLogin={handleLogin} />
                )}

                {view === 'empty' && (
                    <>
                        <ResumeContextCard />
                        <EmptyState />
                    </>
                )}

                {view === 'jobs' && (
                    <>
                        <ResumeContextCard />
                        {jobs.some((job) => !isSyncedJob(job)) && (
                            <div className="empty-state-description" style={{ marginBottom: 12, textAlign: 'left' }}>
                                Some jobs are saved on this browser only. Open the studio for a fresh report, or sign in and capture again to sync.
                            </div>
                        )}
                        <RecentJobsList
                            jobs={jobs}
                            onJobClick={handleJobClick}
                            onOpenOriginal={handleOpenOriginal}
                            onDeleteJob={handleDeleteJob}
                        />
                    </>
                )}

                {view === 'error' && (
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
                        <button type="button" className="btn btn-secondary" onClick={handleRetryLoadJobs}>
                            Try Again
                        </button>
                    </div>
                )}
            </div>

            <div className="popup-footer">
                <p className="popup-footer-note">
                    {popupContent.footer[view].title}
                </p>
                <button type="button" className="btn btn-primary" onClick={handleOpenStudio}>
                    {popupContent.footer[view].cta}
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

function isSyncedJob(job: SavedJob): boolean {
    return Boolean(job.externalId) || isLikelyServerId(job.id);
}

function buildLocalWorkspacePath(job: SavedJob): string {
    const params = new URLSearchParams({
        source: 'extension-local',
        title: job.title,
        company: job.company,
        url: job.url,
    });

    if (job.location) {
        params.set('location', job.location);
    }

    const jobDescription = job.jobDescription || job.jdPreview;
    if (jobDescription) {
        params.set('jd', jobDescription.slice(0, 8000));
    }

    return `/workspace?${params.toString()}`;
}

function isLikelyServerId(id: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
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
