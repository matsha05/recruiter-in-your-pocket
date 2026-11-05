import { evidenceContainsRequirement, evidenceContainsRequirementLabel } from "./requirement-evidence";
import { supportsIndustrySignal } from "./source-industry-signals";
import { JobKeywordsSchema } from "../validation/resume-report-schema";

type KeywordMetadata = { matched: string[]; missing: string[]; match_count: number; total_count: number };

function validKeywordStructure(value: unknown): value is KeywordMetadata {
  return JobKeywordsSchema.safeParse(value).success;
}

export function isOptionalReportMetadataPath(path: string) {
  return /^job_alignment\.(?:jd_keywords\.(?:matched|missing)|role_fit\.industry_signals)\[\d+\]$/u.test(path);
}

// Optional display labels cannot justify publishing an unsupported claim, nor
// should they discard an otherwise useful, grounded report. Omit only labels
// that fail the same predicates used by the raw audit; never invent a fallback.
export function canonicalizeOptionalReportMetadata<T>(
  report: T,
  resumeText: string,
  options: { jobDescription?: string } = {},
): { report: T; changes: string[] } {
  if (!report || typeof report !== "object" || Array.isArray(report)) return { report, changes: [] };
  const copy = JSON.parse(JSON.stringify(report)) as any;
  const changes: string[] = [];
  const alignment = copy.job_alignment;
  if (!alignment || typeof alignment !== "object" || Array.isArray(alignment)) return { report: copy, changes };
  const keywords = alignment.jd_keywords;
  // Missing, malformed, duplicate, overlapping, or inconsistent metadata stays
  // intact so the structural contract can reject it. No-JD metadata keeps its
  // existing mandated-state validation rather than inferring input from prose.
  if (options.jobDescription?.trim() && validKeywordStructure(keywords)) {
    for (const kind of ["matched", "missing"] as const) {
      keywords[kind] = keywords[kind].filter((value: string, index: number) => {
        const inResume = evidenceContainsRequirement(value, resumeText);
        const inJob = evidenceContainsRequirementLabel(value, options.jobDescription!, { jobDescription: true });
        const supported = inJob && (kind === "matched" ? inResume : !inResume);
        if (!supported) changes.push(`job_alignment.jd_keywords.${kind}[${index}].omitted_unverified`);
        return supported;
      });
    }
    if (changes.length > 0) {
      keywords.match_count = keywords.matched.length;
      keywords.total_count = keywords.matched.length + keywords.missing.length;
      changes.push("job_alignment.jd_keywords.counts_recomputed");
    }
  }
  const industries = alignment.role_fit?.industry_signals;
  if (Array.isArray(industries) && industries.length <= 8 && industries.every((value) => typeof value === "string")) {
    alignment.role_fit.industry_signals = industries.filter((value: string, index: number) => {
      const supported = supportsIndustrySignal(value, resumeText);
      if (!supported) changes.push(`job_alignment.role_fit.industry_signals[${index}].omitted_unverified`);
      return supported;
    });
  }
  return { report: copy as T, changes };
}
