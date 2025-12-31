/**
 * End-to-end test of enhanced matching
 * Tests the full pipeline: resume + JD → structured claims → enhanced match score
 */

const fs = require('fs');
const path = require('path');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const RESUME_PARSING_PROMPT = `You are an expert resume parser. Extract structured information from this resume.

Return JSON with this exact schema:
{
  "skills": ["skill1", "skill2"],
  "tools": ["Greenhouse", "Lever", "Salesforce"],
  "scale_claims": [{"metric": "hires", "value": 1000, "context": "at Meta"}],
  "growth_claims": [{"metric": "time to hire", "percentage": 300, "direction": "decrease"}],
  "seniority": "manager",
  "titles": ["CPO", "Recruiting Manager"],
  "companies": ["Meta", "Google"],
  "years_experience": 10,
  "domains": ["recruiting", "HR"],
  "industries": ["tech"],
  "locations": ["Boulder CO"],
  "scope": "global",
  "remote_experience": true,
  "certifications": ["SHRM-CP"],
  "education": ["B.S. Business"],
  "languages": ["English"],
  "work_auth": null
}

Resume:
`;

const JD_PARSING_PROMPT = `You are an expert job description parser. Extract structured requirements from this JD.

Return JSON with this exact schema:
{
  "title": "Recruiting Manager",
  "company": "Upstart",
  "seniority": "manager",
  "domains": ["recruiting"],
  "industries": ["fintech"],
  "location": "Remote (US)",
  "remote_ok": true,
  "requirements": [
    {"text": "5+ years recruiting experience", "type": "must_have", "category": "experience", "min_years": 5},
    {"text": "High-volume hiring", "type": "must_have", "category": "scale", "min_scale": {"metric": "hires", "value": 100}},
    {"text": "Engineering recruiting", "type": "must_have", "category": "skill", "extracted_skill": "Engineering Recruiting"}
  ]
}

Job Description:
`;

const SAMPLE_JD = `
Job Title: Senior Recruiting Manager - Engineering
Company: Upstart
Location: Remote (US)

About the Role:
We're looking for an experienced Recruiting Manager to lead our engineering hiring efforts.

Requirements:
- 7+ years of full-cycle recruiting experience
- Experience with high-volume hiring (100+ hires per year)
- Engineering/technical recruiting background required
- Experience at FAANG or top tech companies preferred
- Team management experience (3+ direct reports)
- Strong stakeholder management skills
- Experience with Greenhouse or similar ATS
- Global recruiting experience is a plus
`;

async function callGPT(prompt) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.1,
            response_format: { type: 'json_object' }
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`API failed: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
}

function matchClaimsToRequirements(resume, jd) {
    const matches = [];
    let metCount = 0;
    let partialCount = 0;

    for (const req of jd.requirements || []) {
        let status = 'gap';
        let evidence = null;

        switch (req.category) {
            case 'experience':
                if (resume.years_experience >= (req.min_years || 0)) {
                    status = 'met';
                    evidence = `${resume.years_experience} years experience`;
                }
                break;
            case 'scale':
                const scaleClaim = (resume.scale_claims || []).find(c =>
                    c.value >= (req.min_scale?.value || 0)
                );
                if (scaleClaim) {
                    status = 'met';
                    evidence = `${scaleClaim.value}+ ${scaleClaim.metric} ${scaleClaim.context || ''}`;
                }
                break;
            case 'skill':
                const hasSkill = (resume.skills || []).some(s =>
                    s.toLowerCase().includes((req.extracted_skill || '').toLowerCase())
                ) || (resume.domains || []).some(d =>
                    (req.extracted_skill || '').toLowerCase().includes(d.toLowerCase())
                );
                if (hasSkill) {
                    status = 'met';
                    evidence = `Has ${req.extracted_skill}`;
                }
                break;
            case 'company':
                const faang = ['meta', 'google', 'apple', 'amazon', 'netflix', 'microsoft', 'openai'];
                const hasFaang = (resume.companies || []).some(c =>
                    faang.some(f => c.toLowerCase().includes(f))
                );
                if (hasFaang) {
                    status = 'met';
                    evidence = `Worked at ${resume.companies.find(c => faang.some(f => c.toLowerCase().includes(f)))}`;
                }
                break;
            case 'tool':
                const hasTool = (resume.tools || []).some(t =>
                    req.text.toLowerCase().includes(t.toLowerCase())
                );
                if (hasTool) {
                    status = 'met';
                    evidence = `Has tool experience`;
                }
                break;
        }

        if (status === 'met') metCount++;
        else if (status === 'partial') partialCount++;

        matches.push({ requirement: req, status, evidence });
    }

    const score = jd.requirements?.length > 0
        ? Math.round(((metCount + partialCount * 0.5) / jd.requirements.length) * 100)
        : 50;

    return { matches, score };
}

async function main() {
    if (!OPENAI_API_KEY) {
        console.error('Set OPENAI_API_KEY');
        process.exit(1);
    }

    console.log('='.repeat(70));
    console.log('END-TO-END ENHANCED MATCHING TEST');
    console.log('='.repeat(70) + '\n');

    // Parse resume
    console.log('Step 1: Parsing resume...');
    const resumePath = path.join(__dirname, '../test-data/matt-shaw-resume.txt');
    const resumeText = fs.readFileSync(resumePath, 'utf-8');
    const parsedResume = await callGPT(RESUME_PARSING_PROMPT + resumeText);
    console.log('✓ Resume parsed\n');

    // Parse JD
    console.log('Step 2: Parsing job description...');
    const parsedJD = await callGPT(JD_PARSING_PROMPT + SAMPLE_JD);
    console.log('✓ JD parsed\n');

    // Match
    console.log('Step 3: Matching claims to requirements...\n');
    const result = matchClaimsToRequirements(parsedResume, parsedJD);

    // Output
    console.log('='.repeat(70));
    console.log('MATCH RESULTS');
    console.log('='.repeat(70) + '\n');

    console.log(`CLAIM SCORE: ${result.score}/100\n`);

    console.log('REQUIREMENT MATCHES:');
    for (const match of result.matches) {
        const icon = match.status === 'met' ? '✓' : match.status === 'partial' ? '~' : '✗';
        console.log(`  ${icon} ${match.requirement.text}`);
        if (match.evidence) {
            console.log(`    → ${match.evidence}`);
        }
    }

    console.log('\n' + '='.repeat(70));
    console.log(`Companies: ${parsedResume.companies?.join(', ')}`);
    console.log(`Tools: ${parsedResume.tools?.join(', ')}`);
    console.log(`Scope: ${parsedResume.scope}`);
    console.log('='.repeat(70));
}

main().catch(console.error);
