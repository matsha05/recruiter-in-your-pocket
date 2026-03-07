import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/serverClient';
import { buildExtensionCorsHeaders } from '@/lib/extension/cors';
import { isLaunchFlagEnabled } from '@/lib/launch/flags';

export async function OPTIONS(req: NextRequest) {
    return NextResponse.json({}, { headers: buildExtensionCorsHeaders(req, ['GET', 'OPTIONS']) });
}

/**
 * GET /api/extension/saved-jobs
 * 
 * Returns the user's saved jobs for display in the extension popup.
 */
export async function GET(req: NextRequest) {
    const corsHeaders = buildExtensionCorsHeaders(req, ['GET', 'OPTIONS']);

    if (!isLaunchFlagEnabled('extensionSync')) {
        return NextResponse.json(
            { success: false, errorCode: 'FEATURE_DISABLED', error: 'Extension sync is temporarily unavailable.', jobs: [] },
            { status: 503, headers: corsHeaders }
        );
    }

    try {
        const supabase = await createSupabaseServerClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { success: false, errorCode: 'AUTH_REQUIRED', error: 'Not authenticated', jobs: [] },
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
                { success: false, errorCode: 'FETCH_FAILED', error: 'Failed to fetch jobs', jobs: [] },
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
            { success: false, errorCode: 'INTERNAL_ERROR', error: 'Internal server error', jobs: [] },
            { status: 500, headers: corsHeaders }
        );
    }
}
