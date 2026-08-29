export type FreeStatusPayload = {
  ok?: unknown;
  free_uses_left?: unknown;
};

export function readAuthoritativeFreeUses(
  httpOk: boolean,
  payload: FreeStatusPayload
) {
  const uses = Number(payload?.free_uses_left);
  if (
    !httpOk
    || payload?.ok !== true
    || !Number.isFinite(uses)
    || uses < 0
  ) {
    throw new Error("Free report status is unavailable");
  }
  return Math.floor(uses);
}

export function preservePaidReportAccess(reportedUses: number, hasPaidAccess: boolean) {
  return hasPaidAccess ? Math.max(1, reportedUses) : reportedUses;
}
