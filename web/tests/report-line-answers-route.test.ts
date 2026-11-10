import assert from "node:assert/strict";
import Module from "node:module";
import path from "node:path";
import { NextRequest } from "next/server";
import { mergeLineAnswers, type LineAnswersPatch, type StoredLineAnswersByFix } from "../lib/reports/line-answers";

type RuntimeModule = typeof Module & {
  _load: (request: string, parent: NodeModule | null, isMain: boolean) => unknown;
};

async function run() {
  const reportId = "1ec2778f-9c09-42fd-9910-fc5ec3f47e44";
  const userId = "a3000000-0000-4000-8000-000000000001";
  const runtimeModule = Module as RuntimeModule;
  const originalLoad = runtimeModule._load;
  let signedIn = true;
  let allowed = true;
  let exists = true;
  let owned = true;
  let failWrite = false;
  let deleteBeforeWrite = false;
  let stored: StoredLineAnswersByFix = {};
  let calls = 0;
  let ownershipReads = 0;
  let waitForTwoReads = false;
  let releaseReads: (() => void) | undefined;
  let bothRead = Promise.resolve();

  const supabase = {
    auth: { getUser: async () => ({ data: { user: signedIn ? { id: userId } : null } }) },
    from: (table: string) => {
      assert.equal(table, "reports");
      const filters: Record<string, unknown> = {};
      const query = {
        select: (columns: string) => { assert.equal(columns, "id", "the route must not read an answer snapshot to overwrite later"); return query; },
        eq: (key: string, value: unknown) => { filters[key] = value; return query; },
        maybeSingle: async () => {
          assert.deepEqual(filters, { id: reportId, user_id: userId });
          const found = exists && owned;
          if (++ownershipReads === 2) releaseReads?.();
          if (waitForTwoReads) await bothRead;
          return { data: found ? { id: reportId } : null, error: null };
        },
      };
      return query;
    },
  };
  const admin = {
    // Actual SQL semantics and privileges are exercised by migration-replay/verify-report-line-answers.cjs.
    // This boundary stub verifies concurrent HTTP requests pass only their own delta to the RPC.
    rpc: async (name: string, args: Record<string, unknown>) => {
      calls += 1;
      assert.equal(name, "update_report_line_answers");
      assert.equal(args.p_report_id, reportId);
      assert.equal(args.p_user_id, userId, "owner comes from the authenticated session, never the request body");
      if (failWrite) return { data: null, error: { code: "DB_UNAVAILABLE" } };
      if (deleteBeforeWrite) exists = false;
      if (!exists) return { data: null, error: null };
      const patch = { fix_index: args.p_fix_index, answers: args.p_answers, line: args.p_line, source: args.p_source } as LineAnswersPatch;
      stored = mergeLineAnswers(stored, patch);
      return { data: structuredClone(stored), error: null };
    },
  };
  runtimeModule._load = function loadAnswerMocks(request, parent, isMain) {
    if (request === "@/lib/supabase/serverClient") return { createSupabaseServerClient: async () => supabase };
    if (request === "@/lib/supabase/adminClient") return { createSupabaseAdminClient: () => admin };
    if (request === "@/lib/security/rateLimit") return { rateLimitAsync: async () => ({ ok: allowed, resetMs: 1000 }) };
    if (request === "@/lib/observability/logger") return { hashForLogs: () => "hash", logWarn() {} };
    if (request.startsWith("@/")) return originalLoad(path.join(process.cwd(), request.slice(2)), parent, isMain);
    return originalLoad(request, parent, isMain);
  };

  try {
    const { PATCH } = require("../app/api/reports/[id]/answers/route") as {
      PATCH: (request: NextRequest, context: { params: Promise<{ id: string }> }) => Promise<Response>;
    };
    const patch = (index: number): LineAnswersPatch => ({
      fix_index: index, answers: [{ question: "Which tool?", kind: "answered", text: `tool ${index}` }], line: `Built tool ${index}.`, source: "literal",
    });
    const send = (body: unknown) => PATCH(new NextRequest(`http://localhost/api/reports/${reportId}/answers`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    }), { params: Promise.resolve({ id: reportId }) });

    bothRead = new Promise<void>((resolve) => { releaseReads = resolve; });
    waitForTwoReads = true;
    const responses = await Promise.all([send(patch(0)), send(patch(1))]);
    waitForTwoReads = false;
    assert.deepEqual(responses.map(response => response.status), [200, 200]);
    assert.deepEqual(Object.keys(stored).sort(), ["0", "1"], "overlapping card saves both survive reopening");
    assert.equal(stored["0"].line, "Built tool 0.");

    const clear = { fix_index: 0, answers: [], line: null, source: "literal" };
    assert.equal((await send(clear)).status, 200);
    assert.deepEqual(Object.keys(stored), ["1"], "clear does not erase another card");
    assert.equal((await send(clear)).status, 200, "clear is idempotent");
    assert.equal((await send({ ...clear, line: "Old line." })).status, 400, "invalid clear is rejected before writing");
    const empty = await send({ ...clear, fix_index: 1 });
    assert.equal(empty.status, 200);
    assert.deepEqual((await empty.json()).lineAnswers, {}, "clearing the last answer is a successful empty report state");

    const beforeRejections = calls;
    signedIn = false;
    assert.equal((await send(patch(0))).status, 401);
    signedIn = true;
    allowed = false;
    assert.equal((await send(patch(0))).status, 429);
    allowed = true;
    owned = false;
    assert.equal((await send(patch(0))).status, 404);
    owned = true;
    assert.equal(calls, beforeRejections, "unauthorized and rate-limited requests never reach the write");

    failWrite = true;
    assert.equal((await send(patch(0))).status, 500, "a database failure cannot claim the answer was kept");
    failWrite = false;
    assert.equal((await send({ ...patch(0), user_id: "other-owner" })).status, 200);
    deleteBeforeWrite = true;
    const deleted = await send(patch(1));
    assert.equal(deleted.status, 404, "deletion between owner check and write is not acknowledged as a save");
    assert.equal((await deleted.json()).ok, false);
  } finally {
    runtimeModule._load = originalLoad;
  }
}

run().then(() => console.log("report line answers route tests passed")).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
