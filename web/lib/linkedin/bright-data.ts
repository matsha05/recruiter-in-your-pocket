/**
 * Bright Data LinkedIn Profile Fetcher
 * 
 * Uses Bright Data API to fetch LinkedIn profile data from a URL.
 * This module is designed to be easily enabled once Bright Data API key is available.
 */

import type { LinkedInProfile } from '@/types/linkedin';

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
export function extractLinkedInHandle(url: string): string | null {
    // Handle various LinkedIn URL formats:
    // - https://www.linkedin.com/in/johnsmith
    // - https://linkedin.com/in/johnsmith/
    // - http://www.linkedin.com/in/johnsmith?param=value
    const match = url.match(/linkedin\.com\/in\/([^\/\?\s]+)/i);
    return match ? match[1] : null;
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
        console.log('[bright-data] API key not configured, returning null for PDF fallback');
        return null;
    }

    const handle = extractLinkedInHandle(profileUrl);
    if (!handle) {
        console.error('[bright-data] Invalid LinkedIn URL:', profileUrl);
        return null;
    }

    try {
        console.log('[bright-data] Fetching profile for handle:', handle);

        const response = await fetch(BRIGHT_DATA_ENDPOINT, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${BRIGHT_DATA_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url: profileUrl,
                include: ['name', 'headline', 'about', 'experience', 'education', 'skills', 'certifications'],
            }),
        });

        if (!response.ok) {
            console.error('[bright-data] API error:', response.status, response.statusText);
            return null;
        }

        const data = await response.json();
        return transformBrightDataResponse(data, profileUrl);

    } catch (error) {
        console.error('[bright-data] Fetch error:', error);
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
