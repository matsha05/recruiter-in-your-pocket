import path from "path";
import { existsSync, readFileSync } from "fs";
import { maybeCreateSupabaseServerClient } from "../supabase/serverClient";
import { loadPromptForMode } from "../backend/prompts";
import { getConfiguredExtensionOrigins, launchFlags, requestedLaunchFlags } from "./flags";
import { getConfiguredAppUrl, isHostedProductionRuntime } from "../runtime/appUrl";
import { isRedisRestConfigured } from "../redis/config";
import { liveEvalMeetsLaunchBar, readLiveEvalEvidence } from "./evalEvidence";
import {
  LAUNCH_GATE_DEFINITIONS,
  REQUIRED_LAUNCH_DOCS,
  REQUIRED_PUBLIC_TRUST_FILES,
} from "./program";

export type ReadinessCheckStatus = "ok" | "missing" | "disabled";
export type LaunchGateStatus = "pass" | "warn" | "fail";

export type ReadinessCheck = {
  name: string;
  status: ReadinessCheckStatus;
  message: string;
};

export type LaunchGate = {
  id: string;
  label: string;
  description: string;
  status: LaunchGateStatus;
  checks: string[];
};

export type LaunchBlocker = {
  gateId: string;
  gateLabel: string;
  check: string;
  message: string;
};

export type LaunchReadinessSnapshot = {
  ok: boolean;
  goNoGo: boolean;
  generatedAt: string;
  checks: ReadinessCheck[];
  gates: LaunchGate[];
  blockers: LaunchBlocker[];
};

function getRepoRoot() {
  let current = process.cwd();

  while (true) {
    const looksLikeRepoRoot =
      existsSync(path.join(current, "docs")) &&
      existsSync(path.join(current, "tests")) &&
      existsSync(path.join(current, "web", "package.json"));

    if (looksLikeRepoRoot) {
      return current;
    }

    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }

  return path.resolve(process.cwd(), "..");
}

function findUpward(start: string, targetDir: string) {
  let current = start;
  while (true) {
    const candidate = path.join(current, targetDir);
    if (existsSync(candidate)) return candidate;
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return null;
}

function normalizeRoute(value: string) {
  if (!value.startsWith("/")) return null;
  let route = value.replace(/\\/g, "/");
  route = route.replace(/\/(page|route)$/, "");
  if (route.length > 1 && route.endsWith("/")) {
    route = route.slice(0, -1);
  }
  return route || "/";
}

function collectRoutesFromManifest(manifest: unknown) {
  const routes = new Set<string>();

  const addRoute = (value: string) => {
    const normalized = normalizeRoute(value);
    if (normalized) routes.add(normalized);
  };

  const walk = (value: unknown) => {
    if (!value) return;
    if (typeof value === "string") {
      if (value.startsWith("/")) addRoute(value);
      return;
    }
    if (Array.isArray(value)) {
      for (const item of value) walk(item);
      return;
    }
    if (typeof value === "object") {
      for (const [key, child] of Object.entries(value)) {
        if (key.startsWith("/")) addRoute(key);
        walk(child);
      }
    }
  };

  walk(manifest);
  return routes;
}

function getNextRouteSet(repoRoot: string) {
  const nextDir =
    findUpward(process.cwd(), ".next") ||
    findUpward(repoRoot, ".next");

  if (!nextDir) return null;

  const manifestPaths = [
    path.join(nextDir, "server", "app-paths-manifest.json"),
    path.join(nextDir, "server", "app-path-routes-manifest.json"),
    path.join(nextDir, "app-paths-manifest.json"),
    path.join(nextDir, "app-path-routes-manifest.json"),
    path.join(nextDir, "routes-manifest.json"),
  ];

  for (const manifestPath of manifestPaths) {
    if (!existsSync(manifestPath)) continue;
    try {
      const raw = JSON.parse(readFileSync(manifestPath, "utf8"));
      return collectRoutesFromManifest(raw);
    } catch {
      continue;
    }
  }

  return null;
}

function repoHasDir(repoRoot: string, name: string) {
  return existsSync(path.join(repoRoot, name));
}

function isTruthyEnv(value: string | undefined) {
  return ["1", "true", "yes", "on"].includes(String(value || "").trim().toLowerCase());
}

function addCheck(checks: ReadinessCheck[], name: string, status: ReadinessCheckStatus, message: string) {
  checks.push({ name, status, message });
}

function getGoldenFixtureCount(): number | null {
  const calibrationPath = path.join(getRepoRoot(), "tests", "fixtures", "calibration.json");
  if (!existsSync(calibrationPath)) return null;

  try {
    const raw = JSON.parse(readFileSync(calibrationPath, "utf8")) as {
      fixtures?: Array<{ tier?: string }>;
    };
    return (raw.fixtures || []).filter((fixture) => fixture.tier === "golden").length;
  } catch {
    return null;
  }
}

function deriveGates(checks: ReadinessCheck[]): { gates: LaunchGate[]; blockers: LaunchBlocker[] } {
  const checkMap = new Map(checks.map((check) => [check.name, check]));
  const blockers: LaunchBlocker[] = [];

  const gates = LAUNCH_GATE_DEFINITIONS.map((definition) => {
    const gateChecks = definition.checks
      .map((name) => checkMap.get(name))
      .filter((check): check is ReadinessCheck => Boolean(check));

    const hasMissing = gateChecks.some((check) => check.status === "missing");
    const hasDisabled = gateChecks.some((check) => check.status === "disabled");

    if (hasMissing) {
      for (const check of gateChecks.filter((item) => item.status === "missing")) {
        blockers.push({
          gateId: definition.id,
          gateLabel: definition.label,
          check: check.name,
          message: check.message,
        });
      }
    }

    return {
      ...definition,
      status: hasMissing ? "fail" : hasDisabled ? "warn" : "pass",
    } satisfies LaunchGate;
  });

  return { gates, blockers };
}

export async function getLaunchReadinessSnapshot(): Promise<LaunchReadinessSnapshot> {
  const checks: ReadinessCheck[] = [];
  const hostedRuntime = isHostedProductionRuntime();
  const repoRoot = getRepoRoot();
  const hasDocsDir = repoHasDir(repoRoot, "docs");
  const hasTestsDir = repoHasDir(repoRoot, "tests");
  const hasWebAppDir = existsSync(path.join(repoRoot, "web", "app"));

  const requiredEnv = [
    "SESSION_SECRET",
    "NEXT_PUBLIC_SUPABASE_URL",
  ];
  const missingEnv = requiredEnv.filter((key) => !process.env[key]);
  if (!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY && !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    missingEnv.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  if (!process.env.SUPABASE_SECRET_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    missingEnv.push("SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY");
  }
  const mock = ["1", "true", "TRUE"].includes(String(process.env.USE_MOCK_OPENAI || "").trim());
  if (!mock && !process.env.OPENAI_API_KEY) {
    missingEnv.push("OPENAI_API_KEY");
  }

  addCheck(
    checks,
    "runtime_env",
    missingEnv.length === 0 ? "ok" : "missing",
    missingEnv.length === 0 ? "Core runtime environment is configured." : `Missing env: ${missingEnv.join(", ")}`
  );

  const sharedRateLimitConfigured = isRedisRestConfigured();
  addCheck(
    checks,
    "shared_rate_limit",
    sharedRateLimitConfigured ? "ok" : hostedRuntime ? "missing" : "disabled",
    sharedRateLimitConfigured
      ? "Shared rate limiting and idempotency are configured."
      : hostedRuntime
        ? "A compatible Upstash or Vercel KV REST credential pair is required for paid beta traffic."
        : "Shared rate limiting is not configured in this local environment."
  );

  addCheck(
    checks,
    "auth_callback",
    getConfiguredAppUrl()
      ? "ok"
      : isHostedProductionRuntime()
        ? "missing"
        : "disabled",
    getConfiguredAppUrl()
      ? `Auth callbacks can return to ${getConfiguredAppUrl()}.`
      : isHostedProductionRuntime()
        ? "NEXT_PUBLIC_APP_URL must be set to an absolute app URL for auth return paths."
        : "Auth callbacks can fall back to the current request origin in local or preview environments. Set NEXT_PUBLIC_APP_URL before production launch."
  );

  if (launchFlags.billingUnlock) {
    const missingBilling = [
      "STRIPE_SECRET_KEY",
      "STRIPE_WEBHOOK_SECRET",
      "STRIPE_PRICE_ID_30D",
      "STRIPE_PRODUCT_ID_30D",
    ].filter((key) => !process.env[key]);
    addCheck(
      checks,
      "billing_unlock",
      missingBilling.length === 0 ? "ok" : "missing",
      missingBilling.length === 0 ? "Billing unlock flow is configured." : `Missing billing env: ${missingBilling.join(", ")}`
    );
    addCheck(
      checks,
      "billing_webhook",
      process.env.STRIPE_WEBHOOK_SECRET ? "ok" : "missing",
      process.env.STRIPE_WEBHOOK_SECRET
        ? "Stripe webhook verification secret is configured."
        : "STRIPE_WEBHOOK_SECRET is required for billing go/no-go."
    );
  } else {
    addCheck(
      checks,
      "billing_unlock",
      hostedRuntime ? "missing" : "disabled",
      hostedRuntime
        ? "Billing unlock must be explicitly enabled for the paid beta."
        : "Billing unlock is disabled by launch flag in this local environment."
    );
    addCheck(
      checks,
      "billing_webhook",
      hostedRuntime ? "missing" : "disabled",
      hostedRuntime
        ? "Stripe webhook configuration is required for the paid beta."
        : "Stripe webhook is disabled because billing is disabled."
    );
  }

  const extensionOrigins = getConfiguredExtensionOrigins();
  const extensionSyncRequested = requestedLaunchFlags.extensionSync;
  const extensionSyncConfigured = extensionOrigins.length > 0;
  const extensionSyncEnabled = launchFlags.extensionSync;
  addCheck(
    checks,
    "extension_sync",
    extensionSyncEnabled ? "ok" : "disabled",
    extensionSyncEnabled
      ? `Extension sync is enabled with ${extensionOrigins.length} exact allowed origin(s).`
      : extensionSyncRequested
        ? "Extension sync was requested, but it remains off until RIYP_EXTENSION_ORIGINS is configured with an exact extension origin."
        : "Extension sync is disabled by launch flag until exact extension origins are configured."
  );

  addCheck(
    checks,
    "public_share_links",
    launchFlags.publicShareLinks ? "missing" : "disabled",
    launchFlags.publicShareLinks
      ? "Public share links are enabled, but launch only permits them after a dedicated share model ships."
      : "Public share links are intentionally disabled until the launch gate passes."
  );

  addCheck(
    checks,
    "guest_report_save",
    launchFlags.guestReportSave ? "missing" : "disabled",
    launchFlags.guestReportSave
      ? "Guest report save is enabled, but launch requires a verified ownership flow first."
      : "Guest report save is intentionally disabled pending verified ownership."
  );

  addCheck(
    checks,
    "analytics_configuration",
    launchFlags.analytics
      ? process.env.NEXT_PUBLIC_MIXPANEL_TOKEN
        ? "ok"
        : "missing"
      : "disabled",
    launchFlags.analytics
      ? process.env.NEXT_PUBLIC_MIXPANEL_TOKEN
        ? "Analytics is enabled with Mixpanel configured."
        : "Analytics is enabled but NEXT_PUBLIC_MIXPANEL_TOKEN is missing."
      : "Analytics is disabled by launch flag."
  );

  addCheck(
    checks,
    "error_replay",
    launchFlags.errorReplay ? "missing" : "disabled",
    launchFlags.errorReplay
      ? "Error replay is enabled. Keep it disabled unless privacy review explicitly approves it."
      : "Error replay remains disabled by default."
  );

  await loadPromptForMode("resume");
  await loadPromptForMode("resume_ideas");
  addCheck(checks, "prompt_assets", "ok", "Prompt assets are readable.");

  const goldenFixtureCount = getGoldenFixtureCount();
  if (goldenFixtureCount === null) {
    addCheck(
      checks,
      "eval_harness",
      hostedRuntime && !hasTestsDir ? "disabled" : "missing",
      hostedRuntime && !hasTestsDir
        ? "Eval harness fixtures live in the repo and are validated via CI before launch."
        : "Eval harness calibration.json is missing or unreadable."
    );
  } else {
    addCheck(
      checks,
      "eval_harness",
      goldenFixtureCount >= 20 ? "ok" : "missing",
      goldenFixtureCount >= 20
        ? `Eval harness includes ${goldenFixtureCount} golden fixtures.`
        : `Eval harness has only ${goldenFixtureCount} golden fixtures. Minimum launch bar is 20.`
    );
  }

  const liveEvalEvidence = readLiveEvalEvidence(repoRoot);
  const liveEvalReady = liveEvalMeetsLaunchBar(liveEvalEvidence);
  addCheck(
    checks,
    "live_model_eval",
    liveEvalReady ? "ok" : "missing",
    liveEvalReady && liveEvalEvidence
      ? `Live eval ${liveEvalEvidence.runId} passed the launch bar: ${liveEvalEvidence.passed}/${liveEvalEvidence.total} pass, ${liveEvalEvidence.failed} fail.`
      : liveEvalEvidence
        ? `Latest live eval ${liveEvalEvidence.runId} is below launch bar: ${liveEvalEvidence.passed}/${liveEvalEvidence.total} pass, ${liveEvalEvidence.warned} warn, ${liveEvalEvidence.failed} fail.`
        : "A current live model eval is required. Dry-run fixture validation is not launch evidence."
  );

  const hasRequiredDocs = REQUIRED_LAUNCH_DOCS.every((relativePath) => existsSync(path.join(repoRoot, relativePath)));
  addCheck(
    checks,
    "launch_runbooks",
    hasRequiredDocs ? "ok" : hostedRuntime && !hasDocsDir ? "disabled" : "missing",
    hasRequiredDocs
      ? "Go/no-go docs, vendor review, incident runbook, rehearsal, and shipping gate docs are present."
      : hostedRuntime && !hasDocsDir
        ? "Launch runbooks are tracked in the repo and verified during launch readiness reviews."
        : "One or more required launch runbooks are missing."
  );

  const hasTrustFiles =
    REQUIRED_PUBLIC_TRUST_FILES.every((relativePath) => existsSync(path.join(repoRoot, relativePath))) ||
    (() => {
      if (hasWebAppDir) return false;
      const routes = getNextRouteSet(repoRoot);
      if (!routes) return false;
      const requiredRoutes = [
        "/privacy",
        "/security",
        "/methodology",
        "/status",
        "/.well-known/security.txt",
        "/robots.txt",
        "/sitemap.xml",
      ];
      return requiredRoutes.every((route) => {
        if (routes.has(route)) return true;
        if (route === "/robots.txt" && routes.has("/robots")) return true;
        if (route === "/sitemap.xml" && routes.has("/sitemap")) return true;
        return false;
      });
    })();
  addCheck(
    checks,
    "public_trust_surfaces",
    hasTrustFiles ? "ok" : "missing",
    hasTrustFiles
      ? "Privacy, security, methodology, status, security.txt, robots, and sitemap surfaces are present."
      : "One or more public trust files are missing."
  );

  if (isTruthyEnv(process.env.SKIP_DB_READY_CHECK)) {
    addCheck(checks, "database", "disabled", "Database readiness check skipped for local test harness.");
  } else {
    try {
      const supabase = await maybeCreateSupabaseServerClient();

      if (!supabase) {
        addCheck(
          checks,
          "database",
          hostedRuntime ? "missing" : "disabled",
          hostedRuntime
            ? "Database readiness check requires Supabase environment variables."
            : "Database readiness is not configured in this local environment."
        );
      } else {
        const { error } = await supabase.from("user_profiles").select("id").limit(1);
        addCheck(
          checks,
          "database",
          error ? (hostedRuntime ? "missing" : "disabled") : "ok",
          error
            ? hostedRuntime
              ? `Database not ready: ${error.message}`
              : `Database readiness could not be verified from this local environment: ${error.message}`
            : "Database connectivity check passed."
        );
      }
    } catch (error: any) {
      addCheck(
        checks,
        "database",
        hostedRuntime ? "missing" : "disabled",
        hostedRuntime
          ? error?.message || "Database connectivity check failed."
          : `Database readiness could not be verified from this local environment: ${error?.message || "connectivity check failed."}`
      );
    }
  }

  const { gates, blockers } = deriveGates(checks);
  const ok = checks.every((check) => check.status !== "missing");

  return {
    ok,
    goNoGo: blockers.length === 0,
    generatedAt: new Date().toISOString(),
    checks,
    gates,
    blockers,
  };
}

export type PublicServiceStatus = "configured" | "limited";

export type PublicStatusSnapshot = {
  ok: boolean;
  generatedAt: string;
  summary: {
    status: PublicServiceStatus;
    title: string;
    message: string;
  };
  services: Array<{
    name: string;
    status: PublicServiceStatus;
    message: string;
  }>;
  incidents: string[];
};

export async function getPublicStatusSnapshot(): Promise<PublicStatusSnapshot> {
  const snapshot = await getLaunchReadinessSnapshot();
  const gateMap = new Map(snapshot.gates.map((gate) => [gate.id, gate.status]));
  const gateStatus = (id: string) => gateMap.get(id) || "pass";
  const toPublicStatus = (status: LaunchGateStatus): PublicServiceStatus =>
    status === "fail" ? "limited" : "configured";

  const incidents: string[] = [];
  if (gateStatus("quality") === "fail") {
    incidents.push("The review studio remains limited while report quality is being calibrated against the launch bar.");
  }
  if (gateStatus("auth") === "fail") {
    incidents.push("Account sign-in, saved history, or secure return flows may be temporarily limited.");
  }
  if (gateStatus("billing") === "fail") {
    incidents.push("Checkout, restore, or receipt access may be temporarily limited.");
  }
  if (gateStatus("extension") === "fail") {
    incidents.push("Extension sync may be limited while local capture and studio review remain available.");
  }

  const services: PublicStatusSnapshot["services"] = [
    {
      name: "Review studio",
      status: toPublicStatus(gateStatus("quality")),
      message: "Required review assets and configuration are present; live availability is not measured here.",
    },
    {
      name: "Account and saved history",
      status: toPublicStatus(gateStatus("auth")),
      message: "Required account configuration is present; live availability is not measured here.",
    },
    {
      name: "Billing and restore",
      status: toPublicStatus(gateStatus("billing")),
      message: "Required billing configuration is present when paid access is enabled.",
    },
    ...(launchFlags.extensionSync
      ? [{
          name: "Extension-assisted workflows",
          status: toPublicStatus(gateStatus("extension")),
          message: "Extension sync reports configured status only when the private beta is enabled.",
        }]
      : []),
  ];
  const ok = services.every((service) => service.status === "configured") && incidents.length === 0;

  return {
    ok,
    generatedAt: snapshot.generatedAt,
    summary: {
      status: ok ? "configured" : "limited",
      title: ok ? "Core launch checks configured" : "Some features are limited",
      message:
        ok
          ? "This page reports configuration readiness, not real-time uptime. Contact support if a workflow is unavailable."
          : "One or more required configurations are incomplete. This page does not provide real-time uptime monitoring.",
    },
    services,
    incidents,
  };
}
