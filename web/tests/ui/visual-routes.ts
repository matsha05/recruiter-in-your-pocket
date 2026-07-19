export type VisualRoute = {
  name: string;
  path: string;
  waitFor: string;
  fullPage?: boolean;
  viewport?: { width: number; height: number };
  mockKey?: "jobs-list" | "job-detail" | "report-detail";
  requires?: "extensionSync" | "linkedInReview";
};

function isEnabled(value: string | undefined) {
  return ["1", "true", "yes", "on"].includes(String(value || "").trim().toLowerCase());
}

const enabledVisualFeatures = {
  extensionSync:
    isEnabled(process.env.NEXT_PUBLIC_ENABLE_EXTENSION_SYNC) &&
    Boolean(process.env.RIYP_EXTENSION_ORIGINS?.trim()),
  linkedInReview: isEnabled(process.env.NEXT_PUBLIC_ENABLE_LINKEDIN_REVIEW),
};

const configuredVisualRoutes: VisualRoute[] = [
  {
    name: "landing-desktop",
    path: "/",
    waitFor: "[data-visual-anchor='landing-home']",
    fullPage: true,
    viewport: { width: 1440, height: 900 },
  },
  {
    name: "landing-mobile",
    path: "/",
    waitFor: "[data-visual-anchor='landing-home']",
    fullPage: true,
    viewport: { width: 390, height: 844 },
  },
  {
    name: "research-desktop",
    path: "/research",
    waitFor: "[data-visual-anchor='research-hub']",
    fullPage: true,
    viewport: { width: 1440, height: 900 },
  },
  {
    name: "research-mobile",
    path: "/research",
    waitFor: "[data-visual-anchor='research-hub']",
    fullPage: true,
    viewport: { width: 390, height: 844 },
  },
  {
    name: "pricing",
    path: "/pricing",
    waitFor: "[data-visual-anchor='pricing-page']",
    fullPage: true,
  },
  {
    name: "pricing-mobile",
    path: "/pricing",
    waitFor: "[data-visual-anchor='pricing-page']",
    fullPage: true,
    viewport: { width: 390, height: 844 },
  },
  {
    name: "auth",
    path: "/auth",
    waitFor: "[data-visual-anchor='auth-page']",
    fullPage: true,
  },
  {
    name: "extension",
    path: "/extension",
    waitFor: "[data-visual-anchor='extension-page']",
    fullPage: true,
    requires: "extensionSync",
  },
  {
    name: "trust",
    path: "/trust",
    waitFor: "[data-visual-anchor='legal-trust']",
    fullPage: true,
  },
  {
    name: "trust-mobile",
    path: "/trust",
    waitFor: "[data-visual-anchor='legal-trust']",
    fullPage: true,
    viewport: { width: 390, height: 844 },
  },
  {
    name: "faq",
    path: "/faq",
    waitFor: "[data-visual-anchor='legal-faq']",
    fullPage: true,
  },
  {
    name: "workspace-empty",
    path: "/workspace",
    waitFor: "[data-visual-anchor='workspace-resume-empty']",
    fullPage: true,
  },
  {
    name: "workspace-empty-mobile",
    path: "/workspace",
    waitFor: "[data-visual-anchor='workspace-resume-empty']",
    fullPage: true,
    viewport: { width: 390, height: 844 },
  },
  {
    name: "workspace-sample",
    path: "/workspace?sample=true",
    waitFor: "#section-first-impression",
    fullPage: true,
  },
  {
    name: "workspace-sample-mobile",
    path: "/workspace?sample=true",
    waitFor: "#section-first-impression",
    fullPage: true,
    viewport: { width: 390, height: 844 },
  },
  {
    name: "workspace-linkedin",
    path: "/workspace?mode=linkedin",
    waitFor: "[data-visual-anchor='workspace-linkedin-empty']",
    fullPage: true,
    requires: "linkedInReview",
  },
  {
    name: "jobs-list",
    path: "/jobs",
    waitFor: "[data-visual-anchor='jobs-page']",
    fullPage: true,
    mockKey: "jobs-list",
    requires: "extensionSync",
  },
  {
    name: "job-detail",
    path: "/jobs/sample-job-id",
    waitFor: "[data-visual-anchor='job-detail-page']",
    fullPage: true,
    mockKey: "job-detail",
    requires: "extensionSync",
  },
  {
    name: "report-detail",
    path: "/reports/sample-report-id-0001",
    waitFor: "[data-visual-anchor='report-detail-page']",
    fullPage: true,
    mockKey: "report-detail",
  },
  {
    name: "report-detail-mobile",
    path: "/reports/sample-report-id-0001",
    waitFor: "[data-visual-anchor='report-detail-page']",
    fullPage: true,
    viewport: { width: 390, height: 844 },
    mockKey: "report-detail",
  },
  {
    name: "launch-dashboard",
    path: "/launch",
    waitFor: "[data-visual-anchor='launch-page']",
    fullPage: true,
  },
  {
    name: "settings-account",
    path: "/settings/account",
    waitFor: "[data-visual-anchor='settings-page']",
    fullPage: true,
  },
  {
    name: "settings-billing",
    path: "/settings/billing",
    waitFor: "[data-visual-anchor='settings-page']",
    fullPage: true,
  },
  {
    name: "settings-matching",
    path: "/settings/matching",
    waitFor: "[data-visual-anchor='settings-page']",
    fullPage: true,
  },
];

export const visualRoutes = configuredVisualRoutes.filter(
  (route) => !route.requires || enabledVisualFeatures[route.requires]
);
