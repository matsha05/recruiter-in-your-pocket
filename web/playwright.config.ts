import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/ui",
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || "http://127.0.0.1:3100",
    headless: true,
    viewport: { width: 1440, height: 900 },
    trace: "retain-on-failure",
  },
  webServer: process.env.PLAYWRIGHT_SKIP_WEB_SERVER === "1" ? undefined : {
    command: "node scripts/launch-smoke-server.cjs",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: true,
    timeout: 240_000,
    env: {
      ...process.env,
      USE_MOCK_OPENAI: process.env.USE_MOCK_OPENAI || "1",
      SKIP_DB_READY_CHECK: process.env.SKIP_DB_READY_CHECK || "1",
      SESSION_SECRET: process.env.SESSION_SECRET || "playwright-session-secret",
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3100",
      NEXT_PUBLIC_ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS || "false",
      NEXT_PUBLIC_ENABLE_BILLING_UNLOCK: process.env.NEXT_PUBLIC_ENABLE_BILLING_UNLOCK || "false",
      NEXT_PUBLIC_ENABLE_EXTENSION_SYNC: process.env.NEXT_PUBLIC_ENABLE_EXTENSION_SYNC || "false",
      NEXT_PUBLIC_ENABLE_GUEST_REPORT_SAVE: process.env.NEXT_PUBLIC_ENABLE_GUEST_REPORT_SAVE || "false",
      NEXT_PUBLIC_ENABLE_PUBLIC_SHARE_LINKS: process.env.NEXT_PUBLIC_ENABLE_PUBLIC_SHARE_LINKS || "false",
      NEXT_PUBLIC_ENABLE_ERROR_REPLAY: process.env.NEXT_PUBLIC_ENABLE_ERROR_REPLAY || "false",
    },
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
});
