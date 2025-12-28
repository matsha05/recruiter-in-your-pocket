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
