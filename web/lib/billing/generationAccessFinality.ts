export type GenerationAccessState =
  | "reserved"
  | "committed"
  | "released"
  | "refunded"
  | "expired"
  | "missing"
  | "unknown";

export type GenerationAccessAction = "committed" | "released" | "none";

export type GenerationAccessResolution = {
  state: GenerationAccessState;
  action: GenerationAccessAction;
  accessConsumed: boolean | null;
};

const KNOWN_STATES = new Set<GenerationAccessState>([
  "reserved",
  "committed",
  "released",
  "refunded",
  "expired",
  "missing",
]);

export function accessResolution(
  state: GenerationAccessState,
  action: GenerationAccessAction = "none"
): GenerationAccessResolution {
  const accessConsumed = state === "committed"
    ? true
    : state === "released" || state === "refunded" || state === "expired"
      ? false
      : null;
  return { state, action, accessConsumed };
}

export function firstRpcRecord(value: unknown): Record<string, unknown> | null {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (!candidate || typeof candidate !== "object") return null;
  return candidate as Record<string, unknown>;
}

export function resolutionFromRpcData(
  value: unknown,
  fallbackAction: GenerationAccessAction = "none"
) {
  const record = firstRpcRecord(value);
  const candidate = String(record?.status || "unknown") as GenerationAccessState;
  const state = KNOWN_STATES.has(candidate) ? candidate : "unknown";
  const actionValue = String(record?.action || fallbackAction);
  const action: GenerationAccessAction = actionValue === "released"
    ? "released"
    : actionValue === "committed"
      ? "committed"
      : "none";
  return accessResolution(state, action);
}

export async function queryAuthenticatedAccessState(
  admin: import("./generationAccessTypes").GenerationAccessRpcClient,
  userId: string,
  reservationId: string
): Promise<GenerationAccessResolution> {
  try {
    const { data, error } = await admin.rpc("get_generation_access_status", {
      p_user_id: userId,
      p_reservation_id: reservationId,
    });
    if (error) return accessResolution("unknown");
    return resolutionFromRpcData(data);
  } catch {
    return accessResolution("unknown");
  }
}
