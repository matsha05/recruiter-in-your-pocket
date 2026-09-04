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
    addSavedJobAndUpdateBadge,
    getSavedJobs as getLocalJobs,
    deleteSavedJob,
    updateBadge,
    isJobCaptured,
    isSyncedJob,
    reconcileSavedJobs,
    setActiveUser
} from './storage';
import {
    ApiError,
    captureJob,
    getSavedJobs,
    deleteJob,
    checkAuth,
    getLoginUrl,
    getJobsUrl
} from './api';

// Keep fetch/reconcile and read/modify/write operations in message order. A slow
// older snapshot must not overwrite a newer deletion or account change.
let savedJobsQueue: Promise<void> = Promise.resolve();
const statefulMessages = new Set(['CAPTURE_JD', 'GET_JOBS', 'DELETE_JOB', 'RESTORE_LOCAL_JOB', 'CHECK_AUTH']);

// Message handler
chrome.runtime.onMessage.addListener(
    (message: ExtensionMessage, _sender, sendResponse: (response: ExtensionResponse) => void) => {
        const result = statefulMessages.has(message.type)
            ? savedJobsQueue.then(() => handleMessage(message))
            : handleMessage(message);
        if (statefulMessages.has(message.type)) {
            savedJobsQueue = result.then(() => {}, () => {});
        }
        result
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

                if (savedJob.ownerUserId) await setActiveUser(savedJob.ownerUserId);

                // Also save locally for offline access
                await addSavedJobAndUpdateBadge(savedJob);

                return { success: true, data: savedJob };
            } catch (error) {
                // If API fails (not authenticated), save locally with null score
                console.warn('[RIYP] API capture failed, saving locally:', error);

                const localJob: SavedJob = {
                    ...meta,
                    syncState: 'local',
                    externalId: null,
                    score: null,
                    jdPreview: jd.slice(0, 200),
                    jobDescription: jd,
                };

                await addSavedJobAndUpdateBadge(localJob);

                return { success: true, data: localJob };
            }
        }

        case 'GET_JOBS': {
            const auth = await refreshAuth();
            if (auth.verified && !auth.authenticated) {
                return { success: true, data: await getLocalJobs(), syncStatus: 'signed-out' };
            }
            try {
                const { jobs, userId } = await getSavedJobs();
                const savedJobs = await reconcileSavedJobs(jobs, userId);
                await updateBadge();
                return { success: true, data: savedJobs, syncStatus: 'synced' };
            } catch (error) {
                if (error instanceof ApiError && error.status === 401) {
                    await setActiveUser(null);
                    await updateBadge();
                }
                // Keep the last confirmed snapshot on network/API failure.
                return { success: true, data: await getLocalJobs(), syncStatus: error instanceof ApiError && error.status === 401 ? 'signed-out' : 'offline' };
            }
        }

        case 'DELETE_JOB': {
            const { jobId } = message.payload;
            const jobs = await getLocalJobs();
            const job = jobs.find((savedJob) => savedJob.id === jobId);

            if (!job) return { success: false, error: 'Saved job not found. Reopen the extension and try again.' };

            if (isSyncedJob(job)) {
                const auth = await refreshAuth();
                if (!auth.authenticated || !job.ownerUserId || auth.user?.id !== job.ownerUserId) {
                    return { success: false, error: 'Sign in to the account that saved this job, then try again.' };
                }
                // Do not remove the cache or claim success until the server confirms deletion.
                await deleteJob(jobId);
            }

            await deleteSavedJob(jobId);
            await updateBadge();

            return { success: true, deleted: jobId };
        }

        case 'RESTORE_LOCAL_JOB': {
            const { job } = message.payload;
            if (isSyncedJob(job)) return { success: false, error: 'Only browser-only jobs can be restored here.' };
            await addSavedJobAndUpdateBadge({ ...job, syncState: 'local' });
            return { success: true };
        }

        case 'CHECK_AUTH': {
            const result = await refreshAuth();
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
            const baseUrl = getJobsUrl().replace('/jobs', ''); // Get base from api.ts
            await chrome.tabs.create({
                url: `${baseUrl}${path}`,
            });
            return { success: true };
        }

        default:
            return { success: false, error: 'Unknown message type' };
    }
}

async function refreshAuth() {
    const result = await checkAuth();
    if (result.verified) {
        await setActiveUser(result.authenticated ? result.user?.id ?? null : null);
        await updateBadge();
    }
    return result;
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
