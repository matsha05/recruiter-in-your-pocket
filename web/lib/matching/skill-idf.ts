/**
 * Skill IDF Weighting Module
 * 
 * Implements IDF (Inverse Document Frequency) weighting to down-weight
 * generic skills that appear in every JD (teamwork, communication)
 * and up-weight rare domain-specific skills (OSHA, Greenhouse, Lever).
 * 
 * Oracle recommendation: "Teamwork appears everywhere → low weight"
 */

// ================== TYPES ==================

export interface SkillFrequency {
    skill: string;
    count: number;
    idf: number;  // Computed IDF score
    weight: number;  // Final weight multiplier (0.2 to 2.0)
}

export interface IDFStore {
    skillCounts: Record<string, number>;
    totalDocuments: number;
    lastUpdated: Date;
}

// ================== BOOTSTRAP DATA ==================
// Pre-seeded frequency data based on common JD patterns
// This gives us a head start before we accumulate real data

const BOOTSTRAP_SKILL_FREQUENCIES: Record<string, number> = {
    // Extremely common (appears in 80%+ of JDs) → low weight
    'communication': 90,
    'teamwork': 85,
    'leadership': 75,
    'problem solving': 70,
    'collaboration': 70,
    'time management': 65,
    'attention to detail': 65,
    'organization': 60,
    'microsoft office': 60,
    'excel': 55,

    // Very common (50-80%) → moderate-low weight
    'project management': 45,
    'customer service': 40,
    'presentation skills': 35,
    'analytical skills': 35,
    'data analysis': 30,

    // Moderately common (20-50%) → normal weight
    'sql': 25,
    'python': 22,
    'salesforce': 20,
    'jira': 18,
    'recruiting': 15,
    'talent acquisition': 12,

    // Rare (5-20%) → higher weight
    'greenhouse': 8,
    'lever': 7,
    'workday': 10,
    'machine learning': 8,
    'kubernetes': 6,
    'terraform': 5,
    'executive recruiting': 5,

    // Very rare (<5%) → highest weight
    'osha': 3,
    'drywall': 2,
    'blueprint': 3,
    'hvac': 2,
    'fertility benefits': 1,
    'tpa': 2,
    'actuary': 2,
};

// Assumed bootstrap corpus size
const BOOTSTRAP_CORPUS_SIZE = 100;

// ================== IDF CALCULATION ==================

/**
 * Calculate IDF score for a skill
 * Formula: log((N + 1) / (df + 1)) + 1
 * 
 * @param docFrequency - Number of documents containing the skill
 * @param totalDocs - Total documents in corpus
 */
export function calculateIDF(docFrequency: number, totalDocs: number): number {
    // Standard IDF with smoothing
    return Math.log((totalDocs + 1) / (docFrequency + 1)) + 1;
}

/**
 * Convert IDF to a weight multiplier (clamped 0.2 to 2.0)
 * 
 * Low IDF (common skill) → low weight (0.2-0.5)
 * Medium IDF → normal weight (0.8-1.2)
 * High IDF (rare skill) → high weight (1.5-2.0)
 */
export function idfToWeight(idf: number): number {
    // Normalize IDF to weight
    // IDF typically ranges 1.0 (very common) to ~4.6 (appears once in 100 docs)
    // Map to 0.2 - 2.0 range
    const normalized = (idf - 1) / 3.5;  // 0 to ~1.0
    const weight = 0.2 + normalized * 1.8;  // 0.2 to 2.0
    return Math.max(0.2, Math.min(2.0, weight));
}

/**
 * Get skill weight from bootstrap data or default
 */
export function getSkillWeight(skill: string, store?: IDFStore): number {
    const normalizedSkill = skill.toLowerCase().trim();

    // Use provided store if available
    if (store && store.totalDocuments > 0) {
        const docFreq = store.skillCounts[normalizedSkill] || 1;
        const idf = calculateIDF(docFreq, store.totalDocuments);
        return idfToWeight(idf);
    }

    // Fall back to bootstrap data
    if (BOOTSTRAP_SKILL_FREQUENCIES[normalizedSkill] !== undefined) {
        const docFreq = BOOTSTRAP_SKILL_FREQUENCIES[normalizedSkill];
        const idf = calculateIDF(docFreq, BOOTSTRAP_CORPUS_SIZE);
        return idfToWeight(idf);
    }

    // Unknown skill - give it moderate-high weight (it's probably specific)
    return 1.2;
}

/**
 * Apply IDF weighting to a skill score
 */
export function applyIDFWeight(baseScore: number, skill: string, store?: IDFStore): number {
    const weight = getSkillWeight(skill, store);
    return baseScore * weight;
}

// ================== STORE MANAGEMENT ==================

/**
 * Create a new empty IDF store
 */
export function createIDFStore(): IDFStore {
    return {
        skillCounts: { ...BOOTSTRAP_SKILL_FREQUENCIES },
        totalDocuments: BOOTSTRAP_CORPUS_SIZE,
        lastUpdated: new Date(),
    };
}

/**
 * Update store with skills from a new JD
 */
export function updateIDFStore(store: IDFStore, skills: string[]): IDFStore {
    const newCounts = { ...store.skillCounts };
    const seenInDoc = new Set<string>();

    for (const skill of skills) {
        const normalized = skill.toLowerCase().trim();
        if (!seenInDoc.has(normalized)) {
            seenInDoc.add(normalized);
            newCounts[normalized] = (newCounts[normalized] || 0) + 1;
        }
    }

    return {
        skillCounts: newCounts,
        totalDocuments: store.totalDocuments + 1,
        lastUpdated: new Date(),
    };
}

/**
 * Get all skill weights for debugging/display
 */
export function getSkillWeights(skills: string[], store?: IDFStore): SkillFrequency[] {
    return skills.map(skill => {
        const normalized = skill.toLowerCase().trim();
        const count = store?.skillCounts[normalized] ||
            BOOTSTRAP_SKILL_FREQUENCIES[normalized] || 0;
        const totalDocs = store?.totalDocuments || BOOTSTRAP_CORPUS_SIZE;
        const idf = calculateIDF(count, totalDocs);
        const weight = idfToWeight(idf);

        return {
            skill,
            count,
            idf,
            weight,
        };
    });
}
