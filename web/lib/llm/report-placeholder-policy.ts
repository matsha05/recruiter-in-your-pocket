const safeNeutralPlaceholders = new Set([
  "adoption rate", "adoption result", "application scope", "baseline", "budget", "budget size",
  "campaign scope", "completed artifact", "conversion rate", "customer count", "cycle time",
  "cycle-time change", "cycle-time improvement", "degree", "functions", "impact metric", "kpi change",
  "leadership scope", "measurable result", "missing scope", "number of hires", "onboarding retention rate",
  "ownership detail", "pain point", "program length", "quota result", "recruitment cycle time",
  "result", "retention increase", "retention metric", "school", "specific scope", "target product lane",
  "target role", "target role level", "team count", "team size", "teams", "timeframe", "tool name",
  "university", "verified before-and-after result", "verified outcome", "verified result", "year",
]);

function normalizePlaceholder(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase()
    .replace(/[\u2010-\u2015\u2212]/gu, "-")
    .replace(/\s+/gu, " ")
    .trim();
}

export function unsupportedBracketPayloads(value: string) {
  return Array.from(value.matchAll(/\[([^\]]+)\]/gu), (match) => match[1].trim())
    .filter((payload) => !safeNeutralPlaceholders.has(normalizePlaceholder(payload)));
}
