export const workspaceTrustMessage = {
  title: "Before you run",
  body:
    "Your upload is encrypted in transit. We send resume text and optional job descriptions to OpenAI to generate the report.",
  detail:
    "Anonymous reports are not attached to an account unless you choose to sign in and save them. Signed-in reports save the report output, evidence excerpts, a short resume preview, and any job description you add until you delete them.",
};

export const saveReportTrustMessage =
  "We only save reports to verified signed-in accounts. Saved history includes the report output, evidence excerpts, a short resume preview, and any job description you added.";

export const extensionDisclosureMessage =
  "The extension only reads supported job pages when you ask it to capture a role. Sign-in is only required if you want synced history across devices.";

const billingTrustMessage = {
  summary: "Stripe handles checkout, receipts, renewals, and cancellation.",
  support: "Support and restore paths stay visible before and after payment.",
};
