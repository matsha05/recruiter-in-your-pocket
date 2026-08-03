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
  let authenticatedUser: { id: string; email: string } | null = null;
  let forcedReservationError: Error | null = null;

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
            getUser: async () => ({ data: { user: authenticatedUser }, error: null }),
          },
        }),
      };
    }
    if (request === "@/lib/supabase/adminClient") {
      return { createSupabaseAdminClient: () => authenticatedUser ? {} : null };
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
          if (forcedReservationError) throw forcedReservationError;
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
    authenticatedUser = { id: "signed-user", email: "signed@example.com" };
    const signedWithoutOperation = await POST(new Request("http://localhost/api/resume-feedback", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ mode: "resume", text: "A".repeat(120) }),
    }));
    assert.equal(signedWithoutOperation.status, 409);
    assert.equal((await signedWithoutOperation.json()).errorCode, "RECOVERY_STORAGE_REQUIRED");
    assert.equal(providerCalls, 0, "a signed report without a durable operation key must stop before provider work");
    assert.equal(reservationCalls, 0, "a signed report without a durable operation key must stop before reservation");

    const { GenerationAccessError } = require("../lib/billing/generationAccess") as {
      GenerationAccessError: new (
        code: string, message: string, status: number, consumed: boolean,
      ) => Error;
    };
    forcedReservationError = new GenerationAccessError(
      "GENERATION_OPERATION_CONFLICT",
      "This operation reference cannot be used for this request. Start a new report and try again.",
      409,
      false,
    );
    const signedConflict = await POST(new Request("http://localhost/api/resume-feedback", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        mode: "resume",
        text: "A".repeat(120),
        operation_id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
      }),
    }));
    const signedConflictPayload = await signedConflict.json();
    assert.equal(signedConflict.status, 409);
    assert.equal(signedConflictPayload.errorCode, "GENERATION_OPERATION_CONFLICT");
    assert.equal(signedConflictPayload.attempt_consumed, false);
    assert.equal(signedConflictPayload.operation_id, null, "the conflict response must not expose operation state");
    assert.doesNotMatch(signedConflictPayload.message, /owner|reservation|status|digest/iu);
    assert.equal(providerCalls, 0, "an opaque operation conflict must stop before provider work");
    assert.equal(reservationCalls, 1, "the route must surface the atomic access-boundary conflict");
    forcedReservationError = null;
    reservationCalls = 0;
    authenticatedUser = null;

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
    authenticatedUser = { id: "signed-user", email: "signed@example.com" };
    const signedStreamWithoutOperation = await streamPost(new Request("http://localhost/api/resume-feedback-stream", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ mode: "resume", text: "A".repeat(120) }),
    }));
    const signedStreamBlockedEvent = JSON.parse((await signedStreamWithoutOperation.text()).trim());
    assert.equal(signedStreamBlockedEvent.errorCode, "RECOVERY_STORAGE_REQUIRED");
    assert.equal(signedStreamBlockedEvent.access_consumed, false);
    assert.equal(providerCalls, 0, "signed streaming without a durable operation key must stop before provider work");
    assert.equal(reservationCalls, 0, "signed streaming without a durable operation key must stop before reservation");
    authenticatedUser = null;

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

    const recoveryId = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
    const streamIdentityHandshake = await streamPost(new Request("http://localhost/api/resume-feedback-stream", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.42" },
      body: JSON.stringify({ mode: "resume", text: "A".repeat(120), recovery_id: recoveryId }),
    }));
    const streamHandshakePayload = JSON.parse((await streamIdentityHandshake.text()).trim());
    const streamHandshakeCookie = (streamIdentityHandshake.headers.get("set-cookie") || "")
      .match(new RegExp(`${ANONYMOUS_ID_COOKIE}=([^;]+)`))?.[1];
    assert.equal(streamIdentityHandshake.status, 409);
    assert.equal(streamHandshakePayload.errorCode, "ANONYMOUS_IDENTITY_REQUIRED");
    assert.equal(streamHandshakePayload.attempt_consumed, false);
    assert.equal(providerCalls, 0, "the stream identity handshake must precede provider work");
    assert.equal(reservationCalls, 0, "the stream identity handshake must precede reservation work");
    assert.ok(streamHandshakeCookie && parseAnonymousIdentityCookie(streamHandshakeCookie));

    const identityHandshake = await POST(new Request("http://localhost/api/resume-feedback", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.42" },
      body: JSON.stringify({ mode: "resume", text: "A".repeat(120), recovery_id: recoveryId }),
    }));
    const handshakePayload = await identityHandshake.json();
    const handshakeCookie = (identityHandshake.headers.get("set-cookie") || "")
      .match(new RegExp(`${ANONYMOUS_ID_COOKIE}=([^;]+)`))?.[1];
    assert.equal(identityHandshake.status, 409);
    assert.equal(handshakePayload.errorCode, "ANONYMOUS_IDENTITY_REQUIRED");
    assert.equal(handshakePayload.attempt_consumed, false);
    assert.equal(providerCalls, 0, "the identity handshake must precede provider work");
    assert.equal(reservationCalls, 0, "the identity handshake must precede reservation work");
    assert.ok(handshakeCookie && parseAnonymousIdentityCookie(handshakeCookie));

    requestCookies.set(ANONYMOUS_ID_COOKIE, handshakeCookie!);
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
    assert.equal(clearedResponse.status, 409);
    assert.equal(clearedPayload.errorCode, "ANONYMOUS_IDENTITY_REQUIRED");
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
