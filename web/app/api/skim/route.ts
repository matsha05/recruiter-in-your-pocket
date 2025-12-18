
import { NextRequest, NextResponse } from "next/server";
import pdf from "pdf-parse";
import { getRequestId, routeLabel } from "@/lib/observability/requestContext";
import { hashForLogs, logError, logInfo } from "@/lib/observability/logger";
import { rateLimit } from "@/lib/security/rateLimit";

// Heuristics for the "Skim" - what a recruiter's eye catches in 6 seconds.
// We are NOT using an LLM here for speed. We want < 500ms latency.
// We use Regex patterns to identifying "Anchor Data".

const PATTERNS = {
    // Dates: Jan 2020, 01/2020, 2020 - Present, etc.
    DATES: /\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.? ?\d{4}|(?:\d{1,2}\/)?\d{4})\s?(?:[-–—]|to)\s?(Present|Now|Current|\d{4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.? ?\d{4})\b/gi,

    // Common Job Titles (simplified list for high-precision matching)
    TITLES: /\b(Senior |Lead |Staff |Principal |Head of |Director |VP |Chief |Junior |Entry |Intern )?([A-Z][a-z]+ )?(Engineer|Developer|Designer|Manager|Recruiter|Marketer|Analyst|Consultant|Strategist|Officer|Founder|Co-Founder)\b/g,

    // Education Degrees
    EDUCATION: /\b(B\.?S\.?|B\.?A\.?|M\.?S\.?|M\.?B\.?A\.?|Ph\.?D\.?|Bachelor|Master|Doctorate)( of [A-Z][a-z]+)?\b/g,

    // Metrics (Numbers followed by % or $)
    METRICS: /\b(\d+(?:\.\d+)?%|\$\d+(?:[kK]|[mM])?|\d+\+)\b/g
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
    const request_id = getRequestId(req);
    const { method, path } = routeLabel(req);
    const route = `${method} ${path}`;
    const startedAt = Date.now();
    logInfo({ msg: "http.request.started", request_id, route, method, path });

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rl = rateLimit(`ip:${hashForLogs(ip)}:${path}`, 30, 60_000);
    if (!rl.ok) {
        const res = NextResponse.json({ ok: false, error: "Too many requests. Try again shortly." }, { status: 429 });
        res.headers.set("x-request-id", request_id);
        res.headers.set("retry-after", String(Math.ceil(rl.resetMs / 1000)));
        logInfo({
            msg: "http.request.completed",
            request_id,
            route,
            method,
            path,
            status: 429,
            latency_ms: Date.now() - startedAt,
            outcome: "rate_limited"
        });
        return res;
    }

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            const res = NextResponse.json({ ok: false, error: "No file provided" }, { status: 400 });
            res.headers.set("x-request-id", request_id);
            logInfo({ msg: "http.request.completed", request_id, route, method, path, status: 400, latency_ms: Date.now() - startedAt, outcome: "validation_error" });
            return res;
        }

        if (file.size > MAX_FILE_SIZE) {
            const res = NextResponse.json({ ok: false, error: "File is too large. Max 10MB." }, { status: 400 });
            res.headers.set("x-request-id", request_id);
            logInfo({ msg: "http.request.completed", request_id, route, method, path, status: 400, latency_ms: Date.now() - startedAt, outcome: "validation_error" });
            return res;
        }

        const type = (file.type || "").toLowerCase();
        const name = (file.name || "").toLowerCase();
        const isPdf = type === "application/pdf" || (!type && name.endsWith(".pdf"));
        if (!isPdf) {
            const res = NextResponse.json({ ok: false, error: "Only PDF files are supported for quick skim." }, { status: 400 });
            res.headers.set("x-request-id", request_id);
            logInfo({ msg: "http.request.completed", request_id, route, method, path, status: 400, latency_ms: Date.now() - startedAt, outcome: "validation_error" });
            return res;
        }

        // 1. Parse PDF Text
        const buffer = Buffer.from(await file.arrayBuffer());
        const data = await pdf(buffer);
        const text = data.text;

        // 2. "The Recruiter's Eye" - Extract Signals
        // We scan the text and exact "Highlighter Hits"

        const signals = {
            dates: matchUnique(text, PATTERNS.DATES),
            titles: matchUnique(text, PATTERNS.TITLES),
            education: matchUnique(text, PATTERNS.EDUCATION),
            metrics: matchUnique(text, PATTERNS.METRICS) // The eye is drawn to numbers
        };

        // 3. Construct the "Impression"
        // We return the raw text (for blurring) and the signal indices/values
        const res = NextResponse.json({
            ok: true,
            meta: {
                pageCount: data.numpages,
                info: data.info,
            },
            skim: signals,
            // We trim excessive newlines to clean up the "Blur View" rendering
            previewText: text.replace(/\n{3,}/g, "\n\n").slice(0, 3000) // Limit preview to first ~page
        });
        res.headers.set("x-request-id", request_id);
        logInfo({
            msg: "http.request.completed",
            request_id,
            route,
            method,
            path,
            status: 200,
            latency_ms: Date.now() - startedAt,
            outcome: "success"
        });
        return res;

    } catch (error: any) {
        logError({
            msg: "http.request.completed",
            request_id,
            route,
            method,
            path,
            status: 500,
            latency_ms: Date.now() - startedAt,
            outcome: "internal_error",
            err: { name: error?.name || "Error", message: error?.message || "Could not parse resume", stack: error?.stack }
        });
        const res = NextResponse.json({ ok: false, error: "Could not parse resume" }, { status: 500 });
        res.headers.set("x-request-id", request_id);
        return res;
    }
}

function matchUnique(text: string, regex: RegExp): string[] {
    const matches = text.match(regex) || [];
    // Dedupe and clean
    return Array.from(new Set(matches.map(m => m.trim()))).slice(0, 10); // Limit to top 10 per category
}
