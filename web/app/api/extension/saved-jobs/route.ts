import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/serverClient';

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
    'chrome-extension://',
    'http://localhost:3000',
    'https://recruiterinyourpocket.com',
    'https://www.recruiterinyourpocket.com',
];

function getCorsHeaders(req: NextRequest) {
    const origin = req.headers.get('origin') || '';
    const isAllowed = ALLOWED_ORIGINS.some(allowed =>
        origin.startsWith(allowed) || allowed.startsWith('chrome-extension://')
    );
    const allowedOrigin = isAllowed ? origin : '';

    return {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
}

export async function OPTIONS(req: NextRequest) {
    return NextResponse.json({}, { headers: getCorsHeaders(req) });
}

/**
 * GET /api/extension/saved-jobs
 * 
 * Returns the user's saved jobs for display in the extension popup.
 */
export async function GET(req: NextRequest) {
    const corsHeaders = getCorsHeaders(req);

    try {
        const supabase = await createSupabaseServerClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: 'Not authenticated', data: [] },
                { status: 401, headers: corsHeaders }
            );
        }

        // Fetch saved jobs for user (most recent first, limit 20)
        const { data: jobs, error: fetchError } = await supabase
            .from('saved_jobs')
            .select('id, external_id, title, company, location, url, match_score, jd_preview, captured_at, source')
            .eq('user_id', user.id)
            .order('captured_at', { ascending: false })
            .limit(20);

        if (fetchError) {
            console.error('[Extension] Fetch jobs error:', fetchError);
            return NextResponse.json(
                { success: false, error: 'Failed to fetch jobs', data: [] },
                { status: 500, headers: corsHeaders }
            );
        }

        // Transform to extension format
        const savedJobs = (jobs || []).map(job => ({
            id: job.external_id || job.id,
            title: job.title,
            company: job.company,
            location: job.location,
            url: job.url,
            score: job.match_score,
            jdPreview: job.jd_preview,
            capturedAt: new Date(job.captured_at).getTime(),
            source: job.source,
        }));

        return NextResponse.json({
            success: true,
            jobs: savedJobs,
        }, { headers: corsHeaders });

    } catch (error) {
        console.error('[Extension] Get saved jobs error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error', data: [] },
            { status: 500, headers: corsHeaders }
        );
    }
}
