import assert from "node:assert/strict";
import Module from "node:module";
import path from "node:path";
import { NextRequest } from "next/server";

type RuntimeModule = typeof Module & {
  _load: (request: string, parent: NodeModule | null, isMain: boolean) => unknown;
};

const envNames = ["NODE_ENV", "VERCEL_ENV", "VERCEL_URL", "NEXT_PUBLIC_APP_URL"] as const;
type OriginEnvironment = Partial<Record<(typeof envNames)[number], string>>;

async function run() {
  const originalEnv = Object.fromEntries(envNames.map(name => [name, process.env[name]]));
  const mutableEnv = process.env as Record<string, string | undefined>;
  const runtimeModule = Module as RuntimeModule;
  const originalLoad = runtimeModule._load;
  let authChecks = 0;

  runtimeModule._load = function loadWithOriginMocks(request, parent, isMain) {
    if (request === "@/lib/supabase/serverClient") {
      return {
        createSupabaseServerClient: async () => ({
          auth: {
            getUser: async () => {
              authChecks += 1;
              return { data: { user: null } };
            },
          },
        }),
      };
    }
    if (request === "@/lib/supabase/adminClient") {
      return { createSupabaseAdminClient: () => { throw new Error("Origin checks must not reach storage."); } };
    }
    if (request.startsWith("@/")) {
      return originalLoad(path.join(process.cwd(), request.slice(2)), parent, isMain);
    }
    return originalLoad(request, parent, isMain);
  };

  try {
    const { POST } = require("../app/api/reports/recovery/route") as {
      POST: (request: NextRequest) => Promise<Response>;
    };
    const check = async (
      description: string,
      env: OriginEnvironment,
      requestOrigin: string,
      origin: string | null,
      allowed: boolean,
      extraHeaders: Record<string, string> = {},
    ) => {
      for (const name of envNames) {
        if (env[name] === undefined) delete mutableEnv[name];
        else mutableEnv[name] = env[name];
      }
      const before = authChecks;
      const response = await POST(new NextRequest(`${requestOrigin}/api/reports/recovery`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(origin === null ? {} : { origin }),
          ...extraHeaders,
        },
        body: JSON.stringify({ recovery_id: "10000000-0000-4000-8000-000000000001" }),
      }));
      assert.equal(response.status, allowed ? 401 : 403, description);
      assert.equal((await response.json()).errorCode, allowed ? "AUTH_REQUIRED" : "INVALID_ORIGIN", description);
      assert.equal(authChecks - before, allowed ? 1 : 0, `${description}: rejected origins must stop before authentication`);
      assert.match(response.headers.get("cache-control") || "", /no-store/u, description);
    };

    const deployment = "https://riyp-immutable-test.vercel.app";
    const production = "https://www.recruiterinyourpocket.com";
    const branchAlias = "https://riyp-launch-branch.vercel.app";
    const preview = {
      NODE_ENV: "production",
      VERCEL_ENV: "preview",
      VERCEL_URL: "riyp-immutable-test.vercel.app",
      NEXT_PUBLIC_APP_URL: production,
    };

    await check("trusted immutable preview origin passes inherited production config", preview, deployment, deployment, true);
    await check("trusted immutable preview origin passes inherited branch alias", { ...preview, NEXT_PUBLIC_APP_URL: branchAlias }, deployment, deployment, true);
    await check("inherited production origin is not the preview claim origin", preview, deployment, production, false);
    await check("branch alias cannot claim against the immutable preview origin", preview, deployment, branchAlias, false);
    await check("host and forwarded headers cannot authorize an attacker origin", preview, "https://attacker.example", "https://attacker.example", false, {
      host: "attacker.example",
      "x-forwarded-host": "attacker.example",
      "x-forwarded-proto": "https",
    });
    await check("spoofed trusted forwarded host cannot authorize another origin", preview, deployment, "https://attacker.example", false, {
      "x-forwarded-host": "riyp-immutable-test.vercel.app",
      "x-forwarded-proto": "https",
    });
    await check("missing Origin fails closed", preview, deployment, null, false);
    await check("opaque Origin fails closed", preview, deployment, "null", false);
    await check("HTTP cannot impersonate the configured HTTPS origin", preview, deployment, "http://riyp-immutable-test.vercel.app", false);

    const hostedProduction = { ...preview, VERCEL_ENV: "production" };
    await check("production keeps its configured canonical origin", hostedProduction, production, production, true);
    await check("preview deployment origin cannot replace production canonical origin", hostedProduction, production, deployment, false);
    await check("production without trusted configuration fails closed", { NODE_ENV: "production" }, production, production, false, {
      host: "www.recruiterinyourpocket.com",
      "x-forwarded-host": "www.recruiterinyourpocket.com",
      "x-forwarded-proto": "https",
    });
    await check("malformed production configuration fails closed", { NODE_ENV: "production", NEXT_PUBLIC_APP_URL: "not a URL" }, production, production, false);
    await check("production deployment URL cannot replace missing canonical config", { NODE_ENV: "production", VERCEL_ENV: "production", VERCEL_URL: "riyp-immutable-test.vercel.app" }, deployment, deployment, false);
    await check("production deployment URL cannot replace malformed canonical config", { ...hostedProduction, NEXT_PUBLIC_APP_URL: "not a URL" }, deployment, deployment, false);

    const local = "http://localhost:3000";
    await check("unconfigured development preserves request-origin fallback", { NODE_ENV: "development" }, local, local, true);
    await check("development fallback does not trust forwarded host", { NODE_ENV: "development" }, local, "https://attacker.example", false, {
      "x-forwarded-host": "attacker.example",
      "x-forwarded-proto": "https",
    });
    await check("configured development preserves configured origin", { NODE_ENV: "development", NEXT_PUBLIC_APP_URL: local }, local, local, true);
    await check("malformed development configuration remains fail closed", { NODE_ENV: "development", NEXT_PUBLIC_APP_URL: "not a URL" }, local, local, false);
  } finally {
    runtimeModule._load = originalLoad;
    for (const name of envNames) {
      if (originalEnv[name] === undefined) delete mutableEnv[name];
      else mutableEnv[name] = originalEnv[name];
    }
  }
}

run().then(() => console.log("recovery origin security tests passed (19 cases)")).catch(error => {
  console.error(error);
  process.exitCode = 1;
});
