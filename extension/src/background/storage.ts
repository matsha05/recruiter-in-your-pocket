/**
 * Chrome storage utilities with TypeScript types.
 */

import type { ExtensionStorage, SavedJob } from './messages';

const STORAGE_KEY = 'riyp_extension_data';

// Default storage state
const DEFAULT_STORAGE: ExtensionStorage = {
    savedJobs: [],
    lastUpdated: Date.now(),
};

/**
 * Get the current extension storage
 */
async function getStorage(): Promise<ExtensionStorage> {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    return result[STORAGE_KEY] ?? DEFAULT_STORAGE;
}

/**
 * Update the extension storage
 */
async function setStorage(data: Partial<ExtensionStorage>): Promise<void> {
    const current = await getStorage();
    await chrome.storage.local.set({
        [STORAGE_KEY]: {
            ...current,
            ...data,
            lastUpdated: Date.now(),
        },
    });
}

/**
 * Add a new saved job
 */
async function addSavedJob(job: SavedJob): Promise<void> {
    const storage = await getStorage();

    const existingIndex = findSavedJobIndex(storage.savedJobs, job);

    if (existingIndex >= 0) {
        // Update existing
        storage.savedJobs[existingIndex] = job;
    } else {
        // Add new (prepend to list)
        storage.savedJobs.unshift(job);
    }

    // Keep only last 50 jobs
    storage.savedJobs = storage.savedJobs.slice(0, 50);

    await setStorage({ savedJobs: storage.savedJobs });
}

export async function addSavedJobAndUpdateBadge(job: SavedJob): Promise<void> {
    await addSavedJob(job);
    await updateBadge();
}

/**
 * Delete a saved job by ID or URL
 */
export async function deleteSavedJob(jobIdOrUrl: string): Promise<SavedJob | null> {
    const storage = await getStorage();
    const normalizedUrl = normalizeJobUrl(jobIdOrUrl);

    const index = storage.savedJobs.findIndex(
        (job) => job.id === jobIdOrUrl
            || job.externalId === jobIdOrUrl
            || job.url === jobIdOrUrl
            || normalizeJobUrl(job.url) === normalizedUrl
    );

    if (index === -1) {
        return null;
    }

    const [deleted] = storage.savedJobs.splice(index, 1);
    await setStorage({ savedJobs: storage.savedJobs });

    return deleted;
}

/**
 * Get all saved jobs
 */
export async function getSavedJobs(): Promise<SavedJob[]> {
    const storage = await getStorage();
    return storage.savedJobs;
}

/**
 * Check if a job URL was already captured
 */
export async function isJobCaptured(url: string): Promise<{ captured: boolean; job?: SavedJob }> {
    const storage = await getStorage();
    const normalizedUrl = normalizeJobUrl(url);
    const job = storage.savedJobs.find((savedJob) => normalizeJobUrl(savedJob.url) === normalizedUrl);
    return { captured: !!job, job };
}

/**
 * Update badge with unreviewed job count
 */
export async function updateBadge(): Promise<void> {
    const jobs = await getSavedJobs();
    const count = jobs.length;

    if (count > 0) {
        await chrome.action.setBadgeText({ text: String(count) });
        await chrome.action.setBadgeBackgroundColor({ color: '#0D9488' }); // Brand teal
    } else {
        await chrome.action.setBadgeText({ text: '' });
    }
}

export function getSavedJobDedupeKey(job: SavedJob): string {
    const externalJobId = getExternalJobId(job);
    if (job.source && externalJobId) {
        return `${job.source}:external:${externalJobId}`;
    }

    return `url:${normalizeJobUrl(job.url)}`;
}

function normalizeJobUrl(url: string): string {
    try {
        const parsedUrl = new URL(url);
        parsedUrl.hash = '';

        const params = new URLSearchParams(parsedUrl.search);
        for (const key of Array.from(params.keys())) {
            const normalizedKey = key.toLowerCase();
            if (
                normalizedKey.startsWith('utm_')
                || normalizedKey === 'trk'
                || normalizedKey === 'refid'
                || normalizedKey === 'ref'
                || normalizedKey === 'trackingid'
            ) {
                params.delete(key);
            }
        }

        params.sort();
        parsedUrl.search = params.toString();
        parsedUrl.pathname = parsedUrl.pathname.replace(/\/+$/, '');
        return parsedUrl.toString();
    } catch {
        return url.trim();
    }
}

function findSavedJobIndex(savedJobs: SavedJob[], incomingJob: SavedJob): number {
    const incomingKey = getSavedJobDedupeKey(incomingJob);
    return savedJobs.findIndex((savedJob) => getSavedJobDedupeKey(savedJob) === incomingKey);
}

function getExternalJobId(job: SavedJob): string | null {
    if (job.externalId) {
        return job.externalId;
    }

    return isLikelyServerId(job.id) ? null : job.id;
}

function isLikelyServerId(id: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}
