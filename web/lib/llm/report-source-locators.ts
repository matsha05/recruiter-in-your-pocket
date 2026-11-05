import { isExactAbsenceSentinel, resolveUniqueSourceLine } from "./source-fidelity";

// A fix about text the resume repeats ("correct the repeated citation") points at that repetition; the
// excerpt is then expected on more than one line, and the first occurrence is where the reader starts.
const aboutRepetition = /\b(?:repeat(?:s|ed|ing)?|repetition|duplicat(?:e|es|ed|ion)|more than once|several times|twice|same (?:line|entry|title|bullet)\b)/iu;

export function ambiguousReportSourceLocators(report: any, sourceText: string) {
  const values: Array<{ path: string; value: unknown; fix?: unknown }> = [];
  (report?.top_fixes || []).forEach((fix: any, index: number) => {
    values.push({ path: `top_fixes[${index}].evidence.excerpt`, value: fix?.evidence?.excerpt, fix: fix?.fix });
  });
  (report?.rewrites || []).forEach((rewrite: any, index: number) => {
    values.push({ path: `rewrites[${index}].original`, value: rewrite?.original });
  });
  return values.flatMap(({ path, value, fix }) => {
    if (typeof value !== "string" || !value.trim() || isExactAbsenceSentinel(value)) return [];
    if (resolveUniqueSourceLine(value, sourceText).status !== "ambiguous") return [];
    return typeof fix === "string" && aboutRepetition.test(fix) ? [] : [path];
  });
}
