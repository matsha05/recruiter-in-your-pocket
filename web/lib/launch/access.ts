import { headers as nextHeaders } from "next/headers";
import type { NextRequest } from "next/server";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);
const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);

function normalizeHostname(host: string | null | undefined) {
  return (host || "").split(":")[0].trim().toLowerCase();
}

function isLocalHost(host: string | null | undefined) {
  return LOCAL_HOSTS.has(normalizeHostname(host));
}

export function shouldProtectInternalLaunchSurfaceForHost(
  host: string | null | undefined,
  localRuntime = process.env.NODE_ENV === "development"
    || TRUE_VALUES.has((process.env.RIYP_ALLOW_TEST_INTERNAL_LAUNCH_BYPASS || "").trim().toLowerCase()),
) {
  return !(localRuntime && isLocalHost(host));
}

function parseAdminEmails() {
  return new Set(
    (process.env.INTERNAL_LAUNCH_ADMIN_EMAILS || process.env.LAUNCH_ADMIN_EMAILS || "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  );
}

export function isInternalLaunchAccessEnabled() {
  return TRUE_VALUES.has((process.env.INTERNAL_LAUNCH_ACCESS || "").trim().toLowerCase());
}

export async function shouldProtectInternalLaunchSurface() {
  const headerStore = await nextHeaders();
  return shouldProtectInternalLaunchSurfaceForHost(headerStore.get("host"));
}

export function shouldProtectInternalLaunchSurfaceForRequest(request: NextRequest) {
  return shouldProtectInternalLaunchSurfaceForHost(request.headers.get("host"));
}

export function canAccessInternalLaunchSurface(email: string | null | undefined) {
  if (!isInternalLaunchAccessEnabled()) return false;
  if (!email) return false;
  return parseAdminEmails().has(email.trim().toLowerCase());
}
