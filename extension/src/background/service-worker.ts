/**
 * Background Service Worker
 * 
 * Event-driven background script that:
 * - Handles message passing between popup and content scripts
 * - Manages Chrome storage for saved jobs
 * - Updates extension badge
 * - Calls real RIYP API endpoints
 */

import type { ExtensionMessage, ExtensionResponse, SavedJob } from './messages';
import {
    addSavedJob,
    getSavedJobs as getLocalJobs,
    deleteSavedJob,
    updateBadge,
    isJobCaptured
} from './storage';
import {
    captureJob,
    getSavedJobs,
    deleteJob,
    checkAuth,
    getLoginUrl,
    getJobsUrl
} from './api';

// Message handler
chrome.runtime.onMessage.addListener(
    (message: ExtensionMessage, _sender, sendResponse: (response: ExtensionResponse) => void) => {
        handleMessage(message)
            .then(sendResponse)
            .catch((error) => {
                console.error('[RIYP] Message handler error:', error);
                sendResponse({ success: false, error: error.message });
            });

        // Return true to indicate async response
        return true;
    }
);

async function handleMessage(message: ExtensionMessage): Promise<ExtensionResponse> {
    switch (message.type) {
        case 'CAPTURE_JD': {
            const { jd, meta } = message.payload;

            try {
                // Try real API first
                const savedJob = await captureJob(jd, meta);

                // Also save locally for offline access
                await addSavedJob(savedJob);
                await updateBadge();

                return { success: true, data: savedJob };
            } catch (error) {
                // If API fails (not authenticated), save locally with null score
                console.warn('[RIYP] API capture failed, saving locally:', error);

                const localJob: SavedJob = {
                    ...meta,
                    score: null,
                    jdPreview: jd.slice(0, 200),
                };

                await addSavedJob(localJob);
                await updateBadge();

                return { success: true, data: localJob };
            }
        }

        case 'GET_JOBS': {
            try {
                // Try to get from API first
                const apiJobs = await getSavedJobs();

                // Merge with local jobs
                const localJobs = await getLocalJobs();
                const mergedJobs = mergeJobs(apiJobs, localJobs);

                return { success: true, data: mergedJobs };
            } catch {
                // Fallback to local storage
                const localJobs = await getLocalJobs();
                return { success: true, data: localJobs };
            }
        }

        case 'DELETE_JOB': {
            const { jobId } = message.payload;

            try {
                // Delete from API
                await deleteJob(jobId);
            } catch (error) {
                console.warn('[RIYP] API delete failed (maybe local-only job):', error);
            }

            // Always delete from local storage
            await deleteSavedJob(jobId);
            await updateBadge();

            return { success: true, deleted: jobId };
        }

        case 'CHECK_AUTH': {
            const result = await checkAuth();
            return { success: true, data: result };
        }

        case 'GET_QUICK_MATCH': {
            const jobs = await getLocalJobs();
            const job = jobs.find((j) => j.id === message.payload.jobId);

            if (!job) {
                return { success: false, error: 'Job not found' };
            }

            return { success: true, data: { score: job.score ?? 0 } };
        }

        case 'CHECK_JOB_STATUS': {
            const { url } = message.payload;
            const result = await isJobCaptured(url);
            return {
                success: true,
                data: {
                    captured: result.captured,
                    score: result.job?.score ?? null,
                    jobId: result.job?.id
                }
            };
        }

        case 'OPEN_WEBAPP': {
            const path = message.payload?.path ?? '/jobs';
            const baseUrl = 'http://localhost:3000'; // TODO: Switch to production
            await chrome.tabs.create({
                url: `${baseUrl}${path}`,
            });
            return { success: true };
        }

        default:
            return { success: false, error: 'Unknown message type' };
    }
}

/**
 * Merge API jobs with local jobs, preferring API data.
 */
function mergeJobs(apiJobs: SavedJob[], localJobs: SavedJob[]): SavedJob[] {
    const jobMap = new Map<string, SavedJob>();

    // Add local jobs first
    for (const job of localJobs) {
        jobMap.set(job.url, job);
    }

    // Overwrite with API jobs (they have scores)
    for (const job of apiJobs) {
        jobMap.set(job.url, job);
    }

    // Sort by captured time, most recent first
    return Array.from(jobMap.values())
        .sort((a, b) => b.capturedAt - a.capturedAt);
}

// Initialize badge on install
chrome.runtime.onInstalled.addListener(async () => {
    console.log('[RIYP] Extension installed');
    await updateBadge();

    // Check auth status on install
    const { authenticated } = await checkAuth();
    console.log('[RIYP] Auth status:', authenticated);
});

// Update badge when storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.riyp_extension_data) {
        updateBadge();
    }
});

// Export for use in popup
export { checkAuth, getLoginUrl, getJobsUrl };

console.log('[RIYP] Service worker initialized');
