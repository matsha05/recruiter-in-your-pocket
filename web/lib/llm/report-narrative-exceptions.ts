const structuralReportVocabulary = {
  section: new Set([
    "Certifications", "Education", "Experience", "Header", "Professional Experience", "Projects",
    "Resume", "Skills", "Summary", "Work Experience",
  ]),
  rewriteLabel: new Set([
    "Clarity", "Impact", "Ownership", "Positioning", "Readability", "Results", "Scope",
    "Specificity", "Structure",
  ]),
  seniority: new Set([
    "Director", "Entry", "Entry level", "Executive", "Junior", "Lead", "Manager",
    "Mid level", "Mid-level", "Not clear", "Senior", "Unclear",
  ]),
  companyStage: new Set([
    "Any stage", "Company", "Early stage", "Enterprise", "Growth stage", "Scale-up", "Startup", "Unclear",
  ]),
};

function isExactNoJobDescriptionState(report: any, path: string, value: string, jobDescription?: string) {
  if (jobDescription?.trim()) return false;
  const alignment = report?.job_alignment;
  const keywords = alignment?.jd_keywords;
  const mandated = alignment?.jd_match_score === 0
    && alignment?.jd_match_summary === "No job description provided."
    && Array.isArray(keywords?.matched) && keywords.matched.length === 0
    && Array.isArray(keywords?.missing) && keywords.missing.length === 0
    && keywords?.match_count === 0 && keywords?.total_count === 0;
  if (!mandated) return false;
  if (path === "job_alignment.jd_match_summary") return value === "No job description provided.";
  return path === "job_alignment.missing[0]"
    && value === "No target-role requirements were provided for comparison"
    && alignment.missing?.length === 1;
}

function isAllowedStructuralValue(path: string, value: string) {
  const normalized = value.normalize("NFC").trim().replace(/\s+/gu, " ");
  if (/^top_fixes\[\d+\]\.(?:evidence\.section|section_ref)$/u.test(path)) {
    return structuralReportVocabulary.section.has(normalized);
  }
  if (/^rewrites\[\d+\]\.label$/u.test(path)) return structuralReportVocabulary.rewriteLabel.has(normalized);
  if (path === "job_alignment.role_fit.seniority_read") return structuralReportVocabulary.seniority.has(normalized);
  if (path === "job_alignment.role_fit.company_stage_fit") return structuralReportVocabulary.companyStage.has(normalized);
  return false;
}

function isCanonicalAbsentSectionInstruction(report: any, path: string, value: string) {
  const section = path.match(/^section_review\.(Summary|Skills|Education)\.fix$/u)?.[1];
  if (!section) return false;
  const item = report?.section_review?.[section];
  const expectedMissing = `No ${section.toLocaleLowerCase()} section present`;
  const expectedFix = section === "Education"
    ? "Add only if it supports the target role or removes a stated requirement question."
    : "Add only if it helps the role story.";
  return item?.missing === expectedMissing && value === expectedFix;
}

export function isAllowedReportNarrativeException(
  report: any,
  path: string,
  value: string,
  jobDescription?: string,
) {
  return isExactNoJobDescriptionState(report, path, value, jobDescription)
    || isCanonicalAbsentSectionInstruction(report, path, value)
    || isAllowedStructuralValue(path, value);
}
