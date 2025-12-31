import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/serverClient';

/**
 * GET /api/extension/saved-jobs/[id]
 * 
 * Returns a single saved job by ID for workspace pre-fill.
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createSupabaseServerClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: 'Not authenticated' },
                { status: 401 }
            );
        }

        // Fetch the saved job by external_id or id
        const { data: job, error: fetchError } = await supabase
            .from('saved_jobs')
            .select('id, external_id, title, company, location, url, match_score, jd_preview, jd_text, job_description_text, captured_at, source, matched_skills, missing_skills, top_gaps, status')
            .eq('user_id', user.id)
            .or(`external_id.eq.${id},id.eq.${id}`)
            .maybeSingle();

        if (fetchError) {
            console.error('[Extension] Fetch job error:', fetchError);
            return NextResponse.json(
                { success: false, error: 'Failed to fetch job' },
                { status: 500 }
            );
        }

        if (!job) {
            return NextResponse.json(
                { success: false, error: 'Job not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                id: job.external_id || job.id,
                title: job.title,
                company: job.company,
                location: job.location,
                url: job.url,
                score: job.match_score,
                jdPreview: job.jd_preview,
                jdText: job.jd_text,
                jobDescription: job.job_description_text,
                capturedAt: new Date(job.captured_at).getTime(),
                source: job.source,
                status: job.status || 'saved',
                // Real match insights from hybrid engine
                matchedSkills: job.matched_skills || [],
                missingSkills: job.missing_skills || [],
                topGaps: job.top_gaps || [],
            },
        });

    } catch (error) {
        console.error('[Extension] Get saved job error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/extension/saved-jobs/[id]
 * 
 * Deletes a saved job by ID.
 */
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createSupabaseServerClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: 'Not authenticated' },
                { status: 401 }
            );
        }

        // Delete the saved job by id
        const { error: deleteError } = await supabase
            .from('saved_jobs')
            .delete()
            .eq('user_id', user.id)
            .or(`external_id.eq.${id},id.eq.${id}`);

        if (deleteError) {
            console.error('[Extension] Delete job error:', deleteError);
            return NextResponse.json(
                { success: false, error: 'Failed to delete job' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('[Extension] Delete saved job error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
