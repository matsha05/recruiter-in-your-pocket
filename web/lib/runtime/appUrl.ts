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

export function getConfiguredAppUrl() {
  if (isAbsoluteHttpUrl(process.env.NEXT_PUBLIC_APP_URL)) {
    return process.env.NEXT_PUBLIC_APP_URL!;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return null;
}

export function resolveRequestOrigin(request: Request | NextRequest) {
  const requestUrl = new URL(request.url);
  const forwardedProto =
    request.headers.get("x-forwarded-proto") || requestUrl.protocol.replace(/:$/, "");
  const forwardedHost =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    requestUrl.host;

  const candidate = `${forwardedProto}://${forwardedHost}`;
  return isAbsoluteHttpUrl(candidate) ? candidate : null;
}

export function getAppUrlForRequest(request: Request | NextRequest) {
  return getConfiguredAppUrl() || resolveRequestOrigin(request) || "http://localhost:3000";
}

export function isHostedProductionRuntime() {
  return Boolean(
    process.env.VERCEL_ENV === "production" ||
      (process.env.NEXT_PUBLIC_APP_URL &&
        !process.env.NEXT_PUBLIC_APP_URL.includes("localhost"))
  );
}

