/**
 * The text of a Word file, with its line breaks.
 *
 * mammoth's extractRawText drops a line break inside a paragraph (Shift+Enter, a `w:br`), so a heading typed
 * above a job with a soft return came out glued to it: "Professional ExperienceOpenAI, …" (live test,
 * November 12, 2026). The upload screen then said the resume had no Experience heading, and the report read
 * the two as one line. mammoth's HTML keeps the break as `<br />`, so the text is taken from that instead:
 * a break is a new line, a paragraph ends with a blank line, as extractRawText wrote it.
 */

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

function decodeEntities(text: string) {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/giu, (whole, body: string) => {
    if (body[0] === "#") {
      const code = body[1].toLowerCase() === "x" ? Number.parseInt(body.slice(2), 16) : Number.parseInt(body.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : whole;
    }
    return ENTITIES[body.toLowerCase()] ?? whole;
  });
}

/** mammoth's HTML as plain text: breaks and block ends become new lines, every tag goes, entities are decoded. */
export function htmlToResumeText(html: string): string {
  const text = (html ?? "")
    .replace(/<br\s*\/?>/giu, "\n")
    .replace(/<\/(?:p|h[1-6]|li|tr)>/giu, "\n\n")
    .replace(/<[^>]*>/gu, "");
  return decodeEntities(text)
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/u, ""))
    .join("\n")
    .replace(/\n{3,}/gu, "\n\n")
    .replace(/^\n+/u, "");
}

type Mammoth = {
  convertToHtml: (input: { buffer: Buffer }, options?: Record<string, unknown>) => Promise<{ value: string }>;
  images: { imgElement: (fn: () => Promise<{ src: string }>) => unknown };
};

export async function extractDocxText(mammoth: Mammoth, buffer: Buffer): Promise<string> {
  // Pictures are dropped unread; without this mammoth base64-encodes every one into the HTML.
  const result = await mammoth.convertToHtml({ buffer }, { convertImage: mammoth.images.imgElement(async () => ({ src: "" })) });
  return htmlToResumeText(result.value || "");
}
