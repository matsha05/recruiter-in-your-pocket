#!/usr/bin/env node
/**
 * Runs the resume report on synthetic resume-and-posting pairs from docs/audits/2026-11-first-read/resumes,
 * through the same path as the route (the production prompt and model, provider messages, the worklist
 * validator with grounding, one repair pass), to read what the posting's "lead" and "trim" lists say.
 * Paid: one provider call per case, two if the repair runs.
 *
 *   OPENAI_API_KEY=... node scripts/run-ts-script.cjs scripts/run-posting-reads.ts <output-dir> [case-filter]
 *
 * Synthetic inputs only. Nothing here is a launch gate.
 */
import Module from "node:module";
import { readFileSync, mkdirSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const WEB_ROOT = path.resolve(__dirname, "..");
const INPUTS = path.resolve(WEB_ROOT, "../docs/audits/2026-11-first-read/resumes");
// A two-page resume with lines no payments posting asks about, so "trim" has something to find.
const LONG = "../../2026-11-posting-tailoring/resumes/long_backend_two_pages.txt";
const CASES: Array<{ id: string; resume: string; posting: string | null }> = [
    { id: "backend-senior-backend-posting", resume: "fr01_backend_ic_senior.txt", posting: "posting_senior_backend.txt" },
    { id: "backend-manager-posting", resume: "fr01_backend_ic_senior.txt", posting: "posting_engineering_manager.txt" },
    { id: "marketing-hubspot-posting", resume: "fr02_marketing_coordinator_skills.txt", posting: "posting_marketing_hubspot.txt" },
    { id: "backend-no-posting", resume: "fr01_backend_ic_senior.txt", posting: null },
    { id: "long-backend-senior-backend-posting", resume: LONG, posting: "posting_senior_backend.txt" },
];

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

async function main() {
    const outputDir = process.argv[2];
    if (!outputDir) throw new Error("Usage: run-posting-reads.ts <output-dir>");
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
    const { resolveEffectiveJobDescription } = await import("../lib/security/effectiveJobDescription");

    const today = process.env.RIYP_SAMPLE_TODAY || new Date().toISOString().slice(0, 10);
    const mode = "resume" as const;
    const model = resolveOpenAIModel(mode);
    const systemPrompt = await loadPromptForMode(mode);

    const filter = process.argv[3] || "";
    for (const item of CASES.filter((entry) => entry.id.includes(filter))) {
        const text = readFileSync(path.join(INPUTS, item.resume), "utf8");
        const posting = item.posting ? readFileSync(path.join(INPUTS, item.posting), "utf8") : "";
        const effectiveJobDescription = resolveEffectiveJobDescription(posting);
        const { messages, sanitization } = buildResumeProviderMessages({ mode, systemPrompt, text, effectiveJobDescription, today });
        const resumeText = sanitization.sanitizedText;
        const options = { ...effectiveJobDescription.validationOptions, forceGrounding: true };
        const ctx = { request_id: `posting-read-${item.id}-${Date.now()}`, route: "scripts/run-posting-reads" };
        const startedAt = Date.now();
        const initial = await runJson<unknown>({ ctx, task: "resume_feedback", mode, model, prompt_version: "resume_v3", schema_version: "report_v3", messages });
        const draftPosting = (initial.parsed as { fit?: { posting?: { lead?: unknown[]; trim?: unknown[] } } })?.fit?.posting;
        let payload: unknown;
        let repaired = false;
        let firstError: string | null = null;
        try {
            payload = ensureLayoutAndContentFields(validateWorklistPayload(initial.parsed, resumeText, options));
        } catch (error) {
            firstError = (error as Error).message;
            if (!isRepairableResumeResponseError(error)) throw error;
            const repair = await runJson<unknown>({
                ctx, task: "resume_feedback", mode, model, prompt_version: "resume_v3_repair",
                reasoning_effort: resolveResumeRepairReasoningEffort(model), schema_version: "report_v3",
                messages: buildWorklistRepairMessages(messages, initial.raw, error as Error),
            });
            payload = ensureLayoutAndContentFields(validateWorklistPayload(repair.parsed, resumeText, options));
            repaired = true;
        }
        const report = payload as { score: number; cards: unknown[]; fit: { posting: { lead?: unknown[]; trim?: unknown[] } } };
        await writeFile(path.join(outputDir, `${item.id}.json`), `${JSON.stringify({ id: item.id, resume: item.resume, posting: item.posting, model, today, repaired, firstError, drafted: { lead: draftPosting?.lead?.length ?? 0, trim: draftPosting?.trim?.length ?? 0 }, usage: { tokens_in: initial.telemetry.tokens_in, tokens_out: initial.telemetry.tokens_out, cost_estimate_usd: initial.telemetry.cost_estimate_usd }, report }, null, 2)}\n`);
        console.log(`${item.id}: score ${report.score}, ${report.cards.length} cards, lead ${report.fit.posting.lead?.length ?? 0} (drafted ${draftPosting?.lead?.length ?? 0}), trim ${report.fit.posting.trim?.length ?? 0} (drafted ${draftPosting?.trim?.length ?? 0}), ${Math.round((Date.now() - startedAt) / 1000)} s, $${initial.telemetry.cost_estimate_usd ?? "?"} (${initial.telemetry.tokens_in} in, ${initial.telemetry.tokens_out} out)${repaired ? `, repaired (${firstError})` : ""}`);
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
