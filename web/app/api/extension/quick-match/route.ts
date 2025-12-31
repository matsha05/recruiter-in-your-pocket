import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/serverClient";
import { quickMatch, extractSkillsFromText, extractSeniority } from "@/lib/matching/skill-engine";
import { createEmbedding } from "@/lib/matching/embedding-service";

// CORS headers for extension
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        // Get request body
        const { jdText, savedJobId } = await request.json();

        if (!jdText || typeof jdText !== "string") {
            return NextResponse.json(
                { success: false, error: "Job description text is required" },
                { status: 400, headers: corsHeaders }
            );
        }

        // If not authenticated, return keyword-only score with no resume
        if (authError || !user) {
            const jdSkills = extractSkillsFromText(jdText);
            const jdSeniority = extractSeniority(jdText);

            return NextResponse.json({
                success: true,
                data: {
                    score: null, // No score without resume
                    hasResume: false,
                    jdSkillsCount: jdSkills.size,
                    seniorityRequired: jdSeniority.yearsEstimate,
                    message: "Sign in and save a resume to see your match score",
                },
            }, { headers: corsHeaders });
        }

        // Fetch user's resume profile
        const { data: profile, error: profileError } = await supabase
            .from("user_profiles")
            .select("skills_index, seniority_signals, resume_embedding, resume_preview")
            .eq("user_id", user.id)
            .single();

        if (profileError || !profile) {
            const jdSkills = extractSkillsFromText(jdText);

            return NextResponse.json({
                success: true,
                data: {
                    score: null,
                    hasResume: false,
                    jdSkillsCount: jdSkills.size,
                    message: "Save a resume in Settings to see match scores",
                },
            }, { headers: corsHeaders });
        }

        // Reconstruct resume skills map from stored index
        const resumeSkillsMap = new Map<string, { weight: number; category: string }>();
        if (Array.isArray(profile.skills_index)) {
            for (const item of profile.skills_index) {
                if (item && typeof item === "object" && "skill" in item) {
                    resumeSkillsMap.set(item.skill, {
                        weight: item.weight || 5,
                        category: item.category || "other"
                    });
                }
            }
        }

        // Build resume text approximation for matching
        // (We don't store raw text, so we use skills list)
        const resumeSkillsList = Array.from(resumeSkillsMap.keys()).join(", ");
        const resumeYears = (profile.seniority_signals as any)?.yearsEstimate;
        const resumeLevelHints = (profile.seniority_signals as any)?.levelHints || [];
        const resumeTextApprox = `Skills: ${resumeSkillsList}. ${resumeYears ? `${resumeYears} years experience.` : ""} ${resumeLevelHints.length ? `Level: ${resumeLevelHints.join(", ")}` : ""}`;

        // Compute JD embedding (with caching check)
        let jdEmbedding: number[] | undefined;
        let semanticScoreAvailable = false;

        // Only compute embedding if resume has one and JD is short enough
        if (profile.resume_embedding && jdText.length < 10000) {
            try {
                const embeddingResult = await createEmbedding(jdText);
                if (embeddingResult) {
                    jdEmbedding = embeddingResult.embedding;
                    semanticScoreAvailable = true;
                }
            } catch (embeddingError) {
                console.warn("[QuickMatch] Embedding failed, using keyword-only:", embeddingError);
            }
        }

        // Run hybrid matching
        const result = quickMatch(
            resumeTextApprox,
            jdText,
            profile.resume_embedding as number[] | undefined,
            jdEmbedding
        );

        // Update saved_jobs if ID provided
        if (savedJobId) {
            await supabase
                .from("saved_jobs")
                .update({
                    score: result.score,
                    matched_skills: result.matchedSkills,
                    missing_skills: result.missingSkills,
                    top_gaps: result.topGaps,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", savedJobId)
                .eq("user_id", user.id);
        }

        return NextResponse.json({
            success: true,
            data: {
                score: result.score,
                keywordScore: result.keywordScore,
                semanticScore: result.semanticScore,
                hasSemanticScore: semanticScoreAvailable,
                matchedSkills: result.matchedSkills,
                missingSkills: result.missingSkills.slice(0, 10), // Limit for payload size
                topGaps: result.topGaps,
                seniorityFlag: result.seniorityFlag,
                hasResume: true,
            },
        }, { headers: corsHeaders });

    } catch (error) {
        console.error("[QuickMatch] Error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500, headers: corsHeaders }
        );
    }
}
