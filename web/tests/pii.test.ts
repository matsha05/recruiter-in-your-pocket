/**
 * PII Boundary Tests
 * 
 * Tests for P0 Bundle 2 (RT-010, RT-012):
 * - Forbidden key detection
 * - PII pattern detection
 * - PII scrubbing
 */

import {
    containsForbiddenKeys,
    containsPiiPatterns,
    scrubPiiFromString,
    scrubPiiFromObject,
    FORBIDDEN_KEYS
} from '../lib/observability/pii';
import { logError, logInfo } from '../lib/observability/logger';

// Test utility
function test(name: string, fn: () => void | boolean) {
    try {
        const result = fn();
        if (result === false) {
            console.log(`❌ FAIL: ${name}`);
            return false;
        }
        console.log(`✅ PASS: ${name}`);
        return true;
    } catch (err: any) {
        console.log(`❌ FAIL: ${name}`);
        console.log(`   Error: ${err.message}`);
        return false;
    }
}

function captureConsole(method: 'log' | 'error', fn: () => void): string {
    const original = console[method];
    let captured = '';
    console[method] = ((...args: unknown[]) => {
        captured = args.map(String).join(' ');
    }) as typeof console[typeof method];

    try {
        fn();
    } finally {
        console[method] = original as typeof console[typeof method];
    }

    return captured;
}

console.log('\n=== P0 Bundle 2: PII Boundary Tests ===\n');

let passed = 0;
let failed = 0;

// --- Forbidden Keys Detection ---

console.log('--- RT-010: Forbidden Key Detection ---\n');

if (test('Detects "resumeText" key', () => {
    return containsForbiddenKeys({ resumeText: 'My resume content' }) === true;
})) passed++; else failed++;

if (test('Detects "email" key', () => {
    return containsForbiddenKeys({ email: 'user@example.com' }) === true;
})) passed++; else failed++;

if (test('Detects "jobDescription" key', () => {
    return containsForbiddenKeys({ jobDescription: 'Senior Engineer role...' }) === true;
})) passed++; else failed++;

if (test('Detects "password" key', () => {
    return containsForbiddenKeys({ password: 'secret123' }) === true;
})) passed++; else failed++;

if (test('Detects nested PII keys', () => {
    return containsForbiddenKeys({
        data: {
            user: {
                email: 'test@test.com'
            }
        }
    }) === true;
})) passed++; else failed++;

if (test('Detects case-insensitive "Email" in key name', () => {
    return containsForbiddenKeys({ userEmail: 'test@test.com' }) === true;
})) passed++; else failed++;

if (test('Does NOT flag safe keys', () => {
    return containsForbiddenKeys({
        request_id: '123',
        status: 200,
        latency_ms: 150
    }) === false;
})) passed++; else failed++;

if (test('Allows numeric token counts only at the llm telemetry path', () => {
    return containsForbiddenKeys({
        llm: { tokens_in: 1200, tokens_out: 340 }
    }) === false;
})) passed++; else failed++;

if (test('Allows conventional error class names only at err.name', () => {
    return containsForbiddenKeys({
        err: { name: 'ValidationError', message: 'Response validation failed' }
    }) === false;
})) passed++; else failed++;

if (test('Still blocks token-like keys outside the safe telemetry path', () => {
    return containsForbiddenKeys({ tokens_in: 1200 }) === true;
})) passed++; else failed++;

if (test('Still blocks non-numeric token values at the safe telemetry path', () => {
    return containsForbiddenKeys({ llm: { tokens_in: 'private-token' } }) === true;
})) passed++; else failed++;

if (test('Still blocks personal names outside err.name', () => {
    return containsForbiddenKeys({ user: { name: 'Jane Doe' } }) === true;
})) passed++; else failed++;

if (test('Blocks err.name values that do not look like error classes', () => {
    return containsForbiddenKeys({ err: { name: 'Jane Doe', message: 'Failed' } }) === true;
})) passed++; else failed++;

// --- PII Pattern Detection ---

console.log('\n--- RT-012: PII Pattern Detection ---\n');

if (test('Detects SSN pattern (123-45-6789)', () => {
    return containsPiiPatterns('My SSN is 123-45-6789') === true;
})) passed++; else failed++;

if (test('Detects phone pattern (123-456-7890)', () => {
    return containsPiiPatterns('Call me at 123-456-7890') === true;
})) passed++; else failed++;

if (test('Detects phone pattern ((555) 123-4567)', () => {
    return containsPiiPatterns('My number is (555) 1234567') === true;
})) passed++; else failed++;

if (test('Detects email pattern', () => {
    return containsPiiPatterns('Contact: john.doe@example.com') === true;
})) passed++; else failed++;

if (test('Does NOT flag normal text', () => {
    return containsPiiPatterns('Senior Software Engineer with 5 years experience') === false;
})) passed++; else failed++;

// --- PII Scrubbing ---

console.log('\n--- PII Scrubbing ---\n');

if (test('Scrubs SSN from string', () => {
    const result = scrubPiiFromString('SSN: 123-45-6789');
    return result.includes('[REDACTED-SSN]') && !result.includes('123-45-6789');
})) passed++; else failed++;

if (test('Scrubs phone from string', () => {
    const result = scrubPiiFromString('Phone: 555-123-4567');
    return result.includes('[REDACTED-PHONE]') && !result.includes('555-123-4567');
})) passed++; else failed++;

if (test('Scrubs email from string', () => {
    const result = scrubPiiFromString('Email: test@example.com');
    return result.includes('[REDACTED-EMAIL]') && !result.includes('test@example.com');
})) passed++; else failed++;

if (test('scrubPiiFromObject replaces resumeText with [REDACTED]', () => {
    const result = scrubPiiFromObject({ resumeText: 'My whole resume' }) as Record<string, string>;
    return result.resumeText === '[REDACTED]';
})) passed++; else failed++;

if (test('scrubPiiFromObject preserves safe keys', () => {
    const result = scrubPiiFromObject({
        request_id: 'abc123',
        status: 200
    }) as Record<string, unknown>;
    return result.request_id === 'abc123' && result.status === 200;
})) passed++; else failed++;

if (test('scrubPiiFromObject scrubs nested PII', () => {
    const result = scrubPiiFromObject({
        data: {
            user: {
                email: 'test@test.com',
                id: '123'
            }
        }
    }) as any;
    return result.data.user.email === '[REDACTED]' && result.data.user.id === '123';
})) passed++; else failed++;

if (test('scrubPiiFromObject preserves safe structured telemetry', () => {
    const result = scrubPiiFromObject({
        llm: { tokens_in: 1200, tokens_out: 340 },
        err: { name: 'ValidationError', message: 'Response validation failed' }
    }) as any;
    return result.llm.tokens_in === 1200 &&
        result.llm.tokens_out === 340 &&
        result.err.name === 'ValidationError';
})) passed++; else failed++;

if (test('scrubPiiFromObject redacts unsafe path collisions and string PII', () => {
    const result = scrubPiiFromObject({
        tokens_in: 1200,
        err: { name: 'Jane Doe', message: 'Contact jane@example.com' }
    }) as any;
    return result.tokens_in === '[REDACTED]' &&
        result.err.name === '[REDACTED]' &&
        result.err.message === 'Contact [REDACTED-EMAIL]';
})) passed++; else failed++;

// --- Logger Integration ---

console.log('\n--- Structured Logger PII Boundary ---\n');

if (test('Logger emits safe LLM token telemetry and err.name', () => {
    const output = captureConsole('error', () => {
        logError({
            msg: 'llm.response.validation_failed',
            llm: { tokens_in: 1200, tokens_out: 340 },
            err: { name: 'ValidationError', message: 'Response validation failed' }
        });
    });
    const parsed = JSON.parse(output);
    return parsed.msg === 'llm.response.validation_failed' &&
        parsed.llm.tokens_in === 1200 &&
        parsed.llm.tokens_out === 340 &&
        parsed.err.name === 'ValidationError';
})) passed++; else failed++;

if (test('Logger still blocks records containing forbidden keys', () => {
    const output = captureConsole('error', () => {
        logError({
            msg: 'unsafe.record',
            err: { name: 'ValidationError', message: 'Failed' },
            email: 'jane@example.com'
        } as any);
    });
    const parsed = JSON.parse(output);
    return parsed.msg === 'log.pii_blocked' &&
        !output.includes('jane@example.com') &&
        !output.includes('unsafe.record');
})) passed++; else failed++;

if (test('Logger redacts PII embedded in otherwise safe strings', () => {
    const output = captureConsole('log', () => {
        logInfo({
            msg: 'request.note',
            source: 'Contact jane@example.com or 555-123-4567'
        });
    });
    const parsed = JSON.parse(output);
    return parsed.msg === 'request.note' &&
        parsed.source.includes('[REDACTED-EMAIL]') &&
        parsed.source.includes('[REDACTED-PHONE]') &&
        !output.includes('jane@example.com') &&
        !output.includes('555-123-4567');
})) passed++; else failed++;

// --- Forbidden Keys Coverage ---

console.log('\n--- Forbidden Keys Coverage ---\n');

if (test('FORBIDDEN_KEYS includes resumeText', () => {
    return FORBIDDEN_KEYS.has('resumeText');
})) passed++; else failed++;

if (test('FORBIDDEN_KEYS includes jobDescription', () => {
    return FORBIDDEN_KEYS.has('jobDescription');
})) passed++; else failed++;

if (test('FORBIDDEN_KEYS includes authorization', () => {
    return FORBIDDEN_KEYS.has('authorization');
})) passed++; else failed++;

if (test('FORBIDDEN_KEYS includes password', () => {
    return FORBIDDEN_KEYS.has('password');
})) passed++; else failed++;

if (test('FORBIDDEN_KEYS includes pdfText', () => {
    return FORBIDDEN_KEYS.has('pdfText');
})) passed++; else failed++;

// ============================================
// SUMMARY
// ============================================

console.log('\n========================================');
console.log(`RESULTS: ${passed} passed, ${failed} failed`);
console.log('========================================\n');

if (failed > 0) {
    process.exit(1);
}
