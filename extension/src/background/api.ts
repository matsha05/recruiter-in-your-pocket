/**
 * Real API client for RIYP extension.
 * 
 * Calls the actual RIYP backend endpoints.
 */

import type { JobMeta, SavedJob, AuthUser } from './messages';

// Base URL for API calls
// Production: https://recruiterinyourpocket.com
// Development: Set VITE_DEV_MODE=true in .env to use localhost
// Base URL for API calls
// Production: https://recruiterinyourpocket.com
// Development: Set VITE_DEV_MODE=true in .env to use localhost
export const API_BASE = import.meta.env.VITE_DEV_MODE === 'true'
    ? 'http://localhost:3000'
    : 'https://recruiterinyourpocket.com';

/**
 * Capture a job description and get quick match score.
 */
export async function captureJob(jd: string, meta: JobMeta): Promise<SavedJob> {
    const response = await fetch(`${API_BASE}/api/extension/capture-jd`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ jd, meta }),
    });

    const data = await response.json();

    if (!data.success) {
        throw new Error(data.error || 'Failed to capture job');
    }

    return data.data;
}

/**
 * Get all saved jobs for the current user.
 */
export async function getSavedJobs(): Promise<SavedJob[]> {
    const response = await fetch(`${API_BASE}/api/extension/saved-jobs`, {
        method: 'GET',
        credentials: 'include',
    });

    const data = await response.json();

    if (!data.success) {
        throw new Error(data.error || 'Failed to fetch jobs');
    }

    return data.data;
}

/**
 * Delete a saved job.
 */
export async function deleteJob(jobId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/api/extension/delete-job?id=${encodeURIComponent(jobId)}`, {
        method: 'DELETE',
        credentials: 'include',
    });

    const data = await response.json();

    if (!data.success) {
        throw new Error(data.error || 'Failed to delete job');
    }
}

/**
 * Check authentication status.
 */
export async function checkAuth(): Promise<{ authenticated: boolean; user: AuthUser | null }> {
    try {
        const response = await fetch(`${API_BASE}/api/extension/auth-status`, {
            method: 'GET',
            credentials: 'include',
        });

        const data = await response.json();

        return {
            authenticated: data.authenticated ?? false,
            user: data.user ?? null,
        };
    } catch {
        return { authenticated: false, user: null };
    }
}

/**
 * Get the full analysis URL for a job.
 */
export function getFullAnalysisUrl(jobId: string): string {
    return `${API_BASE}/jobs/${jobId}`;
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
    return `${API_BASE}/login?from=extension`;
}

/**
 * Get the Google OAuth URL.
 */
export function getGoogleAuthUrl(): string {
    return `${API_BASE}/auth/google?from=extension`;
}
