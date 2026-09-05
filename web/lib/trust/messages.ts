export const workspaceTrustMessage = {
  title: "Before you get a report",
  body:
    "Your upload is encrypted in transit. We send resume text and optional job descriptions to OpenAI to generate the report.",
  detail:
    "A completed anonymous report can be recovered in this browser for up to 24 hours, but is not attached to an account unless you sign in and save it. RIYP does not keep the raw anonymous resume or job description. Signed-in reports stay in history until you delete them.",
};

export const workspaceTrustPoints = [
  {
    title: "No account required",
    detail: "RIYP does not save raw resume or job-description text from an anonymous report. Its completed report output expires from browser recovery within 24 hours.",
  },
  {
    title: "Used for this report",
    detail: "OpenAI's API processes the text. API data is not used to train OpenAI models by default; abuse-monitoring logs may be kept for up to 30 days.",
  },
  {
    title: "Delete saved reports",
    detail: "If you sign in and save a report, you can delete it or your account at any time.",
  },
] as const;

export const saveReportTrustMessage =
  "Saving keeps the report, quoted resume excerpts, a short resume preview, and any job description you added in your account. You can delete the saved report at any time.";

export const extensionDisclosureMessage =
  "The extension reads supported job pages when you choose to save a job. You can save jobs in this browser without an account. Sign in before saving to sync a job to your account.";

const billingTrustMessage = {
  summary: "Stripe handles checkout, card details, and receipts. The Job Search Pass does not renew.",
  support: "Support and restore paths stay visible before and after payment.",
};
