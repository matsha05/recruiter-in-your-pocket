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

// ================== RESEARCH-BACKED DATA ==================
// Skill posting frequency data from authoritative sources:
// - America Succeeds "Durable by Design" (Lightcast, ~76M postings, 2023-2024)
// - America Succeeds Durable Skills National Fact Sheet
// - National Skills Coalition "Closing the Digital Skill Divide" (43M postings, 2021)
// - O*NET Hot Technologies (Lightcast posting counts)
//
// Values = percentage of job postings mentioning this skill (out of 100)

const BOOTSTRAP_SKILL_FREQUENCIES: Record<string, number> = {
    // --------------------------
    // SOFT SKILLS (market-wide research from Lightcast/America Succeeds)
    // --------------------------
    'communication': 35,        // Durable by Design: top skill
    'customer service': 26,     // Durable by Design
    'critical thinking': 19,    // Durable Skills Fact Sheet
    'teamwork': 18,             // Proxied via "collaboration" competency
    'collaboration': 18,        // Durable Skills Fact Sheet
    'leadership': 15,           // Durable by Design
    'problem solving': 12,      // Durable by Design
    'attention to detail': 12,  // Durable by Design "detail-oriented"
    'time management': 10,      // Proxied via "planning"
    'organization': 10,         // Proxied via "planning"
    'interpersonal skills': 8,  // Durable by Design "interpersonal communications"
    'creativity': 7,            // Durable Skills Fact Sheet
    'presentation skills': 6,   // Proxied via PowerPoint mention rate
    'analytical skills': 5,     // Estimated from data analysis patterns

    // --------------------------
    // TECHNICAL / TOOLS (O*NET Hot Technologies + NSC Digital Divide)
    // --------------------------
    'microsoft office': 12,     // O*NET + NSC baseline
    'excel': 11,                // NSC: 4.9M/43M postings = 11%
    'project management': 8,    // Estimated from PM tool mentions
    'data analysis': 6,         // Estimated

    'microsoft outlook': 6,     // O*NET Hot Technologies
    'microsoft powerpoint': 6,  // O*NET Hot Technologies
    'microsoft word': 4,        // O*NET Hot Technologies

    'python': 3,                // O*NET Hot Technologies
    'sql': 3,                   // O*NET Hot Technologies
    'jira': 3,                  // O*NET (6% in tech occupations, ~3% market-wide)

    'salesforce': 2,            // O*NET Hot Technologies
    'aws': 2,                   // O*NET Hot Technologies
    'sap': 2,                   // O*NET Hot Technologies

    'azure': 1,                 // O*NET Hot Technologies
    'java': 1,                  // O*NET Hot Technologies
    'power bi': 1,              // O*NET Hot Technologies
    'kubernetes': 1,            // Rare infrastructure skill
    'terraform': 1,             // Rare infrastructure skill
    'machine learning': 1,      // Rare ML skill

    // --------------------------
    // INDUSTRY-SPECIFIC (rare in market-wide, higher in domain)
    // --------------------------
    // HR Tools
    'workday': 2,               // O*NET: 5-8% in HR, ~2% market-wide
    'recruiting': 3,            // Estimated from TA role postings
    'talent acquisition': 2,
    'greenhouse': 1,            // Rare ATS
    'lever': 1,                 // Rare ATS

    // Construction
    'osha': 1,                  // Very rare market-wide
    'drywall': 1,
    'blueprint': 1,
    'hvac': 1,

    // Benefits/Comp
    'fertility benefits': 1,
    'tpa': 1,
    'actuary': 1,
};

// ================== SOC-SPECIFIC FREQUENCIES ==================
// Skills that are common in specific domains but rare globally
// Use these when the JD's SOC group is known for more accurate weighting
// Source: O*NET Hot Technologies occupation-level posting percentages

const SOC_SKILL_FREQUENCIES: Record<string, Record<string, number>> = {
    // SOC 13: Business and Financial Operations (HR, Recruiting, Finance)
    '13': {
        'workday': 6,           // O*NET: 5-8% in HR/payroll occupations
        'greenhouse': 5,        // Common in recruiting roles
        'lever': 5,             // Common in recruiting roles
        'recruiting': 15,       // Core HR function
        'talent acquisition': 12,
        'salesforce': 8,        // Used in business ops
        'excel': 25,            // Higher in business roles
    },

    // SOC 15: Computer and Mathematical (Tech, Software, Data)
    '15': {
        'python': 15,           // Much higher in tech roles
        'sql': 18,              // Core data skill
        'aws': 12,              // Common in cloud roles
        'kubernetes': 8,        // Common in DevOps/SRE
        'terraform': 6,         // Common in infrastructure
        'docker': 10,           // Common in backend/devops
        'jira': 12,             // Standard project tracking
        'machine learning': 8,  // Common in ML roles
        'java': 10,             // Common backend language
        'react': 8,             // Common frontend
        'typescript': 8,
    },

    // SOC 41: Sales and Related
    '41': {
        'salesforce': 15,       // O*NET: 9-15% in sales roles
        'hubspot': 8,
        'linkedin sales navigator': 6,
    },

    // SOC 47: Construction and Extraction
    '47': {
        'osha': 25,             // Required for most construction roles
        'blueprint': 15,
        'autocad': 10,
        'hvac': 12,
    },

    // SOC 29: Healthcare Practitioners
    '29': {
        'epic': 15,             // Common EHR
        'cerner': 10,
        'meditech': 6,
    },
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
 * 
 * @param skill - The skill to get weight for
 * @param store - Optional learned IDF store
 * @param socCode - Optional SOC major group code for domain-aware weighting
 */
export function getSkillWeight(skill: string, store?: IDFStore, socCode?: string): number {
    const normalizedSkill = skill.toLowerCase().trim();

    // Use provided store if available (learned data takes priority)
    if (store && store.totalDocuments > 0) {
        const docFreq = store.skillCounts[normalizedSkill] || 1;
        const idf = calculateIDF(docFreq, store.totalDocuments);
        return idfToWeight(idf);
    }

    // Check SOC-specific frequencies first (domain-aware IDF)
    if (socCode && SOC_SKILL_FREQUENCIES[socCode]) {
        const socFreqs = SOC_SKILL_FREQUENCIES[socCode];
        if (socFreqs[normalizedSkill] !== undefined) {
            const docFreq = socFreqs[normalizedSkill];
            const idf = calculateIDF(docFreq, BOOTSTRAP_CORPUS_SIZE);
            return idfToWeight(idf);
        }
    }

    // Fall back to global bootstrap data
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
