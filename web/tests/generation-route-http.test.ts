import assert from "node:assert/strict";
import Module from "node:module";
import path from "node:path";
import {
  ANONYMOUS_ID_COOKIE,
  getCurrentMonthKey,
  makeAnonymousIdentityCookie,
  parseAnonymousIdentityCookie,
} from "../lib/backend/freeCookie";
import { anonymousGenerationAccessBackend } from "../lib/billing/anonymousGenerationAccess";
import {
  anonymousNetworkHashFromRequest,
  hashAnonymousIdentity,
} from "../lib/billing/anonymousIdentity";

type RuntimeModule = typeof Module & {
  _load: (request: string, parent: NodeModule | null, isMain: boolean) => unknown;
};

async function run() {
  process.env.SESSION_SECRET = "generation-http-test-secret";
  process.env.USE_MOCK_OPENAI = "1";
  process.env.RIYP_ALLOW_TEST_ANONYMOUS_ACCESS_FALLBACK = "true";
  process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";

  const runtimeModule = Module as RuntimeModule;
  const originalLoad = runtimeModule._load;
  const requestCookies = new Map<string, string>();
  let providerCalls = 0;

  runtimeModule._load = function loadWithRouteBoundaryMocks(request, parent, isMain) {
    if (request === "next/headers") {
      return {
        cookies: async () => ({
          get: (name: string) => {
            const value = requestCookies.get(name);
            return value ? { name, value } : undefined;
          },
        }),
      };
    }
    if (request === "@/lib/supabase/serverClient") {
      return {
        maybeCreateSupabaseServerClient: async () => ({
          auth: {
            getUser: async () => ({ data: { user: null }, error: null }),
          },
        }),
      };
    }
    if (request === "@/lib/supabase/adminClient") {
      return { createSupabaseAdminClient: () => null };
    }
    if (request === "@/lib/llm/orchestrator") {
      return {
        runJson: async () => {
          providerCalls += 1;
          throw Object.assign(new Error("synthetic provider failure"), {
            code: "OPENAI_NETWORK_ERROR",
          });
        },
      };
    }
    if (request.startsWith("@/")) {
      return originalLoad(path.join(process.cwd(), request.slice(2)), parent, isMain);
    }
    return originalLoad(request, parent, isMain);
  };

  try {
    const { POST } = require("../app/api/resume-feedback/route") as {
      POST: (request: Request) => Promise<Response>;
    };
    const response = await POST(new Request("http://localhost/api/resume-feedback", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "203.0.113.42",
      },
      body: JSON.stringify({ mode: "resume", text: "A".repeat(120) }),
    }));
    const payload = await response.json();
    const setCookie = response.headers.get("set-cookie") || "";
    const identityValue = setCookie.match(new RegExp(`${ANONYMOUS_ID_COOKIE}=([^;]+)`))?.[1];

    assert.equal(providerCalls, 1, "cookie-less first POST must reserve before provider work");
    assert.notEqual(payload.errorCode, "ACCESS_DEPENDENCY_UNAVAILABLE");
    assert.equal(payload.errorCode, "OPENAI_NETWORK_ERROR");
    assert.ok(identityValue, "the first access-error response must issue the signed identity cookie");
    assert.ok(parseAnonymousIdentityCookie(identityValue));

    const committedIdentity = { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" };
    const originalNetworkRequest = new Request("http://localhost", {
      headers: { "x-forwarded-for": "198.51.100.10" },
    });
    const committedLedger = {
      identityHash: hashAnonymousIdentity(committedIdentity),
      shadowHash: anonymousNetworkHashFromRequest(originalNetworkRequest) || "",
      monthKey: getCurrentMonthKey(),
      reservationId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    };
    assert.equal(await anonymousGenerationAccessBackend.reserve(committedLedger), true);
    assert.equal(await anonymousGenerationAccessBackend.commit(committedLedger), true);
    requestCookies.set(ANONYMOUS_ID_COOKIE, makeAnonymousIdentityCookie(committedIdentity));

    const movedRequest = () => new Request("http://localhost/api/resume-feedback", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "198.51.100.11",
      },
      body: JSON.stringify({ mode: "resume", text: "B".repeat(120) }),
    });
    const movedResponse = await POST(movedRequest());
    const movedPayload = await movedResponse.json();
    assert.equal(movedResponse.status, 402);
    assert.equal(movedPayload.errorCode, "PAYWALL_REQUIRED");
    assert.equal(providerCalls, 1, "a committed durable identity must not reach the provider after an IP move");

    requestCookies.clear();
    const clearedResponse = await POST(movedRequest());
    const clearedPayload = await clearedResponse.json();
    assert.equal(clearedResponse.status, 402);
    assert.equal(clearedPayload.errorCode, "PAYWALL_REQUIRED");
    assert.equal(
      providerCalls,
      1,
      "the moved-network shadow must deny a direct POST after both cookies are cleared"
    );
  } finally {
    runtimeModule._load = originalLoad;
  }

  console.log("generation route HTTP boundary tests passed");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
