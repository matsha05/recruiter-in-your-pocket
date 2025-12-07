require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");
const Stripe = require("stripe");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const {
  upsertUserByEmail,
  getUserByEmail,
  getUserById,
  createLoginCode,
  validateAndUseLoginCode,
  createSession,
  getSessionByToken,
  deleteSessionByToken,
  createPass,
  getLatestPass,
  getActivePasses,
  healthCheck
} = require("./db");
const { sendLoginCode } = require("./mailer");
const {
  SESSION_COOKIE,
  FREE_COOKIE,
  FREE_COOKIE_DAYS,
  FREE_RUN_LIMIT,
  makeSessionCookie,
  parseSessionCookie,
  makeFreeCookie,
  parseFreeCookie,
  cookieOptions,
  freeCookieOptions
} = require("./auth");
const {
  callOpenAIChat,
  extractJsonFromText,
  createAppError,
  USE_MOCK_OPENAI: OPENAI_MOCK_MODE,
  OPENAI_MODEL: OPENAI_MODEL_FROM_SERVICE
} = require("./services/openai");
const { createResumeRouter } = require("./routes/resume");
const { createPdfGenerator, createPdfRouter, validateReportForPdf } = require("./services/pdf");

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
app.disable("x-powered-by");
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
// Support tiered pricing: 24-hour pass and 30-day pass
const STRIPE_PRICE_ID_24H = process.env.STRIPE_PRICE_ID_24H || process.env.STRIPE_PRICE_ID;
const STRIPE_PRICE_ID_30D = process.env.STRIPE_PRICE_ID_30D;
// Legacy fallback
const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID;
// Support single or comma-separated origins in FRONTEND_URL
const FRONTEND_URL_RAW = process.env.FRONTEND_URL || "http://localhost:3000";
function parseOrigins(raw) {
  return String(raw)
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      try {
        const url = new URL(entry);
        return `${url.protocol}//${url.host}`;
      } catch (e) {
        console.warn(`Invalid FRONTEND_URL entry ignored: ${entry}`);
        return null;
      }
    })
    .filter(Boolean);
}
const FRONTEND_URLS = parseOrigins(FRONTEND_URL_RAW);
// Keep a primary URL for things like Stripe redirects; fall back to localhost if parsing failed
const FRONTEND_URL = FRONTEND_URLS[0] || "http://localhost:3000";
const stripe = STRIPE_SECRET_KEY ? Stripe(STRIPE_SECRET_KEY) : null;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const SESSION_SECRET = process.env.SESSION_SECRET;
const LOGIN_CODE_TTL_MINUTES = 15;
const SESSION_TTL_DAYS = 30;
const BYPASS_PAYWALL = String(process.env.BYPASS_PAYWALL || "").toLowerCase() === "true";

if (!SESSION_SECRET) {
  console.error("ERROR: SESSION_SECRET is required. Set it in your environment.");
  process.exit(1);
}

if (!OPENAI_API_KEY && !USE_MOCK_OPENAI) {
  console.warn("Missing OPENAI_API_KEY in .env; live OpenAI calls will fail until set.");
}

// Detect production environment
const isProduction = process.env.NODE_ENV === "production" ||
  Boolean(process.env.VERCEL) ||
  Boolean(process.env.RAILWAY_ENVIRONMENT) ||
  Boolean(process.env.RENDER) ||
  Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);

const isDevLike = !isProduction;
const allowedOrigins = new Set([
  ...FRONTEND_URLS,
  isDevLike ? "http://localhost:3000" : null,
  isDevLike ? "http://127.0.0.1:3000" : null
].filter(Boolean));

// Warn if Stripe is configured without API auth in non-production
if (stripe && !API_AUTH_TOKEN && !isProduction) {
  console.warn(
    "Stripe is configured but API_AUTH_TOKEN is not set. " +
    "In non-production this is allowed, but avoid exposing payment endpoints without auth in shared environments."
  );
}

// Require API_AUTH_TOKEN in production
if (isProduction && !API_AUTH_TOKEN) {
  console.error("ERROR: API_AUTH_TOKEN is required in production but is not set.");
  console.error("Set API_AUTH_TOKEN in your environment variables before starting the server.");
  console.error("For local development, API_AUTH_TOKEN is optional.");
  process.exit(1);
}

// Health check
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// Simple request ID + logging with light sanitization (avoid logging user text/PII)
function sanitizeLogObject(obj = {}) {
  const blockedKeys = new Set([
    "text",
    "content",
    "raw",
    "rawContent",
    "body",
    "resume",
    "password",
    "authorization",
    "cookie",
    "cookies",
    "set-cookie",
    "token",
    "secret",
    "key",
    "client_secret",
    "card"
  ]);
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

function parseCookies(req) {
  const header = req.headers.cookie;
  if (!header) return {};
  return header.split(";").reduce((acc, part) => {
    const [k, v] = part.trim().split("=");
    if (k && v) acc[k] = decodeURIComponent(v);
    return acc;
  }, {});
}

function requireSessionSecret() {
  if (!SESSION_SECRET) {
    throw new Error("SESSION_SECRET must be set");
  }
}

function generateNumericCode(length = 6) {
  const max = 10 ** length;
  const code = Math.floor(Math.random() * max).toString().padStart(length, "0");
  return code;
}

function isValidEmail(email) {
  return typeof email === "string" && /\S+@\S+\.\S+/.test(email.trim());
}

function setSession(res, token) {
  const cookieValue = makeSessionCookie(token);
  res.cookie(SESSION_COOKIE, cookieValue, cookieOptions());
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
app.get("/ready", async (req, res) => {
  try {
    const hasKey = Boolean(OPENAI_API_KEY) || USE_MOCK_OPENAI;
    loadPromptFile("resume_v1.txt");
    if (!hasKey) {
      return res.status(500).json({ ok: false, message: "Missing OPENAI_API_KEY" });
    }

    // Check database connectivity
    let dbReady = false;
    let dbError = null;
    try {
      await healthCheck();
      dbReady = true;
    } catch (err) {
      dbError = err.message;
    }

    // Check PDF generation capability
    let pdfReady = false;
    let pdfError = null;
    try {
      // Try to check if Chromium/Puppeteer is available
      // Use a lightweight check: try to get executable path or launch with very short timeout
      if (isVercel && chromium) {
        // For Vercel, check if chromium executable is available
        try {
          const executablePath = await chromium.executablePath();
          if (executablePath) {
            pdfReady = true;
          }
        } catch (e) {
          pdfError = `Chromium executable not available: ${e.message}`;
        }
      } else if (puppeteer) {
        // For local/dev, try a very lightweight browser launch with short timeout
        const testBrowser = await Promise.race([
          puppeteer.launch({
            headless: "new",
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
            timeout: 5000 // 5 second timeout for readiness check
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Browser launch timeout")), 5000)
          )
        ]);
        await testBrowser.close();
        pdfReady = true;
      } else {
        pdfError = "Puppeteer not available";
      }
    } catch (err) {
      pdfError = err.message;
      // Don't fail the ready check if PDF isn't available, but log it
      logLine({
        level: "warn",
        msg: "pdf_readiness_check_failed",
        error: err.message
      });
    }

    if (!pdfReady && pdfError) {
      return res.status(500).json({
        ok: false,
        message: `PDF generation not ready: ${pdfError}`
      });
    }

    if (!dbReady) {
      return res.status(500).json({
        ok: false,
        message: `Database not ready: ${dbError || "unknown error"}`
      });
    }

    return res.json({ ok: true });
  } catch (err) {
    logLine({ level: "error", msg: "ready_failed", err: err.message }, true);
    return res.status(500).json({ ok: false, message: "Not ready" });
  }
});

// Route-specific rate limiters (per IP/token)
const rateLimitLight = createRateLimiter(60);     // for cheap endpoints if needed
const rateLimitResume = createRateLimiter(20);    // /api/resume-feedback
const rateLimitIdeas = createRateLimiter(20);     // /api/resume-ideas
const rateLimitPdf = createRateLimiter(10);       // /api/export-pdf
const rateLimitCheckout = createRateLimiter(10);  // /api/create-checkout-session
const rateLimitAuth = createRateLimiter(30);      // login / code endpoints

app.post("/api/login/request-code", rateLimitAuth, async (req, res) => {
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

app.post("/api/login/verify", rateLimitAuth, async (req, res) => {
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
      user: { email: user.email },
      active_pass: activePass
    });
  } catch (err) {
    logLine({ level: "error", msg: "login_verify_failed", error: err.message }, true);
    return res.status(500).json({ ok: false, message: "Could not verify code right now." });
  }
});

app.get("/api/me", async (req, res) => {
  if (!req.authUser) {
    return res.json({ ok: true, user: null, active_pass: null });
  }
  const activePass =
    req.activePass || (req.authUser ? await getLatestPass(req.authUser.id) : null);
  return res.json({
    ok: true,
    user: { email: req.authUser.email },
    active_pass: activePass
  });
});

console.log("Server starting in directory:", __dirname);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser or same-origin requests (no Origin header)
      if (!origin) return callback(null, true);

      try {
        const url = new URL(origin);
        const normalizedOrigin = `${url.protocol}//${url.host}`;

        if (allowedOrigins.has(normalizedOrigin)) {
          return callback(null, true);
        }
      } catch {
        // Malformed origin; fall through to rejection
      }

      // Helpful logging for CORS failures
      logLine({
        level: "warn",
        msg: "cors_blocked",
        origin,
        allowedOrigins: Array.from(allowedOrigins)
      });

      return callback(new Error("CORS_NOT_ALLOWED"), false);
    }
  })
);

app.use("/api/stripe/webhook", express.raw({ type: "application/json" }));
app.use(express.json());

app.use(async (req, res, next) => {
  try {
    const cookies = parseCookies(req);

    // Parse structured free-run metadata cookie
    const freeMeta = parseFreeCookie(cookies[FREE_COOKIE]);
    req.freeMeta = freeMeta || { used: 0, last_free_ts: null };
    req.freeUsesRemaining = FREE_RUN_LIMIT - (req.freeMeta.used || 0);

    const raw = cookies[SESSION_COOKIE];
    if (raw) {
      const token = parseSessionCookie(raw);
      if (token) {
        const session = await getSessionByToken(token);
        if (session) {
          const user = await getUserById(session.user_id);
          if (user) {
            req.authUser = user;
            req.sessionToken = token;
            req.activePass = await getLatestPass(user.id);
          }
        }
      }
    }
    next();
  } catch (err) {
    next(err);
  }
});

// Set simple security headers on all responses
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "same-origin");
  res.setHeader("X-Frame-Options", "DENY");
  // X-XSS-Protection is legacy; set to "0" to avoid legacy filter quirks
  res.setHeader("X-XSS-Protection", "0");
  next();
});

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
  // Endpoints that are accessed from the frontend browser (not server-to-server)
  // These use session auth or are public/rate-limited instead of API_AUTH_TOKEN
  // Note: paths are relative to /api since we use app.use("/api", ...)
  const publicApiPaths = [
    "/login/request-code",
    "/login/verify",
    "/logout",
    "/me",
    "/parse-resume",
    "/resume-feedback",
    "/resume-ideas",
    "/export-pdf",
    "/create-checkout-session",
    "/stripe/webhook"
  ];

  app.use("/api", (req, res, next) => {
    // Skip auth for public frontend endpoints
    if (publicApiPaths.some(p => req.path === p || req.path.startsWith(p))) {
      return next();
    }

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
const rateBuckets = new Map();

function getRateLimitKey(req) {
  const ip = req.ip || req.connection?.remoteAddress || "unknown";
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const tokenSuffix = token ? `:${token.slice(0, 16)}` : "";
  return ip + tokenSuffix;
}

function createRateLimiter(maxPerMinute) {
  return function rateLimitMiddleware(req, res, next) {
    const baseKey = getRateLimitKey(req);
    const bucketKey = `${baseKey}:${maxPerMinute}`;
    const now = Date.now();
    const bucket =
      rateBuckets.get(bucketKey) || {
        count: 0,
        resetAt: now + RATE_LIMIT_WINDOW_MS
      };

    if (now > bucket.resetAt) {
      bucket.count = 0;
      bucket.resetAt = now + RATE_LIMIT_WINDOW_MS;
    }

    bucket.count += 1;
    rateBuckets.set(bucketKey, bucket);

    if (bucket.count > maxPerMinute) {
      return res.status(429).json({
        ok: false,
        errorCode: "RATE_LIMIT",
        message: "Too many requests. Please wait a moment and try again."
      });
    }

    next();
  };
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

// File upload configuration for resume parsing
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed'), false);
    }
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/workspace", (req, res) => {
  res.sendFile(path.join(__dirname, "workspace.html"));
});

app.get("/terms", (req, res) => {
  res.sendFile(path.join(__dirname, "terms.html"));
});

app.get("/privacy", (req, res) => {
  res.sendFile(path.join(__dirname, "privacy.html"));
});

// Resume file parsing endpoint
const rateLimitParse = createRateLimiter(30);
app.post("/api/parse-resume", rateLimitParse, upload.single('file'), async (req, res) => {
  const reqId = req.reqId || crypto.randomUUID();

  try {
    if (!req.file) {
      return res.status(400).json({
        ok: false,
        errorCode: "NO_FILE",
        message: "No file uploaded. Please select a PDF or DOCX file."
      });
    }

    const { mimetype, buffer, originalname } = req.file;
    let extractedText = '';

    if (mimetype === 'application/pdf') {
      try {
        // pdf-parse v1 API: simple function that returns { text, numpages, info }
        const pdfData = await pdfParse(buffer);
        extractedText = pdfData.text || '';
      } catch (pdfErr) {
        logLine({ level: "error", msg: "pdf_parse_failed", reqId, error: pdfErr.message }, true);
        return res.status(400).json({
          ok: false,
          errorCode: "PDF_PARSE_ERROR",
          message: "Could not read the PDF. Try a different file or paste your resume text directly."
        });
      }
    } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      try {
        const docxResult = await mammoth.extractRawText({ buffer });
        extractedText = docxResult.value || '';
      } catch (docxErr) {
        logLine({ level: "error", msg: "docx_parse_failed", reqId, error: docxErr.message }, true);
        return res.status(400).json({
          ok: false,
          errorCode: "DOCX_PARSE_ERROR",
          message: "Could not read the DOCX file. Try a different file or paste your resume text directly."
        });
      }
    } else {
      return res.status(400).json({
        ok: false,
        errorCode: "UNSUPPORTED_FILE_TYPE",
        message: "Only PDF and DOCX files are supported."
      });
    }

    // Clean up extracted text
    extractedText = extractedText
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (!extractedText || extractedText.length < 50) {
      return res.status(400).json({
        ok: false,
        errorCode: "EXTRACTION_EMPTY",
        message: "Could not extract enough text from the file. The file may be image-based or corrupted. Try pasting your resume text directly."
      });
    }

    logLine({ level: "info", msg: "resume_parsed", reqId, fileType: mimetype, textLength: extractedText.length });

    return res.json({
      ok: true,
      text: extractedText,
      fileName: originalname
    });
  } catch (err) {
    logLine({ level: "error", msg: "parse_resume_failed", reqId, error: err.message }, true);
    return res.status(500).json({
      ok: false,
      errorCode: "PARSE_ERROR",
      message: "Something went wrong while processing your file. Try pasting your resume text directly."
    });
  }
});

app.post("/api/create-checkout-session", rateLimitCheckout, async (req, res) => {
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

app.post("/api/stripe/webhook", async (req, res) => {
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

    try {
      let user = userId ? await getUserById(userId) : null;
      if (!user && email) {
        user = await upsertUserByEmail(email.toLowerCase());
      }
      if (!user) {
        throw new Error("No user to attach pass");
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

function getSystemPromptForMode(mode) {
  if (mode === "resume") {
    return loadPromptFile("resume_v1.txt");
  }

  if (mode === "resume_ideas") {
    return `${baseTone}\n\n${loadPromptFile("resume_ideas_v1.txt")}`;
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

  if (jobContext !== undefined) {
    if (typeof jobContext !== "string") {
      fieldErrors.jobContext = "Job context should be plain text if you include it.";
    } else if (jobContext.length > 500) {
      fieldErrors.jobContext =
        "Job context is a bit long. Trim it to the key details (a few lines).";
    }
  }

  // Job description for alignment analysis (longer form allowed)
  const jobDescription = body.jobDescription;
  if (jobDescription !== undefined) {
    if (typeof jobDescription !== "string") {
      fieldErrors.jobDescription = "Job description should be plain text.";
    } else if (jobDescription.length > 8000) {
      fieldErrors.jobDescription =
        "Job description is too long. Include the key sections (about, requirements, responsibilities).";
    }
  }

  if (seniorityLevel !== undefined) {
    if (typeof seniorityLevel !== "string") {
      fieldErrors.seniorityLevel =
        "Seniority level should be plain text if you include it.";
    } else if (seniorityLevel.length > 200) {
      fieldErrors.seniorityLevel =
        'Seniority level should be short, like "Senior IC" or "Director".';
    }
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
      jobDescription: jobDescription?.trim() || null,
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

// OpenAI functions (createAppError, sleep, fetchWithTimeout, callOpenAIChat, extractJsonFromText) 
// are now imported from ./services/openai.js


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

async function determineAccess(req) {
  // Access control with tiered access:
  // - pass_full: active pass holder gets full access
  // - free_full: free runs remaining (< FREE_RUN_LIMIT used), gets full access
  // - preview: free runs exhausted, no pass, gets Clarity Score only
  const activePass = req.authUser ? await getLatestPass(req.authUser.id) : null;
  const freeUsed = req.freeMeta?.used || 0;
  const freeRunIndex = freeUsed + 1; // 1 or 2 for first/second free run

  if (BYPASS_PAYWALL) {
    return {
      access: "full",
      access_tier: "pass_full",
      activePass: activePass || null,
      bypassed: true,
      free_run_index: freeRunIndex,
      free_uses_remaining: FREE_RUN_LIMIT - freeUsed
    };
  }

  if (activePass) {
    return {
      access: "full",
      access_tier: "pass_full",
      activePass,
      free_run_index: freeRunIndex,
      free_uses_remaining: FREE_RUN_LIMIT - freeUsed
    };
  }

  if (freeUsed < FREE_RUN_LIMIT) {
    return {
      access: "full",
      access_tier: "free_full",
      activePass: null,
      free_run_index: freeRunIndex,
      free_uses_remaining: FREE_RUN_LIMIT - freeUsed
    };
  }

  return {
    access: "preview",
    access_tier: "preview",
    activePass: null,
    free_run_index: freeRunIndex,
    free_uses_remaining: 0
  };
}

function fallbackResumeData() {
  return {
    score: 86,
    summary:
      "You read as someone who takes messy workstreams and makes them shippable. Your edge is steady ownership: you keep leaders aligned, run the checklist, and make clear calls. You operate with structure and avoid drift even when requirements shift. What is harder to see is the exact scope—teams, volume, dollars—and the before/after change you drove. Trajectory points up if you surface scale and measurable outcomes faster.",
    strengths: [
      "You keep delivery on track when priorities change and still close the loop with stakeholders.",
      "You use structure (checklists, reviews, comms) so launches and projects avoid drift.",
      'You describe decisions you owned instead of hiding behind "the team."',
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

// Mount resume routes from routes/resume.js
const resumeRouter = createResumeRouter({
  rateLimitResume,
  rateLimitIdeas,
  validateResumeFeedbackRequest,
  validateResumeIdeasRequest,
  validateResumeModelPayload,
  validateResumeIdeasPayload,
  ensureLayoutAndContentFields,
  callOpenAIChat,
  extractJsonFromText,
  getSystemPromptForMode,
  JSON_INSTRUCTION,
  determineAccess,
  FREE_COOKIE,
  FREE_RUN_LIMIT,
  BYPASS_PAYWALL,
  makeFreeCookie,
  freeCookieOptions,
  fallbackResumeData,
  fallbackIdeasData,
  logLine,
  USE_MOCK_OPENAI,
  OPENAI_MODEL
});
app.use("/api", resumeRouter);

// Mount PDF export routes from services/pdf.js
const generatePdfBuffer = createPdfGenerator({
  puppeteer,
  chromium,
  isVercel,
  isServerless,
  logLine
});
const pdfRouter = createPdfRouter({
  rateLimitPdf,
  validateReportForPdf,
  generatePdfBuffer,
  logLine
});
app.use("/api", pdfRouter);

app.validateResumeFeedbackRequest = validateResumeFeedbackRequest;
app.validateResumeFeedbackRequest = validateResumeFeedbackRequest;
app.validateResumeModelPayload = validateResumeModelPayload;
app.validateResumeIdeasRequest = validateResumeIdeasRequest;
app.validateResumeIdeasPayload = validateResumeIdeasPayload;
app.loadPromptFile = loadPromptFile;
app.getSystemPromptForMode = getSystemPromptForMode;
app.logLine = logLine;

module.exports = app;
