import bundleAnalyzer from "@next/bundle-analyzer";
import { withSentryConfig } from "@sentry/nextjs/config";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "url";

const isDevelopment = process.env.NODE_ENV === "development";
const extensionSyncEnabled = /^(1|true|yes|on)$/i.test(
  String(process.env.NEXT_PUBLIC_ENABLE_EXTENSION_SYNC || "")
);
const gauntletDefinitionSources = {
  manifest: readFileSync(new URL("./gauntlet/manifest.json", import.meta.url), "utf8"),
  baseline: readFileSync(new URL("./gauntlet/iterations/iteration-000-baseline.json", import.meta.url), "utf8"),
  iteration002: readFileSync(new URL("./gauntlet/iterations/iteration-002.json", import.meta.url), "utf8"),
};
// The trust cluster collapses into Privacy, Terms and Help. A retired page redirects only once its
// destination page exists on disk, so the Experience build can land the new page in its own change.
const retiredRoutes = JSON.parse(readFileSync(new URL("./lib/seo/retired-routes.json", import.meta.url), "utf8")).routes;
const routeGroups = ["", "(marketing)", "(public)", "(editorial)", "(app)"];
const pageExists = (route) => routeGroups.some((group) =>
  existsSync(fileURLToPath(new URL(`./app/${group ? `${group}/` : ""}${route.replace(/^\//, "")}/page.tsx`, import.meta.url))));
const activeRetiredRedirects = retiredRoutes
  .filter((route) => pageExists(route.destination))
  .map((route) => ({ source: route.source, destination: route.destination, permanent: true }));

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self' https://api-js.mixpanel.com https://*.mixpanel.com https://*.supabase.co wss://*.supabase.co https://*.ingest.sentry.io https://*.ingest.us.sentry.io https://*.vercel-insights.com",
  "worker-src 'self' blob:",
  "media-src 'self' data: blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "manifest-src 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Repository guidance is maintained explicitly; dev must not rewrite release inputs.
  agentRules: false,
  reactStrictMode: true,
  poweredByHeader: false,
  // Defined for both bundlers: production builds use webpack, while the
  // red-team journeys run Next dev on Turbopack to stay within CI memory.
  compiler: {
    define: {
      __RIYP_GAUNTLET_MANIFEST_JSON__: JSON.stringify(gauntletDefinitionSources.manifest),
      __RIYP_GAUNTLET_BASELINE_JSON__: JSON.stringify(gauntletDefinitionSources.baseline),
      __RIYP_GAUNTLET_ITERATION_002_JSON__: JSON.stringify(gauntletDefinitionSources.iteration002),
    },
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.txt$/,
      type: "asset/source",
    });
    return config;
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      // The methodology article and page were merged into one "How the report works" page.
      { source: "/research/how-we-score", destination: "/methodology", permanent: true },
      // Progress isn't a surface we show a customer yet (audit, Nov 5, 2026): signed in or not, it lands on My reports.
      { source: "/dashboard", destination: "/reports", permanent: false },
      ...activeRetiredRedirects,
      ...(!extensionSyncEnabled ? [{
        source: "/extension",
        destination: "/workspace",
        permanent: true,
      }] : []),
      // One hop each. "/guides/:path*" alone sends /guides to /resources/ and then
      // to /resources, and the calculator's short URLs to a 404.
      { source: "/guides", destination: "/resources", permanent: true },
      { source: "/guides/comp-calculator", destination: "/resources/tools/comp-calculator", permanent: true },
      { source: "/resources/comp-calculator", destination: "/resources/tools/comp-calculator", permanent: true },
      {
        source: "/guides/:path*",
        destination: "/resources/:path*",
        permanent: true,
      },
    ];
  },
  env: {
    BROWSERSLIST_IGNORE_OLD_DATA: "true",
    BASELINE_BROWSER_MAPPING_IGNORE_OLD_DATA: "true",
    // Always defined, so the client bundle can drop Sentry Replay at build time
    // when the replay flag is off. An unset NEXT_PUBLIC_* stays a runtime lookup.
    // Parsed like lib/launch/flags.ts, so "false" or "0" means off.
    RIYP_BUNDLE_ERROR_REPLAY: ["1", "true", "yes", "on"].includes(
      (process.env.NEXT_PUBLIC_ENABLE_ERROR_REPLAY ?? "").trim().toLowerCase()
    ) ? "1" : "0",
  },
  outputFileTracingRoot: fileURLToPath(new URL(".", import.meta.url)),
  outputFileTracingIncludes: {
    "/*": [
      "./public/fonts/literata/Literata-Variable.woff2",
      "./public/fonts/literata/Literata-Regular.woff",
      "./public/fonts/literata/Literata-Italic.woff",
      "./public/fonts/schibsted-grotesk/SchibstedGrotesk-Variable.woff2",
      "./public/fonts/schibsted-grotesk/SchibstedGrotesk-Regular.woff",
      "./public/fonts/schibsted-grotesk/SchibstedGrotesk-Semibold.woff",
      "./public/fonts/schibsted-grotesk/SchibstedGrotesk-ExtraBold.woff",
    ],
    // Sparticuz resolves these runtime payloads dynamically, so Next's file
    // tracer cannot discover them from the executablePath() call alone.
    "/api/export-pdf": [
      "./node_modules/@sparticuz/chromium/bin/chromium.br",
      "./node_modules/@sparticuz/chromium/bin/fonts.tar.br",
      "./node_modules/@sparticuz/chromium/bin/swiftshader.tar.br",
      "./node_modules/@sparticuz/chromium/bin/al2023.tar.br",
    ],
  },
  turbopack: {
    // Keep Next's root inside web/ even with a monorepo lockfile.
    root: fileURLToPath(new URL(".", import.meta.url)),
    // Match webpack's asset/source rule: prompts import as strings.
    rules: {
      "*.txt": { type: "text" },
    },
  },
  images: {
    qualities: [75, 100]
  }
};

// `npm run analyze` writes per-route bundle treemaps to .next/analyze.
const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === "true", openAnalyzer: false });

export default withSentryConfig(withBundleAnalyzer(nextConfig), {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "recruiter-in-your-pocket",

  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Source maps exist only to be uploaded. Without a token Sentry would still have
  // webpack build them, which roughly doubles server output and pushes a cold build
  // past a 2 GB heap, so only build them when they can be uploaded.
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  }
});
