import assert from "node:assert/strict";
import {
  ANONYMOUS_REPORT_RECOVERY_MARKER_EVENT,
  ANONYMOUS_REPORT_RECOVERY_STORAGE_KEY,
  ANONYMOUS_REPORT_RECOVERY_TTL_MS,
  ANONYMOUS_REPORT_RECOVERY_UNAVAILABLE_MESSAGE,
  attachAnonymousReportRecoveryMarker,
  clearAnonymousReportRecoveryMarker,
  fetchAnonymousReportRecovery,
  pollAnonymousReportRecovery,
  readAnonymousReportRecoveryMarker,
  watchAnonymousReportRecovery,
} from "../lib/reports/anonymous-report-recovery-client";

const RECOVERY_ID = "11111111-1111-4111-8111-111111111111";
const OTHER_RECOVERY_ID = "22222222-2222-4222-8222-222222222222";
const NOW = 1_800_000_000_000;

class MemoryStorage {
  readonly values = new Map<string, string>();
  readonly events: string[] = [];

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.events.push(`set:${key}`);
    this.values.set(key, value);
  }

  removeItem(key: string) {
    this.events.push(`remove:${key}`);
    this.values.delete(key);
  }
}

function nextTurn() {
  return new Promise<void>((resolve) => setTimeout(resolve, 0));
}

async function run() {
  const storage = new MemoryStorage();
  const attached = attachAnonymousReportRecoveryMarker(
    {
      text: "private resume text",
      jobDescription: "private job description",
      mode: "resume",
    },
    {
      storage,
      now: () => NOW,
      randomUUID: () => RECOVERY_ID.toUpperCase(),
    },
  );

  assert.deepEqual(attached.marker, {
    recoveryId: RECOVERY_ID,
    createdAt: NOW,
  });
  assert.equal(attached.created, true);
  assert.equal(attached.payload.recovery_id, RECOVERY_ID);
  assert.equal(
    storage.events[0],
    `set:${ANONYMOUS_REPORT_RECOVERY_STORAGE_KEY}`,
    "the marker must be durable before the caller can start its fetch",
  );
  const serialized = storage.getItem(ANONYMOUS_REPORT_RECOVERY_STORAGE_KEY) || "";
  assert.doesNotMatch(serialized, /private resume|private job|jobDescription|"text"/iu);
  assert.deepEqual(Object.keys(JSON.parse(serialized)).sort(), [
    "createdAt",
    "recoveryId",
    "version",
  ]);
  assert.deepEqual(
    readAnonymousReportRecoveryMarker({ storage, now: () => NOW + 1 }),
    attached.marker,
  );
  const reused = attachAnonymousReportRecoveryMarker({}, {
    storage,
    now: () => NOW + 1,
    randomUUID: () => OTHER_RECOVERY_ID,
  });
  assert.equal(reused.created, false);
  assert.deepEqual(reused.marker, attached.marker);
  assert.equal(reused.payload.recovery_id, RECOVERY_ID);

  clearAnonymousReportRecoveryMarker(OTHER_RECOVERY_ID, {
    storage,
    now: () => NOW + 1,
  });
  assert.ok(storage.getItem(ANONYMOUS_REPORT_RECOVERY_STORAGE_KEY));
  clearAnonymousReportRecoveryMarker(RECOVERY_ID, {
    storage,
    now: () => NOW + 1,
  });
  assert.equal(storage.getItem(ANONYMOUS_REPORT_RECOVERY_STORAGE_KEY), null);

  attachAnonymousReportRecoveryMarker({}, {
    storage,
    now: () => NOW,
    randomUUID: () => RECOVERY_ID,
  });
  assert.equal(
    readAnonymousReportRecoveryMarker({
      storage,
      now: () => NOW + ANONYMOUS_REPORT_RECOVERY_TTL_MS - 1,
    })?.recoveryId,
    RECOVERY_ID,
  );
  assert.equal(
    readAnonymousReportRecoveryMarker({
      storage,
      now: () => NOW + ANONYMOUS_REPORT_RECOVERY_TTL_MS,
    }),
    null,
    "a marker must not survive for 24 hours or longer",
  );
  assert.equal(storage.getItem(ANONYMOUS_REPORT_RECOVERY_STORAGE_KEY), null);

  storage.setItem(
    ANONYMOUS_REPORT_RECOVERY_STORAGE_KEY,
    JSON.stringify({
      version: 1,
      recoveryId: RECOVERY_ID,
      createdAt: NOW,
      resumeText: "must not be retained",
    }),
  );
  assert.equal(readAnonymousReportRecoveryMarker({ storage, now: () => NOW }), null);
  assert.equal(storage.getItem(ANONYMOUS_REPORT_RECOVERY_STORAGE_KEY), null);

  const serverSide = attachAnonymousReportRecoveryMarker(
    { mode: "resume", recovery_id: OTHER_RECOVERY_ID },
    { storage: null, now: () => NOW, randomUUID: () => RECOVERY_ID },
  );
  assert.equal(serverSide.marker, null);
  assert.equal(serverSide.payload.recovery_id, undefined);

  const throwingStorage = {
    getItem() { throw new Error("storage disabled"); },
    setItem() { throw new Error("storage disabled"); },
    removeItem() { throw new Error("storage disabled"); },
  };
  assert.equal(readAnonymousReportRecoveryMarker({ storage: throwingStorage }), null);
  assert.equal(
    attachAnonymousReportRecoveryMarker({}, {
      storage: throwingStorage,
      now: () => NOW,
      randomUUID: () => RECOVERY_ID,
    }).marker,
    null,
  );

  const marker = { recoveryId: RECOVERY_ID, createdAt: NOW };
  let requestedUrl = "";
  let requestedInit: RequestInit | undefined;
  const found = await fetchAnonymousReportRecovery(marker, {
    fetchImpl: async (url, init) => {
      requestedUrl = String(url);
      requestedInit = init;
      return new Response(JSON.stringify({
        ok: true,
        recovery_id: RECOVERY_ID,
        report: { contract_version: "v2", score: 91 },
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    },
  });
  assert.equal(requestedUrl, `/api/reports/recovery?recovery_id=${RECOVERY_ID}`);
  assert.equal(requestedInit?.method, "GET");
  assert.equal(requestedInit?.credentials, "include");
  assert.equal(requestedInit?.cache, "no-store");
  assert.equal(found.status, "found");
  if (found.status === "found") {
    assert.equal(found.recoveryId, RECOVERY_ID);
    assert.equal(found.report.score, 91);
  }

  attachAnonymousReportRecoveryMarker({}, {
    storage,
    now: () => NOW,
    randomUUID: () => RECOVERY_ID,
  });
  const pending = await fetchAnonymousReportRecovery(marker, {
    fetchImpl: async () => new Response(null, { status: 404 }),
  });
  assert.equal(pending.status, "pending");
  assert.equal(
    readAnonymousReportRecoveryMarker({ storage, now: () => NOW })?.recoveryId,
    RECOVERY_ID,
    "a 404 lookup must leave a still-valid pending marker intact",
  );

  const invalid = await fetchAnonymousReportRecovery(marker, {
    fetchImpl: async () => new Response(null, { status: 400 }),
  });
  assert.deepEqual(invalid, { status: "invalid" });

  for (const fetchImpl of [
    async () => new Response(null, { status: 503 }),
    async () => { throw new Error("synthetic transport failure"); },
  ]) {
    const unavailable = await fetchAnonymousReportRecovery(marker, { fetchImpl });
    assert.deepEqual(unavailable, {
      status: "unavailable",
      message: ANONYMOUS_REPORT_RECOVERY_UNAVAILABLE_MESSAGE,
    });
    assert.doesNotMatch(
      unavailable.status === "unavailable" ? unavailable.message : "",
      /network|connection|offline/iu,
      "recovery wording must remain accurate regardless of the transport",
    );
  }

  const controller = new AbortController();
  controller.abort();
  assert.deepEqual(
    await fetchAnonymousReportRecovery(marker, {
      signal: controller.signal,
      fetchImpl: async () => { throw new Error("aborted"); },
    }),
    { status: "aborted" },
  );

  let boundedAttempts = 0;
  const boundedSleeps: number[] = [];
  assert.equal(
    (await pollAnonymousReportRecovery(marker, {
      fetchImpl: async () => {
        boundedAttempts += 1;
        return new Response(null, { status: 404 });
      },
      pollDelaysMs: [10, 20],
      sleep: async (delayMs) => { boundedSleeps.push(delayMs); },
    })).status,
    "pending",
  );
  assert.equal(boundedAttempts, 3, "polling must stop after the bounded retry schedule");
  assert.deepEqual(boundedSleeps, [10, 20]);

  const sameTabStorage = new MemoryStorage();
  const sameTabEvents = new EventTarget();
  let eventDetail: unknown = "not observed";
  sameTabEvents.addEventListener(ANONYMOUS_REPORT_RECOVERY_MARKER_EVENT, (event) => {
    eventDetail = (event as CustomEvent).detail;
  });
  let sameTabAttempts = 0;
  let resolveRestored!: (report: Record<string, unknown>) => void;
  const restoredPromise = new Promise<Record<string, unknown>>((resolve) => {
    resolveRestored = resolve;
  });
  const exactReport = { contract_version: "v2", score: 93, summary: "Exact report" };
  const stopSameTabWatcher = watchAnonymousReportRecovery({
    storage: sameTabStorage,
    eventTarget: sameTabEvents,
    now: () => NOW,
    fetchImpl: async () => {
      sameTabAttempts += 1;
      return sameTabAttempts === 1
        ? new Response(null, { status: 404 })
        : new Response(JSON.stringify({
            ok: true,
            recovery_id: RECOVERY_ID,
            report: exactReport,
          }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
    },
    pollDelaysMs: [1],
    sleep: async () => undefined,
    onRestore: (report) => {
      resolveRestored(report);
      return true;
    },
  });
  attachAnonymousReportRecoveryMarker({}, {
    storage: sameTabStorage,
    eventTarget: sameTabEvents,
    now: () => NOW,
    randomUUID: () => RECOVERY_ID,
  });
  const restoredReport = await restoredPromise;
  stopSameTabWatcher();
  assert.equal(sameTabAttempts, 2, "the same-tab marker event must poll 404 then 200");
  assert.deepEqual(restoredReport, { ...exactReport, recovery_id: RECOVERY_ID });
  assert.equal(eventDetail, undefined, "the marker event must not carry recovery data");
  assert.equal(
    readAnonymousReportRecoveryMarker({ storage: sameTabStorage, now: () => NOW })?.recoveryId,
    RECOVERY_ID,
    "a found report must remain reload-recoverable until claim or expiry",
  );

  const replacedStorage = new MemoryStorage();
  attachAnonymousReportRecoveryMarker({}, {
    storage: replacedStorage,
    eventTarget: null,
    now: () => NOW,
    randomUUID: () => RECOVERY_ID,
  });
  let finishOldLookup!: () => void;
  const oldLookupMayFinish = new Promise<void>((resolve) => { finishOldLookup = resolve; });
  let replacedRestoreCount = 0;
  const stopReplacedWatcher = watchAnonymousReportRecovery({
    storage: replacedStorage,
    eventTarget: null,
    now: () => NOW,
    fetchImpl: async () => {
      await oldLookupMayFinish;
      return new Response(JSON.stringify({
        ok: true,
        recovery_id: RECOVERY_ID,
        report: exactReport,
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    },
    onRestore: () => { replacedRestoreCount += 1; },
  });
  replacedStorage.setItem(ANONYMOUS_REPORT_RECOVERY_STORAGE_KEY, JSON.stringify({
    version: 1,
    recoveryId: OTHER_RECOVERY_ID,
    createdAt: NOW,
  }));
  finishOldLookup();
  await nextTurn();
  stopReplacedWatcher();
  assert.equal(replacedRestoreCount, 0, "an older recovery ID must not overwrite a newer run");
  assert.equal(
    readAnonymousReportRecoveryMarker({ storage: replacedStorage, now: () => NOW })?.recoveryId,
    OTHER_RECOVERY_ID,
    "the newest recovery ID is the restore ownership token",
  );

  const staleStorage = new MemoryStorage();
  attachAnonymousReportRecoveryMarker({}, {
    storage: staleStorage,
    eventTarget: null,
    now: () => NOW,
    randomUUID: () => RECOVERY_ID,
  });
  let staleRestoreCount = 0;
  const stopStaleWatcher = watchAnonymousReportRecovery({
    storage: staleStorage,
    eventTarget: null,
    now: () => NOW,
    fetchImpl: async () => new Response(JSON.stringify({
      ok: true,
      recovery_id: RECOVERY_ID,
      report: exactReport,
    }), { status: 200, headers: { "Content-Type": "application/json" } }),
    isRestoreCurrent: () => false,
    onRestore: () => { staleRestoreCount += 1; },
  });
  await nextTurn();
  stopStaleWatcher();
  assert.equal(staleRestoreCount, 0, "a stale mount request must not mutate report UI");
  assert.equal(
    readAnonymousReportRecoveryMarker({ storage: staleStorage, now: () => NOW })?.recoveryId,
    RECOVERY_ID,
    "a stale response must keep its recovery marker",
  );

  const expiryStorage = new MemoryStorage();
  attachAnonymousReportRecoveryMarker({}, {
    storage: expiryStorage,
    eventTarget: null,
    now: () => NOW,
    randomUUID: () => RECOVERY_ID,
  });
  let expiryDelay = -1;
  let expire: (() => void) | null = null;
  const stopExpiryWatcher = watchAnonymousReportRecovery({
    storage: expiryStorage,
    eventTarget: null,
    now: () => NOW,
    fetchImpl: async () => new Response(null, { status: 404 }),
    pollDelaysMs: [],
    onRestore: () => undefined,
    setTimeoutImpl: ((callback: () => void, delay?: number) => {
      expire = callback;
      expiryDelay = delay ?? 0;
      return 1;
    }) as typeof setTimeout,
    clearTimeoutImpl: (() => undefined) as typeof clearTimeout,
  });
  await nextTurn();
  assert.equal(expiryDelay, ANONYMOUS_REPORT_RECOVERY_TTL_MS);
  assert.ok(expire);
  (expire as () => void)();
  assert.equal(
    readAnonymousReportRecoveryMarker({ storage: expiryStorage, now: () => NOW }),
    null,
    "a mounted watcher must clear the marker when its 24-hour lifetime ends",
  );
  stopExpiryWatcher();

  console.log("anonymous report recovery client tests passed");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
