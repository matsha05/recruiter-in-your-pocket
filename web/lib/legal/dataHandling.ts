export const LEGAL_LAST_UPDATED = "March 7, 2026";

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
    retention: "Processed to generate results. Raw input is not stored for anonymous runs.",
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
    dataType: "LinkedIn profile input",
    purpose: "Generate profile feedback and recommendations for your LinkedIn.",
    retention: "Saved in your report history when you're signed in.",
    userControl: "Delete individual reports in History, or delete your account in Settings.",
    processor: "OpenAI, Supabase"
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
    purpose: "Authentication, account access, and support communication.",
    retention: "Retained while account is active.",
    userControl: "Update your profile in Settings, or delete your account.",
    processor: "Supabase"
  },
  {
    dataType: "Usage, reliability, and abuse-prevention metadata",
    purpose: "Rate limiting, reliability diagnostics, billing state, and product health.",
    retention: "Retained for product operation and security needs.",
    userControl: "Deleting your account removes app-level history.",
    processor: "Supabase, Sentry, Vercel"
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
    purpose: "Charge processing, receipts, subscription lifecycle, and dispute handling.",
    retention: "Managed under Stripe billing retention policies.",
    userControl: "Manage billing and receipts in Stripe portal.",
    processor: "Stripe"
  }
];

export const TRUST_PROMISES = [
  "Your upload is encrypted in transit.",
  "Anonymous reports are not saved to an account automatically.",
  "Signed-in reports save report output, evidence excerpts, a short resume preview, and any job description you add. You can delete reports from Reports.",
  "Deleting your account removes your reports and usage history from our database.",
  "Payment info is handled by Stripe. We never see your card.",
  "We don't sell your data.",
  "We don't use your data to train AI models.",
  "Browser session replay stays off by default.",
  "Scores estimate your resume's hiring signal. They don't predict hiring outcomes.",
  "Your first full report is free. No credit card needed.",
  "You see exactly what you're unlocking before you pay.",
  "If payment goes through but access looks locked, restore it from Billing.",
  "All receipts and invoices are available in Billing.",
  "You can export your data from Settings when export controls are enabled.",
  "Security reports can be sent using the disclosure instructions on our Security and Status pages."
];
