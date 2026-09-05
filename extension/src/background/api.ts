/**
 * Real API client for RIYP extension.
 * 
 * Calls the actual RIYP backend endpoints.
 */

import type { JobMeta, SavedJob, AuthUser } from './messages';

export class ApiError extends Error {
    constructor(message: string, readonly status: number) {
        super(message);
    }
}

// Base URL for API calls
// Production requests use the canonical host so session cookies and host
// permissions do not depend on an apex-to-www redirect.
// Development: set VITE_WEBAPP_URL to match the active local web app server.
export const API_BASE = import.meta.env.MODE === 'development'
    ? (import.meta.env.VITE_WEBAPP_URL || 'http://localhost:3000').replace(/\/$/, '')
    : 'https://www.recruiterinyourpocket.com';

/**
 * Capture a job description and get quick match score.
 */
export async function captureJob(jd: string, meta: JobMeta): Promise<SavedJob> {
    const response = await fetch(`${API_BASE}/api/extension/capture-jd`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        signal: AbortSignal.timeout(30_000),
        body: JSON.stringify({ jd, meta }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(data.error || 'Could not save this job to your account. Try again.');
    }

    return { ...data.data, syncState: 'synced', ownerUserId: data.userId };
}

/**
 * Get the latest saved jobs for the current user (the API returns up to 20).
 */
export async function getSavedJobs(): Promise<{ jobs: SavedJob[]; userId?: string }> {
    const response = await fetch(`${API_BASE}/api/extension/saved-jobs`, {
        method: 'GET',
        credentials: 'include',
        signal: AbortSignal.timeout(10_000),
    });

    const data = await response.json();

    if (!response.ok || !data.success || !Array.isArray(data.jobs)) {
        throw new ApiError(data.error || 'Could not load your saved jobs. Try Refresh.', response.status);
    }

    return {
        jobs: data.jobs.map((job: SavedJob) => ({ ...job, syncState: 'synced', ownerUserId: data.userId })),
        userId: data.userId,
    };
}

/**
 * Delete a saved job.
 */
export async function deleteJob(jobId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/api/extension/delete-job?id=${encodeURIComponent(jobId)}`, {
        method: 'DELETE',
        credentials: 'include',
        signal: AbortSignal.timeout(15_000),
    });

    const data = await response.json();

    if (!response.ok || !data.success || data.local) {
        throw new Error(data.error || 'Could not remove the saved job. Sign in and try again.');
    }
}

/**
 * Check authentication status.
 */
export async function checkAuth(): Promise<{ authenticated: boolean; user: AuthUser | null; verified: boolean }> {
    try {
        const response = await fetch(`${API_BASE}/api/extension/auth-status`, {
            method: 'GET',
            credentials: 'include',
            signal: AbortSignal.timeout(8_000),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error('Could not check sign-in status');
        }

        return {
            authenticated: data.authenticated ?? false,
            user: data.user ?? null,
            verified: true,
        };
    } catch {
        return { authenticated: false, user: null, verified: false };
    }
}

/**
 * Get the jobs page URL.
 */
export function getJobsUrl(): string {
    return `${API_BASE}/jobs`;
}

/**
 * Get the login URL.
 */
export function getLoginUrl(): string {
    return `${API_BASE}/auth?from=extension&next=/jobs`;
}
