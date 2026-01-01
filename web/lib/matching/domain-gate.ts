/**
 * Domain Gate Module
 * 
 * Implements Oracle-recommended gating based on:
 * 1. SOC (Standard Occupational Classification) major groups
 * 2. Domain/Industry adjacency
 * 3. Must-have requirement coverage
 * 4. Coverage confidence
 * 
 * Key insight: Final Score = min(RoleAlignmentCap, MustHaveCap, CoverageConfidenceCap, BlendScore)
 */

import type { ParsedResume, ParsedJD, ParsedRequirement } from './claim-extractor';

// ================== TYPES ==================

export interface DomainGateResult {
    roleAlignment: number;           // 0-100
    roleAlignmentBand: 'match' | 'adjacent' | 'mismatch';
    roleAlignmentCap: number;        // Max score allowed based on role alignment

    mustHaveCoverage: number;        // 0-100
    mustHaveMet: number;
    mustHaveTotal: number;
    mustHaveCap: number;             // Max score based on must-have coverage
    hardMustHavesMissing: string[];  // Critical missing requirements (licenses, years)

    coverageConfidence: 'high' | 'low';
    coverageConfidenceCap: number;   // Cap when JD is outside skill coverage

    effectiveCap: number;            // min of all caps

    resumeSOC: SOCMajorGroup | null;
    jdSOC: SOCMajorGroup | null;

    explanations: string[];
}

// ================== SOC MAJOR GROUPS ==================
// Standard Occupational Classification 2018
// Source: Bureau of Labor Statistics

export type SOCMajorGroup =
    | '11' | '13' | '15' | '17' | '19' | '21' | '23' | '25' | '27' | '29'
    | '31' | '33' | '35' | '37' | '39' | '41' | '43' | '45' | '47' | '49' | '51' | '53';

interface SOCGroupInfo {
    code: SOCMajorGroup;
    name: string;
    keywords: string[];  // For classification
}

const SOC_GROUPS: SOCGroupInfo[] = [
    { code: '11', name: 'Management', keywords: ['manager', 'director', 'chief', 'vp', 'vice president', 'ceo', 'cfo', 'cto', 'head of', 'executive'] },
    // Removed generic 'analyst' - too ambiguous (data analyst vs business analyst vs financial analyst)
    { code: '13', name: 'Business and Financial Operations', keywords: ['hr', 'human resources', 'recruiting', 'recruiter', 'talent acquisition', 'staffing', 'hris', 'benefits', 'compensation', 'financial analyst', 'business analyst', 'finance', 'accountant', 'compliance', 'operations', 'project manager', 'business development'] },
    // Added data analyst, security engineer, infosec - these are tech roles
    { code: '15', name: 'Computer and Mathematical', keywords: ['software', 'developer', 'programmer', 'data scientist', 'machine learning', 'ai', 'devops', 'cloud', 'database', 'frontend', 'backend', 'fullstack', 'web developer', 'swe', 'software engineer', 'data analyst', 'data engineer', 'security engineer', 'cybersecurity', 'infosec', 'appsec', 'soc analyst', 'penetration tester'] },
    { code: '17', name: 'Architecture and Engineering', keywords: ['architect', 'civil engineer', 'mechanical engineer', 'electrical engineer', 'structural engineer', 'cad', 'autocad'] },
    { code: '19', name: 'Life Physical and Social Science', keywords: ['scientist', 'research', 'biologist', 'chemist', 'physicist', 'lab'] },
    { code: '21', name: 'Community and Social Service', keywords: ['social worker', 'counselor', 'nonprofit', 'community'] },
    { code: '23', name: 'Legal', keywords: ['lawyer', 'attorney', 'paralegal', 'legal', 'counsel', 'contracts'] },
    { code: '25', name: 'Educational Instruction', keywords: ['teacher', 'professor', 'instructor', 'educator', 'curriculum'] },
    { code: '27', name: 'Arts Design Entertainment', keywords: ['designer', 'ux', 'ui', 'graphic', 'creative', 'artist', 'writer', 'content', 'photographer', 'video'] },
    { code: '29', name: 'Healthcare Practitioners', keywords: ['nurse', 'doctor', 'physician', 'therapist', 'clinical', 'medical', 'rn', 'np', 'pa', 'pharmacist'] },
    { code: '31', name: 'Healthcare Support', keywords: ['medical assistant', 'aide', 'home health', 'caregiver'] },
    // 'security' removed - ambiguous between infosec and physical security. Use specific terms.
    { code: '33', name: 'Protective Service', keywords: ['security guard', 'security officer', 'police', 'firefighter', 'loss prevention'] },
    { code: '35', name: 'Food Preparation', keywords: ['chef', 'cook', 'restaurant', 'food service', 'barista'] },
    { code: '37', name: 'Building Maintenance', keywords: ['janitor', 'custodian', 'maintenance', 'groundskeeper'] },
    { code: '39', name: 'Personal Care', keywords: ['hairdresser', 'cosmetologist', 'childcare', 'nanny'] },
    { code: '41', name: 'Sales', keywords: ['sales', 'account executive', 'sales rep', 'bdm', 'retail', 'real estate'] },
    { code: '43', name: 'Office and Administrative', keywords: ['admin', 'administrative', 'assistant', 'receptionist', 'clerk', 'secretary', 'scheduler'] },
    { code: '45', name: 'Farming Fishing Forestry', keywords: ['farmer', 'agricultural', 'forestry', 'fisherman'] },
    // Construction keywords include preconstruction, estimating, BIM, MEP - common construction terms
    { code: '47', name: 'Construction and Extraction', keywords: ['construction', 'carpenter', 'electrician', 'plumber', 'hvac', 'drywall', 'framing', 'roofing', 'mason', 'welder', 'mining', 'osha', 'blueprint', 'foreman', 'superintendent', 'pipefitter', 'ironworker', 'preconstruction', 'estimating', 'estimator', 'cost estimation', 'bim', 'bluebeam', 'on-screen takeoff', 'ost', 'mep', 'construction manager', 'gcs', 'general contractor', 'subcontractor', 'turner', 'hensel phelps', 'mortenson', 'commercial project'] },
    { code: '49', name: 'Installation Maintenance Repair', keywords: ['technician', 'mechanic', 'installer', 'repair'] },
    { code: '51', name: 'Production', keywords: ['manufacturing', 'factory', 'assembly', 'machine operator', 'production'] },
    { code: '53', name: 'Transportation', keywords: ['driver', 'trucker', 'logistics', 'warehouse', 'shipping', 'pilot', 'cdl'] },
];

// ================== SOC ADJACENCY ==================
// Groups that share transferable skills

const SOC_ADJACENCY: Record<SOCMajorGroup, SOCMajorGroup[]> = {
    '11': ['13', '41', '43'],  // Management ↔ Business Ops, Sales, Admin
    '13': ['11', '43', '41'],  // Business Ops ↔ Management, Admin, Sales
    '15': ['17', '27'],        // Computer ↔ Engineering, Design
    '17': ['15', '19'],        // Engineering ↔ Computer, Science
    '19': ['17', '29'],        // Science ↔ Engineering, Healthcare
    '21': ['25', '23'],        // Social Service ↔ Education, Legal
    '23': ['13', '21'],        // Legal ↔ Business, Social Service
    '25': ['21', '27'],        // Education ↔ Social Service, Arts
    '27': ['15', '25'],        // Arts/Design ↔ Computer, Education
    '29': ['31', '19'],        // Healthcare ↔ Healthcare Support, Science
    '31': ['29', '39'],        // Healthcare Support ↔ Healthcare, Personal Care
    '33': ['37', '53'],        // Protective ↔ Maintenance, Transportation
    '35': ['39', '41'],        // Food ↔ Personal Care, Sales
    '37': ['33', '49'],        // Maintenance ↔ Protective, Repair
    '39': ['31', '35'],        // Personal Care ↔ Healthcare Support, Food
    '41': ['11', '13'],        // Sales ↔ Management, Business
    '43': ['11', '13'],        // Admin ↔ Management, Business
    '45': ['53'],              // Farming ↔ Transportation
    '47': ['49', '51'],        // Construction ↔ Repair, Production
    '49': ['47', '51'],        // Repair ↔ Construction, Production
    '51': ['47', '49', '53'],  // Production ↔ Construction, Repair, Transportation
    '53': ['51', '45'],        // Transportation ↔ Production, Farming
};

// ================== HARD/SOFT SKILL CLASSIFICATION ==================

const SOFT_SKILLS = new Set([
    'teamwork', 'team work', 'team player',
    'communication', 'communication skills', 'written communication', 'verbal communication',
    'leadership', 'leader', 'leading teams',
    'problem solving', 'problem-solving', 'analytical thinking',
    'time management', 'organization', 'organized',
    'collaboration', 'collaborative', 'cross-functional',
    'adaptability', 'flexible', 'flexibility',
    'attention to detail', 'detail oriented', 'detail-oriented',
    'critical thinking', 'strategic thinking',
    'self-motivated', 'self-starter', 'proactive',
    'interpersonal', 'interpersonal skills',
    'work ethic', 'hardworking', 'hard working',
    'positive attitude', 'enthusiasm', 'passionate',
    'multitasking', 'multi-tasking',
    'creativity', 'creative', 'innovative',
    'decision making', 'decision-making',
    'negotiation', 'negotiating',
    'conflict resolution',
    'mentoring', 'coaching',
    'presentation skills', 'public speaking',
]);

// Hard requirement categories that should be hard caps
const HARD_REQUIREMENT_CATEGORIES = new Set<string>([
    'skill', 'tool', 'scale', 'domain', 'education',
]);

// ================== CLASSIFICATION FUNCTIONS ==================

/**
 * Classify text into SOC major group using keyword matching
 */
export function classifySOCGroup(text: string, domains: string[], titles: string[]): SOCMajorGroup | null {
    const lowerText = text.toLowerCase();
    const lowerTitles = titles.map(t => t.toLowerCase()).join(' ');
    const lowerDomains = domains.map(d => d.toLowerCase()).join(' ');

    const combined = `${lowerText} ${lowerTitles} ${lowerDomains}`;

    // Score each SOC group
    const scores: Array<{ code: SOCMajorGroup; score: number }> = SOC_GROUPS.map(group => {
        let score = 0;
        for (const keyword of group.keywords) {
            if (combined.includes(keyword)) {
                // Title matches are worth more
                if (lowerTitles.includes(keyword)) score += 3;
                // Domain matches are worth more
                else if (lowerDomains.includes(keyword)) score += 2;
                else score += 1;
            }
        }
        return { code: group.code, score };
    }).filter(s => s.score > 0);

    if (scores.length === 0) return null;

    // Return highest scoring group
    scores.sort((a, b) => b.score - a.score);
    return scores[0].code;
}

/**
 * Get SOC group name for display
 */
export function getSOCGroupName(code: SOCMajorGroup): string {
    return SOC_GROUPS.find(g => g.code === code)?.name || 'Unknown';
}

// ================== SPECIALTY DETECTION ==================
// For same-SOC-group cases, detect specialty mismatches
// Prevents false positives like "Backend Engineer" = "ML Engineer"

interface SpecialtyInfo {
    name: string;
    keywords: string[];
}

// Specialties by SOC major group
const SOC_SPECIALTIES: Record<SOCMajorGroup, SpecialtyInfo[]> = {
    // Management - different functional areas
    '11': [
        { name: 'Tech/Engineering Management', keywords: ['engineering manager', 'vp engineering', 'cto', 'technical director', 'software manager'] },
        { name: 'Sales/Revenue Management', keywords: ['sales manager', 'vp sales', 'revenue', 'cro', 'business development director'] },
        { name: 'Operations Management', keywords: ['operations manager', 'coo', 'plant manager', 'facilities'] },
        { name: 'HR/People Management', keywords: ['hr director', 'chief people', 'vp people', 'vp hr', 'talent director'] },
        { name: 'Finance Management', keywords: ['cfo', 'finance director', 'controller', 'vp finance'] },
        { name: 'Marketing Management', keywords: ['cmo', 'marketing director', 'vp marketing', 'brand director'] },
    ],

    // Business and Financial Operations
    '13': [
        { name: 'Recruiting/TA', keywords: ['recruiting', 'recruiter', 'talent acquisition', 'sourcing', 'staffing', 'hiring', 'full-cycle', 'technical recruiting', 'executive search'] },
        { name: 'Benefits/Compensation', keywords: ['benefits', 'compensation', 'comp', 'total rewards', 'fertility', 'wellness', 'tpa', 'erisa', 'plan design', '401k', 'health insurance'] },
        { name: 'HR Generalist', keywords: ['hr generalist', 'hrbp', 'business partner', 'employee relations', 'onboarding', 'offboarding'] },
        { name: 'Finance/Accounting', keywords: ['finance', 'accounting', 'accountant', 'cpa', 'audit', 'tax', 'financial analysis', 'bookkeeping'] },
        { name: 'Operations/PM', keywords: ['operations', 'process improvement', 'supply chain', 'project manager', 'program manager', 'scrum master'] },
        { name: 'Compliance/Risk', keywords: ['compliance', 'risk', 'regulatory', 'sox', 'aml', 'kyc'] },
    ],

    // Computer and Mathematical - CRITICAL for tech resumes
    '15': [
        { name: 'Backend/Infrastructure', keywords: ['backend', 'back-end', 'infrastructure', 'systems', 'distributed systems', 'microservices', 'api', 'server-side', 'java', 'golang', 'python backend', 'node.js', 'rust'] },
        { name: 'Frontend/UI', keywords: ['frontend', 'front-end', 'ui engineer', 'react', 'vue', 'angular', 'javascript', 'typescript', 'css', 'web developer', 'web development'] },
        { name: 'Fullstack', keywords: ['fullstack', 'full-stack', 'full stack'] },
        { name: 'Mobile', keywords: ['mobile', 'ios', 'android', 'swift', 'kotlin', 'react native', 'flutter', 'mobile developer'] },
        { name: 'Data/ML', keywords: ['data scientist', 'machine learning', 'ml engineer', 'ml', 'ai engineer', 'deep learning', 'nlp', 'computer vision', 'data engineer', 'analytics engineer', 'pytorch', 'tensorflow'] },
        { name: 'DevOps/SRE', keywords: ['devops', 'sre', 'site reliability', 'platform engineer', 'kubernetes', 'k8s', 'docker', 'terraform', 'aws', 'gcp', 'azure', 'cloud engineer'] },
        { name: 'Security', keywords: ['security engineer', 'security', 'infosec', 'cybersecurity', 'penetration', 'appsec', 'soc analyst', 'offensive', 'defensive', 'red team', 'blue team'] },
        { name: 'Data Analytics', keywords: ['data analyst', 'analytics', 'business intelligence', 'bi analyst', 'sql analyst', 'tableau', 'looker', 'power bi', 'reporting', 'dashboards'] },
        { name: 'QA/Testing', keywords: ['qa', 'quality assurance', 'test engineer', 'sdet', 'automation engineer', 'testing'] },
    ],

    // Architecture and Engineering
    '17': [
        { name: 'Civil/Structural', keywords: ['civil', 'structural', 'bridge', 'highway', 'transportation', 'geotechnical'] },
        { name: 'Mechanical', keywords: ['mechanical', 'hvac engineer', 'thermal', 'manufacturing engineer'] },
        { name: 'Electrical', keywords: ['electrical', 'power systems', 'controls', 'embedded', 'hardware'] },
        { name: 'Chemical/Process', keywords: ['chemical', 'process engineer', 'petrochemical', 'pharmaceutical'] },
        { name: 'Architecture', keywords: ['architect', 'architectural', 'building design', 'urban planning'] },
    ],

    // Life/Physical/Social Science
    '19': [
        { name: 'Biology/Life Sciences', keywords: ['biologist', 'biochemist', 'molecular', 'genetics', 'microbiology'] },
        { name: 'Chemistry', keywords: ['chemist', 'analytical chemistry', 'organic chemistry'] },
        { name: 'Physics/Materials', keywords: ['physicist', 'materials science', 'optics'] },
        { name: 'Research', keywords: ['research scientist', 'r&d', 'clinical research', 'postdoc'] },
    ],

    // Community and Social Service
    '21': [
        { name: 'Social Work', keywords: ['social worker', 'lcsw', 'case manager', 'child welfare'] },
        { name: 'Counseling', keywords: ['counselor', 'therapist', 'mental health', 'substance abuse'] },
        { name: 'Nonprofit', keywords: ['nonprofit', 'ngo', 'community organizer', 'program director'] },
    ],

    // Legal
    '23': [
        { name: 'Corporate/Transactional', keywords: ['corporate', 'transactional', 'm&a', 'securities', 'commercial'] },
        { name: 'Litigation', keywords: ['litigation', 'litigator', 'trial', 'dispute'] },
        { name: 'IP/Patent', keywords: ['ip', 'patent', 'trademark', 'intellectual property'] },
        { name: 'Compliance/Regulatory', keywords: ['compliance', 'regulatory', 'privacy', 'gdpr'] },
        { name: 'Paralegal', keywords: ['paralegal', 'legal assistant', 'legal secretary'] },
    ],

    // Educational Instruction
    '25': [
        { name: 'K-12', keywords: ['teacher', 'k-12', 'elementary', 'high school', 'middle school'] },
        { name: 'Higher Ed', keywords: ['professor', 'university', 'college', 'lecturer', 'academic'] },
        { name: 'Special Education', keywords: ['special education', 'sped', 'learning disabilities'] },
        { name: 'Training/Corporate', keywords: ['trainer', 'corporate training', 'instructional design', 'l&d'] },
    ],

    // Arts, Design, Entertainment
    '27': [
        { name: 'UX/Product Design', keywords: ['ux', 'user experience', 'product design', 'interaction design', 'user research'] },
        { name: 'Visual/Graphic Design', keywords: ['graphic design', 'visual design', 'brand design', 'illustration'] },
        { name: 'Content/Writing', keywords: ['content', 'writer', 'copywriter', 'technical writer', 'editor'] },
        { name: 'Video/Motion', keywords: ['video', 'motion graphics', 'animation', 'filmmaker'] },
        { name: 'Photography', keywords: ['photographer', 'photography'] },
    ],

    // Healthcare Practitioners - CRITICAL for healthcare resumes
    '29': [
        { name: 'Nursing', keywords: ['nurse', 'rn', 'lpn', 'nursing', 'bsn', 'msn', 'np', 'nurse practitioner'] },
        { name: 'Physician', keywords: ['physician', 'doctor', 'md', 'do', 'surgeon', 'hospitalist'] },
        { name: 'Pharmacy', keywords: ['pharmacist', 'pharmacy', 'pharmd'] },
        { name: 'Therapy/Rehab', keywords: ['physical therapist', 'pt', 'ot', 'occupational therapist', 'speech therapist', 'slp'] },
        { name: 'Mental Health', keywords: ['psychiatrist', 'psychologist', 'therapist', 'counselor', 'lmft'] },
        { name: 'Dental', keywords: ['dentist', 'dental', 'orthodontist', 'hygienist'] },
        { name: 'Radiology/Imaging', keywords: ['radiologist', 'radiology', 'imaging', 'ultrasound', 'mri'] },
    ],

    // Healthcare Support
    '31': [
        { name: 'Medical Assistant', keywords: ['medical assistant', 'ma', 'clinical assistant'] },
        { name: 'Home Health', keywords: ['home health', 'hha', 'caregiver', 'cna'] },
        { name: 'Phlebotomy/Lab', keywords: ['phlebotomist', 'lab technician', 'lab assistant'] },
    ],

    // Protective Service
    '33': [
        { name: 'Law Enforcement', keywords: ['police', 'officer', 'detective', 'sheriff'] },
        { name: 'Security', keywords: ['security guard', 'security officer', 'loss prevention'] },
        { name: 'Fire/EMS', keywords: ['firefighter', 'emt', 'paramedic', 'fire'] },
    ],

    // Food Preparation
    '35': [
        { name: 'Chef/Culinary', keywords: ['chef', 'sous chef', 'executive chef', 'culinary'] },
        { name: 'Restaurant Service', keywords: ['server', 'bartender', 'host'] },
        { name: 'Food Service Management', keywords: ['restaurant manager', 'food service manager'] },
    ],

    // Building Maintenance
    '37': [
        { name: 'Custodial', keywords: ['janitor', 'custodian', 'cleaner'] },
        { name: 'Groundskeeping', keywords: ['groundskeeper', 'landscaper', 'gardener'] },
    ],

    // Personal Care
    '39': [
        { name: 'Childcare', keywords: ['childcare', 'nanny', 'daycare', 'au pair'] },
        { name: 'Beauty/Cosmetology', keywords: ['hairdresser', 'cosmetologist', 'esthetician', 'barber'] },
        { name: 'Fitness', keywords: ['personal trainer', 'fitness instructor', 'yoga'] },
    ],

    // Sales - different sales motions
    '41': [
        { name: 'Enterprise/B2B', keywords: ['enterprise', 'b2b', 'account executive', 'ae', 'strategic accounts', 'complex sales'] },
        { name: 'SDR/BDR', keywords: ['sdr', 'bdr', 'sales development', 'business development rep', 'outbound'] },
        { name: 'Retail/B2C', keywords: ['retail', 'b2c', 'store', 'customer service rep'] },
        { name: 'Real Estate', keywords: ['real estate', 'realtor', 'property', 'broker'] },
        { name: 'Insurance', keywords: ['insurance', 'agent', 'underwriter'] },
    ],

    // Office and Administrative
    '43': [
        { name: 'Executive Assistant', keywords: ['executive assistant', 'ea', 'chief of staff'] },
        { name: 'Administrative', keywords: ['admin', 'administrative assistant', 'receptionist', 'office manager'] },
        { name: 'Data Entry/Clerk', keywords: ['data entry', 'clerk', 'filing'] },
    ],

    // Farming, Fishing, Forestry
    '45': [
        { name: 'Agriculture', keywords: ['farmer', 'agriculture', 'crop', 'livestock'] },
        { name: 'Forestry', keywords: ['forestry', 'logger', 'arborist'] },
    ],

    // Construction and Extraction
    '47': [
        { name: 'General/Carpentry', keywords: ['carpenter', 'framing', 'general contractor', 'construction worker'] },
        { name: 'Electrical Trade', keywords: ['electrician', 'electrical', 'wiring'] },
        { name: 'Plumbing/HVAC', keywords: ['plumber', 'plumbing', 'hvac', 'pipefitter'] },
        { name: 'Preconstruction/Estimating', keywords: ['preconstruction', 'estimator', 'estimating', 'cost estimation', 'takeoff'] },
        { name: 'Superintendent/Foreman', keywords: ['superintendent', 'foreman', 'site manager'] },
        { name: 'Specialty Trades', keywords: ['drywall', 'roofing', 'masonry', 'welding', 'ironworker'] },
    ],

    // Installation, Maintenance, Repair
    '49': [
        { name: 'Automotive', keywords: ['mechanic', 'automotive', 'auto technician'] },
        { name: 'Industrial/Machinery', keywords: ['industrial mechanic', 'machinery', 'equipment'] },
        { name: 'HVAC/Refrigeration', keywords: ['hvac technician', 'refrigeration'] },
        { name: 'Electronics', keywords: ['electronics technician', 'avionics'] },
    ],

    // Production
    '51': [
        { name: 'Manufacturing', keywords: ['manufacturing', 'production worker', 'assembly'] },
        { name: 'Machine Operation', keywords: ['machine operator', 'cnc', 'press operator'] },
        { name: 'Quality Control', keywords: ['quality control', 'qc', 'inspector'] },
    ],

    // Transportation
    '53': [
        { name: 'Truck/Delivery', keywords: ['truck driver', 'cdl', 'delivery', 'courier'] },
        { name: 'Warehouse/Logistics', keywords: ['warehouse', 'forklift', 'logistics', 'shipping'] },
        { name: 'Aviation', keywords: ['pilot', 'flight attendant', 'aviation'] },
        { name: 'Public Transit', keywords: ['bus driver', 'transit', 'conductor'] },
    ],
};

/**
 * Detect specialty within a SOC group
 */
function detectSpecialty(text: string, domains: string[], forSOC: SOCMajorGroup): string | null {
    const specialties = SOC_SPECIALTIES[forSOC];
    if (!specialties || specialties.length === 0) return null;

    const combined = `${text} ${domains.join(' ')}`.toLowerCase();

    for (const specialty of specialties) {
        for (const keyword of specialty.keywords) {
            if (combined.includes(keyword)) {
                return specialty.name;
            }
        }
    }

    return null;
}

// ================== SPECIALTY ADJACENCY ==================
// Specialties within the same SOC that share transferable skills
// Adjacent specialties get 80% alignment vs 60% for unrelated

const SPECIALTY_ADJACENCY: Record<string, Record<string, string[]>> = {
    // SOC 15: Computer and Mathematical
    '15': {
        'Backend/Infrastructure': ['Fullstack', 'DevOps/SRE', 'Data/ML'],  // Backend → Fullstack, DevOps, or ML is reasonable
        'Frontend/UI': ['Fullstack', 'Mobile'],  // Frontend → Fullstack or Mobile
        'Fullstack': ['Backend/Infrastructure', 'Frontend/UI'],  // Central hub
        'Mobile': ['Frontend/UI', 'Fullstack'],  // Mobile ↔ Frontend
        'Data/ML': ['Data Analytics', 'Backend/Infrastructure'],  // Data/ML ↔ Analytics
        'Data Analytics': ['Data/ML'],  // Analytics → ML is natural progression
        'DevOps/SRE': ['Backend/Infrastructure', 'Security'],  // DevOps ↔ Backend or Security
        'Security': ['DevOps/SRE', 'Backend/Infrastructure'],  // Security ↔ DevOps
        'QA/Testing': ['Backend/Infrastructure', 'Frontend/UI'],  // QA works with both
    },

    // SOC 13: Business and Financial Operations
    '13': {
        'Recruiting/TA': ['HR Generalist'],  // Recruiting ↔ HR
        'Benefits/Compensation': ['HR Generalist', 'Finance/Accounting'],  // Benefits ↔ HR, Finance
        'HR Generalist': ['Recruiting/TA', 'Benefits/Compensation', 'Operations/PM'],  // HR is central
        'Finance/Accounting': ['Benefits/Compensation', 'Compliance/Risk'],  // Finance ↔ Benefits, Compliance
        'Operations/PM': ['HR Generalist'],  // Ops ↔ HR
        'Compliance/Risk': ['Finance/Accounting'],  // Compliance ↔ Finance
    },

    // SOC 29: Healthcare Practitioners
    '29': {
        'Nursing': ['Therapy/Rehab', 'Mental Health'],  // Nursing ↔ Therapy, Mental Health
        'Physician': ['Nursing', 'Radiology/Imaging'],  // Physician works with nurses, radiology
        'Pharmacy': [],  // Pharmacy is quite specialized
        'Therapy/Rehab': ['Nursing', 'Mental Health'],  // Therapy ↔ Nursing, Mental Health
        'Mental Health': ['Therapy/Rehab', 'Nursing'],  // Mental Health ↔ Therapy
        'Dental': [],  // Dental is specialized
        'Radiology/Imaging': ['Physician'],  // Radiology works with physicians
    },

    // SOC 41: Sales
    '41': {
        'Enterprise/B2B': ['SDR/BDR'],  // Enterprise ↔ SDR (same pipeline)
        'SDR/BDR': ['Enterprise/B2B'],  // SDR → AE is natural progression
        'Retail/B2C': [],  // Different from B2B
        'Real Estate': [],  // Specialized
        'Insurance': [],  // Specialized
    },

    // SOC 17: Engineering
    '17': {
        'Civil/Structural': ['Architecture'],  // Civil ↔ Architecture
        'Mechanical': ['Electrical'],  // Mech ↔ Electrical sometimes overlap
        'Electrical': ['Mechanical'],  // Electrical ↔ Mechanical
        'Chemical/Process': [],  // Specialized
        'Architecture': ['Civil/Structural'],  // Architecture ↔ Civil
    },

    // SOC 27: Arts/Design
    '27': {
        'UX/Product Design': ['Visual/Graphic Design', 'Content/Writing'],  // UX ↔ Visual, Content
        'Visual/Graphic Design': ['UX/Product Design'],  // Visual ↔ UX
        'Content/Writing': ['UX/Product Design'],  // Content → UX
        'Video/Motion': ['Visual/Graphic Design', 'Photography'],  // Video ↔ Visual, Photo
        'Photography': ['Video/Motion'],  // Photo ↔ Video
    },

    // SOC 47: Construction
    '47': {
        'General/Carpentry': ['Superintendent/Foreman'],  // Carpenters can become foremen
        'Electrical Trade': ['Plumbing/HVAC'],  // Both are MEP trades
        'Plumbing/HVAC': ['Electrical Trade'],  // MEP trades overlap
        'Preconstruction/Estimating': ['Superintendent/Foreman'],  // Precon ↔ Superintendent
        'Superintendent/Foreman': ['General/Carpentry', 'Preconstruction/Estimating'],  // Superintendent came from trades
        'Specialty Trades': ['General/Carpentry'],  // Specialty ↔ General
    },
};

/**
 * Check if two specialties are adjacent (related but different)
 */
function areSpecialtiesAdjacent(socCode: SOCMajorGroup, specialty1: string, specialty2: string): boolean {
    const adjacencies = SPECIALTY_ADJACENCY[socCode];
    if (!adjacencies) return false;

    const s1Adjacents = adjacencies[specialty1] || [];
    const s2Adjacents = adjacencies[specialty2] || [];

    return s1Adjacents.includes(specialty2) || s2Adjacents.includes(specialty1);
}

/**
 * Calculate role alignment between resume and JD SOC groups
 * Includes specialty detection for same-SOC cases with three-tier matching:
 * - Same specialty = 100%
 * - Adjacent specialty = 80% (e.g., Data Analytics → Data/ML)
 * - Unrelated specialty = 60% (e.g., Data Analytics → Security)
 */
export function calculateRoleAlignment(
    resumeSOC: SOCMajorGroup | null,
    jdSOC: SOCMajorGroup | null,
    resumeDomains?: string[],
    jdDomains?: string[]
): { alignment: number; band: 'match' | 'adjacent' | 'mismatch'; specialtyMatch?: boolean; specialtyAdjacent?: boolean } {
    // If we can't classify either, be neutral
    if (!resumeSOC || !jdSOC) {
        return { alignment: 0.5, band: 'adjacent' };
    }

    // Same group = check for specialty mismatch
    if (resumeSOC === jdSOC) {
        // Check specialty within the same SOC group
        const resumeSpecialty = detectSpecialty('', resumeDomains || [], resumeSOC);
        const jdSpecialty = detectSpecialty('', jdDomains || [], jdSOC);

        // If both have detectable specialties and they don't match
        if (resumeSpecialty && jdSpecialty && resumeSpecialty !== jdSpecialty) {
            // Check if specialties are adjacent (related)
            if (areSpecialtiesAdjacent(resumeSOC, resumeSpecialty, jdSpecialty)) {
                // Adjacent specialties = 80% (e.g., Data Analytics → Data/ML)
                return { alignment: 0.8, band: 'adjacent', specialtyMatch: false, specialtyAdjacent: true };
            }
            // Unrelated specialties = 60% (e.g., Data Analytics → Security)
            return { alignment: 0.6, band: 'adjacent', specialtyMatch: false, specialtyAdjacent: false };
        }

        return { alignment: 1.0, band: 'match', specialtyMatch: true };
    }

    // Adjacent groups = partial match
    if (SOC_ADJACENCY[resumeSOC]?.includes(jdSOC)) {
        return { alignment: 0.55, band: 'adjacent' };
    }

    // Non-adjacent = mismatch
    return { alignment: 0.1, band: 'mismatch' };
}

/**
 * Check if a skill is soft (generic transferable) vs hard (specific)
 */
export function isSoftSkill(skill: string): boolean {
    return SOFT_SKILLS.has(skill.toLowerCase().trim());
}

// ================== MAIN GATE FUNCTION ==================

/**
 * Compute all gates and caps for a resume-JD match
 */
export function computeDomainGate(
    parsedResume: ParsedResume,
    parsedJD: ParsedJD,
    claimMatches: Array<{ requirement: ParsedRequirement; status: 'met' | 'partial' | 'gap' }>
): DomainGateResult {
    const explanations: string[] = [];

    // 1. Classify SOC groups
    const resumeSOC = classifySOCGroup(
        parsedResume.skills.join(' ') + ' ' + parsedResume.tools.join(' '),
        parsedResume.domains,
        parsedResume.titles
    );

    const jdSOC = classifySOCGroup(
        parsedJD.requirements.map(r => r.text).join(' '),
        parsedJD.domains,
        [parsedJD.title]
    );

    // 2. Calculate role alignment (with specialty detection for same-SOC cases)
    const { alignment, band, specialtyMatch } = calculateRoleAlignment(
        resumeSOC,
        jdSOC,
        parsedResume.domains,
        parsedJD.domains
    );
    const roleAlignment = Math.round(alignment * 100);

    // Role alignment cap based on Oracle's domain gating strategy
    let roleAlignmentCap: number;
    if (band === 'match') {
        roleAlignmentCap = 100;
    } else if (band === 'adjacent') {
        roleAlignmentCap = 65;  // Career changer territory
        if (specialtyMatch === false) {
            explanations.push(`Same field but different specialty (e.g., recruiting vs benefits)`);
        } else {
            explanations.push(`Role families are adjacent (${getSOCGroupName(resumeSOC!)} → ${getSOCGroupName(jdSOC!)})`);
        }
    } else {
        roleAlignmentCap = 15;  // Hard cap for unrelated roles
        explanations.push(`Different role families (${getSOCGroupName(resumeSOC!)} vs ${getSOCGroupName(jdSOC!)}). Score capped.`);
    }

    // 3. Calculate must-have coverage
    const mustHaves = claimMatches.filter(m => m.requirement.type === 'must_have');
    const mustHaveTotal = mustHaves.length;
    const mustHaveMet = mustHaves.filter(m => m.status === 'met').length +
        mustHaves.filter(m => m.status === 'partial').length * 0.5;
    const mustHaveCoverage = mustHaveTotal > 0 ? Math.round((mustHaveMet / mustHaveTotal) * 100) : 100;

    // Hard must-haves that are missing (blocking requirements)
    const hardMustHavesMissing = mustHaves
        .filter(m => m.status === 'gap' && HARD_REQUIREMENT_CATEGORIES.has(m.requirement.category))
        .map(m => m.requirement.text);

    // Must-have cap
    let mustHaveCap: number;
    if (mustHaveCoverage >= 80) {
        mustHaveCap = 100;
    } else if (mustHaveCoverage >= 60) {
        mustHaveCap = 80;
    } else if (mustHaveCoverage >= 40) {
        mustHaveCap = 60;
        explanations.push(`Missing several must-have requirements. Score limited.`);
    } else {
        mustHaveCap = 40;
        explanations.push(`Many must-have requirements unmet.`);
    }

    // Extra penalty for missing hard requirements (licenses, specific domain)
    if (hardMustHavesMissing.length >= 2) {
        mustHaveCap = Math.min(mustHaveCap, 35);
        explanations.push(`Missing critical requirements: ${hardMustHavesMissing.slice(0, 2).join(', ')}`);
    } else if (hardMustHavesMissing.length === 1) {
        mustHaveCap = Math.min(mustHaveCap, 50);
    }

    // 4. Coverage confidence (are we even in a domain we understand?)
    const allSkills = parsedJD.requirements
        .filter(r => r.category === 'skill' || r.category === 'tool')
        .map(r => r.extracted_skill || r.text);

    const softSkillCount = allSkills.filter(s => isSoftSkill(s)).length;
    const hardSkillCount = allSkills.length - softSkillCount;
    const softRatio = allSkills.length > 0 ? softSkillCount / allSkills.length : 0;

    let coverageConfidence: 'high' | 'low';
    let coverageConfidenceCap: number;

    if (hardSkillCount < 3 || softRatio > 0.6) {
        coverageConfidence = 'low';
        coverageConfidenceCap = 40;
        explanations.push(`Low confidence: JD skills are mostly generic or outside coverage.`);
    } else {
        coverageConfidence = 'high';
        coverageConfidenceCap = 100;
    }

    // 5. Calculate effective cap (min of all caps)
    const effectiveCap = Math.min(roleAlignmentCap, mustHaveCap, coverageConfidenceCap);

    return {
        roleAlignment,
        roleAlignmentBand: band,
        roleAlignmentCap,

        mustHaveCoverage,
        mustHaveMet,
        mustHaveTotal,
        mustHaveCap,
        hardMustHavesMissing,

        coverageConfidence,
        coverageConfidenceCap,

        effectiveCap,

        resumeSOC,
        jdSOC,

        explanations,
    };
}

/**
 * Apply the domain gate to a raw score
 */
export function applyDomainGate(rawScore: number, gate: DomainGateResult): number {
    // Apply multiplicative gating for non-matching roles
    let adjustedScore = rawScore;

    if (gate.roleAlignmentBand === 'mismatch') {
        // Aggressive multiplier for completely unrelated roles
        adjustedScore = rawScore * 0.15;
    } else if (gate.roleAlignmentBand === 'adjacent') {
        // Moderate multiplier for adjacent roles
        adjustedScore = rawScore * 0.65;
    }

    // Cap to effective maximum
    return Math.max(0, Math.min(gate.effectiveCap, Math.round(adjustedScore)));
}

// ================== SCORE BANDS ==================

export type ScoreBand = 'not_a_match' | 'stretch' | 'plausible' | 'strong' | 'excellent';

export interface ScoreBandInfo {
    band: ScoreBand;
    label: string;
    description: string;
    color: 'destructive' | 'muted' | 'foreground' | 'premium' | 'success';
}

export function getScoreBand(score: number): ScoreBandInfo {
    if (score <= 15) {
        return {
            band: 'not_a_match',
            label: 'Not a Match',
            description: 'This role is in a different field',
            color: 'destructive',
        };
    } else if (score <= 40) {
        return {
            band: 'stretch',
            label: 'Career Stretch',
            description: 'Would require significant career change',
            color: 'muted',
        };
    } else if (score <= 70) {
        return {
            band: 'plausible',
            label: 'Plausible Fit',
            description: 'Missing some qualifications but adjacent experience',
            color: 'foreground',
        };
    } else if (score <= 85) {
        return {
            band: 'strong',
            label: 'Strong Match',
            description: 'You meet most requirements',
            color: 'premium',
        };
    } else {
        return {
            band: 'excellent',
            label: 'Excellent Fit',
            description: 'You\'re highly qualified for this role',
            color: 'success',
        };
    }
}
