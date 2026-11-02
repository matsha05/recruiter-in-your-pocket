import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

// The root layout and its providers ship on every page, including the text-only
// marketing and research pages. These libraries load after hydration or on
// demand; a static import would put them back on every first load.
const read = (file: string) => readFileSync(path.join(process.cwd(), file), "utf8");

const layout = read("app/layout.tsx");
const appProviders = read("components/providers/AppProviders.tsx");
const authProvider = read("components/providers/AuthProvider.tsx");
const launcher = read("components/CommandPaletteLauncher.tsx");
const sentryClient = read("instrumentation-client.ts");
const nextConfig = read("next.config.mjs");
const toasterLauncher = read("components/ToasterLauncher.tsx");
const toaster = read("components/ui/sonner.tsx");
const appLayout = read("app/(app)/layout.tsx");
const siteHeader = read("components/layout/SiteHeader.tsx");
const pricingPage = read("components/marketing/PricingPageClient.tsx");
// The public site's chrome, on every text page alongside the root layout.
const publicChrome = ["components/layout/SiteHeader.tsx", "components/layout/NavDrawer.tsx", "components/landing/Footer.tsx"];
// Legal pages render on the server, so their text and icons are not client JavaScript.
const serverLegalPages = [
  "components/legal/LegalPageClient.tsx",
  "components/legal/LegalShell.tsx",
  "components/legal/PrivacyClient.tsx",
  "components/legal/TermsClient.tsx",
  "components/legal/FAQClient.tsx",
  "components/legal/TrustClient.tsx",
];
const staticSonnerImport = /^import [^;]*from "sonner"/m;

assert.doesNotMatch(layout, /from "@\/components\/CommandPalette"/, "the root layout loads the command palette through its launcher");
assert.match(layout, /<CommandPaletteLauncher \/>/, "the root layout mounts the command palette launcher");
assert.match(launcher, /import\("@\/components\/CommandPalette"\)/, "the launcher loads the palette on demand");
assert.doesNotMatch(launcher, /^import \{[^}]*\bCommandPalette\b[^}]*\} from/m, "the launcher imports only the palette's types statically");

assert.doesNotMatch(authProvider, /from "@\/lib\/supabase\/browserClient"/, "the account provider does not import the Supabase client statically");
assert.match(authProvider, /import\("@\/lib\/supabase\/browserClient"\)/, "the account provider loads the Supabase client after hydration");

assert.doesNotMatch(appProviders, /\bdom(Max|Animation)\b/, "motion features are not imported into the root providers");
assert.match(appProviders, /import\("@\/lib\/motionFeatures"\)/, "LazyMotion loads its features on demand");

assert.doesNotMatch(layout, /from "@\/components\/ui\/sonner"/, "the root layout loads the Toaster through its launcher");
assert.match(layout, /<ToasterLauncher \/>/, "the root layout mounts the Toaster launcher");
assert.match(toasterLauncher, /import\("@\/components\/ui\/sonner"\)/, "the launcher loads the Toaster after hydration");
assert.doesNotMatch(toasterLauncher, staticSonnerImport, "the launcher does not import sonner statically");
assert.match(toaster, /toast\.getToasts\(\)/, "the Toaster shows toasts raised before it loaded");
for (const [file, source] of [["AuthProvider", authProvider], ["PricingPageClient", pricingPage]] as const) {
  assert.doesNotMatch(source, staticSonnerImport, `${file} does not import sonner statically`);
  assert.match(source, /import\("sonner"\)/, `${file} loads sonner when it raises a toast`);
}

assert.doesNotMatch(appProviders, /@tanstack\/react-query/, "React Query is not part of the root providers");
assert.match(appLayout, /<QueryProvider>/, "app routes provide React Query in their own layout");

assert.doesNotMatch(siteHeader, /from "@\/components\/shared\/UserNav"/, "the public header does not import the account menu statically");
assert.match(siteHeader, /dynamic\(\(\) => import\("@\/components\/shared\/UserNav"\)/, "the public header loads the account menu for signed-in visitors");
for (const file of publicChrome) {
  assert.doesNotMatch(read(file), /from "@\/components\/icons"/, `${file} imports the wordmark directly, not the icon barrel`);
}

for (const file of serverLegalPages) {
  assert.doesNotMatch(read(file), /^"use client"/, `${file} renders on the server`);
}
assert.match(read("lib/legal/content.ts"), /from "@phosphor-icons\/react\/dist\/ssr"/, "legal content uses the server-safe icon build");

assert.match(nextConfig, /RIYP_BUNDLE_ERROR_REPLAY:/, "the build always defines the replay bundling constant");
assert.match(
  nextConfig,
  /RIYP_BUNDLE_ERROR_REPLAY: \["1", "true", "yes", "on"\]\.includes\(/,
  "the replay bundling constant parses the flag like the runtime flag, so \"false\" means off"
);
assert.match(
  sentryClient,
  /integrations: process\.env\.RIYP_BUNDLE_ERROR_REPLAY === "1" && [^\n]*\n\s*\? \[Sentry\.replayIntegration\(\)\]/,
  "Sentry Replay sits behind the inline build constant, which webpack can fold away"
);

console.log("client bundle contract tests passed");
