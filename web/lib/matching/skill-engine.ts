/**
 * Skill Extraction and Job Matching Engine
 * 
 * Hybrid A+B scoring as recommended by Oracle:
 * - 65% keyword matching (deterministic, explainable)
 * - 35% semantic similarity (embedding cosine distance)
 * - Seniority penalty (0-20 points)
 * 
 * Oracle Phase 2 Improvements (Dec 2024):
 * - Text normalization layer for lemmatization
 * - Skill aliases for canonical matching
 * - Inference layer for implicit skills
 * - Role-based archetype detection
 * 
 * Covers: Technology, Business, Finance, Marketing, Healthcare, 
 *         HR, Legal, Operations, Creative, Education
 */

// ----- NORMALIZATION LAYER -----
// Normalizes text variations to improve matching recall

const LEMMA_MAP: Record<string, string> = {
    // Recruiting variations
    'sourcers': 'sourcing', 'sourcer': 'sourcing', 'sourced': 'sourcing',
    'recruiter': 'recruiting', 'recruiters': 'recruiting', 'recruited': 'recruiting',
    'hires': 'hiring', 'hired': 'hiring', 'hire': 'hiring',
    // Management variations  
    'managed': 'manage', 'managing': 'manage', 'manager': 'manage', 'managers': 'manage',
    'led': 'lead', 'leading': 'lead', 'leader': 'lead', 'leaders': 'lead',
    'directed': 'direct', 'directing': 'direct', 'director': 'direct',
    // Analysis variations
    'analyzed': 'analysis', 'analyzing': 'analysis', 'analyst': 'analysis', 'analysts': 'analysis',
    // Development variations
    'developed': 'development', 'developing': 'development', 'developer': 'development',
    // Engineering variations
    'engineered': 'engineering', 'engineer': 'engineering', 'engineers': 'engineering',
};

// ----- SKILL ONTOLOGY LAYER (Oracle Phase 2) -----
// Replaces flat "equivalents" with structured relationships:
// - Aliases: Same skill, different name → full credit (1.0)
// - Parents: Broader skill satisfies specific → full credit (1.0)
// - Children: Specific satisfies broader → partial credit (0.6)
// - Related: Adjacent skills → small credit (0.7)

export interface SkillOntologyNode {
    id: string;
    aliases: string[];  // Same skill, full credit (1.0)
    parents: Array<{ id: string; credit: number }>;  // Having parent satisfies this
    children: Array<{ id: string; credit: number }>; // Having child partially satisfies this
    related: Array<{ id: string; credit: number }>;  // Adjacent skills
}

// Skill ontology with proper credit values
const SKILL_ONTOLOGY: SkillOntologyNode[] = [
    // HR/Recruiting
    {
        id: "Sourcing",
        aliases: ["Talent Sourcing", "Candidate Sourcing"],
        parents: [],
        children: [
            { id: "Passive Candidate Sourcing", credit: 0.6 },
            { id: "Boolean Search", credit: 0.6 },
            { id: "LinkedIn Recruiter", credit: 0.6 }
        ],
        related: [{ id: "Recruiting", credit: 0.7 }]
    },
    {
        id: "Passive Candidate Sourcing",
        aliases: ["Candidate Referrals", "Pipeline Building"],
        parents: [{ id: "Sourcing", credit: 1.0 }],
        children: [],
        related: []
    },
    {
        id: "Recruiting",
        aliases: ["Talent Acquisition", "TA"],
        parents: [],
        children: [
            { id: "Full-Cycle Recruiting", credit: 0.6 },
            { id: "Technical Recruiting", credit: 0.6 },
            { id: "Executive Recruiting", credit: 0.6 }
        ],
        related: [{ id: "Sourcing", credit: 0.7 }]
    },
    {
        id: "Executive Recruiting",
        aliases: ["Executive Search", "VP Hiring", "C-Suite Hiring", "Senior Leadership Hiring"],
        parents: [{ id: "Recruiting", credit: 1.0 }],
        children: [],
        related: [{ id: "Executive Partnership", credit: 0.5 }]
    },
    {
        id: "Account Management",
        aliases: ["Client Management", "Customer Management", "Key Accounts"],
        parents: [],
        children: [],
        related: [
            { id: "Client Relationships", credit: 0.8 },
            { id: "Relationship Management", credit: 0.8 },
            { id: "Sales", credit: 0.6 }
        ]
    },
    {
        id: "Lead Generation",
        aliases: ["Prospecting", "Outbound"],
        parents: [],
        children: [],
        related: [
            { id: "Pipeline Development", credit: 0.8 },
            { id: "Business Development", credit: 0.7 },
            { id: "Cold Outreach", credit: 0.7 }
        ]
    },
    {
        id: "Project Management",
        aliases: ["Program Management", "Initiative Management"],
        parents: [],
        children: [],
        related: [
            { id: "Cross-Functional Leadership", credit: 0.7 },
            { id: "Stakeholder Management", credit: 0.6 }
        ]
    },
    {
        id: "Presentation Skills",
        aliases: ["Presentations"],
        parents: [],
        children: [],
        related: [
            { id: "Executive Presentations", credit: 0.9 },
            { id: "Stakeholder Presentations", credit: 0.9 },
            { id: "Client Presentations", credit: 0.9 }
        ]
    },
    {
        id: "Stakeholder Management",
        aliases: ["Stakeholder Engagement"],
        parents: [],
        children: [],
        related: [
            { id: "Executive Partnership", credit: 0.8 },
            { id: "C-Suite Partnership", credit: 0.8 },
            { id: "Cross-Functional", credit: 0.7 }
        ]
    },
    // Engineering
    {
        id: "Machine Learning",
        aliases: ["ML", "AI/ML"],
        parents: [],
        children: [
            { id: "Deep Learning", credit: 0.6 },
            { id: "Neural Networks", credit: 0.6 },
            { id: "NLP", credit: 0.6 }
        ],
        related: [{ id: "Data Science", credit: 0.7 }]
    },
    {
        id: "Deep Learning",
        aliases: ["DL"],
        parents: [{ id: "Machine Learning", credit: 1.0 }],
        children: [],
        related: [{ id: "Neural Networks", credit: 0.8 }]
    },
    {
        id: "JavaScript",
        aliases: ["JS", "ECMAScript", "ES6"],
        parents: [],
        children: [],
        related: [{ id: "TypeScript", credit: 0.8 }]
    },
    {
        id: "TypeScript",
        aliases: ["TS"],
        parents: [],
        children: [],
        related: [{ id: "JavaScript", credit: 0.9 }]
    },
    {
        id: "React",
        aliases: ["React.js", "ReactJS"],
        parents: [],
        children: [{ id: "React Native", credit: 0.6 }],
        related: [{ id: "JavaScript", credit: 0.5 }]
    },
    {
        id: "Node.js",
        aliases: ["Node", "NodeJS"],
        parents: [],
        children: [{ id: "Express.js", credit: 0.6 }],
        related: [{ id: "JavaScript", credit: 0.6 }]
    },
    {
        id: "Python",
        aliases: ["Python 3", "Python Development"],
        parents: [],
        children: [],
        related: [{ id: "Data Science", credit: 0.5 }]
    },
    // Sales
    {
        id: "Sales",
        aliases: ["Revenue Generation", "Closing"],
        parents: [],
        children: [
            { id: "Account Executive", credit: 0.6 },
            { id: "Enterprise Sales", credit: 0.6 }
        ],
        related: [
            { id: "Business Development", credit: 0.7 },
            { id: "Account Management", credit: 0.6 }
        ]
    },
    {
        id: "CRM",
        aliases: [],
        parents: [],
        children: [
            { id: "Salesforce", credit: 0.6 },
            { id: "HubSpot", credit: 0.6 }
        ],
        related: [{ id: "Pipeline Management", credit: 0.7 }]
    },
    // Operations
    {
        id: "Process Improvement",
        aliases: ["Operational Excellence", "Continuous Improvement"],
        parents: [],
        children: [
            { id: "Lean", credit: 0.6 },
            { id: "Six Sigma", credit: 0.6 }
        ],
        related: []
    },
    {
        id: "Team Management",
        aliases: ["People Management", "Staff Management"],
        parents: [],
        children: [{ id: "Direct Reports", credit: 0.6 }],
        related: [{ id: "Team Leadership", credit: 0.9 }]
    },
    {
        id: "Leadership",
        aliases: ["Management"],
        parents: [],
        children: [
            { id: "Team Lead", credit: 0.6 },
            { id: "Head of", credit: 0.6 }
        ],
        related: [{ id: "Supervision", credit: 0.7 }]
    },
    // Soft skills
    {
        id: "Communication",
        aliases: [],
        parents: [],
        children: [
            { id: "Written Communication", credit: 0.6 },
            { id: "Verbal Communication", credit: 0.6 }
        ],
        related: [{ id: "Storytelling", credit: 0.6 }]
    },
    {
        id: "Collaboration",
        aliases: ["Teamwork"],
        parents: [],
        children: [],
        related: [
            { id: "Cross-Functional Collaboration", credit: 0.9 },
            { id: "Partnership", credit: 0.7 }
        ]
    }
];

// Build lookup maps for efficient matching
const SKILL_ONTOLOGY_MAP: Map<string, SkillOntologyNode> = new Map();
const SKILL_ALIAS_MAP: Map<string, string> = new Map(); // alias → canonical id

for (const node of SKILL_ONTOLOGY) {
    SKILL_ONTOLOGY_MAP.set(node.id, node);
    for (const alias of node.aliases) {
        SKILL_ALIAS_MAP.set(alias.toLowerCase(), node.id);
    }
    // Also map the id itself (lowercase)
    SKILL_ALIAS_MAP.set(node.id.toLowerCase(), node.id);
}

/**
 * Get the credit for matching a resume skill against a JD skill.
 * Returns 0-1 where 1 = perfect match, 0 = no match.
 */
export function getMatchCredit(jdSkill: string, resumeSkill: string): { credit: number; matchType: string } {
    // Normalize to lowercase for comparison
    const jdLower = jdSkill.toLowerCase();
    const resumeLower = resumeSkill.toLowerCase();

    // Direct match
    if (jdLower === resumeLower) {
        return { credit: 1.0, matchType: "exact" };
    }

    // Get canonical IDs
    const jdCanonical = SKILL_ALIAS_MAP.get(jdLower);
    const resumeCanonical = SKILL_ALIAS_MAP.get(resumeLower);

    // If both map to same canonical skill, it's an alias match
    if (jdCanonical && resumeCanonical && jdCanonical === resumeCanonical) {
        return { credit: 1.0, matchType: "alias" };
    }

    // Look up ontology relationships
    const jdNode = jdCanonical ? SKILL_ONTOLOGY_MAP.get(jdCanonical) : null;
    const resumeNode = resumeCanonical ? SKILL_ONTOLOGY_MAP.get(resumeCanonical) : null;

    if (jdNode && resumeCanonical) {
        // Check if resume skill is a parent of JD skill (parent satisfies child fully)
        for (const parent of jdNode.parents) {
            if (parent.id === resumeCanonical) {
                return { credit: parent.credit, matchType: "parent" };
            }
        }

        // Check if resume skill is a child of JD skill (child partially satisfies parent)
        for (const child of jdNode.children) {
            if (child.id === resumeCanonical) {
                return { credit: child.credit, matchType: "child" };
            }
        }

        // Check related skills
        for (const rel of jdNode.related) {
            if (rel.id === resumeCanonical) {
                return { credit: rel.credit, matchType: "related" };
            }
        }
    }

    // Check reverse relationships (resume node's relationships to JD skill)
    if (resumeNode && jdCanonical) {
        for (const parent of resumeNode.parents) {
            if (parent.id === jdCanonical) {
                // Resume has child, JD wants parent → partial credit
                return { credit: 0.6, matchType: "child" };
            }
        }

        for (const child of resumeNode.children) {
            if (child.id === jdCanonical) {
                // Resume has parent, JD wants child → full credit
                return { credit: 1.0, matchType: "parent" };
            }
        }

        for (const rel of resumeNode.related) {
            if (rel.id === jdCanonical) {
                return { credit: rel.credit, matchType: "related" };
            }
        }
    }

    return { credit: 0, matchType: "none" };
}

// ----- JD REQUIREMENT PARSING (Oracle Phase 3) -----
// Detects required vs preferred qualification sections in job descriptions

export type RequirementTier = "required" | "preferred" | "unlabeled";

export interface JDRequirement {
    skillId: string;
    tier: RequirementTier;
    baseWeight: number;
    evidence: {
        section: string | null;
        marker: string | null;
        occurrences: number;
    };
}

// Patterns to detect required qualifications
const REQUIRED_SECTION_PATTERNS = [
    /minimum\s*qualifications?/i,
    /required\s*(?:qualifications?|skills?|experience)/i,
    /must\s*have/i,
    /requirements?/i,
    /what\s*you['']?ll?\s*need/i,
    /you\s*(?:must|should)\s*have/i,
    /essential\s*(?:qualifications?|skills?)/i,
];

const REQUIRED_MARKER_PATTERNS = [
    /\brequired\b/i,
    /\bmust\s*have\b/i,
    /\bmandatory\b/i,
    /\bessential\b/i,
    /\bminimum\b/i,
];

// Patterns to detect preferred qualifications
const PREFERRED_SECTION_PATTERNS = [
    /preferred\s*qualifications?/i,
    /nice\s*to\s*have/i,
    /bonus\s*(?:qualifications?|skills?)?/i,
    /desired\s*(?:qualifications?|skills?)/i,
    /plus\s*(?:points?|skills?)/i,
    /additional\s*(?:qualifications?|skills?)/i,
];

const PREFERRED_MARKER_PATTERNS = [
    /\bpreferred\b/i,
    /\bnice\s*to\s*have\b/i,
    /\bbonus\b/i,
    /\bdesired\b/i,
    /\bplus\b/i,
    /\bideal(?:ly)?\b/i,
];

/**
 * Parse JD text to identify which skills are required vs preferred.
 * Returns requirements grouped by tier for tiered scoring.
 */
export function parseJDRequirements(
    jdText: string,
    extractedSkills: Map<string, { weight: number; category: string }>
): Map<string, JDRequirement> {
    const requirements = new Map<string, JDRequirement>();
    const jdLower = jdText.toLowerCase();

    // Split JD into sections based on headers/line breaks
    const sections = jdText.split(/\n\n+|\n(?=[A-Z][^a-z]*:)/);

    // Identify section tiers
    let currentTier: RequirementTier = "unlabeled";
    const skillTierMap = new Map<string, RequirementTier>();

    for (const section of sections) {
        const sectionLower = section.toLowerCase();

        // Check if this section starts a required block
        for (const pattern of REQUIRED_SECTION_PATTERNS) {
            if (pattern.test(sectionLower)) {
                currentTier = "required";
                break;
            }
        }

        // Check if this section starts a preferred block
        for (const pattern of PREFERRED_SECTION_PATTERNS) {
            if (pattern.test(sectionLower)) {
                currentTier = "preferred";
                break;
            }
        }

        // For each extracted skill, check if it appears in this section
        for (const [skillId] of extractedSkills) {
            const skillLower = skillId.toLowerCase();
            if (sectionLower.includes(skillLower)) {
                // Only update if not already set or if we're more specific
                if (!skillTierMap.has(skillId) ||
                    (skillTierMap.get(skillId) === "unlabeled" && currentTier !== "unlabeled")) {
                    skillTierMap.set(skillId, currentTier);
                }
            }
        }
    }

    // Also check for inline markers (e.g., "Python (required)")
    for (const [skillId, { weight }] of extractedSkills) {
        const skillLower = skillId.toLowerCase();
        const skillIndex = jdLower.indexOf(skillLower);

        let detectedTier: RequirementTier = skillTierMap.get(skillId) || "unlabeled";
        let marker: string | null = null;

        // Only look for inline markers if skill is found in text
        if (skillIndex !== -1) {
            // Look at surrounding context (50 chars before/after)
            const contextStart = Math.max(0, skillIndex - 50);
            const contextEnd = Math.min(jdLower.length, skillIndex + skillId.length + 50);
            const context = jdLower.slice(contextStart, contextEnd);

            // Check for required markers in context
            for (const pattern of REQUIRED_MARKER_PATTERNS) {
                if (pattern.test(context)) {
                    detectedTier = "required";
                    marker = "required";
                    break;
                }
            }

            // Check for preferred markers in context (only if not already required)
            if (detectedTier !== "required") {
                for (const pattern of PREFERRED_MARKER_PATTERNS) {
                    if (pattern.test(context)) {
                        detectedTier = "preferred";
                        marker = "preferred";
                        break;
                    }
                }
            }
        }

        // Always add the skill to requirements (even if not found literally)
        requirements.set(skillId, {
            skillId,
            tier: detectedTier,
            baseWeight: weight,
            evidence: {
                section: null,
                marker,
                occurrences: 1
            }
        });
    }

    return requirements;
}

export function normalizeText(text: string): string {
    let normalized = text.toLowerCase();
    // Apply lemmatization
    for (const [variant, lemma] of Object.entries(LEMMA_MAP)) {
        normalized = normalized.replace(new RegExp(`\\b${variant}\\b`, 'gi'), lemma);
    }
    // Normalize punctuation and spacing
    normalized = normalized
        .replace(/[–—]/g, '-')     // em/en dashes to hyphen
        .replace(/\s+/g, ' ')      // multiple spaces to single
        .trim();
    return normalized;
}

// ----- SKILL ALIASES (Canonical Skill IDs) -----
// Maps various surface forms to canonical skill IDs across ALL industries

export const SKILL_ALIASES: Record<string, string[]> = {
    // ===== TECHNOLOGY =====
    'Machine Learning': ['ml', 'deep learning', 'neural network', 'ai/ml', 'ml/ai',
        'machine learning engineer', 'mlops', 'model training'],
    'Data Science': ['data scientist', 'data scientists', 'data analysis', 'statistical modeling',
        'predictive analytics', 'data mining', 'big data'],
    'Cloud Computing': ['cloud infrastructure', 'cloud services', 'cloud platform', 'cloud native',
        'cloud architect', 'cloud engineer', 'multi-cloud'],
    'AWS': ['amazon web services', 'aws certified', 'ec2', 's3', 'lambda', 'dynamodb', 'sagemaker'],
    'GCP': ['google cloud', 'google cloud platform', 'bigquery', 'gke', 'cloud functions'],
    'Azure': ['microsoft azure', 'azure devops', 'azure functions', 'azure ad'],
    'DevOps': ['devsecops', 'site reliability', 'sre', 'infrastructure as code', 'iac',
        'continuous deployment', 'continuous integration'],
    'Backend Development': ['backend engineer', 'server-side', 'api development', 'microservices',
        'distributed systems', 'system design'],
    'Frontend Development': ['frontend engineer', 'ui development', 'web development',
        'client-side', 'spa', 'single page application'],
    'Full Stack': ['full-stack', 'fullstack engineer', 'end-to-end development'],

    // ===== HR/RECRUITING =====
    'ATS': ['applicant tracking', 'applicant tracking system', 'greenhouse', 'lever',
        'workday recruiting', 'icims', 'taleo', 'smartrecruiters', 'jobvite'],
    'HRIS': ['human resource information system', 'workday', 'successfactors', 'adp',
        'bamboohr', 'rippling', 'namely', 'ultipro', 'ukg', 'ceridian', 'dayforce'],
    'Sourcing': ['sourcer', 'sourcers', 'sourced', 'sourcing', 'talent sourcing',
        'candidate sourcing', 'passive candidate', 'boolean search', 'linkedin recruiter'],
    'Stakeholder Management': ['stakeholder', 'executive partner', 'business partner',
        'cross-functional', 'c-suite', 'senior leadership',
        'executive leadership', 'leadership team', 'partner with'],

    // Recruiting Specialties
    'Engineering Recruiting': ['engineering recruiting', 'software recruiting', 'swe recruiting',
        'technical hiring', 'engineering hiring', 'software engineer hiring', 'engineering talent',
        'ai/ml recruiting', 'ml recruiting', 'ai recruiting', 'engineering org', 'software engineering hiring'],
    'Volume Hiring': ['volume hiring', 'high-volume recruiting', 'high volume hiring', 'mass hiring',
        'volume recruiting', 'scaled hiring', 'high-volume', 'volume recruitment'],
    'High-Volume Recruiting': ['high-volume', 'high volume', 'volume hiring', 'mass hiring',
        'scaled recruiting', 'volume recruitment', '100+ hires', '1000+ hires', 'rapid hiring'],
    'Candidate Experience': ['candidate experience', 'candidate journey', 'candidate satisfaction',
        'nps', 'offer acceptance', 'candidate engagement', 'interview experience'],

    // ===== FINANCE =====
    'Financial Modeling': ['financial models', 'dcf', 'dcf model', 'lbo model', 'merger model',
        '3-statement model', 'financial projections', 'valuation model'],
    'Investment Banking': ['ib', 'm&a advisory', 'capital markets', 'deal execution',
        'pitch books', 'transaction advisory'],
    'Private Equity': ['pe', 'leveraged buyout', 'portfolio company', 'value creation',
        'growth equity', 'buyout'],
    'Venture Capital': ['vc', 'early-stage', 'seed funding', 'series a', 'startup investing'],
    'FP&A': ['financial planning', 'financial planning and analysis', 'budgeting and forecasting',
        'variance analysis', 'rolling forecast'],
    'Accounting': ['gaap', 'ifrs', 'general ledger', 'journal entries', 'month-end close',
        'reconciliation', 'accruals'],
    'Auditing': ['internal audit', 'external audit', 'sox compliance', 'audit procedures',
        'control testing'],

    // ===== HEALTHCARE =====
    'Clinical Research': ['clinical trials', 'clinical studies', 'clinical development',
        'phase i', 'phase ii', 'phase iii', 'irb'],
    'Patient Care': ['patient outcomes', 'patient experience', 'bedside manner',
        'patient satisfaction', 'patient-centered'],
    'Electronic Health Records': ['ehr', 'emr', 'epic', 'cerner', 'meditech', 'allscripts'],
    'Medical Coding': ['icd-10', 'cpt codes', 'medical billing', 'hcpcs', 'drg'],
    'Regulatory Affairs': ['fda', 'fda submission', '510k', 'pma', 'regulatory submission',
        'compliance'],

    // ===== MARKETING =====
    'Digital Marketing': ['online marketing', 'internet marketing', 'digital advertising',
        'performance marketing', 'growth marketing'],
    'SEO': ['search engine optimization', 'organic search', 'keyword research',
        'on-page seo', 'off-page seo', 'technical seo'],
    'Paid Media': ['ppc', 'paid advertising', 'paid search', 'paid social', 'media buying',
        'programmatic', 'display advertising'],
    'Content Marketing': ['content strategy', 'content creation', 'editorial', 'blogging',
        'thought leadership'],
    'Marketing Analytics': ['marketing attribution', 'campaign analytics', 'marketing roi',
        'conversion tracking', 'multi-touch attribution'],
    'CRM': ['customer relationship management', 'salesforce', 'hubspot crm', 'dynamics 365',
        'customer database'],

    // ===== SALES =====
    'Enterprise Sales': ['enterprise accounts', 'large accounts', 'strategic accounts',
        'complex sales', 'solution selling'],
    'SaaS Sales': ['software sales', 'subscription sales', 'arr', 'mrr', 'land and expand'],
    'Sales Ops': ['sales operations', 'sales enablement', 'sales analytics', 'territory planning',
        'quota setting', 'commission structures'],
    'Account Management': ['account manager', 'customer success', 'client management',
        'customer retention', 'upselling', 'cross-selling'],

    // ===== OPERATIONS =====
    'Supply Chain': ['supply chain management', 'scm', 'logistics', 'procurement',
        'vendor management', 'inventory management'],
    'Six Sigma': ['lean six sigma', 'process improvement', 'dmaic', 'black belt', 'green belt'],
    'Project Management': ['pm', 'pmp', 'project manager', 'program management', 'pmo',
        'project planning', 'project execution'],
    'Product Management': ['product manager', 'product owner', 'product development',
        'product roadmap', 'product strategy', 'feature prioritization'],

    // ===== LEADERSHIP/SOFT SKILLS =====
    'Team Leadership': ['team lead', 'people management', 'managed a team', 'led a team',
        'direct reports', 'team of', 'cross-functional leadership'],
    'Strategic Planning': ['strategic initiatives', 'business strategy', 'long-term planning',
        'strategic vision', 'roadmap development'],
    'Change Management': ['organizational change', 'transformation', 'change initiatives',
        'adoption', 'stakeholder buy-in'],

    // ===== COMPREHENSIVE SOFT SKILLS =====
    // These patterns detect soft skills from explicit mentions or implied evidence

    // Teamwork & Collaboration
    'Teamwork': ['team player', 'team environment', 'team-oriented', 'teamwork',
        'worked with teams', 'team collaboration', 'team dynamics', 'team success'],
    'Collaboration': ['collaborated', 'partnered with', 'cross-team', 'joint efforts',
        'stakeholder collaboration', 'working together', 'cooperative'],
    'Cross-Functional': ['cross-functional', 'cross functional', 'multi-functional',
        'across departments', 'across teams', 'cross-team', 'matrix organization'],

    // Communication
    'Communication': ['communication skills', 'communicating', 'presentations',
        'written communication', 'verbal communication', 'public speaking'],
    'Presentation Skills': ['presented', 'presenting', 'presentations', 'public speaking',
        'executive presentations', 'boardroom presentations'],
    'Written Communication': ['written communication', 'documentation', 'reports',
        'technical writing', 'proposal writing', 'business writing'],

    // Leadership & Management
    'Leadership': ['leadership', 'led', 'leading', 'leader', 'leadership skills',
        'thought leadership', 'executive leadership'],
    'People Management': ['people management', 'managed a team', 'direct reports',
        'team management', 'staff management', 'employee management'],
    'Mentoring': ['mentored', 'mentoring', 'coaching', 'developed talent',
        'career development', 'training others'],
    'Delegation': ['delegated', 'delegating', 'task assignment', 'workload distribution'],

    // Problem Solving & Critical Thinking
    'Problem Solving': ['problem solving', 'problem-solving', 'troubleshooting',
        'root cause analysis', 'issue resolution', 'solution-oriented'],
    'Analytical Thinking': ['analytical', 'analysis', 'data-driven', 'critical thinking',
        'analytical skills', 'analytical approach'],
    'Decision Making': ['decision making', 'decision-making', 'strategic decisions',
        'sound judgment', 'executive decisions'],
    'Critical Thinking': ['critical thinking', 'evaluate', 'assess', 'judgment',
        'logical reasoning', 'rational analysis'],

    // Adaptability & Flexibility
    'Adaptability': ['adaptable', 'adaptability', 'flexible', 'agile', 'pivot',
        'change-ready', 'versatile', 'dynamic environment'],
    'Flexibility': ['flexible', 'flexibility', 'multi-tasking', 'juggling priorities',
        'wearing multiple hats', 'versatile'],
    'Learning Agility': ['fast learner', 'quick learner', 'continuous learning',
        'self-taught', 'ramp-up quickly', 'learning new technologies'],

    // Time Management & Organization
    'Time Management': ['time management', 'deadline-driven', 'meeting deadlines',
        'prioritization', 'time-sensitive', 'efficient'],
    'Prioritization': ['prioritization', 'prioritize', 'priority management',
        'competing priorities', 'triage', 'urgent vs important'],
    'Organization': ['organized', 'organizational skills', 'organization',
        'systematic', 'structured approach', 'attention to detail'],

    // Interpersonal & Emotional Intelligence
    'Interpersonal Skills': ['interpersonal skills', 'relationship building',
        'rapport building', 'stakeholder relationships', 'client relationships'],
    'Emotional Intelligence': ['emotional intelligence', 'eq', 'empathy',
        'self-awareness', 'social awareness', 'emotional awareness'],
    'Conflict Resolution': ['conflict resolution', 'mediation', 'negotiation',
        'resolving disputes', 'de-escalation', 'difficult conversations'],

    // Work Style & Attitude
    'Self-Motivated': ['self-motivated', 'self-starter', 'initiative', 'proactive',
        'driven', 'self-directed', 'autonomous'],
    'Attention to Detail': ['attention to detail', 'detail-oriented', 'meticulous',
        'thorough', 'accuracy', 'quality-focused'],
    'Reliability': ['reliable', 'dependable', 'consistent', 'accountable',
        'trustworthy', 'committed'],
    'Work Ethic': ['work ethic', 'hard-working', 'dedicated', 'committed',
        'results-oriented', 'performance-driven'],

    // Customer & Client Focus
    'Customer Focus': ['customer focus', 'customer-centric', 'client focus',
        'customer satisfaction', 'user experience', 'customer success'],
    'Client Relationship Management': ['client relationships', 'client management',
        'account management', 'relationship management', 'customer relations'],

    // Innovation & Creativity
    'Creativity': ['creative', 'creativity', 'innovative thinking', 'ideation',
        'brainstorming', 'creative solutions'],
    'Innovation': ['innovation', 'innovative', 'new ideas', 'continuous improvement',
        'process improvement', 'forward-thinking'],

    // Stress Management & Resilience
    'Stress Management': ['high-pressure', 'fast-paced', 'handling stress',
        'pressure situations', 'demanding environment'],
    'Resilience': ['resilient', 'resilience', 'perseverance', 'grit',
        'overcoming challenges', 'bouncing back'],
};

// ----- INFERENCE RULES -----
// Tools/systems that imply familiarity with related skills across ALL industries

export const INFERENCE_RULES: Array<{
    trigger: RegExp;
    implies: string;
    confidence: number;
    context?: string;
}> = [
        // ===== HR/RECRUITING =====
        {
            trigger: /\b(workday|successfactors|bamboohr|rippling|adp|ultipro)\b/gi,
            implies: 'HRIS', confidence: 0.9
        },
        {
            trigger: /\b(workday|successfactors|bamboohr|rippling|adp|ultipro)\b/gi,
            implies: 'ATS', confidence: 0.4, context: 'recruiting'
        },
        {
            trigger: /\b(greenhouse|lever|icims|taleo|smartrecruiters|jobvite)\b/gi,
            implies: 'ATS', confidence: 0.95
        },
        {
            trigger: /\b(engineering|software|swe|tech(nical)?)\s*(recruit|hiring|talent)/gi,
            implies: 'Technical Recruiting', confidence: 0.9
        },
        {
            trigger: /\brecruit(ing|er|ment)?\s*(for\s+)?(engineering|software|swe|tech)/gi,
            implies: 'Technical Recruiting', confidence: 0.9
        },
        {
            trigger: /\b(executive|c-suite|vp|director)\s*(search|recruit|hiring)/gi,
            implies: 'Executive Search', confidence: 0.85
        },
        // Engineering Recruiting signals
        {
            trigger: /\b(ai|ml|ai\/ml|machine\s+learning)\s*(swe|software|recruiting|hiring|engineer)/gi,
            implies: 'Engineering Recruiting', confidence: 0.95
        },
        {
            trigger: /\b(software|swe)\s*(engineering|engineer)\s*(recruiting|hiring|talent)/gi,
            implies: 'Engineering Recruiting', confidence: 0.9
        },
        {
            trigger: /\bengineering\s*(org|organization|team|hiring|talent)/gi,
            implies: 'Engineering Recruiting', confidence: 0.85
        },
        {
            trigger: /\brecruit(ing|er)?\s*(for\s+)?(ai|ml|software|swe|engineering)/gi,
            implies: 'Engineering Recruiting', confidence: 0.9
        },
        // Volume Hiring signals
        {
            trigger: /\b\d{3,}\+?\s*(hires?|offers?|candidates?)/gi,
            implies: 'Volume Hiring', confidence: 0.9
        },
        {
            trigger: /\b(scaled|scaling)\s*(team|org|hiring)\s*(from\s+)?\d+\s*(to\s+)?\d+/gi,
            implies: 'Volume Hiring', confidence: 0.9
        },
        {
            trigger: /\b(high-volume|high\s+volume|mass|rapid)\s*(hiring|recruiting|recruitment)/gi,
            implies: 'Volume Hiring', confidence: 0.95
        },
        {
            trigger: /\b(volume|scaled)\s*(hiring|recruiting|recruitment)/gi,
            implies: 'Volume Hiring', confidence: 0.9
        },
        // Candidate Experience signals
        {
            trigger: /\b(candidate|applicant)\s*(experience|satisfaction|nps|journey)/gi,
            implies: 'Candidate Experience', confidence: 0.9
        },
        {
            trigger: /\b(offer\s+accept(ance)?|interview\s+experience|hiring\s+process)/gi,
            implies: 'Candidate Experience', confidence: 0.85
        },
        {
            trigger: /\bmanager\s+(pulse|satisfaction|rating|survey)/gi,
            implies: 'Candidate Experience', confidence: 0.8
        },
        {
            trigger: /\b(managed|led|directed)\s*(a\s+)?(team|org|department|group)\s+of\s+\d+/gi,
            implies: 'Team Leadership', confidence: 0.9
        },
        // ===== SOFT SKILLS (INFERRED FROM EVIDENCE) =====
        // Teamwork signals
        {
            trigger: /\b(managed|led|directed)\s*(a\s+)?(team|org|department|group)/gi,
            implies: 'Teamwork', confidence: 0.95
        },
        {
            trigger: /\b(collaborated|partnered|worked)\s+(with|alongside|closely)/gi,
            implies: 'Teamwork', confidence: 0.9
        },
        {
            trigger: /\b(team\s+(player|member|environment)|cross-team|inter-team)/gi,
            implies: 'Teamwork', confidence: 0.85
        },
        // Cross-Functional signals
        {
            trigger: /\b(cross-functional|cross\s+functional|cross-team|multi-team)/gi,
            implies: 'Cross-Functional', confidence: 0.95
        },
        {
            trigger: /\bacross\s+(teams?|departments?|orgs?|regions?|functions?)/gi,
            implies: 'Cross-Functional', confidence: 0.9
        },
        {
            trigger: /\b(coordinated|coordinating)\s+(staffing\s+)?efforts?\s+across/gi,
            implies: 'Cross-Functional', confidence: 0.9
        },
        {
            trigger: /\bmultiple\s+(teams?|departments?|regions?|stakeholders?)/gi,
            implies: 'Cross-Functional', confidence: 0.85
        },
        // Collaboration signals
        {
            trigger: /\b(collaborated|partnered|coordinated)\s+with\s+(\w+\s+)*(leadership|executives?|stakeholders?|teams?)/gi,
            implies: 'Collaboration', confidence: 0.9
        },
        {
            trigger: /\b(stakeholder\s+(management|engagement|alignment)|executive\s+alignment)/gi,
            implies: 'Collaboration', confidence: 0.85
        },
        // Communication signals
        {
            trigger: /\b(presented|presenting)\s+to\s+(\w+\s+)*(leadership|executives?|c-suite|board)/gi,
            implies: 'Communication', confidence: 0.9
        },
        {
            trigger: /\b(executive|leadership)\s+(presentations?|briefings?|updates?)/gi,
            implies: 'Communication', confidence: 0.85
        },
        {
            trigger: /\bfacilitated\s+(\w+\s+)*(training|sessions?|meetings?|workshops?)/gi,
            implies: 'Communication', confidence: 0.85
        },
        {
            trigger: /\bchief\s*(people|hr|talent)\s*officer\b/gi,
            implies: 'Stakeholder Management', confidence: 0.85
        },
        {
            trigger: /\bhead\s+of\s+(hr|people|talent|recruiting)\b/gi,
            implies: 'Stakeholder Management', confidence: 0.8
        },

        // Problem Solving & Analytical signals
        {
            trigger: /\b(solved|solving|resolved|resolving)\s+(\w+\s+)*(problems?|issues?|challenges?)/gi,
            implies: 'Problem Solving', confidence: 0.9
        },
        {
            trigger: /\b(troubleshoot|debug|diagnos|root\s+cause)/gi,
            implies: 'Problem Solving', confidence: 0.85
        },
        {
            trigger: /\b(analyzed|analyzing|analysis)\s+(\w+\s+)*(data|metrics|trends|performance)/gi,
            implies: 'Analytical Thinking', confidence: 0.9
        },
        {
            trigger: /\bdata-driven\s+(decisions?|insights?|approach)/gi,
            implies: 'Analytical Thinking', confidence: 0.85
        },

        // Leadership signals
        {
            trigger: /\b(spearheaded|championed|pioneered|drove|driving)\s+/gi,
            implies: 'Leadership', confidence: 0.9
        },
        {
            trigger: /\b(executive|senior|c-suite|c-level)\s+(leadership|experience)/gi,
            implies: 'Leadership', confidence: 0.9
        },
        {
            trigger: /\b(built|scaling|scaled)\s+(a\s+)?(team|org|department|function)/gi,
            implies: 'Leadership', confidence: 0.85
        },

        // Mentoring & Coaching signals
        {
            trigger: /\b(mentored|coached|developed)\s+(\w+\s+)*(talent|employees?|team\s+members?|staff)/gi,
            implies: 'Mentoring', confidence: 0.9
        },
        {
            trigger: /\b(onboarding|training)\s+(\w+\s+)*(program|new\s+hires?|employees?)/gi,
            implies: 'Mentoring', confidence: 0.85
        },
        {
            trigger: /\bcareer\s+(development|growth|coaching)/gi,
            implies: 'Mentoring', confidence: 0.85
        },

        // Adaptability & Change signals
        {
            trigger: /\b(navigated|pivoted|adapted)\s+(\w+\s+)*(change|transition|transformation)/gi,
            implies: 'Adaptability', confidence: 0.9
        },
        {
            trigger: /\b(fast-paced|rapidly\s+changing|dynamic)\s+(environment|organization)/gi,
            implies: 'Adaptability', confidence: 0.85
        },
        {
            trigger: /\b(ambiguity|uncertainty|evolving\s+priorities)/gi,
            implies: 'Adaptability', confidence: 0.85
        },

        // Time Management & Prioritization signals
        {
            trigger: /\b(managed|managing)\s+(\w+\s+)*(multiple|competing)\s+(projects?|priorities|deadlines?)/gi,
            implies: 'Time Management', confidence: 0.9
        },
        {
            trigger: /\b(deadline|time-sensitive|urgent)\s+(driven|delivery|projects?)/gi,
            implies: 'Time Management', confidence: 0.85
        },
        {
            trigger: /\b(prioritized|prioritizing|triage)\s+/gi,
            implies: 'Prioritization', confidence: 0.85
        },

        // Customer/Client Focus signals
        {
            trigger: /\b(client|customer)\s+(facing|success|satisfaction|relationships?)/gi,
            implies: 'Customer Focus', confidence: 0.9
        },
        {
            trigger: /\b(account\s+management|client\s+management)/gi,
            implies: 'Client Relationship Management', confidence: 0.9
        },

        // Innovation signals
        {
            trigger: /\b(implemented|introduced|launched)\s+(\w+\s+)*(first|new|innovative)/gi,
            implies: 'Innovation', confidence: 0.85
        },
        {
            trigger: /\b(process\s+improvement|continuous\s+improvement|optimization)/gi,
            implies: 'Innovation', confidence: 0.85
        },

        // Resilience & High-Pressure signals
        {
            trigger: /\b(high-pressure|demanding|challenging)\s+(environment|situations?|roles?)/gi,
            implies: 'Resilience', confidence: 0.85
        },
        {
            trigger: /\b(overcame|overcoming)\s+(\w+\s+)*(challenges?|obstacles?|setbacks?)/gi,
            implies: 'Resilience', confidence: 0.85
        },

        // Decision Making signals
        {
            trigger: /\b(strategic|executive)\s+(decisions?|decision-making)/gi,
            implies: 'Decision Making', confidence: 0.9
        },
        {
            trigger: /\b(informed|data-driven|sound)\s+(judgment|decisions?)/gi,
            implies: 'Decision Making', confidence: 0.85
        },

        // Conflict Resolution signals
        {
            trigger: /\b(resolved|resolving|mediated)\s+(\w+\s+)*(conflicts?|disputes?|issues?)/gi,
            implies: 'Conflict Resolution', confidence: 0.9
        },
        {
            trigger: /\b(difficult\s+conversations?|performance\s+(issues?|management))/gi,
            implies: 'Conflict Resolution', confidence: 0.85
        },

        // Interpersonal signals  
        {
            trigger: /\b(build|built|building)\s+(\w+\s+)*(relationships?|rapport|trust)/gi,
            implies: 'Interpersonal Skills', confidence: 0.9
        },
        {
            trigger: /\b(stakeholder|executive|client)\s+(relationships?|engagement)/gi,
            implies: 'Interpersonal Skills', confidence: 0.85
        },

        // ===== TECHNOLOGY =====
        {
            trigger: /\b(meta|facebook|google|amazon|apple|microsoft|netflix|openai|anthropic|stripe|uber|airbnb)\b/gi,
            implies: 'Big Tech Experience', confidence: 0.85
        },
        {
            trigger: /\baws\s+(certified|certification|solutions?\s+architect)/gi,
            implies: 'AWS', confidence: 0.95
        },
        {
            trigger: /\b(gcp|google\s+cloud)\s+(certified|certification)/gi,
            implies: 'GCP', confidence: 0.95
        },
        {
            trigger: /\bazure\s+(certified|certification)/gi,
            implies: 'Azure', confidence: 0.95
        },
        {
            trigger: /\b(kubernetes|k8s|docker)\s*(orchestration|cluster|deploy)/gi,
            implies: 'DevOps', confidence: 0.8
        },
        {
            trigger: /\b(ci\/cd|jenkins|github\s+actions|circleci|gitlab\s+ci)/gi,
            implies: 'DevOps', confidence: 0.85
        },
        {
            trigger: /\b(tensorflow|pytorch|scikit|keras)\b/gi,
            implies: 'Machine Learning', confidence: 0.9
        },
        {
            trigger: /\b(react|vue|angular)\s*(native|js)?/gi,
            implies: 'Frontend Development', confidence: 0.85
        },
        {
            trigger: /\b(node\.?js|express|fastapi|django|rails)\b/gi,
            implies: 'Backend Development', confidence: 0.85
        },
        {
            trigger: /\b(microservices?|distributed\s+systems?|system\s+design)/gi,
            implies: 'Backend Development', confidence: 0.7
        },

        // ===== FINANCE =====
        {
            trigger: /\b(dcf|lbo|merger\s+model|3-statement)\s*(model|analysis)?/gi,
            implies: 'Financial Modeling', confidence: 0.9
        },
        {
            trigger: /\b(pitch\s*book|deal\s+execution|transaction\s+advisory)/gi,
            implies: 'Investment Banking', confidence: 0.85
        },
        {
            trigger: /\b(cpa|cfa|chartered\s+accountant)\b/gi,
            implies: 'Accounting', confidence: 0.9
        },
        {
            trigger: /\b(sox|sarbanes|internal\s+audit|control\s+testing)/gi,
            implies: 'Auditing', confidence: 0.85
        },
        {
            trigger: /\b(bloomberg\s+terminal|capital\s+iq|factset|pitchbook)/gi,
            implies: 'Financial Analysis', confidence: 0.85
        },
        {
            trigger: /\b(portfolio\s+(company|companies)|value\s+creation)/gi,
            implies: 'Private Equity', confidence: 0.8
        },

        // ===== HEALTHCARE =====
        {
            trigger: /\b(epic|cerner|meditech|allscripts)\b/gi,
            implies: 'Electronic Health Records', confidence: 0.9
        },
        {
            trigger: /\b(rn|registered\s+nurse|bsn|msn)\b/gi,
            implies: 'Nursing', confidence: 0.9
        },
        {
            trigger: /\b(icd-?10|cpt|hcpcs|drg)/gi,
            implies: 'Medical Coding', confidence: 0.9
        },
        {
            trigger: /\b(fda|510k|pma|regulatory\s+submission)/gi,
            implies: 'Regulatory Affairs', confidence: 0.85
        },
        {
            trigger: /\b(phase\s+[i123]|clinical\s+trial|irb|gcp)/gi,
            implies: 'Clinical Research', confidence: 0.85
        },

        // ===== MARKETING =====
        {
            trigger: /\b(google\s+ads|facebook\s+ads|meta\s+ads|linkedin\s+ads)/gi,
            implies: 'Paid Media', confidence: 0.9
        },
        {
            trigger: /\b(hubspot|marketo|pardot|mailchimp|klaviyo)\b/gi,
            implies: 'Marketing Automation', confidence: 0.85
        },
        {
            trigger: /\b(google\s+analytics|ga4|mixpanel|amplitude)\b/gi,
            implies: 'Marketing Analytics', confidence: 0.85
        },
        {
            trigger: /\b(ahrefs|semrush|moz|screaming\s+frog)\b/gi,
            implies: 'SEO', confidence: 0.9
        },
        {
            trigger: /\b(salesforce|hubspot\s+crm|dynamics\s+365)\b/gi,
            implies: 'CRM', confidence: 0.85
        },

        // ===== SALES =====
        {
            trigger: /\b(salesforce|gong|outreach|salesloft)\b/gi,
            implies: 'Sales Tools', confidence: 0.85
        },
        {
            trigger: /\b(arr|mrr|nrr|expansion\s+revenue)\b/gi,
            implies: 'SaaS Sales', confidence: 0.8
        },
        {
            trigger: /\b(quota\s+(attainment|carrying)|president'?s?\s+club)/gi,
            implies: 'Sales Performance', confidence: 0.85
        },

        // ===== OPERATIONS =====
        {
            trigger: /\b(lean\s+six\s+sigma|dmaic|black\s+belt|green\s+belt)\b/gi,
            implies: 'Six Sigma', confidence: 0.9
        },
        {
            trigger: /\b(pmp|prince2|scrum\s+master|csm)\b/gi,
            implies: 'Project Management', confidence: 0.9
        },
        {
            trigger: /\b(supply\s+chain|procurement|vendor\s+management)\b/gi,
            implies: 'Supply Chain', confidence: 0.85
        },
        {
            trigger: /\b(jira|asana|monday\.com|trello)\b/gi,
            implies: 'Project Management', confidence: 0.7
        },
    ];

// ----- ROLE ARCHETYPES -----
// Detect role type to apply appropriate skill bundles

export const ROLE_ARCHETYPES: Array<{
    name: string;
    titlePatterns: RegExp[];
    contextPatterns: RegExp[];
    impliedSkills: Array<{ skill: string; confidence: number }>;
}> = [
        {
            name: 'Technical Recruiting',
            titlePatterns: [
                /\b(technical|engineering|software|swe|it)\s*(recruit|talent)/gi,
                /\brecruit(er|ing|ment).*?(engineering|technical|software)/gi,
            ],
            contextPatterns: [
                /\b(engineering|software|platform|infrastructure|ml|ai|data)\s*(team|org|hiring)/gi,
            ],
            impliedSkills: [
                { skill: 'Technical Recruiting', confidence: 0.9 },
                { skill: 'Sourcing', confidence: 0.7 },
                { skill: 'ATS', confidence: 0.5 },
                { skill: 'Stakeholder Management', confidence: 0.6 },
                { skill: 'Boolean Search', confidence: 0.5 },
            ],
        },
        {
            name: 'Executive Recruiting',
            titlePatterns: [
                /\bexecutive\s*(search|recruit)/gi,
                /\b(c-suite|vp|director)\s*recruit/gi,
            ],
            contextPatterns: [
                /\b(executive|leadership|c-level|board)\s*(search|placement|hire)/gi,
            ],
            impliedSkills: [
                { skill: 'Executive Search', confidence: 0.9 },
                { skill: 'Stakeholder Management', confidence: 0.85 },
                { skill: 'Negotiation', confidence: 0.6 },
            ],
        },
        {
            name: 'HR Leadership',
            titlePatterns: [
                /\b(chief|head)\s*(people|hr|talent)\s*(officer)?/gi,
                /\bvp\s*(of\s+)?(hr|people|talent)/gi,
            ],
            contextPatterns: [
                /\b(people\s+strategy|hr\s+transformation|culture)/gi,
            ],
            impliedSkills: [
                { skill: 'Stakeholder Management', confidence: 0.9 },
                { skill: 'Team Leadership', confidence: 0.9 },
                { skill: 'Compensation', confidence: 0.6 },
                { skill: 'DEI', confidence: 0.5 },
                { skill: 'Performance Management', confidence: 0.7 },
            ],
        },
    ];

// ----- SKILL DICTIONARY -----
// 300+ skill patterns across all major industries

export const SKILL_PATTERNS: Array<{ pattern: RegExp; skill: string; weight: number; category: string }> = [
    // ================= TECHNOLOGY =================
    // Programming Languages
    { pattern: /\bpython\b/gi, skill: "Python", weight: 10, category: "language" },
    { pattern: /\bjavascript\b|\bjs\b/gi, skill: "JavaScript", weight: 10, category: "language" },
    { pattern: /\btypescript\b|\bts\b/gi, skill: "TypeScript", weight: 10, category: "language" },
    { pattern: /\bjava\b(?!\s*script)/gi, skill: "Java", weight: 10, category: "language" },
    { pattern: /\bc\+\+\b|\bcpp\b/gi, skill: "C++", weight: 10, category: "language" },
    { pattern: /\bc#\b|\bcsharp\b/gi, skill: "C#", weight: 10, category: "language" },
    { pattern: /\bruby\b/gi, skill: "Ruby", weight: 8, category: "language" },
    { pattern: /\bgo\b|\bgolang\b/gi, skill: "Go", weight: 9, category: "language" },
    { pattern: /\brust\b/gi, skill: "Rust", weight: 9, category: "language" },
    { pattern: /\bswift\b/gi, skill: "Swift", weight: 8, category: "language" },
    { pattern: /\bkotlin\b/gi, skill: "Kotlin", weight: 8, category: "language" },
    { pattern: /\bphp\b/gi, skill: "PHP", weight: 7, category: "language" },
    { pattern: /\bscala\b/gi, skill: "Scala", weight: 8, category: "language" },

    // Frameworks
    { pattern: /\breact\b/gi, skill: "React", weight: 10, category: "frontend" },
    { pattern: /\bnext\.?js\b/gi, skill: "Next.js", weight: 9, category: "frontend" },
    { pattern: /\bvue\b/gi, skill: "Vue", weight: 9, category: "frontend" },
    { pattern: /\bangular\b/gi, skill: "Angular", weight: 9, category: "frontend" },
    { pattern: /\bnode\.?js\b/gi, skill: "Node.js", weight: 10, category: "backend" },
    { pattern: /\bdjango\b/gi, skill: "Django", weight: 8, category: "backend" },
    { pattern: /\bflask\b/gi, skill: "Flask", weight: 7, category: "backend" },
    { pattern: /\brails\b/gi, skill: "Rails", weight: 8, category: "backend" },
    { pattern: /\bspring\b/gi, skill: "Spring", weight: 8, category: "backend" },
    { pattern: /\b\.net\b/gi, skill: ".NET", weight: 8, category: "backend" },
    { pattern: /\bgraphql\b/gi, skill: "GraphQL", weight: 8, category: "backend" },
    { pattern: /\brest\b|\brestful\b/gi, skill: "REST APIs", weight: 7, category: "backend" },

    // Cloud & DevOps
    { pattern: /\baws\b|\bamazon web services\b/gi, skill: "AWS", weight: 10, category: "cloud" },
    { pattern: /\bgcp\b|\bgoogle cloud\b/gi, skill: "GCP", weight: 9, category: "cloud" },
    { pattern: /\bazure\b/gi, skill: "Azure", weight: 9, category: "cloud" },
    { pattern: /\bdocker\b/gi, skill: "Docker", weight: 9, category: "devops" },
    { pattern: /\bkubernetes\b|\bk8s\b/gi, skill: "Kubernetes", weight: 10, category: "devops" },
    { pattern: /\bterraform\b/gi, skill: "Terraform", weight: 9, category: "devops" },
    { pattern: /\bci\/cd\b/gi, skill: "CI/CD", weight: 8, category: "devops" },
    { pattern: /\blinux\b/gi, skill: "Linux", weight: 7, category: "devops" },

    // Databases
    { pattern: /\bpostgres(ql)?\b/gi, skill: "PostgreSQL", weight: 9, category: "database" },
    { pattern: /\bmysql\b/gi, skill: "MySQL", weight: 8, category: "database" },
    { pattern: /\bmongodb\b/gi, skill: "MongoDB", weight: 8, category: "database" },
    { pattern: /\bredis\b/gi, skill: "Redis", weight: 8, category: "database" },
    { pattern: /\bsql\b/gi, skill: "SQL", weight: 9, category: "database" },

    // AI/ML
    { pattern: /\bmachine learning\b|\bml\b/gi, skill: "Machine Learning", weight: 10, category: "ai" },
    { pattern: /\bdeep learning\b/gi, skill: "Deep Learning", weight: 10, category: "ai" },
    { pattern: /\btensorflow\b/gi, skill: "TensorFlow", weight: 9, category: "ai" },
    { pattern: /\bpytorch\b/gi, skill: "PyTorch", weight: 9, category: "ai" },
    { pattern: /\bnlp\b|\bnatural language processing\b/gi, skill: "NLP", weight: 9, category: "ai" },
    { pattern: /\bdata science\b/gi, skill: "Data Science", weight: 9, category: "ai" },
    { pattern: /\bpandas\b/gi, skill: "Pandas", weight: 8, category: "ai" },

    // ================= BUSINESS & FINANCE =================
    // Financial Skills
    { pattern: /\bfinancial modeling\b/gi, skill: "Financial Modeling", weight: 10, category: "finance" },
    { pattern: /\bfinancial analysis\b/gi, skill: "Financial Analysis", weight: 10, category: "finance" },
    { pattern: /\bvaluation\b/gi, skill: "Valuation", weight: 9, category: "finance" },
    { pattern: /\bdcf\b|\bdiscounted cash flow\b/gi, skill: "DCF Analysis", weight: 9, category: "finance" },
    { pattern: /\bbudget(ing)?\b/gi, skill: "Budgeting", weight: 8, category: "finance" },
    { pattern: /\bforecasting\b/gi, skill: "Forecasting", weight: 9, category: "finance" },
    { pattern: /\bfp&a\b/gi, skill: "FP&A", weight: 10, category: "finance" },
    { pattern: /\baccounting\b/gi, skill: "Accounting", weight: 9, category: "finance" },
    { pattern: /\bgaap\b/gi, skill: "GAAP", weight: 8, category: "finance" },
    { pattern: /\bifrs\b/gi, skill: "IFRS", weight: 8, category: "finance" },
    { pattern: /\baudit(ing)?\b/gi, skill: "Auditing", weight: 8, category: "finance" },
    { pattern: /\btax(ation)?\b/gi, skill: "Taxation", weight: 8, category: "finance" },
    { pattern: /\bcpa\b/gi, skill: "CPA", weight: 9, category: "certification" },
    { pattern: /\bcfa\b/gi, skill: "CFA", weight: 9, category: "certification" },
    { pattern: /\binvestment banking\b/gi, skill: "Investment Banking", weight: 10, category: "finance" },
    { pattern: /\bprivate equity\b/gi, skill: "Private Equity", weight: 10, category: "finance" },
    { pattern: /\bventure capital\b/gi, skill: "Venture Capital", weight: 9, category: "finance" },
    { pattern: /\bportfolio management\b/gi, skill: "Portfolio Management", weight: 9, category: "finance" },
    { pattern: /\brisk management\b/gi, skill: "Risk Management", weight: 9, category: "finance" },
    { pattern: /\bcompliance\b/gi, skill: "Compliance", weight: 8, category: "finance" },
    { pattern: /\bsox\b|\bsarbanes-?oxley\b/gi, skill: "SOX Compliance", weight: 8, category: "finance" },

    // Business Tools
    { pattern: /\bexcel\b/gi, skill: "Excel", weight: 8, category: "tools" },
    { pattern: /\bpowerpoint\b|\bppt\b/gi, skill: "PowerPoint", weight: 6, category: "tools" },
    { pattern: /\btableau\b/gi, skill: "Tableau", weight: 9, category: "analytics" },
    { pattern: /\bpower bi\b/gi, skill: "Power BI", weight: 9, category: "analytics" },
    { pattern: /\blooker\b/gi, skill: "Looker", weight: 8, category: "analytics" },
    { pattern: /\bquickbooks\b/gi, skill: "QuickBooks", weight: 7, category: "finance" },
    { pattern: /\bsap\b/gi, skill: "SAP", weight: 9, category: "erp" },
    { pattern: /\boracle\b/gi, skill: "Oracle", weight: 9, category: "erp" },
    { pattern: /\bnetsu[i]te\b/gi, skill: "NetSuite", weight: 8, category: "erp" },
    { pattern: /\bworkday\b/gi, skill: "Workday", weight: 8, category: "hris" },

    // ================= MARKETING & SALES =================
    // Digital Marketing
    { pattern: /\bseo\b|\bsearch engine optimization\b/gi, skill: "SEO", weight: 9, category: "marketing" },
    { pattern: /\bsem\b|\bsearch engine marketing\b/gi, skill: "SEM", weight: 9, category: "marketing" },
    { pattern: /\bppc\b|\bpay.?per.?click\b/gi, skill: "PPC", weight: 8, category: "marketing" },
    { pattern: /\bgoogle ads\b|\badwords\b/gi, skill: "Google Ads", weight: 9, category: "marketing" },
    { pattern: /\bfacebook ads\b|\bmeta ads\b/gi, skill: "Facebook/Meta Ads", weight: 8, category: "marketing" },
    { pattern: /\blinkedin ads\b/gi, skill: "LinkedIn Ads", weight: 7, category: "marketing" },
    { pattern: /\bcontent marketing\b/gi, skill: "Content Marketing", weight: 8, category: "marketing" },
    { pattern: /\bcopywriting\b/gi, skill: "Copywriting", weight: 8, category: "marketing" },
    { pattern: /\bemail marketing\b/gi, skill: "Email Marketing", weight: 8, category: "marketing" },
    { pattern: /\bmarketing automation\b/gi, skill: "Marketing Automation", weight: 9, category: "marketing" },
    { pattern: /\bhubspot\b/gi, skill: "HubSpot", weight: 9, category: "marketing" },
    { pattern: /\bmarketo\b/gi, skill: "Marketo", weight: 8, category: "marketing" },
    { pattern: /\bmailchimp\b/gi, skill: "Mailchimp", weight: 7, category: "marketing" },
    { pattern: /\bgoogle analytics\b|\bga4\b/gi, skill: "Google Analytics", weight: 9, category: "analytics" },
    { pattern: /\bconversion rate optimization\b|\bcro\b/gi, skill: "CRO", weight: 8, category: "marketing" },
    { pattern: /\ba\/b testing\b/gi, skill: "A/B Testing", weight: 8, category: "marketing" },
    { pattern: /\bbrand(ing)?\s*(strategy)?\b/gi, skill: "Branding", weight: 8, category: "marketing" },
    { pattern: /\bmarket research\b/gi, skill: "Market Research", weight: 8, category: "marketing" },
    { pattern: /\bpr\b|\bpublic relations\b/gi, skill: "Public Relations", weight: 7, category: "marketing" },
    { pattern: /\bsocial media\b/gi, skill: "Social Media", weight: 7, category: "marketing" },
    { pattern: /\binfluencer marketing\b/gi, skill: "Influencer Marketing", weight: 7, category: "marketing" },

    // Sales
    { pattern: /\bsalesforce\b/gi, skill: "Salesforce", weight: 10, category: "sales" },
    { pattern: /\bcrm\b/gi, skill: "CRM", weight: 9, category: "sales" },
    { pattern: /\bb2b\b/gi, skill: "B2B Sales", weight: 8, category: "sales" },
    { pattern: /\bb2c\b/gi, skill: "B2C Sales", weight: 8, category: "sales" },
    { pattern: /\baccount management\b/gi, skill: "Account Management", weight: 8, category: "sales" },
    { pattern: /\blead generation\b/gi, skill: "Lead Generation", weight: 8, category: "sales" },
    { pattern: /\bpipeline management\b/gi, skill: "Pipeline Management", weight: 8, category: "sales" },
    { pattern: /\bnegotiation\b/gi, skill: "Negotiation", weight: 8, category: "sales" },
    { pattern: /\bcold calling\b/gi, skill: "Cold Calling", weight: 6, category: "sales" },
    { pattern: /\bcustomer success\b/gi, skill: "Customer Success", weight: 8, category: "sales" },
    { pattern: /\bretention\b/gi, skill: "Retention", weight: 7, category: "sales" },

    // ================= HEALTHCARE =================
    { pattern: /\bhipaa\b/gi, skill: "HIPAA", weight: 9, category: "healthcare" },
    { pattern: /\behr\b|\belectronic health records?\b/gi, skill: "EHR", weight: 9, category: "healthcare" },
    { pattern: /\bepic\b/gi, skill: "Epic Systems", weight: 9, category: "healthcare" },
    { pattern: /\bcerner\b/gi, skill: "Cerner", weight: 8, category: "healthcare" },
    { pattern: /\bclinical research\b/gi, skill: "Clinical Research", weight: 9, category: "healthcare" },
    { pattern: /\bclinical trials?\b/gi, skill: "Clinical Trials", weight: 9, category: "healthcare" },
    { pattern: /\bfda\b/gi, skill: "FDA Regulations", weight: 8, category: "healthcare" },
    { pattern: /\bpatient care\b/gi, skill: "Patient Care", weight: 9, category: "healthcare" },
    { pattern: /\bnursing\b|\brn\b|\blpn\b/gi, skill: "Nursing", weight: 9, category: "healthcare" },
    { pattern: /\bmedical coding\b/gi, skill: "Medical Coding", weight: 8, category: "healthcare" },
    { pattern: /\bicd-?10\b/gi, skill: "ICD-10", weight: 8, category: "healthcare" },
    { pattern: /\bpharmacy\b|\bpharmacist\b/gi, skill: "Pharmacy", weight: 9, category: "healthcare" },
    { pattern: /\bphysical therapy\b|\bpt\b/gi, skill: "Physical Therapy", weight: 8, category: "healthcare" },
    { pattern: /\bmental health\b/gi, skill: "Mental Health", weight: 8, category: "healthcare" },
    { pattern: /\bhealthcare administration\b/gi, skill: "Healthcare Admin", weight: 8, category: "healthcare" },

    // ================= HUMAN RESOURCES =================
    // Core Recruiting
    { pattern: /\brecruit(ing|er|ment|s)?\b/gi, skill: "Recruiting", weight: 9, category: "hr" },
    { pattern: /\btalent\s*(acquisition|acq)\b/gi, skill: "Talent Acquisition", weight: 9, category: "hr" },
    { pattern: /\bsourc(ing|er|ers|ed)\b/gi, skill: "Sourcing", weight: 8, category: "hr" },
    { pattern: /\bfull[- ]?cycle\s*recruit/gi, skill: "Full-Cycle Recruiting", weight: 9, category: "hr" },
    { pattern: /\bheadhunt(ing|er)?\b/gi, skill: "Headhunting", weight: 8, category: "hr" },
    { pattern: /\bexecutive\s*search\b/gi, skill: "Executive Search", weight: 9, category: "hr" },
    { pattern: /\bexecutive\s*recruit(ing|er)?\b/gi, skill: "Executive Recruiting", weight: 9, category: "hr" },
    { pattern: /\btech(nical)?\s*recruit/gi, skill: "Technical Recruiting", weight: 9, category: "hr" },
    { pattern: /\bengineering\s*recruit/gi, skill: "Engineering Recruiting", weight: 9, category: "hr" },
    { pattern: /\bvolume\s*hiring\b|\bhigh[- ]?volume\b/gi, skill: "Volume Hiring", weight: 8, category: "hr" },
    { pattern: /\bpassive\s*candidates?\b|\bcandidate\s*referral/gi, skill: "Passive Candidate Sourcing", weight: 8, category: "hr" },
    { pattern: /\bboolean\s*search\b/gi, skill: "Boolean Search", weight: 7, category: "hr" },
    { pattern: /\blinkedin\s*recruiter\b/gi, skill: "LinkedIn Recruiter", weight: 8, category: "hr" },
    { pattern: /\b(VP|vp|C-?suite|chief|director|vp-level|l6|l7|l8|l9)\s*(hir|recruit|level)/gi, skill: "Executive Recruiting", weight: 9, category: "hr" },

    // ATS & Recruiting Tools (expanded significantly)
    { pattern: /\bats\b|\bapplicant\s*track(ing|er)\b/gi, skill: "ATS", weight: 8, category: "hr" },
    { pattern: /\bhris\b|\bhuman\s*resource\s*information\s*system/gi, skill: "HRIS", weight: 8, category: "hr" },
    { pattern: /\bgreenhouse\b/gi, skill: "Greenhouse", weight: 8, category: "hr" },
    { pattern: /\blever\b/gi, skill: "Lever", weight: 8, category: "hr" },
    { pattern: /\bworkday\b/gi, skill: "Workday", weight: 8, category: "hr" },
    { pattern: /\btaleo\b/gi, skill: "Taleo", weight: 7, category: "hr" },
    { pattern: /\bicims\b/gi, skill: "iCIMS", weight: 7, category: "hr" },
    { pattern: /\bjazz\s*hr\b/gi, skill: "JazzHR", weight: 7, category: "hr" },
    { pattern: /\bsmartrecruiters\b/gi, skill: "SmartRecruiters", weight: 7, category: "hr" },
    { pattern: /\bripp?ling\b/gi, skill: "Rippling", weight: 7, category: "hr" },
    { pattern: /\bbamboohr\b/gi, skill: "BambooHR", weight: 7, category: "hr" },
    { pattern: /\bsuccessfactors\b/gi, skill: "SuccessFactors", weight: 7, category: "hr" },
    { pattern: /\badp\b/gi, skill: "ADP", weight: 7, category: "hr" },
    { pattern: /\bultipro\b|\bukg\b/gi, skill: "UKG/UltiPro", weight: 7, category: "hr" },
    { pattern: /\bceridian\b|\bdayforce\b/gi, skill: "Ceridian Dayforce", weight: 7, category: "hr" },

    // HR Operations
    { pattern: /\bonboarding\b/gi, skill: "Onboarding", weight: 7, category: "hr" },
    { pattern: /\bemployee\s*relations\b/gi, skill: "Employee Relations", weight: 8, category: "hr" },
    { pattern: /\bcompensation\b|\bcomp\s*&?\s*ben/gi, skill: "Compensation", weight: 8, category: "hr" },
    { pattern: /\bbenefits?\s*(admin|administration)?\b/gi, skill: "Benefits", weight: 7, category: "hr" },
    { pattern: /\bperformance\s*(management|review|eval)/gi, skill: "Performance Management", weight: 8, category: "hr" },
    { pattern: /\bpayroll\b/gi, skill: "Payroll", weight: 7, category: "hr" },
    { pattern: /\btraining\s*(and|&)?\s*development\b|\bl&d\b/gi, skill: "L&D", weight: 8, category: "hr" },
    { pattern: /\bdei\b|\bdiversity[,\s]*(equity[,\s]*)?(\s*and\s*|\s*&\s*)?inclusion\b/gi, skill: "DEI", weight: 8, category: "hr" },
    { pattern: /\bpeople\s*ops\b|\bpeople\s*operations\b/gi, skill: "People Operations", weight: 8, category: "hr" },
    { pattern: /\bhr\s*business\s*partner\b|\bhrbp\b/gi, skill: "HRBP", weight: 8, category: "hr" },
    { pattern: /\bchief\s*people\s*officer\b|\bcpo\b/gi, skill: "Chief People Officer", weight: 10, category: "hr" },
    { pattern: /\bhead\s*of\s*(hr|people|talent)\b/gi, skill: "HR Leadership", weight: 9, category: "hr" },

    // Stakeholder & Cross-functional (expanded)
    { pattern: /\bstakeholder\s*(management|engagement|relations)\b/gi, skill: "Stakeholder Management", weight: 8, category: "soft" },
    { pattern: /\bexecutive\s*(leadership|team|stakeholder|partner)/gi, skill: "Executive Partnership", weight: 9, category: "soft" },
    { pattern: /\bc[- ]?suite\b|\bc-level\b/gi, skill: "C-Suite Partnership", weight: 9, category: "soft" },
    { pattern: /\bsenior\s*leadership\b|\bleadership\s*team\b/gi, skill: "Leadership Partnership", weight: 8, category: "soft" },
    { pattern: /\bhiring\s*manager\s*(partnership|relation|partner)/gi, skill: "Hiring Manager Partnership", weight: 8, category: "hr" },
    { pattern: /\bbusiness\s*partner(ship|ing)?\b/gi, skill: "Business Partnership", weight: 8, category: "soft" },

    // Certifications
    { pattern: /\bphr\b|\bsphr\b/gi, skill: "PHR/SPHR", weight: 9, category: "certification" },
    { pattern: /\bshrm[- ]?(cp|scp)?\b/gi, skill: "SHRM", weight: 9, category: "certification" },
    { pattern: /\bairs?\s*cert/gi, skill: "AIRS Certified", weight: 8, category: "certification" },

    // Recruiting Metrics
    { pattern: /\btime[- ]?to[- ]?(fill|hire)\b/gi, skill: "Time-to-Hire Metrics", weight: 8, category: "hr" },
    { pattern: /\bcost[- ]?per[- ]?hire\b/gi, skill: "Cost-per-Hire", weight: 7, category: "hr" },
    { pattern: /\bquality\s*of\s*hire\b/gi, skill: "Quality of Hire", weight: 8, category: "hr" },
    { pattern: /\boffer\s*accept(ance)?\s*rate\b/gi, skill: "Offer Acceptance Rate", weight: 7, category: "hr" },
    { pattern: /\bcandidate\s*experience\b/gi, skill: "Candidate Experience", weight: 8, category: "hr" },
    { pattern: /\bemployer\s*brand(ing)?\b/gi, skill: "Employer Branding", weight: 8, category: "hr" },


    // ================= LEGAL =================
    { pattern: /\bcorporate law\b/gi, skill: "Corporate Law", weight: 9, category: "legal" },
    { pattern: /\bcontract\s*(law|review|drafting)?\b/gi, skill: "Contracts", weight: 9, category: "legal" },
    { pattern: /\blitigation\b/gi, skill: "Litigation", weight: 9, category: "legal" },
    { pattern: /\bintellectual property\b|\bip\b/gi, skill: "IP Law", weight: 9, category: "legal" },
    { pattern: /\bpatent\b/gi, skill: "Patent Law", weight: 8, category: "legal" },
    { pattern: /\btrademark\b/gi, skill: "Trademark", weight: 8, category: "legal" },
    { pattern: /\bm&a\b|\bmergers?\s*(and|&)\s*acquisitions?\b/gi, skill: "M&A", weight: 10, category: "legal" },
    { pattern: /\bregulatory\b/gi, skill: "Regulatory", weight: 8, category: "legal" },
    { pattern: /\blegal research\b/gi, skill: "Legal Research", weight: 8, category: "legal" },
    { pattern: /\bdue diligence\b/gi, skill: "Due Diligence", weight: 9, category: "legal" },
    { pattern: /\bjd\b|\bjuris doctor\b/gi, skill: "JD", weight: 9, category: "certification" },
    { pattern: /\bparalegal\b/gi, skill: "Paralegal", weight: 7, category: "legal" },

    // ================= OPERATIONS & SUPPLY CHAIN =================
    { pattern: /\bsupply chain\b/gi, skill: "Supply Chain", weight: 9, category: "operations" },
    { pattern: /\blogistics\b/gi, skill: "Logistics", weight: 9, category: "operations" },
    { pattern: /\bprocurement\b/gi, skill: "Procurement", weight: 9, category: "operations" },
    { pattern: /\bvendor management\b/gi, skill: "Vendor Management", weight: 8, category: "operations" },
    { pattern: /\binventory management\b/gi, skill: "Inventory Management", weight: 8, category: "operations" },
    { pattern: /\bwarehouse\b/gi, skill: "Warehouse Management", weight: 7, category: "operations" },
    { pattern: /\blean\b/gi, skill: "Lean", weight: 8, category: "operations" },
    { pattern: /\bsix sigma\b/gi, skill: "Six Sigma", weight: 8, category: "operations" },
    { pattern: /\bkaizen\b/gi, skill: "Kaizen", weight: 7, category: "operations" },
    { pattern: /\bprocess improvement\b/gi, skill: "Process Improvement", weight: 8, category: "operations" },
    { pattern: /\bquality assurance\b|\bqa\b/gi, skill: "Quality Assurance", weight: 8, category: "operations" },
    { pattern: /\bmanufacturing\b/gi, skill: "Manufacturing", weight: 8, category: "operations" },
    { pattern: /\bproduction planning\b/gi, skill: "Production Planning", weight: 8, category: "operations" },
    { pattern: /\bpmp\b/gi, skill: "PMP", weight: 9, category: "certification" },
    { pattern: /\bproject management\b/gi, skill: "Project Management", weight: 9, category: "operations" },
    { pattern: /\bprogram management\b/gi, skill: "Program Management", weight: 9, category: "operations" },
    { pattern: /\bchange management\b/gi, skill: "Change Management", weight: 8, category: "operations" },

    // ================= DESIGN & CREATIVE =================
    { pattern: /\bfigma\b/gi, skill: "Figma", weight: 9, category: "design" },
    { pattern: /\badobe\b/gi, skill: "Adobe Creative Suite", weight: 9, category: "design" },
    { pattern: /\bphotoshop\b/gi, skill: "Photoshop", weight: 8, category: "design" },
    { pattern: /\billustrator\b/gi, skill: "Illustrator", weight: 8, category: "design" },
    { pattern: /\bindesign\b/gi, skill: "InDesign", weight: 7, category: "design" },
    { pattern: /\bafter effects\b/gi, skill: "After Effects", weight: 8, category: "design" },
    { pattern: /\bpremiere\b/gi, skill: "Premiere Pro", weight: 8, category: "design" },
    { pattern: /\bsketch\b/gi, skill: "Sketch", weight: 7, category: "design" },
    { pattern: /\bprototyping\b/gi, skill: "Prototyping", weight: 8, category: "design" },
    { pattern: /\bwireframing\b/gi, skill: "Wireframing", weight: 8, category: "design" },
    { pattern: /\bux\b|\buser experience\b/gi, skill: "UX Design", weight: 9, category: "design" },
    { pattern: /\bui\b|\buser interface\b/gi, skill: "UI Design", weight: 9, category: "design" },
    { pattern: /\bgraphic design\b/gi, skill: "Graphic Design", weight: 8, category: "design" },
    { pattern: /\bmotion graphics\b/gi, skill: "Motion Graphics", weight: 8, category: "design" },
    { pattern: /\bvideo editing\b/gi, skill: "Video Editing", weight: 8, category: "design" },
    { pattern: /\bphotography\b/gi, skill: "Photography", weight: 7, category: "design" },
    { pattern: /\bcreative direction\b/gi, skill: "Creative Direction", weight: 9, category: "design" },
    { pattern: /\bdesign systems?\b/gi, skill: "Design Systems", weight: 8, category: "design" },

    // ================= EDUCATION =================
    { pattern: /\bcurriculum development\b/gi, skill: "Curriculum Development", weight: 9, category: "education" },
    { pattern: /\binstructional design\b/gi, skill: "Instructional Design", weight: 9, category: "education" },
    { pattern: /\blms\b|\blearning management\b/gi, skill: "LMS", weight: 8, category: "education" },
    { pattern: /\bteaching\b/gi, skill: "Teaching", weight: 8, category: "education" },
    { pattern: /\bclassroom management\b/gi, skill: "Classroom Management", weight: 7, category: "education" },
    { pattern: /\beducational technology\b|\bedtech\b/gi, skill: "EdTech", weight: 8, category: "education" },
    { pattern: /\bassessment\b/gi, skill: "Assessment", weight: 7, category: "education" },
    { pattern: /\btutoring\b/gi, skill: "Tutoring", weight: 6, category: "education" },

    // ================= SOFT SKILLS & LEADERSHIP =================
    { pattern: /\bleadership\b/gi, skill: "Leadership", weight: 8, category: "soft" },
    { pattern: /\bmanaged?\s*(a\s*)?(team|org|organization|department|group)/gi, skill: "Team Management", weight: 9, category: "soft" },
    { pattern: /\bteam\s*of\s*\d+/gi, skill: "Team Management", weight: 9, category: "soft" },
    { pattern: /\bdirect\s*report/gi, skill: "People Management", weight: 8, category: "soft" },
    { pattern: /\bpeople\s*manage(r|ment)/gi, skill: "People Management", weight: 9, category: "soft" },
    { pattern: /\bmentor(ing|ed|ship)?\b/gi, skill: "Mentorship", weight: 7, category: "soft" },
    { pattern: /\bcoach(ing|ed)?\b/gi, skill: "Coaching", weight: 7, category: "soft" },
    { pattern: /\bcommunication\b/gi, skill: "Communication", weight: 7, category: "soft" },
    { pattern: /\bteamwork\b|\bcollaboration\b/gi, skill: "Teamwork", weight: 7, category: "soft" },
    { pattern: /\bproblem.?solving\b/gi, skill: "Problem Solving", weight: 7, category: "soft" },
    { pattern: /\bcritical thinking\b/gi, skill: "Critical Thinking", weight: 7, category: "soft" },
    { pattern: /\btime management\b/gi, skill: "Time Management", weight: 6, category: "soft" },
    { pattern: /\bpresentations?\b/gi, skill: "Presentation Skills", weight: 7, category: "soft" },
    { pattern: /\bcross.?functional\b/gi, skill: "Cross-Functional", weight: 7, category: "soft" },
    { pattern: /\bremote\s*(work|team|first|employee|management)/gi, skill: "Remote Work", weight: 7, category: "soft" },
    { pattern: /\bdistributed\s*team/gi, skill: "Distributed Team", weight: 7, category: "soft" },
    { pattern: /\bglobal(ly)?\s*(team|distributed|org)/gi, skill: "Global Teams", weight: 8, category: "soft" },
    { pattern: /\bdata[- ]?driven\b/gi, skill: "Data-Driven", weight: 8, category: "soft" },
    { pattern: /\bmetrics\b|\bkpi/gi, skill: "Metrics & KPIs", weight: 7, category: "soft" },
    { pattern: /\bstrategic\s*(planning|thinking|initiative)/gi, skill: "Strategic Planning", weight: 8, category: "soft" },
    { pattern: /\bchange\s*management\b/gi, skill: "Change Management", weight: 8, category: "soft" },
    { pattern: /\bprocess\s*improvement\b/gi, skill: "Process Improvement", weight: 8, category: "soft" },
    { pattern: /\bscal(e|ing|ed)\s*(team|org|operation)/gi, skill: "Scaling Organizations", weight: 9, category: "soft" },

    // ================= METHODOLOGY & TOOLS =================
    { pattern: /\bagile\b/gi, skill: "Agile", weight: 8, category: "method" },
    { pattern: /\bscrum\b/gi, skill: "Scrum", weight: 8, category: "method" },
    { pattern: /\bkanban\b/gi, skill: "Kanban", weight: 7, category: "method" },
    { pattern: /\bwaterfall\b/gi, skill: "Waterfall", weight: 6, category: "method" },
    { pattern: /\bjira\b/gi, skill: "Jira", weight: 7, category: "tools" },
    { pattern: /\bconfluence\b/gi, skill: "Confluence", weight: 6, category: "tools" },
    { pattern: /\basana\b/gi, skill: "Asana", weight: 7, category: "tools" },
    { pattern: /\bmonday\.?com\b/gi, skill: "Monday.com", weight: 6, category: "tools" },
    { pattern: /\btrello\b/gi, skill: "Trello", weight: 6, category: "tools" },
    { pattern: /\bnotion\b/gi, skill: "Notion", weight: 7, category: "tools" },
    { pattern: /\bslack\b/gi, skill: "Slack", weight: 6, category: "tools" },
    { pattern: /\bgit\b/gi, skill: "Git", weight: 7, category: "tools" },
];

// ================= INTERFACES =================

export interface SkillMatch {
    skill: string;
    weight: number;
    category: string;
    inResume: boolean;
    inJD: boolean;
}

export interface SenioritySignals {
    yearsEstimate: number | null;
    levelHints: string[];
}

export interface MatchResult {
    score: number;
    requiredCoverage: number;   // 0-100: coverage of required skills
    preferredCoverage: number;  // 0-100: coverage of preferred skills
    keywordScore: number;
    semanticScore: number | null;
    seniorityPenalty: number;
    matchedSkills: string[];
    missingSkills: string[];
    topGaps: string[];
    seniorityFlag: string | null;
    matchDetails: Array<{
        skill: string;
        tier: RequirementTier;
        credit: number;
        matchType: string;
        matchedBy: string | null;
    }>;
}

// ================= EXTRACTION FUNCTIONS =================

export function extractSkillsFromText(text: string): Map<string, { weight: number; category: string }> {
    const skills = new Map<string, { weight: number; category: string }>();

    // Apply normalization for better recall (Oracle recommendation)
    const normalizedText = normalizeText(text);

    // Match against both original and normalized text
    for (const { pattern, skill, weight, category } of SKILL_PATTERNS) {
        // Try original text first (preserve case-sensitive matches)
        const originalMatches = text.match(pattern);
        // Also try normalized text (catch variations)
        const normalizedMatches = normalizedText.match(pattern);

        // Use Math.max to avoid double-counting same skill in both texts (Oracle fix)
        const totalMatches = Math.max(originalMatches?.length || 0, normalizedMatches?.length || 0);

        if (totalMatches > 0) {
            // Boost weight for multiple mentions (capped at +4)
            const count = Math.min(totalMatches, 3);
            const adjustedWeight = weight + (count - 1) * 2;
            skills.set(skill, { weight: adjustedWeight, category });
        }
    }

    return skills;
}

export function extractSeniority(text: string): SenioritySignals {
    const yearsPatterns = [
        /(\d+)\+?\s*years?\s*(?:of\s+)?(?:experience|exp)/gi,
        /(?:experience|exp)[:\s]*(\d+)\+?\s*years?/gi,
        /(\d+)\+?\s*(?:yrs?\b|years?\b)\s*(?:experience|exp|of)/gi,
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
    if (/\b(manager|director|head of|vp)\b/i.test(text)) levelHints.push("management");
    if (/\b(junior|jr\.?|entry.?level|new grad)\b/i.test(text)) levelHints.push("junior");
    if (/\b(mid.?level|intermediate)\b/i.test(text)) levelHints.push("mid");

    return { yearsEstimate, levelHints };
}

// ================= MATCHING FUNCTIONS =================

export function calculateKeywordScore(
    resumeSkills: Map<string, { weight: number; category: string }>,
    jdSkills: Map<string, { weight: number; category: string }>
): {
    score: number;
    matchedSkills: string[];
    missingSkills: string[];
    matchDetails: Array<{ skill: string; credit: number; matchType: string; matchedBy: string | null; idfWeight: number }>;
} {
    if (jdSkills.size === 0) {
        return { score: 50, matchedSkills: [], missingSkills: [], matchDetails: [] };
    }

    let totalCredit = 0;
    let totalWeight = 0;
    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];
    const matchDetails: Array<{ skill: string; credit: number; matchType: string; matchedBy: string | null; idfWeight: number }> = [];

    for (const [jdSkill, { weight }] of jdSkills) {
        // Apply IDF weighting: generic skills (teamwork) get low weight, rare skills (kubernetes) get high weight
        const idfWeight = getSkillWeight(jdSkill);
        const adjustedWeight = weight * idfWeight;
        totalWeight += adjustedWeight;

        // Find best match across all resume skills using ontology
        let bestCredit = 0;
        let bestMatchType = "none";
        let bestMatchedBy: string | null = null;

        // First check direct match
        if (resumeSkills.has(jdSkill)) {
            bestCredit = 1.0;
            bestMatchType = "exact";
            bestMatchedBy = jdSkill;
        } else {
            // Check ontology relationships for each resume skill
            for (const [resumeSkill] of resumeSkills) {
                const { credit, matchType } = getMatchCredit(jdSkill, resumeSkill);
                if (credit > bestCredit) {
                    bestCredit = credit;
                    bestMatchType = matchType;
                    bestMatchedBy = resumeSkill;
                }
            }
        }

        // Add IDF-weighted credit
        totalCredit += adjustedWeight * bestCredit;

        // Track match details (now includes IDF weight for debugging)
        matchDetails.push({
            skill: jdSkill,
            credit: bestCredit,
            matchType: bestMatchType,
            matchedBy: bestMatchedBy,
            idfWeight,
        });

        // Categorize as matched (>= 0.5 credit) or missing
        if (bestCredit >= 0.5) {
            matchedSkills.push(jdSkill);
        } else {
            missingSkills.push(jdSkill);
        }
    }

    const score = Math.round((totalCredit / totalWeight) * 100);
    return { score, matchedSkills, missingSkills, matchDetails };
}

export function calculateSeniorityPenalty(
    resumeSeniority: SenioritySignals,
    jdSeniority: SenioritySignals
): { penalty: number; flag: string | null } {
    let penalty = 0;
    let flag: string | null = null;

    // Check years mismatch
    if (jdSeniority.yearsEstimate !== null && resumeSeniority.yearsEstimate !== null) {
        const diff = jdSeniority.yearsEstimate - resumeSeniority.yearsEstimate;
        if (diff > 3) {
            penalty = Math.min(15, diff * 3);
            flag = `JD: ${jdSeniority.yearsEstimate}+ years, Resume: ~${resumeSeniority.yearsEstimate} years`;
        } else if (diff > 1) {
            penalty = 5;
        }
    }

    // Check level mismatch
    const jdLevel = jdSeniority.levelHints[0];
    const resumeLevel = resumeSeniority.levelHints[0];

    if (jdLevel && resumeLevel) {
        const levelOrder = ["junior", "mid", "senior", "principal", "management"];
        const jdIndex = levelOrder.indexOf(jdLevel);
        const resumeIndex = levelOrder.indexOf(resumeLevel);

        if (jdIndex > resumeIndex && jdIndex - resumeIndex > 1) {
            penalty += 10;
            flag = flag ?? `Level mismatch: JD requires ${jdLevel}, resume suggests ${resumeLevel}`;
        }
    }

    return { penalty: Math.min(penalty, 20), flag };
}

export function calculateHybridScore(
    keywordScore: number,
    semanticScore: number | null,
    seniorityPenalty: number
): number {
    // Oracle formula: 65% keyword + 35% semantic - penalty
    const combinedScore = semanticScore !== null
        ? 0.65 * keywordScore + 0.35 * semanticScore
        : keywordScore;

    const finalScore = Math.round(combinedScore - seniorityPenalty);
    return Math.max(0, Math.min(100, finalScore));
}

// Skills that are too generic/obvious to show as meaningful gaps
// These are typically implied skills that almost everyone has
const LOW_VALUE_GAPS = new Set([
    'teamwork',
    'team player',
    'cross-functional',
    'cross functional',
    'collaboration',
    'collaborative',
    'communication',
    'communication skills',
    'interpersonal skills',
    'interpersonal',
    'problem solving',
    'problem-solving',
    'attention to detail',
    'detail oriented',
    'detail-oriented',
    'time management',
    'self-motivated',
    'motivated',
    'work ethic',
    'positive attitude',
    'reliable',
    'dependable',
    'flexible',
    'adaptable',
    'multitasking',
    'multi-tasking',
    'organized',
    'organizational skills',
    'fast learner',
    'quick learner',
    'team-oriented',
]);

export function generateTopGaps(
    missingSkills: string[],
    seniorityFlag: string | null,
    jdSkills: Map<string, { weight: number; category: string }>
): string[] {
    const gaps: string[] = [];

    // Filter out low-value gaps and sort by weight (most important first)
    const sortedMissing = missingSkills
        .filter(skill => !LOW_VALUE_GAPS.has(skill.toLowerCase()))
        .map(skill => ({ skill, weight: jdSkills.get(skill)?.weight ?? 0 }))
        .sort((a, b) => b.weight - a.weight);

    // Top 3 missing skills (meaningful gaps only)
    for (const { skill } of sortedMissing.slice(0, 3)) {
        gaps.push(`Missing: ${skill}`);
    }

    // Add seniority flag if present (replaces one skill gap)
    if (seniorityFlag && gaps.length > 0) {
        gaps[gaps.length - 1] = seniorityFlag;
    } else if (seniorityFlag) {
        gaps.push(seniorityFlag);
    }

    return gaps.slice(0, 3);
}

// ================= MAIN MATCHING FUNCTION =================

export function quickMatch(
    resumeText: string,
    jdText: string,
    resumeEmbedding?: number[],
    jdEmbedding?: number[]
): MatchResult {
    // Extract skills
    const resumeSkills = extractSkillsFromText(resumeText);
    const jdSkills = extractSkillsFromText(jdText);

    // Apply inference rules to resume (Oracle Phase 2)
    for (const rule of INFERENCE_RULES) {
        rule.trigger.lastIndex = 0;
        if (rule.trigger.test(resumeText)) {
            if (!resumeSkills.has(rule.implies)) {
                const inferredWeight = Math.round(8 * rule.confidence);
                resumeSkills.set(rule.implies, { weight: inferredWeight, category: 'inferred' });
            }
        }
    }

    // Parse JD requirements into tiers (Oracle Phase 3)
    const jdRequirements = parseJDRequirements(jdText, jdSkills);

    // Extract seniority signals
    const resumeSeniority = extractSeniority(resumeText);
    const jdSeniority = extractSeniority(jdText);

    // Calculate tiered keyword scores (Oracle Phase 4)
    let requiredTotalWeight = 0;
    let requiredMatchedCredit = 0;
    let preferredTotalWeight = 0;
    let preferredMatchedCredit = 0;
    let unlabeledTotalWeight = 0;
    let unlabeledMatchedCredit = 0;

    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];
    const matchDetails: MatchResult['matchDetails'] = [];

    for (const [skillId, requirement] of jdRequirements) {
        const weight = requirement.baseWeight;

        // Find best match across resume skills
        let bestCredit = 0;
        let bestMatchType = "none";
        let bestMatchedBy: string | null = null;

        if (resumeSkills.has(skillId)) {
            bestCredit = 1.0;
            bestMatchType = "exact";
            bestMatchedBy = skillId;
        } else {
            for (const [resumeSkill] of resumeSkills) {
                const { credit, matchType } = getMatchCredit(skillId, resumeSkill);
                if (credit > bestCredit) {
                    bestCredit = credit;
                    bestMatchType = matchType;
                    bestMatchedBy = resumeSkill;
                }
            }
        }

        // Add to appropriate tier totals
        switch (requirement.tier) {
            case "required":
                requiredTotalWeight += weight;
                requiredMatchedCredit += weight * bestCredit;
                break;
            case "preferred":
                preferredTotalWeight += weight;
                preferredMatchedCredit += weight * bestCredit;
                break;
            default:
                unlabeledTotalWeight += weight;
                unlabeledMatchedCredit += weight * bestCredit;
        }

        matchDetails.push({
            skill: skillId,
            tier: requirement.tier,
            credit: bestCredit,
            matchType: bestMatchType,
            matchedBy: bestMatchedBy
        });

        if (bestCredit >= 0.5) {
            matchedSkills.push(skillId);
        } else {
            missingSkills.push(skillId);
        }
    }

    // Calculate tier coverage scores (0-100)
    const requiredCoverage = requiredTotalWeight > 0
        ? Math.round((requiredMatchedCredit / requiredTotalWeight) * 100)
        : 100; // No required skills = 100% coverage

    const preferredCoverage = preferredTotalWeight > 0
        ? Math.round((preferredMatchedCredit / preferredTotalWeight) * 100)
        : 100; // No preferred skills = 100% coverage

    const unlabeledCoverage = unlabeledTotalWeight > 0
        ? Math.round((unlabeledMatchedCredit / unlabeledTotalWeight) * 100)
        : 50; // No unlabeled = neutral

    // Calculate keyword score using tiered formula (Oracle Phase 4)
    // If we have required/preferred separation: 85% required + 15% preferred
    // If all unlabeled: use unlabeled score directly
    let keywordScore: number;
    if (requiredTotalWeight > 0 || preferredTotalWeight > 0) {
        // Tiered scoring: 85% required + 15% preferred
        keywordScore = Math.round(0.85 * requiredCoverage + 0.15 * preferredCoverage);
    } else {
        // Fallback to unlabeled coverage
        keywordScore = unlabeledCoverage;
    }

    // Calculate semantic score (if embeddings provided)
    let semanticScore: number | null = null;
    if (resumeEmbedding && jdEmbedding) {
        const cosineSim = cosineSimilarity(resumeEmbedding, jdEmbedding);
        semanticScore = Math.round(cosineSim * 100);
    }

    // Calculate seniority penalty
    const { penalty: seniorityPenalty, flag: seniorityFlag } =
        calculateSeniorityPenalty(resumeSeniority, jdSeniority);

    // Calculate hybrid score with bounded semantic adjustment (Oracle Phase 4)
    // Semantic can add at most +8 points, and only if requiredCoverage >= 50%
    let score = keywordScore;

    if (semanticScore !== null && requiredCoverage >= 50) {
        // Semantic adjustment: bounded to +8 max, proportional to semantic score
        const semanticAdjustment = Math.min(8, Math.round((semanticScore - 50) * 0.16));
        if (semanticAdjustment > 0) {
            score += semanticAdjustment;
        }
    }

    // Apply seniority penalty
    score = Math.max(0, score - seniorityPenalty);

    // Cap rule: if requiredCoverage < 50%, cap final score at requiredCoverage
    if (requiredTotalWeight > 0 && requiredCoverage < 50) {
        score = Math.min(score, requiredCoverage);
    }

    // Generate top gaps
    const topGaps = generateTopGaps(missingSkills, seniorityFlag, jdSkills);

    return {
        score,
        requiredCoverage,
        preferredCoverage,
        keywordScore,
        semanticScore,
        seniorityPenalty,
        matchedSkills,
        missingSkills,
        topGaps,
        seniorityFlag,
        matchDetails,
    };
}

// ================= UTILITY FUNCTIONS =================

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

// ================= ENHANCED MATCHING WITH CLAIM EXTRACTION =================

import type { ParsedResume, ParsedJD, MatchResult as ClaimMatchResult } from './claim-extractor';
import { parseResume, parseJobDescription, matchClaimsToRequirements } from './claim-extractor';
import { computeDomainGate, applyDomainGate, getScoreBand, type DomainGateResult, type ScoreBandInfo } from './domain-gate';
import { getSkillWeight, type IDFStore } from './skill-idf';

export interface EnhancedMatchResult {
    // Combined scores
    finalScore: number;
    rawScore: number;  // Before gating
    keywordScore: number;
    claimScore: number;
    semanticScore: number | null;

    // Skill analysis
    matchedSkills: string[];
    missingSkills: string[];

    // Claim-based evidence
    claimMatches: ClaimMatchResult[];
    parsedResume: ParsedResume;
    parsedJD: ParsedJD;

    // Domain gating (Oracle Phase 1)
    domainGate: DomainGateResult;
    scoreBand: ScoreBandInfo;

    // Metadata
    seniorityPenalty: number;
    confidence: 'high' | 'low';
}

/**
 * Enhanced job matching that combines:
 * - Keyword matching (existing skill patterns)
 * - Claim extraction (LLM-parsed structured data)
 * - Semantic similarity (embeddings)
 * 
 * Weights: 50% keyword + 30% claims + 20% semantic
 * 
 * Cost: ~$0.002 for first match (LLM parsing), $0 for subsequent with cached claims
 */
export async function calculateEnhancedMatch(
    resumeText: string,
    jdText: string,
    resumeEmbedding?: number[],
    jdEmbedding?: number[],
    cachedResumeClaims?: ParsedResume,
    cachedJDClaims?: ParsedJD
): Promise<EnhancedMatchResult> {
    // 1. Parse claims (or use cached)
    const parsedResume = cachedResumeClaims || await parseResume(resumeText);
    const parsedJD = cachedJDClaims || await parseJobDescription(jdText);

    // 2. Get claim-based match
    const claimResult = matchClaimsToRequirements(parsedResume, parsedJD);

    // 3. Get keyword-based match (existing system)
    const resumeSkills = extractSkillsFromText(resumeText);
    const jdSkills = extractSkillsFromText(jdText);
    const keywordResult = calculateKeywordScore(resumeSkills, jdSkills);

    // 4. Get semantic score if embeddings provided
    let semanticScore: number | null = null;
    if (resumeEmbedding && jdEmbedding) {
        semanticScore = Math.round(cosineSimilarity(resumeEmbedding, jdEmbedding) * 100);
    }

    // 5. Get seniority signals
    const resumeSeniority = extractSeniority(resumeText);
    const jdSeniority = extractSeniority(jdText);
    const seniorityResult = calculateSeniorityPenalty(resumeSeniority, jdSeniority);
    const seniorityPenalty = seniorityResult.penalty;

    // 6. Calculate raw combined score (before gating)
    // Weights: 50% keyword, 30% claims, 20% semantic
    let rawScore: number;
    if (semanticScore !== null) {
        rawScore = 0.50 * keywordResult.score +
            0.30 * claimResult.score +
            0.20 * semanticScore;
    } else {
        // No semantic score: 60% keyword, 40% claims
        rawScore = 0.60 * keywordResult.score +
            0.40 * claimResult.score;
    }

    // Apply seniority penalty to raw score
    rawScore = Math.max(0, Math.min(100, Math.round(rawScore - seniorityPenalty)));

    // 7. ORACLE PHASE 1: Compute domain gate
    // Maps claim matches to the format expected by computeDomainGate
    const claimMatchesForGate = claimResult.matches.map(m => ({
        requirement: m.requirement,
        status: m.status as 'met' | 'partial' | 'gap',
    }));

    const domainGate = computeDomainGate(parsedResume, parsedJD, claimMatchesForGate);

    // 8. Apply domain gate to get final score
    const finalScore = applyDomainGate(rawScore, domainGate);

    // 9. Get score band for UI
    const scoreBand = getScoreBand(finalScore);

    // 10. Determine confidence
    const confidence = domainGate.coverageConfidence;

    return {
        finalScore,
        rawScore,
        keywordScore: keywordResult.score,
        claimScore: claimResult.score,
        semanticScore,
        matchedSkills: keywordResult.matchedSkills,
        missingSkills: keywordResult.missingSkills,
        claimMatches: claimResult.matches,
        parsedResume,
        parsedJD,
        domainGate,
        scoreBand,
        seniorityPenalty,
        confidence,
    };
}

/**
 * Get evidence-based explanations for a match
 * Returns human-readable strings for each matched requirement
 */
export function getMatchEvidence(result: EnhancedMatchResult): string[] {
    const evidence: string[] = [];

    for (const match of result.claimMatches) {
        if (match.status === 'met' && match.evidence) {
            evidence.push(`✓ ${match.requirement.text}: ${match.evidence}`);
        }
    }

    return evidence;
}

/**
 * Get actionable gaps with suggestions
 */
export function getActionableGaps(result: EnhancedMatchResult): Array<{
    requirement: string;
    status: 'gap' | 'partial';
    suggestion: string;
}> {
    const gaps: Array<{ requirement: string; status: 'gap' | 'partial'; suggestion: string }> = [];

    for (const match of result.claimMatches) {
        if (match.status === 'gap' || match.status === 'partial') {
            let suggestion = 'Consider adding relevant experience';

            if (match.requirement.category === 'scale') {
                suggestion = 'Add quantitative achievements (numbers, metrics)';
            } else if (match.requirement.category === 'skill') {
                suggestion = `Add "${match.requirement.extracted_skill}" to your resume`;
            } else if (match.requirement.category === 'tool') {
                suggestion = 'Highlight specific tools you\'ve used';
            }

            gaps.push({
                requirement: match.requirement.text,
                status: match.status,
                suggestion
            });
        }
    }

    return gaps;
}
