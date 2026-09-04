export const SAVED_JOBS_PAGE_SIZE = 20;

export type SavedJobsCursor = { capturedAt: string; id: string };

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const timestampPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|\+00:00)$/;

/** Validate both fields before interpolating them into a PostgREST filter. */
export function parseSavedJobsCursor(value: string | null):
    { ok: true; cursor: SavedJobsCursor | null } | { ok: false } {
    if (value === null) return { ok: true, cursor: null };
    if (!value || value.length > 512 || !/^[A-Za-z0-9_-]+$/.test(value)) return { ok: false };
    try {
        const decoded: unknown = JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));
        if (!decoded || typeof decoded !== 'object') return { ok: false };
        const { capturedAt, id } = decoded as Record<string, unknown>;
        if (typeof id !== 'string' || !uuidPattern.test(id)) return { ok: false };
        if (typeof capturedAt !== 'string' || !timestampPattern.test(capturedAt)) return { ok: false };
        const timestamp = new Date(capturedAt);
        if (!Number.isFinite(timestamp.getTime()) || timestamp.toISOString().slice(0, 19) !== capturedAt.slice(0, 19)) {
            return { ok: false };
        }
        // Preserve PostgreSQL microseconds; rounding to milliseconds can skip tied rows.
        return { ok: true, cursor: { capturedAt, id } };
    } catch {
        return { ok: false };
    }
}

export function encodeSavedJobsCursor(row: { captured_at: string; id: string }): string {
    return Buffer.from(JSON.stringify({ capturedAt: row.captured_at, id: row.id })).toString('base64url');
}

export function savedJobsCursorFilter(cursor: SavedJobsCursor): string {
    return `captured_at.lt.${cursor.capturedAt},and(captured_at.eq.${cursor.capturedAt},id.lt.${cursor.id})`;
}
