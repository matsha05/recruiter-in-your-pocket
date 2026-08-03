import assert from "node:assert/strict";
import { streamResumeFeedback } from "../lib/api";
import {
  ANONYMOUS_REPORT_RECOVERY_STORAGE_KEY,
  clearAnonymousReportRecoveryMarker,
  readAnonymousReportRecoveryMarker,
} from "../lib/reports/anonymous-report-recovery-client";
import { ANONYMOUS_REPORT_RECOVERY_STORAGE_REQUIRED_MESSAGE } from "../lib/reports/anonymous-report-recovery-requirement";
import { schemaValidReport } from "./helpers/report-fidelity-fixture";

class MemoryStorage {
  values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
}

function completeResponse(event: Record<string, unknown>) {
  return new Response(`${JSON.stringify(event)}\n`, {
    status: 200,
    headers: { "Content-Type": "application/x-ndjson" },
  });
}

async function run() {
  const originalFetch = globalThis.fetch;
  const previousWindow = (globalThis as any).window;
  const storage = new MemoryStorage();
  (globalThis as any).window = { localStorage: storage };
  try {
    let recoveryId = "";
    let recoveryLookups = 0;
    globalThis.fetch = async (url, init) => {
      if (String(url) === "/api/resume-feedback-stream") {
        const request = JSON.parse(String(init?.body));
        recoveryId = request.recovery_id;
        assert.match(recoveryId, /^[0-9a-f-]{36}$/u);
        assert.ok(
          storage.getItem(ANONYMOUS_REPORT_RECOVERY_STORAGE_KEY),
          "the opaque recovery ID must be stored before the generation request starts",
        );
        let reads = 0;
        return new Response(new ReadableStream<Uint8Array>({
          pull(controller) {
            reads += 1;
            if (reads === 1) {
              controller.enqueue(new TextEncoder().encode(`${JSON.stringify({
                type: "meta",
                recovery_id: recoveryId,
                attempt_consumed: false,
              })}\n`));
              return;
            }
            controller.error(new TypeError("synthetic socket loss after server finalization"));
          },
        }), {
          status: 200,
          headers: { "x-riyp-recovery-id": recoveryId },
        });
      }
      assert.equal(
        String(url),
        `/api/reports/recovery?recovery_id=${recoveryId}`,
      );
      recoveryLookups += 1;
      return Response.json({
        ok: true,
        recovery_id: recoveryId,
        report: schemaValidReport,
      });
    };

    const recovered = await streamResumeFeedback(
      "private resume text",
      "private job description",
      () => undefined,
    );
    assert.equal(recovered.ok, true);
    assert.deepEqual(recovered.report, { ...schemaValidReport, recovery_id: recoveryId });
    assert.equal(recovered.attemptConsumed, true);
    assert.equal(recoveryLookups, 1);
    assert.equal(readAnonymousReportRecoveryMarker()?.recoveryId, recoveryId);
    assert.doesNotMatch(
      storage.getItem(ANONYMOUS_REPORT_RECOVERY_STORAGE_KEY) || "",
      /private resume|private job/iu,
    );

    globalThis.fetch = async () => Response.json({
      ok: false,
      message: "The earlier anonymous attempt is still resolving.",
    }, { status: 402 });
    const deniedRetry = await streamResumeFeedback("retry resume", undefined, () => undefined);
    assert.equal(deniedRetry.ok, false);
    assert.equal(
      readAnonymousReportRecoveryMarker()?.recoveryId,
      recoveryId,
      "a denied retry must not erase the only ID for an earlier completed report",
    );

    globalThis.fetch = async (_url, init) => {
      const request = JSON.parse(String(init?.body));
      return completeResponse({
        type: "complete",
        data: schemaValidReport,
        report_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        recovery_id: null,
        requested_recovery_id: request.recovery_id,
      });
    };
    const signedIn = await streamResumeFeedback("signed in resume", undefined, () => undefined);
    assert.equal(signedIn.ok, true);
    assert.equal(
      readAnonymousReportRecoveryMarker()?.recoveryId,
      recoveryId,
      "an unacknowledged signed-in run must not orphan an older anonymous recovery",
    );
    clearAnonymousReportRecoveryMarker(recoveryId);
    const freshSignedIn = await streamResumeFeedback("signed in resume", undefined, () => undefined);
    assert.equal(freshSignedIn.ok, true);
    assert.equal(readAnonymousReportRecoveryMarker(), null, "signed-in finalization must clear the unused marker");

    (globalThis as any).window = { localStorage: {
      getItem() { throw new Error("storage blocked"); },
      setItem() { throw new Error("storage blocked"); },
      removeItem() { throw new Error("storage blocked"); },
    } };
    let blockedRecoveryId: unknown = "not observed";
    globalThis.fetch = async (_url, init) => {
      blockedRecoveryId = JSON.parse(String(init?.body)).recovery_id;
      return completeResponse({
        type: "error",
        errorCode: "RECOVERY_STORAGE_REQUIRED",
        message: ANONYMOUS_REPORT_RECOVERY_STORAGE_REQUIRED_MESSAGE,
        access_consumed: false,
      });
    };
    const blocked = await streamResumeFeedback("blocked storage resume", undefined, () => undefined);
    assert.equal(blocked.ok, false);
    assert.equal(blocked.errorCode, "RECOVERY_STORAGE_REQUIRED");
    assert.equal(blocked.message, ANONYMOUS_REPORT_RECOVERY_STORAGE_REQUIRED_MESSAGE);
    assert.equal(blockedRecoveryId, undefined, "blocked storage must not invent a server-only recovery ID");
  } finally {
    globalThis.fetch = originalFetch;
    if (previousWindow === undefined) delete (globalThis as any).window;
    else (globalThis as any).window = previousWindow;
  }
}

run().then(() => {
  console.log("stream anonymous recovery tests passed");
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
