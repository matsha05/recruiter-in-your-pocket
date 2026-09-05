import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/serverClient";
import { createEmbedding } from "@/lib/matching/embedding-service";
import { extractSkillsFromText, extractSeniority } from "@/lib/matching/skill-engine";
import { hashForLogs } from "@/lib/observability/logger";
import { rateLimitAsync } from "@/lib/security/rateLimit";
import { readJsonWithLimit } from "@/lib/security/requestBody";
import crypto from "crypto";

const MAX_RESUME_CHARACTERS = 30_000;
const MAX_FILENAME_CHARACTERS = 255;

// POST: Save default resume profile
export async function POST(request: NextRequest) {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: "Sign in to manage your default resume." },
                { status: 401 }
            );
        }

        const writeLimit = await rateLimitAsync(
            `user:${hashForLogs(user.id)}:default-resume-write`,
            5,
            60 * 60 * 1000,
        );
        if (!writeLimit.ok) {
            const response = NextResponse.json(
                { success: false, error: "Too many resume updates. Try again later." },
                { status: 429 },
            );
            response.headers.set("retry-after", String(Math.ceil(writeLimit.resetMs / 1000)));
            return response;
        }

        const body = await readJsonWithLimit<any>(request, 128 * 1024);
        const resumeText = typeof body?.resumeText === "string" ? body.resumeText.trim() : "";
        const filename = body?.filename;

        if (!resumeText) {
            return NextResponse.json(
                { success: false, error: "Add your resume text before saving." },
                { status: 400 }
            );
        }

        if (resumeText.length < 100) {
            return NextResponse.json(
                { success: false, error: "Add at least 100 characters of resume text." },
                { status: 400 }
            );
        }

        if (resumeText.length > MAX_RESUME_CHARACTERS) {
            return NextResponse.json(
                { success: false, error: "Keep your resume text to 30,000 characters or fewer." },
                { status: 400 }
            );
        }

        if (
            filename !== undefined &&
            filename !== null &&
            (typeof filename !== "string" || filename.trim().length > MAX_FILENAME_CHARACTERS)
        ) {
            return NextResponse.json(
                { success: false, error: "Filename must be 255 characters or fewer" },
                { status: 400 }
            );
        }

        const normalizedFilename = typeof filename === "string" && filename.trim()
            ? filename.trim()
            : null;
        const resumeHash = crypto
            .createHash("sha256")
            .update(resumeText)
            .digest("hex");

        // Avoid another paid embedding call when the stored resume body is
        // unchanged. Filename-only updates remain cheap and idempotent.
        const { data: existingProfile, error: existingProfileError } = await supabase
            .from("user_profiles")
            .select("resume_hash, resume_preview, resume_filename, resume_updated_at, skills_index, resume_embedding")
            .eq("user_id", user.id)
            .maybeSingle();
        if (existingProfileError) {
            return NextResponse.json(
                { success: false, error: "Could not check your saved resume. Try again." },
                { status: 500 }
            );
        }

        if (existingProfile?.resume_hash === resumeHash) {
            const nextFilename = normalizedFilename ?? existingProfile.resume_filename ?? null;
            if (nextFilename !== existingProfile.resume_filename) {
                const { error: filenameError } = await supabase
                    .from("user_profiles")
                    .update({ resume_filename: nextFilename })
                    .eq("user_id", user.id);
                if (filenameError) {
                    return NextResponse.json(
                        { success: false, error: "Could not rename your resume. Try again." },
                        { status: 500 }
                    );
                }
            }

            return NextResponse.json({
                success: true,
                data: {
                    resumePreview: existingProfile.resume_preview,
                    resumeFilename: nextFilename,
                    updatedAt: existingProfile.resume_updated_at,
                    skillsCount: Array.isArray(existingProfile.skills_index)
                        ? existingProfile.skills_index.length
                        : 0,
                    hasEmbedding: existingProfile.resume_embedding !== null,
                    unchanged: true,
                },
            });
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

        // 4. Compute preview
        const resumePreview = resumeText.slice(0, 200).replace(/\s+/g, " ").trim();

        // 5. Upsert user profile (including full resume text for matching)
        const { data, error } = await supabase
            .from("user_profiles")
            .upsert({
                user_id: user.id,
                resume_text: resumeText,  // CRITICAL: Save full text for matching
                resume_filename: normalizedFilename,  // Store filename for display
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
            const errorMessage = "Could not save your default resume. Try again. If this continues, contact support.";
            return NextResponse.json(
                { success: false, error: errorMessage, code: error.code },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                resumePreview: data.resume_preview,
                resumeFilename: data.resume_filename,
                updatedAt: data.resume_updated_at,
                skillsCount: skillsIndex.length,
                hasEmbedding: embedding !== null,
            },
        });
    } catch (error: any) {
        console.error("[DefaultResume] Error:", error);
        const requestStatus = Number(error?.httpStatus);
        return NextResponse.json(
            {
                success: false,
                error: requestStatus === 413
                    ? "Request body too large"
                    : requestStatus === 400
                        ? "Invalid request body"
                        : "Could not access your default resume. Refresh the page and try again.",
            },
            { status: requestStatus === 400 || requestStatus === 413 ? requestStatus : 500 }
        );
    }
}

// GET: Check default resume status
export async function GET(request: NextRequest) {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: "Sign in to manage your default resume." },
                { status: 401 }
            );
        }

        const includeText = request.nextUrl.searchParams.get("includeText") === "1";
        const selectFields = includeText
            ? "resume_preview, resume_filename, resume_updated_at, skills_index, resume_embedding, resume_text"
            : "resume_preview, resume_filename, resume_updated_at, skills_index, resume_embedding";

        const { data: profile, error } = await supabase
            .from("user_profiles")
            .select(selectFields)
            .eq("user_id", user.id)
            .single();

        if (error && error.code !== "PGRST116") {
            // PGRST116 = no rows found (expected for new users)
            console.error("[DefaultResume] Fetch error:", error);
            return NextResponse.json(
                { success: false, error: "Could not load your default resume. Try again." },
                { status: 500 }
            );
        }

        if (!profile) {
            return NextResponse.json({
                success: true,
                data: { hasResume: false },
            });
        }

        const profileRecord = profile as any;

        return NextResponse.json({
            success: true,
            data: {
                hasResume: true,
                resumePreview: profileRecord.resume_preview,
                resumeFilename: profileRecord.resume_filename,
                updatedAt: profileRecord.resume_updated_at,
                skillsCount: Array.isArray(profileRecord.skills_index)
                    ? profileRecord.skills_index.length
                    : 0,
                hasEmbedding: profileRecord.resume_embedding !== null,
                ...(includeText ? { resumeText: profileRecord.resume_text || "" } : {}),
            },
        });
    } catch (error) {
        console.error("[DefaultResume] Error:", error);
        return NextResponse.json(
            { success: false, error: "Could not access your default resume. Refresh the page and try again." },
            { status: 500 }
        );
    }
}

// PATCH: Update resume filename
export async function PATCH(request: NextRequest) {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: "Sign in to manage your default resume." },
                { status: 401 }
            );
        }

        const { filename } = await readJsonWithLimit<any>(request, 16 * 1024);

        if (
            !filename ||
            typeof filename !== "string" ||
            filename.trim().length > MAX_FILENAME_CHARACTERS
        ) {
            return NextResponse.json(
                { success: false, error: "Filename is required and must be 255 characters or fewer" },
                { status: 400 }
            );
        }

        const { error } = await supabase
            .from("user_profiles")
            .update({ resume_filename: filename.trim() })
            .eq("user_id", user.id);

        if (error) {
            console.error("[DefaultResume] Update error:", error);
            return NextResponse.json(
                { success: false, error: "Could not rename your resume. Try again." },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("[DefaultResume] Error:", error);
        const requestStatus = Number(error?.httpStatus);
        return NextResponse.json(
            {
                success: false,
                error: requestStatus === 413
                    ? "Request body too large"
                    : requestStatus === 400
                        ? "Invalid request body"
                        : "Could not access your default resume. Refresh the page and try again.",
            },
            { status: requestStatus === 400 || requestStatus === 413 ? requestStatus : 500 }
        );
    }
}

// DELETE: Remove default resume profile
export async function DELETE() {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: "Sign in to manage your default resume." },
                { status: 401 }
            );
        }

        const { error } = await supabase
            .from("user_profiles")
            .delete()
            .eq("user_id", user.id);

        if (error) {
            console.error("[DefaultResume] Delete error:", error);
            return NextResponse.json(
                { success: false, error: "Could not remove your default resume. Try again." },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[DefaultResume] Error:", error);
        return NextResponse.json(
            { success: false, error: "Could not access your default resume. Refresh the page and try again." },
            { status: 500 }
        );
    }
}
