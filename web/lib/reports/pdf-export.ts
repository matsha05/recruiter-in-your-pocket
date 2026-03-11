export type ReportForPdf = {
  score: number;
  summary: string;
  strengths: string[];
  gaps: string[];
  rewrites: Array<{ label?: string; original: string; better: string; enhancement_note?: string }>;
  next_steps: string[];
  score_label?: string;
  score_comment_short?: string;
  generated_on?: string;
  missing_wins?: string[];
  subscores?: { impact?: number; clarity?: number; story?: number; readability?: number };
  top_fixes?: Array<{ fix?: string; text?: string; why?: string }>;
  job_alignment?: {
    positioning_suggestion?: string;
    role_fit?: {
      best_fit_roles?: string[];
      stretch_roles?: string[];
      seniority_read?: string;
      industry_signals?: string[];
      company_stage_fit?: string;
    };
  };
};

function clampScore(value: unknown): number | null {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return null;
  return Math.max(0, Math.min(100, Math.round(numeric)));
}

function asTrimmedString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => asTrimmedString(item))
    .filter((item): item is string => Boolean(item));
}

function asRewrites(value: unknown): ReportForPdf["rewrites"] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const original = asTrimmedString((item as { original?: unknown }).original);
    const better = asTrimmedString((item as { better?: unknown }).better);
    if (!original || !better) return [];

    const label = asTrimmedString((item as { label?: unknown }).label) || undefined;
    const enhancement_note =
      asTrimmedString((item as { enhancement_note?: unknown }).enhancement_note) || undefined;

    return [{ label, original, better, enhancement_note }];
  });
}

function asTopFixes(value: unknown): NonNullable<ReportForPdf["top_fixes"]> {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];

    const fix = asTrimmedString((item as { fix?: unknown }).fix) || undefined;
    const text = asTrimmedString((item as { text?: unknown }).text) || undefined;
    const why = asTrimmedString((item as { why?: unknown }).why) || undefined;

    if (!fix && !text && !why) return [];
    return [{ fix, text, why }];
  });
}

function asSubscores(value: unknown): ReportForPdf["subscores"] | undefined {
  if (!value || typeof value !== "object") return undefined;

  const impact = clampScore((value as { impact?: unknown }).impact) ?? undefined;
  const clarity = clampScore((value as { clarity?: unknown }).clarity) ?? undefined;
  const story = clampScore((value as { story?: unknown }).story) ?? undefined;
  const readability = clampScore((value as { readability?: unknown }).readability) ?? undefined;

  if (
    typeof impact === "undefined" &&
    typeof clarity === "undefined" &&
    typeof story === "undefined" &&
    typeof readability === "undefined"
  ) {
    return undefined;
  }

  return { impact, clarity, story, readability };
}

function asJobAlignment(value: unknown): ReportForPdf["job_alignment"] | undefined {
  if (!value || typeof value !== "object") return undefined;

  const positioning_suggestion =
    asTrimmedString((value as { positioning_suggestion?: unknown }).positioning_suggestion) || undefined;
  const roleFit = (value as { role_fit?: unknown }).role_fit;
  type RoleFit = NonNullable<NonNullable<ReportForPdf["job_alignment"]>["role_fit"]>;

  let role_fit: RoleFit | undefined;
  if (roleFit && typeof roleFit === "object") {
    const best_fit_roles = asStringArray((roleFit as { best_fit_roles?: unknown }).best_fit_roles);
    const stretch_roles = asStringArray((roleFit as { stretch_roles?: unknown }).stretch_roles);
    const seniority_read =
      asTrimmedString((roleFit as { seniority_read?: unknown }).seniority_read) || undefined;
    const industry_signals = asStringArray((roleFit as { industry_signals?: unknown }).industry_signals);
    const company_stage_fit =
      asTrimmedString((roleFit as { company_stage_fit?: unknown }).company_stage_fit) || undefined;

    if (
      best_fit_roles.length > 0 ||
      stretch_roles.length > 0 ||
      seniority_read ||
      industry_signals.length > 0 ||
      company_stage_fit
    ) {
      role_fit = {
        best_fit_roles: best_fit_roles.length > 0 ? best_fit_roles : undefined,
        stretch_roles: stretch_roles.length > 0 ? stretch_roles : undefined,
        seniority_read,
        industry_signals: industry_signals.length > 0 ? industry_signals : undefined,
        company_stage_fit,
      };
    }
  }

  if (!positioning_suggestion && !role_fit) return undefined;
  return { positioning_suggestion, role_fit };
}

function deriveSummary(report: Record<string, unknown>): string | null {
  return (
    asTrimmedString(report.summary) ||
    asTrimmedString(report.first_impression) ||
    asTrimmedString(report.score_comment_long) ||
    asTrimmedString(report.score_comment_short) ||
    asTrimmedString(report.score_plain) ||
    "Saved recruiter report."
  );
}

function deriveNextSteps(report: Record<string, unknown>, topFixes: NonNullable<ReportForPdf["top_fixes"]>) {
  const explicitNextSteps = asStringArray(report.next_steps);
  if (explicitNextSteps.length > 0) return explicitNextSteps;

  const fromTopFixes = topFixes
    .map((fix) => fix.fix || fix.text)
    .filter((item): item is string => Boolean(item));
  if (fromTopFixes.length > 0) return fromTopFixes;

  return asStringArray(report.gaps).slice(0, 4);
}

export function normalizeReportForPdf(report: unknown): ReportForPdf | null {
  if (!report || typeof report !== "object") return null;

  const candidate = report as Record<string, unknown>;
  const score = clampScore(candidate.score);
  if (score === null) return null;

  const top_fixes = asTopFixes(candidate.top_fixes);
  const normalized: ReportForPdf = {
    score,
    summary: deriveSummary(candidate) || "Saved recruiter report.",
    strengths: asStringArray(candidate.strengths),
    gaps: asStringArray(candidate.gaps),
    rewrites: asRewrites(candidate.rewrites),
    next_steps: deriveNextSteps(candidate, top_fixes),
    score_label: asTrimmedString(candidate.score_label) || "Recruiter Impact Score",
    score_comment_short: asTrimmedString(candidate.score_comment_short) || undefined,
    generated_on: asTrimmedString(candidate.generated_on) || undefined,
    missing_wins: asStringArray(candidate.missing_wins),
    subscores: asSubscores(candidate.subscores),
    top_fixes,
    job_alignment: asJobAlignment(candidate.job_alignment),
  };

  return normalized;
}

export function buildPdfExportRequest(report: unknown): { report: ReportForPdf } | null {
  const normalized = normalizeReportForPdf(report);
  if (!normalized) return null;
  return { report: normalized };
}
