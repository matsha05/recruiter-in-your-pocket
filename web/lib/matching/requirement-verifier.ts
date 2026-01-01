/**
 * Requirement Verifier Module
 * 
 * Uses gpt-4o-mini to verify ambiguous requirement → evidence matches.
 * Only called when deterministic matching gives mid-confidence.
 * 
 * Example: "1000+ hires" should match "high-volume recruiting"
 * Deterministic matching might miss this, but LLM verifier catches it.
 * 
 * Cost: ~$0.0005 per verification (very cheap)
 */

import type { ParsedRequirement, ScaleClaim, GrowthClaim } from './claim-extractor';

// ================== TYPES ==================

export interface VerificationRequest {
    requirement: string;
    evidenceTexts: string[];  // Top-k resume bullets/claims
    context?: {
        resumeTitle?: string;
        jdTitle?: string;
        requirement_type?: string;
    };
}

export interface VerificationResult {
    verdict: 'met' | 'partial' | 'gap';
    confidence: number;  // 0-1
    evidenceQuote: string | null;
    explanation: string;
    inferredSkill?: string;  // e.g., "high-volume recruiting" from "1000+ hires"
}

interface VerifierBatch {
    requirements: VerificationRequest[];
    results: VerificationResult[];
}

// ================== PROMPTS ==================

const VERIFIER_SYSTEM_PROMPT = `You are an expert recruiter verifying if resume evidence satisfies job requirements.

For each requirement, determine if the provided resume evidence demonstrates the candidate meets it.

Return JSON:
{
  "verdict": "met" | "partial" | "gap",
  "confidence": 0.0-1.0,
  "evidence_quote": "exact quote from resume that supports this" or null,
  "explanation": "brief explanation",
  "inferred_skill": "skill name if evidence implies it" or null
}

Guidelines:
- "met": Clear evidence the candidate has this qualification
- "partial": Some relevant experience but not exactly what's asked
- "gap": No evidence or clearly doesn't have this

For numeric requirements (e.g., "high-volume hiring"):
- Numbers like "1000+ hires" or "managed 50-person team" satisfy volume/scale requirements
- "500+ hires" satisfies "high-volume" even if threshold isn't specified

Be generous on implicit matches but strict on hard requirements (licenses, years, degrees).`;

// ================== VERIFICATION FUNCTIONS ==================

/**
 * Check if a requirement should be sent to LLM verifier
 * (vs handled deterministically)
 */
export function needsLLMVerification(
    requirement: ParsedRequirement,
    determinedStatus: 'met' | 'partial' | 'gap' | 'unknown',
    confidence: number
): boolean {
    // Always verify mid-confidence cases
    if (confidence >= 0.3 && confidence <= 0.7) {
        return true;
    }

    // Verify scale requirements (these often need semantic understanding)
    if (requirement.category === 'scale') {
        return true;
    }

    // Verify domain requirements (e.g., "fintech experience")
    if (requirement.category === 'domain') {
        return true;
    }

    // Don't re-verify high-confidence matches or clear gaps
    if (confidence >= 0.85 && determinedStatus === 'met') {
        return false;
    }

    if (confidence <= 0.15 && determinedStatus === 'gap') {
        return false;
    }

    return false;
}

/**
 * Format evidence for LLM verification
 */
function formatEvidenceForVerification(
    scaleClaims: ScaleClaim[],
    growthClaims: GrowthClaim[],
    relevantBullets: string[]
): string[] {
    const evidence: string[] = [];

    // Add scale claims
    for (const claim of scaleClaims) {
        evidence.push(`${claim.value} ${claim.metric}${claim.context ? ` ${claim.context}` : ''}`);
    }

    // Add growth claims
    for (const claim of growthClaims) {
        const direction = claim.direction === 'increase' ? 'increased' : 'reduced';
        evidence.push(`${direction} ${claim.metric} by ${Math.abs(claim.percentage)}%${claim.context ? ` ${claim.context}` : ''}`);
    }

    // Add relevant bullets
    evidence.push(...relevantBullets);

    return evidence;
}

/**
 * Verify a single requirement against evidence using LLM
 */
export async function verifyRequirement(
    request: VerificationRequest,
    apiKey: string
): Promise<VerificationResult> {
    const userPrompt = `Requirement: "${request.requirement}"

Resume evidence:
${request.evidenceTexts.map((e, i) => `${i + 1}. ${e}`).join('\n')}

${request.context?.jdTitle ? `Job: ${request.context.jdTitle}` : ''}
${request.context?.resumeTitle ? `Candidate's recent role: ${request.context.resumeTitle}` : ''}

Does this evidence satisfy the requirement?`;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: VERIFIER_SYSTEM_PROMPT },
                    { role: 'user', content: userPrompt },
                ],
                temperature: 0.1,  // Low temp for consistent judgments
                max_tokens: 200,
                response_format: { type: 'json_object' },
            }),
        });

        if (!response.ok) {
            console.error('[Verifier] API error:', response.status);
            return getDefaultResult();
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
            return getDefaultResult();
        }

        const parsed = JSON.parse(content);

        return {
            verdict: parsed.verdict || 'gap',
            confidence: Math.max(0, Math.min(1, parsed.confidence || 0.5)),
            evidenceQuote: parsed.evidence_quote || null,
            explanation: parsed.explanation || '',
            inferredSkill: parsed.inferred_skill || undefined,
        };
    } catch (error) {
        console.error('[Verifier] Error:', error);
        return getDefaultResult();
    }
}

function getDefaultResult(): VerificationResult {
    return {
        verdict: 'partial',
        confidence: 0.5,
        evidenceQuote: null,
        explanation: 'Verification unavailable',
    };
}

/**
 * Verify multiple requirements in batch (more efficient)
 */
export async function verifyRequirementsBatch(
    requests: VerificationRequest[],
    apiKey: string
): Promise<VerificationResult[]> {
    // For now, run in parallel with concurrency limit
    const CONCURRENCY = 5;
    const results: VerificationResult[] = [];

    for (let i = 0; i < requests.length; i += CONCURRENCY) {
        const batch = requests.slice(i, i + CONCURRENCY);
        const batchResults = await Promise.all(
            batch.map(req => verifyRequirement(req, apiKey))
        );
        results.push(...batchResults);
    }

    return results;
}

// ================== INTEGRATION HELPERS ==================

/**
 * Create verification requests from parsed data
 */
export function createVerificationRequests(
    requirements: ParsedRequirement[],
    scaleClaims: ScaleClaim[],
    growthClaims: GrowthClaim[],
    resumeBullets: string[],
    determinismResults: Map<string, { status: 'met' | 'partial' | 'gap' | 'unknown'; confidence: number }>
): VerificationRequest[] {
    const requests: VerificationRequest[] = [];

    for (const req of requirements) {
        const result = determinismResults.get(req.text);
        if (!result) continue;

        // Only verify if needed
        if (!needsLLMVerification(req, result.status, result.confidence)) {
            continue;
        }

        // Get relevant evidence
        const evidence = formatEvidenceForVerification(
            scaleClaims,
            growthClaims,
            // Take top 5 most relevant bullets (could use embedding similarity here)
            resumeBullets.slice(0, 5)
        );

        requests.push({
            requirement: req.text,
            evidenceTexts: evidence,
            context: {
                requirement_type: req.category,
            },
        });
    }

    return requests;
}

/**
 * Merge LLM verification results with deterministic results
 */
export function mergeVerificationResults(
    deterministicResults: Array<{ requirement: ParsedRequirement; status: 'met' | 'partial' | 'gap'; confidence: number }>,
    llmResults: Map<string, VerificationResult>
): Array<{ requirement: ParsedRequirement; status: 'met' | 'partial' | 'gap'; confidence: number; evidenceQuote?: string }> {
    return deterministicResults.map(det => {
        const llmResult = llmResults.get(det.requirement.text);

        if (!llmResult) {
            return det;
        }

        // LLM takes precedence if it has higher confidence
        if (llmResult.confidence > det.confidence) {
            return {
                requirement: det.requirement,
                status: llmResult.verdict,
                confidence: llmResult.confidence,
                evidenceQuote: llmResult.evidenceQuote || undefined,
            };
        }

        return det;
    });
}
