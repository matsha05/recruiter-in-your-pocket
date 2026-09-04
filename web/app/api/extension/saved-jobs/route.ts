import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/serverClient';
import { buildExtensionCorsHeaders } from '@/lib/extension/cors';
import { isLaunchFlagEnabled } from '@/lib/launch/flags';
import { SAVED_JOBS_PAGE_SIZE, encodeSavedJobsCursor, parseSavedJobsCursor, savedJobsCursorFilter } from '@/lib/extension/savedJobsPagination';

export async function OPTIONS(req: NextRequest) {
    return NextResponse.json({}, { headers: buildExtensionCorsHeaders(req, ['GET', 'OPTIONS']) });
}

/**
 * GET /api/extension/saved-jobs
 * 
 * Returns one page of the user's saved jobs. The extension uses the recent page;
 * the website follows nextCursor to reach older captures.
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

        const params = new URL(req.url).searchParams;
        const parsedCursor = parseSavedJobsCursor(params.get('cursor'));
        if (!parsedCursor.ok || params.getAll('cursor').length > 1) {
            return NextResponse.json(
                { success: false, errorCode: 'INVALID_CURSOR', error: 'This saved-jobs page is invalid. Reload and try again.', jobs: [] },
                { status: 400, headers: corsHeaders }
            );
        }

        // Fetch one extra row to determine whether another page exists. The ID
        // breaks timestamp ties, and keyset pagination remains stable on deletion.
        let query = supabase
            .from('saved_jobs')
            .select('id, external_id, title, company, location, url, match_score, jd_preview, captured_at, source, status')
            .eq('user_id', user.id)
            .order('captured_at', { ascending: false })
            .order('id', { ascending: false })
            .limit(SAVED_JOBS_PAGE_SIZE + 1);
        if (parsedCursor.cursor) query = query.or(savedJobsCursorFilter(parsedCursor.cursor));
        const { data: jobs, error: fetchError } = await query;

        if (fetchError) {
            console.error('[Extension] Fetch jobs error:', fetchError);
            return NextResponse.json(
                { success: false, errorCode: 'FETCH_FAILED', error: 'Failed to fetch jobs', jobs: [] },
                { status: 500, headers: corsHeaders }
            );
        }

        // Transform to extension format
        const page = (jobs || []).slice(0, SAVED_JOBS_PAGE_SIZE);
        const hasMore = (jobs?.length ?? 0) > SAVED_JOBS_PAGE_SIZE;
        const savedJobs = page.map(job => ({
            id: job.id,
            externalId: job.external_id,
            title: job.title,
            company: job.company,
            location: job.location,
            url: job.url,
            score: job.match_score,
            jdPreview: job.jd_preview,
            capturedAt: new Date(job.captured_at).getTime(),
            source: job.source,
            status: job.status,
        }));

        return NextResponse.json({
            success: true,
            userId: user.id,
            jobs: savedJobs,
            nextCursor: hasMore ? encodeSavedJobsCursor(page[page.length - 1]) : null,
        }, { headers: corsHeaders });

    } catch (error) {
        console.error('[Extension] Get saved jobs error:', error);
        return NextResponse.json(
            { success: false, errorCode: 'INTERNAL_ERROR', error: 'Internal server error', jobs: [] },
            { status: 500, headers: corsHeaders }
        );
    }
}
