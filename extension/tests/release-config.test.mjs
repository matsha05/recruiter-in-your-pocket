import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const readJson = (file) => JSON.parse(readFileSync(new URL(file, import.meta.url), 'utf8'));

test('release metadata and permissions use the canonical production host without localhost access', () => {
    const manifest = readJson('../public/manifest.json');
    const pkg = readJson('../package.json');
    const lock = readJson('../package-lock.json');
    assert.equal(pkg.version, manifest.version);
    assert.equal(lock.version, manifest.version);
    assert.equal(lock.packages[''].version, manifest.version);
    assert.ok(manifest.host_permissions.includes('https://www.recruiterinyourpocket.com/*'));
    assert.equal(manifest.host_permissions.some((host) => host.includes('localhost') || host.includes('127.0.0.1')), false);
    assert.equal(manifest.host_permissions.includes('<all_urls>'), false);
});
