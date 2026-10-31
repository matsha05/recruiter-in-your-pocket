import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import Module from "node:module";
import path from "node:path";
import { NextRequest } from "next/server";

type RuntimeModule = typeof Module & {
  _load: (request: string, parent: NodeModule | null, isMain: boolean) => unknown;
};

const fixtureDirectory = path.join(__dirname, "fixtures", "resume-upload");
const normalize = (text: string) => text.replace(/\s+/gu, " ").trim();

async function run() {
  const source = fs.readFileSync(path.join(fixtureDirectory, "synthetic-resume.txt"), "utf8");
  const pdf = fs.readFileSync(path.join(fixtureDirectory, "synthetic-resume.pdf"));
  const docx = fs.readFileSync(path.join(fixtureDirectory, "synthetic-resume.docx"));
  assert.equal(createHash("sha256").update(pdf).digest("hex"), "504231a48d80a4af41c5d06c69c1339d797ee42093cb83accee65aa9d9c52535");
  assert.equal(createHash("sha256").update(docx).digest("hex"), "8e2ded04212874bbd212990a4a7b5e9b5cb0a6dc05e7cc6a957e21e979ffb241");

  // Keep Next.js, multipart decoding, pdf-parse, and mammoth real. Only bypass
  // external rate-limit storage; no model or provider calls belong in this test.
  const runtimeModule = Module as RuntimeModule;
  const originalLoad = runtimeModule._load;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error("Resume upload regression must not use the network"); };
  runtimeModule._load = function (request, parent, isMain) {
    if (request === "@/lib/security/rateLimit") return { rateLimitAsync: async () => ({ ok: true, resetMs: 0 }) };
    if (request.startsWith("@/")) return originalLoad(path.join(__dirname, "..", request.slice(2)), parent, isMain);
    return originalLoad(request, parent, isMain);
  };

  try {
    const { POST } = require("../app/api/parse-resume/route") as { POST: (request: Request) => Promise<Response> };
    async function upload(bytes: Buffer, name: string, type: string) {
      const form = new FormData();
      form.set("file", new File([new Uint8Array(bytes)], name, { type }));
      const response = await POST(new NextRequest("https://resume-upload.example.test/api/parse-resume", {
        method: "POST", body: form, headers: { "x-forwarded-for": "127.0.0.1" },
      }));
      assert.ok(response.headers.get("x-request-id"), "all upload responses retain request correlation");
      return { response, body: await response.json() };
    }

    async function assertExtracted(bytes: Buffer, name: string, type: string, label: string) {
      const { response, body } = await upload(bytes, name, type);
      assert.equal(response.status, 200, `${label}: ${body.errorCode || "unexpected response"}`);
      assert.equal(body.ok, true, label);
      assert.equal(body.fileName, name, label);
      assert.equal(normalize(body.text), normalize(source), `${label}: source text must survive extraction`);
    }

    const pdfUpload = (label: string, type = "application/pdf") => assertExtracted(pdf, "synthetic.pdf", type, label);
    await pdfUpload("valid PDF in a cold route process");
    await assertExtracted(docx, "synthetic.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "DOCX control");
    await pdfUpload("repeated PDF");
    await Promise.all([1, 2, 3].map((index) => pdfUpload(`concurrent PDF ${index}`)));

    for (const [name, bytes] of [
      ["corrupt.pdf", Buffer.from("%PDF-1.3\nThis is not a valid PDF.\n%%EOF")],
      ["truncated.pdf", pdf.subarray(0, 100)],
    ] as const) {
      const { response, body } = await upload(bytes, name, "application/pdf");
      assert.equal(response.status, 500, `${name}: existing unreadable-file status is preserved`);
      assert.equal(body.ok, false, name);
      assert.equal(body.errorCode, "PARSE_ERROR", name);
      assert.equal(body.text, undefined, `${name}: rejected files must not return extracted text`);
    }

    await pdfUpload("valid PDF after rejected files");
    await pdfUpload("PDF identified by extension", "application/octet-stream");
    console.log("Resume upload regression passed: real PDF/DOCX extraction, repeated and concurrent uploads, corrupt/truncated rejection.");
  } finally {
    runtimeModule._load = originalLoad;
    globalThis.fetch = originalFetch;
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
