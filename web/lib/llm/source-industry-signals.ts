import { canonicalizeUserSourceText } from "../security/inputSanitization";

const industryDefinitions: Array<{ label: string; pattern: RegExp }> = [
  { label: "SaaS", pattern: /\bsaas\b/iu },
  { label: "Healthcare", pattern: /\b(?:healthcare|hospital|patient|bluecross|blue shield)\b/iu },
  { label: "Financial services", pattern: /\b(?:fintech|financial services|banking|bank|jpmorgan)\b/iu },
  { label: "Retail", pattern: /\b(?:retail|costco)\b/iu },
  { label: "Logistics", pattern: /\b(?:logistics|supply chain)\b/iu },
  { label: "Manufacturing", pattern: /\b(?:manufacturing|manufacturer|kraft foods)\b/iu },
  { label: "Streaming", pattern: /\bstreaming\b/iu },
  { label: "Advertising", pattern: /\b(?:ads quality|advertising|ad platform)\b/iu },
  { label: "Education", pattern: /\b(?:elementary education|teacher|classroom|schoolwide|students?)\b/iu },
  { label: "Technology", pattern: /\b(?:cloud|software|technology|devops|machine learning|ai platform)\b/iu },
];

export function inferredIndustrySignals(sourceText: string) {
  const source = canonicalizeUserSourceText(sourceText);
  return industryDefinitions.filter(({ pattern }) => pattern.test(source)).map(({ label }) => label).slice(0, 4);
}

export function supportsInferredIndustrySignal(value: string, sourceText: string) {
  return inferredIndustrySignals(sourceText).some((label) => label.toLocaleLowerCase() === value.trim().toLocaleLowerCase());
}
