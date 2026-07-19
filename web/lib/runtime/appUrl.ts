import type { NextRequest } from "next/server";

function isAbsoluteHttpUrl(value: string | undefined | null) {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeHttpOrigin(value: string | undefined | null) {
  if (!isAbsoluteHttpUrl(value)) return null;

  const parsed = new URL(value!);
  if (parsed.username || parsed.password) return null;
  return parsed.origin;
}

function getVercelDeploymentUrl() {
  const value = process.env.VERCEL_URL?.trim();
  if (!value) return null;

  return normalizeHttpOrigin(value.includes("://") ? value : `https://${value}`);
}

export function getConfiguredAppUrl() {
  const configuredUrl = normalizeHttpOrigin(process.env.NEXT_PUBLIC_APP_URL);
  const deploymentUrl = getVercelDeploymentUrl();

  // A preview must return to its own deployment, even when Preview inherited
  // the production NEXT_PUBLIC_APP_URL value in Vercel project settings.
  if (process.env.VERCEL_ENV === "preview") {
    return deploymentUrl || configuredUrl;
  }

  return configuredUrl || deploymentUrl;
}

function resolveRequestOrigin(request: Request | NextRequest) {
  const requestUrl = new URL(request.url);
  const forwardedProto =
    request.headers.get("x-forwarded-proto") || requestUrl.protocol.replace(/:$/, "");
  const forwardedHost =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    requestUrl.host;

  const candidate = `${forwardedProto}://${forwardedHost}`;
  return normalizeHttpOrigin(candidate);
}

function isLocalOrigin(value: string | null) {
  if (!value) return false;
  const hostname = new URL(value).hostname;
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
}

export function getAppUrlForRequest(request: Request | NextRequest) {
  const requestOrigin = resolveRequestOrigin(request);
  const configuredUrl = normalizeHttpOrigin(process.env.NEXT_PUBLIC_APP_URL);
  const deploymentUrl = getVercelDeploymentUrl();

  if (process.env.VERCEL_ENV === "preview") {
    return deploymentUrl || requestOrigin || configuredUrl || "http://localhost:3000";
  }

  // Local development should never send an auth or billing return path to a
  // production URL accidentally copied into the local environment.
  if (process.env.VERCEL_ENV !== "production" && isLocalOrigin(requestOrigin)) {
    return requestOrigin!;
  }

  return configuredUrl || deploymentUrl || requestOrigin || "http://localhost:3000";
}

export function isHostedProductionRuntime() {
  return Boolean(
    process.env.VERCEL_ENV === "production" ||
      (process.env.NEXT_PUBLIC_APP_URL &&
        !process.env.NEXT_PUBLIC_APP_URL.includes("localhost"))
  );
}
