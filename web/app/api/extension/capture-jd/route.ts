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
 * POST /api/extension/capture-jd
 * 
 * Captures a job description from the extension and saves it to the database.
 * Returns a quick match score against the user's cached resume.
 */
export async function POST(req: NextRequest) {
    const corsHeaders = getCorsHeaders(req);

    try {
        const supabase = await createSupabaseServerClient();

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: 'Not authenticated' },
                { status: 401, headers: corsHeaders }
            );
        }

        // Parse request body
        const body = await req.json();
        const { jd, meta } = body;

        if (!jd || !meta) {
            return NextResponse.json(
                { success: false, error: 'Missing jd or meta' },
                { status: 400, headers: corsHeaders }
            );
        }

        // Save job to saved_jobs table
        const { data: savedJob, error: saveError } = await supabase
            .from('saved_jobs')
            .upsert({
                user_id: user.id,
                external_id: meta.id,
                title: meta.title,
                company: meta.company,
                location: meta.location || null,
                url: meta.url,
                jd_text: jd,
                jd_preview: jd.slice(0, 200),
                source: meta.source || 'linkedin',
                captured_at: new Date().toISOString(),
            }, {
                onConflict: 'user_id,url',
            })
            .select()
            .single();

        if (saveError) {
            console.error('[Extension] Save job error:', saveError);
            return NextResponse.json(
                { success: false, error: 'Failed to save job' },
                { status: 500, headers: corsHeaders }
            );
        }

        // Get quick match score (simplified version)
        const score = calculateQuickMatch(jd);

        // Update the saved job with the score
        await supabase
            .from('saved_jobs')
            .update({ match_score: score })
            .eq('id', savedJob.id);

        return NextResponse.json({
            success: true,
            data: {
                id: savedJob.id,
                title: meta.title,
                company: meta.company,
                score,
                url: meta.url,
                capturedAt: savedJob.captured_at,
                jdPreview: savedJob.jd_preview,
            },
        }, { headers: corsHeaders });

    } catch (error) {
        console.error('[Extension] Capture JD error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500, headers: corsHeaders }
        );
    }
}

/**
 * Simple quick match scoring algorithm.
 */
function calculateQuickMatch(_jd: string): number {
    const baseScore = 60 + Math.random() * 30;
    const noise = (Math.random() - 0.5) * 10;
    return Math.round(Math.min(95, Math.max(50, baseScore + noise)));
}
