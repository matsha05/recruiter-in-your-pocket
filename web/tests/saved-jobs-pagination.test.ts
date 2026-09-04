import assert from 'node:assert/strict';
import Module from 'node:module';
import path from 'node:path';
import { NextRequest } from 'next/server';
import { encodeSavedJobsCursor, parseSavedJobsCursor } from '../lib/extension/savedJobsPagination';

type RuntimeModule = typeof Module & {
    _load: (request: string, parent: NodeModule | null, isMain: boolean) => unknown;
};
type Row = {
    id: string; user_id: string; captured_at: string; title: string;
    company: string; url: string; external_id: string; status: string;
};

const accountA = 'account-a';
const accountB = 'account-b';
const id = (number: number) => `00000000-0000-4000-8000-${String(number).padStart(12, '0')}`;
const token = (payload: unknown) => Buffer.from(JSON.stringify(payload)).toString('base64url');
const timestamp = '2026-09-04T10:20:30.123456+00:00';

async function run() {
    const runtimeModule = Module as RuntimeModule;
    const originalLoad = runtimeModule._load;
    let user: { id: string } | null = { id: accountA };
    let queryCount = 0;
    let failQuery = false;
    let rows: Row[] = [];
    const limits: number[] = [];
    const supabase = {
        auth: { getUser: async () => ({ data: { user }, error: null }) },
        from(table: string) {
            assert.equal(table, 'saved_jobs');
            queryCount += 1;
            const filters: Array<(row: Row) => boolean> = [];
            const orders: Array<{ key: keyof Row; ascending: boolean }> = [];
            let limit = Infinity;
            const query: any = {
                select: () => query,
                eq(key: keyof Row, value: string) { filters.push((row) => row[key] === value); return query; },
                order(key: keyof Row, options: { ascending: boolean }) { orders.push({ key, ...options }); return query; },
                limit(value: number) { limit = value; limits.push(value); return query; },
                or(expression: string) {
                    // Model the database's two keyset comparisons, independently of
                    // the production cursor helper; reject unexpected query syntax.
                    const parsed = /^captured_at\.lt\.([^,]+),and\(captured_at\.eq\.([^,]+),id\.lt\.([0-9a-f-]+)\)$/.exec(expression);
                    assert.ok(parsed, `Unexpected pagination filter: ${expression}`);
                    assert.equal(parsed[1], parsed[2]);
                    filters.push((row) => row.captured_at < parsed[1] || (row.captured_at === parsed[1] && row.id < parsed[3]));
                    return query;
                },
                then(resolve: (value: unknown) => unknown, reject: (error: unknown) => unknown) {
                    return Promise.resolve().then(() => {
                        if (failQuery) return { data: null, error: { message: 'Database unavailable' } };
                        const data = rows.filter((row) => filters.every((filter) => filter(row)));
                        data.sort((a, b) => {
                            for (const order of orders) {
                                const comparison = a[order.key].localeCompare(b[order.key]);
                                if (comparison) return order.ascending ? comparison : -comparison;
                            }
                            return 0;
                        });
                        return { data: data.slice(0, limit), error: null };
                    }).then(resolve, reject);
                },
            };
            return query;
        },
    };

    runtimeModule._load = function loadMocks(request, parent, isMain) {
        if (request === '@/lib/supabase/serverClient') return { createSupabaseServerClient: async () => supabase };
        if (request === '@/lib/launch/flags') return { isLaunchFlagEnabled: () => true };
        if (request === '@/lib/extension/cors') return { buildExtensionCorsHeaders: () => ({}) };
        if (request.startsWith('@/')) return originalLoad(path.join(process.cwd(), request.slice(2)), parent, isMain);
        return originalLoad(request, parent, isMain);
    };

    const fixture = (number: number, overrides: Partial<Row> = {}): Row => ({
        id: id(number), user_id: accountA, captured_at: timestamp,
        title: `Job ${number}`, company: 'Example', url: `https://example.com/jobs/${number}`,
        external_id: String(number), status: 'interested', ...overrides,
    });

    try {
        const get = require('../app/api/extension/saved-jobs/route').GET as (req: NextRequest) => Promise<Response>;
        const request = (cursor?: string) => new NextRequest(`http://localhost/api/extension/saved-jobs${cursor === undefined ? '' : `?cursor=${encodeURIComponent(cursor)}`}`);

        rows = Array.from({ length: 45 }, (_, index) => fixture(index + 1, {
            captured_at: index < 20 ? '2026-09-03T10:20:30.123456+00:00' : timestamp,
        }));
        rows.push(fixture(999, { user_id: accountB, captured_at: '2026-09-05T10:20:30.123456+00:00' }));
        const firstResponse = await get(request());
        assert.equal(firstResponse.status, 200);
        const first = await firstResponse.json();
        assert.equal(first.jobs.length, 20, 'default extension snapshot stays bounded at 20');
        assert.equal(first.userId, accountA);
        assert.equal(first.jobs[0].status, 'interested', 'website status filters receive saved status');
        assert.equal(first.jobs[0].id, id(45), 'ID breaks equal timestamp ties');
        assert.equal(first.jobs.some((job: { id: string }) => job.id === id(999)), false, 'other accounts never enter the page');
        assert.deepEqual(parseSavedJobsCursor(first.nextCursor), { ok: true, cursor: { capturedAt: timestamp, id: id(26) } }, 'cursor preserves raw microseconds');

        // Deleting already-seen rows must not shift the boundary and skip older jobs.
        rows = rows.filter((row) => ![id(45), id(44), id(43)].includes(row.id));
        const second = await (await get(request(first.nextCursor))).json();
        assert.equal(second.jobs.length, 20);
        assert.equal(second.jobs[0].id, id(25));
        const third = await (await get(request(second.nextCursor))).json();
        assert.equal(third.jobs.length, 5);
        assert.equal(third.nextCursor, null);
        const allIds = [...first.jobs, ...second.jobs, ...third.jobs].map((job: { id: string }) => job.id);
        assert.equal(new Set(allIds).size, 45, 'every original account job appears once across pages');
        assert.deepEqual(allIds, Array.from({ length: 45 }, (_, index) => id(45 - index)));
        assert.ok(limits.every((value) => value === 21), 'database requests stay bounded with one lookahead row');

        for (const count of [0, 1, 20]) {
            rows = Array.from({ length: count }, (_, index) => fixture(index + 1));
            const page = await (await get(request())).json();
            assert.equal(page.jobs.length, count);
            assert.equal(page.nextCursor, null, `${count} jobs should not produce an empty follow-up page`);
        }

        const invalid = [
            '', 'not-a-cursor', 'a'.repeat(513), '%%%=', token(null), token([]),
            token({ capturedAt: 'not-a-date', id: id(1) }),
            token({ capturedAt: '2026-02-31T10:20:30Z', id: id(1) }),
            token({ capturedAt: timestamp, id: 'id),user_id.neq.anything' }),
            token({ capturedAt: `${timestamp},user_id.neq.anything`, id: id(1) }),
            token({ capturedAt: timestamp, id: 1 }),
        ];
        const beforeInvalid = queryCount;
        for (const cursor of invalid) {
            const result = await get(request(cursor));
            assert.equal(result.status, 400, `invalid cursor must fail: ${cursor}`);
            assert.equal((await result.json()).errorCode, 'INVALID_CURSOR');
        }
        const valid = encodeSavedJobsCursor({ captured_at: timestamp, id: id(20) });
        assert.equal(parseSavedJobsCursor(token({ capturedAt: timestamp, id: '01990000-0000-7000-8000-000000000001' })).ok, true, 'valid UUID versions remain usable as cursors');
        const duplicate = new NextRequest(`http://localhost/api/extension/saved-jobs?cursor=${valid}&cursor=${valid}`);
        assert.equal((await get(duplicate)).status, 400);
        assert.equal(queryCount, beforeInvalid, 'invalid cursors never reach the database query');

        user = null;
        const beforeUnauthenticated = queryCount;
        assert.equal((await get(request(valid))).status, 401);
        assert.equal(queryCount, beforeUnauthenticated, 'pagination cannot bypass authentication');

        user = { id: accountA };
        failQuery = true;
        const failed = await get(request(valid));
        assert.equal(failed.status, 500);
        assert.equal((await failed.json()).success, false, 'later-page database failure is not a successful empty page');

        console.log('Saved-jobs pagination passed: bounded pages, timestamp ties, microseconds, deletion stability, account scope, invalid cursor rejection, and API failure.');
    } finally {
        runtimeModule._load = originalLoad;
    }
}

run().catch((error) => { console.error(error); process.exitCode = 1; });
