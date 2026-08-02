import { FREE_REPORT_ENTITLEMENT } from "../billing/pricing";

export const LEGAL_LAST_UPDATED = "August 2, 2026";
export const PRIVACY_LAST_UPDATED = "July 29, 2026";

export type DataHandlingRow = {
  dataType: string;
  purpose: string;
  retention: string;
  userControl: string;
  processor: string;
};

export const DATA_HANDLING_ROWS: DataHandlingRow[] = [
  {
    dataType: "Resume upload text (analysis input)",
    purpose: "Generate recruiter-style feedback, scoring, and rewrite guidance.",
    retention: "RIYP does not store raw input for anonymous runs. OpenAI may retain API abuse-monitoring logs containing customer content for up to 30 days by default.",
    userControl: "Sign in to save your history, or delete your account in Settings.",
    processor: "OpenAI, Supabase"
  },
  {
    dataType: "Report output + resume preview",
    purpose: "So you can open past reports, compare versions, inspect evidence excerpts, and export.",
    retention: "Saved when you keep a report or run one while signed in. Includes report output, evidence excerpts, a short resume preview, and any job description you add. Deleted when you delete the report or your account.",
    userControl: "Delete individual reports in History, or delete your account in Settings.",
    processor: "Supabase"
  },
  {
    dataType: "Saved resume profile (default resume)",
    purpose: "Job matching and extension workflows.",
    retention: "Stored until you replace it, remove it, or delete your account. Includes raw resume text for matching plus derived skills, seniority signals, embeddings, hash, and preview.",
    userControl: "Replace or remove it in Settings > Matching, or delete your account.",
    processor: "Supabase, OpenAI (embeddings)"
  },
  {
    dataType: "Captured jobs and job descriptions",
    purpose: "Save roles from the extension, run role-fit checks, and compare your resume against specific postings.",
    retention: "Stored when you save a job or sync extension captures. Includes job title, company, URL, description text, match signals, and latest report links until you delete the saved job or your account.",
    userControl: "Delete saved jobs from Jobs, delete linked reports from Reports, or delete your account in Settings.",
    processor: "Supabase, Chrome local storage, OpenAI when used in a report"
  },
  {
    dataType: "Account identity (email, name)",
    purpose: "Authentication and account access.",
    retention: "Retained while account is active.",
    userControl: "Update your profile in Settings, or delete your account.",
    processor: "Supabase"
  },
  {
    dataType: "Support communications and attachments",
    purpose: "Respond to product, account, billing, privacy, and security requests sent to the public support address.",
    retention: "Kept only as long as reasonably needed to resolve the request, preserve security or billing evidence, meet legal obligations, and maintain support continuity. Provider logs follow their configured retention windows.",
    userControl: "You choose what to send. You can ask us to delete a support conversation unless we need to retain it for security, fraud prevention, billing, or legal compliance.",
    processor: "Resend, Google (Gmail)"
  },
  {
    dataType: "Usage, reliability, and abuse-prevention metadata",
    purpose: "Rate limiting, reliability diagnostics, billing state, and product health.",
    retention: "Rate-limit and idempotency records are short-lived. Other operational records are retained for product and security needs.",
    userControl: "Deleting your account removes app-level history.",
    processor: "Supabase, Sentry, Vercel, Upstash"
  },
  {
    dataType: "Background job events and results",
    purpose: "Generate account exports and, when used, PDF files without keeping the request open.",
    retention: "Retained under Inngest's configured event and run-history windows. Completed account exports stored in Supabase expire after seven days.",
    userControl: "Background export work starts only when you request it. You can delete your account and its app-level export records in Settings.",
    processor: "Inngest, Supabase"
  },
  {
    dataType: "Product analytics and conversion telemetry",
    purpose: "Measure product quality, onboarding friction, and billing funnel health when analytics is enabled.",
    retention: "Retained under the analytics vendors' configured retention windows.",
    userControl: "Respects browser Do Not Track and can be disabled at launch.",
    processor: "Mixpanel, Vercel"
  },
  {
    dataType: "Billing events and invoices",
    purpose: "Charge processing, receipts, purchase restoration, refunds, and dispute handling.",
    retention: "Stripe retains authoritative billing records under its policies. RIYP keeps limited receipt and entitlement metadata for reconciliation, security, and reversal handling.",
    userControl: "View receipts and restore purchases from Billing settings. Account deletion removes user-linked app billing records; opaque reversal identifiers may remain to prevent access from being re-granted.",
    processor: "Stripe, Supabase"
  }
];

export const TRUST_PROMISES = [
  "Your upload is encrypted in transit.",
  "Anonymous reports are not saved to an account automatically.",
  "Signed-in reports save report output, evidence excerpts, a short resume preview, and any job description you add. You can delete reports from Reports.",
  "Deleting your account removes your reports and usage history from our database.",
  "We don't sell your data or opt it into model training. OpenAI API data is not used to train models by default.",
  "The clarity summary scores this resume review out of 100. It does not predict interviews, offers, or other hiring outcomes.",
  `${FREE_REPORT_ENTITLEMENT.promise} ${FREE_REPORT_ENTITLEMENT.boundary}`,
  "A Job Search Pass is one payment for five additional reports over 30 days. It does not renew, and you can restore it from Billing.",
  "Security reports can be sent using the disclosure instructions on our Security page."
];
