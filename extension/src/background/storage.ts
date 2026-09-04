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

    // A local capture ID can also be a cached server job's external ID.
    // Prefer the selected record's exact ID before legacy URL/external-ID lookup.
    const exactIndex = storage.savedJobs.findIndex((job) => job.id === jobIdOrUrl);
    const index = exactIndex >= 0 ? exactIndex : storage.savedJobs.findIndex(
        (job) => isVisibleJob(job, storage.activeUserId) && (
            job.externalId === jobIdOrUrl
            || job.url === jobIdOrUrl
            || normalizeJobUrl(job.url) === normalizedUrl
        )
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
    return storage.savedJobs.filter((job) => isVisibleJob(job, storage.activeUserId));
}

/** Remember confirmed sign-in changes, without treating a network failure as sign-out. */
export async function setActiveUser(userId: string | null): Promise<void> {
    await setStorage({ activeUserId: userId });
}

/**
 * The server list is a recent, account-scoped cache, not a complete job inventory.
 * Replace only that disposable snapshot; never evict browser-only captures.
 * Older synced jobs remain available on the website.
 */
export async function reconcileSavedJobs(apiJobs: SavedJob[], userId?: string): Promise<SavedJob[]> {
    const storage = await getStorage();
    const snapshot = apiJobs.map((job) => ({ ...job, syncState: 'synced' as const, ownerUserId: userId }));
    const syncedKeys = new Set(snapshot.map(getSavedJobDedupeKey));
    const localJobs = storage.savedJobs.filter((job) =>
        !isSyncedJob(job) && !syncedKeys.has(getSavedJobDedupeKey(job))
    );
    const savedJobs = [...snapshot, ...localJobs].sort((a, b) => b.capturedAt - a.capturedAt);
    await setStorage({ savedJobs, ...(userId ? { activeUserId: userId } : {}) });
    return savedJobs;
}

/** Legacy records predate explicit sync metadata. Server IDs were UUIDs. */
export function isSyncedJob(job: SavedJob): boolean {
    if (job.syncState) return job.syncState === 'synced';
    return Boolean(job.externalId) || isLikelyServerId(job.id);
}

function isVisibleJob(job: SavedJob, activeUserId: string | null | undefined): boolean {
    if (!isSyncedJob(job)) return true;
    // Records with unknown ownership are refreshed from the API before display.
    return Boolean(activeUserId && job.ownerUserId === activeUserId);
}

/**
 * Check if a job URL was already captured
 */
export async function isJobCaptured(url: string): Promise<{ captured: boolean; job?: SavedJob }> {
    const jobs = await getSavedJobs();
    const normalizedUrl = normalizeJobUrl(url);
    const job = jobs.find((savedJob) => normalizeJobUrl(savedJob.url) === normalizedUrl);
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
    return savedJobs.findIndex((savedJob) =>
        getSavedJobDedupeKey(savedJob) === incomingKey
        && isSyncedJob(savedJob) === isSyncedJob(incomingJob)
        && savedJob.ownerUserId === incomingJob.ownerUserId
    );
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
