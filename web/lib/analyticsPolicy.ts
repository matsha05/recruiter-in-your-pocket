export type AnalyticsScalar = string | number | boolean;

// Analytics is deliberately schema-first. Event names and properties that are
// not listed here are discarded before a vendor SDK sees them. In particular,
// report, export, checkout, and content identifiers never leave RIYP.
export const ANALYTICS_EVENT_PROPERTIES = {
  resume_uploaded: ["source"],
  report_started: ["has_jd"],
  report_completed: ["score"],
  paywall_viewed: ["reason"],
  checkout_started: ["product", "amount"],
  purchase_completed: ["amount", "currency", "product", "credits"],
  paywall_cta_clicked: ["section"],
  unlock_confirm_completed: ["status", "latency_ms"],
  unlock_ui_revealed: ["section", "ttsn_ms"],
  unlock_context_missing: [],
  signup_completed: ["method"],
  login_completed: ["method"],
  auth_gate_viewed: ["reason"],
  sample_report_viewed: [],
  research_article_viewed: ["slug"],
  faq_viewed: [],
  pdf_exported: [],
  linkedin_review_started: ["source"],
  linkedin_review_completed: ["score"],
  unlock_confirm_started: ["source", "tier"],
  checkout_completed: ["source", "tier", "attempt"],
  unlock_confirm_succeeded: ["tier", "attempt"],
  unlock_confirm_failed: ["reason"],
  report_detail_opened: [],
  workspace_upload_started: ["source", "file_type", "file_size_bytes"],
  workspace_upload_succeeded: ["source", "file_type", "file_size_bytes", "extracted_chars"],
  report_stream_started: ["has_jd", "mode"],
  report_first_meaningful_chunk_rendered: ["mode", "latency_ms", "has_score"],
  save_prompt_viewed: ["score"],
  save_prompt_dismissed: ["score"],
  account_export_requested: ["source"],
  account_export_completed: ["source"],
  checkout_start_failed: ["source", "tier"],
  billing_portal_open_requested: ["source"],
  billing_restore_requested: ["source"],
  billing_restore_succeeded: ["restored"],
  pricing_run_free_review_clicked: ["source"],
  landing_cta_clicked: ["cta", "destination"],
  sm1_fixes_rendered: ["count"],
  sm1_fix_copied: [],
} as const satisfies Record<string, readonly string[]>;

export type ApprovedAnalyticsEvent = keyof typeof ANALYTICS_EVENT_PROPERTIES;

const SENSITIVE_VALUE_PATTERN = /(?:@|\b(?:https?:\/\/|www\.)|\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b)/i;
const MAX_STRING_LENGTH = 80;
const MAX_NUMBER_MAGNITUDE = 10_000_000;

function safeScalar(value: unknown): AnalyticsScalar | null {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value) || Math.abs(value) > MAX_NUMBER_MAGNITUDE) return null;
    return value;
  }
  if (typeof value === "string") {
    const normalized = value.trim();
    if (!normalized || normalized.length > MAX_STRING_LENGTH || SENSITIVE_VALUE_PATTERN.test(normalized)) {
      return null;
    }
    return normalized;
  }
  return null;
}

export function sanitizeAnalyticsEvent(
  name: string,
  properties: Record<string, unknown> = {},
): { name: ApprovedAnalyticsEvent; properties: Record<string, AnalyticsScalar> } | null {
  if (!Object.prototype.hasOwnProperty.call(ANALYTICS_EVENT_PROPERTIES, name)) return null;

  const approvedName = name as ApprovedAnalyticsEvent;
  const allowedKeys = new Set<string>(ANALYTICS_EVENT_PROPERTIES[approvedName]);
  const sanitized: Record<string, AnalyticsScalar> = {};

  for (const [key, value] of Object.entries(properties)) {
    if (!allowedKeys.has(key)) continue;
    const nextValue = safeScalar(value);
    if (nextValue !== null) sanitized[key] = nextValue;
  }

  return { name: approvedName, properties: sanitized };
}
