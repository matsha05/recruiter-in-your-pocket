import { withSentryConfig } from "@sentry/nextjs";
import { readFileSync } from "node:fs";
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
  reactStrictMode: true,
  poweredByHeader: false,
  webpack(config, { webpack }) {
    config.module.rules.push({
      test: /\.txt$/,
      type: "asset/source",
    });
    config.plugins.push(new webpack.DefinePlugin({
      __RIYP_GAUNTLET_MANIFEST_JSON__: JSON.stringify(gauntletDefinitionSources.manifest),
      __RIYP_GAUNTLET_BASELINE_JSON__: JSON.stringify(gauntletDefinitionSources.baseline),
      __RIYP_GAUNTLET_ITERATION_002_JSON__: JSON.stringify(gauntletDefinitionSources.iteration002),
    }));
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
      ...(!extensionSyncEnabled ? [{
        source: "/extension",
        destination: "/workspace",
        permanent: true,
      }] : []),
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
  },
  outputFileTracingRoot: fileURLToPath(new URL(".", import.meta.url)),
  outputFileTracingIncludes: {
    "/*": [
      "./public/assets/fonts/space-grotesk-latin-variable.ttf",
      "./public/assets/fonts/space-grotesk-bold.ttf",
      "./public/assets/fonts/instrument-sans-latin-variable.ttf",
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
    root: fileURLToPath(new URL(".", import.meta.url))
  },
  images: {
    qualities: [75, 100]
  }
};

export default withSentryConfig(nextConfig, {
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
