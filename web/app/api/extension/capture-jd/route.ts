import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/serverClient';
import { quickMatch, extractSkillsFromText, extractSeniority } from '@/lib/matching/skill-engine';
import { createEmbedding } from '@/lib/matching/embedding-service';

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
 * Returns a hybrid match score against the user's saved resume profile.
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

        // Get user's resume profile for matching
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('resume_text, skills_index, seniority_signals, resume_embedding')
            .eq('user_id', user.id)
            .single();

        let matchResult = null;
        let score: number | null = null;
        let topGaps: string[] = [];
        let matchedSkills: string[] = [];
        let missingSkills: string[] = [];

        if (profile) {
            // Use actual resume text if available, otherwise fallback to skills list
            let resumeText = profile.resume_text as string | null;

            if (!resumeText && profile.skills_index) {
                // Fallback: reconstruct from skills if no resume text stored
                const resumeSkillsList = (profile.skills_index as any[])
                    .map(s => s.skill)
                    .join(', ');
                const resumeYears = (profile.seniority_signals as any)?.yearsEstimate;
                const resumeLevel = (profile.seniority_signals as any)?.levelHints || [];
                resumeText = `Skills: ${resumeSkillsList}. ${resumeYears ? `${resumeYears} years experience.` : ''} ${resumeLevel.length ? `Level: ${resumeLevel.join(', ')}` : ''}`;
            }

            if (resumeText) {
                // Try to get JD embedding for semantic matching
                let jdEmbedding: number[] | undefined;
                if (profile.resume_embedding) {
                    const embeddingResult = await createEmbedding(jd);
                    if (embeddingResult) {
                        jdEmbedding = embeddingResult.embedding;
                    }
                }

                // Run hybrid matching against ACTUAL resume text
                matchResult = quickMatch(
                    resumeText,
                    jd,
                    profile.resume_embedding as number[] | undefined,
                    jdEmbedding
                );

                score = matchResult.score;
                topGaps = matchResult.topGaps;
                matchedSkills = matchResult.matchedSkills;
                missingSkills = matchResult.missingSkills;

                // Update the saved job with match data
                await supabase
                    .from('saved_jobs')
                    .update({
                        match_score: score,
                        matched_skills: matchedSkills,
                        missing_skills: missingSkills,
                        top_gaps: topGaps,
                    })
                    .eq('id', savedJob.id);
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                id: savedJob.id,
                title: meta.title,
                company: meta.company,
                score,
                hasResume: !!profile,
                topGaps,
                matchedSkillsCount: matchedSkills.length,
                missingSkillsCount: missingSkills.length,
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
