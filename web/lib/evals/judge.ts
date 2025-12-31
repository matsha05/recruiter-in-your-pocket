/**
 * LLM-as-Judge Evaluation
 * 
 * Uses a separate LLM call to grade resume feedback outputs against
 * the recruiter methodology rubric. Returns structured scores on:
 * - Evidence quality (are fixes grounded in actual resume text?)
 * - Actionability (are suggestions specific and doable?)
 * - Tone (does it sound like a real recruiter?)
 * - Methodology alignment (follows 7.4-second signal model?)
 */

// ============================================
// JUDGE RUBRIC
// ============================================

export const JUDGE_RUBRIC = `You are a Quality Evaluator for an AI resume feedback system. Your job is to grade the feedback output against a strict rubric.

## RUBRIC DIMENSIONS

### 1. Evidence Quality (1-10)
Does the feedback ground suggestions in specific text from the resume?

- 10: Every suggestion cites exact phrases with line references
- 7-9: Most suggestions cite specific evidence, few are generic
- 4-6: Some evidence cited, but many suggestions are unsupported
- 1-3: Generic advice with no grounding in the actual resume

### 2. Actionability (1-10)
Are the suggestions specific enough that someone could implement them today?

- 10: Every suggestion has concrete tokens (numbers, time bounds, specific words to change)
- 7-9: Most suggestions are specific, few vague ones
- 4-6: Mix of specific and vague suggestions
- 1-3: Mostly generic advice like "add more metrics" without specifics

### 3. Tone (1-10)
Does it sound like expert recruiter feedback, not generic AI advice?

- 10: Reads like feedback from an experienced hiring manager - direct, specific, industry-aware
- 7-9: Professional and credible, mostly sounds human
- 4-6: Somewhat robotic or generic, but serviceable
- 1-3: Obviously AI-generated, uses buzzwords, sounds like a template

### 4. Methodology Alignment (1-10)
Does the feedback follow the 7.4-second signal model and recruiter lens?

- 10: Clearly evaluates from signal vs noise perspective, focuses on first impressions
- 7-9: Mostly aligned with methodology, minor deviations
- 4-6: Some alignment but misses key methodology elements
- 1-3: Doesn't reflect the methodology at all

### 5. Red Flags (penalty points)
Deduct points for:
- Hallucinated claims (claims facts not in resume): -3 per instance
- Discouraged phrases ("seasoned professional", "dynamic leader"): -1 per instance
- Contradictory advice: -2 per instance
- Missing top fixes section: -5
- No score or missing required fields: -5

## OUTPUT FORMAT

Respond with valid JSON only:
{
  "evidence_score": 8,
  "actionability_score": 7,
  "tone_score": 9,
  "methodology_score": 8,
  "penalty_points": -2,
  "final_score": 7.0,
  "issues": [
    {"type": "hallucination", "detail": "Claims 5 years experience but resume shows 3"},
    {"type": "discouraged_phrase", "detail": "Used 'seasoned professional'"}
  ],
  "strengths": ["Strong evidence grounding", "Specific metric suggestions"],
  "improvement_areas": ["More recruiter-style directness needed"]
}

The final_score should be: (evidence + actionability + tone + methodology) / 4 + penalty_points / 10
Clamp final_score between 0 and 10.`;

export interface JudgeResult {
    evidence_score: number;
    actionability_score: number;
    tone_score: number;
    methodology_score: number;
    penalty_points: number;
    final_score: number;
    issues: Array<{ type: string; detail: string }>;
    strengths: string[];
    improvement_areas: string[];
}

export interface JudgeInput {
    resumeText: string;
    feedbackOutput: any; // The raw JSON output from the resume feedback
}

// ============================================
// JUDGE EXECUTION
// ============================================

export async function runJudge(input: JudgeInput): Promise<JudgeResult> {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

    if (!OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY environment variable is required");
    }

    const userMessage = `## RESUME TEXT
${input.resumeText.slice(0, 4000)}

## FEEDBACK OUTPUT TO EVALUATE
${JSON.stringify(input.feedbackOutput, null, 2).slice(0, 8000)}

Grade this feedback output against the rubric. Return JSON only.`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: OPENAI_MODEL,
            temperature: 0,
            response_format: { type: "json_object" },
            messages: [
                { role: "system", content: JUDGE_RUBRIC },
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
        throw new Error("No content in OpenAI judge response");
    }

    try {
        const result = JSON.parse(content) as JudgeResult;

        // Validate required fields
        if (typeof result.evidence_score !== 'number') result.evidence_score = 5;
        if (typeof result.actionability_score !== 'number') result.actionability_score = 5;
        if (typeof result.tone_score !== 'number') result.tone_score = 5;
        if (typeof result.methodology_score !== 'number') result.methodology_score = 5;
        if (typeof result.penalty_points !== 'number') result.penalty_points = 0;
        if (typeof result.final_score !== 'number') {
            result.final_score = (result.evidence_score + result.actionability_score +
                result.tone_score + result.methodology_score) / 4 + result.penalty_points / 10;
        }
        if (!Array.isArray(result.issues)) result.issues = [];
        if (!Array.isArray(result.strengths)) result.strengths = [];
        if (!Array.isArray(result.improvement_areas)) result.improvement_areas = [];

        // Clamp final score
        result.final_score = Math.max(0, Math.min(10, result.final_score));

        return result;
    } catch {
        throw new Error("Failed to parse judge response as JSON");
    }
}

// ============================================
// JUDGE SUMMARY FORMATTING
// ============================================

export function formatJudgeSummary(results: JudgeResult[]): string {
    if (results.length === 0) return "No judge results to summarize.";

    const avgEvidence = results.reduce((a, b) => a + b.evidence_score, 0) / results.length;
    const avgActionability = results.reduce((a, b) => a + b.actionability_score, 0) / results.length;
    const avgTone = results.reduce((a, b) => a + b.tone_score, 0) / results.length;
    const avgMethodology = results.reduce((a, b) => a + b.methodology_score, 0) / results.length;
    const avgFinal = results.reduce((a, b) => a + b.final_score, 0) / results.length;

    // Collect common issues
    const issueCounts: Record<string, number> = {};
    for (const r of results) {
        for (const issue of r.issues) {
            issueCounts[issue.type] = (issueCounts[issue.type] || 0) + 1;
        }
    }

    const lines = [
        `## LLM-as-Judge Summary (${results.length} samples)`,
        ``,
        `| Dimension | Score |`,
        `|-----------|-------|`,
        `| Evidence Quality | ${avgEvidence.toFixed(1)}/10 |`,
        `| Actionability | ${avgActionability.toFixed(1)}/10 |`,
        `| Tone | ${avgTone.toFixed(1)}/10 |`,
        `| Methodology Alignment | ${avgMethodology.toFixed(1)}/10 |`,
        `| **Final Score** | **${avgFinal.toFixed(1)}/10** |`,
        ``,
    ];

    if (Object.keys(issueCounts).length > 0) {
        lines.push(`### Common Issues`);
        for (const [type, count] of Object.entries(issueCounts).sort((a, b) => b[1] - a[1])) {
            lines.push(`- ${type}: ${count} occurrences`);
        }
    }

    return lines.join("\n");
}
