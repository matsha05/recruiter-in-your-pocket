import fs from "node:fs";
import path from "node:path";
import {
  isValidAuthEmail,
  normalizeAuthContext,
  normalizeAuthEmail,
  safeAuthRedirect,
} from "../lib/auth/utils";
import { getAppUrlForRequest, getConfiguredAppUrl } from "../lib/runtime/appUrl";
import { PRIVATE_ROUTE_ROBOTS } from "../lib/seo/privateRouteMetadata";
import { getAuthCopy } from "../lib/auth/content";

function assertEqual(actual: unknown, expected: unknown, label: string) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, received ${actual}`);
  }
}

const fallback = "/workspace";

assertEqual(safeAuthRedirect("/reports/123?tab=evidence#top", fallback), "/reports/123?tab=evidence#top", "keeps internal path");
assertEqual(safeAuthRedirect("//evil.example", fallback), fallback, "rejects protocol-relative redirect");
assertEqual(safeAuthRedirect("/%2F%2Fevil.example", fallback), fallback, "rejects encoded protocol-relative redirect");
assertEqual(safeAuthRedirect("/\\evil.example", fallback), fallback, "rejects backslash redirect");
assertEqual(safeAuthRedirect("https://evil.example", fallback), fallback, "rejects absolute redirect");
assertEqual(safeAuthRedirect("/%E0%A4%A", fallback), fallback, "rejects malformed encoding");
assertEqual(normalizeAuthContext("reports"), "history", "report history receives its authored sign-in context");
assertEqual(normalizeAuthContext("purchase"), "paywall", "purchase recovery receives the billing sign-in context");
assertEqual(normalizeAuthContext("extension"), "extension", "extension sync receives its authored sign-in context");
assertEqual(normalizeAuthEmail("  Person+Test@Example.com "), "person+test@example.com", "auth email is normalized once");
assertEqual(isValidAuthEmail("person+test@example.com"), true, "normal email is accepted");
assertEqual(isValidAuthEmail("not-an-email"), false, "malformed email is rejected");
assertEqual(isValidAuthEmail("person@example"), false, "email without a domain suffix is rejected");
assertEqual(isValidAuthEmail(`${"a".repeat(250)}@example.com`), false, "oversized email is rejected");
assertEqual(PRIVATE_ROUTE_ROBOTS.index, false, "private surfaces opt out of indexing");
assertEqual(PRIVATE_ROUTE_ROBOTS.follow, false, "private surfaces opt out of link following");
assertEqual(PRIVATE_ROUTE_ROBOTS.googleBot.index, false, "Googlebot receives the private route policy");

const defaultAuthCopy = getAuthCopy("default");
assertEqual(/jobs|role context/i.test(defaultAuthCopy.subtext), false, "default sign-in does not promise disabled job sync");
assertEqual(getAuthCopy("extension"), defaultAuthCopy, "disabled extension sign-in uses available account benefits");
assertEqual(getAuthCopy("paywall"), defaultAuthCopy, "disabled billing sign-in does not promise purchase recovery");
assertEqual(/billing|receipts|restore/i.test(JSON.stringify(getAuthCopy("settings"))), false, "settings copy omits disabled billing");
assertEqual(/jobs/i.test(getAuthCopy("default", { extensionEnabled: true }).subtext), true, "enabled job sync is named in default account copy");
assertEqual(/saved jobs/i.test(getAuthCopy("extension", { extensionEnabled: true }).subtext), true, "enabled extension sign-in describes job sync");
assertEqual(/receipts.*restore/i.test(getAuthCopy("settings", { billingEnabled: true }).subtext), true, "enabled billing settings describe receipt and recovery access");
assertEqual(/pass|purchase/i.test(getAuthCopy("paywall", { billingEnabled: true }).subtext), true, "enabled paid access uses purchase-specific copy");

for (const routeFile of [
  "app/(app)/layout.tsx",
  "app/auth/page.tsx",
  "app/(public)/signin/page.tsx",
  "app/dashboard/layout.tsx",
  "app/(marketing)/purchase/layout.tsx",
]) {
  const source = fs.readFileSync(path.resolve(process.cwd(), routeFile), "utf8");
  assertEqual(
    source.includes("PRIVATE_ROUTE_ROBOTS"),
    true,
    `${routeFile} applies the private route metadata policy`
  );
}

const proxySource = fs.readFileSync(path.resolve(process.cwd(), "proxy.ts"), "utf8");
const proxyHelperSource = fs.readFileSync(path.resolve(process.cwd(), "lib/supabase/proxy.ts"), "utf8");
const callbackSource = fs.readFileSync(path.resolve(process.cwd(), "app/auth/callback/route.ts"), "utf8");
const authProviderSource = fs.readFileSync(path.resolve(process.cwd(), "components/providers/AuthProvider.tsx"), "utf8");
const authFlowSource = fs.readFileSync(path.resolve(process.cwd(), "components/auth/AuthFlow.tsx"), "utf8");

assertEqual(proxySource.includes("updateSupabaseSession(request)"), true, "proxy refreshes scoped auth sessions");
assertEqual(proxySource.includes('"/api/:path*"'), true, "API routes receive refreshed auth cookies");
assertEqual(proxySource.includes('"/research/:path*"'), false, "public research stays static and cacheable");
assertEqual(proxyHelperSource.includes("supabase.auth.getClaims()"), true, "proxy verifies claims instead of trusting cookie data");
assertEqual(proxyHelperSource.includes("Object.entries(cacheHeaders)"), true, "proxy forwards anti-caching headers with refreshed cookies");
assertEqual(callbackSource.includes("getAll()"), true, "auth callback uses the current bulk cookie API");
assertEqual(callbackSource.includes("error.message"), false, "auth callback does not expose provider errors in the URL");
assertEqual(authProviderSource.includes("if (!response.ok)"), true, "client sign-out does not hide a server failure");
assertEqual(authProviderSource.includes('window.location.replace("/")'), true, "client sign-out clears private in-memory state and report history");
assertEqual(authFlowSource.includes('data?.errorCode === "rate_limited"'), true, "auth explains provider email throttling instead of showing a generic failure");
assertEqual(authFlowSource.includes("Send a sign-in link instead"), false, "auth does not promise an email mode controlled by the shared Supabase template");

const runtimeKeys = ["NEXT_PUBLIC_APP_URL", "VERCEL_ENV", "VERCEL_URL"] as const;
const previousRuntime = Object.fromEntries(runtimeKeys.map((key) => [key, process.env[key]]));

try {
  process.env.NEXT_PUBLIC_APP_URL = "https://www.recruiterinyourpocket.com/ignored-path";
  process.env.VERCEL_ENV = "preview";
  process.env.VERCEL_URL = "riyp-git-preview-matt.vercel.app";

  assertEqual(
    getConfiguredAppUrl(),
    "https://riyp-git-preview-matt.vercel.app",
    "preview configuration prefers the Vercel deployment"
  );
  assertEqual(
    getAppUrlForRequest(new Request("https://branch-alias.vercel.app/api/auth/send-code")),
    "https://riyp-git-preview-matt.vercel.app",
    "preview callback stays on the preview deployment"
  );

  delete process.env.VERCEL_URL;
  assertEqual(
    getAppUrlForRequest(new Request("https://branch-alias.vercel.app/api/auth/send-code")),
    "https://branch-alias.vercel.app",
    "preview callback falls back to the request origin"
  );

  delete process.env.VERCEL_ENV;
  assertEqual(
    getAppUrlForRequest(new Request("http://127.0.0.1:3101/api/auth/send-code")),
    "http://127.0.0.1:3101",
    "local callback does not escape to a configured production URL"
  );

  process.env.VERCEL_ENV = "production";
  assertEqual(
    getAppUrlForRequest(new Request("https://deployment.vercel.app/api/checkout")),
    "https://www.recruiterinyourpocket.com",
    "production callback uses the configured canonical origin"
  );
} finally {
  for (const key of runtimeKeys) {
    const previous = previousRuntime[key];
    if (previous === undefined) delete process.env[key];
    else process.env[key] = previous;
  }
}

console.log("✅ PASS: auth redirects, callbacks, and private metadata stay on the intended origin");
