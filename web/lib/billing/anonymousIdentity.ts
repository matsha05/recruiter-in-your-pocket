import {
  parseAnonymousIdentityCookie,
  type AnonymousIdentity,
} from "../backend/freeCookie";
import { hashForLogs } from "../observability/logger";

export function hashAnonymousIdentity(identity: AnonymousIdentity) {
  return hashForLogs(`anonymous:${identity.id}`);
}

export function anonymousIdentityHashFromCookie(raw: string | null | undefined) {
  const identity = parseAnonymousIdentityCookie(raw);
  return identity ? hashAnonymousIdentity(identity) : null;
}

export function anonymousReceiptId(identity: AnonymousIdentity, monthKey: string) {
  return hashForLogs(`anonymous-receipt:${identity.id}:${monthKey}`);
}
