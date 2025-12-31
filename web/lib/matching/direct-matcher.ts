/**
 * Direct JD-Resume Semantic Matcher
 * 
 * The right approach: Match JD requirements directly to resume bullets
 * using embeddings. No intermediate skill database needed.
 * 
 * "High-volume recruiting experience" (JD) 
 *   ≈ 0.85 similarity →
 * "contributing to 1,000+ ML Gen hires" (resume)
 */

import { createEmbedding } from './embedding-service';

interface MatchResult {
    requirement: string;
    matchedBullet: string;
    similarity: number;
    isMatch: boolean;
}

interface DirectMatchResult {
    matches: MatchResult[];
    unmatched: string[];
    coverageScore: number;
}

// Configurable thresholds
const STRONG_MATCH_THRESHOLD = 0.75;
const PARTIAL_MATCH_THRESHOLD = 0.60;

/**
 * Compute cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dotProduct / denominator;
}

/**
 * Split resume into bullet points / meaningful chunks
 */
function splitIntoChunks(text: string): string[] {
    // Split by common bullet patterns and newlines
    const lines = text.split(/\n+/)
        .map(line => line.trim())
        .filter(line => line.length > 20); // Skip very short lines

    return lines;
}

/**
 * Match JD requirements directly against resume using embeddings
 * 
 * @param requirements - List of requirements extracted from JD
 * @param resumeText - Full resume text
 * @returns Match results with coverage score
 */
export async function matchRequirementsToResume(
    requirements: string[],
    resumeText: string
): Promise<DirectMatchResult> {
    const resumeChunks = splitIntoChunks(resumeText);

    if (resumeChunks.length === 0 || requirements.length === 0) {
        return {
            matches: [],
            unmatched: requirements,
            coverageScore: 0
        };
    }

    // Embed all resume chunks (in batch for efficiency)
    console.log(`[DirectMatcher] Embedding ${resumeChunks.length} resume chunks...`);
    const chunkEmbeddings: Array<{ text: string; embedding: number[] }> = [];

    for (const chunk of resumeChunks) {
        const result = await createEmbedding(chunk);
        if (result) {
            chunkEmbeddings.push({ text: chunk, embedding: result.embedding });
        }
    }

    // Match each requirement against resume chunks
    const matches: MatchResult[] = [];
    const unmatched: string[] = [];

    console.log(`[DirectMatcher] Matching ${requirements.length} requirements...`);

    for (const req of requirements) {
        const reqEmbedding = await createEmbedding(req);
        if (!reqEmbedding) {
            unmatched.push(req);
            continue;
        }

        // Find best matching chunk
        let bestMatch = { text: '', similarity: 0 };

        for (const chunk of chunkEmbeddings) {
            const similarity = cosineSimilarity(reqEmbedding.embedding, chunk.embedding);
            if (similarity > bestMatch.similarity) {
                bestMatch = { text: chunk.text, similarity };
            }
        }

        const isMatch = bestMatch.similarity >= PARTIAL_MATCH_THRESHOLD;

        if (isMatch) {
            matches.push({
                requirement: req,
                matchedBullet: bestMatch.text,
                similarity: bestMatch.similarity,
                isMatch: true
            });
        } else {
            unmatched.push(req);
        }
    }

    // Calculate coverage score
    const coverageScore = requirements.length > 0
        ? Math.round((matches.length / requirements.length) * 100)
        : 0;

    console.log(`[DirectMatcher] Coverage: ${matches.length}/${requirements.length} (${coverageScore}%)`);

    return {
        matches,
        unmatched,
        coverageScore
    };
}

/**
 * Quick check if a single requirement is covered by resume
 */
export async function isRequirementCovered(
    requirement: string,
    resumeEmbeddings: Array<{ text: string; embedding: number[] }>
): Promise<{ covered: boolean; bestMatch: string; similarity: number }> {
    const reqEmbedding = await createEmbedding(requirement);
    if (!reqEmbedding) {
        return { covered: false, bestMatch: '', similarity: 0 };
    }

    let bestMatch = { text: '', similarity: 0 };

    for (const chunk of resumeEmbeddings) {
        const similarity = cosineSimilarity(reqEmbedding.embedding, chunk.embedding);
        if (similarity > bestMatch.similarity) {
            bestMatch = { text: chunk.text, similarity };
        }
    }

    return {
        covered: bestMatch.similarity >= PARTIAL_MATCH_THRESHOLD,
        bestMatch: bestMatch.text,
        similarity: bestMatch.similarity
    };
}
