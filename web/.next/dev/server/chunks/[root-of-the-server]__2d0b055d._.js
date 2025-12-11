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
"[project]/web/lib/env.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getSupabaseAnonKey",
    ()=>getSupabaseAnonKey,
    "getSupabaseUrl",
    ()=>getSupabaseUrl
]);
function missing(name) {
    throw new Error(`Missing environment variable: ${name}`);
}
function getSupabaseUrl() {
    return ("TURBOPACK compile-time value", "https://njomdmfdlosknmnejdpe.supabase.co") || missing("NEXT_PUBLIC_SUPABASE_URL");
}
function getSupabaseAnonKey() {
    return ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qb21kbWZkbG9za25tbmVqZHBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNzE2ODQsImV4cCI6MjA4MDk0NzY4NH0.QGZnZ75vNOHplUBHeQ1u8dzms4Oi8NZb-yFeGZ7DLIA") || missing("NEXT_PUBLIC_SUPABASE_ANON_KEY");
}
}),
"[project]/web/lib/supabase/serverClient.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createSupabaseServerAction",
    ()=>createSupabaseServerAction,
    "createSupabaseServerClient",
    ()=>createSupabaseServerClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/next/headers.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/web/node_modules/@supabase/ssr/dist/module/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/@supabase/ssr/dist/module/createServerClient.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/lib/env.ts [app-route] (ecmascript)");
;
;
;
async function createSupabaseServerClient() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createServerClient"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSupabaseUrl"])(), (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSupabaseAnonKey"])(), {
        cookies: {
            get (name) {
                return cookieStore.get(name)?.value;
            }
        }
    });
}
async function createSupabaseServerAction() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createServerClient"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSupabaseUrl"])(), (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSupabaseAnonKey"])(), {
        cookies: {
            get (name) {
                return cookieStore.get(name)?.value;
            },
            set (name, value, options) {
                cookieStore.set({
                    name,
                    value,
                    ...options
                });
            },
            remove (name, options) {
                cookieStore.set({
                    name,
                    value: "",
                    ...options
                });
            }
        }
    });
}
}),
"[project]/web/app/api/checkout/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$stripe$2f$esm$2f$stripe$2e$esm$2e$node$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/stripe/esm/stripe.esm.node.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$supabase$2f$serverClient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/lib/supabase/serverClient.ts [app-route] (ecmascript)");
;
;
;
// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY ? new __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$stripe$2f$esm$2f$stripe$2e$esm$2e$node$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"](process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-11-17.clover"
}) : null;
const PRICE_IDS = {
    "24h": process.env.STRIPE_PRICE_ID_24H || process.env.STRIPE_PRICE_ID,
    "30d": process.env.STRIPE_PRICE_ID_30D
};
// Base URL for redirects
const getBaseUrl = ()=>{
    if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return "http://localhost:3001";
};
async function POST(request) {
    // Guard: Stripe must be configured
    if (!stripe) {
        console.error("[checkout] STRIPE_SECRET_KEY not set");
        return __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: false,
            message: "Payments are not configured yet."
        }, {
            status: 500
        });
    }
    try {
        const body = await request.json();
        const { tier, email } = body;
        // Email is required for checkout
        if (!email || typeof email !== "string") {
            return __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                ok: false,
                message: "Email is required."
            }, {
                status: 400
            });
        }
        // Determine tier
        const selectedTier = tier === "30d" ? "30d" : "24h";
        const priceId = PRICE_IDS[selectedTier];
        if (!priceId) {
            console.error(`[checkout] No price ID for tier: ${selectedTier}`);
            return __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                ok: false,
                message: "Invalid pass tier."
            }, {
                status: 400
            });
        }
        const tierLabel = selectedTier === "30d" ? "30-Day Campaign Pass" : "24-Hour Fix Pass";
        const baseUrl = getBaseUrl();
        // Check if user is already logged in (optional)
        let userId = null;
        try {
            const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$supabase$2f$serverClient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createSupabaseServerClient"])();
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                userId = session.user.id;
            }
        } catch  {
        // Ignore - user will be created in webhook
        }
        // Create Stripe checkout session
        // Name will be collected by Stripe in the checkout form
        const checkoutSession = await stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: [
                "card"
            ],
            line_items: [
                {
                    price: priceId,
                    quantity: 1
                }
            ],
            customer_email: email.trim(),
            // Collect billing name in checkout
            billing_address_collection: "required",
            success_url: `${baseUrl}/workspace?payment=success&tier=${selectedTier}`,
            cancel_url: `${baseUrl}/workspace?payment=cancelled`,
            metadata: {
                email: email.trim(),
                tier: selectedTier,
                tier_label: tierLabel,
                user_id: userId || ""
            },
            allow_promotion_codes: true,
            custom_text: {
                submit: {
                    message: `You're getting the ${tierLabel}. Unlimited resume reviews await!`
                }
            }
        });
        console.log(`[checkout] Created session for ${email}, tier: ${selectedTier}`);
        return __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: true,
            url: checkoutSession.url,
            sessionId: checkoutSession.id
        });
    } catch (err) {
        console.error("[checkout] Error:", err?.message);
        return __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: false,
            message: err?.message || "Checkout failed"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__2d0b055d._.js.map