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
      "Capture supported LinkedIn and Indeed roles, keep your saved jobs in view, and jump into the studio when you want the full recruiter-grade review.",
    primaryCta: "Install on Chrome",
    fallbackCta: "Review privacy and data handling",
    disclosure:
      "Works on supported LinkedIn and Indeed job pages. Capture is user-initiated. Sign-in is only required for synced history.",
    highlights: [
      "Capture a role in one click from supported job pages",
      "See match context without leaving the browsing flow",
      "Open the full studio when you want deeper review and rewrites",
    ],
    trustPoints: [
      "No hidden scraping or all-sites access",
      "Storage and sync are limited to saved job workflows",
      "Privacy, security, and support links stay visible from install through use",
    ],
  },
  shortDescription:
    "Capture LinkedIn and Indeed roles, keep saved jobs in sync, and open recruiter-grade match context in RIYP.",
  longDescription: [
    "Recruiter in Your Pocket helps you save supported job postings while you're browsing and carry that context back into the studio.",
    "Use the popup to capture a role, check fit, and jump into a deeper recruiter-grade review when you're ready.",
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
      caption: "Show the saved job flowing into the studio for deeper recruiter-grade review.",
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
