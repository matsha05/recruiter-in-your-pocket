import { logError, logInfo } from "@/lib/observability/logger";
import { estimateCostUsd } from "./cost";
import type { LlmRunContext, LlmTask, LlmTelemetry } from "./types";
import { callOpenAIChat, callOpenAIChatStreamingWithUsage, extractJsonFromText } from "@/lib/backend/openai";

type Mode = "resume" | "resume_ideas" | "case_resume" | "case_interview" | "case_negotiation" | "linkedin";

type Messages = Array<{ role: "system" | "user" | "assistant"; content: string }>;

function outcomeFromError(err: any): LlmTelemetry["outcome"] {
  const code = String(err?.code || "");
  if (code === "OPENAI_TIMEOUT") return "timeout";
  if (code === "OPENAI_NETWORK_ERROR") return "network_error";
  if (code === "OPENAI_HTTP_ERROR") {
    const status = Number(err?.httpStatus || err?.status || 0);
    if (status === 429) return "rate_limited";
    return "provider_error";
  }
  if (code.startsWith("OPENAI_RESPONSE_")) return "schema_invalid";
  return "internal_error";
}

function getUsageFromResponse(data: any): { prompt_tokens: number; completion_tokens: number } | null {
  const usage = data?.usage;
  const prompt = Number(usage?.prompt_tokens);
  const completion = Number(usage?.completion_tokens);
  if (!Number.isFinite(prompt) || !Number.isFinite(completion)) return null;
  return { prompt_tokens: prompt, completion_tokens: completion };
}

export async function runJson<T>({
  ctx,
  task,
  mode,
  model,
  prompt_version,
  schema_version,
  messages
}: {
  ctx: LlmRunContext;
  task: LlmTask;
  mode: Mode;
  model: string;
  prompt_version: string;
  schema_version: string;
  messages: Messages;
}): Promise<{ parsed: T; raw: string; telemetry: LlmTelemetry }> {
  const startedAt = Date.now();
  logInfo({
    msg: "llm.run.started",
    request_id: ctx.request_id,
    route: ctx.route,
    user_id: ctx.user_id,
    llm: { task, model, prompt_version, schema_version }
  });

  try {
    const data = await callOpenAIChat(messages, mode);
    const raw = data?.choices?.[0]?.message?.content;
    const parsed = extractJsonFromText(raw) as T;

    const usage = getUsageFromResponse(data);
    const latency_ms = Date.now() - startedAt;
    const tokens_in = usage?.prompt_tokens || 0;
    const tokens_out = usage?.completion_tokens || 0;
    const cost_estimate_usd = estimateCostUsd(model, usage);

    const telemetry: LlmTelemetry = {
      request_id: ctx.request_id,
      user_id: ctx.user_id,
      task,
      model,
      tokens_in,
      tokens_out,
      latency_ms,
      cost_estimate_usd,
      outcome: "success"
    };

    logInfo({
      msg: "llm.run.completed",
      request_id: ctx.request_id,
      route: ctx.route,
      user_id: ctx.user_id,
      outcome: "success",
      latency_ms,
      llm: {
        task,
        model,
        prompt_version,
        schema_version,
        tokens_in,
        tokens_out,
        cost_estimate_usd
      }
    });

    return { parsed, raw: String(raw || ""), telemetry };
  } catch (err: any) {
    const latency_ms = Date.now() - startedAt;
    const outcome = outcomeFromError(err);
    logError({
      msg: "llm.run.failed",
      request_id: ctx.request_id,
      route: ctx.route,
      user_id: ctx.user_id,
      outcome,
      latency_ms,
      llm: { task, model, prompt_version, schema_version },
      err: { name: err?.name || "Error", message: err?.message || "LLM call failed", code: err?.code, stack: err?.stack }
    });
    throw err;
  }
}

export async function* streamJson({
  ctx,
  task,
  mode,
  model,
  prompt_version,
  schema_version,
  messages
}: {
  ctx: LlmRunContext;
  task: LlmTask;
  mode: Mode;
  model: string;
  prompt_version: string;
  schema_version: string;
  messages: Messages;
}): AsyncGenerator<{ type: "chunk"; content: string } | { type: "done"; telemetry: LlmTelemetry }, void, void> {
  const startedAt = Date.now();
  logInfo({
    msg: "llm.run.started",
    request_id: ctx.request_id,
    route: ctx.route,
    user_id: ctx.user_id,
    llm: { task, model, prompt_version, schema_version }
  });

  let usage: { prompt_tokens: number; completion_tokens: number } | null = null;

  try {
    const { stream, usagePromise } = callOpenAIChatStreamingWithUsage(messages, mode);
    for await (const chunk of stream) {
      yield { type: "chunk", content: chunk };
    }
    usage = await usagePromise;

    const latency_ms = Date.now() - startedAt;
    const tokens_in = usage?.prompt_tokens || 0;
    const tokens_out = usage?.completion_tokens || 0;
    const cost_estimate_usd = estimateCostUsd(model, usage);

    const telemetry: LlmTelemetry = {
      request_id: ctx.request_id,
      user_id: ctx.user_id,
      task,
      model,
      tokens_in,
      tokens_out,
      latency_ms,
      cost_estimate_usd,
      outcome: "success"
    };

    logInfo({
      msg: "llm.run.completed",
      request_id: ctx.request_id,
      route: ctx.route,
      user_id: ctx.user_id,
      outcome: "success",
      latency_ms,
      llm: { task, model, prompt_version, schema_version, tokens_in, tokens_out, cost_estimate_usd }
    });

    yield { type: "done", telemetry };
  } catch (err: any) {
    const latency_ms = Date.now() - startedAt;
    const outcome = outcomeFromError(err);
    logError({
      msg: "llm.run.failed",
      request_id: ctx.request_id,
      route: ctx.route,
      user_id: ctx.user_id,
      outcome,
      latency_ms,
      llm: { task, model, prompt_version, schema_version },
      err: { name: err?.name || "Error", message: err?.message || "LLM stream failed", code: err?.code, stack: err?.stack }
    });
    throw err;
  }
}

