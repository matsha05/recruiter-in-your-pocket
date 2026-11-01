#!/usr/bin/env node
/**
 * Generates the public sample report from Jordan's fictional resume, through the same path
 * as /api/resume-feedback: the production prompt and model, the provider messages, response
 * validation, and the one repair pass. Paid: one provider call, two if the repair runs.
 *
 *   OPENAI_API_KEY=... node scripts/run-ts-script.cjs scripts/generate-sample-report.ts
 *
 * Review the output before copying `payload` into public/sample-report.json. The report
 * integrity pass runs at render time, so the payload is stored exactly as generated.
 */
import Module from "node:module";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const WEB_ROOT = path.resolve(__dirname, "..");
const RESUME_PATH = path.join(WEB_ROOT, "tests/fixtures/sample/jordan-miller-resume.txt");
const OUTPUT_PATH = path.join(WEB_ROOT, "tests/fixtures/sample/jordan-miller-report.generated.json");

// run-ts-script transpiles without path mapping or loaders; the production modules import
// "@/..." and bundle their prompts as .txt, so resolve both here before loading them.
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

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

async function main() {
    if (!process.env.OPENAI_API_KEY) throw new Error("Set OPENAI_API_KEY. This script makes a paid provider call.");

    const { runJson } = await import("../lib/llm/orchestrator");
    const { buildResumeRepairMessages, isRepairableResumeResponseError } = await import("../lib/llm/reportRepair");
    const { buildResumeProviderMessages } = await import("../lib/llm/resume-provider-messages");
    const { resolveOpenAIModel, resolveResumeRepairReasoningEffort } = await import("../lib/llm/model-config");
    const { loadPromptForMode } = await import("../lib/backend/prompts");
    const { ensureLayoutAndContentFields, validateResumeModelPayload } = await import("../lib/backend/validation");
    const { resolveEffectiveJobDescription } = await import("../lib/security/effectiveJobDescription");

    const mode = "resume" as const;
    const text = await readFile(RESUME_PATH, "utf8");
    const model = resolveOpenAIModel(mode);
    const systemPrompt = await loadPromptForMode(mode);
    const effectiveJobDescription = resolveEffectiveJobDescription("");
    const { messages, sanitization } = buildResumeProviderMessages({ mode, systemPrompt, text, effectiveJobDescription });
    const resumeText = sanitization.sanitizedText;
    const ctx = { request_id: `sample-report-${Date.now()}`, route: "scripts/generate-sample-report" };

    console.log(`Generating with ${model} (one paid call, two if the repair runs)...`);
    const initial = await runJson<unknown>({
        ctx, task: "resume_feedback", mode, model,
        prompt_version: "resume_v2", schema_version: "report_v1", messages,
    });
    const telemetry = [initial.telemetry];

    let payload: unknown;
    let repaired = false;
    try {
        payload = ensureLayoutAndContentFields(validateResumeModelPayload(initial.parsed, resumeText, effectiveJobDescription.validationOptions));
    } catch (error) {
        if (!isRepairableResumeResponseError(error)) throw error;
        console.log(`Validation failed (${(error as Error).message}); running the production repair pass...`);
        const repair = await runJson<unknown>({
            ctx, task: "resume_feedback", mode, model,
            prompt_version: "resume_v2_repair",
            reasoning_effort: resolveResumeRepairReasoningEffort(model),
            schema_version: "report_v1",
            messages: buildResumeRepairMessages(messages, initial.raw, error as Error),
        });
        telemetry.push(repair.telemetry);
        payload = ensureLayoutAndContentFields(validateResumeModelPayload(repair.parsed, resumeText, effectiveJobDescription.validationOptions));
        repaired = true;
    }

    await writeFile(OUTPUT_PATH, `${JSON.stringify({
        generated_at: new Date().toISOString(),
        model,
        prompt_sha256: sha256(systemPrompt),
        resume_sha256: sha256(text),
        repaired,
        telemetry,
        payload,
    }, null, 2)}\n`);
    console.log(`Wrote ${path.relative(WEB_ROOT, OUTPUT_PATH)}${repaired ? " (after repair)" : ""}.`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
