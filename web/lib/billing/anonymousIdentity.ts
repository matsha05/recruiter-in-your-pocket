import {
  ANONYMOUS_ID_COOKIE,
  freeCookieOptions,
  parseAnonymousIdentityCookie,
  type AnonymousIdentity,
} from "../backend/freeCookie";
import { hashForLogs } from "../observability/logger";
import type { NextResponse } from "next/server";

export function hashAnonymousIdentity(identity: AnonymousIdentity) {
  return hashForLogs(`anonymous:${identity.id}`);
}

export function anonymousIdentityHashFromCookie(raw: string | null | undefined) {
  const identity = parseAnonymousIdentityCookie(raw);
  return identity ? hashAnonymousIdentity(identity) : null;
}

export function anonymousNetworkHashFromRequest(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const address = forwarded || request.headers.get("x-real-ip")?.trim();
  return address ? hashForLogs(`anonymous-network:${address.toLowerCase()}`) : null;
}

export function attachAnonymousIdentityCookie<T extends NextResponse>(
  response: T,
  cookieValue: string
) {
  response.cookies.set(ANONYMOUS_ID_COOKIE, cookieValue, freeCookieOptions());
  return response;
}

export function anonymousReceiptId(identity: AnonymousIdentity, monthKey: string) {
  return hashForLogs(`anonymous-receipt:${identity.id}:${monthKey}`);
}
