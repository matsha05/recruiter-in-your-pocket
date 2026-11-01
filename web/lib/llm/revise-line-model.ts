import "server-only";

import { createHash } from "node:crypto";
import reviseLinePrompt from "../../prompts/revise_line_v1.txt";
import { createOpenAIAbortScope, normalizeOpenAITransportError } from "../backend/openai-transport";
import { getProductionChatCompletionTuning, resolveOpenAIModel, resolveReasoningEffortForMode } from "./model-config";

/**
 * The guarded polish of a revised line (prompts/revise_line_v1.txt). The model only proposes; the
 * deterministic check in lib/reports/revised-line-polish.ts decides, and every failure falls back to
 * the candidate's literal line.
 */
export const REVISE_LINE_PROMPT = reviseLinePrompt.trim();
// Recorded with every call and eval run, as the resume prompt's hash is.
export const REVISE_LINE_PROMPT_SHA256 = createHash("sha256").update(reviseLinePrompt, "utf8").digest("hex");
export const REVISE_LINE_PROMPT_VERSION = `revise_line_v1:${REVISE_LINE_PROMPT_SHA256.slice(0, 8)}`;

// Short: the literal line is already on screen, so a slow polish is simply skipped.
export const REVISE_LINE_TIMEOUT_MS = 10_000;

const RESPONSE_FORMAT = {
  type: "json_schema",
  json_schema: {
    name: "revised_line",
    strict: true,
    schema: {
      type: "object",
      properties: { line: { type: "string" } },
      required: ["line"],
      additionalProperties: false,
    },
  },
} as const;

export function reviseLineMessages(line: string, answers: readonly string[]) {
  return [
    { role: "system" as const, content: REVISE_LINE_PROMPT },
    {
      role: "user" as const,
      content: `Original line:\n${line}\n\nAnswers:\n${answers.map((answer, index) => `${index + 1}. ${answer}`).join("\n")}`,
    },
  ];
}

/** USE_MOCK_OPENAI: the literal line joined with commas, which the guard passes like a real polish. */
function mockPolish(line: string, answers: readonly string[]) {
  return `${line.trim().replace(/[.;,:\s]+$/u, "")}, ${answers.join(", ")}.`;
}

export interface PolishedLineResult {
  line: string;
  model: string;
  usage?: { prompt_tokens?: number; completion_tokens?: number };
}

export async function requestPolishedLine(input: {
  line: string;
  answers: readonly string[];
  signal?: AbortSignal;
  timeoutMs?: number;
  model?: string;
  fetchImpl?: typeof fetch;
}): Promise<PolishedLineResult> {
  const model = resolveOpenAIModel("revise_line", input.model);
  if (["1", "true"].includes(String(process.env.USE_MOCK_OPENAI || "").trim().toLowerCase())) {
    return { line: mockPolish(input.line, input.answers), model: "mock" };
  }
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw Object.assign(new Error("OPENAI_API_KEY is not set"), { code: "OPENAI_API_KEY_MISSING" });

  const scope = createOpenAIAbortScope(input.signal, input.timeoutMs ?? REVISE_LINE_TIMEOUT_MS);
  let response: Response;
  let body: any;
  try {
    response = await (input.fetchImpl || fetch)("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        ...getProductionChatCompletionTuning(model, {
          temperature: 0,
          reasoningEffort: resolveReasoningEffortForMode("revise_line", model),
        }),
        response_format: RESPONSE_FORMAT,
        messages: reviseLineMessages(input.line, input.answers),
      }),
      signal: scope.signal,
    });
    body = await response.json().catch(() => null);
  } catch (error) {
    throw normalizeOpenAITransportError(error, scope, input.signal);
  } finally {
    scope.dispose();
  }
  if (!response.ok) throw Object.assign(new Error(`OpenAI returned ${response.status}`), { code: "OPENAI_HTTP_ERROR" });
  const choice = body?.choices?.[0];
  if (choice?.message?.refusal || choice?.finish_reason !== "stop") {
    throw Object.assign(new Error("No complete answer"), { code: "OPENAI_RESPONSE_INCOMPLETE" });
  }
  let parsed: { line?: unknown } | null = null;
  try {
    parsed = JSON.parse(String(choice.message.content || "{}"));
  } catch {
    parsed = null;
  }
  if (typeof parsed?.line !== "string") throw Object.assign(new Error("No line"), { code: "OPENAI_RESPONSE_NOT_JSON" });
  return { line: parsed.line, model, usage: body?.usage };
}
