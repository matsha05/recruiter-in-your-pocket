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

assert.doesNotMatch(layout, /from "@\/components\/CommandPalette"/, "the root layout loads the command palette through its launcher");
assert.match(layout, /<CommandPaletteLauncher \/>/, "the root layout mounts the command palette launcher");
assert.match(launcher, /import\("@\/components\/CommandPalette"\)/, "the launcher loads the palette on demand");
assert.doesNotMatch(launcher, /^import \{[^}]*\bCommandPalette\b[^}]*\} from/m, "the launcher imports only the palette's types statically");

assert.doesNotMatch(authProvider, /from "@\/lib\/supabase\/browserClient"/, "the account provider does not import the Supabase client statically");
assert.match(authProvider, /import\("@\/lib\/supabase\/browserClient"\)/, "the account provider loads the Supabase client after hydration");

assert.doesNotMatch(appProviders, /\bdom(Max|Animation)\b/, "motion features are not imported into the root providers");
assert.match(appProviders, /import\("@\/lib\/motionFeatures"\)/, "LazyMotion loads its features on demand");

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
