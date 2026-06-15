import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/serverClient';
import { quickMatch } from '@/lib/matching/skill-engine';
import { createEmbedding } from '@/lib/matching/embedding-service';
import { buildExtensionCorsHeaders } from '@/lib/extension/cors';
import { isLaunchFlagEnabled } from '@/lib/launch/flags';

export async function OPTIONS(req: NextRequest) {
    return NextResponse.json({}, { headers: buildExtensionCorsHeaders(req, ['POST', 'OPTIONS']) });
}

/**
 * POST /api/extension/capture-jd
 * 
 * Captures a job description from the extension and saves it to the database.
 * Returns a hybrid match score against the user's saved resume profile.
 */
export async function POST(req: NextRequest) {
    const corsHeaders = buildExtensionCorsHeaders(req, ['POST', 'OPTIONS']);

    if (!isLaunchFlagEnabled('extensionSync')) {
        return NextResponse.json(
            { success: false, errorCode: 'FEATURE_DISABLED', error: 'Extension sync is temporarily unavailable.' },
            { status: 503, headers: corsHeaders }
        );
    }

    try {
        const supabase = await createSupabaseServerClient();

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { success: false, errorCode: 'AUTH_REQUIRED', error: 'Not authenticated' },
                { status: 401, headers: corsHeaders }
            );
        }

        // Parse request body
        const body = await req.json();
        const { jd, meta } = body;

        if (!jd || !meta) {
            return NextResponse.json(
                { success: false, errorCode: 'INVALID_REQUEST', error: 'Missing jd or meta' },
                { status: 400, headers: corsHeaders }
            );
        }

        const source = meta.source || 'linkedin';
        const externalJobId = typeof meta.id === 'string' && meta.id.trim() ? meta.id.trim() : null;
        const normalizedIncomingUrl = normalizeJobUrl(meta.url);
        const savedJobPayload = {
            user_id: user.id,
            ...(externalJobId ? { external_id: externalJobId } : {}),
            title: meta.title,
            company: meta.company,
            location: meta.location || null,
            url: meta.url,
            jd_text: jd,
            jd_preview: jd.slice(0, 200),
            source,
            captured_at: new Date().toISOString(),
        };

        const existingSavedJobId = await findExistingSavedJobId({
            supabase,
            userId: user.id,
            source,
            externalJobId,
            normalizedUrl: normalizedIncomingUrl,
        });

        const saveResult = existingSavedJobId
            ? await supabase
                .from('saved_jobs')
                .update(savedJobPayload)
                .eq('id', existingSavedJobId)
                .select()
                .single()
            : await supabase
                .from('saved_jobs')
                .upsert(savedJobPayload, {
                    onConflict: 'user_id,url',
                })
                .select()
                .single();

        const { data: savedJob, error: saveError } = saveResult;

        if (saveError) {
            console.error('[Extension] Save job error:', saveError);
            return NextResponse.json(
                { success: false, errorCode: 'SAVE_FAILED', error: 'Failed to save job' },
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
                externalId: savedJob.external_id,
                title: meta.title,
                company: meta.company,
                location: meta.location || null,
                score,
                hasResume: !!profile,
                topGaps,
                matchedSkillsCount: matchedSkills.length,
                missingSkillsCount: missingSkills.length,
                url: meta.url,
                capturedAt: new Date(savedJob.captured_at).getTime(),
                jdPreview: savedJob.jd_preview,
                source: savedJob.source,
                status: 'saved',
            },
        }, { headers: corsHeaders });

    } catch (error) {
        console.error('[Extension] Capture JD error:', error);
        return NextResponse.json(
            { success: false, errorCode: 'INTERNAL_ERROR', error: 'Internal server error' },
            { status: 500, headers: corsHeaders }
        );
    }
}

async function findExistingSavedJobId({
    supabase,
    userId,
    source,
    externalJobId,
    normalizedUrl,
}: {
    supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
    userId: string;
    source: string;
    externalJobId: string | null;
    normalizedUrl: string;
}): Promise<string | null> {
    if (externalJobId) {
        const { data, error } = await supabase
            .from('saved_jobs')
            .select('id')
            .eq('user_id', userId)
            .eq('source', source)
            .eq('external_id', externalJobId)
            .order('captured_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (!error && data?.id) {
            return data.id;
        }
    }

    const { data: candidates, error } = await supabase
        .from('saved_jobs')
        .select('id, url')
        .eq('user_id', userId)
        .eq('source', source)
        .order('captured_at', { ascending: false })
        .limit(100);

    if (error || !candidates) {
        return null;
    }

    const existing = candidates.find((job) => normalizeJobUrl(String(job.url ?? '')) === normalizedUrl);
    return existing?.id ?? null;
}

function normalizeJobUrl(url: string): string {
    try {
        const parsedUrl = new URL(url);
        parsedUrl.hash = '';

        const params = new URLSearchParams(parsedUrl.search);
        for (const key of Array.from(params.keys())) {
            const normalizedKey = key.toLowerCase();
            if (
                normalizedKey.startsWith('utm_')
                || normalizedKey === 'trk'
                || normalizedKey === 'refid'
                || normalizedKey === 'ref'
                || normalizedKey === 'trackingid'
            ) {
                params.delete(key);
            }
        }

        params.sort();
        parsedUrl.search = params.toString();
        parsedUrl.pathname = parsedUrl.pathname.replace(/\/+$/, '');
        return parsedUrl.toString();
    } catch {
        return url.trim();
    }
}
