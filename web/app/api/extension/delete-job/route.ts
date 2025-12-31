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
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
}

export async function OPTIONS(req: NextRequest) {
    return NextResponse.json({}, { headers: getCorsHeaders(req) });
}

/**
 * DELETE /api/extension/delete-job
 * 
 * Deletes a saved job. Supports both API jobs and local-only jobs.
 */
export async function DELETE(req: NextRequest) {
    const corsHeaders = getCorsHeaders(req);

    try {
        const { searchParams } = new URL(req.url);
        const jobId = searchParams.get('id');

        if (!jobId) {
            return NextResponse.json(
                { success: false, error: 'Missing job ID' },
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
                { success: false, error: 'Failed to delete job' },
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
            { success: false, error: 'Internal server error' },
            { status: 500, headers: corsHeaders }
        );
    }
}
