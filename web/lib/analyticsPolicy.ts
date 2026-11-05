export type AnalyticsScalar = string | number | boolean;

// Analytics is deliberately schema-first. Event names and properties that are
// not listed here are discarded before a vendor SDK sees them. In particular,
// report, export, checkout, and content identifiers never leave RIYP.
export const ANALYTICS_EVENT_PROPERTIES = {
  page_viewed: ["surface"],
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
  // A comparison page by the other tool's public name (lib/analyticsSurfaces.ts), never a URL.
  comparison_viewed: ["slug"],
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
  report_stream_started: ["has_jd", "mode", "rebuild"],
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
  // The Critical Miss's revised line now carries the fact it asked for (plan item 2.3).
  critical_miss_addressed: ["sample"],
  // Ask-first (Nov 5, 2026): the not-ready page's questions were answered and the report written again, or skipped.
  ask_first_written: ["answers", "questions"],
  ask_first_skipped: ["questions"],
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

// Where a visit came from, attached to every event after consent so a channel can be followed
// from landing to checkout. Our own links carry campaign tags (docs/growth/first-100-users.md);
// an untagged visit keeps only the kind of site it came from, never its address or search terms.
export const VISIT_ENTRY_PROPERTIES = ["entry_source", "entry_medium", "entry_campaign", "entry_variant"] as const;
export type VisitEntry = Partial<Record<(typeof VISIT_ENTRY_PROPERTIES)[number], string>>;

// A tag with any other medium is someone else's, so none of it is kept.
const TAGGED_MEDIUMS = new Set(["social", "community", "partner", "directory", "cpc", "email"]);
const CAMPAIGN_LABEL = /^[a-z0-9][a-z0-9_-]{0,39}$/;

const REFERRER_CHANNELS: readonly [RegExp, string, string][] = [
  [/^(?:www\.)?google\.[a-z.]+$/, "google", "organic"],
  [/^(?:www\.)?bing\.com$/, "bing", "organic"],
  [/^(?:www\.)?duckduckgo\.com$/, "duckduckgo", "organic"],
  [/^(?:www\.)?chatgpt\.com$/, "chatgpt", "ai"],
  [/^(?:www\.)?perplexity\.ai$/, "perplexity", "ai"],
  [/^gemini\.google\.com$/, "gemini", "ai"],
  [/^copilot\.microsoft\.com$/, "copilot", "ai"],
  [/^claude\.ai$/, "claude", "ai"],
  [/(?:^|\.)linkedin\.com$|^lnkd\.in$/, "linkedin", "social"],
  [/(?:^|\.)threads\.(?:net|com)$/, "threads", "social"],
  [/^(?:www\.)?(?:x|twitter)\.com$|^t\.co$/, "x", "social"],
  [/(?:^|\.)reddit\.com$/, "reddit", "community"],
];

// Steps inside our own journey (checkout, sign-in) send people back with a referrer; they aren't a channel.
const JOURNEY_HOSTS = /(?:^|\.)(?:stripe\.com|supabase\.co)$|^accounts\.google\.com$/;

function campaignLabel(value: string | null): string | null {
  const label = value?.trim().toLowerCase() ?? "";
  return CAMPAIGN_LABEL.test(label) && safeScalar(label) !== null ? label : null;
}

/** The visit's channel from its query string and referrer, or null for a direct or internal visit. */
export function visitEntry(search: string, referrer: string, ownHost: string): VisitEntry | null {
  const params = new URLSearchParams(search);
  const medium = campaignLabel(params.get("utm_medium"));
  const source = campaignLabel(params.get("utm_source"));
  if (medium && source && TAGGED_MEDIUMS.has(medium)) {
    const entry: VisitEntry = { entry_source: source, entry_medium: medium };
    const campaign = campaignLabel(params.get("utm_campaign"));
    const variant = campaignLabel(params.get("utm_content"));
    if (campaign) entry.entry_campaign = campaign;
    if (variant) entry.entry_variant = variant;
    return entry;
  }
  let host: string;
  try {
    host = new URL(referrer).hostname.toLowerCase();
  } catch {
    return null;
  }
  const site = (name: string) => name.replace(/^www\./, "");
  if (!host || site(host) === site(ownHost.toLowerCase()) || JOURNEY_HOSTS.test(host)) return null;
  for (const [pattern, entrySource, entryMedium] of REFERRER_CHANNELS) {
    if (pattern.test(host)) return { entry_source: entrySource, entry_medium: entryMedium };
  }
  return { entry_source: "other", entry_medium: "referral" };
}
