/**
 * routes/auth.js
 * 
 * Express router for authentication-related API endpoints:
 * - POST /login/request-code
 * - POST /login/verify
 * - GET /me
 * 
 * Uses factory pattern to receive dependencies from app.js
 */

const express = require("express");
const crypto = require("crypto");

/**
 * Create auth router with injected dependencies
 * @param {Object} deps - Dependencies from app.js
 * @returns {express.Router}
 */
function createAuthRouter(deps) {
    const {
        // Rate limiter
        rateLimitAuth,
        // Validation helpers
        isValidEmail,
        generateNumericCode,
        // Session helpers
        setSession,
        clearSession,
        // Config
        LOGIN_CODE_TTL_MINUTES,
        SESSION_TTL_DAYS,
        // DB functions
        upsertUserByEmail,
        getUserByEmail,
        getUserById,
        createLoginCode,
        validateAndUseLoginCode,
        createSession,
        deleteSessionByToken,
        getLatestPass,
        getAllPasses,
        updateUserFirstName,
        // Mailer
        sendLoginCode,
        // Logging
        logLine
    } = deps;

    const router = express.Router();

    /**
     * POST /login/request-code
     * Send a login code to the provided email
     */
    router.post("/login/request-code", rateLimitAuth, async (req, res) => {
        try {
            const email = (req.body?.email || "").trim().toLowerCase();
            if (!isValidEmail(email)) {
                return res.status(400).json({ ok: false, message: "Enter a valid email." });
            }

            const user = await upsertUserByEmail(email);
            const code = generateNumericCode(6);
            const expiresAt = new Date(Date.now() + LOGIN_CODE_TTL_MINUTES * 60 * 1000).toISOString();
            await createLoginCode(user.id, code, expiresAt);
            await sendLoginCode(email, code);
            logLine({ level: "info", msg: "login_code_sent", email });
            return res.json({ ok: true, expires_at: expiresAt });
        } catch (err) {
            logLine({ level: "error", msg: "login_request_code_failed", error: err.message }, true);
            return res.status(500).json({ ok: false, message: "Could not send code right now." });
        }
    });

    /**
     * POST /login/verify
     * Validate the login code and create a session
     */
    router.post("/login/verify", rateLimitAuth, async (req, res) => {
        try {
            const email = (req.body?.email || "").trim().toLowerCase();
            const code = (req.body?.code || "").trim();
            if (!isValidEmail(email) || !code) {
                return res.status(400).json({ ok: false, message: "Email and code are required." });
            }
            const user = await getUserByEmail(email);
            if (!user) {
                return res.status(400).json({ ok: false, message: "Invalid code or email." });
            }
            const validation = await validateAndUseLoginCode(user.id, code);
            if (!validation.ok) {
                return res.status(400).json({ ok: false, message: "Invalid or expired code." });
            }
            const token = crypto.randomBytes(32).toString("hex");
            const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();
            await createSession(user.id, token, expiresAt);
            setSession(res, token);
            const activePass = await getLatestPass(user.id);
            return res.json({
                ok: true,
                user: {
                    email: user.email,
                    first_name: user.first_name || null
                },
                active_pass: activePass
            });
        } catch (err) {
            logLine({ level: "error", msg: "login_verify_failed", error: err.message }, true);
            return res.status(500).json({ ok: false, message: "Could not verify code right now." });
        }
    });

    /**
     * GET /me
     * Return the current authenticated user info and active pass
     */
    router.get("/me", async (req, res) => {
        if (!req.authUser) {
            return res.json({ ok: true, user: null, active_pass: null });
        }
        const activePass =
            req.activePass || (req.authUser ? await getLatestPass(req.authUser.id) : null);
        return res.json({
            ok: true,
            user: {
                email: req.authUser.email,
                first_name: req.authUser.first_name || null
            },
            active_pass: activePass
        });
    });

    /**
     * POST /logout
     * Clear the user's session
     */
    router.post("/logout", async (req, res) => {
        try {
            const token = req.signedCookies?.session;
            if (token) {
                await deleteSessionByToken(token);
            }
            clearSession(res);
            return res.json({ ok: true });
        } catch (err) {
            logLine({ level: "error", msg: "logout_failed", error: err.message }, true);
            return res.status(500).json({ ok: false, message: "Could not log out." });
        }
    });

    /**
     * POST /update-first-name
     * Update the user's first name for personalization
     */
    router.post("/update-first-name", async (req, res) => {
        if (!req.authUser) {
            return res.status(401).json({ ok: false, message: "Not authenticated" });
        }
        try {
            const firstName = (req.body?.first_name || "").trim();
            if (!firstName) {
                return res.status(400).json({ ok: false, message: "First name is required" });
            }
            const user = await updateUserFirstName(req.authUser.id, firstName);
            return res.json({
                ok: true,
                user: {
                    email: user.email,
                    first_name: user.first_name
                }
            });
        } catch (err) {
            logLine({ level: "error", msg: "update_first_name_failed", error: err.message }, true);
            return res.status(500).json({ ok: false, message: "Could not update name." });
        }
    });

    /**
     * GET /passes
     * Return all passes (order history) for the authenticated user
     */
    router.get("/passes", async (req, res) => {
        if (!req.authUser) {
            return res.status(401).json({ ok: false, message: "Not authenticated" });
        }
        try {
            const passes = await getAllPasses(req.authUser.id);
            return res.json({ ok: true, passes });
        } catch (err) {
            logLine({ level: "error", msg: "get_passes_failed", error: err.message }, true);
            return res.status(500).json({ ok: false, message: "Could not fetch passes." });
        }
    });

    return router;
}

module.exports = { createAuthRouter };
