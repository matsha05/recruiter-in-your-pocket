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
// RIYP_SAMPLE_NAME picks another fictional resume in tests/fixtures/sample (the samples by situation, Nov 11,
// 2026: lib/reports/sample-reports.ts); without it this is Jordan's.
const SAMPLE = (process.env.RIYP_SAMPLE_NAME || "jordan-miller").replace(/[^a-z0-9-]/giu, "");
const RESUME_PATH = path.join(WEB_ROOT, `tests/fixtures/sample/${SAMPLE}-resume.txt`);
const OUTPUT_PATH = path.join(WEB_ROOT, `tests/fixtures/sample/${SAMPLE}-report.generated.json`);

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
// The route's validator pulls in server-only modules; outside Next the marker is a no-op, as in the test runner.
type Loader = { _load: (request: string, ...rest: unknown[]) => unknown };
const loader = Module as unknown as Loader;
const originalLoad = loader._load;
loader._load = function loadModule(this: unknown, request: string, ...rest: unknown[]) {
    if (request === "server-only") return {};
    return originalLoad.call(this, request, ...rest);
};

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

async function main() {
    if (!process.env.OPENAI_API_KEY) throw new Error("Set OPENAI_API_KEY. This script makes a paid provider call.");

    const { runJson } = await import("../lib/llm/orchestrator");
    const { buildResumeRepairMessages, isRepairableResumeResponseError } = await import("../lib/llm/reportRepair");
    const { buildWorklistRepairMessages } = await import("../lib/llm/worklist-repair");
    const { buildResumeProviderMessages } = await import("../lib/llm/resume-provider-messages");
    const { resolveOpenAIModel, resolveResumeRepairReasoningEffort } = await import("../lib/llm/model-config");
    const { loadPromptForMode } = await import("../lib/backend/prompts");
    const { ensureLayoutAndContentFields } = await import("../lib/backend/validation");
    const { validateResumePayload } = await import("../lib/llm/validateResumeStreamOutput");
    const { isWorklistReportEnabled, resumePromptVersion, resumeSchemaVersion } = await import("../lib/reports/report-shape");
    const { resolveEffectiveJobDescription } = await import("../lib/security/effectiveJobDescription");
    // The worklist prompt reads dates against today, as the route sends them.
    const today = process.env.RIYP_SAMPLE_TODAY || new Date().toISOString().slice(0, 10);

    const mode = "resume" as const;
    const text = await readFile(RESUME_PATH, "utf8");
    const model = resolveOpenAIModel(mode);
    const systemPrompt = await loadPromptForMode(mode);
    const effectiveJobDescription = resolveEffectiveJobDescription("");
    const { messages, sanitization } = buildResumeProviderMessages({ mode, systemPrompt, text, effectiveJobDescription, today });
    const resumeText = sanitization.sanitizedText;
    const ctx = { request_id: `sample-report-${Date.now()}`, route: "scripts/generate-sample-report" };

    console.log(`Generating with ${model} (one paid call, two if the repair runs)...`);
    const initial = await runJson<unknown>({
        ctx, task: "resume_feedback", mode, model,
        prompt_version: resumePromptVersion(), schema_version: resumeSchemaVersion(), messages,
    });
    const telemetry = [initial.telemetry];

    let payload: unknown;
    let repaired = false;
    try {
        payload = ensureLayoutAndContentFields(validateResumePayload(initial.parsed, resumeText, effectiveJobDescription.validationOptions));
    } catch (error) {
        if (!isRepairableResumeResponseError(error)) throw error;
        console.log(`Validation failed (${(error as Error).message}); running the production repair pass...`);
        const repair = await runJson<unknown>({
            ctx, task: "resume_feedback", mode, model,
            prompt_version: `${resumePromptVersion()}_repair`,
            reasoning_effort: resolveResumeRepairReasoningEffort(model),
            schema_version: resumeSchemaVersion(),
            messages: isWorklistReportEnabled()
                ? buildWorklistRepairMessages(messages, initial.raw, error as Error)
                : buildResumeRepairMessages(messages, initial.raw, error as Error),
        });
        telemetry.push(repair.telemetry);
        payload = ensureLayoutAndContentFields(validateResumePayload(repair.parsed, resumeText, effectiveJobDescription.validationOptions));
        repaired = true;
    }

    await writeFile(OUTPUT_PATH, `${JSON.stringify({
        generated_at: new Date().toISOString(),
        model,
        prompt_sha256: sha256(systemPrompt),
        prompt_version: resumePromptVersion(),
        today,
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
