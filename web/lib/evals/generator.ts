/**
 * Synthetic Resume Generator
 * 
 * Creates diverse, realistic test resumes by combining:
 * - Role archetypes (PM, Engineer, Designer, etc.)
 * - Seniority levels (Entry, Mid, Senior, Director, VP)
 * - Quality tiers (Elite, Strong, Foundation, Weak)
 * - Edge cases (career changers, gaps, non-traditional paths)
 * - Format variations (summaries, skills sections, date formats)
 */

import * as fs from "fs/promises";
import * as path from "path";

// ============================================
// ARCHETYPE DEFINITIONS
// ============================================

export const ROLE_ARCHETYPES = [
    "product_manager",
    "software_engineer",
    "data_scientist",
    "ux_designer",
    "marketing_manager",
    "operations_manager",
    "sales_executive",
    "finance_analyst",
    "hr_manager",
    "project_manager",
] as const;

export const SENIORITY_LEVELS = [
    "entry",      // 0-2 years
    "mid",        // 3-5 years
    "senior",     // 6-10 years
    "director",   // 10-15 years
    "vp",         // 15+ years
] as const;

export const QUALITY_TIERS = [
    "elite",      // 90+ score expected - specific metrics, clear impact
    "strong",     // 80-89 score expected - good foundation, some specificity
    "foundation", // 70-79 score expected - decent but generic
    "weak",       // 50-69 score expected - vague, lacks impact
] as const;

export const EDGE_CASES = [
    // Career transitions
    "career_changer",        // Switching industries entirely
    "lateral_move",          // Same level, different function

    // Gaps and breaks
    "employment_gap",        // 1+ year unexplained gap
    "returning_parent",      // Career break for family, now returning
    "sabbatical",            // Intentional break for travel/learning
    "layoff_recovery",       // Recently laid off, job hunting

    // Non-traditional paths
    "non_traditional",       // Bootcamp, self-taught, no degree
    "new_grad",              // Recent graduate, limited experience
    "phd_to_industry",       // Academic background transitioning to industry
    "military_veteran",      // Translating military to civilian

    // Experience mismatches
    "overqualified",         // Too senior for target role
    "underqualified",        // Reaching for stretch role
    "freelancer",            // Contract/freelance background, now seeking FTE
    "consultant",            // Agency/consulting, moving to in-house

    // Demographics and situations
    "international",         // Non-US experience, may need visa
    "remote_only",           // Only remote experience, location flexible
    "industry_decline",      // From declining industry (print, retail)
    "startup_refugee",       // Multiple short stints from failed startups
] as const;

// Format variations for realistic diversity
export const FORMAT_VARIATIONS = [
    "with_summary",         // Has a summary/objective section
    "no_summary",           // Jumps straight to experience
    "with_skills",          // Has a dedicated skills section
    "skills_inline",        // Skills mentioned within experience
    "month_year_dates",     // "January 2020 - Present"
    "abbreviated_dates",    // "Jan 2020 - Present"  
    "year_only_dates",      // "2020 - Present"
    "bullets_heavy",        // Many bullet points per role
    "bullets_light",        // Few bullet points, more prose
] as const;

export type RoleArchetype = typeof ROLE_ARCHETYPES[number];
export type SeniorityLevel = typeof SENIORITY_LEVELS[number];
export type QualityTier = typeof QUALITY_TIERS[number];
export type EdgeCase = typeof EDGE_CASES[number];
export type FormatVariation = typeof FORMAT_VARIATIONS[number];

export interface SyntheticResumeSpec {
    role: RoleArchetype;
    seniority: SeniorityLevel;
    quality: QualityTier;
    edgeCase?: EdgeCase;
    formatHints?: FormatVariation[]; // Random subset applied
}

export interface GeneratedResume {
    id: string;
    spec: SyntheticResumeSpec;
    text: string;
    expectedScoreRange: [number, number];
    generatedAt: string;
}

// ============================================
// GENERATOR PROMPT
// ============================================

function buildGeneratorPrompt(spec: SyntheticResumeSpec): string {
    const qualityGuidance: Record<QualityTier, string> = {
        elite: `This resume should be EXCELLENT. Include:
- Specific metrics (grew revenue 40%, reduced costs by $2M, shipped to 500K users)
- Clear ownership language ("I led", "I decided", "I built")
- Concrete scope (team size, budget, timeline)
- Before/after impact statements
- Domain expertise that's credible and specific`,

        strong: `This resume should be GOOD but not perfect. Include:
- Some metrics but not on every bullet
- Mostly clear ownership, occasional "we" language
- General scope mentioned but not always specific
- Impact implied but not always quantified`,

        foundation: `This resume should be AVERAGE. Include:
- Few or no metrics
- Mixed ownership language ("helped", "supported", "contributed")
- Vague scope ("multiple teams", "various projects")
- Activities described but outcomes unclear
- Some generic phrases like "strong communication skills"`,

        weak: `This resume should have CLEAR GAPS. Include:
- No metrics at all
- Passive language ("was responsible for", "duties included")
- No scope indicators
- Task lists instead of accomplishments
- Generic buzzwords ("results-driven", "team player")
- Formatting issues (inconsistent, hard to scan)`,
    };

    const seniorityContext: Record<SeniorityLevel, string> = {
        entry: "0-2 years experience, recent graduate or early career, learning-focused",
        mid: "3-5 years experience, independent contributor, some project ownership",
        senior: "6-10 years experience, technical leadership, mentoring others",
        director: "10-15 years experience, manages teams, owns budget and strategy",
        vp: "15+ years experience, executive presence, company-wide impact",
    };

    const edgeCaseContext = spec.edgeCase ? ({
        // Career transitions
        career_changer: "This person is changing industries. Show transferable skills but unfamiliar domain terminology.",
        lateral_move: "Moving to a different function at the same level (e.g., marketing to product). Show related skills.",

        // Gaps and breaks
        employment_gap: "Include a 1-2 year gap in work history (can be explained or unexplained).",
        returning_parent: "Career break for family responsibilities, now returning. Show gap from caregiving.",
        sabbatical: "Took an intentional break for travel, learning, or personal projects. Show period away.",
        layoff_recovery: "Recently laid off from a known downsizing. Looking for new opportunity.",

        // Non-traditional paths
        non_traditional: "No traditional degree. Self-taught or bootcamp background.",
        new_grad: "Recent college graduate with internships but limited full-time experience.",
        phd_to_industry: "PhD or academic background transitioning to industry. Heavy on research, light on business.",
        military_veteran: "Military background being translated to civilian roles. Use military terminology.",

        // Experience mismatches
        overqualified: "Credentials exceed typical role requirements (e.g., VP applying for senior IC role).",
        underqualified: "Reaching for a role above their experience level. Ambitious but light on credentials.",
        freelancer: "Has been freelance/contract for years. Now seeking full-time employment.",
        consultant: "Agency or consulting background. Moving to in-house product role.",

        // Demographics and situations
        international: "Experience primarily outside US. May have visa sponsorship needs.",
        remote_only: "Only remote work experience. Location flexible, no office experience.",
        industry_decline: "From a declining industry (print media, retail, coal). Needs to reposition.",
        startup_refugee: "Multiple short stints from failed startups. Looks like a job hopper but not their fault.",
    } as Record<string, string>)[spec.edgeCase] : "";

    // Build format instructions from hints
    const formatInstructions = buildFormatInstructions(spec.formatHints || []);

    return `You are a resume generator for a quality testing system. Generate a realistic resume that matches these specifications:

ROLE: ${spec.role.replace(/_/g, " ")}
SENIORITY: ${seniorityContext[spec.seniority]}
QUALITY TIER: ${spec.quality.toUpperCase()}

${qualityGuidance[spec.quality]}

${edgeCaseContext ? `SPECIAL CASE: ${edgeCaseContext}` : ""}

FORMAT REQUIREMENTS (IMPORTANT - follow these exactly):
${formatInstructions}

REALISM REQUIREMENTS:
1. Generate a COMPLETE resume as plain text (no markdown, no headers with #)
2. Use realistic but FAKE names and companies (do NOT use real people or real companies)
3. Use realistic but FAKE contact info (e.g., "john.doe@email.com", "555-000-1234")
4. Dates should look realistic - use month/year format like "January 2020 - March 2023" or "Jan 2020 - Mar 2023"
5. Include 2-4 work experience entries appropriate for the seniority level
6. Make the content feel authentic to the role and seniority
7. The resume should be 400-800 words (realistic length)
8. DO NOT include any meta-commentary, labels, or explanations - just output the resume text

OUTPUT FORMAT:
Output ONLY the resume text exactly as it would appear in a document. Start with the person's name.`;
}

function buildFormatInstructions(hints: FormatVariation[]): string {
    const instructions: string[] = [];

    // Summary section
    if (hints.includes("with_summary")) {
        instructions.push("- Include a 2-3 sentence professional summary or objective at the top after contact info");
    } else if (hints.includes("no_summary")) {
        instructions.push("- Do NOT include a summary section - go straight from contact info to experience");
    } else {
        instructions.push("- " + (Math.random() > 0.5
            ? "Include a brief professional summary"
            : "Do not include a summary section"));
    }

    // Skills section
    if (hints.includes("with_skills")) {
        instructions.push("- Include a dedicated 'Skills' section (either at top or bottom)");
    } else if (hints.includes("skills_inline")) {
        instructions.push("- Do NOT have a separate skills section - weave skills into experience bullets");
    } else {
        instructions.push("- " + (Math.random() > 0.4
            ? "Include a skills section"
            : "Mention skills within experience, no separate skills section"));
    }

    // Date format
    if (hints.includes("month_year_dates")) {
        instructions.push("- Use full month names for dates: 'January 2020 - March 2023'");
    } else if (hints.includes("abbreviated_dates")) {
        instructions.push("- Use abbreviated month names: 'Jan 2020 - Mar 2023'");
    } else if (hints.includes("year_only_dates")) {
        instructions.push("- Use year-only dates: '2020 - 2023'");
    } else {
        const dateFormat = ["January 2020 - March 2023", "Jan 2020 - Mar 2023", "01/2020 - 03/2023"][Math.floor(Math.random() * 3)];
        instructions.push(`- Use this date format: '${dateFormat}'`);
    }

    // Bullet density
    if (hints.includes("bullets_heavy")) {
        instructions.push("- Use 4-6 bullet points per job role");
    } else if (hints.includes("bullets_light")) {
        instructions.push("- Use 2-3 bullet points per job role, more concise");
    } else {
        instructions.push("- Use 3-5 bullet points per job role");
    }

    return instructions.join("\n");
}

// ============================================
// SCORE EXPECTATIONS
// ============================================

function getExpectedScoreRange(spec: SyntheticResumeSpec): [number, number] {
    const baseRanges: Record<QualityTier, [number, number]> = {
        elite: [88, 98],
        strong: [78, 88],
        foundation: [68, 78],
        weak: [45, 68],
    };

    const range = baseRanges[spec.quality];

    // Edge cases typically lower scores slightly
    if (spec.edgeCase) {
        return [range[0] - 5, range[1] - 3];
    }

    return range;
}

// ============================================
// API CALL (matching eval runner pattern)
// ============================================

async function callOpenAI(prompt: string, userMessage: string): Promise<string> {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

    if (!OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY environment variable is required");
    }

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: OPENAI_MODEL,
            temperature: 0.9, // High creativity for diversity
            max_tokens: 2000,
            messages: [
                { role: "system", content: prompt },
                { role: "user", content: userMessage }
            ]
        })
    });

    if (!res.ok) {
        const textBody = await res.text();
        throw new Error(`OpenAI API error ${res.status}: ${textBody.slice(0, 200)}`);
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
        throw new Error("No content in OpenAI response");
    }

    return content.trim();
}

// ============================================
// GENERATION FUNCTIONS
// ============================================

function pickRandomFormatHints(): FormatVariation[] {
    const hints: FormatVariation[] = [];

    // Pick one summary option
    hints.push(Math.random() > 0.6 ? "with_summary" : "no_summary");

    // Pick one skills option
    hints.push(Math.random() > 0.4 ? "with_skills" : "skills_inline");

    // Pick one date format
    const dateFormats: FormatVariation[] = ["month_year_dates", "abbreviated_dates", "year_only_dates"];
    hints.push(dateFormats[Math.floor(Math.random() * dateFormats.length)]);

    // Pick bullet density
    hints.push(Math.random() > 0.7 ? "bullets_heavy" : (Math.random() > 0.5 ? "bullets_light" : "bullets_heavy"));

    return hints;
}

export async function generateSyntheticResume(
    spec: SyntheticResumeSpec
): Promise<GeneratedResume> {
    // Add random format hints if not specified
    if (!spec.formatHints) {
        spec.formatHints = pickRandomFormatHints();
    }

    const prompt = buildGeneratorPrompt(spec);
    const text = await callOpenAI(prompt, "Generate the resume now.");

    const id = `synth_${spec.role}_${spec.seniority}_${spec.quality}_${Date.now()}`;

    return {
        id,
        spec,
        text,
        expectedScoreRange: getExpectedScoreRange(spec),
        generatedAt: new Date().toISOString(),
    };
}

export interface CorpusConfig {
    count: number;
    distribution?: "balanced" | "realistic" | "edge_heavy";
    outputDir: string;
}

function generateSpecDistribution(config: CorpusConfig): SyntheticResumeSpec[] {
    const specs: SyntheticResumeSpec[] = [];

    if (config.distribution === "balanced") {
        // Even distribution across all combinations
        const combos: SyntheticResumeSpec[] = [];
        for (const role of ROLE_ARCHETYPES) {
            for (const seniority of SENIORITY_LEVELS) {
                for (const quality of QUALITY_TIERS) {
                    combos.push({ role, seniority, quality });
                }
            }
        }
        // Cycle through combos until we hit count
        for (let i = 0; i < config.count; i++) {
            specs.push(combos[i % combos.length]);
        }
    } else if (config.distribution === "edge_heavy") {
        // 50% edge cases, 50% normal
        const normalCount = Math.floor(config.count / 2);
        const edgeCount = config.count - normalCount;

        // Normal cases
        for (let i = 0; i < normalCount; i++) {
            specs.push({
                role: ROLE_ARCHETYPES[i % ROLE_ARCHETYPES.length],
                seniority: SENIORITY_LEVELS[i % SENIORITY_LEVELS.length],
                quality: QUALITY_TIERS[i % QUALITY_TIERS.length],
            });
        }

        // Edge cases
        for (let i = 0; i < edgeCount; i++) {
            specs.push({
                role: ROLE_ARCHETYPES[i % ROLE_ARCHETYPES.length],
                seniority: SENIORITY_LEVELS[i % SENIORITY_LEVELS.length],
                quality: QUALITY_TIERS[i % QUALITY_TIERS.length],
                edgeCase: EDGE_CASES[i % EDGE_CASES.length],
            });
        }
    } else {
        // Realistic: weighted toward mid-level, strong/foundation quality
        const weights = {
            seniority: { entry: 0.15, mid: 0.35, senior: 0.30, director: 0.15, vp: 0.05 },
            quality: { elite: 0.10, strong: 0.35, foundation: 0.40, weak: 0.15 },
        };

        for (let i = 0; i < config.count; i++) {
            const role = ROLE_ARCHETYPES[Math.floor(Math.random() * ROLE_ARCHETYPES.length)];
            const seniority = weightedRandom(SENIORITY_LEVELS, weights.seniority);
            const quality = weightedRandom(QUALITY_TIERS, weights.quality);
            const edgeCase = Math.random() < 0.15
                ? EDGE_CASES[Math.floor(Math.random() * EDGE_CASES.length)]
                : undefined;

            specs.push({ role, seniority, quality, edgeCase });
        }
    }

    return specs;
}

function weightedRandom<T extends string>(
    options: readonly T[],
    weights: Record<string, number>
): T {
    const rand = Math.random();
    let cumulative = 0;
    for (const opt of options) {
        cumulative += weights[opt] || 0;
        if (rand < cumulative) return opt;
    }
    return options[options.length - 1];
}

export async function generateCorpus(config: CorpusConfig): Promise<void> {
    const specs = generateSpecDistribution(config);

    console.log(`\n🎯 Generating ${config.count} synthetic resumes...`);
    console.log(`   Distribution: ${config.distribution || "realistic"}`);
    console.log(`   Output: ${config.outputDir}\n`);

    // Ensure output directory exists
    await fs.mkdir(config.outputDir, { recursive: true });

    const manifest: Array<{
        id: string;
        spec: SyntheticResumeSpec;
        path: string;
        expectedScoreRange: [number, number];
    }> = [];

    // Generate in batches of 5 for rate limiting
    const batchSize = 5;
    for (let i = 0; i < specs.length; i += batchSize) {
        const batch = specs.slice(i, i + batchSize);
        const batchNum = Math.floor(i / batchSize) + 1;
        const totalBatches = Math.ceil(specs.length / batchSize);

        console.log(`📝 Batch ${batchNum}/${totalBatches}...`);

        const results = await Promise.all(
            batch.map(spec => generateSyntheticResume(spec))
        );

        for (const resume of results) {
            const filename = `${resume.id}.txt`;
            const filepath = path.join(config.outputDir, filename);
            await fs.writeFile(filepath, resume.text, "utf-8");

            manifest.push({
                id: resume.id,
                spec: resume.spec,
                path: `synthetic/${filename}`,
                expectedScoreRange: resume.expectedScoreRange,
            });

            const emoji = resume.spec.edgeCase ? "⚡" : "✓";
            console.log(`   ${emoji} ${resume.id}`);
        }

        // Small delay between batches
        if (i + batchSize < specs.length) {
            await new Promise(r => setTimeout(r, 500));
        }
    }

    // Write manifest
    const manifestPath = path.join(config.outputDir, "_manifest.json");
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");

    console.log(`\n✅ Generated ${manifest.length} resumes`);
    console.log(`📄 Manifest: ${manifestPath}\n`);

    // Summary stats
    const qualityCounts = manifest.reduce((acc, r) => {
        acc[r.spec.quality] = (acc[r.spec.quality] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const edgeCaseCount = manifest.filter(r => r.spec.edgeCase).length;

    console.log("📊 Distribution:");
    for (const [quality, count] of Object.entries(qualityCounts)) {
        console.log(`   ${quality}: ${count}`);
    }
    console.log(`   edge cases: ${edgeCaseCount}`);
}
