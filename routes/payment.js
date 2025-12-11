/**
 * routes/payment.js
 * 
 * Express router for Stripe payment endpoints:
 * - POST /create-checkout-session
 * - POST /stripe/webhook
 * 
 * Uses factory pattern to receive dependencies from app.js
 */

const express = require("express");

/**
 * Create payment router with injected dependencies
 * @param {Object} deps - Dependencies from app.js
 * @returns {express.Router}
 */
function createPaymentRouter(deps) {
    const {
        // Rate limiter
        rateLimitCheckout,
        // Stripe instance and config
        stripe,
        STRIPE_WEBHOOK_SECRET,
        STRIPE_PRICE_ID_24H,
        STRIPE_PRICE_ID_30D,
        STRIPE_PRICE_ID,
        FRONTEND_URL,
        // DB functions
        getUserById,
        upsertUserByEmail,
        createPass,
        // Logging
        logLine
    } = deps;

    const router = express.Router();

    /**
     * POST /create-checkout-session
     * Create a Stripe checkout session for purchasing a pass
     */
    router.post("/create-checkout-session", rateLimitCheckout, async (req, res) => {
        if (!stripe || !FRONTEND_URL) {
            return res.status(500).json({
                ok: false,
                errorCode: "PAYMENT_CONFIG_MISSING",
                message: "Payments are not configured yet. Please try again later."
            });
        }

        if (!req.authUser) {
            return res.status(401).json({
                ok: false,
                errorCode: "UNAUTHENTICATED",
                message: "Sign in to continue to checkout."
            });
        }

        // Determine which tier/price to use
        const { tier } = req.body || {};
        let priceId;
        let tierLabel;

        if (tier === "30d" && STRIPE_PRICE_ID_30D) {
            priceId = STRIPE_PRICE_ID_30D;
            tierLabel = "30-day";
        } else if (tier === "24h" && STRIPE_PRICE_ID_24H) {
            priceId = STRIPE_PRICE_ID_24H;
            tierLabel = "24-hour";
        } else if (STRIPE_PRICE_ID_24H) {
            // Default to 24h if available
            priceId = STRIPE_PRICE_ID_24H;
            tierLabel = "24-hour";
        } else if (STRIPE_PRICE_ID) {
            // Legacy fallback
            priceId = STRIPE_PRICE_ID;
            tierLabel = "default";
        }

        if (!priceId) {
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
                        price: priceId,
                        quantity: 1
                    }
                ],
                customer_email: req.authUser.email,
                success_url: `${FRONTEND_URL}?checkout=success&tier=${tier || "24h"}&session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${FRONTEND_URL}?checkout=cancelled`,
                metadata: {
                    user_id: req.authUser.id,
                    tier: tier || "24h"
                }
            });

            logLine({
                level: "info",
                msg: "checkout_session_created",
                reqId: req.reqId,
                userId: req.authUser.id,
                tier: tierLabel,
                priceId: priceId.slice(0, 10) + "...", // partial for logs
                sessionId: session.id
            });

            return res.json({ ok: true, url: session.url });
        } catch (err) {
            logLine(
                {
                    level: "error",
                    msg: "checkout_session_failed",
                    reqId: req.reqId,
                    userId: req.authUser?.id,
                    tier: tierLabel,
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

    /**
     * POST /stripe/webhook
     * Handle Stripe webhook events (checkout.session.completed)
     */
    router.post("/stripe/webhook", async (req, res) => {
        if (!stripe || !STRIPE_WEBHOOK_SECRET) {
            return res.status(400).send("Webhook not configured");
        }

        const sig = req.headers["stripe-signature"];
        let event;

        try {
            event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
        } catch (err) {
            logLine({ level: "error", msg: "stripe_webhook_invalid", error: err.message }, true);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        if (event.type === "checkout.session.completed") {
            const session = event.data.object;
            const metadata = session.metadata || {};
            const tier = metadata.tier || "24h";
            const userId = metadata.user_id || null;
            const email = session.customer_email;

            // Extract billing name from Stripe customer_details
            const customerDetails = session.customer_details || {};
            const billingName = customerDetails.name || null;

            try {
                let user = userId ? await getUserById(userId) : null;
                if (!user && email) {
                    user = await upsertUserByEmail(email.toLowerCase());
                }
                if (!user) {
                    throw new Error("No user to attach pass");
                }

                // Only update name if user doesn't already have one
                if (billingName && !user.first_name) {
                    // Extract first name from full billing name
                    const firstName = billingName.split(" ")[0];
                    await updateUserFirstName(user.id, firstName);
                    logLine({
                        level: "info",
                        msg: "user_name_set_from_billing",
                        userId: user.id,
                        firstName
                    });
                }

                const nowTs = Date.now();
                const expiresAt =
                    tier === "30d"
                        ? new Date(nowTs + 30 * 24 * 60 * 60 * 1000).toISOString()
                        : new Date(nowTs + 24 * 60 * 60 * 1000).toISOString();

                await createPass(user.id, tier, expiresAt, null, session.id);
                logLine({
                    level: "info",
                    msg: "pass_created_from_webhook",
                    userId: user.id,
                    tier,
                    sessionId: session.id
                });
            } catch (err) {
                logLine({ level: "error", msg: "pass_creation_failed", error: err.message }, true);
                return res.status(500).send("Failed to create pass");
            }
        }

        res.json({ received: true });
    });

    return router;
}

module.exports = { createPaymentRouter };
