/**
 * Skill Extraction and Job Matching Engine
 * 
 * Hybrid A+B scoring as recommended by Oracle:
 * - 65% keyword matching (deterministic, explainable)
 * - 35% semantic similarity (embedding cosine distance)
 * - Seniority penalty (0-20 points)
 * 
 * Covers: Technology, Business, Finance, Marketing, Healthcare, 
 *         HR, Legal, Operations, Creative, Education
 */

// ----- SKILL DICTIONARY -----
// 250+ skill patterns across all major industries

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
    { pattern: /\brecruiting\b|\brecruitment\b/gi, skill: "Recruiting", weight: 9, category: "hr" },
    { pattern: /\btalent acquisition\b/gi, skill: "Talent Acquisition", weight: 9, category: "hr" },
    { pattern: /\bsourcing\b/gi, skill: "Sourcing", weight: 8, category: "hr" },
    { pattern: /\bonboarding\b/gi, skill: "Onboarding", weight: 7, category: "hr" },
    { pattern: /\bemployee relations\b/gi, skill: "Employee Relations", weight: 8, category: "hr" },
    { pattern: /\bcompensation\b/gi, skill: "Compensation", weight: 8, category: "hr" },
    { pattern: /\bbenefits administration\b/gi, skill: "Benefits Admin", weight: 8, category: "hr" },
    { pattern: /\bperformance management\b/gi, skill: "Performance Management", weight: 8, category: "hr" },
    { pattern: /\bhris\b/gi, skill: "HRIS", weight: 8, category: "hr" },
    { pattern: /\bbamboohr\b/gi, skill: "BambooHR", weight: 7, category: "hr" },
    { pattern: /\bpayroll\b/gi, skill: "Payroll", weight: 8, category: "hr" },
    { pattern: /\btraining and development\b|\bl&d\b/gi, skill: "L&D", weight: 8, category: "hr" },
    { pattern: /\bdei\b|\bdiversity.*inclusion\b/gi, skill: "DEI", weight: 8, category: "hr" },
    { pattern: /\bphr\b|\bsphr\b/gi, skill: "PHR/SPHR", weight: 8, category: "certification" },
    { pattern: /\bshrm\b/gi, skill: "SHRM", weight: 8, category: "certification" },
    { pattern: /\bats\b|\bapplicant tracking\b/gi, skill: "ATS", weight: 7, category: "hr" },
    { pattern: /\bgreenhouse\b/gi, skill: "Greenhouse", weight: 7, category: "hr" },
    { pattern: /\blever\b/gi, skill: "Lever", weight: 7, category: "hr" },

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

    // ================= SOFT SKILLS =================
    { pattern: /\bleadership\b/gi, skill: "Leadership", weight: 8, category: "soft" },
    { pattern: /\bcommunication\b/gi, skill: "Communication", weight: 7, category: "soft" },
    { pattern: /\bteamwork\b|\bcollaboration\b/gi, skill: "Teamwork", weight: 7, category: "soft" },
    { pattern: /\bproblem.?solving\b/gi, skill: "Problem Solving", weight: 7, category: "soft" },
    { pattern: /\bcritical thinking\b/gi, skill: "Critical Thinking", weight: 7, category: "soft" },
    { pattern: /\btime management\b/gi, skill: "Time Management", weight: 6, category: "soft" },
    { pattern: /\bpresentation\b/gi, skill: "Presentation Skills", weight: 7, category: "soft" },
    { pattern: /\bstakeholder management\b/gi, skill: "Stakeholder Management", weight: 8, category: "soft" },
    { pattern: /\bcross.?functional\b/gi, skill: "Cross-Functional", weight: 7, category: "soft" },
    { pattern: /\bremote work\b/gi, skill: "Remote Work", weight: 6, category: "soft" },

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

    for (const { pattern, skill, weight, category } of SKILL_PATTERNS) {
        const matches = text.match(pattern);
        if (matches) {
            // Boost weight for multiple mentions (capped at +4)
            const count = Math.min(matches.length, 3);
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

    for (const [skill, { weight }] of jdSkills) {
        totalWeight += weight;
        if (resumeSkills.has(skill)) {
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
