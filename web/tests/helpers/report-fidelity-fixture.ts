export const hubspotSource = "Built customer workflows in HubSpot.";
export const hubspotJobDescription = "The role requires HubSpot and customer count reporting.";

const reviewItem = {
  grade: "B",
  priority: "medium",
  working: "The workflow is readable.",
  missing: "The customer count is missing.",
  fix: "Add customer count.",
};

export const schemaValidReport = {
  contract_version: "v2",
  score: 72,
  score_label: "Clear story",
  score_comment_short: "HubSpot workflow context is visible.",
  score_comment_long: "HubSpot workflow context is visible. The customer context needs detail.",
  score_plain: "HubSpot work is visible.",
  first_impression: "HubSpot workflow context is visible.",
  biggest_gap_example: "“Built customer workflows in HubSpot.” needs customer count.",
  first_impression_takeaway: "HubSpot context reads clearly",
  summary: "HubSpot workflow context is visible. The customer context needs detail. The next edit can clarify scope.",
  strengths: ["HubSpot appears on the page.", "The workflow context is readable.", "The customer focus is visible."],
  gaps: ["The customer count is missing.", "The workflow scope needs detail.", "The result needs context."],
  rewrites: [],
  top_fixes: [{
    fix: "Add customer count to the customer bullet.",
    why: "The customer scope is not explicit.",
    confidence: "high",
    evidence: { excerpt: hubspotSource, section: "Experience" },
    impact_level: "high",
    effort: "quick",
    section_ref: "Work Experience",
  }],
  next_steps: ["Add customer count.", "Add workflow scope.", "Add customer context."],
  subscores: { impact: 72, clarity: 72, story: 72, readability: 72 },
  section_review: {
    Summary: reviewItem,
    "Work Experience": reviewItem,
    Skills: reviewItem,
    Education: reviewItem,
  },
  job_alignment: {
    jd_match_score: 72,
    jd_match_summary: "HubSpot workflow work is visible.",
    jd_keywords: { matched: ["HubSpot"], missing: ["customer count"], match_count: 1, total_count: 2 },
    strongly_aligned: ["HubSpot workflow context is visible.", "The customer focus is visible.", "The workflow work is readable."],
    underplayed: ["The customer count needs context.", "The workflow scope needs context."],
    missing: ["The result needs context."],
    role_fit: {
      best_fit_roles: ["HubSpot", "Customer", "Workflows"],
      stretch_roles: ["HubSpot"],
      seniority_read: "Senior",
      industry_signals: ["HubSpot"],
      company_stage_fit: "Company",
    },
    positioning_suggestion: "Keep HubSpot workflow context visible.",
  },
  ideas: {
    questions: Array.from({ length: 5 }, () => ({
      question: "What customer count can you verify?",
      archetype: "SCALING",
      why: "The answer adds context.",
    })),
  },
};

export const unsafePublicClaim = "Salesforce Administrator";

export const renderedClaimProbe = {
  score_comment_short: unsafePublicClaim,
  first_impression: unsafePublicClaim,
  summary: unsafePublicClaim,
  first_impression_takeaway: unsafePublicClaim,
  biggest_gap_example: unsafePublicClaim,
  strengths: [unsafePublicClaim],
  gaps: [unsafePublicClaim],
  top_fixes: [{
    fix: unsafePublicClaim,
    why: unsafePublicClaim,
    evidence: { excerpt: hubspotSource, section: unsafePublicClaim },
    section_ref: unsafePublicClaim,
  }],
  rewrites: [{
    original: hubspotSource,
    better: hubspotSource,
    label: unsafePublicClaim,
    enhancement_note: unsafePublicClaim,
  }],
  ideas: { questions: [{ question: unsafePublicClaim, why: unsafePublicClaim }] },
  job_alignment: {
    jd_match_summary: unsafePublicClaim,
    jd_keywords: { matched: [unsafePublicClaim], missing: [unsafePublicClaim] },
    positioning_suggestion: unsafePublicClaim,
    role_fit: {
      best_fit_roles: [unsafePublicClaim],
      stretch_roles: [unsafePublicClaim],
      seniority_read: unsafePublicClaim,
    },
  },
};

export const auditedPublicNarrativePaths = [
  "score_comment_short",
  "first_impression",
  "summary",
  "first_impression_takeaway",
  "biggest_gap_example",
  "strengths[0]",
  "gaps[0]",
  "top_fixes[0].fix",
  "top_fixes[0].why",
  "top_fixes[0].evidence.section",
  "top_fixes[0].section_ref",
  "rewrites[0].label",
  "rewrites[0].enhancement_note",
  "ideas.questions[0].question",
  "ideas.questions[0].why",
  "job_alignment.jd_match_summary",
  "job_alignment.jd_keywords.matched[0]",
  "job_alignment.jd_keywords.missing[0]",
  "job_alignment.positioning_suggestion",
  "job_alignment.role_fit.best_fit_roles[0]",
  "job_alignment.role_fit.stretch_roles[0]",
  "job_alignment.role_fit.seniority_read",
] as const;
