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
    dataType: "Resume upload text",
    purpose: "Generate role-specific feedback and scoring output.",
    retention: "Processed for analysis; report output may be stored for account history.",
    userControl: "Delete account to remove stored reports and usage history.",
    processor: "OpenAI, Supabase"
  },
  {
    dataType: "LinkedIn profile input",
    purpose: "Generate profile feedback and recruiter-read recommendations.",
    retention: "Stored in report output when account features are used.",
    userControl: "Delete account to remove stored reports and usage history.",
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
    dataType: "Usage and report metadata",
    purpose: "History, billing state, fraud prevention, and reliability diagnostics.",
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
  "We store report output only when account/history features are used.",
  "Delete account removes reports and usage history from our app database.",
  "Payment details are handled by Stripe.",
  "We do not sell resume data.",
  "This score estimates hiring signal, not hiring outcome.",
  "First full review is free. No card required.",
  "You see exactly what unlocks before payment.",
  "If payment succeeds and unlock lags, restore access from Billing.",
  "Receipts and invoices are available in Billing.",
  "You can export your account data from Settings."
];
