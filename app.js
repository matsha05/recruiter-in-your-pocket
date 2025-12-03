require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");
const Stripe = require("stripe");

// Support both puppeteer (local/dev) and puppeteer-core with @sparticuz/chromium (Vercel/serverless)
let puppeteer;
let chromium;

// Check if we're on Vercel/serverless first
const isVercel = Boolean(process.env.VERCEL);
const isServerless = Boolean(
  isVercel ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.FUNCTION_NAME ||
  process.env.RAILWAY_ENVIRONMENT ||
  process.env.RENDER
);

// For serverless environments, prefer puppeteer-core with @sparticuz/chromium
if (isServerless) {
  try {
    chromium = require("@sparticuz/chromium");
    puppeteer = require("puppeteer-core");
  } catch (e) {
    // Fall back to regular puppeteer if serverless packages aren't available
    try {
      puppeteer = require("puppeteer");
    } catch (e2) {
      throw new Error("For serverless deployment, install @sparticuz/chromium and puppeteer-core. Error: " + e.message);
    }
  }
} else {
  // For local development, use regular puppeteer
  try {
    puppeteer = require("puppeteer");
  } catch (e) {
    // Fall back to puppeteer-core if puppeteer is not available
    try {
      puppeteer = require("puppeteer-core");
      try {
        chromium = require("@sparticuz/chromium");
      } catch (e2) {
        // @sparticuz/chromium not needed for local dev
        chromium = null;
      }
    } catch (e2) {
      throw new Error("Neither puppeteer nor puppeteer-core is installed. Install puppeteer for local dev or puppeteer-core + @sparticuz/chromium for serverless.");
    }
  }
}

// If chromium wasn't loaded above, try to load it (for cases where it's available but not detected as serverless)
if (!chromium) {
  try {
    chromium = require("@sparticuz/chromium");
  } catch (e) {
    // @sparticuz/chromium not installed, will use regular Chrome/Chromium
    chromium = null;
  }
}

const app = express();
const PORT = process.env.PORT || 3000;
const LOG_FILE = process.env.LOG_FILE;
const USE_MOCK_OPENAI = ["1", "true", "TRUE"].includes(
  String(process.env.USE_MOCK_OPENAI || "").trim()
);
const JSON_INSTRUCTION =
  "You must respond ONLY with valid JSON. The output must be a JSON object that exactly matches the expected schema. This message contains the word json.";

// OpenAI config
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const OPENAI_TIMEOUT_MS = Number(process.env.OPENAI_TIMEOUT_MS || 20000);
const OPENAI_MAX_RETRIES = Number(process.env.OPENAI_MAX_RETRIES || 2);
const OPENAI_RETRY_BACKOFF_MS = Number(process.env.OPENAI_RETRY_BACKOFF_MS || 300);
const API_AUTH_TOKEN = process.env.API_AUTH_TOKEN;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const stripe = STRIPE_SECRET_KEY ? Stripe(STRIPE_SECRET_KEY) : null;

if (!OPENAI_API_KEY && !USE_MOCK_OPENAI) {
  console.warn("Missing OPENAI_API_KEY in .env; live OpenAI calls will fail until set.");
}

// Health check
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// Simple request ID + logging with light sanitization (avoid logging user text/PII)
function sanitizeLogObject(obj = {}) {
  const blockedKeys = new Set(["text", "content", "raw", "rawContent", "body", "resume"]);
  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    if (blockedKeys.has(key)) continue;
    if (typeof value === "string" && value.length > 500) {
      cleaned[key] = `${value.slice(0, 500)}…[truncated]`;
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

function logLine(obj, isError = false) {
  const safe = sanitizeLogObject(obj);
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    ...safe
  });
  (isError ? console.error : console.log)(line);
  if (LOG_FILE) {
    fs.appendFile(LOG_FILE, line + "\n", (err) => {
      if (err) {
        console.error(JSON.stringify({ level: "error", msg: "log_write_failed", err: err.message }));
      }
    });
  }
}

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

// Ready check
app.get("/ready", (req, res) => {
  try {
    const hasKey = Boolean(OPENAI_API_KEY) || USE_MOCK_OPENAI;
    loadPromptFile("resume_v1.txt");
    if (!hasKey) {
      return res.status(500).json({ ok: false, message: "Missing OPENAI_API_KEY" });
    }
    return res.json({ ok: true });
  } catch (err) {
    logLine({ level: "error", msg: "ready_failed", err: err.message }, true);
    return res.status(500).json({ ok: false, message: "Not ready" });
  }
});

console.log("Server starting in directory:", __dirname);

app.use(cors());
app.use(express.json());
app.set("trust proxy", true);

app.use((req, res, next) => {
  const start = Date.now();
  const reqId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
  req.reqId = reqId;

  res.on("finish", () => {
    const durationMs = Date.now() - start;
    logLine({
      level: "info",
      reqId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs
    });
  });

  next();
});

if (API_AUTH_TOKEN) {
  app.use("/api", (req, res, next) => {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (token !== API_AUTH_TOKEN) {
      return res.status(401).json({
        ok: false,
        errorCode: "UNAUTHORIZED",
        message: "Authentication required to use this endpoint."
      });
    }
    next();
  });
}

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 60;
const rateBuckets = new Map();

function rateLimit(req, res, next) {
  const key = req.ip || req.connection?.remoteAddress || "unknown";
  const now = Date.now();
  const bucket = rateBuckets.get(key) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };

  if (now > bucket.resetAt) {
    bucket.count = 0;
    bucket.resetAt = now + RATE_LIMIT_WINDOW_MS;
  }

  bucket.count += 1;
  rateBuckets.set(key, bucket);

  if (bucket.count > RATE_LIMIT_MAX) {
    return res.status(429).json({
      ok: false,
      errorCode: "RATE_LIMIT",
      message: "Too many requests. Please wait a moment and try again."
    });
  }

  next();
}

// Periodic cleanup of expired rate limit buckets to prevent memory leaks
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
setInterval(() => {
  const now = Date.now();
  let removed = 0;
  for (const [key, bucket] of rateBuckets.entries()) {
    if (now > bucket.resetAt) {
      rateBuckets.delete(key);
      removed++;
    }
  }
  if (removed > 0) {
    logLine({
      level: "info",
      msg: "rate_limit_cleanup",
      removed,
      remaining: rateBuckets.size
    });
  }
}, CLEANUP_INTERVAL_MS);

app.use(express.static(path.join(__dirname)));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/api/create-checkout-session", rateLimit, async (req, res) => {
  if (!stripe || !STRIPE_PRICE_ID || !FRONTEND_URL) {
    return res.status(500).json({
      ok: false,
      errorCode: "PAYMENT_CONFIG_MISSING",
      message: "Payments are not configured yet. Please try again later."
    });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price: STRIPE_PRICE_ID,
          quantity: 1
        }
      ],
      success_url: `${FRONTEND_URL}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}?checkout=cancelled`
    });

    return res.json({ ok: true, url: session.url });
  } catch (err) {
    logLine(
      {
        level: "error",
        msg: "checkout_session_failed",
        reqId: req.reqId,
        error: err.message
      },
      true
    );
    return res.status(500).json({
      ok: false,
      errorCode: "PAYMENT_FAILED",
      message: "Could not start checkout right now. Try again in a moment."
    });
  }
});

function getSystemPromptForMode(mode) {
  if (mode === "resume") {
    return loadPromptFile("resume_v1.txt");
  }

  if (mode === "resume_ideas") {
    return loadPromptFile("resume_ideas_v1.txt");
  }

  return baseTone;
}

const MAX_TEXT_LENGTH = 30000;
const ALLOWED_MODES = ["resume", "resume_ideas"];

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
  const trimmedText = typeof text === "string" ? text.trim() : "";

  if (!trimmedText) {
    fieldErrors.text = "Paste your resume text so I can actually review it.";
  } else if (trimmedText.length > MAX_TEXT_LENGTH) {
    fieldErrors.text =
      "Your resume text is very long. Try sending a smaller section or trimming extra content.";
  }

  if (mode !== undefined) {
    if (typeof mode !== "string") {
      fieldErrors.mode = 'Mode must be a text value like "resume".';
    } else if (!ALLOWED_MODES.includes(mode)) {
      fieldErrors.mode = 'Mode must be "resume" or "resume_ideas".';
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
      text: trimmedText,
      mode: mode || "resume",
      jobContext,
      seniorityLevel
    }
  };
}

function validateResumeIdeasRequest(body) {
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

  const { text } = body;
  const trimmedText = typeof text === "string" ? text.trim() : "";

  if (!trimmedText) {
    fieldErrors.text = "Paste your resume text so I can actually review it.";
  } else if (trimmedText.length > MAX_TEXT_LENGTH) {
    fieldErrors.text =
      "Your resume text is very long. Try sending a smaller section or trimming extra content.";
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
      text: trimmedText
    }
  };
}

function createAppError(code, message, httpStatus, internal) {
  const err = new Error(message);
  err.code = code;
  err.httpStatus = httpStatus;
  if (internal) {
    err.internal = internal;
  }
  return err;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

async function callOpenAIChat(messages, mode) {
  if (USE_MOCK_OPENAI) {
    const mockFile =
      mode === "resume_ideas" ? "mock_response_ideas.json" : "mock_response.json";
    const mockPath = path.join(__dirname, "tests", "fixtures", mockFile);
    let mock = null;
    try {
      mock = JSON.parse(fs.readFileSync(mockPath, "utf8"));
    } catch {
      mock =
        mode === "resume_ideas"
          ? {
              questions: [
                "At OpenAI, which IT/security hire you drove changed pass-through or accept rate, and what was the before/after?",
                "In Meta’s ML Acceleration effort, what action you owned got non-ML sourcers productive, and how many hires did that add?",
                "For Google Cloud LATAM, which referral or hiring motion you led moved time-to-fill or offer volume the most?",
                "As X-Team CPO, which move (Rippling go-live, DEI program, performance system) changed time-to-hire or retention, and by how much?",
                "In World Race logistics, when did you prevent a major travel/budget issue for 60 volunteers, and what was the impact?"
              ],
              notes: [
                "Pick 1–3 questions and write a quick story answer for each in a separate doc.",
                "From each story, pull out three things:",
                "Scope: team size, regions, budget, or volume you touched.",
                "Decision: the call you made or the action you owned.",
                "Outcome: what changed because of it, ideally with a number.",
                "Turn that into a bullet in this shape:",
                "\"Verb + what you owned + outcome with a number.\""
              ],
              how_to_use:
                "How to use these: Take each story and write one new bullet or upgrade an existing one using scope, decision, and outcome. If it does not add anything new, skip it."
            }
          : {
              score: 86,
              summary:
                "You read as someone who takes messy workstreams and makes them shippable. Your edge is steady ownership: you keep leaders aligned, run the checklist, and make clear calls. You operate with structure and avoid drift even when requirements shift. What is harder to see is the exact scope—teams, volume, dollars—and the before/after change you drove. Trajectory points up if you surface scale and measurable outcomes faster.",
              strengths: [
                "You keep delivery on track when priorities change and still close the loop with stakeholders.",
                "You use structure (checklists, reviews, comms) so launches and projects avoid drift.",
                "You describe decisions you owned instead of hiding behind “the team.”",
                "You show pattern recognition in how you prevent issues from recurring."
              ],
              gaps: [
                "Scope (teams, geos, customers, volume, dollars) is often missing.",
                "Before/after impact is implied but not stated; add metrics or clear qualitative change.",
                "Some bullets blend multiple ideas; split them so impact lands.",
                "A few phrases could be more specific to the systems or programs you ran."
              ],
              rewrites: [
                {
                  label: "Impact",
                  original: "Improved process across teams.",
                  better: "Ran a cross-team launch with clear owners, decisions, and checkpoints so delivery hit the agreed date.",
                  enhancement_note:
                    "If you have it, include: number of teams/regions and shipments or users affected, so scope is obvious."
                },
                {
                  label: "Scope",
                  original: "Supported leadership on projects.",
                  better: "Supported leadership by running risk reviews and comms so projects stayed aligned across teams.",
                  enhancement_note:
                    "If you have it, include: number of teams or regions involved, which clarifies scale."
                },
                {
                  label: "Clarity",
                  original: "Handled stakeholder updates.",
                  better: "Kept launches on track by running checklists, risk reviews, and stakeholder comms so go-live stayed on schedule.",
                  enhancement_note:
                    "If you have it, include: number of launches per month/quarter and audience size, to show reach."
                },
                {
                  label: "Ownership",
                  original: "Handled stakeholder updates.",
                  better: "Led stakeholder updates with decisions, risks, and next steps so leaders could unblock issues quickly.",
                  enhancement_note:
                    "If you have it, include: cadence and the groups involved, so the reader sees scale."
                }
              ],
              next_steps: [
                "Add scope (teams, volume, regions) to two top bullets.",
                "State one before/after metric in a headline bullet.",
                "Split any bullet that mixes decisions and outcomes."
              ]
            };
    }
    return {
      choices: [
        {
          message: {
            content: JSON.stringify(mock)
          }
        }
      ]
    };
  }

  if (!OPENAI_API_KEY) {
    throw createAppError(
      "OPENAI_API_KEY_MISSING",
      "The service is not configured with an OpenAI API key. Please try again later.",
      500
    );
  }

  let lastError = null;

  for (let attempt = 0; attempt <= OPENAI_MAX_RETRIES; attempt++) {
    try {
      const t0 = Date.now();
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
            temperature: 0,
            response_format: { type: "json_object" },
            messages
          })
        },
        OPENAI_TIMEOUT_MS
      );

      const latencyMs = Date.now() - t0;

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
        const parsed = JSON.parse(textBody);
        logLine({
          level: "info",
          msg: "openai_chat_success",
          model: OPENAI_MODEL,
          mode,
          attempt,
          latencyMs
        });
        return parsed;
      } catch (parseErr) {
        // Log parse failure (reqId will be added by caller context if available)
        logLine(
          {
            level: "error",
            msg: "openai_response_parse_failed",
            model: OPENAI_MODEL,
            mode,
            attempt,
            latencyMs,
            errorCode: "OPENAI_RESPONSE_NOT_JSON",
            parseError: parseErr.message
          },
          true
        );
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
        if (OPENAI_RETRY_BACKOFF_MS > 0) {
          await sleep(OPENAI_RETRY_BACKOFF_MS * (attempt + 1));
        }
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

  function normalizeOptionalScore(score, fieldName) {
    if (score === null || typeof score === "undefined") return null;
    if (typeof score !== "number" || !Number.isFinite(score)) {
      throw createAppError(
        "OPENAI_RESPONSE_SHAPE_INVALID",
        `The model response had an invalid ${fieldName}.`,
        502
      );
    }
    const rounded = Math.round(score);
    if (rounded < 0) return 0;
    if (rounded > 100) return 100;
    return rounded;
  }

  function ensureLayoutAndContentFields(obj) {
    const normalizedLayoutScore = normalizeOptionalScore(obj.layout_score, "layout_score");
    const normalizedContentScore = normalizeOptionalScore(
      typeof obj.content_score === "number" ? obj.content_score : obj.score,
      "content_score"
    );

    obj.layout_score = normalizedLayoutScore;
    obj.layout_band = typeof obj.layout_band === "string" ? obj.layout_band : "unknown";
    obj.layout_notes = typeof obj.layout_notes === "string" ? obj.layout_notes : "";
    obj.content_score =
      normalizedContentScore === null ? obj.score : normalizedContentScore;
    return obj;
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
  if (typeof obj.score_label !== "string") {
    throw createAppError(
      "OPENAI_RESPONSE_SHAPE_INVALID",
      "The model response was missing score_label.",
      502
    );
  }
  if (typeof obj.score_comment_short !== "string") {
    throw createAppError(
      "OPENAI_RESPONSE_SHAPE_INVALID",
      "The model response was missing score_comment_short.",
      502
    );
  }
  if (typeof obj.score_comment_long !== "string") {
    throw createAppError(
      "OPENAI_RESPONSE_SHAPE_INVALID",
      "The model response was missing score_comment_long.",
      502
    );
  }

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

    return ensureLayoutAndContentFields(obj);
  }

function validateResumeIdeasPayload(obj) {
  if (!obj || typeof obj !== "object") {
    throw createAppError(
      "OPENAI_RESPONSE_SHAPE_INVALID",
      "The model response did not match the expected format.",
      502
    );
  }

  if (!Array.isArray(obj.questions)) {
    throw createAppError(
      "OPENAI_RESPONSE_SHAPE_INVALID",
      "The model response was missing questions.",
      502
    );
  }

  if (!Array.isArray(obj.notes)) {
    throw createAppError(
      "OPENAI_RESPONSE_SHAPE_INVALID",
      "The model response was missing notes.",
      502
    );
  }

  if (typeof obj.how_to_use !== "string") {
    throw createAppError(
      "OPENAI_RESPONSE_SHAPE_INVALID",
      "The model response was missing how_to_use.",
      502
    );
  }

  return obj;
}

function fallbackResumeData() {
  return {
    score: 86,
    summary:
      "You read as someone who takes messy workstreams and makes them shippable. Your edge is steady ownership: you keep leaders aligned, run the checklist, and make clear calls. You operate with structure and avoid drift even when requirements shift. What is harder to see is the exact scope—teams, volume, dollars—and the before/after change you drove. Trajectory points up if you surface scale and measurable outcomes faster.",
    strengths: [
      "You keep delivery on track when priorities change and still close the loop with stakeholders.",
      "You use structure (checklists, reviews, comms) so launches and projects avoid drift.",
      "You describe decisions you owned instead of hiding behind “the team.”",
      "You show pattern recognition in how you prevent issues from recurring."
    ],
    gaps: [
      "Scope (teams, geos, customers, volume, dollars) is often missing.",
      "Before/after impact is implied but not stated; add metrics or clear qualitative change.",
      "Some bullets blend multiple ideas; split them so impact lands.",
      "A few phrases could be more specific to the systems or programs you ran."
    ],
    rewrites: [
      {
        label: "Impact",
        original: "Improved process across teams.",
        better: "Ran a cross-team launch with clear owners, decisions, and checkpoints so delivery hit the agreed date.",
        enhancement_note:
          "If you have it, include: number of teams/regions and shipments or users affected, so scope is obvious."
      },
      {
        label: "Scope",
        original: "Supported leadership on projects.",
        better: "Supported leadership by running risk reviews and comms so projects stayed aligned across teams.",
        enhancement_note:
          "If you have it, include: number of teams or regions involved, which clarifies scale."
      },
      {
        label: "Clarity",
        original: "Handled stakeholder updates.",
        better: "Kept launches on track by running checklists, risk reviews, and stakeholder comms so go-live stayed on schedule.",
        enhancement_note:
          "If you have it, include: number of launches per month/quarter and audience size, to show reach."
      },
      {
        label: "Ownership",
        original: "Handled stakeholder updates.",
        better: "Led stakeholder updates with decisions, risks, and next steps so leaders could unblock issues quickly.",
        enhancement_note:
          "If you have it, include: cadence and the groups involved, so the reader sees scale."
      }
    ],
    next_steps: [
      "Add scope (teams, volume, regions) to two top bullets.",
      "State one before/after metric in a headline bullet.",
      "Split any bullet that mixes decisions and outcomes."
    ]
  };
}

function fallbackIdeasData() {
  return {
    questions: [
      "Think of a project where you changed how a team operated: what was your decision, what changed, and who or how many were affected?",
      "Recall a time you reduced risk or rescued a slipping effort: what call did you make, and what measurable recovery followed?",
      "Where did you design or improve a system/process that people still use—what problem did it solve and what scale does it cover now?"
    ],
    notes: [
      "Pick 1–3 questions and write a quick story answer for each in a separate doc.",
      "From each story, pull out three things:",
      "Scope: team size, regions, budget, or volume you touched.",
      "Decision: the call you made or the action you owned.",
      "Outcome: what changed because of it, ideally with a number.",
      "Turn that into a bullet in this shape:",
      "\"Verb + what you owned + outcome with a number.\""
    ],
    how_to_use:
      "How to use these: Take each story and write one new bullet or upgrade an existing one using scope, decision, and outcome. If it does not add anything new, skip it."
  };
}

function validateReportForPdf(report) {
  if (!report || typeof report !== "object") return false;
  const requiredArrays = ["strengths", "gaps", "rewrites", "next_steps"];
  for (const key of requiredArrays) {
    if (!Array.isArray(report[key])) return false;
  }
  if (typeof report.summary !== "string") return false;
  return true;
}

async function renderReportHtml(report) {
  const generatedOn =
    typeof report.generated_on === "string" && report.generated_on.trim()
      ? report.generated_on
      : new Date().toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric"
        });
  const escape = (str) =>
    String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const rewriteHtml = (rewrites = []) =>
    rewrites
      .map((r) => {
        if (!r) return "";
        return `
        <div class="rewrite-row">
          <div class="rewrite-col">
            <div class="label">Original</div>
            <div class="text">${escape(r.original)}</div>
          </div>
          <div class="rewrite-col">
            <div class="label">Better</div>
            <div class="text">${escape(r.better)}</div>
          </div>
          ${
            r.enhancement_note
              ? `<div class="enhancement">${escape(r.enhancement_note)}</div>`
              : ""
          }
        </div>`;
      })
      .join("");

  const listHtml = (items = []) =>
    items
      .map((item) => `<li>${escape(item)}</li>`)
      .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Resume Review — Recruiter in Your Pocket</title>
  <style>
    @import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Manrope:wght@400;500;600&display=swap");
    :root {
      --accent: #3341A6;
      --accent-dark: #26328C;
      --text-main: #0F172A;
      --text-soft: #334155;
      --text-muted: #64748B;
      --wash: #FAF9F6;
      --border-subtle: #d7dae3;
      --space-xs: 6px;
      --space-sm: 10px;
      --space-sm-alt: 12px;
      --space-md: 15px;
      --space-md-alt: 16px;
      --space-lg: 20px;
      --space-xl: 30px;
      --space-xl-alt: 24px;
      --space-2xl: 40px;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: "Manrope", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: var(--text-main);
      background: var(--wash);
      padding: var(--space-md);
      font-size: 15px;
      line-height: 1.5;
    }
    .pdf-header {
      max-width: 760px;
      margin: 0 auto var(--space-sm);
      padding: 0 var(--space-sm);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--space-md-alt);
    }
    .pdf-header-left { display: flex; flex-direction: column; gap: 2px; }
    .pdf-header-title {
      font-family: "Plus Jakarta Sans", system-ui, -apple-system, sans-serif;
      font-size: 18px;
      font-weight: 800;
      letter-spacing: -0.03em;
      color: var(--text-main);
      text-transform: none;
      line-height: 1.1;
    }
    .pdf-header-subtitle {
      font-size: 12px;
      color: var(--text-muted);
      letter-spacing: 0.01em;
    }
    .pdf-header-right {
      text-align: right;
      font-size: 12px;
      color: var(--text-muted);
      letter-spacing: 0.01em;
    }
    .pdf-report-card {
      max-width: 760px;
      margin: var(--space-sm) auto 0;
      background: #ffffff;
      border: 1px solid rgba(12, 17, 32, 0.08);
      border-radius: 14px;
      padding: var(--space-xl-alt);
      box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
    }
    .stack-section {
      position: relative;
      padding-left: var(--space-xl-alt);
      margin: var(--space-xl) 0;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .stack-section::before {
      content: "";
      position: absolute;
      left: 0;
      top: 8px;
      bottom: 8px;
      width: 3px;
      background: linear-gradient(180deg, var(--accent) 0%, color-mix(in srgb, var(--accent) 60%, transparent) 100%);
      border-radius: 999px;
      opacity: 0.7;
    }
    h1, h2 {
      font-family: "Plus Jakarta Sans", system-ui, -apple-system, sans-serif;
      font-weight: 700;
      color: var(--text-main);
      letter-spacing: -0.02em;
      margin-bottom: var(--space-sm);
      line-height: 1.25;
    }
    h1 { font-size: 26px; }
    h2 { font-size: 21px; }
    .subtext {
      font-size: 14px;
      color: var(--text-muted);
      margin-bottom: var(--space-md-alt);
      line-height: 1.6;
      font-weight: 400;
    }
    p {
      font-size: 15px;
      line-height: 1.5;
      margin-bottom: var(--space-md);
      color: var(--text-main);
    }
    ul {
      padding-left: 20px;
      margin-bottom: var(--space-md);
      font-size: 15px;
      line-height: 1.6;
      color: var(--text-main);
    }
    li {
      margin-bottom: var(--space-xs);
      line-height: 1.55;
    }
    .score {
      font-size: 26px;
      font-weight: 800;
      color: var(--accent);
      margin-bottom: var(--space-xs);
      font-family: "Plus Jakarta Sans", system-ui, sans-serif;
      letter-spacing: -0.02em;
    }
    .band {
      font-size: 12px;
      color: var(--text-muted);
      margin-bottom: var(--space-sm);
    }
    .label {
      font-size: 12px;
      font-weight: 700;
      color: var(--text-muted);
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      font-family: "Plus Jakarta Sans", system-ui, sans-serif;
    }
    .text {
      font-size: 15px;
      color: var(--text-main);
      line-height: 1.55;
    }
    .rewrite-row {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--space-md-alt);
      margin-bottom: var(--space-md-alt);
      border-left: 2px solid rgba(12, 17, 32, 0.06);
      padding-left: var(--space-sm-alt);
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .rewrite-col {
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
    }
    .rewrite-label {
      font-size: 12px;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      font-family: "Plus Jakarta Sans", system-ui, sans-serif;
    }
    .enhancement {
      grid-column: 1 / -1;
      font-size: 13px;
      color: var(--text-muted);
      font-style: italic;
      margin-top: var(--space-xs);
    }
    .footer {
      margin-top: var(--space-xl);
      font-size: 11px;
      color: rgba(100, 116, 139, 0.7);
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="pdf-header">
    <div class="pdf-header-left">
      <div class="pdf-header-title">Recruiter in Your Pocket</div>
      <div class="pdf-header-subtitle">Resume Report</div>
    </div>
    <div class="pdf-header-right">Generated on ${generatedOn}</div>
  </div>

  <div class="pdf-report-card">
    <div class="stack-section">
      <div class="score">Score: ${Math.round(report.score || 0)}/100</div>
      ${report.score_label ? `<div class="band">${escape(report.score_label)}</div>` : ""}
      ${report.score_comment_short ? `<p>${escape(report.score_comment_short)}</p>` : ""}
    </div>

    <div class="stack-section">
      <h2>How your resume reads</h2>
      <p>${escape(report.summary)}</p>
    </div>

    <div class="stack-section">
      <h2>What's working</h2>
      <div class="subtext">Strengths that show up clearly.</div>
      <ul>${listHtml(report.strengths)}</ul>
    </div>

    <div class="stack-section">
      <h2>What's harder to see</h2>
      <div class="subtext">Parts of your impact that don't come through as strongly.</div>
      <ul>${listHtml(report.gaps)}</ul>
    </div>

    <div class="stack-section">
      <h2>Stronger phrasing you can use</h2>
      <div class="subtext">Original / Better pairs.</div>
      ${rewriteHtml(report.rewrites)}
    </div>

    ${
      Array.isArray(report.missing_wins) && report.missing_wins.length
        ? `<div class="stack-section">
            <h2>Missing wins</h2>
            <ul>${listHtml(report.missing_wins)}</ul>
          </div>`
        : ""
    }

    <div class="stack-section">
      <h2>Next steps</h2>
      <div class="subtext">Simple fixes you can make this week.</div>
      <ul>${listHtml(report.next_steps)}</ul>
    </div>

    <div class="footer">Created with Recruiter in Your Pocket — recruiterinyourpocket.com</div>
  </div>
</body>
</html>
`;
}

async function generatePdfBuffer(report) {
  const html = await renderReportHtml(report);
  let browser;
  try {
    // Use the top-level isVercel and isServerless variables

    // Enhanced launch args for production/serverless environments
    const launchArgs = [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage", // Overcome limited resource problems
      "--disable-gpu", // Disable GPU hardware acceleration
      "--disable-software-rasterizer",
      "--disable-extensions",
      "--disable-background-timer-throttling",
      "--disable-backgrounding-occluded-windows",
      "--disable-renderer-backgrounding"
    ];

    // Additional args for serverless environments
    if (isServerless) {
      launchArgs.push("--single-process"); // Sometimes needed for serverless
    }

    let browserOptions;

    // For Vercel, use @sparticuz/chromium
    if (isVercel && chromium) {
      // Set Chromium flags for Vercel (if method exists)
      if (typeof chromium.setGraphicsMode === 'function') {
        chromium.setGraphicsMode(false);
      }
      
      // Get Chromium executable path
      const executablePath = await chromium.executablePath();
      
      // Enhanced args for Vercel to handle missing libraries
      const chromiumArgs = [
        ...chromium.args,
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-software-rasterizer',
        '--disable-extensions',
        '--single-process'
      ];
      
      browserOptions = {
        args: chromiumArgs,
        defaultViewport: chromium.defaultViewport,
        executablePath: executablePath,
        headless: chromium.headless,
        timeout: 30000 // 30 second timeout for browser launch
      };
    } else {
      // For local development or other platforms
      browserOptions = {
        headless: "new",
        args: launchArgs,
        timeout: 30000 // 30 second timeout for browser launch
      };
      
      if (process.env.CHROME_EXECUTABLE_PATH) {
        // Use custom Chrome path if provided
        browserOptions.executablePath = process.env.CHROME_EXECUTABLE_PATH;
      }
    }

    browser = await puppeteer.launch(browserOptions);
    const page = await browser.newPage();

    // Set a reasonable timeout for page operations
    page.setDefaultTimeout(30000);
    page.setDefaultNavigationTimeout(30000);

    // Set viewport for consistent rendering (only if not using chromium.defaultViewport)
    if (!isVercel || !chromium) {
      await page.setViewport({ width: 1200, height: 1600 });
    }

    // Load the HTML content with a timeout
    await page.setContent(html, {
      waitUntil: "networkidle0",
      timeout: 30000
    });

    // Generate PDF with timeout
    const pdfBuffer = await Promise.race([
      page.pdf({
        format: "A4",
        printBackground: true,
        displayHeaderFooter: false,
        margin: {
          top: "18mm",
          right: "16mm",
          bottom: "18mm",
          left: "16mm"
        }
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("PDF generation timeout")), 30000)
      )
    ]);

    return pdfBuffer;
  } catch (err) {
    // Enhanced error logging for debugging
    logLine(
      {
        level: "error",
        msg: "pdf_generation_error",
        error: err.message,
        stack: err.stack,
        isServerless: Boolean(
          process.env.VERCEL ||
          process.env.AWS_LAMBDA_FUNCTION_NAME ||
          process.env.FUNCTION_NAME
        ),
        chromePath: process.env.CHROME_EXECUTABLE_PATH || "default"
      },
      true
    );
    throw err;
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (closeErr) {
        logLine(
          {
            level: "warn",
            msg: "browser_close_error",
            error: closeErr.message
          },
          false
        );
      }
    }
  }
}
app.post("/api/resume-feedback", rateLimit, async (req, res) => {
  try {
    const tStart = Date.now();
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

    const data = await callOpenAIChat(
      [
        { role: "system", content: JSON_INSTRUCTION },
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      currentMode
    );

    const rawContent = data?.choices?.[0]?.message?.content;
    let parsed;
    try {
      parsed = validateResumeModelPayload(extractJsonFromText(rawContent));
    } catch (err) {
      logLine(
        {
          level: "error",
          reqId: req.reqId,
          errorCode: err.code || "OPENAI_RESPONSE_SHAPE_INVALID",
          message: "Parse/shape validation failed for resume feedback response",
          status: err.httpStatus || 502,
          responseData: err.internal || err.message,
          parseFailure: true
        },
        true
      );
      
      // Only fall back to mock data if USE_MOCK_OPENAI is explicitly set
      if (USE_MOCK_OPENAI) {
        logLine(
          {
            level: "warn",
            reqId: req.reqId,
            msg: "falling_back_to_mock_data",
            reason: "USE_MOCK_OPENAI is set"
          },
          false
        );
        parsed = ensureLayoutAndContentFields(fallbackResumeData());
      } else {
        // Fail closed: throw the error to be caught by outer catch block
        throw err;
      }
    }

    const latencyMs = Date.now() - tStart;

    logLine({
      level: "info",
      msg: "resume_feedback_success",
      reqId: req.reqId,
      mode: currentMode,
      latencyMs,
      model: OPENAI_MODEL
    });

    const enriched = ensureLayoutAndContentFields(parsed);

    return res.json({
      ok: true,
      data: enriched,
      content: JSON.stringify(enriched),
      raw: rawContent
    });
  } catch (err) {
    logLine(
      {
        level: "error",
        reqId: req.reqId,
        errorCode: err.code || "INTERNAL_SERVER_ERROR",
        message: err.message,
        status: err.httpStatus || 500
      },
      true
    );

    const status = err.httpStatus || 500;
    const code = err.code || "INTERNAL_SERVER_ERROR";

    const message =
      code === "OPENAI_TIMEOUT"
        ? "This is taking longer than usual. Try again in a moment."
        : code === "OPENAI_NETWORK_ERROR"
        ? "Connection hiccup. Try again in a moment."
        : code === "OPENAI_RESPONSE_PARSE_ERROR" ||
          code === "OPENAI_RESPONSE_SHAPE_INVALID" ||
          code === "OPENAI_RESPONSE_NOT_JSON"
        ? "I couldn't read the response cleanly. Try again."
        : "I had trouble reading your resume just now. Try again in a moment.";

    return res.status(status).json({
      ok: false,
      errorCode: code,
      message
    });
  }
});

app.post("/api/resume-ideas", rateLimit, async (req, res) => {
  try {
    const validation = validateResumeIdeasRequest(req.body);

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

    const { text } = validation.value;
    const systemPrompt = getSystemPromptForMode("resume_ideas");
    const userPrompt = `Here is the user's resume text. Read it closely, infer their primary role/discipline and level, and follow the system instructions to surface overlooked achievements that fit their background.

USER INPUT:
${text}`;

    const messages = [
      { role: "system", content: JSON_INSTRUCTION },
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ];

    const data = await callOpenAIChat(messages, "resume_ideas");

    const rawContent = data?.choices?.[0]?.message?.content;
    let parsed;
    try {
      parsed = validateResumeIdeasPayload(extractJsonFromText(rawContent));
    } catch (err) {
      logLine(
        {
          level: "error",
          reqId: req.reqId,
          errorCode: err.code || "OPENAI_RESPONSE_SHAPE_INVALID",
          message: "Parse/shape validation failed for resume ideas response",
          status: err.httpStatus || 502,
          responseData: err.internal || err.message,
          parseFailure: true
        },
        true
      );
      
      // Only fall back to mock data if USE_MOCK_OPENAI is explicitly set
      if (USE_MOCK_OPENAI) {
        logLine(
          {
            level: "warn",
            reqId: req.reqId,
            msg: "falling_back_to_mock_data",
            reason: "USE_MOCK_OPENAI is set"
          },
          false
        );
        parsed = fallbackIdeasData();
      } else {
        // Fail closed: throw the error to be caught by outer catch block
        throw err;
      }
    }

    return res.json({
      ok: true,
      data: parsed,
      content: JSON.stringify(parsed),
      raw: rawContent
    });
  } catch (err) {
    const respStatus = err.response?.status || err.httpStatus || 500;
    const respData = err.response?.data || err.internal || err.message;
    const errorCode = err.code || "INTERNAL_SERVER_ERROR";
    
    logLine(
      {
        level: "error",
        reqId: req.reqId,
        errorCode,
        message: err.message,
        status: respStatus,
        responseData: respData
      },
      true
    );

    const message =
      errorCode === "OPENAI_TIMEOUT"
        ? "This is taking longer than usual. Try again in a moment."
        : errorCode === "OPENAI_NETWORK_ERROR"
        ? "Connection hiccup. Try again in a moment."
        : errorCode === "OPENAI_RESPONSE_PARSE_ERROR" ||
          errorCode === "OPENAI_RESPONSE_SHAPE_INVALID" ||
          errorCode === "OPENAI_RESPONSE_NOT_JSON"
        ? "I couldn't read the response cleanly. Try again."
        : "I had trouble pulling those questions. Try again in a moment.";

    return res.status(respStatus).json({
      ok: false,
      errorCode,
      message
    });
  }
});

app.post("/api/export-pdf", rateLimit, (req, res) => {
  (async () => {
    try {
      const payload = req.body?.report || req.body || {};
      if (!validateReportForPdf(payload)) {
        return res.status(400).json({
          ok: false,
          errorCode: "INVALID_PAYLOAD",
          message: "Report data is incomplete. Try exporting again after a successful run."
        });
      }
      const pdfBuffer = await generatePdfBuffer(payload);
      if (!pdfBuffer || pdfBuffer.length === 0) {
        logLine(
          {
            level: "error",
            msg: "export_pdf_failed",
            error: "PDF buffer is empty",
            reqId: req.reqId
          },
          true
        );
        return res.status(500).json({
          ok: false,
          errorCode: "EXPORT_FAILED",
          message: "PDF isn't ready right now. Give it another try."
        });
      }
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", 'attachment; filename="resume-review.pdf"');
      return res.end(pdfBuffer);
    } catch (err) {
      logLine(
        {
          level: "error",
          msg: "export_pdf_failed",
          reqId: req.reqId,
          error: err.message,
          stack: err.stack,
          errorCode: err.code || "EXPORT_FAILED"
        },
        true
      );

      // Provide more specific error messages based on error type
      let userMessage = "PDF isn't ready right now. Give it another try.";
      let errorCode = "EXPORT_FAILED";

      if (err.message.includes("timeout") || err.message.includes("Timeout")) {
        userMessage = "PDF took too long to generate. Try again.";
        errorCode = "EXPORT_TIMEOUT";
      } else if (err.message.includes("launch") || err.message.includes("browser")) {
        userMessage = "PDF isn't available right now. Try again in a moment.";
        errorCode = "EXPORT_SERVICE_UNAVAILABLE";
      } else if (err.message.includes("ENOENT") || err.message.includes("executable")) {
        userMessage = "PDF isn't set up properly. Contact support if this keeps happening.";
        errorCode = "EXPORT_CONFIG_ERROR";
      }

      return res.status(500).json({
        ok: false,
        errorCode,
        message: userMessage
      });
    }
  })();
});

app.validateResumeFeedbackRequest = validateResumeFeedbackRequest;
app.validateResumeModelPayload = validateResumeModelPayload;
app.validateResumeIdeasRequest = validateResumeIdeasRequest;
app.validateResumeIdeasPayload = validateResumeIdeasPayload;
app.loadPromptFile = loadPromptFile;
app.getSystemPromptForMode = getSystemPromptForMode;
app.logLine = logLine;

module.exports = app;
