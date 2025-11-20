require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

// OpenAI config
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const OPENAI_TIMEOUT_MS = Number(process.env.OPENAI_TIMEOUT_MS || 15000);
const OPENAI_MAX_RETRIES = Number(process.env.OPENAI_MAX_RETRIES || 2);

if (!OPENAI_API_KEY) {
  console.error("Missing OPENAI_API_KEY in .env");
  process.exit(1);
}

// Health check
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// Log which folder this server file is actually running from
console.log("Server starting in directory:", __dirname);

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files (like index.html) from this folder
app.use(express.static(path.join(__dirname)));

// Explicit route for homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

/**
 * Core tone and system prompts
 */
const baseTone = `
You are a calm, grounded recruiter with real experience at strong tech companies.

You speak plainly. You think clearly. You avoid corporate language and anything that feels exaggerated, salesy, or performative.

You write like a real person helping a friend.

Use short sentences. Keep advice specific. Name what is working, what is weak, and what to do next. Be honest but not harsh. Be direct without being cold.

Your goal is to give the user clarity, not hype. You help them understand their story, their strengths, and the simple changes that will make their message clearer.

You remind them that they already have a foundation. The changes you suggest are about sharpening and focus, not about their worth.
`.trim();

const promptCache = new Map();
function loadPromptFile(filename) {
  if (promptCache.has(filename)) {
    return promptCache.get(filename);
  }

  const filePath = path.join(__dirname, "prompts", filename);
  try {
    const content = fs.readFileSync(filePath, "utf8").trim();
    promptCache.set(filename, content);
    return content;
  } catch (err) {
    console.error(`Failed to load prompt file ${filename}:`, err);
    throw createAppError(
      "PROMPT_LOAD_FAILED",
      "The system prompt is missing. Try again in a moment.",
      500,
      err.message
    );
  }
}

function getSystemPromptForMode(mode) {
  if (mode === "resume") {
    return loadPromptFile("resume_v1.txt");
  }


  if (mode === "interview") {
    return (
      baseTone +
      `
Interview prep mode is not the primary focus yet. For now, give simple, plain-text guidance on how to prepare, using short sections and bullets.
Keep it calm, clear, and practical.
`
    );
  }

  return baseTone;
}

/**
 * Request validation for /api/resume-feedback
 */
const MAX_TEXT_LENGTH = 10000;
const ALLOWED_MODES = ["resume"];

function validateResumeFeedbackRequest(body) {
  const fieldErrors = {};

  if (!body || typeof body !== "object") {
    return {
      ok: false,
      message: "Your request did not come through in a usable format.",
      fieldErrors: {
        body: "Request body must be a JSON object."
      }
    };
  }

  const { text, mode, jobContext, seniorityLevel } = body;

  if (typeof text !== "string" || text.trim().length === 0) {
    fieldErrors.text = "Paste your resume text so I can actually review it.";
  } else if (text.length > MAX_TEXT_LENGTH) {
    fieldErrors.text =
      "Your resume text is very long. Try sending a smaller section or trimming extra content.";
  }

  if (mode !== undefined) {
    if (typeof mode !== "string") {
      fieldErrors.mode = 'Mode must be a text value like "resume".';
    } else if (!ALLOWED_MODES.includes(mode)) {
      fieldErrors.mode = 'Mode must be "resume" for now.';
    }
  }

  if (jobContext !== undefined && typeof jobContext !== "string") {
    fieldErrors.jobContext = "Job context should be plain text if you include it.";
  }

  if (seniorityLevel !== undefined && typeof seniorityLevel !== "string") {
    fieldErrors.seniorityLevel =
      "Seniority level should be plain text if you include it.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      message:
        "Something in your request needs a quick tweak before I can give you feedback.",
      fieldErrors
    };
  }

  return {
    ok: true,
    value: {
      text: text.trim(),
      mode: "resume",
      jobContext,
      seniorityLevel
    }
  };
}

/**
 * OpenAI helpers: timeout, retries, parsing, validation
 */

function createAppError(code, message, httpStatus, internal) {
  const err = new Error(message);
  err.code = code;
  err.httpStatus = httpStatus;
  if (internal) {
    err.internal = internal;
  }
  return err;
}

function fetchWithTimeout(url, options, timeoutMs) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(createAppError("OPENAI_TIMEOUT", "OpenAI request timed out.", 504));
    }, timeoutMs);

    fetch(url, options)
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(
          createAppError(
            "OPENAI_NETWORK_ERROR",
            "There was a network hiccup while getting your resume review.",
            502,
            err.message
          )
        );
      });
  });
}

async function callOpenAIChat(messages) {
  let lastError = null;

  for (let attempt = 0; attempt <= OPENAI_MAX_RETRIES; attempt++) {
    try {
      const res = await fetchWithTimeout(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + OPENAI_API_KEY
          },
          body: JSON.stringify({
            model: OPENAI_MODEL,
            temperature: 0.3,
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
          continue;
        }

        throw baseError;
      }

      try {
        return JSON.parse(textBody);
      } catch (parseErr) {
        throw createAppError(
          "OPENAI_RESPONSE_NOT_JSON",
          "The model responded in a format I could not read cleanly.",
          502,
          textBody
        );
      }
    } catch (err) {
      lastError = err;
      const retryableCodes = [
        "OPENAI_TIMEOUT",
        "OPENAI_NETWORK_ERROR"
      ];

      if (retryableCodes.includes(err.code) && attempt < OPENAI_MAX_RETRIES) {
        continue;
      }

      throw err;
    }
  }

  throw lastError;
}

function extractJsonFromText(text) {
  if (typeof text !== "string") {
    throw createAppError(
      "OPENAI_NO_CONTENT",
      "The model did not send back any usable content.",
      502
    );
  }

  let trimmed = text.trim();

  if (trimmed.startsWith("```")) {
    const firstNewline = trimmed.indexOf("\n");
    if (firstNewline !== -1) {
      trimmed = trimmed.slice(firstNewline + 1);
    }
    const lastFence = trimmed.lastIndexOf("```");
    if (lastFence !== -1) {
      trimmed = trimmed.slice(0, lastFence);
    }
    trimmed = trimmed.trim();
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    const firstBrace = trimmed.indexOf("{");
    const lastBrace = trimmed.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      throw createAppError(
        "OPENAI_RESPONSE_PARSE_ERROR",
        "I could not turn the model output into structured feedback.",
        502
      );
    }

    const candidate = trimmed.slice(firstBrace, lastBrace + 1);

    try {
      return JSON.parse(candidate);
    } catch {
      throw createAppError(
        "OPENAI_RESPONSE_PARSE_ERROR",
        "I could not turn the model output into structured feedback.",
        502
      );
    }
  }
}

function validateResumeModelPayload(obj) {
  if (!obj || typeof obj !== "object") {
    throw createAppError(
      "OPENAI_RESPONSE_SHAPE_INVALID",
      "The model response did not match the expected format.",
      502
    );
  }

  const normalizeScore = (score) => {
    if (typeof score !== "number" || !Number.isFinite(score)) {
      throw createAppError(
        "OPENAI_RESPONSE_SHAPE_INVALID",
        "The model response was missing a numeric score.",
        502
      );
    }
    const rounded = Math.round(score);
    if (rounded < 0) return 0;
    if (rounded > 100) return 100;
    return rounded;
  };

  obj.score = normalizeScore(obj.score);

  if (typeof obj.summary !== "string") {
    throw createAppError(
      "OPENAI_RESPONSE_SHAPE_INVALID",
      "The model response was missing a summary.",
      502
    );
  }

  const arrayFields = ["strengths", "gaps", "rewrites", "next_steps"];
  for (const field of arrayFields) {
    if (!Array.isArray(obj[field])) {
      throw createAppError(
        "OPENAI_RESPONSE_SHAPE_INVALID",
        `The model response field "${field}" was not in the expected format.`,
        502
      );
    }
  }

  if (Array.isArray(obj.rewrites)) {
    for (const item of obj.rewrites) {
      if (!item || typeof item !== "object") {
        throw createAppError(
          "OPENAI_RESPONSE_SHAPE_INVALID",
          "One of the rewrite suggestions was not structured correctly.",
          502
        );
      }
      const keys = ["label", "original", "better", "enhancement_note"];
      for (const key of keys) {
        if (typeof item[key] !== "string") {
          throw createAppError(
            "OPENAI_RESPONSE_SHAPE_INVALID",
            "One of the rewrite suggestions was missing a text field.",
            502
          );
        }
      }
    }
  }

  return obj;
}

/**
 * API endpoint
 */
app.post("/api/resume-feedback", async (req, res) => {
  try {
    const validation = validateResumeFeedbackRequest(req.body);

    if (!validation.ok) {
      return res.status(400).json({
        ok: false,
        errorCode: "VALIDATION_ERROR",
        message: validation.message,
        details: {
          fieldErrors: validation.fieldErrors
        }
      });
    }

    const { text, mode } = validation.value;
    const currentMode = mode;

    const systemPrompt = getSystemPromptForMode(currentMode);
    const userPrompt = `Here is the user's input. Use the system instructions to respond.

USER INPUT:
${text}`;

    const data = await callOpenAIChat([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ]);

    const rawContent = data?.choices?.[0]?.message?.content;

    const parsed = validateResumeModelPayload(extractJsonFromText(rawContent));

    return res.json({
      ok: true,
      data: parsed,
      // keep this for backward compatibility with the current frontend
      content: JSON.stringify(parsed),
      raw: rawContent
    });
  } catch (err) {
    console.error("Server error in /api/resume-feedback:", err);

    const status = err.httpStatus || 500;
    const code = err.code || "INTERNAL_SERVER_ERROR";

    const message =
      code === "OPENAI_TIMEOUT"
        ? "The model took too long to respond. Try again in a moment."
        : code === "OPENAI_NETWORK_ERROR"
        ? "There was a temporary network issue. Try again in a moment."
        : code === "OPENAI_RESPONSE_PARSE_ERROR" ||
          code === "OPENAI_RESPONSE_SHAPE_INVALID" ||
          code === "OPENAI_RESPONSE_NOT_JSON"
        ? "The model response came back in a format I could not read cleanly. Please try again."
        : "Something went wrong on my side while reviewing your resume. Try again in a minute.";

    return res.status(status).json({
      ok: false,
      errorCode: code,
      message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
