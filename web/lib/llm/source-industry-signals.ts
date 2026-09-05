import { canonicalizeUserSourceText } from "../security/inputSanitization";

const industryDefinitions: Array<{ label: string; pattern: RegExp }> = [
  { label: "Staffing", pattern: /\b(?:staffing agenc(?:y|ies)|recruitment agenc(?:y|ies)|temporary[- ]to[- ]hire|salaried professionals service)\b/iu },
  { label: "SaaS", pattern: /\bsaas\b/iu },
  { label: "Healthcare", pattern: /\b(?:healthcare|hospital|patient|bluecross|blue shield)\b/iu },
  { label: "Financial services", pattern: /\b(?:fintech|financial services|jpmorgan)\b/iu },
  { label: "Retail", pattern: /\b(?:retail|costco)\b/iu },
  { label: "Logistics", pattern: /\b(?:(?:logistics|supply chain) (?:company|provider|industry|sector)|(?:company|provider|industry|sector) (?:in|for) (?:logistics|supply chain))\b/iu },
  { label: "Manufacturing", pattern: /\b(?:manufacturing|manufacturer|kraft foods)\b/iu },
  { label: "Telecommunications", pattern: /\b(?:telecommunications|telecom|Cingular Wireless|Verizon|T-Mobile)\b/iu },
  { label: "Publishing", pattern: /\b(?:publishing (?:company|industry|house)|publication services|book publisher)\b/iu },
  { label: "Streaming", pattern: /\bstreaming\b/iu },
  { label: "Advertising", pattern: /\b(?:ads quality|advertising|ad platform)\b/iu },
  { label: "Education", pattern: /\b(?:elementary education|teacher|classroom|schoolwide|students?)\b/iu },
  { label: "Technology", pattern: /\b(?:(?:cloud|software|technology) (?:company|companies|provider|vendor|industry|sector)|cloud sales|software engineering (?:hiring|recruiting)|enterprise software sales|ai platform)\b/iu },
];

export function inferredIndustrySignals(sourceText: string) {
  const source = canonicalizeUserSourceText(sourceText);
  return industryDefinitions.filter(({ pattern }) => pattern.test(source)).map(({ label }) => label).slice(0, 4);
}

export function supportsInferredIndustrySignal(value: string, sourceText: string) {
  const definition = industryDefinitions.find(({ label }) => label.toLocaleLowerCase() === value.trim().toLocaleLowerCase());
  return Boolean(definition?.pattern.test(canonicalizeUserSourceText(sourceText)));
}
