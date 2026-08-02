const allowedPlaceholderWords = new Set([
  "a", "adoption", "after", "and", "artifact", "baseline", "before", "budget", "campaign",
  "change", "completed", "count", "customer", "cycle", "degree", "detail", "function", "functions",
  "hire", "hires", "impact", "improvement", "increase", "kpi", "lane", "leadership", "length",
  "level", "measurable", "metric", "missing", "named", "number", "of", "onboarding", "outcome",
  "ownership", "pain", "point", "product", "program", "quota", "rate", "recruitment", "result",
  "retention", "revenue", "role", "school", "scope", "size", "specific", "target", "team", "teams",
  "time", "timeframe", "university", "user", "verified", "year",
]);

export function unsupportedBracketPayloads(value: string) {
  return Array.from(value.matchAll(/\[([^\]]+)\]/gu), (match) => match[1].trim()).filter((payload) => {
    if (!payload || /[\d$€£¥₹%]/u.test(payload)) return true;
    const words = payload.toLowerCase().match(/[a-z]+/gu) || [];
    return words.length === 0 || words.length > 7 || words.some((word) => !allowedPlaceholderWords.has(word));
  });
}
