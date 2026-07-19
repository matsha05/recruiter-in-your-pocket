/**
 * Bright Data LinkedIn Profile Fetcher
 * 
 * Uses Bright Data API to fetch LinkedIn profile data from a URL.
 * This module is designed to be easily enabled once Bright Data API key is available.
 */

import type { LinkedInProfile } from '@/types/linkedin';
import { logError, logInfo, logWarn } from '@/lib/observability/logger';

const BRIGHT_DATA_API_KEY = process.env.BRIGHT_DATA_API_KEY;
const BRIGHT_DATA_ENDPOINT = 'https://api.brightdata.com/datasets/v3/linkedin/person';

/**
 * Check if Bright Data is configured
 */
export function isBrightDataConfigured(): boolean {
    return Boolean(BRIGHT_DATA_API_KEY && BRIGHT_DATA_API_KEY.length > 10);
}

/**
 * Extract LinkedIn handle from URL
 */
function extractLinkedInHandle(url: string): string | null {
    try {
        const parsed = new URL(url);
        const hostname = parsed.hostname.toLowerCase();
        if (parsed.protocol !== 'https:' || (hostname !== 'linkedin.com' && hostname !== 'www.linkedin.com')) {
            return null;
        }

        const match = parsed.pathname.match(/^\/in\/([^/]+)\/?$/i);
        return match ? decodeURIComponent(match[1]) : null;
    } catch {
        return null;
    }
}

function canonicalLinkedInUrl(handle: string): string {
    return `https://www.linkedin.com/in/${encodeURIComponent(handle)}`;
}

/**
 * Validate LinkedIn URL
 */
export function isValidLinkedInUrl(url: string): boolean {
    return Boolean(extractLinkedInHandle(url));
}

/**
 * Fetch LinkedIn profile from Bright Data API
 * 
 * Returns null if:
 * - Bright Data is not configured
 * - The request fails
 * - The profile is not found
 * 
 * This allows graceful fallback to PDF upload.
 */
export async function fetchLinkedInProfile(profileUrl: string): Promise<LinkedInProfile | null> {
    // Check if Bright Data is configured
    if (!isBrightDataConfigured()) {
        logInfo({ msg: 'linkedin.provider_unavailable', feature: 'bright_data', outcome: 'provider_error' });
        return null;
    }

    const handle = extractLinkedInHandle(profileUrl);
    if (!handle) {
        logWarn({ msg: 'linkedin.url_invalid', feature: 'bright_data', outcome: 'validation_error' });
        return null;
    }

    try {
        logInfo({ msg: 'linkedin.fetch_started', feature: 'bright_data' });

        const canonicalUrl = canonicalLinkedInUrl(handle);

        const response = await fetch(BRIGHT_DATA_ENDPOINT, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${BRIGHT_DATA_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url: canonicalUrl,
                include: ['name', 'headline', 'about', 'experience', 'education', 'skills', 'certifications'],
            }),
            signal: AbortSignal.timeout(15_000),
        });

        if (!response.ok) {
            logWarn({
                msg: 'linkedin.provider_failed',
                feature: 'bright_data',
                status: response.status,
                outcome: 'provider_error'
            });
            return null;
        }

        const data = await response.json();
        return transformBrightDataResponse(data, canonicalUrl);

    } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown LinkedIn provider error');
        logError({
            msg: 'linkedin.fetch_failed',
            feature: 'bright_data',
            outcome: 'provider_error',
            err: { name: err.name, message: err.message, stack: err.stack }
        });
        return null;
    }
}

/**
 * Transform Bright Data API response to our LinkedInProfile format
 */
function transformBrightDataResponse(data: any, profileUrl: string): LinkedInProfile {
    return {
        source: 'url',
        name: data.name || data.full_name || '',
        headline: data.headline || data.subtitle || '',
        location: data.location || data.city || null,
        profileUrl: profileUrl,
        about: data.about || data.summary || null,
        experience: (data.experience || []).map((exp: any) => ({
            title: exp.title || '',
            company: exp.company || exp.company_name || '',
            duration: exp.duration || exp.date_range || '',
            description: exp.description || null,
            isCurrent: Boolean(exp.is_current) || (exp.duration || '').toLowerCase().includes('present'),
        })),
        education: (data.education || []).map((edu: any) => ({
            school: edu.school || edu.school_name || '',
            degree: edu.degree || null,
            field: edu.field_of_study || edu.field || null,
            dates: edu.dates || edu.date_range || null,
        })),
        skills: data.skills || [],
        certifications: data.certifications || [],
        hasPhoto: Boolean(data.profile_picture || data.photo_url),
        hasBanner: Boolean(data.background_image || data.banner_url),
        photoUrl: data.profile_picture || data.photo_url || null,
        connectionCount: data.connections || data.connection_count || null,
        followerCount: data.followers || data.follower_count || null,
        fetchedAt: new Date().toISOString(),
        isComplete: true,
    };
}
