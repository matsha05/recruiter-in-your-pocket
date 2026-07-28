"use client";

export type UnlockSection = 'bullet_upgrades' | 'missing_wins' | 'job_alignment' | 'export_pdf' | 'evidence_ledger';

export interface UnlockContext {
    section: UnlockSection;
    reportId?: string;
    itemIndex?: number;
    timestamp: number;
}

const STORAGE_KEY = 'riyp_unlock_context';
const CHECKOUT_WORKSPACE_KEY = 'riyp_checkout_workspace';

export interface CheckoutWorkspaceState {
    report: unknown;
    resumeText: string;
    jobDescription: string;
    timestamp: number;
}

export function saveUnlockContext(ctx: Omit<UnlockContext, 'timestamp'>) {
    if (typeof window === 'undefined') return;

    const context: UnlockContext = {
        ...ctx,
        timestamp: Date.now()
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(context));
}

export function getUnlockContext(): UnlockContext | null {
    if (typeof window === 'undefined') return null;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    try {
        const context = JSON.parse(stored) as UnlockContext;

        // Context expires after 5 minutes to stay relevant for the checkout flow
        const CONTEXT_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes – tight window for checkout flow
        const isExpired = Date.now() - context.timestamp > CONTEXT_EXPIRY_MS;
        if (isExpired) {
            clearUnlockContext();
            return null;
        }

        return context;
    } catch (e) {
        return null;
    }
}

export function clearUnlockContext() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
}

export function saveCheckoutWorkspaceState(state: Omit<CheckoutWorkspaceState, 'timestamp'>) {
    if (typeof window === 'undefined' || !state.report) return;
    sessionStorage.setItem(CHECKOUT_WORKSPACE_KEY, JSON.stringify({ ...state, timestamp: Date.now() }));
}

export function takeCheckoutWorkspaceState(): CheckoutWorkspaceState | null {
    if (typeof window === 'undefined') return null;
    const stored = sessionStorage.getItem(CHECKOUT_WORKSPACE_KEY);
    if (!stored) return null;
    sessionStorage.removeItem(CHECKOUT_WORKSPACE_KEY);

    try {
        const state = JSON.parse(stored) as CheckoutWorkspaceState;
        if (!state.report || Date.now() - state.timestamp > 45 * 60 * 1000) return null;
        return state;
    } catch {
        return null;
    }
}

export function scheduleCheckoutWorkspaceExpiry() {
    if (typeof window === 'undefined') return;
    const stored = sessionStorage.getItem(CHECKOUT_WORKSPACE_KEY);
    if (!stored) return;

    try {
        const state = JSON.parse(stored) as CheckoutWorkspaceState;
        const remaining = Math.max(0, 45 * 60 * 1000 - (Date.now() - state.timestamp));
        window.setTimeout(() => sessionStorage.removeItem(CHECKOUT_WORKSPACE_KEY), remaining);
    } catch {
        sessionStorage.removeItem(CHECKOUT_WORKSPACE_KEY);
    }
}
