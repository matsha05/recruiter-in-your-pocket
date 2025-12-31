/**
 * Test direct JD-Resume matching
 * 
 * Uses the simpler, more powerful approach:
 * - Embed JD requirements
 * - Embed resume bullets
 * - Match via cosine similarity
 * - No intermediate skill database
 */

const fs = require('fs');
const path = require('path');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MATCH_THRESHOLD = 0.60;

// Sample JD requirements (from a recruiting manager role)
const JD_REQUIREMENTS = [
    "High-volume recruiting experience",
    "Engineering recruiting or technical hiring",
    "Team management and leadership",
    "Experience with applicant tracking systems",
    "Data-driven decision making",
    "Stakeholder management",
    "Performance management experience",
    "DEI initiatives experience",
    "Executive level hiring experience",
    "Global or remote team management"
];

async function createEmbedding(text) {
    const response = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "text-embedding-3-small",
            input: text.slice(0, 8000),
        }),
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
}

function cosineSimilarity(a, b) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

function splitResume(text) {
    return text.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 30);
}

async function main() {
    if (!OPENAI_API_KEY) {
        console.error('ERROR: Set OPENAI_API_KEY');
        process.exit(1);
    }

    // Load resume
    const resumePath = path.join(__dirname, '../test-data/matt-shaw-resume.txt');
    const resume = fs.readFileSync(resumePath, 'utf-8');
    const resumeBullets = splitResume(resume);

    console.log(`Resume: ${resumeBullets.length} bullets`);
    console.log(`JD: ${JD_REQUIREMENTS.length} requirements\n`);

    // Embed all resume bullets
    console.log('Embedding resume bullets...');
    const resumeEmbeddings = [];
    for (const bullet of resumeBullets) {
        const embedding = await createEmbedding(bullet);
        resumeEmbeddings.push({ text: bullet, embedding });
    }
    console.log(`Embedded ${resumeEmbeddings.length} bullets\n`);

    // Match each requirement
    console.log('='.repeat(80));
    console.log('MATCHING JD REQUIREMENTS TO RESUME');
    console.log('='.repeat(80) + '\n');

    let matchCount = 0;

    for (const req of JD_REQUIREMENTS) {
        const reqEmbedding = await createEmbedding(req);

        // Find best match
        let best = { text: '', similarity: 0 };
        for (const chunk of resumeEmbeddings) {
            const sim = cosineSimilarity(reqEmbedding, chunk.embedding);
            if (sim > best.similarity) {
                best = { text: chunk.text, similarity: sim };
            }
        }

        const isMatch = best.similarity >= MATCH_THRESHOLD;
        if (isMatch) matchCount++;

        const status = isMatch ? '✓' : '✗';
        const score = (best.similarity * 100).toFixed(1);

        console.log(`${status} [${score}%] "${req}"`);
        if (isMatch) {
            console.log(`   → "${best.text.slice(0, 80)}..."`);
        }
        console.log('');
    }

    // Summary
    console.log('='.repeat(80));
    console.log(`COVERAGE: ${matchCount}/${JD_REQUIREMENTS.length} requirements matched (${Math.round(matchCount / JD_REQUIREMENTS.length * 100)}%)`);
    console.log('='.repeat(80));
}

main().catch(console.error);
