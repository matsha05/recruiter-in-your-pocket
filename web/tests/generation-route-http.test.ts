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
import {
  hubspotJobDescription,
  hubspotSource,
  schemaValidReport,
} from "./helpers/report-fidelity-fixture";

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
  let reservationCalls = 0;
  let providerSucceeds = false;

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
          if (providerSucceeds) {
            return { parsed: structuredClone(schemaValidReport), raw: JSON.stringify(schemaValidReport) };
          }
          throw Object.assign(new Error("synthetic provider failure"), {
            code: "OPENAI_NETWORK_ERROR",
          });
        },
        streamJson: async function* () {
          providerCalls += 1;
          throw new Error("marker-less stream reached provider work");
        },
      };
    }
    if (request === "@/lib/billing/generationAccess") {
      const actual = originalLoad(path.join(process.cwd(), "lib/billing/generationAccess"), parent, isMain) as any;
      return {
        ...actual,
        reserveGenerationAccess: async (...args: any[]) => {
          reservationCalls += 1;
          return actual.reserveGenerationAccess(...args);
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

    assert.equal(response.status, 409);
    assert.equal(payload.errorCode, "RECOVERY_STORAGE_REQUIRED");
    assert.match(payload.message, /browser could not store the recovery reference/iu);
    assert.equal(providerCalls, 0, "a marker-less anonymous report must stop before reservation/provider work");
    assert.equal(reservationCalls, 0, "a marker-less anonymous report must not reserve access");
    assert.ok(identityValue, "the pre-reservation rejection must still issue the signed identity cookie");
    assert.ok(parseAnonymousIdentityCookie(identityValue));

    const { POST: streamPost } = require("../app/api/resume-feedback-stream/route") as {
      POST: (request: Request) => Promise<Response>;
    };
    const blockedStream = await streamPost(new Request("http://localhost/api/resume-feedback-stream", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.42" },
      body: JSON.stringify({ mode: "resume", text: "A".repeat(120) }),
    }));
    const blockedStreamEvent = JSON.parse((await blockedStream.text()).trim());
    assert.equal(blockedStreamEvent.errorCode, "RECOVERY_STORAGE_REQUIRED");
    assert.equal(blockedStreamEvent.access_consumed, false);
    assert.equal(providerCalls, 0, "the streaming route must also stop before reservation/provider work");
    assert.equal(reservationCalls, 0, "the streaming route must not reserve access without a persisted marker");

    requestCookies.set(ANONYMOUS_ID_COOKIE, identityValue!);
    const recoveryId = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
    const providerFailure = await POST(new Request("http://localhost/api/resume-feedback", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.42" },
      body: JSON.stringify({ mode: "resume", text: "A".repeat(120), recovery_id: recoveryId }),
    }));
    assert.equal((await providerFailure.json()).errorCode, "OPENAI_NETWORK_ERROR");
    assert.equal(providerCalls, 1, "a persisted recovery ID may proceed to the provider");
    assert.equal(reservationCalls, 1);

    providerSucceeds = true;
    const completedResponse = await POST(new Request("http://localhost/api/resume-feedback", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "203.0.113.42",
      },
      body: JSON.stringify({
        mode: "resume",
        text: `${hubspotSource} ${hubspotSource} ${hubspotSource}`,
        jobDescription: hubspotJobDescription,
        recovery_id: recoveryId,
      }),
    }));
    const completedPayload = await completedResponse.json();
    assert.equal(completedResponse.status, 200);
    assert.equal(completedPayload.recovery_id, recoveryId);
    assert.equal(completedPayload.report_receipt, null, "the server-only recovery receipt must not become a bearer token");
    assert.equal(completedPayload.data.score, schemaValidReport.score);
    assert.equal(completedPayload.data.summary, schemaValidReport.summary);
    assert.equal(completedPayload.data.contract_version, schemaValidReport.contract_version);
    assert.equal(providerCalls, 2, "validated sync output must finalize through recovery exactly once");

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
      body: JSON.stringify({ mode: "resume", text: "B".repeat(120), recovery_id: recoveryId }),
    });
    const movedResponse = await POST(movedRequest());
    const movedPayload = await movedResponse.json();
    assert.equal(movedResponse.status, 402);
    assert.equal(movedPayload.errorCode, "PAYWALL_REQUIRED");
    assert.equal(providerCalls, 2, "a committed durable identity must not reach the provider after an IP move");

    requestCookies.clear();
    const clearedResponse = await POST(movedRequest());
    const clearedPayload = await clearedResponse.json();
    assert.equal(clearedResponse.status, 402);
    assert.equal(clearedPayload.errorCode, "PAYWALL_REQUIRED");
    assert.equal(
      providerCalls,
      2,
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
