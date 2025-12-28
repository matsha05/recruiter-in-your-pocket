#!/usr/bin/env npx tsx
/**
 * CLI for generating synthetic resume corpus
 * 
 * Usage:
 *   npm run eval:generate -- --count 100
 *   npm run eval:generate -- --count 50 --distribution edge_heavy
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { generateCorpus, CorpusConfig } from "../lib/evals/generator";
import * as path from "path";

async function main() {
    const args = process.argv.slice(2);

    // Parse arguments
    let count = 100;
    let distribution: "balanced" | "realistic" | "edge_heavy" = "realistic";

    for (let i = 0; i < args.length; i++) {
        if (args[i] === "--count" && args[i + 1]) {
            count = parseInt(args[i + 1], 10);
            i++;
        } else if (args[i] === "--distribution" && args[i + 1]) {
            distribution = args[i + 1] as any;
            i++;
        } else if (args[i] === "--help" || args[i] === "-h") {
            console.log(`
Synthetic Resume Generator

Usage:
  npm run eval:generate -- [options]

Options:
  --count N          Number of resumes to generate (default: 100)
  --distribution D   Distribution type: balanced, realistic, edge_heavy (default: realistic)
  --help             Show this help message

Examples:
  npm run eval:generate -- --count 50
  npm run eval:generate -- --count 100 --distribution edge_heavy
      `);
            process.exit(0);
        }
    }

    if (!process.env.OPENAI_API_KEY) {
        console.error("❌ OPENAI_API_KEY not found in environment");
        process.exit(1);
    }

    const config: CorpusConfig = {
        count,
        distribution,
        outputDir: path.resolve(process.cwd(), "../tests/resumes/synthetic"),
    };

    const startTime = Date.now();

    try {
        await generateCorpus(config);

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`⏱️  Completed in ${elapsed}s`);
    } catch (err: any) {
        console.error("❌ Generation failed:", err.message);
        process.exit(1);
    }
}

main();
