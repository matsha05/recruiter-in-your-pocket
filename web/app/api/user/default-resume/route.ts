import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/serverClient";
import OpenAI from "openai";
import crypto from "crypto";

const openai = new OpenAI();

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

        // 1. Extract skills and signals
        const { skillsIndex, senioritySignals } = extractResumeFeatures(resumeText);

        // 2. Compute embedding
        const embeddingResponse = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: resumeText.slice(0, 8000), // Limit input length
        });
        const embedding = embeddingResponse.data[0].embedding;

        // 3. Compute hash and preview
        const resumeHash = crypto
            .createHash("sha256")
            .update(resumeText)
            .digest("hex");
        const resumePreview = resumeText.slice(0, 200).replace(/\s+/g, " ").trim();

        // 4. Upsert user profile
        const { data, error } = await supabase
            .from("user_profiles")
            .upsert({
                user_id: user.id,
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
            return NextResponse.json(
                { success: false, error: "Failed to save resume profile" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                resumePreview: data.resume_preview,
                updatedAt: data.resume_updated_at,
                skillsCount: skillsIndex.length,
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
            .select("resume_preview, resume_updated_at, skills_index")
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

// Skill extraction using basic patterns (Phase 12.2 will enhance this)
function extractResumeFeatures(text: string): {
    skillsIndex: Array<{ skill: string; weight: number }>;
    senioritySignals: { yearsEstimate: number | null; levelHints: string[] };
} {
    const lowerText = text.toLowerCase();

    // Common tech skills dictionary with weights
    const skillPatterns: Array<{ pattern: RegExp; skill: string; weight: number }> = [
        // Programming Languages
        { pattern: /\bpython\b/gi, skill: "Python", weight: 10 },
        { pattern: /\bjavascript\b|\bjs\b/gi, skill: "JavaScript", weight: 10 },
        { pattern: /\btypescript\b|\bts\b/gi, skill: "TypeScript", weight: 10 },
        { pattern: /\bjava\b/gi, skill: "Java", weight: 10 },
        { pattern: /\bc\+\+\b|\bcpp\b/gi, skill: "C++", weight: 10 },
        { pattern: /\bc#\b|\bcsharp\b/gi, skill: "C#", weight: 10 },
        { pattern: /\bruby\b/gi, skill: "Ruby", weight: 8 },
        { pattern: /\bgo\b|\bgolang\b/gi, skill: "Go", weight: 9 },
        { pattern: /\brust\b/gi, skill: "Rust", weight: 9 },
        { pattern: /\bswift\b/gi, skill: "Swift", weight: 8 },
        { pattern: /\bkotlin\b/gi, skill: "Kotlin", weight: 8 },

        // Frameworks
        { pattern: /\breact\b/gi, skill: "React", weight: 10 },
        { pattern: /\bnext\.?js\b/gi, skill: "Next.js", weight: 9 },
        { pattern: /\bvue\b/gi, skill: "Vue", weight: 9 },
        { pattern: /\bangular\b/gi, skill: "Angular", weight: 9 },
        { pattern: /\bnode\.?js\b|\bnode\b/gi, skill: "Node.js", weight: 10 },
        { pattern: /\bexpress\b/gi, skill: "Express", weight: 7 },
        { pattern: /\bdjango\b/gi, skill: "Django", weight: 8 },
        { pattern: /\bflask\b/gi, skill: "Flask", weight: 7 },
        { pattern: /\brails\b/gi, skill: "Rails", weight: 8 },
        { pattern: /\bspring\b/gi, skill: "Spring", weight: 8 },

        // Cloud/Infra
        { pattern: /\baws\b|\bamazon web services\b/gi, skill: "AWS", weight: 10 },
        { pattern: /\bgcp\b|\bgoogle cloud\b/gi, skill: "GCP", weight: 9 },
        { pattern: /\bazure\b/gi, skill: "Azure", weight: 9 },
        { pattern: /\bdocker\b/gi, skill: "Docker", weight: 9 },
        { pattern: /\bkubernetes\b|\bk8s\b/gi, skill: "Kubernetes", weight: 10 },
        { pattern: /\bterraform\b/gi, skill: "Terraform", weight: 9 },

        // Databases
        { pattern: /\bpostgres(ql)?\b/gi, skill: "PostgreSQL", weight: 9 },
        { pattern: /\bmysql\b/gi, skill: "MySQL", weight: 8 },
        { pattern: /\bmongodb\b|\bmongo\b/gi, skill: "MongoDB", weight: 8 },
        { pattern: /\bredis\b/gi, skill: "Redis", weight: 8 },
        { pattern: /\bsql\b/gi, skill: "SQL", weight: 9 },

        // AI/ML
        { pattern: /\bmachine learning\b|\bml\b/gi, skill: "Machine Learning", weight: 10 },
        { pattern: /\bdeep learning\b/gi, skill: "Deep Learning", weight: 10 },
        { pattern: /\btensorflow\b/gi, skill: "TensorFlow", weight: 9 },
        { pattern: /\bpytorch\b/gi, skill: "PyTorch", weight: 9 },

        // Soft skills / Methods
        { pattern: /\bagile\b/gi, skill: "Agile", weight: 6 },
        { pattern: /\bscrum\b/gi, skill: "Scrum", weight: 6 },
        { pattern: /\bci\/cd\b/gi, skill: "CI/CD", weight: 8 },
        { pattern: /\bgit\b/gi, skill: "Git", weight: 7 },
    ];

    // Extract matching skills
    const foundSkills: Map<string, number> = new Map();
    for (const { pattern, skill, weight } of skillPatterns) {
        const matches = text.match(pattern);
        if (matches) {
            // Weight increases with frequency (capped)
            const count = Math.min(matches.length, 3);
            foundSkills.set(skill, weight + (count - 1) * 2);
        }
    }

    const skillsIndex = Array.from(foundSkills.entries())
        .map(([skill, weight]) => ({ skill, weight }))
        .sort((a, b) => b.weight - a.weight);

    // Extract seniority signals
    const yearsPatterns = [
        /(\d+)\+?\s*years?\s*(?:of\s+)?(?:experience|exp)/gi,
        /(?:experience|exp)[:\s]*(\d+)\+?\s*years?/gi,
    ];

    let yearsEstimate: number | null = null;
    for (const pattern of yearsPatterns) {
        const match = pattern.exec(text);
        if (match) {
            yearsEstimate = parseInt(match[1], 10);
            break;
        }
    }

    const levelHints: string[] = [];
    if (/\b(senior|sr\.?|lead)\b/i.test(text)) levelHints.push("senior");
    if (/\b(principal|staff)\b/i.test(text)) levelHints.push("principal");
    if (/\b(manager|director|head of)\b/i.test(text)) levelHints.push("management");
    if (/\b(junior|jr\.?|entry)\b/i.test(text)) levelHints.push("junior");

    return {
        skillsIndex,
        senioritySignals: { yearsEstimate, levelHints },
    };
}
