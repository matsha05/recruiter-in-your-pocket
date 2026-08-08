import type { ResumeFeedbackResponse } from "../validation/schemas";

export const ANONYMOUS_REPORT_RECOVERY_STORAGE_KEY =
  "riyp:anonymous-report-recovery:v1";
export const ANONYMOUS_REPORT_RECOVERY_MARKER_EVENT =
  "riyp:anonymous-report-recovery-marker:v1";
export const ANONYMOUS_REPORT_RECOVERY_TTL_MS = 24 * 60 * 60 * 1000;
export const ANONYMOUS_REPORT_RECOVERY_POLL_DELAYS_MS = [
  1_000,
  2_000,
  4_000,
  8_000,
  16_000,
  30_000,
] as const;
export const ANONYMOUS_REPORT_RECOVERY_PENDING_MESSAGE =
  "Your completed report may still be processing. Its recovery reference remains in this browser.";
export const ANONYMOUS_REPORT_RECOVERY_UNAVAILABLE_MESSAGE =
  "Report recovery is temporarily unavailable. Your recovery reference remains in this browser; please try again shortly.";

const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

type RecoveryStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export type AnonymousReportRecoveryMarker = Readonly<{
  recoveryId: string;
  createdAt: number;
}>;

type StoredRecoveryMarker = AnonymousReportRecoveryMarker & {
  version: 1;
};

export type AnonymousReportRecoveryClientOptions = {
  storage?: RecoveryStorage | null;
  eventTarget?: EventTarget | null;
  now?: () => number;
  randomUUID?: () => string;
};

export type AnonymousReportRecoveryAttachment<T extends Record<string, unknown>> = {
  marker: AnonymousReportRecoveryMarker | null;
  created: boolean;
  payload: T & { recovery_id?: string; operation_id?: string };
};

export type AnonymousReportRecoveryLookup =
  | {
      status: "found";
      recoveryId: string;
      report: ResumeFeedbackResponse;
    }
  | { status: "pending"; message: string }
  | { status: "invalid" }
  | { status: "unavailable"; message: string }
  | { status: "aborted" };

type FetchLike = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

type RecoverySleep = (delayMs: number, signal?: AbortSignal) => Promise<void>;

export type AnonymousReportRecoveryWatchState = {
  status: "idle" | "checking" | "pending" | "restored" | "unavailable";
  message: string | null;
};

export type AnonymousReportRecoveryWatcherOptions = Pick<
  AnonymousReportRecoveryClientOptions,
  "storage" | "eventTarget" | "now"
> & {
  fetchImpl?: FetchLike;
  pollDelaysMs?: readonly number[];
  sleep?: RecoverySleep;
  captureRestoreOwner?: (recoveryId: string) => unknown;
  isRestoreCurrent?: (recoveryId: string, owner: unknown) => boolean;
  onRestore: (
    report: ResumeFeedbackResponse & { recovery_id: string },
    ownership: { recoveryId: string; owner: unknown },
  ) => boolean | void;
  onStateChange?: (state: AnonymousReportRecoveryWatchState) => void;
  setTimeoutImpl?: typeof setTimeout;
  clearTimeoutImpl?: typeof clearTimeout;
};

function resolveStorage(storage: RecoveryStorage | null | undefined) {
  if (storage !== undefined) return storage;
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function resolveEventTarget(eventTarget: EventTarget | null | undefined) {
  if (eventTarget !== undefined) return eventTarget;
  return typeof window === "undefined" ? null : window;
}

function currentTime(now: (() => number) | undefined) {
  const value = now ? now() : Date.now();
  return Number.isFinite(value) && value >= 0 ? Math.floor(value) : null;
}

function normalizeRecoveryId(value: unknown) {
  if (typeof value !== "string" || !UUID_V4_PATTERN.test(value)) return null;
  return value.toLowerCase();
}

function parseStoredMarker(
  serialized: string,
  now: number,
): AnonymousReportRecoveryMarker | null {
  let candidate: unknown;
  try {
    candidate = JSON.parse(serialized);
  } catch {
    return null;
  }
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    return null;
  }

  const value = candidate as Partial<StoredRecoveryMarker>;
  const keys = Object.keys(value);
  const recoveryId = normalizeRecoveryId(value.recoveryId);
  if (
    keys.length !== 3
    || !keys.includes("version")
    || !keys.includes("recoveryId")
    || !keys.includes("createdAt")
    || value.version !== 1
    || !recoveryId
    || !Number.isInteger(value.createdAt)
    || typeof value.createdAt !== "number"
    || value.createdAt < 0
    || value.createdAt > now
    || now - value.createdAt >= ANONYMOUS_REPORT_RECOVERY_TTL_MS
  ) {
    return null;
  }
  return { recoveryId, createdAt: value.createdAt };
}

function removeStoredMarker(storage: RecoveryStorage) {
  try {
    storage.removeItem(ANONYMOUS_REPORT_RECOVERY_STORAGE_KEY);
  } catch {
    // Storage can be unavailable in private browsing or under quota pressure.
  }
}

function payloadWithoutRecoveryId<T extends Record<string, unknown>>(payload: T) {
  const cleanPayload = { ...payload } as T & { recovery_id?: string; operation_id?: string };
  delete cleanPayload.recovery_id;
  delete cleanPayload.operation_id;
  return cleanPayload;
}

function dispatchRecoveryMarkerEvent(eventTarget: EventTarget | null) {
  if (!eventTarget) return;
  try {
    eventTarget.dispatchEvent(new Event(ANONYMOUS_REPORT_RECOVERY_MARKER_EVENT));
  } catch {
    // The durable marker remains authoritative if event delivery is unavailable.
  }
}

export function readAnonymousReportRecoveryMarker(
  options: Pick<AnonymousReportRecoveryClientOptions, "storage" | "now"> = {},
): AnonymousReportRecoveryMarker | null {
  const storage = resolveStorage(options.storage);
  const now = currentTime(options.now);
  if (!storage || now === null) return null;

  let serialized: string | null;
  try {
    serialized = storage.getItem(ANONYMOUS_REPORT_RECOVERY_STORAGE_KEY);
  } catch {
    return null;
  }
  if (!serialized) return null;

  const marker = parseStoredMarker(serialized, now);
  if (!marker) removeStoredMarker(storage);
  return marker;
}

export function clearAnonymousReportRecoveryMarker(
  expectedRecoveryId?: string,
  options: Pick<AnonymousReportRecoveryClientOptions, "storage" | "now"> = {},
) {
  const storage = resolveStorage(options.storage);
  if (!storage) return;
  if (expectedRecoveryId) {
    const expected = normalizeRecoveryId(expectedRecoveryId);
    const current = readAnonymousReportRecoveryMarker(options);
    if (!expected || !current || current.recoveryId !== expected) return;
  }
  removeStoredMarker(storage);
}

export function attachAnonymousReportRecoveryMarker<
  T extends Record<string, unknown>,
>(
  payload: T,
  options: AnonymousReportRecoveryClientOptions = {},
): AnonymousReportRecoveryAttachment<T> {
  const storage = resolveStorage(options.storage);
  const createdAt = currentTime(options.now);
  if (!storage || createdAt === null) {
    return { marker: null, created: false, payload: payloadWithoutRecoveryId(payload) };
  }
  const existing = readAnonymousReportRecoveryMarker(options);
  if (existing) return { marker: existing, created: false, payload: { ...payloadWithoutRecoveryId(payload), recovery_id: existing.recoveryId, operation_id: existing.recoveryId } };

  let recoveryId: string | null = null;
  try {
    const generated = options.randomUUID
      ? options.randomUUID()
      : globalThis.crypto?.randomUUID?.();
    recoveryId = normalizeRecoveryId(generated);
  } catch {
    recoveryId = null;
  }
  if (!recoveryId) {
    return { marker: null, created: false, payload: payloadWithoutRecoveryId(payload) };
  }

  const marker = { recoveryId, createdAt } satisfies AnonymousReportRecoveryMarker;
  const stored: StoredRecoveryMarker = { version: 1, ...marker };
  try {
    storage.setItem(
      ANONYMOUS_REPORT_RECOVERY_STORAGE_KEY,
      JSON.stringify(stored),
    );
    const persisted = storage.getItem(ANONYMOUS_REPORT_RECOVERY_STORAGE_KEY);
    const verified = persisted ? parseStoredMarker(persisted, createdAt) : null;
    if (!verified || verified.recoveryId !== marker.recoveryId || verified.createdAt !== marker.createdAt) {
      removeStoredMarker(storage);
      return { marker: null, created: false, payload: payloadWithoutRecoveryId(payload) };
    }
  } catch {
    removeStoredMarker(storage);
    return { marker: null, created: false, payload: payloadWithoutRecoveryId(payload) };
  }
  dispatchRecoveryMarkerEvent(resolveEventTarget(options.eventTarget));

  return {
    marker,
    created: true,
    payload: { ...payloadWithoutRecoveryId(payload), recovery_id: recoveryId, operation_id: recoveryId },
  };
}

export async function fetchAnonymousReportRecovery(
  marker: AnonymousReportRecoveryMarker,
  options: { fetchImpl?: FetchLike; signal?: AbortSignal } = {},
): Promise<AnonymousReportRecoveryLookup> {
  if (options.signal?.aborted) return { status: "aborted" };
  const recoveryId = normalizeRecoveryId(marker.recoveryId);
  if (!recoveryId) return { status: "invalid" };
  const fetchImpl = options.fetchImpl || fetch;

  let response: Response;
  try {
    response = await fetchImpl(
      `/api/reports/recovery?recovery_id=${encodeURIComponent(recoveryId)}`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: { Accept: "application/json" },
        signal: options.signal,
      },
    );
  } catch {
    if (options.signal?.aborted) return { status: "aborted" };
    return {
      status: "unavailable",
      message: ANONYMOUS_REPORT_RECOVERY_UNAVAILABLE_MESSAGE,
    };
  }

  if (response.status === 202 || response.status === 404) {
    return {
      status: "pending",
      message: ANONYMOUS_REPORT_RECOVERY_PENDING_MESSAGE,
    };
  }
  if (response.status === 400 || response.status === 410) {
    return { status: "invalid" };
  }
  if (!response.ok) {
    return {
      status: "unavailable",
      message: ANONYMOUS_REPORT_RECOVERY_UNAVAILABLE_MESSAGE,
    };
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    return {
      status: "unavailable",
      message: ANONYMOUS_REPORT_RECOVERY_UNAVAILABLE_MESSAGE,
    };
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { status: "invalid" };
  }

  const result = body as {
    ok?: unknown;
    recovery_id?: unknown;
    report?: unknown;
  };
  const returnedRecoveryId = normalizeRecoveryId(result.recovery_id);
  if (
    result.ok !== true
    || returnedRecoveryId !== recoveryId
    || !result.report
    || typeof result.report !== "object"
    || Array.isArray(result.report)
  ) {
    return { status: "invalid" };
  }

  return {
    status: "found",
    recoveryId,
    report: result.report as ResumeFeedbackResponse,
  };
}

function sleepWithAbort(delayMs: number, signal?: AbortSignal) {
  return new Promise<void>((resolve) => {
    if (signal?.aborted) {
      resolve();
      return;
    }
    const timer = setTimeout(finish, Math.max(0, delayMs));
    function finish() {
      signal?.removeEventListener("abort", abort);
      clearTimeout(timer);
      resolve();
    }
    function abort() {
      finish();
    }
    signal?.addEventListener("abort", abort, { once: true });
  });
}

export async function pollAnonymousReportRecovery(
  marker: AnonymousReportRecoveryMarker,
  options: {
    fetchImpl?: FetchLike;
    signal?: AbortSignal;
    pollDelaysMs?: readonly number[];
    sleep?: RecoverySleep;
    onPending?: (result: Extract<AnonymousReportRecoveryLookup, { status: "pending" }>) => void;
  } = {},
): Promise<AnonymousReportRecoveryLookup> {
  const delays = options.pollDelaysMs || ANONYMOUS_REPORT_RECOVERY_POLL_DELAYS_MS;
  const sleep = options.sleep || sleepWithAbort;

  for (let attempt = 0; ; attempt += 1) {
    if (options.signal?.aborted) return { status: "aborted" };
    const result = await fetchAnonymousReportRecovery(marker, options);
    if (result.status !== "pending") return result;
    options.onPending?.(result);
    if (attempt >= delays.length) return result;
    await sleep(Math.max(0, delays[attempt] || 0), options.signal);
  }
}

export function watchAnonymousReportRecovery(
  options: AnonymousReportRecoveryWatcherOptions,
) {
  const eventTarget = resolveEventTarget(options.eventTarget);
  const setTimer = options.setTimeoutImpl || setTimeout;
  const clearTimer = options.clearTimeoutImpl || clearTimeout;
  let active = true;
  let generation = 0;
  let pollController: AbortController | null = null;
  let expiryTimer: ReturnType<typeof setTimeout> | null = null;

  const publishState = (state: AnonymousReportRecoveryWatchState) => {
    if (active) options.onStateChange?.(state);
  };

  const clearExpiryTimer = () => {
    if (expiryTimer === null) return;
    clearTimer(expiryTimer);
    expiryTimer = null;
  };

  const restart = () => {
    generation += 1;
    const run = generation;
    pollController?.abort();
    clearExpiryTimer();

    const marker = readAnonymousReportRecoveryMarker({
      storage: options.storage,
      now: options.now,
    });
    if (!marker) {
      publishState({ status: "idle", message: null });
      return;
    }

    const now = currentTime(options.now);
    if (now === null) return;
    const expiresIn = Math.max(
      0,
      marker.createdAt + ANONYMOUS_REPORT_RECOVERY_TTL_MS - now,
    );
    const controller = new AbortController();
    const restoreOwner = options.captureRestoreOwner?.(marker.recoveryId);
    pollController = controller;
    expiryTimer = setTimer(() => {
      if (!active || run !== generation) return;
      controller.abort();
      clearAnonymousReportRecoveryMarker(marker.recoveryId, {
        storage: options.storage,
        now: options.now,
      });
      expiryTimer = null;
      publishState({ status: "idle", message: null });
    }, expiresIn);

    publishState({ status: "checking", message: null });
    void pollAnonymousReportRecovery(marker, {
      fetchImpl: options.fetchImpl,
      signal: controller.signal,
      pollDelaysMs: options.pollDelaysMs,
      sleep: options.sleep,
      onPending: () => {
        if (active && run === generation) {
          publishState({
            status: "pending",
            message: ANONYMOUS_REPORT_RECOVERY_PENDING_MESSAGE,
          });
        }
      },
    }).then((result) => {
      if (!active || run !== generation || result.status === "aborted") return;
      if (result.status === "pending") return;
      if (result.status === "unavailable") {
        publishState({
          status: "unavailable",
          message: ANONYMOUS_REPORT_RECOVERY_UNAVAILABLE_MESSAGE,
        });
        return;
      }
      if (result.status === "invalid") {
        clearAnonymousReportRecoveryMarker(marker.recoveryId, {
          storage: options.storage,
          now: options.now,
        });
        clearExpiryTimer();
        publishState({ status: "idle", message: null });
        return;
      }

      const current = readAnonymousReportRecoveryMarker({
        storage: options.storage,
        now: options.now,
      });
      if (!current || current.recoveryId !== marker.recoveryId) return;
      if (
        options.isRestoreCurrent
        && !options.isRestoreCurrent(marker.recoveryId, restoreOwner)
      ) return;
      const applied = options.onRestore({
        ...result.report,
        recovery_id: result.recoveryId,
      }, {
        recoveryId: marker.recoveryId,
        owner: restoreOwner,
      });
      if (applied === false) return;
      publishState({ status: "restored", message: null });
    });
  };

  eventTarget?.addEventListener(ANONYMOUS_REPORT_RECOVERY_MARKER_EVENT, restart);
  restart();

  return () => {
    active = false;
    generation += 1;
    pollController?.abort();
    clearExpiryTimer();
    eventTarget?.removeEventListener(ANONYMOUS_REPORT_RECOVERY_MARKER_EVENT, restart);
  };
}
