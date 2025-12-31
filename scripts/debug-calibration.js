/**
 * Debug: Check what the embeddings think are similar
 */

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
            input: text,
        }),
    });
    const data = await response.json();
    return data.data[0].embedding;
}

function cosineSimilarity(a, b) {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function main() {
    console.log('Testing embedding similarity calibration...\n');

    const pairs = [
        // Should be HIGH similarity (same concept)
        ["High-volume recruiting experience", "contributing to 1,000+ ML Gen hires"],
        ["Engineering recruiting", "AI and ML Software Engineering hiring"],
        ["Team management and leadership", "Managed a fully-remote team of 19 individuals"],

        // Should be MEDIUM similarity (related)
        ["DEI initiatives", "increase in underrepresented candidates by 85% globally"],
        ["Performance management", "introducing the company's inaugural performance review system"],

        // Should be LOW similarity (unrelated)
        ["Python programming", "contributing to 1,000+ ML Gen hires"],
        ["Machine learning", "Managed a team of 10"],
    ];

    for (const [a, b] of pairs) {
        const embA = await createEmbedding(a);
        const embB = await createEmbedding(b);
        const sim = cosineSimilarity(embA, embB);

        console.log(`${(sim * 100).toFixed(1)}% similarity:`);
        console.log(`  A: "${a}"`);
        console.log(`  B: "${b}"`);
        console.log('');
    }
}

main();
