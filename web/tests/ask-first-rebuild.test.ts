/**
 * The second read of a not-ready page (ask-first, Nov 5, 2026) runs through the stream route without a
 * reservation: it spends no free report, needs a first report this visitor can open on the bottom rung,
 * and the page it reads must still carry that report's marked line. The route's own boundary mocks are
 * the same as tests/generation-route-http.test.ts.
 */
import assert from "node:assert/strict";
import Module from "node:module";
import path from "node:path";
import { ANONYMOUS_ID_COOKIE, makeAnonymousIdentityCookie } from "../lib/backend/freeCookie";
import { hubspotSource, schemaValidReport } from "./helpers/report-fidelity-fixture";

// These are the v2 (Critical Miss) report's paths; the worklist report, the default since November 6, 2026, has its own.
process.env.RIYP_WORKLIST_REPORT = "0";

type RuntimeModule = typeof Module & {
  _load: (request: string, parent: NodeModule | null, isMain: boolean) => unknown;
};

async function run() {
  process.env.SESSION_SECRET = "ask-first-rebuild-test-secret";
  process.env.USE_MOCK_OPENAI = "1";
  process.env.RIYP_ALLOW_TEST_ANONYMOUS_ACCESS_FALLBACK = "true";
  process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
  delete process.env.RIYP_ASK_FIRST;

  const runtimeModule = Module as RuntimeModule;
  const originalLoad = runtimeModule._load;
  const requestCookies = new Map<string, string>();
  let providerCalls = 0;
  let reservationCalls = 0;
  let authenticatedUser: { id: string; email: string } | null = null;
  // What the stores answer: the anonymous recovery and the signed-in person's saved report.
  let recoveryReport: unknown = null;
  let ownedReport: unknown = null;
  const persisted: unknown[] = [];

  runtimeModule._load = function loadWithRouteBoundaryMocks(request, parent, isMain) {
    if (request === "next/headers") {
      return { cookies: async () => ({ get: (name: string) => (requestCookies.has(name) ? { name, value: requestCookies.get(name) } : undefined) }) };
    }
    if (request === "@/lib/supabase/serverClient") {
      return { maybeCreateSupabaseServerClient: async () => ({ auth: { getUser: async () => ({ data: { user: authenticatedUser }, error: null }) } }) };
    }
    if (request === "@/lib/supabase/adminClient") {
      return { createSupabaseAdminClient: () => (authenticatedUser ? {} : null) };
    }
    if (request === "@/lib/llm/orchestrator") {
      return {
        runJson: async () => {
          providerCalls += 1;
          return { parsed: structuredClone(schemaValidReport), raw: JSON.stringify(schemaValidReport) };
        },
        streamJson: async function* () {
          providerCalls += 1;
          yield { type: "chunk", content: JSON.stringify(schemaValidReport) };
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
    if (request === "@/lib/reports/anonymous-report-recovery" || request === "./anonymous-report-recovery") {
      const actual = originalLoad(path.join(process.cwd(), "lib/reports/anonymous-report-recovery"), parent, isMain) as any;
      return { ...actual, loadAnonymousReportRecovery: async () => (recoveryReport ? { report: recoveryReport } : null) };
    }
    if (request === "@/lib/reports/generated-report-store" || request === "./generated-report-store") {
      const actual = originalLoad(path.join(process.cwd(), "lib/reports/generated-report-store"), parent, isMain) as any;
      return {
        ...actual,
        lookupOwnedTrustedReport: async () => (ownedReport ? { status: "found", report: ownedReport } : { status: "missing" }),
        persistGeneratedReport: async (input: { payload: unknown }) => { persisted.push(input.payload); return "ffffffff-ffff-4fff-8fff-ffffffffffff"; },
      };
    }
    if (request.startsWith("@/")) return originalLoad(path.join(process.cwd(), request.slice(2)), parent, isMain);
    return originalLoad(request, parent, isMain);
  };

  const text = Array.from({ length: 6 }, () => hubspotSource).join(" ");
  const notReady = { ...structuredClone(schemaValidReport), score: 58, score_label: "Needs more context" };
  const recoveryId = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
  const post = async (streamPost: (request: Request) => Promise<Response>, body: Record<string, unknown>) => {
    const response = await streamPost(new Request("http://localhost/api/resume-feedback-stream", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.42" },
      body: JSON.stringify(body),
    }));
    const events = (await response.text()).trim().split("\n").filter(Boolean).map((line) => JSON.parse(line));
    return { response, events, last: events[events.length - 1] };
  };

  try {
    const { POST: streamPost } = require("../app/api/resume-feedback-stream/route") as { POST: (request: Request) => Promise<Response> };
    requestCookies.set(ANONYMOUS_ID_COOKIE, makeAnonymousIdentityCookie({ id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" }));

    // No first report to be found: refused before any reservation or provider work, nothing spent.
    const unknown = await post(streamPost, { mode: "resume", text, rebuild: { recovery_id: recoveryId } });
    assert.equal(unknown.last.type, "error");
    assert.equal(unknown.last.errorCode, "REBUILD_SOURCE_UNKNOWN");
    assert.equal(unknown.last.access_consumed, false);
    assert.match(unknown.last.message, /first report is unchanged/u);
    assert.equal(providerCalls, 0);
    assert.equal(reservationCalls, 0, "a rebuild never reserves access");

    // A first report that isn't on the bottom rung doesn't take a second read.
    recoveryReport = structuredClone(schemaValidReport);
    const notOffered = await post(streamPost, { mode: "resume", text, rebuild: { recovery_id: recoveryId } });
    assert.equal(notOffered.last.errorCode, "REBUILD_NOT_OFFERED");
    assert.equal(providerCalls, 0);

    // The page sent must still carry the first report's marked line.
    recoveryReport = notReady;
    const mismatch = await post(streamPost, { mode: "resume", text: "C".repeat(240), rebuild: { recovery_id: recoveryId } });
    assert.equal(mismatch.last.errorCode, "REBUILD_SOURCE_MISMATCH");
    assert.equal(providerCalls, 0);

    // The rebuild itself: the model runs, nothing is reserved, and the completion says so.
    const rebuilt = await post(streamPost, { mode: "resume", text, rebuild: { recovery_id: recoveryId } });
    assert.equal(rebuilt.response.status, 200);
    assert.equal(rebuilt.last.type, "complete", JSON.stringify(rebuilt.last).slice(0, 300));
    assert.equal(rebuilt.last.rebuilt, true);
    assert.equal(rebuilt.last.ask_first, false, "a rebuild never asks again");
    assert.equal("free_uses_remaining" in rebuilt.last, false, "a rebuild says nothing about what's left");
    assert.equal(rebuilt.last.recovery_id, null, "no recovery of its own");
    assert.ok(rebuilt.last.report_receipt, "the anonymous rebuild carries a receipt so it can be saved later");
    assert.equal(rebuilt.last.data.contract_version, "v2");
    assert.equal(providerCalls, 1);
    assert.equal(reservationCalls, 0);
    const meta = rebuilt.events.find((event) => event.type === "meta");
    assert.equal(meta?.access_tier, "free_full");
    assert.equal(meta?.recovery_id, null);

    // A first read on the bottom rung offers the questions; one that isn't, doesn't. (The mock provider's
    // report is above the rung, so the offer here is false; the rule itself is tested in ask-first.test.ts.)
    assert.equal(rebuilt.last.ask_first, false);

    // Signed in: the rebuild is kept as a report of its own, without a reservation to finalize.
    authenticatedUser = { id: "signed-user", email: "signed@example.com" };
    requestCookies.clear();
    ownedReport = null;
    const signedUnknown = await post(streamPost, { mode: "resume", text, rebuild: { report_id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd" } });
    assert.equal(signedUnknown.last.errorCode, "REBUILD_SOURCE_UNKNOWN");
    assert.equal(providerCalls, 1);
    ownedReport = notReady;
    const signedRebuilt = await post(streamPost, { mode: "resume", text, rebuild: { report_id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd" } });
    assert.equal(signedRebuilt.last.type, "complete", JSON.stringify(signedRebuilt.last).slice(0, 300));
    assert.equal(signedRebuilt.last.rebuilt, true);
    assert.equal(signedRebuilt.last.report_id, "ffffffff-ffff-4fff-8fff-ffffffffffff");
    assert.equal(signedRebuilt.last.report_receipt, null);
    assert.equal(persisted.length, 1, "the rebuilt report is kept once");
    assert.equal(providerCalls, 2);
    assert.equal(reservationCalls, 0);

    // The day's limit, per identity: three rebuilds that ran; the refusals above never counted.
    const second = await post(streamPost, { mode: "resume", text, rebuild: { report_id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd" } });
    assert.equal(second.last.type, "complete");
    const third = await post(streamPost, { mode: "resume", text, rebuild: { report_id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd" } });
    assert.equal(third.last.type, "complete");
    assert.equal(providerCalls, 4);
    const fourth = await post(streamPost, { mode: "resume", text, rebuild: { report_id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd" } });
    assert.equal(fourth.last.errorCode, "REBUILD_RATE_LIMITED");
    assert.equal(fourth.response.status, 429);
    assert.equal(providerCalls, 4, "the fourth rebuild in a day never reaches the provider");

    // Turned off: refused the same way, nothing spent.
    process.env.RIYP_ASK_FIRST = "0";
    const off = await post(streamPost, { mode: "resume", text, rebuild: { recovery_id: recoveryId } });
    assert.equal(off.last.errorCode, "REBUILD_UNAVAILABLE");
    assert.equal(off.last.access_consumed, false);
  } finally {
    runtimeModule._load = originalLoad;
    delete process.env.RIYP_ASK_FIRST;
  }

  console.log("ask-first rebuild route tests passed");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
