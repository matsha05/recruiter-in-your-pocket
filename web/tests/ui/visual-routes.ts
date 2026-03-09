export type VisualRoute = {
  name: string;
  path: string;
  waitFor: string;
  fullPage?: boolean;
  viewport?: { width: number; height: number };
  mockKey?: "jobs-list" | "job-detail" | "report-detail";
};

export const visualRoutes: VisualRoute[] = [
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
  },
  {
    name: "trust",
    path: "/trust",
    waitFor: "[data-visual-anchor='legal-trust']",
    fullPage: true,
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
    name: "workspace-sample",
    path: "/workspace?sample=true",
    waitFor: "#section-first-impression",
    fullPage: true,
  },
  {
    name: "workspace-linkedin",
    path: "/workspace?mode=linkedin",
    waitFor: "[data-visual-anchor='workspace-linkedin-empty']",
    fullPage: true,
  },
  {
    name: "jobs-list",
    path: "/jobs",
    waitFor: "[data-visual-anchor='jobs-page']",
    fullPage: true,
    mockKey: "jobs-list",
  },
  {
    name: "job-detail",
    path: "/jobs/sample-job-id",
    waitFor: "[data-visual-anchor='job-detail-page']",
    fullPage: true,
    mockKey: "job-detail",
  },
  {
    name: "report-detail",
    path: "/reports/sample-report-id-0001",
    waitFor: "[data-visual-anchor='report-detail-page']",
    fullPage: true,
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
