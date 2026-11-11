#!/usr/bin/env node
/**
 * Runs the LinkedIn profile review on the made-up exports in tests/fixtures/linkedin, through the same path as
 * the route: the production prompt (prompts/linkedin_v3.txt) and model, the provider messages, the worklist
 * validator with grounding, and the one repair pass. Paid: one provider call per profile, two if the repair runs.
 *
 *   OPENAI_API_KEY=... node scripts/run-ts-script.cjs scripts/run-linkedin-reviews.ts <output-dir> [name-filter]
 *
 * Synthetic profiles only. Read the output before changing the prompt; nothing here is a launch gate.
 */
import Module from "node:module";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, mkdirSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const WEB_ROOT = path.resolve(__dirname, "..");
// RIYP_LINKEDIN_INPUTS points the run at another folder of export text, such as a real export kept outside the repo.
const FIXTURES = process.env.RIYP_LINKEDIN_INPUTS || path.join(WEB_ROOT, "tests/fixtures/linkedin");

// run-ts-script transpiles without path mapping or loaders; resolve "@/..." and .txt prompts as the sample script does.
type Resolver = { _resolveFilename: (request: string, ...rest: unknown[]) => string };
const resolver = Module as unknown as Resolver;
const resolveFilename = resolver._resolveFilename;
resolver._resolveFilename = function resolveAlias(this: unknown, request: string, ...rest: unknown[]) {
    const target = request.startsWith("@/") ? path.join(WEB_ROOT, request.slice(2)) : request;
    return resolveFilename.call(this, target, ...rest);
};
(require as NodeJS.Require).extensions[".txt"] = (module, filename) => {
    module.exports = readFileSync(filename, "utf8");
};
type Loader = { _load: (request: string, ...rest: unknown[]) => unknown };
const loader = Module as unknown as Loader;
const originalLoad = loader._load;
loader._load = function loadModule(this: unknown, request: string, ...rest: unknown[]) {
    if (request === "server-only") return {};
    return originalLoad.call(this, request, ...rest);
};

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

async function main() {
    const outputDir = process.argv[2];
    const filter = process.argv[3] || "";
    if (!outputDir) throw new Error("Usage: run-linkedin-reviews.ts <output-dir> [name-filter]");
    if (!process.env.OPENAI_API_KEY) throw new Error("Set OPENAI_API_KEY. This script makes paid provider calls.");
    mkdirSync(outputDir, { recursive: true });

    const { runJson } = await import("../lib/llm/orchestrator");
    const { isRepairableResumeResponseError } = await import("../lib/llm/reportRepair");
    const { buildWorklistRepairMessages } = await import("../lib/llm/worklist-repair");
    const { buildResumeProviderMessages } = await import("../lib/llm/resume-provider-messages");
    const { resolveOpenAIModel, resolveResumeRepairReasoningEffort } = await import("../lib/llm/model-config");
    const { loadPromptForMode } = await import("../lib/backend/prompts");
    const { ensureLayoutAndContentFields } = await import("../lib/backend/validation");
    const { validateWorklistPayload } = await import("../lib/llm/worklist-validator");
    const { looksLikeLinkedInExport, withReportDocument } = await import("../lib/reports/report-document");
    const { resolveEffectiveJobDescription } = await import("../lib/security/effectiveJobDescription");

    const today = process.env.RIYP_SAMPLE_TODAY || new Date().toISOString().slice(0, 10);
    const mode = "resume" as const;
    const model = resolveOpenAIModel(mode);
    const systemPrompt = await loadPromptForMode("linkedin_v3");
    const none = resolveEffectiveJobDescription("");
    const files = readdirSync(FIXTURES).filter((name) => name.endsWith(".txt") && name.includes(filter)).sort();
    console.log(`Running ${files.length} profile(s) with ${model}; prompt ${sha256(systemPrompt).slice(0, 12)}.`);

    for (const file of files) {
        const text = readFileSync(path.join(FIXTURES, file), "utf8");
        if (!looksLikeLinkedInExport(text)) throw new Error(`${file} doesn't pass the export check the route applies.`);
        const { messages, sanitization } = buildResumeProviderMessages({ mode, systemPrompt, text, effectiveJobDescription: none, document: "linkedin", today });
        const profileText = sanitization.sanitizedText;
        const ctx = { request_id: `linkedin-review-${file}-${Date.now()}`, route: "scripts/run-linkedin-reviews" };
        const startedAt = Date.now();
        const initial = await runJson<unknown>({ ctx, task: "resume_feedback", mode, model, prompt_version: "linkedin_v3", schema_version: "report_v3", messages });
        let payload: unknown;
        let repaired = false;
        let firstError: string | null = null;
        try {
            payload = ensureLayoutAndContentFields(validateWorklistPayload(initial.parsed, profileText, { forceGrounding: true }));
        } catch (error) {
            firstError = (error as Error).message;
            if (!isRepairableResumeResponseError(error)) throw error;
            const repair = await runJson<unknown>({
                ctx, task: "resume_feedback", mode, model, prompt_version: "linkedin_v3_repair",
                reasoning_effort: resolveResumeRepairReasoningEffort(model), schema_version: "report_v3",
                messages: buildWorklistRepairMessages(messages, initial.raw, error as Error),
            });
            try {
                payload = ensureLayoutAndContentFields(validateWorklistPayload(repair.parsed, profileText, { forceGrounding: true }));
                repaired = true;
            } catch (repairError) {
                await writeFile(path.join(outputDir, file.replace(/\.txt$/u, ".failed.json")), `${JSON.stringify({ file, firstError, repairError: (repairError as Error).message, issues: (repairError as { details?: unknown }).details ?? null, initial: initial.parsed, repair: repair.parsed }, null, 2)}\n`);
                console.log(`${file}: FAILED after repair. First: ${firstError}. Then: ${(repairError as Error).message}`);
                continue;
            }
        }
        const report = withReportDocument(payload as object, "linkedin");
        await writeFile(path.join(outputDir, file.replace(/\.txt$/u, ".json")), `${JSON.stringify({ file, model, today, repaired, firstError, seconds: Math.round((Date.now() - startedAt) / 1000), report }, null, 2)}\n`);
        const summary = report as { score?: number; cards?: unknown[] };
        console.log(`${file}: score ${summary.score}, ${summary.cards?.length ?? 0} cards, ${Math.round((Date.now() - startedAt) / 1000)} s${repaired ? `, repaired (${firstError})` : ""}`);
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
