import { headers as nextHeaders } from "next/headers";
import type { NextRequest } from "next/server";
import { getConfiguredAppUrl, isHostedProductionRuntime } from "../runtime/appUrl";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function normalizeHostname(host: string | null | undefined) {
  return (host || "").split(":")[0].trim().toLowerCase();
}

export function isLocalHost(host: string | null | undefined) {
  return LOCAL_HOSTS.has(normalizeHostname(host));
}

export function shouldProtectInternalLaunchSurfaceForHost(host: string | null | undefined) {
  if (isLocalHost(host)) return false;
  if (!isHostedProductionRuntime()) return false;
  return true;
}

export async function shouldProtectInternalLaunchSurface() {
  const configured = getConfiguredAppUrl();
  if (configured) {
    return shouldProtectInternalLaunchSurfaceForHost(new URL(configured).host);
  }

  const headerStore = await nextHeaders();
  return shouldProtectInternalLaunchSurfaceForHost(headerStore.get("host"));
}

export function shouldProtectInternalLaunchSurfaceForRequest(request: NextRequest) {
  return shouldProtectInternalLaunchSurfaceForHost(request.headers.get("host"));
}

