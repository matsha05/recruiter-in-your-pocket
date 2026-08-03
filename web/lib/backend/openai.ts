import { getOpenAIResponseFormat } from "@/lib/llm/response-format";
import {
  getProductionChatCompletionTuning,
  increaseReasoningEffort,
  resolveOpenAIModel,
  resolveProductionOpenAIRetryLimit,
  resolveReasoningEffortForMode,
  type ReasoningEffort,
} from "@/lib/llm/model-config";
import { normalizeTokenUsage, type TokenUsage } from "@/lib/llm/cost";
import { createAppError, type AppError } from "./errors";
import { logInfo } from "@/lib/observability/logger";
import { throwIfGenerationCanceled } from "@/lib/billing/generation-cancellation";
import { createOpenAIAbortScope, normalizeOpenAITransportError } from "./openai-transport";

export { createAppError } from "./errors";
export type { AppError } from "./errors";

type Mode = "resume" | "resume_ideas" | "case_resume" | "case_interview" | "case_negotiation" | "linkedin";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number,
  externalSignal?: AbortSignal,
) {
  const scope = createOpenAIAbortScope(externalSignal, timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: scope.signal });
    const textBody = await response.text();
    return { response, textBody };
  } catch (err: any) {
    throw normalizeOpenAITransportError(err, scope, externalSignal);
  } finally {
    scope.dispose();
  }
}

export function extractJsonFromText(text: unknown) {
  if (typeof text !== "string") {
    throw createAppError("OPENAI_NO_CONTENT", "The model did not send back any usable content.", 502);
  }

  let trimmed = text.trim();

  // Handle markdown code fences
  if (trimmed.startsWith("```")) {
    const firstNewline = trimmed.indexOf("\n");
    if (firstNewline !== -1) trimmed = trimmed.slice(firstNewline + 1);
    const lastFence = trimmed.lastIndexOf("```");
    if (lastFence !== -1) trimmed = trimmed.slice(0, lastFence);
    trimmed = trimmed.trim();
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    const firstBrace = trimmed.indexOf("{");
    const lastBrace = trimmed.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      throw createAppError("OPENAI_RESPONSE_PARSE_ERROR", "Could not parse model output.", 502);
    }
    const candidate = trimmed.slice(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(candidate);
    } catch {
      throw createAppError("OPENAI_RESPONSE_PARSE_ERROR", "Could not parse model output.", 502);
    }
  }
}

function getMockOpenAIResponse(mode: Mode) {
  if (mode === "resume_ideas") {
    return {
      questions: [
        {
          question: "What was the highest-stakes decision you made, and what changed because of it?",
          archetype: "HIGH STAKES",
          why: "This shows judgment under pressure and what you actually owned."
        },
        {
          question: "Where did you scale a process or system, and what broke before you fixed it?",
          archetype: "SCALING",
          why: "Scaling stories surface real constraints and engineering/ops maturity."
        },
        {
          question: "What quality bar did you raise, and how did you enforce it day to day?",
          archetype: "QUALITY UNDER PRESSURE",
          why: "Recruiters look for repeatable execution, not one-off wins."
        },
        {
          question: "What did you improve that saved time or reduced risk, and what was the before/after?",
          archetype: "IMPROVEMENT",
          why: "Before/after makes impact legible fast."
        },
        {
          question: "What cross-team tension did you resolve, and what tradeoff did you choose?",
          archetype: "CROSS-FUNCTIONAL COMPLEXITY",
          why: "This reveals collaboration skill and decision-making, not just participation."
        }
      ],
      notes: [
        "Answer 1–3 questions in a separate doc so you don’t overwrite what already works.",
        "From each answer, pull scope, the call you made, and the outcome (ideally with a number).",
        "Turn each into one bullet: verb + what you owned + outcome with a number."
      ],
      how_to_use:
        "Use these to surface wins your resume isn’t telling yet. If it would repeat what’s already on the page, skip it."
    };
  }

  return {
    contract_version: "v2",
    score: 86,
    score_label: "Strong",
    score_comment_short: "Clear ownership and real results; a few important wins still lack scale.",
    score_comment_long: "The ownership comes through, and several results are easy to spot. A few important bullets still leave the size of the work unanswered.",
    score_plain: "This is credible work with visible ownership. Add the size of the biggest changes so the best parts carry the weight they deserve.",
    first_impression: "The page shows someone who can take messy work through delivery. We still have to guess how large a few of those assignments were.",
    biggest_gap_example: "\"Improved process across teams\" does not say which teams or what changed, so the result remains impossible to judge.",
    first_impression_takeaway: "Show the scale.",
    summary:
      "There is a capable operator story here, especially in the way you take messy work through delivery. The progression from coordination to ownership is easy to follow. That part works. What the page still does not show is the size of the most important changes, so the best work carries less weight than it should.",
    strengths: [
      "You show ownership instead of vague participation.",
      "Your cross-functional work is easy to identify.",
      "The progression from coordination to execution reads clearly."
    ],
    gaps: [
      "Scope and measurable outcomes are missing in a few key bullets.",
      "The strongest work needs clearer before-and-after context.",
      "Role and product context should appear earlier in the first read."
    ],
    top_fixes: [
      {
        fix: "Add scope numbers to your top 2 bullets.",
        why: "Without scale, recruiters cannot tell how big the work really was.",
        confidence: "high",
        evidence: { excerpt: "Improved process across teams.", section: "Work Experience" },
        impact_level: "high",
        effort: "moderate",
        section_ref: "Work Experience"
      },
      {
        fix: "Turn one process bullet into a before-and-after result.",
        why: "A recruiter can see activity, but not what changed because of your work.",
        confidence: "high",
        evidence: { excerpt: "Led team of 5 engineers", section: "Work Experience" },
        impact_level: "high",
        effort: "quick",
        section_ref: "Work Experience"
      },
      {
        fix: "Name the system, product, or launch context in the opening line.",
        why: "Specific context makes the first read feel credible instead of generic.",
        confidence: "medium",
        evidence: { excerpt: "Software Engineer", section: "Header" },
        impact_level: "medium",
        effort: "quick",
        section_ref: "Header"
      }
    ],
    rewrites: [{ label: "Impact", original: "Improved process across teams.", better: "Led a cross-team process change that sped up delivery and reduced handoff confusion.", enhancement_note: "Add the before-and-after timing so we can see the size of the change." }],
    next_steps: [
      "Add one before/after metric to your top bullet.",
      "Name the scale of the most important cross-functional launch.",
      "Move the clearest outcome into the first third of the page."
    ],
    subscores: { impact: 82, clarity: 84, story: 80, readability: 83 },
    section_review: {
      Summary: { grade: "B", priority: "Medium", working: "Clear identity statement.", missing: "Scope is vague.", fix: "Add 1 scope detail (team/users) in the first line." },
      "Work Experience": { grade: "B", priority: "High", working: "Ownership shows up.", missing: "Scope and impact are thin in places.", fix: "Add one concrete outcome to the top two bullets." },
      Skills: { grade: "N/A", priority: "Low", working: "", missing: "Section not present.", fix: "Add only if it helps your story." },
      Education: { grade: "N/A", priority: "Low", working: "", missing: "Section not present.", fix: "Add only if it helps your story." }
    },
    job_alignment: {
      jd_match_score: 0,
      jd_match_summary: "No job description provided.",
      jd_keywords: { matched: [], missing: [], match_count: 0, total_count: 0 },
      strongly_aligned: ["Ownership", "Execution", "Cross-functional coordination"],
      underplayed: ["Scale context", "Measurable process improvement"],
      missing: ["Named metrics"],
      role_fit: { best_fit_roles: ["Program Manager", "Product Operations Manager", "Launch Operations Lead"], stretch_roles: ["Senior Program Manager"], seniority_read: "Experienced operator", industry_signals: ["B2B SaaS"], company_stage_fit: "Growth to public" },
      positioning_suggestion: "Lead with the biggest system or product you owned, then add one hard metric so scale is obvious."
    },
    ideas: {
      questions: [
        { question: "What part of this work was highest stakes, and what changed because of your call?", archetype: "HIGH STAKES", why: "This shows judgment, not just activity." },
        { question: "Where did scope grow, and what broke before you fixed it?", archetype: "SCALING", why: "Scaling stories make complexity visible fast." },
        { question: "What quality bar did you raise, and how did you keep it from slipping?", archetype: "QUALITY UNDER PRESSURE", why: "This shows repeatable standards, not one-off effort." },
        { question: "What got faster, cheaper, safer, or clearer after your change?", archetype: "IMPROVEMENT", why: "Hiring teams look for visible before-and-after movement." },
        { question: "Which cross-team tension did you resolve, and what tradeoff did you choose?", archetype: "CROSS-FUNCTIONAL COMPLEXITY", why: "This shows how you operate when priorities conflict." }
      ]
    }
  };
}

export async function callOpenAIChat(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  mode: Mode,
  model?: string,
  options?: { signal?: AbortSignal },
) {
  const USE_MOCK_OPENAI = ["1", "true", "TRUE"].includes(String(process.env.USE_MOCK_OPENAI || "").trim());
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  const OPENAI_MODEL = resolveOpenAIModel(mode, model);
  const baseReasoningEffort = resolveReasoningEffortForMode(mode, OPENAI_MODEL);
  const OPENAI_TIMEOUT_MS = Number(process.env.OPENAI_TIMEOUT_MS || 90000); // 90s - large prompt needs time
  const OPENAI_MAX_RETRIES = resolveProductionOpenAIRetryLimit(process.env.OPENAI_MAX_RETRIES ?? 1);
  const OPENAI_RETRY_BACKOFF_MS = Number(process.env.OPENAI_RETRY_BACKOFF_MS || 300);

  logInfo({
    msg: "llm.client.configured",
    llm: { task: mode, model: OPENAI_MODEL },
  });

  if (USE_MOCK_OPENAI) {
    throwIfGenerationCanceled(options?.signal);
    const mock = getMockOpenAIResponse(mode);

    return {
      choices: [{ message: { content: JSON.stringify(mock) } }]
    };
  }

  if (!OPENAI_API_KEY) {
    throw createAppError(
      "OPENAI_API_KEY_MISSING",
      "Missing OPENAI_API_KEY. Add it to web/.env.local (or export it in your shell) and restart the dev server. If you put it in the repo root .env, Next won't read it when running from web/.",
      500
    );
  }

  let lastError: any = null;

  for (let attempt = 0; attempt <= OPENAI_MAX_RETRIES; attempt++) {
    try {
      const { response: res, textBody } = await fetchWithTimeout(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: OPENAI_MODEL,
            ...getProductionChatCompletionTuning(OPENAI_MODEL, {
              temperature: mode === "resume_ideas" ? 0.12 : 0,
              reasoningEffort: attempt > 0
                ? increaseReasoningEffort(baseReasoningEffort)
                : baseReasoningEffort,
            }),
            response_format: getOpenAIResponseFormat(mode),
            messages
          })
        },
        OPENAI_TIMEOUT_MS,
        options?.signal,
      );

      if (!res.ok) {
        const status = res.status;
        const baseError = createAppError(
          "OPENAI_HTTP_ERROR",
          "The model had trouble finishing your report.",
          status >= 500 || status === 429 ? 502 : status,
          textBody
        );

        if ((status >= 500 || status === 429) && attempt < OPENAI_MAX_RETRIES) {
          lastError = baseError;
          if (OPENAI_RETRY_BACKOFF_MS > 0) await sleep(OPENAI_RETRY_BACKOFF_MS * (attempt + 1));
          continue;
        }
        throw baseError;
      }

      try {
        const data = JSON.parse(textBody);
        const choice = data?.choices?.[0];

        if (choice?.message?.refusal) {
          throw createAppError(
            "OPENAI_RESPONSE_REFUSAL",
            "The model could not complete this report safely.",
            502,
            choice.message.refusal
          );
        }

        if (choice?.finish_reason !== "stop") {
          throw createAppError(
            "OPENAI_RESPONSE_INCOMPLETE",
            "The model stopped before the report was complete.",
            502,
            choice?.finish_reason || "missing_finish_reason"
          );
        }

        return data;
      } catch (parseErr: any) {
        if (parseErr?.code) throw parseErr;
        throw createAppError("OPENAI_RESPONSE_NOT_JSON", "The model responded in an unreadable format.", 502, {
          parseError: parseErr?.message,
          body: textBody
        });
      }
    } catch (err: any) {
      lastError = err;
      const retryable = err?.code === "OPENAI_TIMEOUT"
        || err?.code === "OPENAI_NETWORK_ERROR"
        || err?.code === "OPENAI_RESPONSE_INCOMPLETE";
      if (retryable && attempt < OPENAI_MAX_RETRIES) {
        if (OPENAI_RETRY_BACKOFF_MS > 0) {
          await sleep(OPENAI_RETRY_BACKOFF_MS * (attempt + 1));
          throwIfGenerationCanceled(options?.signal);
        }
        continue;
      }
      throw err;
    }
  }

  throw lastError;
}

export function callOpenAIChatStreamingWithUsage(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  mode: Mode,
  reasoningEffort?: ReasoningEffort,
  model?: string,
  options?: { signal?: AbortSignal },
): {
  stream: AsyncGenerator<string, void, unknown>;
  usagePromise: Promise<TokenUsage | null>;
} {
  let resolveUsage!: (v: TokenUsage | null) => void;
  const usagePromise = new Promise<TokenUsage | null>((resolve) => {
    resolveUsage = resolve;
  });

  async function* wrapped(): AsyncGenerator<string, void, unknown> {
    let usage: TokenUsage | null = null;
    try {
      const USE_MOCK_OPENAI = ["1", "true", "TRUE"].includes(String(process.env.USE_MOCK_OPENAI || "").trim());
      const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
      const OPENAI_MODEL = resolveOpenAIModel(mode, model);
      const OPENAI_TIMEOUT_MS = Number(process.env.OPENAI_TIMEOUT_MS || 90000);

      if (USE_MOCK_OPENAI) {
        const mockJson = JSON.stringify(getMockOpenAIResponse(mode));
        const chunkSize = 96;
        for (let i = 0; i < mockJson.length; i += chunkSize) {
          throwIfGenerationCanceled(options?.signal);
          yield mockJson.slice(i, i + chunkSize);
        }
        usage = {
          prompt_tokens: Math.max(1, Math.ceil(JSON.stringify(messages).length / 4)),
          completion_tokens: Math.max(1, Math.ceil(mockJson.length / 4)),
        };
        return;
      }

      if (!OPENAI_API_KEY) {
        throw createAppError(
          "OPENAI_API_KEY_MISSING",
          "Missing OPENAI_API_KEY. Add it to web/.env.local and restart the dev server.",
          500
        );
      }

      const scope = createOpenAIAbortScope(options?.signal, OPENAI_TIMEOUT_MS);

      try {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: OPENAI_MODEL,
            ...getProductionChatCompletionTuning(OPENAI_MODEL, {
              temperature: mode === "resume_ideas" ? 0.12 : 0,
              reasoningEffort: resolveReasoningEffortForMode(mode, OPENAI_MODEL, reasoningEffort),
            }),
            response_format: getOpenAIResponseFormat(mode),
            stream_options: { include_usage: true },
            stream: true,
            messages
          }),
          signal: scope.signal
        });

        if (!res.ok) {
          const textBody = await res.text();
          throw createAppError(
            "OPENAI_HTTP_ERROR",
            "The model had trouble finishing your report.",
            res.status >= 500 || res.status === 429 ? 502 : res.status,
            textBody
          );
        }

        if (!res.body) {
          throw createAppError("OPENAI_NO_STREAM", "No stream body received from OpenAI.", 502);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let sawStop = false;

        while (true) {
          throwIfGenerationCanceled(options?.signal);
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed === "data: [DONE]") continue;
            if (!trimmed.startsWith("data: ")) continue;

            try {
              const json = JSON.parse(trimmed.slice(6));
              const choice = json.choices?.[0];
              if (choice?.delta?.refusal) {
                throw createAppError(
                  "OPENAI_RESPONSE_REFUSAL",
                  "The model could not complete this report safely.",
                  502,
                  choice.delta.refusal
                );
              }
              if (choice?.finish_reason && choice.finish_reason !== "stop") {
                throw createAppError(
                  "OPENAI_RESPONSE_INCOMPLETE",
                  "The model stopped before the report was complete.",
                  502,
                  choice.finish_reason
                );
              }
              if (choice?.finish_reason === "stop") sawStop = true;
              const content = choice?.delta?.content;
              if (content) yield content;
              if (json.usage) usage = normalizeTokenUsage(json);
            } catch (err: any) {
              if (err?.code) throw err;
              // Ignore malformed transport chunks; final payload validation still runs.
            }
          }
        }

        if (!sawStop) {
          throw createAppError(
            "OPENAI_RESPONSE_INCOMPLETE",
            "The model stream ended before the report was complete.",
            502,
            "missing_finish_reason"
          );
        }
      } catch (err: any) {
        throw normalizeOpenAITransportError(err, scope, options?.signal);
      } finally {
        scope.dispose();
      }
    } finally {
      resolveUsage(usage);
    }
  }

  return { stream: wrapped(), usagePromise };
}
