import { isExactAbsenceSentinel, resolveUniqueSourceLine } from "./source-fidelity";

export function ambiguousReportSourceLocators(report: any, sourceText: string) {
  const values: Array<{ path: string; value: unknown }> = [];
  (report?.top_fixes || []).forEach((fix: any, index: number) => {
    values.push({ path: `top_fixes[${index}].evidence.excerpt`, value: fix?.evidence?.excerpt });
  });
  (report?.rewrites || []).forEach((rewrite: any, index: number) => {
    values.push({ path: `rewrites[${index}].original`, value: rewrite?.original });
  });
  return values.flatMap(({ path, value }) => {
    if (typeof value !== "string" || !value.trim() || isExactAbsenceSentinel(value)) return [];
    return resolveUniqueSourceLine(value, sourceText).status === "ambiguous" ? [path] : [];
  });
}
