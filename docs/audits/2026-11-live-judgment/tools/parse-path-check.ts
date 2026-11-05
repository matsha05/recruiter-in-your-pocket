/**
 * The parse path, with no model: what /api/parse-resume and the request validator do with an image-only
 * PDF (a scan with no text layer) and a cover letter. Modeled on web/tests/parse-resume.test.ts. Run from web/:
 *
 *   node scripts/run-ts-test.cjs ../docs/audits/2026-11-live-judgment/tools/parse-path-check.ts
 */
import fs from "node:fs";
import Module from "node:module";
import path from "node:path";
import { NextRequest } from "next/server";

type RuntimeModule = typeof Module & { _load: (request: string, parent: NodeModule | null, isMain: boolean) => unknown };

const here = path.resolve(__dirname);
const resumes = path.join(here, "..", "resumes");
const outDir = path.join(here, "..", "outputs");
const webRoot = process.cwd();

async function main() {
  const runtimeModule = Module as RuntimeModule;
  const originalLoad = runtimeModule._load;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error("The parse path must not use the network"); };
  runtimeModule._load = function (request, parent, isMain) {
    if (request === "@/lib/security/rateLimit") return { rateLimitAsync: async () => ({ ok: true, resetMs: 0 }) };
    if (request.startsWith("@/")) return originalLoad(path.join(webRoot, request.slice(2)), parent, isMain);
    return originalLoad(request, parent, isMain);
  };
  const results: Record<string, unknown> = {};
  try {
    const { POST } = require(path.join(webRoot, "app/api/parse-resume/route")) as { POST: (request: Request) => Promise<Response> };
    const { validateResumeFeedbackRequest } = require(path.join(webRoot, "lib/backend/validation"));
    async function upload(bytes: Buffer, name: string, type: string) {
      const form = new FormData();
      form.set("file", new File([new Uint8Array(bytes)], name, { type }));
      const response = await POST(new NextRequest("https://parse-path.example.test/api/parse-resume", {
        method: "POST", body: form, headers: { "x-forwarded-for": "127.0.0.1" },
      }));
      const body = await response.json();
      return { status: response.status, body };
    }

    const scanned = await upload(fs.readFileSync(path.join(resumes, "p1_scanned_no_text_layer.pdf")), "scanned-resume.pdf", "application/pdf");
    results.scanned_pdf_no_text_layer = { parse_route: scanned };

    const cover = fs.readFileSync(path.join(resumes, "p2_cover_letter_not_a_resume.txt"), "utf8");
    const coverUpload = await upload(Buffer.from(cover, "utf8"), "cover-letter.txt", "text/plain");
    const coverRequest = validateResumeFeedbackRequest({ text: cover, mode: "resume" });
    results.cover_letter = {
      chars: cover.length,
      parse_route: coverUpload,
      request_validation: coverRequest.ok ? { ok: true, note: "accepted; the next step would be a paid model call and the free report" } : coverRequest,
    };

    const cv = fs.readFileSync(path.join(resumes, "h4a_academic_cv_15_pages.txt"), "utf8");
    results.academic_cv_over_cap = { chars: cv.length, request_validation: validateResumeFeedbackRequest({ text: cv, mode: "resume" }) };
    const cvUpload = await upload(Buffer.from(cv, "utf8"), "cv.txt", "text/plain");
    results.academic_cv_over_cap.parse_route = { status: cvUpload.status, body: { ...cvUpload.body, text: typeof cvUpload.body.text === "string" ? `${cvUpload.body.text.length} chars` : undefined } };
  } finally {
    runtimeModule._load = originalLoad;
    globalThis.fetch = originalFetch;
  }
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "parse-path-check.json"), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
