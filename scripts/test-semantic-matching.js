/**
 * Test semantic skill matching on Matt's resume
 * 
 * Run with: node scripts/test-semantic-matching.js
 */

const fs = require('fs');
const path = require('path');

// Load embeddings
const embeddingsPath = path.join(__dirname, '../web/lib/matching/onet-skill-embeddings.json');
const resumePath = path.join(__dirname, '../test-data/matt-shaw-resume.txt');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SIMILARITY_THRESHOLD = 0.65; // Lower threshold for testing

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

function splitIntoChunks(text) {
    // Split by bullets and newlines
    const lines = text.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 30);

    return lines.slice(0, 30); // Limit for testing
}

async function main() {
    if (!OPENAI_API_KEY) {
        console.error('ERROR: Set OPENAI_API_KEY environment variable');
        process.exit(1);
    }

    console.log('Loading skill embeddings...');
    const skillData = JSON.parse(fs.readFileSync(embeddingsPath, 'utf-8'));
    console.log(`Loaded ${skillData.skills.length} skills\n`);

    console.log('Loading resume...');
    const resume = fs.readFileSync(resumePath, 'utf-8');
    const chunks = splitIntoChunks(resume);
    console.log(`Split into ${chunks.length} chunks\n`);

    // Find skills for each chunk
    const allMatches = new Map();

    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        process.stdout.write(`Processing chunk ${i + 1}/${chunks.length}...`);

        try {
            const chunkEmbedding = await createEmbedding(chunk);

            // Find top matches for this chunk
            const matches = [];
            for (const skill of skillData.skills) {
                const similarity = cosineSimilarity(chunkEmbedding, skill.embedding);
                if (similarity >= SIMILARITY_THRESHOLD) {
                    matches.push({ skill, similarity });
                }
            }

            // Sort and take top 3
            matches.sort((a, b) => b.similarity - a.similarity);
            const top3 = matches.slice(0, 3);

            for (const match of top3) {
                const existing = allMatches.get(match.skill.name);
                if (!existing || match.similarity > existing.similarity) {
                    allMatches.set(match.skill.name, {
                        name: match.skill.name,
                        category: match.skill.category,
                        similarity: match.similarity,
                        matchedChunk: chunk.slice(0, 60) + '...'
                    });
                }
            }

            console.log(` ✓ (${top3.length} matches)`);
        } catch (error) {
            console.log(` ✗ Error: ${error.message}`);
        }

        // Rate limit
        await new Promise(r => setTimeout(r, 100));
    }

    // Sort and display results
    const results = Array.from(allMatches.values());
    results.sort((a, b) => b.similarity - a.similarity);

    console.log('\n' + '='.repeat(80));
    console.log('SEMANTIC SKILL MATCHES (sorted by confidence)');
    console.log('='.repeat(80) + '\n');

    // Group by category
    const byCategory = {
        skill: results.filter(r => r.category === 'skill'),
        technology: results.filter(r => r.category === 'technology')
    };

    console.log('CORE SKILLS:');
    console.log('-'.repeat(40));
    byCategory.skill.slice(0, 15).forEach(r => {
        console.log(`  ${(r.similarity * 100).toFixed(1)}% - ${r.name}`);
    });

    console.log('\nTECHNOLOGY SKILLS:');
    console.log('-'.repeat(40));
    byCategory.technology.slice(0, 15).forEach(r => {
        console.log(`  ${(r.similarity * 100).toFixed(1)}% - ${r.name}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log(`TOTAL: ${results.length} skills inferred from resume`);
    console.log('='.repeat(80));
}

main().catch(console.error);
