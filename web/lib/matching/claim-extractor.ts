/**
 * Structured Claim Extraction Engine
 * 
 * Uses gpt-4o-mini to parse resumes and JDs ONCE into structured JSON.
 * Subsequent matching is cheap rule-based comparison.
 * 
 * Cost: ~$0.001 per document parsed
 * Matching: $0 (just JSON comparison)
 */

// ================== TYPES ==================

export interface ScaleClaim {
    metric: string;  // "hires", "users", "revenue", "team size"
    value: number;
    unit?: string;
    context?: string;  // "at Meta", "per quarter"
}

export interface GrowthClaim {
    metric: string;  // "time to hire", "revenue", "team size"
    percentage: number;  // 300 for "300% growth", -50 for "50% reduction"
    direction: 'increase' | 'decrease';
    context?: string;
}

// ================== EVIDENCE STRENGTH LEVELS ==================
// Level 2: Demonstrated in experience bullets = 1.0 credit
// Level 1: Listed in skills section = 0.6 credit
// Level 0: Inferred from context = 0.2 credit

export type EvidenceLevel = 2 | 1 | 0;

export interface SkillWithEvidence {
    skill: string;
    level: EvidenceLevel;
    source?: string;  // "experience", "skills_section", "inferred"
}

/**
 * Get the credit multiplier for an evidence level
 */
export function getEvidenceCredit(level: EvidenceLevel): number {
    switch (level) {
        case 2: return 1.0;   // Full credit: demonstrated in experience
        case 1: return 0.6;   // Partial credit: listed but not demonstrated
        case 0: return 0.2;   // Minimal credit: inferred only
        default: return 0.2;
    }
}


export interface ParsedResume {
    // Core fields
    skills: string[];
    tools: string[];  // Specific technologies: Greenhouse, Lever, Rippling

    // Enhanced: skills with evidence levels (optional for backward compatibility)
    skills_with_evidence?: SkillWithEvidence[];

    // Numeric achievements
    scale_claims: ScaleClaim[];
    growth_claims: GrowthClaim[];

    // Career context
    seniority: 'entry' | 'mid' | 'senior' | 'lead' | 'manager' | 'director' | 'vp' | 'c-level';
    titles: string[];  // Job titles held
    companies: string[];  // Companies worked at
    years_experience: number | null;

    // Domain & Industry
    domains: string[];  // "recruiting", "sales", "engineering"
    industries: string[];  // "tech", "finance", "healthcare"

    // Geographic
    locations: string[];  // Cities/regions worked
    scope: string | null;  // "global", "EMEA", "LATAM", "19 countries"
    remote_experience: boolean;

    // Qualifications
    certifications: string[];
    education: string[];
    languages: string[];
    work_auth: string | null;  // "US Citizen", "Green Card", etc. if mentioned
}

export interface ParsedRequirement {
    text: string;  // Original requirement text
    type: 'must_have' | 'nice_to_have';
    category: 'skill' | 'experience' | 'scale' | 'education' | 'domain' | 'company' | 'location' | 'tool' | 'other';
    extracted_skill?: string;
    min_years?: number;
    min_scale?: { metric: string; value: number };
    required_companies?: string[];  // "FAANG", "Big Tech"
    required_location?: string;
}

export interface ParsedJD {
    title: string;
    company?: string;
    seniority: string;
    domains: string[];
    industries: string[];
    location?: string;
    remote_ok: boolean;
    requirements: ParsedRequirement[];
}

// ================== PROMPTS ==================

const RESUME_PARSING_PROMPT = `You are an expert resume parser. Extract structured information from this resume.

Return JSON with this exact schema:
{
  "skills": ["skill1", "skill2"],
  "tools": ["Greenhouse", "Lever", "Salesforce"],
  "scale_claims": [
    {"metric": "hires", "value": 1000, "context": "at Meta"}
  ],
  "growth_claims": [
    {"metric": "time to hire", "percentage": 300, "direction": "decrease", "context": "in 4 months"}
  ],
  "seniority": "manager",
  "titles": ["Chief People Officer", "Recruiting Manager"],
  "companies": ["OpenAI", "Meta", "Google"],
  "years_experience": 10,
  "domains": ["recruiting", "HR"],
  "industries": ["tech"],
  "locations": ["Boulder CO", "Atlanta GA"],
  "scope": "global",
  "remote_experience": true,
  "certifications": ["SHRM-CP"],
  "education": ["B.S. Business Administration"],
  "languages": ["English"],
  "work_auth": null
}

Focus on extracting:
1. All explicit skills and specific tools/technologies
2. Numeric achievements (hires, users, revenue, team size)
3. Percentage achievements (growth %, reduction %)
4. All job titles and companies
5. Geographic scope (global, EMEA, LATAM, number of countries)
6. Remote/distributed experience indicators
7. All certifications and education

Resume:
`;

const JD_PARSING_PROMPT = `You are an expert job description parser. Extract structured requirements from this JD.

Return JSON with this exact schema:
{
  "title": "Recruiting Manager",
  "company": "Upstart",
  "seniority": "manager",
  "domains": ["recruiting", "engineering"],
  "industries": ["fintech"],
  "location": "Remote (US)",
  "remote_ok": true,
  "requirements": [
    {
      "text": "5+ years of recruiting experience",
      "type": "must_have",
      "category": "experience",
      "min_years": 5
    },
    {
      "text": "Experience with high-volume hiring",
      "type": "must_have",
      "category": "scale",
      "min_scale": {"metric": "hires", "value": 100}
    },
    {
      "text": "Engineering recruiting experience",
      "type": "must_have",
      "category": "skill",
      "extracted_skill": "Engineering Recruiting"
    },
    {
      "text": "FAANG or top tech company experience preferred",
      "type": "nice_to_have",
      "category": "company",
      "required_companies": ["FAANG", "Big Tech"]
    }
  ]
}

Categories: skill, experience, scale, education, domain, company, location, tool, other
Types: must_have (required), nice_to_have (preferred)

Job Description:
`;

// ================== PARSING FUNCTIONS ==================

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function callGPT4oMini(prompt: string): Promise<string> {
    if (!OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY not set');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.1,  // Low temperature for consistent extraction
            response_format: { type: 'json_object' }
        }),
    });

    if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

/**
 * Parse a resume into structured claims
 * Cost: ~$0.001
 */
export async function parseResume(resumeText: string): Promise<ParsedResume> {
    const prompt = RESUME_PARSING_PROMPT + resumeText;
    const result = await callGPT4oMini(prompt);

    try {
        const parsed = JSON.parse(result);
        return {
            skills: parsed.skills || [],
            tools: parsed.tools || [],
            scale_claims: parsed.scale_claims || [],
            growth_claims: parsed.growth_claims || [],
            seniority: parsed.seniority || 'mid',
            titles: parsed.titles || [],
            companies: parsed.companies || [],
            years_experience: parsed.years_experience ?? null,
            domains: parsed.domains || [],
            industries: parsed.industries || [],
            locations: parsed.locations || [],
            scope: parsed.scope || null,
            remote_experience: parsed.remote_experience || false,
            certifications: parsed.certifications || [],
            education: parsed.education || [],
            languages: parsed.languages || [],
            work_auth: parsed.work_auth || null
        };
    } catch (e) {
        console.error('[ClaimExtractor] Failed to parse resume response:', e);
        throw new Error('Failed to parse resume');
    }
}

/**
 * Parse a job description into structured requirements
 * Cost: ~$0.001
 */
export async function parseJobDescription(jdText: string): Promise<ParsedJD> {
    const prompt = JD_PARSING_PROMPT + jdText;
    const result = await callGPT4oMini(prompt);

    try {
        const parsed = JSON.parse(result);
        return {
            title: parsed.title || 'Unknown',
            company: parsed.company,
            seniority: parsed.seniority || 'mid',
            domains: parsed.domains || [],
            industries: parsed.industries || [],
            location: parsed.location,
            remote_ok: parsed.remote_ok || false,
            requirements: parsed.requirements || []
        };
    } catch (e) {
        console.error('[ClaimExtractor] Failed to parse JD response:', e);
        throw new Error('Failed to parse job description');
    }
}

// ================== MATCHING FUNCTIONS ==================

export interface MatchResult {
    requirement: ParsedRequirement;
    status: 'met' | 'partial' | 'gap';
    evidence?: string;
    confidence: number;
}

/**
 * Match parsed resume against parsed JD requirements
 * Cost: $0 (just JSON comparison)
 */
export function matchClaimsToRequirements(
    resume: ParsedResume,
    jd: ParsedJD
): { matches: MatchResult[]; score: number } {
    const matches: MatchResult[] = [];
    let metCount = 0;
    let partialCount = 0;

    for (const req of jd.requirements) {
        const match = evaluateRequirement(req, resume);
        matches.push(match);

        if (match.status === 'met') metCount++;
        else if (match.status === 'partial') partialCount++;
    }

    // Calculate score: 100% for met, 50% for partial, 0% for gap
    const totalReqs = jd.requirements.length;
    const score = totalReqs > 0
        ? Math.round(((metCount + partialCount * 0.5) / totalReqs) * 100)
        : 50;

    return { matches, score };
}

function evaluateRequirement(req: ParsedRequirement, resume: ParsedResume): MatchResult {
    switch (req.category) {
        case 'skill':
            return evaluateSkillRequirement(req, resume);
        case 'experience':
            return evaluateExperienceRequirement(req, resume);
        case 'scale':
            return evaluateScaleRequirement(req, resume);
        case 'domain':
            return evaluateDomainRequirement(req, resume);
        case 'company':
            return evaluateCompanyRequirement(req, resume);
        case 'tool':
            return evaluateToolRequirement(req, resume);
        case 'location':
            return evaluateLocationRequirement(req, resume);
        default:
            return { requirement: req, status: 'gap', confidence: 0.5 };
    }
}

function evaluateSkillRequirement(req: ParsedRequirement, resume: ParsedResume): MatchResult {
    const skill = req.extracted_skill?.toLowerCase() || '';

    const hasSkill = resume.skills.some(s =>
        s.toLowerCase().includes(skill) || skill.includes(s.toLowerCase())
    );

    const hasDomain = resume.domains.some(d =>
        d.toLowerCase().includes(skill) || skill.includes(d.toLowerCase())
    );

    if (hasSkill) {
        return { requirement: req, status: 'met', confidence: 0.95, evidence: `Has skill: ${skill}` };
    } else if (hasDomain) {
        return { requirement: req, status: 'partial', confidence: 0.7, evidence: `Related domain: ${resume.domains.join(', ')}` };
    }

    return { requirement: req, status: 'gap', confidence: 0.8 };
}

function evaluateExperienceRequirement(req: ParsedRequirement, resume: ParsedResume): MatchResult {
    if (!req.min_years || resume.years_experience === null) {
        return { requirement: req, status: 'partial', confidence: 0.5 };
    }

    if (resume.years_experience >= req.min_years) {
        return {
            requirement: req,
            status: 'met',
            confidence: 0.95,
            evidence: `${resume.years_experience} years experience`
        };
    } else if (resume.years_experience >= req.min_years * 0.7) {
        return { requirement: req, status: 'partial', confidence: 0.7 };
    }

    return { requirement: req, status: 'gap', confidence: 0.8 };
}

function evaluateScaleRequirement(req: ParsedRequirement, resume: ParsedResume): MatchResult {
    if (!req.min_scale) {
        return { requirement: req, status: 'partial', confidence: 0.5 };
    }

    const matchingClaim = resume.scale_claims.find(claim => {
        const metricMatch = claim.metric.toLowerCase().includes(req.min_scale!.metric.toLowerCase()) ||
            req.min_scale!.metric.toLowerCase().includes(claim.metric.toLowerCase());
        return metricMatch && claim.value >= req.min_scale!.value;
    });

    if (matchingClaim) {
        return {
            requirement: req,
            status: 'met',
            confidence: 0.95,
            evidence: `${matchingClaim.value}+ ${matchingClaim.metric}${matchingClaim.context ? ` ${matchingClaim.context}` : ''}`
        };
    }

    // Check growth claims too
    const growthClaim = resume.growth_claims.find(claim =>
        claim.metric.toLowerCase().includes(req.min_scale!.metric.toLowerCase())
    );
    if (growthClaim) {
        return {
            requirement: req,
            status: 'partial',
            confidence: 0.7,
            evidence: `${growthClaim.percentage}% ${growthClaim.direction} in ${growthClaim.metric}`
        };
    }

    return { requirement: req, status: 'gap', confidence: 0.8 };
}

function evaluateDomainRequirement(req: ParsedRequirement, resume: ParsedResume): MatchResult {
    const reqText = req.text.toLowerCase();

    const hasDomain = resume.domains.some(d => reqText.includes(d.toLowerCase()));
    const hasIndustry = resume.industries.some(i => reqText.includes(i.toLowerCase()));

    if (hasDomain) {
        return { requirement: req, status: 'met', confidence: 0.9, evidence: `Domain: ${resume.domains.join(', ')}` };
    } else if (hasIndustry) {
        return { requirement: req, status: 'partial', confidence: 0.7, evidence: `Industry: ${resume.industries.join(', ')}` };
    }

    return { requirement: req, status: 'gap', confidence: 0.7 };
}

function evaluateCompanyRequirement(req: ParsedRequirement, resume: ParsedResume): MatchResult {
    const reqCompanies = req.required_companies || [];
    const reqText = req.text.toLowerCase();

    // Check for FAANG/Big Tech keywords
    const isFaangReq = reqText.includes('faang') || reqText.includes('big tech') || reqText.includes('top tech');
    const faangCompanies = ['meta', 'facebook', 'apple', 'amazon', 'netflix', 'google', 'alphabet', 'microsoft', 'openai'];

    const hasFaang = resume.companies.some(c =>
        faangCompanies.some(f => c.toLowerCase().includes(f))
    );

    if (isFaangReq && hasFaang) {
        const matchedFaang = resume.companies.find(c =>
            faangCompanies.some(f => c.toLowerCase().includes(f))
        );
        return { requirement: req, status: 'met', confidence: 0.95, evidence: `Worked at ${matchedFaang}` };
    }

    // Check specific company matches
    for (const reqCo of reqCompanies) {
        const hasCompany = resume.companies.some(c =>
            c.toLowerCase().includes(reqCo.toLowerCase())
        );
        if (hasCompany) {
            return { requirement: req, status: 'met', confidence: 0.95, evidence: `Worked at ${reqCo}` };
        }
    }

    return { requirement: req, status: 'gap', confidence: 0.7 };
}

function evaluateToolRequirement(req: ParsedRequirement, resume: ParsedResume): MatchResult {
    const tool = req.extracted_skill?.toLowerCase() || req.text.toLowerCase();

    const hasTool = resume.tools.some(t =>
        t.toLowerCase().includes(tool) || tool.includes(t.toLowerCase())
    );

    // Also check skills for tools
    const hasSkill = resume.skills.some(s =>
        s.toLowerCase().includes(tool) || tool.includes(s.toLowerCase())
    );

    if (hasTool || hasSkill) {
        return { requirement: req, status: 'met', confidence: 0.95, evidence: `Has tool: ${tool}` };
    }

    return { requirement: req, status: 'gap', confidence: 0.8 };
}

function evaluateLocationRequirement(req: ParsedRequirement, resume: ParsedResume): MatchResult {
    const reqLocation = req.required_location?.toLowerCase() || req.text.toLowerCase();

    // Check for remote compatibility
    if (reqLocation.includes('remote') && resume.remote_experience) {
        return { requirement: req, status: 'met', confidence: 0.9, evidence: 'Has remote experience' };
    }

    // Check for global/scope match
    if ((reqLocation.includes('global') || reqLocation.includes('international')) && resume.scope) {
        return { requirement: req, status: 'met', confidence: 0.9, evidence: `Scope: ${resume.scope}` };
    }

    // Check specific location match
    const hasLocation = resume.locations.some(loc =>
        loc.toLowerCase().includes(reqLocation) || reqLocation.includes(loc.toLowerCase())
    );

    if (hasLocation) {
        return { requirement: req, status: 'met', confidence: 0.9, evidence: `Location: ${resume.locations.join(', ')}` };
    }

    return { requirement: req, status: 'gap', confidence: 0.6 };
}
