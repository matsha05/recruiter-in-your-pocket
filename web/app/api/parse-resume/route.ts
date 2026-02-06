import { NextResponse } from "next/server";
import mammoth from "mammoth";
import pdfParse from "pdf-parse";
import { getRequestId, routeLabel } from "@/lib/observability/requestContext";
import { hashForLogs, logError, logInfo, logWarn } from "@/lib/observability/logger";
import { rateLimitAsync } from "@/lib/security/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function cleanExtractedText(text: string) {
  return String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function detectFileKind(file: File): "pdf" | "docx" | null {
  const type = (file.type || "").toLowerCase().trim();
  const name = (file.name || "").toLowerCase().trim();

  // Some sources (Google Drive, some browsers) send empty or generic types
  const generic = !type || type === "application/octet-stream";

  const isPdf =
    type === "application/pdf" ||
    type === "application/x-pdf" ||
    (generic && name.endsWith(".pdf"));

  const isDocx =
    type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    (generic && name.endsWith(".docx"));

  if (isPdf) return "pdf";
  if (isDocx) return "docx";
  return null;
}

export async function POST(request: Request) {
  const request_id = getRequestId(request);
  const { method, path } = routeLabel(request);
  const route = `${method} ${path}`;
  const startedAt = Date.now();
  logInfo({ msg: "http.request.started", request_id, route, method, path });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = await rateLimitAsync(`ip:${hashForLogs(ip)}:${path}`, 30, 60_000);
  if (!rl.ok) {
    const res = NextResponse.json({ ok: false, errorCode: "RATE_LIMITED", message: "Too many requests. Try again shortly." }, { status: 429 });
    res.headers.set("x-request-id", request_id);
    res.headers.set("retry-after", String(Math.ceil(rl.resetMs / 1000)));
    logWarn({ msg: "http.request.completed", request_id, route, method, path, status: 429, latency_ms: Date.now() - startedAt, outcome: "rate_limited" });
    return res;
  }

  try {
    const incoming = await request.formData();
    const file = incoming.get("file");

    if (!file || !(file instanceof File)) {
      const res = NextResponse.json({ ok: false, errorCode: "NO_FILE", message: "No file provided." }, { status: 400 });
      res.headers.set("x-request-id", request_id);
      logInfo({ msg: "http.request.completed", request_id, route, method, path, status: 400, latency_ms: Date.now() - startedAt, outcome: "validation_error" });
      return res;
    }

    if (file.size > MAX_FILE_SIZE) {
      const res = NextResponse.json(
        { ok: false, errorCode: "FILE_TOO_LARGE", message: "File is too large. Max 10MB." },
        { status: 400 }
      );
      res.headers.set("x-request-id", request_id);
      logInfo({ msg: "http.request.completed", request_id, route, method, path, status: 400, latency_ms: Date.now() - startedAt, outcome: "validation_error" });
      return res;
    }

    const kind = detectFileKind(file);
    const buffer = Buffer.from(await file.arrayBuffer());

    let extractedText = "";

    if (kind === "pdf") {
      const pdfData: any = await (pdfParse as any)(buffer);
      extractedText = pdfData?.text || "";
    } else if (kind === "docx") {
      const docxResult = await mammoth.extractRawText({ buffer });
      extractedText = docxResult.value || "";
    } else {
      const res = NextResponse.json(
        {
          ok: false,
          errorCode: "UNSUPPORTED_FILE_TYPE",
          message: "Only PDF and DOCX files are supported.",
          details: { fileName: file.name, fileType: file.type || "unknown" }
        },
        { status: 400 }
      );
      res.headers.set("x-request-id", request_id);
      logInfo({ msg: "http.request.completed", request_id, route, method, path, status: 400, latency_ms: Date.now() - startedAt, outcome: "validation_error" });
      return res;
    }

    extractedText = cleanExtractedText(extractedText);

    if (!extractedText || extractedText.length < 50) {
      const res = NextResponse.json(
        {
          ok: false,
          errorCode: "EXTRACTION_EMPTY",
          message: "Could not extract enough text from the file. Try pasting your resume text directly."
        },
        { status: 400 }
      );
      res.headers.set("x-request-id", request_id);
      logInfo({ msg: "http.request.completed", request_id, route, method, path, status: 400, latency_ms: Date.now() - startedAt, outcome: "validation_error" });
      return res;
    }

    const res = NextResponse.json({ ok: true, text: extractedText, fileName: file.name });
    res.headers.set("x-request-id", request_id);
    logInfo({ msg: "http.request.completed", request_id, route, method, path, status: 200, latency_ms: Date.now() - startedAt, outcome: "success" });
    return res;
  } catch (err: any) {
    logError({
      msg: "http.request.completed",
      request_id,
      route,
      method,
      path,
      status: 500,
      latency_ms: Date.now() - startedAt,
      outcome: "internal_error",
      err: { name: err?.name || "Error", message: err?.message || "Parse error", stack: err?.stack }
    });
    const res = NextResponse.json(
      { ok: false, errorCode: "PARSE_ERROR", message: "Something went wrong while processing your file." },
      { status: 500 }
    );
    res.headers.set("x-request-id", request_id);
    return res;
  }
}



