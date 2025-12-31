/**
 * Semantic Skill Matcher
 * 
 * Uses pre-computed O*NET skill embeddings to infer skills from text.
 * This provides semantic matching beyond keyword patterns.
 * 
 * Architecture:
 * 1. Load skill embeddings (one-time, cached in memory)
 * 2. For each text chunk, compute embedding
 * 3. Find top-k nearest skill vectors via cosine similarity
 * 4. Return skills above threshold as inferred matches
 */

import { createEmbedding } from './embedding-service';

interface SkillWithEmbedding {
    id: string;
    name: string;
    category: 'skill' | 'technology' | 'ability';
    embedding: number[];
}

interface SkillEmbeddingsData {
    version: string;
    source: string;
    model: string;
    dimensions: number;
    skills: SkillWithEmbedding[];
}

interface InferredSkill {
    name: string;
    category: string;
    confidence: number;
    source: 'semantic';
}

// Singleton cache for embeddings
let skillEmbeddingsCache: SkillEmbeddingsData | null = null;
let loadingPromise: Promise<SkillEmbeddingsData> | null = null;

/**
 * Load skill embeddings from JSON file (lazy, cached)
 */
async function loadSkillEmbeddings(): Promise<SkillEmbeddingsData> {
    if (skillEmbeddingsCache) {
        return skillEmbeddingsCache;
    }

    if (loadingPromise) {
        return loadingPromise;
    }

    loadingPromise = (async () => {
        try {
            // Dynamic import to avoid bundling 162MB file in client
            const fs = await import('fs');
            const path = await import('path');

            // Use relative path from lib/matching directory
            const filePath = path.join(__dirname, 'onet-skill-embeddings.json');
            const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

            skillEmbeddingsCache = data;
            console.log(`[SemanticMatcher] Loaded ${data.skills.length} skill embeddings`);

            return data;
        } catch (error) {
            console.error('[SemanticMatcher] Failed to load embeddings:', error);
            throw error;
        }
    })();

    return loadingPromise;
}

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
 * Find skills semantically similar to input text
 * 
 * @param text - Text to match (resume bullet, job requirement, etc.)
 * @param topK - Number of top matches to return (default: 5)
 * @param threshold - Minimum similarity threshold (default: 0.72)
 */
export async function inferSkillsFromText(
    text: string,
    topK: number = 5,
    threshold: number = 0.72
): Promise<InferredSkill[]> {
    if (!text || text.length < 10) {
        return [];
    }

    // Get embedding for input text
    const textEmbedding = await createEmbedding(text);
    if (!textEmbedding) {
        return [];
    }

    // Load skill embeddings
    const skillData = await loadSkillEmbeddings();

    // Find top matches
    const matches: Array<{ skill: SkillWithEmbedding; similarity: number }> = [];

    for (const skill of skillData.skills) {
        const similarity = cosineSimilarity(textEmbedding.embedding, skill.embedding);

        if (similarity >= threshold) {
            matches.push({ skill, similarity });
        }
    }

    // Sort by similarity and take top K
    matches.sort((a, b) => b.similarity - a.similarity);
    const topMatches = matches.slice(0, topK);

    return topMatches.map(m => ({
        name: m.skill.name,
        category: m.skill.category,
        confidence: Math.round(m.similarity * 100) / 100,
        source: 'semantic' as const
    }));
}

/**
 * Infer skills from a resume by chunking and matching each chunk
 * 
 * @param resumeText - Full resume text
 * @param topKPerChunk - Top matches per chunk (default: 3)
 * @param threshold - Similarity threshold (default: 0.72)
 */
export async function inferSkillsFromResume(
    resumeText: string,
    topKPerChunk: number = 3,
    threshold: number = 0.72
): Promise<InferredSkill[]> {
    // Split resume into chunks (by bullet points and sentences)
    const chunks = splitIntoChunks(resumeText);

    // Infer skills from each chunk
    const allInferred: Map<string, InferredSkill> = new Map();

    for (const chunk of chunks) {
        const skills = await inferSkillsFromText(chunk, topKPerChunk, threshold);

        for (const skill of skills) {
            // Keep highest confidence for each skill
            const existing = allInferred.get(skill.name);
            if (!existing || skill.confidence > existing.confidence) {
                allInferred.set(skill.name, skill);
            }
        }
    }

    // Sort by confidence
    const results = Array.from(allInferred.values());
    results.sort((a, b) => b.confidence - a.confidence);

    return results;
}

/**
 * Split text into semantic chunks for matching
 */
function splitIntoChunks(text: string): string[] {
    const chunks: string[] = [];

    // Split by common bullet patterns
    const bulletPatterns = [
        /(?:^|\n)\s*[•·‣⁃▪▸►]\s*/g,  // Bullet characters
        /(?:^|\n)\s*[-–—]\s+/g,        // Dashes
        /(?:^|\n)\s*\d+[.)]\s+/g,      // Numbered lists
        /(?:^|\n)\s*[a-zA-Z][.)]\s+/g  // Lettered lists
    ];

    let workingText = text;
    for (const pattern of bulletPatterns) {
        workingText = workingText.replace(pattern, '\n');
    }

    // Split by newlines and filter
    const lines = workingText.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 20); // Skip very short lines

    // Take up to 50 chunks to limit API calls
    return lines.slice(0, 50);
}

/**
 * Check if embeddings are available (for graceful degradation)
 */
export async function isSemanticMatchingAvailable(): Promise<boolean> {
    try {
        await loadSkillEmbeddings();
        return true;
    } catch {
        return false;
    }
}
