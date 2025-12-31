/**
 * Debug script to check actual similarity scores
 */

const fs = require('fs');
const path = require('path');

const embeddingsPath = path.join(__dirname, '../web/lib/matching/onet-skill-embeddings.json');
const resumePath = path.join(__dirname, '../test-data/matt-shaw-resume.txt');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

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

async function main() {
    if (!OPENAI_API_KEY) {
        console.error('ERROR: Set OPENAI_API_KEY');
        process.exit(1);
    }

    console.log('Loading skill embeddings...');
    const skillData = JSON.parse(fs.readFileSync(embeddingsPath, 'utf-8'));
    console.log(`Loaded ${skillData.skills.length} skills\n`);

    // Test a specific resume chunk
    const testChunk = "Managed a fully-remote team of 19 individuals: 3 Recruiting Leads and 16 Sourcers. contributing to 1,000+ ML Gen hires";

    console.log('Test chunk:', testChunk);
    console.log('\nGetting embedding...');

    const chunkEmbedding = await createEmbedding(testChunk);
    console.log('Embedding received, dimensions:', chunkEmbedding.length);

    // Check similarity with top 50 skills
    const allScores = [];
    for (const skill of skillData.skills) {
        const similarity = cosineSimilarity(chunkEmbedding, skill.embedding);
        allScores.push({ name: skill.name, category: skill.category, similarity });
    }

    // Sort and show top 20
    allScores.sort((a, b) => b.similarity - a.similarity);

    console.log('\n' + '='.repeat(60));
    console.log('TOP 20 MATCHES (all skills)');
    console.log('='.repeat(60));

    allScores.slice(0, 20).forEach((s, i) => {
        console.log(`${(i + 1).toString().padStart(2)}. ${(s.similarity * 100).toFixed(1)}% - ${s.name} (${s.category})`);
    });

    // Show distribution
    console.log('\n' + '='.repeat(60));
    console.log('SIMILARITY DISTRIBUTION');
    console.log('='.repeat(60));

    const ranges = [
        { min: 0.7, max: 1.0, label: '>70%' },
        { min: 0.6, max: 0.7, label: '60-70%' },
        { min: 0.5, max: 0.6, label: '50-60%' },
        { min: 0.4, max: 0.5, label: '40-50%' },
        { min: 0.3, max: 0.4, label: '30-40%' },
        { min: 0.0, max: 0.3, label: '<30%' },
    ];

    ranges.forEach(r => {
        const count = allScores.filter(s => s.similarity >= r.min && s.similarity < r.max).length;
        console.log(`  ${r.label}: ${count} skills`);
    });
}

main().catch(console.error);
