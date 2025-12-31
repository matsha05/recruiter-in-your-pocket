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
export async function getStorage(): Promise<ExtensionStorage> {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    return result[STORAGE_KEY] ?? DEFAULT_STORAGE;
}

/**
 * Update the extension storage
 */
export async function setStorage(data: Partial<ExtensionStorage>): Promise<void> {
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
export async function addSavedJob(job: SavedJob): Promise<void> {
    const storage = await getStorage();

    // Check if job already exists (by URL)
    const existingIndex = storage.savedJobs.findIndex((j) => j.url === job.url);

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

/**
 * Delete a saved job by ID or URL
 */
export async function deleteSavedJob(jobIdOrUrl: string): Promise<SavedJob | null> {
    const storage = await getStorage();

    const index = storage.savedJobs.findIndex(
        (j) => j.id === jobIdOrUrl || j.url === jobIdOrUrl
    );

    if (index === -1) {
        return null;
    }

    const [deleted] = storage.savedJobs.splice(index, 1);
    await setStorage({ savedJobs: storage.savedJobs });

    return deleted;
}

/**
 * Restore a deleted job (for undo)
 */
export async function restoreSavedJob(job: SavedJob): Promise<void> {
    await addSavedJob(job);
}

/**
 * Get all saved jobs
 */
export async function getSavedJobs(): Promise<SavedJob[]> {
    const storage = await getStorage();
    return storage.savedJobs;
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
