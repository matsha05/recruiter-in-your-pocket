export type FreeStatusSnapshot = {
  ok: true;
  free_uses_left: number;
};

export const FREE_STATUS_TIMEOUT_MS = 8_000;

type FreeStatusRequestOptions = {
  signal?: AbortSignal;
  timeoutMs?: number;
};

async function readFreeStatusSnapshot(fetcher: typeof fetch, signal: AbortSignal): Promise<FreeStatusSnapshot> {
  const response = await fetcher("/api/free-status", { signal, cache: "no-store" });
  let body: any;
  try {
    body = await response.json();
  } catch {
    throw new Error("Free status returned an unreadable response.");
  }
  if (!response.ok || body?.ok !== true) {
    throw new Error(`Free status refresh failed with HTTP ${response.status}.`);
  }
  if (!Number.isInteger(body.free_uses_left) || body.free_uses_left < 0) {
    throw new Error("Free status response did not include an authoritative balance.");
  }
  return body as FreeStatusSnapshot;
}

export async function fetchFreeStatusSnapshot(
  fetcher: typeof fetch = fetch,
  { signal, timeoutMs = FREE_STATUS_TIMEOUT_MS }: FreeStatusRequestOptions = {},
): Promise<FreeStatusSnapshot> {
  if (signal?.aborted) throw new DOMException("Free status refresh canceled.", "AbortError");
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let cancel: (() => void) | undefined;
  const interrupted = new Promise<never>((_resolve, reject) => {
    cancel = () => {
      controller.abort();
      reject(new DOMException("Free status refresh canceled.", "AbortError"));
    };
    signal?.addEventListener("abort", cancel, { once: true });
    timer = setTimeout(() => {
      controller.abort();
      reject(new Error("Free status refresh timed out."));
    }, timeoutMs);
  });

  try {
    // Bound both response headers and the JSON body. The race also settles if
    // cancellation arrives after the transport has stopped honoring abort.
    return await Promise.race([readFreeStatusSnapshot(fetcher, controller.signal), interrupted]);
  } finally {
    clearTimeout(timer);
    if (cancel) signal?.removeEventListener("abort", cancel);
  }
}

export async function refreshFreeStatusBalance(input: {
  fallbackDecrement: boolean;
  setRemaining: (value: number | ((previous: number) => number)) => void;
  fetcher?: typeof fetch;
  shouldApply?: () => boolean;
  signal?: AbortSignal;
  timeoutMs?: number;
}) {
  try {
    const snapshot = await fetchFreeStatusSnapshot(input.fetcher, input);
    if (input.shouldApply && !input.shouldApply()) return false;
    input.setRemaining(snapshot.free_uses_left);
    return true;
  } catch {
    if (input.shouldApply && !input.shouldApply()) return false;
    if (input.fallbackDecrement) {
      input.setRemaining((previous) => Math.max(0, previous - 1));
    }
    return false;
  }
}
