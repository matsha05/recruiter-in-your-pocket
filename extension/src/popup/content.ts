export const popupContent = {
  onboarding: {
    title: "Save the job before it disappears.",
    subtitle:
      "Capture supported LinkedIn and Indeed roles in one click, then bring that context back into RIYP when you want the full recruiter-grade review.",
    primaryFeature: {
      title: "Capture while you browse",
      body: "Save a supported job posting the moment it matters so you can review it later without losing context.",
    },
    supportingFeatures: [
      {
        title: "Check fit when you need it",
        body: "Use match context to decide whether a role deserves the deeper studio pass.",
      },
      {
        title: "Sign in only for sync",
        body: "Local capture works first. Sign in only if you want saved jobs across devices.",
      },
    ],
    cta: "Start with job capture",
  },
  auth: {
    title: "Sign in for synced saved jobs",
    description:
      "Save new captures to your account and reopen synced roles across devices. Existing browser saves stay local until you capture them again while signed in.",
    supportLine:
      "Local capture still works. Sign in in your browser, then reopen the extension or choose Refresh to reconnect.",
    primaryCta: "Open secure sign-in",
    footer: "Need a RIYP account?",
  },
  empty: {
    title: "No jobs captured yet",
    description:
      "Open a supported LinkedIn or Indeed job, then capture it from the page so you can compare fit and reopen it in the studio.",
  },
  footer: {
    onboarding: {
      title: "The studio is where the full rewrite happens.",
      cta: "Open RIYP Studio",
    },
    unauthenticated: {
      title: "Stay local here, or open the studio for the full review flow.",
      cta: "Open studio for full review",
    },
    empty: {
      title: "Need deeper feedback instead of another saved role?",
      cta: "Open studio",
    },
    jobs: {
      title: "Open the studio when you want the full recruiter-grade pass.",
      cta: "Open saved jobs in studio",
    },
    error: {
      title: "If the popup fails, the studio is still available.",
      cta: "Open RIYP Studio",
    },
    loading: {
      title: "Loading your saved-job context…",
      cta: "Open RIYP Studio",
    },
  },
};
