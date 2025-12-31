import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/serverClient";
import { createEmbedding } from "@/lib/matching/embedding-service";
import { extractSkillsFromText, extractSeniority } from "@/lib/matching/skill-engine";
import crypto from "crypto";

// POST: Save default resume profile
export async function POST(request: NextRequest) {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { resumeText } = await request.json();

        if (!resumeText || typeof resumeText !== "string") {
            return NextResponse.json(
                { success: false, error: "Resume text is required" },
                { status: 400 }
            );
        }

        if (resumeText.length < 100) {
            return NextResponse.json(
                { success: false, error: "Resume text too short (minimum 100 characters)" },
                { status: 400 }
            );
        }

        // 1. Extract skills using shared multi-industry engine (250+ patterns)
        const resumeSkills = extractSkillsFromText(resumeText);
        const skillsIndex = Array.from(resumeSkills.entries()).map(([skill, { weight, category }]) => ({
            skill,
            weight,
            category,
        })).sort((a, b) => b.weight - a.weight);

        // 2. Extract seniority signals
        const senioritySignals = extractSeniority(resumeText);

        // 3. Compute embedding (optional - may fail if no API key)
        let embedding: number[] | null = null;
        const embeddingResult = await createEmbedding(resumeText);
        if (embeddingResult) {
            embedding = embeddingResult.embedding;
        }

        // 4. Compute hash and preview
        const resumeHash = crypto
            .createHash("sha256")
            .update(resumeText)
            .digest("hex");
        const resumePreview = resumeText.slice(0, 200).replace(/\s+/g, " ").trim();

        // 5. Upsert user profile (including full resume text for matching)
        const { data, error } = await supabase
            .from("user_profiles")
            .upsert({
                user_id: user.id,
                resume_text: resumeText,  // CRITICAL: Save full text for matching
                skills_index: skillsIndex,
                seniority_signals: senioritySignals,
                resume_embedding: embedding,
                resume_preview: resumePreview,
                resume_hash: resumeHash,
                resume_updated_at: new Date().toISOString(),
            }, {
                onConflict: "user_id",
            })
            .select()
            .single();

        if (error) {
            console.error("[DefaultResume] Upsert error:", error);
            // Provide more detail to help diagnose the issue
            const errorMessage = error.code === '42P01'
                ? "Database table 'user_profiles' doesn't exist. Run the migration in database/migrations/003_user_resume_profiles.sql"
                : error.code === '42501'
                    ? "Database permission denied. Check RLS policies on user_profiles table."
                    : `Failed to save resume profile: ${error.message}`;
            return NextResponse.json(
                { success: false, error: errorMessage, code: error.code },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                resumePreview: data.resume_preview,
                updatedAt: data.resume_updated_at,
                skillsCount: skillsIndex.length,
                hasEmbedding: embedding !== null,
            },
        });
    } catch (error) {
        console.error("[DefaultResume] Error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}

// GET: Check default resume status
export async function GET() {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { data: profile, error } = await supabase
            .from("user_profiles")
            .select("resume_preview, resume_updated_at, skills_index, resume_embedding")
            .eq("user_id", user.id)
            .single();

        if (error && error.code !== "PGRST116") {
            // PGRST116 = no rows found (expected for new users)
            console.error("[DefaultResume] Fetch error:", error);
            return NextResponse.json(
                { success: false, error: "Failed to fetch profile" },
                { status: 500 }
            );
        }

        if (!profile) {
            return NextResponse.json({
                success: true,
                data: { hasResume: false },
            });
        }

        return NextResponse.json({
            success: true,
            data: {
                hasResume: true,
                resumePreview: profile.resume_preview,
                updatedAt: profile.resume_updated_at,
                skillsCount: Array.isArray(profile.skills_index)
                    ? profile.skills_index.length
                    : 0,
                hasEmbedding: profile.resume_embedding !== null,
            },
        });
    } catch (error) {
        console.error("[DefaultResume] Error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
