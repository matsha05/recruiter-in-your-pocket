/**
 * Test expanded claim extraction on Matt's resume
 */

const fs = require('fs');
const path = require('path');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

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
        console.error('API Error:', response.status, error);
        throw new Error(`API failed: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

async function main() {
    if (!OPENAI_API_KEY) {
        console.error('Set OPENAI_API_KEY');
        process.exit(1);
    }

    const resumePath = path.join(__dirname, '../test-data/matt-shaw-resume.txt');
    const resume = fs.readFileSync(resumePath, 'utf-8');

    console.log('='.repeat(70));
    console.log('EXPANDED CLAIM EXTRACTION (16 fields)');
    console.log('='.repeat(70) + '\n');

    const parsedResume = await callGPT(RESUME_PARSING_PROMPT + resume);
    const data = JSON.parse(parsedResume);

    // Display all fields
    console.log('COMPANIES:', (data.companies || []).join(', '));
    console.log('TITLES:', (data.titles || []).join(', '));
    console.log('SENIORITY:', data.seniority);
    console.log('YEARS:', data.years_experience);
    console.log('');

    console.log('DOMAINS:', (data.domains || []).join(', '));
    console.log('INDUSTRIES:', (data.industries || []).join(', '));
    console.log('');

    console.log('LOCATIONS:', (data.locations || []).join(', '));
    console.log('SCOPE:', data.scope);
    console.log('REMOTE:', data.remote_experience);
    console.log('');

    console.log('SKILLS:', (data.skills || []).slice(0, 10).join(', '));
    console.log('TOOLS:', (data.tools || []).join(', '));
    console.log('');

    console.log('SCALE CLAIMS:');
    (data.scale_claims || []).forEach(c => {
        console.log(`  • ${c.value}+ ${c.metric} ${c.context || ''}`);
    });
    console.log('');

    console.log('GROWTH CLAIMS:');
    (data.growth_claims || []).forEach(c => {
        console.log(`  • ${c.percentage}% ${c.direction} in ${c.metric} ${c.context || ''}`);
    });
    console.log('');

    console.log('CERTIFICATIONS:', (data.certifications || []).join(', '));
    console.log('EDUCATION:', (data.education || []).join(', '));
    console.log('LANGUAGES:', (data.languages || []).join(', '));
    console.log('WORK AUTH:', data.work_auth || 'Not mentioned');

    console.log('\n' + '='.repeat(70));
    console.log('Full JSON saved to console for review');
    console.log('='.repeat(70));
}

main().catch(console.error);
