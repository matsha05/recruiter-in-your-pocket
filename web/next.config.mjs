import { withSentryConfig } from "@sentry/nextjs";
import { fileURLToPath } from "url";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    BROWSERSLIST_IGNORE_OLD_DATA: "true",
    BASELINE_BROWSER_MAPPING_IGNORE_OLD_DATA: "true",
  },
  outputFileTracingRoot: fileURLToPath(new URL(".", import.meta.url)),
  turbopack: {
    // Keep Next's root inside web/ even with a monorepo lockfile.
    root: fileURLToPath(new URL(".", import.meta.url))
  },
  images: {
    qualities: [75, 100]
  }
};

const uploadSentrySourcemaps = process.env.SENTRY_UPLOAD_SOURCEMAPS === "true";
const sentryTunnelRoute = process.env.SENTRY_TUNNEL_ROUTE || undefined;

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
  widenClientFileUpload: uploadSentrySourcemaps,

  sourcemaps: {
    disable: !uploadSentrySourcemaps,
  },

  // Sentry tunneling is useful for ad blockers, but it adds proxy routes and server load.
  // Keep it opt-in so Vercel Git deployments stay on the simplest routing surface.
  ...(sentryTunnelRoute ? { tunnelRoute: sentryTunnelRoute } : {}),

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
