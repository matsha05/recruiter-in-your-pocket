/**
 * Type-safe message definitions for Chrome extension communication.
 * 
 * Messages flow between:
 * - Popup ↔ Background (Service Worker)
 * - Content Script ↔ Background (Service Worker)
 */

// Job metadata extracted from LinkedIn/Indeed
export interface JobMeta {
    id: string;
    title: string;
    company: string;
    location?: string;
    url: string;
    source?: 'linkedin' | 'indeed';
    capturedAt: number;
}

// Saved job with match score
export interface SavedJob extends JobMeta {
    score: number | null;
    jdPreview: string; // First 200 chars
}

// User auth info
export interface AuthUser {
    id: string;
    email: string;
    firstName?: string;
}

// Message types for communication
export type ExtensionMessage =
    | { type: 'CAPTURE_JD'; payload: { jd: string; meta: JobMeta } }
    | { type: 'GET_JOBS' }
    | { type: 'DELETE_JOB'; payload: { jobId: string } }
    | { type: 'GET_QUICK_MATCH'; payload: { jobId: string } }
    | { type: 'GET_CURRENT_TAB_JOB' }
    | { type: 'JD_DETECTED'; payload: JobMeta }
    | { type: 'CHECK_AUTH' }
    | { type: 'OPEN_WEBAPP'; payload?: { path?: string } };

// Response types
export type ExtensionResponse =
    | { success: true; data: SavedJob[] }
    | { success: true; data: SavedJob }
    | { success: true; data: { score: number } }
    | { success: true; data: { authenticated: boolean; user: AuthUser | null } }
    | { success: true; deleted: string }
    | { success: true }
    | { success: false; error: string };

// Storage schema
export interface ExtensionStorage {
    savedJobs: SavedJob[];
    cachedResumeHash?: string;
    lastUpdated: number;
    onboardingComplete?: boolean;
}
