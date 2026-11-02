/**
 * Sentences in generated report prose.
 *
 * A sentence ends at ".", "!" or "?" followed by a space or the end of the text.
 * A decimal ("6.5%", "$3.2M") has no space after its point, and an initialism
 * ("P.E.", "U.S.", "e.g.") is kept whole, so neither starts a new sentence. The
 * summary cap once read "Your Ohio P.E. license" as two sentences and cut the
 * summary's last two.
 */
const INITIALISM = /\b(?:\p{L}\.){2,}/gu;
const PROTECTED_POINT = "";

export function reportSentences(value: string): string[] {
  return value
    .replace(INITIALISM, (match) => match.replaceAll(".", PROTECTED_POINT))
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.replaceAll(PROTECTED_POINT, ".").trim())
    .filter(Boolean);
}
