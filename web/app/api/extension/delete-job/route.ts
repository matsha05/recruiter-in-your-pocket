import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/serverClient';
import { buildExtensionCorsHeaders } from '@/lib/extension/cors';
import { isLaunchFlagEnabled } from '@/lib/launch/flags';

export async function OPTIONS(req: NextRequest) {
    return NextResponse.json({}, { headers: buildExtensionCorsHeaders(req, ['DELETE', 'OPTIONS']) });
}

/**
 * DELETE /api/extension/delete-job
 * 
 * Deletes a saved job. Supports both API jobs and local-only jobs.
 */
export async function DELETE(req: NextRequest) {
    const corsHeaders = buildExtensionCorsHeaders(req, ['DELETE', 'OPTIONS']);

    if (!isLaunchFlagEnabled('extensionSync')) {
        return NextResponse.json(
            { success: false, errorCode: 'FEATURE_DISABLED', error: 'Extension sync is temporarily unavailable.' },
            { status: 503, headers: corsHeaders }
        );
    }

    try {
        const { searchParams } = new URL(req.url);
        const jobId = searchParams.get('id');

        if (!jobId) {
            return NextResponse.json(
                { success: false, errorCode: 'MISSING_ID', error: 'Missing job ID' },
                { status: 400, headers: corsHeaders }
            );
        }

        const supabase = await createSupabaseServerClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            // For local-only jobs, just return success (extension handles local deletion)
            return NextResponse.json({
                success: true,
                deleted: jobId,
                local: true,
            }, { headers: corsHeaders });
        }

        // Delete from saved_jobs table
        const { error: deleteError } = await supabase
            .from('saved_jobs')
            .delete()
            .eq('user_id', user.id)
            .or(`id.eq.${jobId},external_id.eq.${jobId}`);

        if (deleteError) {
            console.error('[Extension] Delete job error:', deleteError);
            return NextResponse.json(
                { success: false, errorCode: 'DELETE_FAILED', error: 'Failed to delete job' },
                { status: 500, headers: corsHeaders }
            );
        }

        return NextResponse.json({
            success: true,
            deleted: jobId,
        }, { headers: corsHeaders });

    } catch (error) {
        console.error('[Extension] Delete job error:', error);
        return NextResponse.json(
            { success: false, errorCode: 'INTERNAL_ERROR', error: 'Internal server error' },
            { status: 500, headers: corsHeaders }
        );
    }
}
