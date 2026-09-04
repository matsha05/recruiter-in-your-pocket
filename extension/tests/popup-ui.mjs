import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

// Reuse the repository's browser test dependency; no extra extension dependency.
const requireWeb = createRequire(new URL('../../web/package.json', import.meta.url));
const { chromium, expect } = requireWeb('@playwright/test');
const dist = new URL('../dist/', import.meta.url);
const types = { html: 'text/html', js: 'text/javascript', css: 'text/css', woff2: 'font/woff2' };
const server = createServer(async (req, res) => {
    try {
        const target = new URL(`.${new URL(req.url, 'http://localhost').pathname}`, dist);
        if (!target.href.startsWith(dist.href)) throw new Error('Invalid path');
        const content = await readFile(fileURLToPath(target));
        res.setHeader('Content-Type', types[target.pathname.split('.').at(-1)] || 'application/octet-stream');
        res.end(content);
    } catch {
        res.writeHead(404).end();
    }
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
const base = `http://127.0.0.1:${address.port}`;
let browser;

function jobs(count, synced = false) {
    return Array.from({ length: count }, (_, i) => ({
        id: `job-${i + 1}`, title: `Role ${i + 1}`, company: 'Example', source: 'linkedin',
        capturedAt: Date.now() - i * 1000, url: `https://example.com/jobs/${i + 1}`,
        jdPreview: 'Description', jobDescription: `Full description ${i + 1}`, score: null,
        syncState: synced ? 'synced' : 'local', ...(synced ? { ownerUserId: 'account-a' } : {}),
    }));
}

async function openPopup(fixtures, authenticated = false, deleteError = null, restoreError = null, syncStatus = authenticated ? 'synced' : 'signed-out', onboardingComplete = true) {
    const page = await browser.newPage({ viewport: { width: 380, height: 600 } });
    await page.route('**/api/**', (route) => route.fulfill({
        status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { hasResume: false } }),
    }));
    await page.addInitScript(({ fixtures, authenticated, deleteError, restoreError, syncStatus, onboardingComplete }) => {
        const state = { jobs: fixtures, messages: [], tabs: [], authenticated, syncStatus, onboardingComplete };
        window.__testState = state;
        window.chrome = {
            runtime: {
                async sendMessage(message) {
                    state.messages.push(message);
                    if (message.type === 'CHECK_AUTH') return { success: true, data: { authenticated: state.authenticated, user: state.authenticated ? { id: 'account-a', email: 'test@example.com' } : null } };
                    if (message.type === 'GET_JOBS') return { success: true, data: state.jobs, syncStatus: state.syncStatus };
                    if (message.type === 'DELETE_JOB') {
                        if (deleteError) return { success: false, error: deleteError };
                        state.jobs = state.jobs.filter((job) => job.id !== message.payload.jobId);
                        return { success: true, deleted: message.payload.jobId };
                    }
                    if (message.type === 'RESTORE_LOCAL_JOB') {
                        if (restoreError) return { success: false, error: restoreError };
                        state.jobs = [message.payload.job, ...state.jobs];
                        return { success: true };
                    }
                    return { success: true };
                },
            },
            storage: { local: {
                async get(key) { return key === 'riyp_onboarding_complete' ? { riyp_onboarding_complete: state.onboardingComplete } : { riyp_extension_data: { savedJobs: state.jobs } }; },
                async set(value) {
                    if (value.riyp_extension_data) state.jobs = value.riyp_extension_data.savedJobs;
                    if (value.riyp_onboarding_complete) state.onboardingComplete = true;
                },
            } },
            tabs: { create(tab) { state.tabs.push(tab); } },
        };
    }, { fixtures, authenticated, deleteError, restoreError, syncStatus, onboardingComplete });
    await page.goto(`${base}/src/popup/index.html`);
    return page;
}

try {
    const builtManifest = JSON.parse(await readFile(new URL('manifest.json', dist), 'utf8'));
    assert.ok(builtManifest.host_permissions.includes('https://www.recruiterinyourpocket.com/*'));
    assert.equal(builtManifest.host_permissions.some((host) => /localhost|127\.0\.0\.1/.test(host)), false, 'production bundle must not include development host permissions');
    browser = await chromium.launch();
    const page = await openPopup(jobs(8));
    await expect(page.locator('.job-card')).toHaveCount(5);
    await page.getByRole('button', { name: 'View all 8', exact: true }).click();
    await expect(page.locator('.job-card')).toHaveCount(8);
    await expect(page.getByRole('button', { name: 'Show recent', exact: true })).toHaveAttribute('aria-expanded', 'true');
    assert.equal(await page.evaluate(() => window.__testState.messages.some((message) => message.type === 'OPEN_WEBAPP')), false);

    const lastCard = page.locator('.job-card').filter({ hasText: 'Role 8' });
    await lastCard.getByRole('button', { name: 'Open original posting', exact: true }).click();
    assert.deepEqual(await page.evaluate(() => window.__testState.tabs), [{ url: 'https://example.com/jobs/8' }]);
    await lastCard.locator('.job-card-main').click();
    const openPath = await page.evaluate(() => window.__testState.messages.find((message) => message.type === 'OPEN_WEBAPP').payload.path);
    assert.equal(new URL(openPath, base).searchParams.get('jd'), 'Full description 8');
    assert.equal(new URL(openPath, base).searchParams.get('source'), 'extension-local');

    const bounds = await page.evaluate(() => ({
        popup: document.querySelector('.popup-container').getBoundingClientRect().height,
        footer: document.querySelector('.popup-footer').getBoundingClientRect().bottom,
        contentHeight: document.querySelector('.popup-content').clientHeight,
        contentScrollHeight: document.querySelector('.popup-content').scrollHeight,
    }));
    assert.ok(bounds.popup <= 600 && bounds.footer <= 600, JSON.stringify(bounds));
    assert.ok(bounds.contentScrollHeight > bounds.contentHeight);
    await lastCard.getByRole('button', { name: 'Remove job', exact: true }).click();
    await expect(page.locator('.job-card')).toHaveCount(7);
    await page.getByRole('button', { name: 'Undo', exact: true }).click();
    await expect(page.locator('.job-card')).toHaveCount(8);
    await page.getByRole('button', { name: 'Show recent', exact: true }).click();
    await expect(page.locator('.job-card')).toHaveCount(5);
    await page.close();

    const failurePage = await openPopup(jobs(3, true), true, 'Could not remove this job. Try again.');
    await expect(failurePage.locator('.job-card')).toHaveCount(3);
    await failurePage.locator('.job-card').filter({ hasText: 'Role 2' }).getByRole('button', { name: 'Remove job', exact: true }).click();
    await expect(failurePage.getByRole('alert')).toHaveText('Could not remove this job. Try again.');
    await expect(failurePage.locator('.job-card')).toHaveCount(3);
    await expect(failurePage.locator('.job-title')).toHaveText(['Role 1', 'Role 2', 'Role 3']);
    await expect(failurePage.getByRole('button', { name: 'Undo', exact: true })).toHaveCount(0);
    await failurePage.close();

    const undoFailurePage = await openPopup(jobs(2), false, null, 'Could not restore the saved job. Try again.');
    await expect(undoFailurePage.locator('.job-card')).toHaveCount(2);
    await undoFailurePage.locator('.job-card').filter({ hasText: 'Role 2' }).getByRole('button', { name: 'Remove job', exact: true }).click();
    await expect(undoFailurePage.locator('.job-card')).toHaveCount(1);
    await undoFailurePage.getByRole('button', { name: 'Undo', exact: true }).click();
    await expect(undoFailurePage.getByRole('alert')).toHaveText('Could not restore the saved job. Try again.');
    await expect(undoFailurePage.locator('.job-card')).toHaveCount(1);
    await expect(undoFailurePage.getByRole('button', { name: 'Undo', exact: true })).toBeVisible();
    await undoFailurePage.close();

    const reconnectPage = await openPopup(jobs(1));
    await reconnectPage.getByRole('button', { name: 'Sign in for sync', exact: true }).click();
    assert.equal(await reconnectPage.evaluate(() => window.__testState.messages.some((message) => message.type === 'OPEN_WEBAPP' && message.payload.path.startsWith('/auth?'))), true);
    await reconnectPage.evaluate(() => { window.__testState.authenticated = true; window.__testState.syncStatus = 'synced'; });
    await reconnectPage.getByRole('button', { name: 'Refresh', exact: true }).click();
    await expect(reconnectPage.getByText('Sync on', { exact: true })).toBeVisible();
    await reconnectPage.evaluate(() => { window.__testState.syncStatus = 'offline'; });
    await reconnectPage.getByRole('button', { name: 'Refresh', exact: true }).click();
    await expect(reconnectPage.getByRole('status')).toContainText('Synced jobs could not refresh');
    await expect(reconnectPage.locator('.job-card')).toHaveCount(1);
    await reconnectPage.evaluate(() => {
        window.__testState.authenticated = false;
        window.__testState.syncStatus = 'signed-out';
        window.dispatchEvent(new Event('focus'));
    });
    await expect(reconnectPage.getByText('Local only', { exact: true })).toBeVisible();
    await expect(reconnectPage.getByText('Sync on', { exact: true })).toHaveCount(0);
    await reconnectPage.close();

    const onboardingPage = await openPopup(jobs(1, true), true, null, null, 'synced', false);
    await onboardingPage.getByRole('button', { name: /^Start with job capture/ }).click();
    await expect(onboardingPage.getByText('Sync on', { exact: true })).toBeVisible();
    await expect(onboardingPage.locator('.job-card')).toHaveCount(1);
    await onboardingPage.close();
    console.log('Popup regressions passed: list/actions, delete/Undo failures, production permissions, sign-in/refresh/offline recovery, and authenticated onboarding.');
} finally {
    await browser?.close();
    await new Promise((resolve) => server.close(resolve));
}
