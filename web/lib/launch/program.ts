export type LaunchOwner = {
  surface: string;
  owner: string;
  backup: string;
  channel: string;
};

export type RollbackControl = {
  surface: string;
  envVar: string;
  defaultState: "enabled" | "disabled";
  reason: string;
};

export type VendorReviewItem = {
  vendor: string;
  purpose: string;
  dataClasses: string;
  launchDecision: string;
  reviewNotes: string;
};

export type RehearsalStep = {
  id: string;
  title: string;
  surface: string;
  evidence: string;
};

export const LAUNCH_OWNERS: LaunchOwner[] = [
  { surface: "Launch command", owner: "Matt", backup: "GitHub Issues backup alert", channel: "docs/launch-readiness/87-operational-ownership.md" },
  { surface: "Auth and identity", owner: "Matt", backup: "GitHub Issues backup alert", channel: "docs/launch-readiness/87-operational-ownership.md" },
  { surface: "Billing and unlocks", owner: "Matt", backup: "Stripe dashboard plus GitHub Issues backup alert", channel: "docs/launch-readiness/87-operational-ownership.md" },
  { surface: "Held-back surfaces", owner: "Matt", backup: "Launch flags + status page", channel: "docs/launch-readiness/80-go-no-go-program.md" },
  { surface: "AI quality and prompt changes", owner: "Matt", backup: "PromptOps shipping gate", channel: "docs/promptops/shipping-gate.md" },
  { surface: "Trust and security disclosures", owner: "Matt", backup: "Security mailbox", channel: "security@recruiterinyourpocket.com" },
];

export const ROLLBACK_CONTROLS: RollbackControl[] = [
  {
    surface: "New purchases",
    envVar: "RIYP_DISABLE_NEW_PURCHASES",
    defaultState: "disabled",
    reason: "Stop new Checkout Sessions without preventing paid customers from restoring access, reading receipts, or opening the billing portal.",
  },
  {
    surface: "Report generation",
    envVar: "RIYP_DISABLE_GENERATION",
    defaultState: "disabled",
    reason: "Stop new model calls immediately if quality, provider health, abuse, or spend exceeds the safe operating envelope.",
  },
  {
    surface: "Extension sync",
    envVar: "NEXT_PUBLIC_ENABLE_EXTENSION_SYNC",
    defaultState: "disabled",
    reason: "Disable extension/server sync if auth, origin, or saved-job consistency regresses.",
  },
  {
    surface: "Guest report save",
    envVar: "NEXT_PUBLIC_ENABLE_GUEST_REPORT_SAVE",
    defaultState: "disabled",
    reason: "Keep anonymous persistence off until ownership verification ships.",
  },
  {
    surface: "Public share links",
    envVar: "NEXT_PUBLIC_ENABLE_PUBLIC_SHARE_LINKS",
    defaultState: "disabled",
    reason: "Keep sharing dark until a durable share artifact exists.",
  },
  {
    surface: "Billing unlock and restore",
    envVar: "NEXT_PUBLIC_ENABLE_BILLING_UNLOCK",
    defaultState: "disabled",
    reason: "Disable purchases quickly if Stripe config, webhook handling, or unlock correctness regresses.",
  },
  {
    surface: "LinkedIn review",
    envVar: "NEXT_PUBLIC_ENABLE_LINKEDIN_REVIEW",
    defaultState: "disabled",
    reason: "Blocked from enablement until its generation route uses the atomic access-reservation lifecycle.",
  },
  {
    surface: "Experimental resume-ideas API",
    envVar: "RIYP_ENABLE_RESUME_IDEAS_API",
    defaultState: "disabled",
    reason: "Keep the hidden generation mode unavailable unless it receives its own launch review and explicit server-side enablement.",
  },
  {
    surface: "Third-party analytics",
    envVar: "NEXT_PUBLIC_ENABLE_ANALYTICS",
    defaultState: "disabled",
    reason: "Disable analytics if privacy review, telemetry quality, or vendor posture changes.",
  },
  {
    surface: "Error replay",
    envVar: "NEXT_PUBLIC_ENABLE_ERROR_REPLAY",
    defaultState: "disabled",
    reason: "Keep browser replay off unless privacy review explicitly approves it.",
  },
];

export const VENDOR_REVIEW_ITEMS: VendorReviewItem[] = [
  {
    vendor: "OpenAI",
    purpose: "Model inference for recruiter-style analysis, rewrite guidance, and matching helpers.",
    dataClasses: "Resume text, job descriptions, structured prompts, model outputs.",
    launchDecision: "Approved with caution",
    reviewNotes: "Do not store full raw inputs outside the request lifecycle. Keep training opt-out statement aligned with actual vendor settings.",
  },
  {
    vendor: "Supabase",
    purpose: "Authentication, primary data store, saved reports, and saved jobs.",
    dataClasses: "Account identity, report data, job captures, billing linkage metadata.",
    launchDecision: "Approved",
    reviewNotes: "Account deletion and export flows must remain green before launch.",
  },
  {
    vendor: "Stripe",
    purpose: "Checkout, receipts, billing portal, and webhook-driven entitlement state.",
    dataClasses: "Customer identifiers, invoice and receipt metadata, Stripe-managed payment data.",
    launchDecision: "Approved",
    reviewNotes: "Webhook verification and idempotent unlock logic are go/no-go requirements.",
  },
  {
    vendor: "Sentry",
    purpose: "Error monitoring and launch-day issue triage.",
    dataClasses: "Error metadata, route context, scrubbed diagnostic breadcrumbs.",
    launchDecision: "Approved with strict scrubbing",
    reviewNotes: "Default PII is disabled. Replay should remain off until a separate approval exists.",
  },
  {
    vendor: "Mixpanel",
    purpose: "Product analytics and funnel health when analytics is enabled.",
    dataClasses: "Session-level event metadata and conversion telemetry.",
    launchDecision: "Approved only behind kill switch",
    reviewNotes: "Respect Do Not Track and keep the launch flag available for immediate rollback.",
  },
  {
    vendor: "Vercel",
    purpose: "Hosting, serverless runtime, and operational logs.",
    dataClasses: "Runtime metadata, deployment health, and platform diagnostics.",
    launchDecision: "Approved",
    reviewNotes: "Platform logs must continue to avoid raw resume or job-description payloads.",
  },
  {
    vendor: "Upstash",
    purpose: "Shared rate limiting, request idempotency, and short-lived checkout-session caching.",
    dataClasses: "Hashed request and IP identifiers, idempotency keys, and short-lived checkout session metadata.",
    launchDecision: "Approved with short retention",
    reviewNotes: "Keep keys pseudonymous, use the shortest practical TTL, and never cache raw resume or job-description text.",
  },
  {
    vendor: "Inngest",
    purpose: "Background account-export jobs and optional asynchronous PDF generation.",
    dataClasses: "Job identifiers, account identity, account-export payloads, and report content when asynchronous PDF generation is used.",
    launchDecision: "Approved with payload review",
    reviewNotes: "Keep event and run-history retention explicit. Avoid sending full report or account payloads when an internal identifier is sufficient.",
  },
  {
    vendor: "Resend",
    purpose: "Transactional authentication delivery and signed inbound support-email processing.",
    dataClasses: "Account email, authentication message content, support-message content, and support attachments.",
    launchDecision: "Approved with signed webhooks and recipient allowlisting",
    reviewNotes: "Verify inbound signatures, forward only the exact public support envelope recipient, and never log message content or the private forwarding destination.",
  },
  {
    vendor: "Google (Gmail)",
    purpose: "Private operator mailbox for responding to forwarded support requests.",
    dataClasses: "Support-message content, sender address, and support attachments.",
    launchDecision: "Approved for founder-operated beta support",
    reviewNotes: "Keep the private mailbox address server-only, use the public support identity for replies, and delete support records when they are no longer reasonably needed.",
  },
];

export const LAUNCH_REHEARSAL_STEPS: RehearsalStep[] = [
  {
    id: "public_promise",
    title: "Public promise matches the shipped product",
    surface: "Marketing and trust",
    evidence: "Verify the homepage, pricing, research, legal, support, and status surfaces while confirming extension and Jobs navigation remain absent.",
  },
  {
    id: "anonymous_review",
    title: "Anonymous review completes cleanly",
    surface: "Web",
    evidence: "Open the workspace in a clean browser profile, run a review, and confirm anonymous output does not create an account automatically.",
  },
  {
    id: "auth_return",
    title: "Auth returns to the intended workspace",
    surface: "Web auth",
    evidence: "Create a fresh account, finish the auth callback, and confirm the user lands back in the product instead of a dead route.",
  },
  {
    id: "report_persistence",
    title: "Saved reports appear in history",
    surface: "Reports",
    evidence: "Save a report while signed in, refresh, and confirm it appears in /reports and opens successfully.",
  },
  {
    id: "billing_unlock",
    title: "Purchase, restore, receipts, and portal all work",
    surface: "Billing",
    evidence: "Complete a test checkout, confirm entitlements unlock, restore access, fetch receipts, and open the Stripe portal.",
  },
  {
    id: "export_delete",
    title: "Export and delete flows work end to end",
    surface: "Account controls",
    evidence: "Export account data, then delete the same account and confirm reports, billing linkage, and other user-owned records are removed or anonymized as promised.",
  },
  {
    id: "accessibility_visuals",
    title: "Core surfaces hold together across input modes and viewports",
    surface: "Accessibility and visual quality",
    evidence: "Complete the journey by keyboard and review 390, 768, 1280, and 1440 px layouts with increased text size and reduced motion.",
  },
  {
    id: "operational_recovery",
    title: "Rollback and diagnostic controls fail safely",
    surface: "Operations",
    evidence: "Exercise billing disablement, held-back route protection, health and status responses, and one simulated generation incident before restoring the candidate configuration.",
  },
];

export const REQUIRED_LAUNCH_DOCS = [
  "docs/launch-readiness/80-go-no-go-program.md",
  "docs/launch-readiness/85-vendor-privacy-review.md",
  "docs/launch-readiness/87-operational-ownership.md",
  "docs/launch-readiness/90-incident-runbook.md",
  "docs/launch-readiness/95-launch-rehearsal.md",
  "docs/promptops/shipping-gate.md",
] as const;

export const REQUIRED_PUBLIC_TRUST_FILES = [
  "web/app/(marketing)/privacy/page.tsx",
  "web/app/(marketing)/security/page.tsx",
  "web/app/(marketing)/methodology/page.tsx",
  "web/app/(marketing)/status/page.tsx",
  "web/app/(marketing)/support/page.tsx",
  "web/app/.well-known/security.txt/route.ts",
  "web/app/robots.ts",
  "web/app/sitemap.ts",
] as const;

export function resolvePublicTrustSurfaceStatus(options: {
  verified: boolean;
  inspectionAvailable: boolean;
  hostedRuntime: boolean;
}): "ok" | "missing" | "disabled" {
  if (options.verified) return "ok";
  if (options.hostedRuntime && !options.inspectionAvailable) return "disabled";
  return "missing";
}

export const LAUNCH_GATE_DEFINITIONS = [
  {
    id: "trust",
    label: "Trust and security",
    description: "Privacy posture, public trust surfaces, and safe defaults for monitoring.",
    checks: ["runtime_env", "shared_rate_limit", "generation_cost_control", "support_delivery", "secondary_alert", "public_trust_surfaces", "analytics_configuration", "error_replay"],
  },
  {
    id: "auth",
    label: "Auth and identity",
    description: "Account flows return users to the right surface and never create ownership silently.",
    checks: ["database", "auth_callback", "guest_report_save"],
  },
  {
    id: "billing",
    label: "Billing and unlocks",
    description: "Stripe configuration, webhook safety, and reversible billing access.",
    checks: ["billing_unlock", "billing_webhook"],
  },
  {
    id: "extension",
    label: "Held-back surfaces",
    description: "Extension sync and public sharing remain unavailable unless exact origins and explicit toggles are deliberately enabled.",
    checks: ["extension_sync", "public_share_links"],
  },
  {
    id: "quality",
    label: "PromptOps quality",
    description: "Prompt changes stay behind eval baselines and executable shipping rules.",
    checks: ["prompt_assets", "eval_harness", "live_model_eval", "launch_runbooks"],
  },
];
