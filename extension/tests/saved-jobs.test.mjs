import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import ts from 'typescript';

const backgroundDir = fileURLToPath(new URL('../src/background/', import.meta.url));
const compiled = new Map();
const accountA = 'account-a';
const accountB = 'account-b';

function job(id, overrides = {}) {
    return {
        id, title: `Job ${id}`, company: 'Example', source: 'linkedin',
        url: `https://www.linkedin.com/jobs/view/${id}`, capturedAt: 100,
        score: null, jdPreview: 'Job description', syncState: 'local', ...overrides,
    };
}

function syncedJob(id = 'synced', overrides = {}) {
    return job(id, { syncState: 'synced', ownerUserId: accountA, externalId: `external-${id}`, ...overrides });
}

function response(data, status = 200) {
    return { ok: status >= 200 && status < 300, status, json: async () => data };
}

function harness(savedJobs, options = {}, requestTimeoutMs) {
    let stored = { savedJobs: structuredClone(savedJobs), activeUserId: accountA, lastUpdated: 1 };
    let onMessage;
    const requests = [];
    const handlers = {
        '/api/extension/auth-status': () => response({ success: true, authenticated: true, user: { id: accountA } }),
        '/api/extension/saved-jobs': () => response({ success: true, userId: accountA, jobs: [] }),
        '/api/extension/delete-job': () => response({ success: true }),
        ...options,
    };
    const context = vm.createContext({
        URL, URLSearchParams,
        AbortSignal: requestTimeoutMs === undefined ? AbortSignal : {
            timeout() {
                const controller = new AbortController();
                setTimeout(() => controller.abort(new Error('Request timed out')), requestTimeoutMs);
                return controller.signal;
            },
        },
        console: { log() {}, warn() {}, error() {} },
        fetch: async (url, init) => {
            requests.push({ url, method: init?.method });
            const handler = handlers[new URL(url).pathname];
            assert.ok(handler, `Unexpected fetch: ${url}`);
            return handler(url, init);
        },
        chrome: {
            runtime: { onMessage: { addListener(listener) { onMessage = listener; } }, onInstalled: { addListener() {} } },
            storage: {
                local: {
                    get: async () => ({ riyp_extension_data: structuredClone(stored) }),
                    set: async (value) => { stored = structuredClone(value.riyp_extension_data); },
                },
                onChanged: { addListener() {} },
            },
            action: { setBadgeText: async () => {}, setBadgeBackgroundColor: async () => {} },
        },
    });
    const modules = new Map();
    function load(filename) {
        if (modules.has(filename)) return modules.get(filename).exports;
        if (!compiled.has(filename)) {
            compiled.set(filename, ts.transpileModule(readFileSync(filename, 'utf8').replaceAll('import.meta.env', '{}'), {
                compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
                fileName: filename,
            }).outputText);
        }
        const module = { exports: {} };
        modules.set(filename, module);
        const run = vm.runInContext(`(function(require, module, exports) { ${compiled.get(filename)}\n})`, context, { filename });
        run((name) => load(path.resolve(path.dirname(filename), `${name}.ts`)), module, module.exports);
        return module.exports;
    }
    load(path.join(backgroundDir, 'service-worker.ts'));
    return {
        requests,
        storage: () => structuredClone(stored),
        send: (message) => new Promise((resolve) => onMessage(message, {}, (result) => resolve(JSON.parse(JSON.stringify(result))))),
    };
}

test('local-only deletion works offline without requesting server deletion', async () => {
    const h = harness([job('local')]);
    assert.deepEqual(await h.send({ type: 'DELETE_JOB', payload: { jobId: 'local' } }), { success: true, deleted: 'local' });
    assert.equal(h.requests.length, 0);
    assert.equal(h.storage().savedJobs.length, 0);
});

test('deleting a local capture cannot remove a cached job sharing its external ID', async () => {
    const cached = syncedJob('server-uuid', { externalId: '1234' });
    const h = harness([cached, job('1234')]);
    await h.send({ type: 'DELETE_JOB', payload: { jobId: '1234' } });
    assert.deepEqual(h.storage().savedJobs, [cached]);
    assert.equal(h.requests.length, 0);
});

test('a failed server deletion is reported and preserves the synced job', async () => {
    const saved = syncedJob();
    const h = harness([saved], { '/api/extension/delete-job': () => response({ success: false, error: 'Try again later' }, 500) });
    assert.deepEqual(await h.send({ type: 'DELETE_JOB', payload: { jobId: saved.id } }), { success: false, error: 'Try again later' });
    assert.deepEqual(h.storage().savedJobs, [saved]);
});

test('legacy signed-out local:true API response cannot confirm synced deletion', async () => {
    const saved = syncedJob();
    const h = harness([saved], { '/api/extension/delete-job': () => response({ success: true, local: true }) });
    assert.equal((await h.send({ type: 'DELETE_JOB', payload: { jobId: saved.id } })).success, false);
    assert.deepEqual(h.storage().savedJobs, [saved]);
});

test('synced deletion removes the cache after server confirmation', async () => {
    const h = harness([syncedJob()]);
    assert.equal((await h.send({ type: 'DELETE_JOB', payload: { jobId: 'synced' } })).success, true);
    assert.equal(h.storage().savedJobs.length, 0);
    assert.equal(h.requests.filter((request) => request.method === 'DELETE').length, 1);
});

test('an empty successful server snapshot removes deleted cached jobs and keeps offline captures', async () => {
    const local = job('local');
    const h = harness([syncedJob(), local]);
    assert.deepEqual((await h.send({ type: 'GET_JOBS' })).data, [local]);
    assert.deepEqual(h.storage().savedJobs, [local]);
});

test('a capped server snapshot replaces only synced cache, never older browser-only captures', async () => {
    const local = job('older-local', { capturedAt: 1 });
    const latestTwenty = Array.from({ length: 20 }, (_, i) => syncedJob(`server-${i}`, { capturedAt: 200 + i }));
    const h = harness([syncedJob('outside-server-window'), local], {
        '/api/extension/saved-jobs': () => response({ success: true, userId: accountA, jobs: latestTwenty }),
    });
    const result = await h.send({ type: 'GET_JOBS' });
    assert.equal(result.data.length, 21);
    assert.deepEqual(result.data.at(-1), local);
    assert.equal(h.storage().savedJobs.length, 21);
});

test('network failure preserves the last confirmed account snapshot and local captures', async () => {
    const saved = [syncedJob(), job('local')];
    const offline = () => { throw new Error('Offline'); };
    const h = harness(saved, { '/api/extension/auth-status': offline, '/api/extension/saved-jobs': offline });
    assert.deepEqual((await h.send({ type: 'GET_JOBS' })).data, saved);
    assert.deepEqual(h.storage().savedJobs, saved);
    assert.equal(h.storage().activeUserId, accountA);
});

test('an API failure or malformed success cannot erase a valid snapshot', async () => {
    for (const apiResult of [response({ success: false }, 503), response({ success: true, userId: accountA })]) {
        const saved = [syncedJob(), job('local')];
        const h = harness(saved, { '/api/extension/saved-jobs': () => apiResult });
        assert.deepEqual((await h.send({ type: 'GET_JOBS' })).data, saved);
        assert.deepEqual(h.storage().savedJobs, saved);
    }
});

test('confirmed sign-out hides synced jobs while retaining browser-only captures', async () => {
    const local = job('local');
    const h = harness([syncedJob(), local], {
        '/api/extension/auth-status': () => response({ success: true, authenticated: false, user: null }),
    });
    assert.deepEqual((await h.send({ type: 'GET_JOBS' })).data, [local]);
    assert.equal(h.storage().savedJobs.length, 2);
    assert.equal(h.storage().activeUserId, null);
});

test('an authenticated-list 401 hides old account cache even if the auth-status check failed', async () => {
    const local = job('local');
    const h = harness([syncedJob(), local], {
        '/api/extension/auth-status': () => { throw new Error('Network failure'); },
        '/api/extension/saved-jobs': () => response({ success: false, error: 'Not authenticated' }, 401),
    });
    assert.deepEqual((await h.send({ type: 'GET_JOBS' })).data, [local]);
    assert.equal(h.storage().savedJobs.length, 2);
    assert.equal(h.storage().activeUserId, null);
});

test('switching accounts never falls back to the previous account cache', async () => {
    const local = job('local');
    const h = harness([syncedJob(), local], {
        '/api/extension/auth-status': () => response({ success: true, authenticated: true, user: { id: accountB } }),
        '/api/extension/saved-jobs': () => response({ success: false }, 500),
    });
    assert.deepEqual((await h.send({ type: 'GET_JOBS' })).data, [local]);
    assert.equal(h.storage().savedJobs.length, 2);
    assert.equal(h.storage().activeUserId, accountB);
});

test('switching accounts before deletion cannot remove a previously displayed synced job', async () => {
    const h = harness([syncedJob()], {
        '/api/extension/auth-status': () => response({ success: true, authenticated: true, user: { id: accountB } }),
    });
    assert.equal((await h.send({ type: 'DELETE_JOB', payload: { jobId: 'synced' } })).success, false);
    assert.equal(h.storage().savedJobs.length, 1);
    assert.equal(h.requests.some((request) => request.method === 'DELETE'), false);
});

test('legacy unknown-owner server cache is refreshed; explicit local UUID captures survive', async () => {
    const local = job('fd51d2df-e8d2-44ef-98eb-4cc4ad004a22');
    const legacy = job('11399ac9-35af-41a2-8bd0-438c3b173917', { syncState: undefined });
    const h = harness([local, legacy]);
    assert.deepEqual((await h.send({ type: 'GET_JOBS' })).data, [local]);
});

test('capture fallback explicitly saves locally and does not evict older offline captures', async () => {
    const h = harness(Array.from({ length: 55 }, (_, i) => job(`local-${i}`)), {
        '/api/extension/capture-jd': () => response({ success: false }, 503),
    });
    const result = await h.send({ type: 'CAPTURE_JD', payload: { jd: 'Full description', meta: job('new-local') } });
    assert.equal(result.success, true);
    assert.equal(result.data.syncState, 'local');
    assert.equal(result.data.jobDescription, 'Full description');
    assert.equal(h.storage().savedJobs.length, 56);
});

test('a successful capture records its account for later offline use', async () => {
    const saved = syncedJob();
    const h = harness([], {
        '/api/extension/capture-jd': () => response({ success: true, userId: accountB, data: saved }),
    });
    await h.send({ type: 'CAPTURE_JD', payload: { jd: 'Description', meta: job('capture') } });
    assert.equal(h.storage().savedJobs[0].ownerUserId, accountB);
    assert.equal(h.storage().activeUserId, accountB);
});

test('API recapture deduplicates the browser-only copy by source and external ID', async () => {
    const local = job('1234');
    const saved = syncedJob('server-uuid', { externalId: '1234', url: local.url });
    const h = harness([local], { '/api/extension/saved-jobs': () => response({ success: true, userId: accountA, jobs: [saved] }) });
    const result = await h.send({ type: 'GET_JOBS' });
    assert.equal(result.data.length, 1);
    assert.equal(result.data[0].id, saved.id);
});

test('concurrent local deletions cannot overwrite one another', async () => {
    const h = harness([job('one'), job('two')]);
    const results = await Promise.all(['one', 'two'].map((jobId) => h.send({ type: 'DELETE_JOB', payload: { jobId } })));
    assert.equal(results.every((result) => result.success), true);
    assert.deepEqual(h.storage().savedJobs, []);
});

test('an older in-flight snapshot cannot resurrect a later successful deletion', async () => {
    let releaseSnapshot;
    let markStarted;
    const started = new Promise((resolve) => { markStarted = resolve; });
    const snapshot = new Promise((resolve) => { releaseSnapshot = resolve; });
    const h = harness([syncedJob()], {
        '/api/extension/saved-jobs': () => { markStarted(); return snapshot; },
    });
    const loading = h.send({ type: 'GET_JOBS' });
    await started;
    const deleting = h.send({ type: 'DELETE_JOB', payload: { jobId: 'synced' } });
    releaseSnapshot(response({ success: true, userId: accountA, jobs: [syncedJob()] }));
    await loading;
    assert.equal((await deleting).success, true);
    assert.deepEqual(h.storage().savedJobs, []);
});

test('a slow previous-account snapshot cannot overwrite a later confirmed account switch', async () => {
    let activeUser = accountA;
    let releaseSnapshot;
    let markStarted;
    const started = new Promise((resolve) => { markStarted = resolve; });
    const snapshot = new Promise((resolve) => { releaseSnapshot = resolve; });
    const h = harness([syncedJob()], {
        '/api/extension/auth-status': () => response({ success: true, authenticated: true, user: { id: activeUser } }),
        '/api/extension/saved-jobs': () => { markStarted(); return snapshot; },
    });
    const loading = h.send({ type: 'GET_JOBS' });
    await started;
    activeUser = accountB;
    const switching = h.send({ type: 'CHECK_AUTH' });
    releaseSnapshot(response({ success: true, userId: accountA, jobs: [syncedJob()] }));
    await loading;
    await switching;
    assert.equal(h.storage().activeUserId, accountB);
    const status = await h.send({ type: 'CHECK_JOB_STATUS', payload: { url: syncedJob().url } });
    assert.equal(status.data.captured, false);
});

test('local undo and another deletion preserve each other; synced jobs cannot use local undo', async () => {
    const h = harness([job('delete-me')]);
    const results = await Promise.all([
        h.send({ type: 'RESTORE_LOCAL_JOB', payload: { job: job('restore-me') } }),
        h.send({ type: 'DELETE_JOB', payload: { jobId: 'delete-me' } }),
    ]);
    assert.equal(results.every((result) => result.success), true);
    assert.deepEqual(h.storage().savedJobs, [job('restore-me')]);
    assert.equal((await h.send({ type: 'RESTORE_LOCAL_JOB', payload: { job: syncedJob() } })).success, false);
    assert.deepEqual(h.storage().savedJobs, [job('restore-me')]);
});

test('production requests use the permitted canonical host and abortable fetches', async () => {
    const h = harness([], {
        '/api/extension/auth-status': (url, init) => {
            assert.equal(new URL(url).origin, 'https://www.recruiterinyourpocket.com');
            assert.ok(init.signal instanceof AbortSignal);
            return response({ success: true, authenticated: true, user: { id: accountA } });
        },
        '/api/extension/saved-jobs': (url, init) => {
            assert.equal(new URL(url).origin, 'https://www.recruiterinyourpocket.com');
            assert.ok(init.signal instanceof AbortSignal);
            return response({ success: true, userId: accountA, jobs: [] });
        },
    });
    assert.equal((await h.send({ type: 'GET_JOBS' })).syncStatus, 'synced');
});

test('a stalled refresh times out, reports cached data, and releases queued local deletion', async () => {
    const local = job('local');
    const h = harness([syncedJob(), local], {
        '/api/extension/saved-jobs': (_url, init) => new Promise((_resolve, reject) => {
            init.signal.addEventListener('abort', () => reject(init.signal.reason));
        }),
    }, 5);
    const refresh = h.send({ type: 'GET_JOBS' });
    const deletion = h.send({ type: 'DELETE_JOB', payload: { jobId: local.id } });
    const result = await refresh;
    assert.equal(result.syncStatus, 'offline');
    assert.equal(result.data.length, 2);
    assert.equal((await deletion).success, true);
    assert.deepEqual(h.storage().savedJobs, [syncedJob()]);
});
