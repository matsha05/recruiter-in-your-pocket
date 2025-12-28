#!/usr/bin/env npx tsx
/**
 * PromptOps Eval Harness - CLI Entry Point
 * 
 * Usage:
 *   npm run eval
 *   npm run eval:smoke
 *   npm run eval:golden -- --baseline tests/fixtures/results/baseline_v1.json
 *   npm run eval:bulk
 *   npm run eval:dry-run
 */

// Load environment variables from .env.local
import { config } from "dotenv";
config({ path: ".env.local" });

import { runEval } from "../lib/evals/runner";
import type { EvalOptions } from "../lib/evals/types";

// ============================================
// CLI ARGUMENT PARSING
// ============================================

function parseArgs(): EvalOptions {
    const args = process.argv.slice(2);

    const options: EvalOptions = {
        tier: "golden",
        budgetUsd: 5.0,
        maxCalls: 100,
        concurrency: 3,
        dryRun: false
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        const next = args[i + 1];

        switch (arg) {
            case "--tier":
                if (next && ["smoke", "golden", "bulk"].includes(next)) {
                    options.tier = next as "smoke" | "golden" | "bulk";
                    i++;
                }
                break;

            case "--baseline":
                if (next) {
                    options.baseline = next;
                    i++;
                }
                break;

            case "--budget-usd":
                if (next) {
                    options.budgetUsd = parseFloat(next);
                    i++;
                }
                break;

            case "--max-calls":
                if (next) {
                    options.maxCalls = parseInt(next);
                    i++;
                }
                break;

            case "--concurrency":
                if (next) {
                    options.concurrency = parseInt(next);
                    i++;
                }
                break;

            case "--dry-run":
                options.dryRun = true;
                break;

            case "--prompt-version":
                if (next) {
                    options.promptVersion = next;
                    i++;
                }
                break;

            case "--filter":
                if (next) {
                    options.fixtureFilter = next;
                    i++;
                }
                break;

            case "--with-judge":
                options.withJudge = true;
                break;

            case "--help":
            case "-h":
                printHelp();
                process.exit(0);
        }
    }

    return options;
}

function printHelp(): void {
    console.log(`
PromptOps Eval Harness

Usage:
  npx tsx scripts/run-eval.ts [options]

Options:
  --tier <tier>           smoke | golden | bulk (default: golden)
  --baseline <path>       Path to baseline JSON for regression comparison
  --budget-usd <amount>   Hard cost cap in USD (default: 5.00)
  --max-calls <n>         Maximum API calls (default: 100)
  --concurrency <n>       Parallel requests (default: 3)
  --dry-run               Parse fixtures only, no API calls
  --prompt-version <v>    Override prompt version hash
  --filter <term>         Filter fixtures by ID or tag
  --help, -h              Show this help

Examples:
  npm run eval:smoke
  npm run eval:golden -- --baseline tests/fixtures/results/baseline_v1.json
  npm run eval:bulk -- --budget-usd 10
  npm run eval -- --dry-run
`);
}

// ============================================
// MAIN
// ============================================

async function main(): Promise<void> {
    const options = parseArgs();

    try {
        const result = await runEval(options);

        // Exit with error code if any failures
        if (result.summary.failed > 0) {
            process.exit(1);
        }
    } catch (err: any) {
        console.error(`\n❌ Error: ${err.message}`);
        process.exit(1);
    }
}

main();
