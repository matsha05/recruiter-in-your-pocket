/**
 * Generate embeddings for all O*NET skills
 * 
 * Run with: node scripts/generate-skill-embeddings.js
 * 
 * This is a ONE-TIME cost of ~$0.05 to embed all 8,820 skills.
 * Output is cached in onet-skill-embeddings.json
 */

const fs = require('fs');
const path = require('path');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const BATCH_SIZE = 100; // OpenAI allows up to 2048 in one request

const inputPath = path.join(__dirname, '../web/lib/matching/onet-skill-ontology.json');
const outputPath = path.join(__dirname, '../web/lib/matching/onet-skill-embeddings.json');

async function createBatchEmbeddings(texts) {
    const response = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "text-embedding-3-small",
            input: texts,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.data.map(d => d.embedding);
}

async function main() {
    if (!OPENAI_API_KEY) {
        console.error('ERROR: OPENAI_API_KEY environment variable not set');
        process.exit(1);
    }

    // Load ontology
    const ontology = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
    console.log(`Loaded ${ontology.skills.length} skills from O*NET ontology`);

    // Prepare texts for embedding (skill name + description for better quality)
    const texts = ontology.skills.map(s =>
        s.description ? `${s.name}: ${s.description}` : s.name
    );

    // Generate embeddings in batches
    const embeddings = [];
    const totalBatches = Math.ceil(texts.length / BATCH_SIZE);

    console.log(`Generating embeddings in ${totalBatches} batches...`);

    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
        const batch = texts.slice(i, i + BATCH_SIZE);
        const batchNum = Math.floor(i / BATCH_SIZE) + 1;

        process.stdout.write(`  Batch ${batchNum}/${totalBatches}...`);

        try {
            const batchEmbeddings = await createBatchEmbeddings(batch);
            embeddings.push(...batchEmbeddings);
            console.log(` ✓ (${embeddings.length} total)`);
        } catch (error) {
            console.error(` ✗ Error:`, error.message);
            // Save progress so far
            await saveProgress(ontology, embeddings);
            process.exit(1);
        }

        // Small delay to respect rate limits
        if (i + BATCH_SIZE < texts.length) {
            await new Promise(r => setTimeout(r, 100));
        }
    }

    // Save final output
    await saveProgress(ontology, embeddings);
    console.log(`\n✓ Successfully generated ${embeddings.length} embeddings`);
    console.log(`  Output: ${outputPath}`);
}

async function saveProgress(ontology, embeddings) {
    const output = {
        version: ontology.version,
        source: ontology.source,
        generatedAt: new Date().toISOString(),
        model: 'text-embedding-3-small',
        dimensions: embeddings[0]?.length || 1536,
        skills: ontology.skills.slice(0, embeddings.length).map((skill, i) => ({
            id: skill.id,
            name: skill.name,
            category: skill.category,
            embedding: embeddings[i]
        }))
    };

    fs.writeFileSync(outputPath, JSON.stringify(output));
    console.log(`\n  Progress saved: ${embeddings.length} skills`);
}

main().catch(console.error);
