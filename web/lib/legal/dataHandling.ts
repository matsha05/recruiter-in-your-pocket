export const LEGAL_LAST_UPDATED = "February 6, 2026";

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
    purpose: "So you can view past reviews, compare results, and export.",
    retention: "Saved when you keep a report or run one while signed in. Deleted when you delete the report or your account.",
    userControl: "Delete individual reports in History, or delete your account in Settings.",
    processor: "Supabase"
  },
  {
    dataType: "Saved resume profile (default resume)",
    purpose: "Job matching and extension workflows.",
    retention: "Stored until you replace it or delete your account.",
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
    processor: "Supabase"
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
  "Your file is encrypted when you upload it.",
  "Anonymous reviews aren't saved unless you choose to.",
  "Signed-in reviews save your history and a short resume preview — you can delete both.",
  "Deleting your account removes your reports and usage history from our database.",
  "Payment info is handled by Stripe. We never see your card.",
  "We don't sell your data.",
  "We don't use your data to train AI models.",
  "Scores estimate your resume's hiring signal — they don't predict hiring outcomes.",
  "Your first full review is free. No credit card needed.",
  "You see exactly what you're unlocking before you pay.",
  "If payment goes through but access looks locked, restore it from Billing.",
  "All receipts and invoices are available in Billing.",
  "You can export your data from Settings anytime."
];
