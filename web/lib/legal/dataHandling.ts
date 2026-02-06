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
    userControl: "Sign in to save history or delete account in Settings.",
    processor: "OpenAI, Supabase"
  },
  {
    dataType: "Report output + resume preview",
    purpose: "History, comparisons, and exports for signed-in users.",
    retention: "Stored when you save a report or run while signed in. Deleted when you delete the report or account.",
    userControl: "Delete a report in History or delete account in Settings.",
    processor: "Supabase"
  },
  {
    dataType: "Saved resume profile (default resume)",
    purpose: "Job matching and extension workflows.",
    retention: "Stored until you replace it or delete your account.",
    userControl: "Replace or remove in Settings > Matching or delete account.",
    processor: "Supabase, OpenAI (embeddings)"
  },
  {
    dataType: "LinkedIn profile input",
    purpose: "Generate profile feedback and recruiter-read recommendations.",
    retention: "Stored in report output when you save history or run while signed in.",
    userControl: "Delete a report in History or delete account in Settings.",
    processor: "OpenAI, Supabase"
  },
  {
    dataType: "Account identity (email, name)",
    purpose: "Authentication, account access, and support communication.",
    retention: "Retained while account is active.",
    userControl: "Update profile in Settings or delete account.",
    processor: "Supabase"
  },
  {
    dataType: "Usage, reliability, and abuse-prevention metadata",
    purpose: "Rate limiting, reliability diagnostics, billing state, and product health.",
    retention: "Retained for product operation and security needs.",
    userControl: "Delete account removes app-level history records.",
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
  "Your file is encrypted in transit.",
  "Anonymous runs are not stored unless you choose to save.",
  "Signed-in runs store report history and a short resume preview you can delete.",
  "Delete account removes reports and usage history from our app database.",
  "Payment details are handled by Stripe.",
  "We do not sell resume data.",
  "We do not use your data to train public models.",
  "This score estimates hiring signal, not hiring outcome.",
  "First full review is free. No card required.",
  "You see exactly what unlocks before payment.",
  "If payment succeeds and unlock lags, restore access from Billing.",
  "Receipts and invoices are available in Billing.",
  "You can export your account data from Settings."
];
