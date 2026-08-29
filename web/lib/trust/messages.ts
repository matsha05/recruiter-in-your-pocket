export const workspaceTrustMessage = {
  title: "Before you run",
  body:
    "Your upload is encrypted in transit. We send resume text and optional job descriptions to OpenAI to generate the report.",
  detail:
    "A completed anonymous report can be recovered in this browser for up to 24 hours, but is not attached to an account unless you sign in and save it. RIYP does not keep the raw anonymous resume or job description. Signed-in reports stay in history until you delete them.",
};

export const workspaceTrustPoints = [
  {
    title: "Anonymous by default",
    detail: "RIYP does not save raw resume or job-description text from an anonymous report. Its completed report output expires from browser recovery within 24 hours.",
  },
  {
    title: "Used for this report",
    detail: "OpenAI's API processes the text. API data is not used to train OpenAI models by default; abuse-monitoring logs may be kept for up to 30 days.",
  },
  {
    title: "You stay in control",
    detail: "If you sign in and save a report, you can delete it—or your account—at any time.",
  },
] as const;

export const saveReportTrustMessage =
  "We only save reports to verified signed-in accounts. Saved history includes the report output, evidence excerpts, a short resume preview, and any job description you added.";

export const extensionDisclosureMessage =
  "The extension only reads supported job pages when you ask it to capture a role. Sign-in is only required if you want synced history across devices.";

const billingTrustMessage = {
  summary: "Stripe handles checkout, card details, and receipts. The Job Search Pass does not renew.",
  support: "Support and restore paths stay visible before and after payment.",
};
