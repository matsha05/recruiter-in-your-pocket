/**
 * A PDF's text as a reader wrote it, not as the page wrapped it.
 *
 * pdf-parse returns one line per line drawn on the page. A bullet too long for one line comes back as two, and the
 * report then quoted half a bullet: "Cut average dock-to-truck time from 52 minutes to 31 minutes by redesigning
 * wave planning and moving" (live walk, November 17, 2026, every card on a PDF resume). It also joins text set on
 * one line without a space, so a right-aligned date runs into the title: "Columbus, OHApril 2021 – Present".
 *
 * Two repairs, both conservative: a line that ran to the right margin is joined to the next when the next starts
 * the way a continuation does (lowercase, a digit, a bracket or a percent), never with a bullet or a capital; and a
 * date glued to the word before it gets its space back.
 */

const MONTH = "(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|June?|July?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)";
const GLUED_MONTH_DATE = new RegExp(`(\\p{L}|[.,)])(${MONTH}\\.?\\s+(?:19|20)\\d{2})`, "gu");
const GLUED_YEAR_RANGE = /(\p{L}|[.,)])((?:19|20)\d{2}\s*[–—-]\s*(?:(?:19|20)\d{2}|Present|Current|Now)\b)/gu;
const BULLET = /^[•▪●◦‣∙·*–—-]\s/u;
/** How a wrapped line's second half starts: a lowercase word, a number, an opening bracket, a percent or ampersand. */
const CONTINUATION_START = /^(?:\p{Ll}|\d|[(%&$])/u;
const DATE_LINE = new RegExp(`^(?:${MONTH}\\.?\\s+)?(?:19|20)\\d{2}\\b`, "u");

function percentile(values: number[], p: number) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(p * (sorted.length - 1)))];
}

export function separateGluedDates(text: string): string {
  return text.replace(GLUED_MONTH_DATE, "$1 $2").replace(GLUED_YEAR_RANGE, "$1 $2");
}

export function rejoinWrappedLines(text: string): string {
  const lines = text.split("\n");
  const bodyLengths = lines.map((line) => line.trim().length).filter((length) => length >= 30);
  // A line "ran to the margin" when it is about as long as the page's long lines. Without enough long lines to
  // judge by, nothing is joined.
  if (bodyLengths.length < 3) return text;
  const fullWidth = percentile(bodyLengths, 0.75);
  const out: string[] = [];
  for (const line of lines) {
    const previous = out[out.length - 1];
    const trimmed = line.trim();
    const joins = previous !== undefined
      && previous.trim().length >= Math.max(40, fullWidth * 0.8)
      && trimmed.length > 0
      && CONTINUATION_START.test(trimmed)
      && !BULLET.test(trimmed)
      && !DATE_LINE.test(trimmed);
    if (joins) out[out.length - 1] = `${previous.replace(/\s+$/u, "")} ${trimmed}`;
    else out.push(line);
  }
  return out.join("\n");
}

/** Both repairs, in the order they need: the space first, so a date line is never read as a continuation. */
export function tidyPdfText(text: string): string {
  return rejoinWrappedLines(separateGluedDates(text));
}
