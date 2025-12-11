module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/child_process [external] (child_process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("child_process", () => require("child_process"));

module.exports = mod;
}),
"[project]/web/app/api/stripe/webhook/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST,
    "runtime",
    ()=>runtime
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$stripe$2f$esm$2f$stripe$2e$esm$2e$node$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/stripe/esm/stripe.esm.node.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$esm$2f$wrapper$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/@supabase/supabase-js/dist/esm/wrapper.mjs [app-route] (ecmascript)");
;
;
;
// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY ? new __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$stripe$2f$esm$2f$stripe$2e$esm$2e$node$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"](process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-11-17.clover"
}) : null;
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
// Supabase admin client (bypasses RLS for writes)
const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$esm$2f$wrapper$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createClient"])(("TURBOPACK compile-time value", "https://njomdmfdlosknmnejdpe.supabase.co"), process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        persistSession: false
    }
}) : null;
const runtime = "nodejs";
async function POST(request) {
    if (!stripe || !WEBHOOK_SECRET) {
        console.error("[webhook] Stripe or webhook secret not configured");
        return new __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"]("Webhook not configured", {
            status: 400
        });
    }
    if (!supabaseAdmin) {
        console.error("[webhook] Supabase admin client not configured");
        return new __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"]("Database not configured", {
            status: 500
        });
    }
    // Get raw body and signature
    const body = await request.text();
    const sig = request.headers.get("stripe-signature");
    if (!sig) {
        console.error("[webhook] Missing stripe-signature header");
        return new __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"]("Missing signature", {
            status: 400
        });
    }
    let event;
    try {
        event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET);
    } catch (err) {
        console.error("[webhook] Signature verification failed:", err.message);
        return new __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"](`Webhook Error: ${err.message}`, {
            status: 400
        });
    }
    // Handle checkout.session.completed
    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const metadata = session.metadata || {};
        const email = metadata.email || session.customer_email;
        const tier = metadata.tier || "24h";
        const metadataUserId = metadata.user_id || null;
        console.log(`[webhook] checkout.session.completed for ${email}, tier: ${tier}`);
        if (!email) {
            console.error("[webhook] No email in session");
            return new __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"]("No email found", {
                status: 400
            });
        }
        try {
            // Find or create user by email
            let userId = metadataUserId;
            if (!userId) {
                // Look up user by email in Supabase auth
                const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
                if (!listError && users.users) {
                    const existingUser = users.users.find((u)=>u.email?.toLowerCase() === email.toLowerCase());
                    if (existingUser) {
                        userId = existingUser.id;
                    }
                }
            }
            if (!userId) {
                // Create user via Supabase Auth
                const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
                    email: email.toLowerCase(),
                    email_confirm: true
                });
                if (createError) {
                    // If user already exists, try to find them again
                    console.log("[webhook] User creation failed, trying lookup:", createError.message);
                    const { data: users } = await supabaseAdmin.auth.admin.listUsers();
                    const existingUser = users?.users?.find((u)=>u.email?.toLowerCase() === email.toLowerCase());
                    if (existingUser) {
                        userId = existingUser.id;
                    }
                } else if (newUser?.user) {
                    userId = newUser.user.id;
                    console.log(`[webhook] Created new user: ${userId}`);
                }
            }
            if (!userId) {
                throw new Error("Could not find or create user");
            }
            // Update user's first name from billing if not set
            const customerDetails = session.customer_details;
            if (customerDetails?.name) {
                const firstName = customerDetails.name.split(" ")[0];
                const { data: existingUser } = await supabaseAdmin.auth.admin.getUserById(userId);
                if (existingUser?.user && !existingUser.user.user_metadata?.first_name) {
                    await supabaseAdmin.auth.admin.updateUserById(userId, {
                        user_metadata: {
                            ...existingUser.user.user_metadata,
                            first_name: firstName
                        }
                    });
                    console.log(`[webhook] Updated user first_name: ${firstName}`);
                }
            }
            // Calculate expiration
            const nowMs = Date.now();
            const expiresAt = tier === "30d" ? new Date(nowMs + 30 * 24 * 60 * 60 * 1000).toISOString() : new Date(nowMs + 24 * 60 * 60 * 1000).toISOString();
            // Create pass in database
            const passId = crypto.randomUUID();
            const { error: passError } = await supabaseAdmin.from("passes").insert({
                id: passId,
                user_id: userId,
                tier: tier,
                purchased_at: new Date().toISOString(),
                expires_at: expiresAt,
                price_id: null,
                checkout_session_id: session.id,
                created_at: new Date().toISOString()
            });
            if (passError) {
                console.error("[webhook] Failed to create pass:", passError.message);
                throw passError;
            }
            console.log(`[webhook] Pass created for user ${userId}, tier: ${tier}, expires: ${expiresAt}`);
        } catch (err) {
            console.error("[webhook] Error processing webhook:", err.message);
            return new __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"](`Processing Error: ${err.message}`, {
                status: 500
            });
        }
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        received: true
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__20d4c2c8._.js.map