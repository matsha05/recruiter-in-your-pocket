/**
 * services/openai.js
 * 
 * Handles all OpenAI API interactions (resume feedback and ideas).
 * Includes retry logic, timeout handling, and response parsing.
 */

const path = require("path");
const fs = require("fs");

// Config (loaded from environment)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const OPENAI_TIMEOUT_MS = Number(process.env.OPENAI_TIMEOUT_MS || 60000);
const OPENAI_MAX_RETRIES = Number(process.env.OPENAI_MAX_RETRIES || 1);
const OPENAI_RETRY_BACKOFF_MS = Number(process.env.OPENAI_RETRY_BACKOFF_MS || 300);
const USE_MOCK_OPENAI = ["1", "true", "TRUE"].includes(
    String(process.env.USE_MOCK_OPENAI || "").trim()
);

/**
 * Create a structured application error
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

/**
 * Sleep utility for retry backoff
 */
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch with timeout wrapper
 */
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

/**
 * Simple log function (matches app.js logLine signature)
 */
function logLine(obj, isError = false) {
    const line = JSON.stringify({
        ts: new Date().toISOString(),
        ...obj
    });
    (isError ? console.error : console.log)(line);
}

/**
 * Call OpenAI Chat API with retry logic
 * @param {Array} messages - Chat messages array
 * @param {string} mode - "resume" or "resume_ideas"
 * @returns {Object} - OpenAI API response
 */
async function callOpenAIChat(messages, mode) {
    // Mock mode for testing
    if (USE_MOCK_OPENAI) {
        const mockFile =
            mode === "resume_ideas" ? "mock_response_ideas.json" : "mock_response.json";
        const mockPath = path.join(__dirname, "..", "tests", "fixtures", mockFile);
        let mock = null;
        try {
            mock = JSON.parse(fs.readFileSync(mockPath, "utf8"));
        } catch {
            mock = mode === "resume_ideas"
                ? {
                    questions: [
                        "At OpenAI, which IT/security hire you drove changed pass-through or accept rate?",
                        "In Meta's ML Acceleration effort, what action got non-ML sourcers productive?",
                        "For Google Cloud LATAM, which referral motion moved time-to-fill the most?"
                    ],
                    notes: ["Pick 1–3 questions and write a quick story answer."],
                    how_to_use: "Turn each story into a new bullet."
                }
                : {
                    score: 86,
                    summary: "You read as someone who takes messy workstreams and makes them shippable.",
                    strengths: ["You keep delivery on track when priorities change."],
                    gaps: ["Scope (teams, geos, customers) is often missing."],
                    rewrites: [{
                        label: "Impact",
                        original: "Improved process across teams.",
                        better: "Ran a cross-team launch with clear owners and checkpoints."
                    }],
                    next_steps: ["Add scope to two top bullets."]
                };
        }
        return {
            choices: [{ message: { content: JSON.stringify(mock) } }]
        };
    }

    // Real OpenAI call
    if (!OPENAI_API_KEY) {
        throw createAppError(
            "OPENAI_API_KEY_MISSING",
            "The service is not configured with an OpenAI API key.",
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
                        temperature: mode === "resume_ideas" ? 0.12 : 0,
                        response_format: { type: "json_object" },
                        messages
                    })
                },
                OPENAI_TIMEOUT_MS
            );

            const latencyMs = Date.now() - t0;
            const textBody = await res.text();

            if (textBody.length > 100_000) {
                throw createAppError(
                    "OPENAI_RESPONSE_TOO_LARGE",
                    "The model response was too large to process.",
                    502
                );
            }

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
                logLine({ level: "info", msg: "openai_chat_success", model: OPENAI_MODEL, mode, attempt, latencyMs });
                return parsed;
            } catch (parseErr) {
                logLine({ level: "error", msg: "openai_response_parse_failed", mode, parseError: parseErr.message }, true);
                throw createAppError("OPENAI_RESPONSE_NOT_JSON", "The model responded in an unreadable format.", 502, textBody);
            }
        } catch (err) {
            lastError = err;
            const retryableCodes = ["OPENAI_TIMEOUT", "OPENAI_NETWORK_ERROR"];

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

/**
 * Extract JSON from potentially wrapped text (markdown fences, etc.)
 */
function extractJsonFromText(text) {
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

module.exports = {
    callOpenAIChat,
    extractJsonFromText,
    createAppError,
    sleep,
    USE_MOCK_OPENAI,
    OPENAI_MODEL
};
