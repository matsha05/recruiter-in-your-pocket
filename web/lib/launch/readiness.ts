import path from "path";
import { existsSync, readFileSync } from "fs";
import { maybeCreateSupabaseServerClient } from "../supabase/serverClient";
import { loadPromptForMode } from "../backend/prompts";
import { getConfiguredExtensionOrigins, launchFlags, requestedLaunchFlags } from "./flags";
import { getConfiguredAppUrl, isHostedProductionRuntime } from "../runtime/appUrl";
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

function isTruthyEnv(value: string | undefined) {
  return ["1", "true", "yes", "on"].includes(String(value || "").trim().toLowerCase());
}

function addCheck(checks: ReadinessCheck[], name: string, status: ReadinessCheckStatus, message: string) {
  checks.push({ name, status, message });
}

function getGoldenFixtureCount() {
  const calibrationPath = path.join(getRepoRoot(), "tests", "fixtures", "calibration.json");
  if (!existsSync(calibrationPath)) return 0;

  try {
    const raw = JSON.parse(readFileSync(calibrationPath, "utf8")) as {
      fixtures?: Array<{ tier?: string }>;
    };
    return (raw.fixtures || []).filter((fixture) => fixture.tier === "golden").length;
  } catch {
    return 0;
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

  const requiredEnv = [
    "SESSION_SECRET",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ];
  const missingEnv = requiredEnv.filter((key) => !process.env[key]);
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
      "STRIPE_PRICE_ID_MONTHLY",
      "STRIPE_PRICE_ID_LIFETIME",
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
    addCheck(checks, "billing_unlock", "disabled", "Billing unlock is disabled by launch flag.");
    addCheck(checks, "billing_webhook", "disabled", "Stripe webhook is disabled because billing is disabled.");
  }

  const extensionOrigins = getConfiguredExtensionOrigins();
  const extensionSyncRequested = requestedLaunchFlags.extensionSync;
  const extensionSyncConfigured = extensionOrigins.length > 0;
  addCheck(
    checks,
    "extension_sync",
    extensionSyncRequested
      ? extensionSyncConfigured
        ? "ok"
        : hostedRuntime
          ? "missing"
          : "disabled"
      : "disabled",
    extensionSyncRequested
      ? extensionSyncConfigured
        ? `Extension sync is enabled with ${extensionOrigins.length} exact allowed origin(s).`
        : hostedRuntime
          ? "Extension sync is enabled, but RIYP_EXTENSION_ORIGINS is empty. Add the exact extension origin before launch."
          : "Extension sync stays dark in this local environment until RIYP_EXTENSION_ORIGINS is configured with an exact extension origin."
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
  const hasRequiredDocs = REQUIRED_LAUNCH_DOCS.every((relativePath) => existsSync(path.join(getRepoRoot(), relativePath)));
  addCheck(
    checks,
    "eval_harness",
    goldenFixtureCount >= 20 ? "ok" : "missing",
    goldenFixtureCount >= 20
      ? `Eval harness includes ${goldenFixtureCount} golden fixtures.`
      : `Eval harness has only ${goldenFixtureCount} golden fixtures. Minimum launch bar is 20.`
  );
  addCheck(
    checks,
    "launch_runbooks",
    hasRequiredDocs ? "ok" : "missing",
    hasRequiredDocs
      ? "Go/no-go docs, vendor review, incident runbook, rehearsal, and shipping gate docs are present."
      : "One or more required launch runbooks are missing."
  );

  const hasTrustFiles = REQUIRED_PUBLIC_TRUST_FILES.every((relativePath) => existsSync(path.join(getRepoRoot(), relativePath)));
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

export type PublicServiceStatus = "operational" | "limited";

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
    status === "fail" ? "limited" : "operational";

  const incidents: string[] = [];
  if (gateStatus("auth") === "fail") {
    incidents.push("Account sign-in, saved history, or secure return flows may be temporarily limited.");
  }
  if (gateStatus("billing") === "fail") {
    incidents.push("Checkout, restore, or receipt access may be temporarily limited.");
  }
  if (gateStatus("extension") === "fail") {
    incidents.push("Extension sync may be limited while local capture and studio review remain available.");
  }

  return {
    ok: snapshot.ok,
    generatedAt: snapshot.generatedAt,
    summary: {
      status: incidents.length === 0 ? "operational" : "limited",
      title: incidents.length === 0 ? "All core systems operational" : "Some features are limited",
      message:
        incidents.length === 0
          ? "Review, saved history, billing, and extension-assisted workflows are currently operating normally."
          : "The product is available, but one or more supporting workflows are currently degraded or limited.",
    },
    services: [
      {
        name: "Review studio",
        status: toPublicStatus(gateStatus("quality")),
        message: "Run recruiter-grade reviews, reopen reports, and continue the core analysis workflow.",
      },
      {
        name: "Account and saved history",
        status: toPublicStatus(gateStatus("auth")),
        message: "Sign in, save reviews, and reopen report history tied to your account.",
      },
      {
        name: "Billing and restore",
        status: toPublicStatus(gateStatus("billing")),
        message: "Start paid access, restore purchases, open receipts, and manage renewals.",
      },
      {
        name: "Extension-assisted workflows",
        status: toPublicStatus(gateStatus("extension")),
        message: "Capture supported jobs, reopen them in the studio, and sync saved roles when enabled.",
      },
    ],
    incidents,
  };
}
