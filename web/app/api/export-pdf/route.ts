import { NextRequest, NextResponse } from "next/server";
import { generatePdfBuffer, validateReportForPdf } from "@/lib/backend/pdf";
import { getRequestId, routeLabel } from "@/lib/observability/requestContext";
import { hashForLogs, logError, logInfo } from "@/lib/observability/logger";
import { rateLimit } from "@/lib/security/rateLimit";
import { readJsonWithLimit } from "@/lib/security/requestBody";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const request_id = getRequestId(request);
  const { method, path } = routeLabel(request);
  const route = `${method} ${path}`;
  const startedAt = Date.now();
  logInfo({ msg: "http.request.started", request_id, route, method, path });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = rateLimit(`ip:${hashForLogs(ip)}:${path}`, 6, 60_000);
  if (!rl.ok) {
    const res = NextResponse.json({ ok: false, message: "Too many requests. Try again shortly." }, { status: 429 });
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
    const body = await readJsonWithLimit<any>(request, 256 * 1024);
    const payload = body?.report || body || {};

    if (!validateReportForPdf(payload)) {
      const res = NextResponse.json(
        { ok: false, errorCode: "INVALID_PAYLOAD", message: "Report data is incomplete. Try exporting again." },
        { status: 400 }
      );
      res.headers.set("x-request-id", request_id);
      logInfo({
        msg: "http.request.completed",
        request_id,
        route,
        method,
        path,
        status: 400,
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
        : "Failed to generate PDF";

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
    const res = NextResponse.json({ ok: false, message }, { status: 500 });
    res.headers.set("x-request-id", request_id);
    return res;
  }
}
