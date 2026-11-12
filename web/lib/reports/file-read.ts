/**
 * What came out of the file (Nov 11, 2026). Screening software and a recruiter's search work from the words in
 * a resume file, not its layout, so before a report is spent the upload screen says what was read: the contact
 * details, the sections, how many dated jobs, and any text that came out garbled. It is a set of plain facts
 * about this text. There is no score, and nothing here claims how any particular system behaves.
 *
 * Pure and deterministic: the same text gives the same findings, with no model call.
 */

export type FileReadFinding = {
  id: "email" | "phone" | "experience" | "education" | "skills" | "dates" | "garbled";
  /** `found`: it came through. `missing`: we looked and it isn't in the text. `problem`: something came out wrong. */
  state: "found" | "missing" | "problem";
  label: string;
  /** A short excerpt for a problem, so the person can find it in their file. */
  excerpt?: string;
};

/** Above the findings: what this list is, and what it is not. */
export const FILE_READ_NOTE = "Software that screens resumes, and a recruiter's search, work from the words in your file, not how it looks. This is what came out of yours.";

const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/iu;
// Ten or more digits with the usual separators; a year range or a zip code doesn't match.
const PHONE = /(?:\+?\d{1,3}[\s.-]?)?(?:\(\d{2,4}\)|\d{2,4})[\s.-]\d{3,4}[\s.-]\d{3,4}\b/u;
const HEADING = (words: string) => new RegExp(`^\\s*(?:${words})\\s*:?\\s*$`, "imu");
const EXPERIENCE = HEADING("(?:work |professional |relevant |employment )?experience|employment(?: history)?|work history|career history");
const EDUCATION = HEADING("education(?: (?:and|&) (?:training|certifications?))?|academic background");
const SKILLS = HEADING("(?:technical |core |key )?skills(?: (?:and|&) (?:tools|technologies|certifications?))?|core competencies|technologies");

const MONTH = "(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\\.?";
const POINT = `(?:${MONTH}\\s+\\d{4}|\\d{1,2}/\\d{4}|\\d{4})`;
const DATE_RANGE = new RegExp(`${POINT}\\s*(?:-|–|—|to)\\s*(?:${POINT}|present|current|now)`, "giu");

// Text that came out of the file wrong: the replacement character, a font's unmapped glyphs, or a word spelled
// out one letter at a time (a spaced-out heading), which no search matches.
const REPLACEMENT = /�/u;
const UNMAPPED = /\(cid:\d+\)/u;
const SPACED_WORD = /(?:^|\s)((?:[A-Za-z]\s){5,}[A-Za-z])(?=\s|$)/u;

function excerptAround(text: string, index: number, length: number) {
  const start = Math.max(0, index - 20);
  return text.slice(start, Math.min(text.length, index + length + 20)).replace(/\s+/gu, " ").trim();
}

export function fileReadFindings(text: string): FileReadFinding[] {
  const source = text ?? "";
  const findings: FileReadFinding[] = [];
  const has = (pattern: RegExp) => pattern.test(source);

  findings.push(has(EMAIL) ? { id: "email", state: "found", label: "An email address" } : { id: "email", state: "missing", label: "No email address" });
  findings.push(has(PHONE) ? { id: "phone", state: "found", label: "A phone number" } : { id: "phone", state: "missing", label: "No phone number" });
  findings.push(has(EXPERIENCE) ? { id: "experience", state: "found", label: "An Experience section" } : { id: "experience", state: "missing", label: "No Experience heading" });
  findings.push(has(EDUCATION) ? { id: "education", state: "found", label: "An Education section" } : { id: "education", state: "missing", label: "No Education heading" });
  findings.push(has(SKILLS) ? { id: "skills", state: "found", label: "A Skills section" } : { id: "skills", state: "missing", label: "No Skills heading" });

  const ranges = source.match(DATE_RANGE)?.length ?? 0;
  findings.push(ranges > 0
    ? { id: "dates", state: "found", label: ranges === 1 ? "1 dated job or course" : `${ranges} dated jobs or courses` }
    : { id: "dates", state: "missing", label: "No date ranges" });

  const replacement = source.match(REPLACEMENT);
  const unmapped = source.match(UNMAPPED);
  const spaced = source.match(SPACED_WORD);
  if (replacement?.index !== undefined) findings.push({ id: "garbled", state: "problem", label: "Some characters didn't come through", excerpt: excerptAround(source, replacement.index, 1) });
  else if (unmapped?.index !== undefined) findings.push({ id: "garbled", state: "problem", label: "Some characters didn't come through", excerpt: excerptAround(source, unmapped.index, unmapped[0].length) });
  else if (spaced?.index !== undefined) findings.push({ id: "garbled", state: "problem", label: "A word came out one letter at a time", excerpt: spaced[1].trim() });

  return findings;
}

/** The one-line summary for the upload screen: what to look at first, or that it all came through. */
export function fileReadSummary(findings: readonly FileReadFinding[]): { tone: "ok" | "look"; text: string } {
  const problem = findings.find((finding) => finding.state === "problem");
  if (problem) return { tone: "look", text: `${problem.label}. Check the text below.` };
  const missing = findings.filter((finding) => finding.state === "missing");
  // Past two, a sentence listing them all is harder to read than the list it sits above.
  if (missing.length > 2) return { tone: "look", text: `${missing.length} things we looked for aren't in the text. Check the list below.` };
  if (missing.length > 0) {
    const names = missing.map((finding) => finding.label.replace(/^No /u, "").replace(/ heading$/u, " heading"));
    const list = names.length === 1 ? names[0] : `${names.slice(0, -1).join(", ")} or ${names[names.length - 1]}`;
    return { tone: "look", text: `We didn't find ${/^[aeiou]/iu.test(list) ? "an" : "a"} ${list}. Check the text below.`.replace(/ a (date ranges)/u, " any $1") };
  }
  return { tone: "ok", text: "Everything we looked for came through." };
}
