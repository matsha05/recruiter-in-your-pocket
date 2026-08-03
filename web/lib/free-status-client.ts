export type FreeStatusSnapshot = {
  ok: true;
  free_uses_left: number;
};

export async function fetchFreeStatusSnapshot(fetcher: typeof fetch = fetch): Promise<FreeStatusSnapshot> {
  const response = await fetcher("/api/free-status");
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

export async function refreshFreeStatusBalance(input: {
  fallbackDecrement: boolean;
  setRemaining: (value: number | ((previous: number) => number)) => void;
  fetcher?: typeof fetch;
}) {
  try {
    const snapshot = await fetchFreeStatusSnapshot(input.fetcher);
    input.setRemaining(snapshot.free_uses_left);
    return true;
  } catch {
    if (input.fallbackDecrement) {
      input.setRemaining((previous) => Math.max(0, previous - 1));
    }
    return false;
  }
}
