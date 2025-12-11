import { NextRequest, NextResponse } from "next/server";
import { generatePdfBuffer, validateReportForPdf } from "@/lib/backend/pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    let body: any = null;
    try {
      body = await request.json();
    } catch {
      body = null;
    }
    const payload = body?.report || body || {};

    if (!validateReportForPdf(payload)) {
      return NextResponse.json(
        { ok: false, errorCode: "INVALID_PAYLOAD", message: "Report data is incomplete. Try exporting again." },
        { status: 400 }
      );
    }

    const pdfBuffer = await generatePdfBuffer(payload);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="resume-review.pdf"'
      }
    });
  } catch (error: any) {
    console.error("API /export-pdf error:", error);
    const message =
      typeof error?.message === "string" && (error.message.includes("timeout") || error.message.includes("Timeout"))
        ? "PDF took too long to generate. Try again."
        : "Failed to generate PDF";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
