/**
 * routes/resume.js
 * 
 * Express router for resume-related API endpoints:
 * - POST /api/resume-feedback
 * - POST /api/resume-ideas
 * 
 * Uses factory pattern to receive dependencies from app.js
 */

const express = require("express");

/**
 * Create resume router with injected dependencies
 * @param {Object} deps - Dependencies from app.js
 * @returns {express.Router}
 */
function createResumeRouter(deps) {
    const {
        // Rate limiters
        rateLimitResume,
        rateLimitIdeas,
        // Request validation
        validateResumeFeedbackRequest,
        validateResumeIdeasRequest,
        // Response validation
        validateResumeModelPayload,
        validateResumeIdeasPayload,
        ensureLayoutAndContentFields,
        // OpenAI service
        callOpenAIChat,
        extractJsonFromText,
        // Prompt helpers
        getSystemPromptForMode,
        JSON_INSTRUCTION,
        // Access control
        determineAccess,
        // Cookie helpers
        FREE_COOKIE,
        FREE_RUN_LIMIT,
        BYPASS_PAYWALL,
        makeFreeCookie,
        freeCookieOptions,
        // Fallback data
        fallbackResumeData,
        fallbackIdeasData,
        // Logging
        logLine,
        // Config
        USE_MOCK_OPENAI,
        OPENAI_MODEL
    } = deps;

    const router = express.Router();

    /**
     * POST /api/resume-feedback
     * Main resume analysis endpoint
     */
    router.post("/resume-feedback", rateLimitResume, async (req, res) => {
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

            const { text, mode, jobDescription } = validation.value;
            const currentMode = mode;
            const hasJobDescription = jobDescription && jobDescription.length > 50;

            const accessInfo = await determineAccess(req);

            // Build system prompt
            let systemPrompt = getSystemPromptForMode(currentMode);

            // Add job-specific alignment guidance if job description provided
            if (hasJobDescription) {
                systemPrompt += `

JOB-SPECIFIC ALIGNMENT (ADDITIONAL CONTEXT)

The user has provided a specific job description. In your job_alignment response, pay special attention to:
- How well the resume aligns with THIS specific job's requirements
- Themes in the job description that the resume demonstrates (strongly_aligned)
- Themes in the job description that are present but underemphasized (underplayed)
- Critical requirements from the job description that are missing (missing)

The user wants to know: "Am I a fit for THIS role, and what should I emphasize or add?"
`;
            }

            // Build user prompt with optional job description
            let userPrompt = `Here is the user's input. Use the system instructions to respond.

USER RESUME:
${text}`;

            if (hasJobDescription) {
                userPrompt += `

JOB DESCRIPTION (for alignment analysis):
${jobDescription}`;
            }

            // Block if out of free allowance and no pass
            if (accessInfo.access === "preview") {
                return res.status(402).json({
                    ok: false,
                    errorCode: "PAYWALL_REQUIRED",
                    message: "You've used your free full reports. Upgrade to keep going.",
                    free_uses_remaining: 0,
                    access_tier: "preview"
                });
            }

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
                // Use appropriate validator based on mode
                if (currentMode === "resume_ideas") {
                    parsed = validateResumeIdeasPayload(extractJsonFromText(rawContent));
                } else {
                    parsed = validateResumeModelPayload(extractJsonFromText(rawContent));
                }
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
                model: OPENAI_MODEL,
                access_tier: accessInfo.access_tier,
                free_run_index: accessInfo.free_run_index
            });

            // Only apply layout/content enrichment for resume mode
            const payload = currentMode === "resume_ideas" ? parsed : ensureLayoutAndContentFields(parsed);

            // Determine if we should increment free-use counter
            const shouldIncrementFree = !BYPASS_PAYWALL &&
                !accessInfo.activePass &&
                accessInfo.access_tier === "free_full";

            let newFreeUsed = req.freeMeta?.used || 0;
            let newFreeUsesRemaining = accessInfo.free_uses_remaining;

            if (shouldIncrementFree) {
                newFreeUsed += 1;
                newFreeUsesRemaining = FREE_RUN_LIMIT - newFreeUsed;

                // Update the structured free-run cookie
                const newFreeMeta = {
                    used: newFreeUsed,
                    last_free_ts: new Date().toISOString()
                };
                res.cookie(FREE_COOKIE, makeFreeCookie(newFreeMeta), freeCookieOptions());
            }

            const responseBody = {
                ok: true,
                access: accessInfo.access,
                access_tier: accessInfo.access_tier,
                active_pass: accessInfo.activePass,
                user: req.authUser ? { email: req.authUser.email } : null,
                bypass: accessInfo.bypassed ? true : false,
                free_run_index: newFreeUsed,
                free_uses_remaining: newFreeUsesRemaining,
                data: payload,
                content: JSON.stringify(payload),
                raw: rawContent
            };

            return res.json(responseBody);
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

    /**
     * POST /api/resume-ideas
     * Generate probing questions to surface hidden achievements
     */
    router.post("/resume-ideas", rateLimitIdeas, async (req, res) => {
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

    return router;
}

module.exports = { createResumeRouter };
