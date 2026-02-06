"use client";

export type UnlockSection = 'bullet_upgrades' | 'missing_wins' | 'job_alignment' | 'export_pdf' | 'evidence_ledger';

export interface UnlockContext {
    section: UnlockSection;
    reportId?: string;
    itemIndex?: number;
    timestamp: number;
}

const STORAGE_KEY = 'riyp_unlock_context';

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
