import { NextResponse } from "next/server";
import mammoth from "mammoth";
import pdfParse from "pdf-parse";

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
  try {
    const incoming = await request.formData();
    const file = incoming.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ ok: false, errorCode: "NO_FILE", message: "No file provided." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { ok: false, errorCode: "FILE_TOO_LARGE", message: "File is too large. Max 10MB." },
        { status: 400 }
      );
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
      return NextResponse.json(
        {
          ok: false,
          errorCode: "UNSUPPORTED_FILE_TYPE",
          message: "Only PDF and DOCX files are supported.",
          details: { fileName: file.name, fileType: file.type || "unknown" }
        },
        { status: 400 }
      );
    }

    extractedText = cleanExtractedText(extractedText);

    if (!extractedText || extractedText.length < 50) {
      return NextResponse.json(
        {
          ok: false,
          errorCode: "EXTRACTION_EMPTY",
          message: "Could not extract enough text from the file. Try pasting your resume text directly."
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, text: extractedText, fileName: file.name });
  } catch (err: any) {
    console.error("[parse-resume] error:", err?.message);
    return NextResponse.json(
      { ok: false, errorCode: "PARSE_ERROR", message: "Something went wrong while processing your file." },
      { status: 500 }
    );
  }
}






