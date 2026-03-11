export type ExtensionScreenshotSpec = {
  id: string;
  title: string;
  caption: string;
};

export const extensionStoreContent = {
  navLabel: "Extension",
  page: {
    eyebrow: "Chrome extension",
    title: "Save the job while it's in front of you.",
    description:
      "Save supported LinkedIn and Indeed roles while you're browsing, keep them in view, and open the full report when you want a closer look.",
    primaryCta: "Install on Chrome",
    fallbackCta: "Read privacy",
    disclosure:
      "Works on supported LinkedIn and Indeed job pages. Capture only happens when you ask for it. Sign in only if you want saved jobs to sync.",
    highlights: [
      "Save a role without breaking your browsing flow",
      "Keep match context close while you compare jobs",
      "Open the full workspace when you want the report and rewrites",
    ],
    trustPoints: [
      "No all-sites access",
      "No hidden capture",
      "Sync is optional",
    ],
  },
  shortDescription:
    "Save supported LinkedIn and Indeed roles, keep saved jobs close, and open the full report in RIYP when you need it.",
  longDescription: [
    "Recruiter in Your Pocket helps you save supported job postings while you're browsing and carry that context back into the studio.",
    "Use the popup to save a role, check the basics, and jump into the full report when you're ready.",
    "Sign-in is only required if you want synced saved jobs across devices. Local capture and browsing support stay explicit and purpose-bound.",
  ],
  privacyFieldSummary:
    "The extension reads supported LinkedIn and Indeed job pages only when needed for user-initiated job capture. Saved-job history can sync to your RIYP account when you sign in.",
  supportHref: "mailto:support@recruiterinyourpocket.com",
  securityHref: "/security",
  privacyHref: "/privacy",
  screenshots: [
    {
      id: "popup-jobs",
      title: "Popup with saved jobs",
      caption: "Show the popup after capture with one dominant next step and visible synced/local state.",
    },
    {
      id: "popup-auth",
      title: "Popup sign-in state",
      caption: "Show what sign-in unlocks, why it matters, and that capture remains explicit.",
    },
    {
      id: "workspace-return",
      title: "Studio handoff",
      caption: "Show the saved job flowing into the studio for deeper recruiter-grade report guidance.",
    },
    {
      id: "install-disclosure",
      title: "Install disclosure",
      caption: "Show the website install surface with supported sites, purpose-bound access, and policy links.",
    },
    {
      id: "capture-context",
      title: "Supported job page capture",
      caption: "Show the supported-page capture workflow in context rather than a decorative hero mockup.",
    },
  ] satisfies ExtensionScreenshotSpec[],
} as const;

export function getChromeWebStoreUrl() {
  return process.env.NEXT_PUBLIC_CHROME_WEB_STORE_URL || "";
}
