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

// ----- SKILL EQUIVALENTS LAYER -----
// Skills that should be considered equivalent when matching
// Format: skill → array of equivalent skills (bidirectional matching)
const SKILL_EQUIVALENTS: Record<string, string[]> = {
    // HR/Recruiting equivalents
    "Account Management": ["Client Management", "Client Relationships", "Customer Management", "Relationship Management", "Key Accounts"],
    "Lead Generation": ["Pipeline Development", "Prospecting", "Business Development", "Outbound", "Cold Outreach"],
    "Passive Candidate Sourcing": ["Candidate Sourcing", "Talent Sourcing", "Sourcing", "Candidate Referrals", "Pipeline Building"],
    "Project Management": ["Program Management", "Initiative Management", "Cross-Functional Leadership", "Stakeholder Management"],
    "Presentation Skills": ["Executive Presentations", "Stakeholder Presentations", "Client Presentations", "Leadership Presentations"],
    "Executive Recruiting": ["Executive Search", "VP Hiring", "C-Suite Hiring", "Senior Leadership Hiring", "Director Recruiting"],
    "Stakeholder Management": ["Executive Partnership", "C-Suite Partnership", "Cross-Functional", "Stakeholder Engagement"],

    // Engineering equivalents
    "Python": ["Python Development", "Python Programming", "Python 3"],
    "JavaScript": ["JS", "ECMAScript", "ES6", "TypeScript"],
    "React": ["React.js", "ReactJS", "React Native"],
    "Node.js": ["Node", "NodeJS", "Express.js"],
    "Machine Learning": ["ML", "Deep Learning", "AI/ML", "Neural Networks"],
    "Data Analysis": ["Data Analytics", "Business Analytics", "Statistical Analysis"],

    // Sales equivalents
    "Sales": ["Revenue Generation", "Business Development", "Account Executive", "Closing"],
    "CRM": ["Salesforce", "HubSpot", "Pipeline Management"],

    // Operations equivalents
    "Process Improvement": ["Operational Excellence", "Continuous Improvement", "Lean", "Six Sigma"],
    "Team Management": ["People Management", "Team Leadership", "Direct Reports", "Staff Management"],
    "Leadership": ["Management", "Supervision", "Team Lead", "Head of"],

    // Soft skills equivalents
    "Communication": ["Written Communication", "Verbal Communication", "Storytelling"],
    "Collaboration": ["Teamwork", "Cross-Functional Collaboration", "Partnership"],
};

// Build reverse lookup for bidirectional matching
const SKILL_SYNONYM_LOOKUP: Map<string, Set<string>> = new Map();
for (const [primary, equivalents] of Object.entries(SKILL_EQUIVALENTS)) {
    // Add primary → equivalents
    if (!SKILL_SYNONYM_LOOKUP.has(primary)) {
        SKILL_SYNONYM_LOOKUP.set(primary, new Set());
    }
    for (const eq of equivalents) {
        SKILL_SYNONYM_LOOKUP.get(primary)!.add(eq);
    }
    // Add equivalents → primary (bidirectional)
    for (const eq of equivalents) {
        if (!SKILL_SYNONYM_LOOKUP.has(eq)) {
            SKILL_SYNONYM_LOOKUP.set(eq, new Set());
        }
        SKILL_SYNONYM_LOOKUP.get(eq)!.add(primary);
    }
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
        {
            trigger: /\b(managed|led|directed)\s*(a\s+)?(team|org|department|group)\s+of\s+\d+/gi,
            implies: 'Team Leadership', confidence: 0.9
        },
        {
            trigger: /\bchief\s*(people|hr|talent)\s*officer\b/gi,
            implies: 'Stakeholder Management', confidence: 0.85
        },
        {
            trigger: /\bhead\s+of\s+(hr|people|talent|recruiting)\b/gi,
            implies: 'Stakeholder Management', confidence: 0.8
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
    keywordScore: number;
    semanticScore: number | null;
    seniorityPenalty: number;
    matchedSkills: string[];
    missingSkills: string[];
    topGaps: string[];
    seniorityFlag: string | null;
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

        const totalMatches = (originalMatches?.length || 0) + (normalizedMatches?.length || 0);

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
): { score: number; matchedSkills: string[]; missingSkills: string[] } {
    if (jdSkills.size === 0) {
        return { score: 50, matchedSkills: [], missingSkills: [] }; // Neutral if no skills detected
    }

    let matchedWeight = 0;
    let totalWeight = 0;
    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    // Helper function to check if resume has skill or any of its synonyms
    const hasSkillOrSynonym = (skill: string): boolean => {
        // Direct match
        if (resumeSkills.has(skill)) return true;

        // Check synonyms bidirectionally
        const synonyms = SKILL_SYNONYM_LOOKUP.get(skill);
        if (synonyms) {
            for (const syn of synonyms) {
                if (resumeSkills.has(syn)) return true;
            }
        }

        // Check if any resume skill lists this as a synonym
        for (const [resumeSkill] of resumeSkills) {
            const resumeSynonyms = SKILL_SYNONYM_LOOKUP.get(resumeSkill);
            if (resumeSynonyms?.has(skill)) return true;
        }

        return false;
    };

    for (const [skill, { weight }] of jdSkills) {
        totalWeight += weight;
        if (hasSkillOrSynonym(skill)) {
            matchedWeight += weight;
            matchedSkills.push(skill);
        } else {
            missingSkills.push(skill);
        }
    }

    const score = Math.round((matchedWeight / totalWeight) * 100);
    return { score, matchedSkills, missingSkills };
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

export function generateTopGaps(
    missingSkills: string[],
    seniorityFlag: string | null,
    jdSkills: Map<string, { weight: number; category: string }>
): string[] {
    const gaps: string[] = [];

    // Sort missing skills by weight (most important first)
    const sortedMissing = missingSkills
        .map(skill => ({ skill, weight: jdSkills.get(skill)?.weight ?? 0 }))
        .sort((a, b) => b.weight - a.weight);

    // Top 3 missing skills
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
    // This adds skills that are implied by tools/systems mentioned
    for (const rule of INFERENCE_RULES) {
        if (rule.trigger.test(resumeText)) {
            // Only add if not already present (don't override explicit matches)
            if (!resumeSkills.has(rule.implies)) {
                // Weight is reduced based on confidence (inferred skills worth less than explicit)
                const inferredWeight = Math.round(8 * rule.confidence);
                resumeSkills.set(rule.implies, { weight: inferredWeight, category: 'inferred' });
            }
        }
    }

    // Extract seniority signals
    const resumeSeniority = extractSeniority(resumeText);
    const jdSeniority = extractSeniority(jdText);

    // Calculate keyword score
    const { score: keywordScore, matchedSkills, missingSkills } =
        calculateKeywordScore(resumeSkills, jdSkills);

    // Calculate semantic score (if embeddings provided)
    let semanticScore: number | null = null;
    if (resumeEmbedding && jdEmbedding) {
        const cosineSim = cosineSimilarity(resumeEmbedding, jdEmbedding);
        semanticScore = Math.round(cosineSim * 100);
    }

    // Calculate seniority penalty
    const { penalty: seniorityPenalty, flag: seniorityFlag } =
        calculateSeniorityPenalty(resumeSeniority, jdSeniority);

    // Calculate hybrid score
    const score = calculateHybridScore(keywordScore, semanticScore, seniorityPenalty);

    // Generate top gaps
    const topGaps = generateTopGaps(missingSkills, seniorityFlag, jdSkills);

    return {
        score,
        keywordScore,
        semanticScore,
        seniorityPenalty,
        matchedSkills,
        missingSkills,
        topGaps,
        seniorityFlag,
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
