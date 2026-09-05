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
      "Save LinkedIn and Indeed job postings while you browse, then open a saved job in RIYP to check your resume against the role.",
    primaryCta: "Install on Chrome",
    fallbackCta: "Read privacy",
    disclosure:
      "Works on supported LinkedIn and Indeed job pages. The extension saves jobs only when you ask. Sign in before saving to sync a job to your account.",
    highlights: [
      "Save jobs from supported LinkedIn and Indeed pages",
      "Browse and remove saved jobs from the extension",
      "Use a saved job description in your resume report",
    ],
    trustPoints: [
      "No all-sites access",
      "No hidden capture",
      "Sync is optional",
    ],
  },
  shortDescription:
    "Save LinkedIn and Indeed job postings, then check your resume against a saved role in RIYP.",
  longDescription: [
    "Recruiter in Your Pocket saves job postings while you browse so you can review them later.",
    "Choose Save job on a supported LinkedIn or Indeed page. Use the extension to browse your saved jobs, remove them, or open a job in your RIYP workspace for a resume report.",
    "Saving jobs in this browser does not require an account. Sign in before saving to sync a job to your account. Jobs saved while signed out stay in this browser.",
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
      title: "Saved job in the workspace",
      caption: "Show the saved job open in the workspace with its description ready for a resume report.",
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
