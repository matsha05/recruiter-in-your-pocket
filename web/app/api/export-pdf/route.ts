import { NextRequest, NextResponse } from "next/server";
import { generatePdfBuffer } from "@/lib/backend/pdf";
import { getRequestId, routeLabel } from "@/lib/observability/requestContext";
import { hashForLogs, logError, logInfo, logWarn } from "@/lib/observability/logger";
import { rateLimitAsync } from "@/lib/security/rateLimit";
import { readJsonWithLimit } from "@/lib/security/requestBody";
import { normalizeReportForPdf, parsePdfExportRequest } from "@/lib/reports/pdf-export";
import { createSupabaseServerClient } from "@/lib/supabase/serverClient";
import { hasPdfExportAccess } from "@/lib/billing/entitlements";
import { isDevelopmentPaywallBypassEnabled } from "@/lib/billing/access";
import { parseTrustedStoredReport } from "@/lib/reports/report-trust";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const request_id = getRequestId(request);
  const { method, path } = routeLabel(request);
  const route = `${method} ${path}`;
  const startedAt = Date.now();
  logInfo({ msg: "http.request.started", request_id, route, method, path });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = await rateLimitAsync(`ip:${hashForLogs(ip)}:${path}`, 6, 60_000);
  if (!rl.ok) {
    const res = NextResponse.json({ ok: false, message: "Too many requests. Try again shortly." }, { status: 429 });
    res.headers.set("x-request-id", request_id);
    res.headers.set("retry-after", String(Math.ceil(rl.resetMs / 1000)));
    logWarn({
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
    const supabase = await createSupabaseServerClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();
    const user = authData.user;
    if (authError || !user) {
      const res = NextResponse.json(
        { ok: false, errorCode: "UNAUTHORIZED", message: "Sign in with a paid account to export a PDF." },
        { status: 401 },
      );
      res.headers.set("x-request-id", request_id);
      return res;
    }

    if (!isDevelopmentPaywallBypassEnabled()) {
      const { data: passes, error: passesError } = await supabase
        .from("passes")
        .select("tier, uses_remaining, expires_at, revoked_at")
        .eq("user_id", user.id);

      if (passesError) throw passesError;
      const canExportPdf = (passes || []).some((pass) => hasPdfExportAccess(pass));
      if (!canExportPdf) {
        const res = NextResponse.json(
          { ok: false, errorCode: "PAID_ACCESS_REQUIRED", message: "PDF export is included with paid access." },
          { status: 402 }
        );
        res.headers.set("x-request-id", request_id);
        return res;
      }
    }

    const body = await readJsonWithLimit<any>(request, 256 * 1024);
    const exportRequest = parsePdfExportRequest(body);
    if (!exportRequest) {
      const res = NextResponse.json(
        { ok: false, errorCode: "REPORT_ID_REQUIRED", message: "Choose a saved report and try exporting again." },
        { status: 400 },
      );
      res.headers.set("x-request-id", request_id);
      return res;
    }
    const { data: stored, error: reportError } = await supabase.from("reports")
      .select("report_json, evidence_version, evidence_json")
      .eq("id", exportRequest.report_id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (reportError) throw reportError;
    const trustedReport = stored
      ? parseTrustedStoredReport(stored.report_json, stored.evidence_version, stored.evidence_json, user.id)
      : null;
    const payload = trustedReport ? normalizeReportForPdf(trustedReport) : null;

    if (!payload) {
      const res = NextResponse.json(
        { ok: false, errorCode: "UNTRUSTED_REPORT", message: "We could not verify this saved report for export. Run a new report while signed in, or contact support." },
        { status: 409 }
      );
      res.headers.set("x-request-id", request_id);
      logInfo({
        msg: "http.request.completed",
        request_id,
        route,
        method,
        path,
        status: 409,
        latency_ms: Date.now() - startedAt,
        outcome: "validation_error"
      });
      return res;
    }

    const pdfBuffer = await generatePdfBuffer(payload);

    const res = new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="resume-review.pdf"',
        "x-request-id": request_id
      }
    });
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
    const status = Number(error?.httpStatus || 0) || 500;
    if (status !== 500) {
      const res = NextResponse.json(
        { ok: false, errorCode: error?.code || "INVALID_REQUEST", message: error?.message || "Invalid request" },
        { status }
      );
      res.headers.set("x-request-id", request_id);
      logInfo({
        msg: "http.request.completed",
        request_id,
        route,
        method,
        path,
        status,
        latency_ms: Date.now() - startedAt,
        outcome: "validation_error"
      });
      return res;
    }

    const message =
      typeof error?.message === "string" && (error.message.includes("timeout") || error.message.includes("Timeout"))
        ? "PDF took too long to generate. Try again."
        : "Could not create your PDF. Try exporting again.";

    logError({
      msg: "http.request.completed",
      request_id,
      route,
      method,
      path,
      status: 500,
      latency_ms: Date.now() - startedAt,
      outcome: "internal_error",
      err: { name: error?.name || "Error", message: error?.message || message, stack: error?.stack }
    });
    const res = NextResponse.json({ ok: false, errorCode: error?.code || "PDF_GENERATION_FAILED", message }, { status: 500 });
    res.headers.set("x-request-id", request_id);
    return res;
  }
}
