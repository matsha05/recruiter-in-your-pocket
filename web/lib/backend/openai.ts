type Mode = "resume" | "resume_ideas" | "case_resume" | "case_interview" | "case_negotiation";

export type AppError = Error & {
  code?: string;
  httpStatus?: number;
  internal?: unknown;
};

export function createAppError(code: string, message: string, httpStatus: number, internal?: unknown): AppError {
  const err = new Error(message) as AppError;
  err.code = code;
  err.httpStatus = httpStatus;
  if (internal !== undefined) err.internal = internal;
  return err;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (err: any) {
    if (err?.name === "AbortError") {
      throw createAppError("OPENAI_TIMEOUT", "OpenAI request timed out.", 504);
    }
    throw createAppError(
      "OPENAI_NETWORK_ERROR",
      "There was a network hiccup while getting your resume review.",
      502,
      err?.message
    );
  } finally {
    clearTimeout(timer);
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

export async function callOpenAIChat(messages: Array<{ role: "system" | "user" | "assistant"; content: string }>, mode: Mode) {
  const USE_MOCK_OPENAI = ["1", "true", "TRUE"].includes(String(process.env.USE_MOCK_OPENAI || "").trim());
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const OPENAI_TIMEOUT_MS = Number(process.env.OPENAI_TIMEOUT_MS || 90000); // 90s - large prompt needs time
  const OPENAI_MAX_RETRIES = Number(process.env.OPENAI_MAX_RETRIES || 1);   // 1 retry only
  const OPENAI_RETRY_BACKOFF_MS = Number(process.env.OPENAI_RETRY_BACKOFF_MS || 300);

  // Debug logging
  console.log(`[OpenAI] Model: ${OPENAI_MODEL}, Timeout: ${OPENAI_TIMEOUT_MS}ms, Retries: ${OPENAI_MAX_RETRIES}, Mode: ${mode}`);

  if (USE_MOCK_OPENAI) {
    const mock =
      mode === "resume_ideas"
        ? {
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
        }
        : {
          score: 86,
          score_label: "Strong",
          score_comment_short: "Clear ownership with real signal; a few scope gaps keep it from landing faster.",
          score_comment_long: "You read as someone who ships and owns outcomes. Tighten scope and add one before/after metric.",
          summary:
            "You read as someone who takes messy work and makes it shippable. You keep momentum and close loops. You operate with structure. What is harder to see is the scale and before/after change. Trajectory is up if you surface scope and outcomes faster.",
          strengths: ["You show ownership instead of vague participation."],
          gaps: ["Scope and measurable outcomes are missing in a few key bullets."],
          top_fixes: [{ fix: "Add scope numbers to your top 2 bullets.", impact_level: "high", effort: "moderate", section_ref: "Work Experience" }],
          rewrites: [{ label: "Impact", original: "Improved process across teams.", better: "Led a cross-team change that reduced handoff confusion and sped up delivery.", enhancement_note: "If you have it, include: the before/after time or error rate so the reader can see scale." }],
          next_steps: ["Add one before/after metric to your top bullet."],
          subscores: { impact: 82, clarity: 84, story: 80, readability: 83 },
          section_review: {
            Summary: { grade: "B", priority: "Medium", working: "Clear identity statement.", missing: "Scope is vague.", fix: "Add 1 scope detail (team/users) in the first line." }
          },
          job_alignment: {
            strongly_aligned: ["Ownership", "Execution"],
            underplayed: ["Scale context"],
            missing: ["Named metrics"],
            role_fit: { best_fit_roles: ["Software Engineer"], stretch_roles: ["Tech Lead"], seniority_read: "Senior IC", industry_signals: ["Tech"], company_stage_fit: "Growth to public" },
            positioning_suggestion: "Lead with the biggest system or product you owned, then add one hard metric so scale is obvious."
          },
          ideas: { questions: [], notes: [], how_to_use: "" }
        };

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
      const res = await fetchWithTimeout(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: OPENAI_MODEL,
            temperature: mode === "resume_ideas" ? 0.12 : 0,
            response_format: { type: "json_object" },
            messages
          })
        },
        OPENAI_TIMEOUT_MS
      );

      const textBody = await res.text();

      if (!res.ok) {
        const status = res.status;
        const baseError = createAppError(
          "OPENAI_HTTP_ERROR",
          "The model had trouble finishing your resume review.",
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
        return JSON.parse(textBody);
      } catch (parseErr: any) {
        throw createAppError("OPENAI_RESPONSE_NOT_JSON", "The model responded in an unreadable format.", 502, {
          parseError: parseErr?.message,
          body: textBody
        });
      }
    } catch (err: any) {
      lastError = err;
      const retryable = err?.code === "OPENAI_TIMEOUT" || err?.code === "OPENAI_NETWORK_ERROR";
      if (retryable && attempt < OPENAI_MAX_RETRIES) {
        if (OPENAI_RETRY_BACKOFF_MS > 0) await sleep(OPENAI_RETRY_BACKOFF_MS * (attempt + 1));
        continue;
      }
      throw err;
    }
  }

  throw lastError;
}

/**
 * Streaming version of callOpenAIChat.
 * Returns an async generator that yields text chunks as they arrive.
 * The caller is responsible for accumulating and parsing the JSON.
 */
export async function* callOpenAIChatStreaming(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  mode: Mode
): AsyncGenerator<string, void, unknown> {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const OPENAI_TIMEOUT_MS = Number(process.env.OPENAI_TIMEOUT_MS || 90000);

  console.log(`[OpenAI Streaming] Model: ${OPENAI_MODEL}, Timeout: ${OPENAI_TIMEOUT_MS}ms, Mode: ${mode}`);

  if (!OPENAI_API_KEY) {
    throw createAppError(
      "OPENAI_API_KEY_MISSING",
      "Missing OPENAI_API_KEY. Add it to web/.env.local and restart the dev server.",
      500
    );
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        temperature: mode === "resume_ideas" ? 0.12 : 0,
        response_format: { type: "json_object" },
        stream: true,
        messages
      }),
      signal: controller.signal
    });

    if (!res.ok) {
      const textBody = await res.text();
      throw createAppError(
        "OPENAI_HTTP_ERROR",
        "The model had trouble finishing your resume review.",
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

    while (true) {
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
          const content = json.choices?.[0]?.delta?.content;
          if (content) {
            yield content;
          }
        } catch {
          // Ignore malformed JSON chunks
        }
      }
    }

    // Process any remaining buffer
    if (buffer.trim() && buffer.trim() !== "data: [DONE]" && buffer.startsWith("data: ")) {
      try {
        const json = JSON.parse(buffer.trim().slice(6));
        const content = json.choices?.[0]?.delta?.content;
        if (content) yield content;
      } catch {
        // Ignore
      }
    }
  } catch (err: any) {
    if (err?.name === "AbortError") {
      throw createAppError("OPENAI_TIMEOUT", "OpenAI request timed out.", 504);
    }
    if (err?.code) throw err;
    throw createAppError(
      "OPENAI_NETWORK_ERROR",
      "There was a network hiccup while getting your resume review.",
      502,
      err?.message
    );
  } finally {
    clearTimeout(timer);
  }
}
