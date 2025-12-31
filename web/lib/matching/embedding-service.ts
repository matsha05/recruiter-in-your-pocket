/**
 * OpenAI Embedding Service
 * 
 * Uses direct fetch to OpenAI API for embeddings.
 * Falls back gracefully if API key not available.
 */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export interface EmbeddingResult {
    embedding: number[];
    model: string;
}

export async function createEmbedding(text: string): Promise<EmbeddingResult | null> {
    if (!OPENAI_API_KEY) {
        console.warn("[Embedding] No OPENAI_API_KEY, skipping embedding");
        return null;
    }

    try {
        const response = await fetch("https://api.openai.com/v1/embeddings", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENAI_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "text-embedding-3-small",
                input: text.slice(0, 8000), // Limit input
            }),
        });

        if (!response.ok) {
            console.error("[Embedding] API error:", response.status);
            return null;
        }

        const data = await response.json();
        return {
            embedding: data.data[0].embedding,
            model: data.model,
        };
    } catch (error) {
        console.error("[Embedding] Fetch error:", error);
        return null;
    }
}
