import "server-only";

import crypto from "crypto";

import { getRedisClient } from "../redis/client";

const RESERVATION_TTL_SECONDS = 35 * 24 * 60 * 60;
const OPAQUE_ID_PATTERN = /^[A-Za-z0-9_-]{1,200}$/;

const RESERVE_SCRIPT = `
local current = redis.call("GET", KEYS[1])
if current then
  return 0
end
redis.call("SET", KEYS[1], "reserved:" .. ARGV[1], "EX", ARGV[2], "NX")
return 1
`;

const COMMIT_SCRIPT = `
local current = redis.call("GET", KEYS[1])
local reserved = "reserved:" .. ARGV[1]
local sent = "sent:" .. ARGV[2]
if current == sent then
  return 1
end
if current ~= reserved then
  return 0
end
redis.call("SET", KEYS[1], sent, "EX", ARGV[3])
return 1
`;

const RELEASE_SCRIPT = `
local current = redis.call("GET", KEYS[1])
local reserved = "reserved:" .. ARGV[1]
if not current then
  return 1
end
if current ~= reserved then
  return 0
end
redis.call("DEL", KEYS[1])
return 1
`;

type RedisEvalClient = {
  eval(
    script: string,
    keys: string[],
    args: Array<string | number>
  ): Promise<unknown>;
};

export type SupportReplyReservation = {
  reserve(input: { emailId: string; reservationId: string }): Promise<boolean>;
  commit(input: {
    emailId: string;
    reservationId: string;
    outboundId: string;
  }): Promise<boolean>;
  release(input: { emailId: string; reservationId: string }): Promise<boolean>;
};

export class SupportReplyReservationError extends Error {
  code = "SUPPORT_REPLY_RESERVATION_UNAVAILABLE";

  constructor(message = "Support replies are temporarily unavailable.") {
    super(message);
    this.name = "SupportReplyReservationError";
  }
}

function assertOpaqueId(value: string) {
  if (!OPAQUE_ID_PATTERN.test(value)) {
    throw new SupportReplyReservationError();
  }
}

function reservationKey(emailId: string) {
  assertOpaqueId(emailId);
  const digest = crypto.createHash("sha256").update(emailId).digest("hex");
  return `support:reply:${digest}`;
}

function unavailable(cause?: unknown): never {
  const error = new SupportReplyReservationError();
  if (cause !== undefined) {
    (error as Error & { cause?: unknown }).cause = cause;
  }
  throw error;
}

/**
 * Support reply idempotency always fails closed. A provider timeout after a
 * send is ambiguous, so the reservation deliberately survives for the full
 * retention window instead of risking a duplicate customer email.
 */
export function createSupportReplyReservation(
  resolveRedis: () => RedisEvalClient | null = () => getRedisClient()
): SupportReplyReservation {
  return {
    async reserve({ emailId, reservationId }) {
      assertOpaqueId(reservationId);
      const redis = resolveRedis();
      if (!redis) unavailable();
      try {
        const result = await redis.eval(
          RESERVE_SCRIPT,
          [reservationKey(emailId)],
          [reservationId, String(RESERVATION_TTL_SECONDS)]
        );
        return Number(result) === 1;
      } catch (error) {
        unavailable(error);
      }
    },

    async commit({ emailId, reservationId, outboundId }) {
      assertOpaqueId(reservationId);
      assertOpaqueId(outboundId);
      const redis = resolveRedis();
      if (!redis) unavailable();
      try {
        const result = await redis.eval(
          COMMIT_SCRIPT,
          [reservationKey(emailId)],
          [reservationId, outboundId, String(RESERVATION_TTL_SECONDS)]
        );
        return Number(result) === 1;
      } catch (error) {
        unavailable(error);
      }
    },

    async release({ emailId, reservationId }) {
      assertOpaqueId(reservationId);
      const redis = resolveRedis();
      if (!redis) unavailable();
      try {
        const result = await redis.eval(
          RELEASE_SCRIPT,
          [reservationKey(emailId)],
          [reservationId]
        );
        return Number(result) === 1;
      } catch (error) {
        unavailable(error);
      }
    },
  };
}

export const supportReplyReservation = createSupportReplyReservation();
