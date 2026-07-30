import "server-only";

import crypto from "crypto";

import type { SupportReplyReservation } from "./replyReservation";
import { SupportReplyReservationError } from "./replyReservation";

export const SUPPORT_EMAIL_ADDRESS = "support@recruiterinyourpocket.com";
export const SUPPORT_REPLY_FROM =
  "Recruiter in Your Pocket Support <support@recruiterinyourpocket.com>";
export const MAX_SUPPORT_REPLY_BYTES = 20 * 1024;

const OPAQUE_ID_PATTERN = /^[A-Za-z0-9_-]{1,200}$/;
const MESSAGE_ID_PATTERN = /<[^<>\s\r\n]{1,998}>/g;
const MAX_REFERENCE_IDS = 20;
const MAX_REFERENCE_BYTES = 3_900;
const MAX_PREVIEW_CHARS = 20_000;

export type ReceivedSupportEmail = {
  id: string;
  from: string;
  replyTo: string[];
  subject: string;
  text: string | null;
  html: string | null;
  receivedFor: string[];
  headers: Record<string, string>;
  messageId: string;
  createdAt: string;
};

type ProviderError = {
  message?: string;
  name?: string;
  statusCode?: number | null;
};

export type SupportReplyProvider = {
  getEmail(emailId: string): Promise<{
    data: ReceivedSupportEmail | null;
    error: ProviderError | null;
  }>;
  sendEmail(
    input: {
      from: string;
      to: string;
      replyTo: string;
      subject: string;
      text: string;
      headers: Record<string, string>;
    },
    options: { idempotencyKey: string }
  ): Promise<{
    data: { id: string } | null;
    error: ProviderError | null;
  }>;
};

export type SupportReplySafetyConfig = {
  forwardTo: string;
  forwardFrom: string;
};

export type SupportReplyContext = {
  emailId: string;
  from: string;
  replyRecipient: string;
  subject: string;
  textPreview: string | null;
  previewTruncated: boolean;
  htmlOnly: boolean;
  createdAt: string;
};

export type SupportReplyContextFailureReason =
  | "invalid_request"
  | "configuration_error"
  | "not_found"
  | "not_support_message"
  | "unsafe_recipient"
  | "invalid_thread"
  | "provider_error";

export type SupportReplyContextResult =
  | { ok: true; context: SupportReplyContext; message: ReceivedSupportEmail }
  | {
      ok: false;
      reason: SupportReplyContextFailureReason;
    };

export type SendSupportReplyResult =
  | { ok: true; outboundId: string; receiptRecorded: boolean }
  | {
      ok: false;
      reason:
        | SupportReplyContextFailureReason
        | "invalid_body"
        | "already_replied"
        | "reservation_unavailable"
        | "send_failed";
    };

function normalizedMailbox(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().toLowerCase();
  const bracketed = trimmed.match(/<([^<>]+)>$/)?.[1]?.trim();
  const mailbox = bracketed || trimmed;
  return /^[^\s@]+@[^\s@]+$/.test(mailbox) ? mailbox : null;
}

function normalizedMailboxes(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(normalizedMailbox)
    .filter((mailbox): mailbox is string => Boolean(mailbox));
}

function isLocalProductMailbox(mailbox: string) {
  return mailbox.endsWith("@recruiterinyourpocket.com");
}

function getHeader(headers: Record<string, string>, wanted: string) {
  const normalizedWanted = wanted.toLowerCase();
  return Object.entries(headers).find(
    ([name]) => name.trim().toLowerCase() === normalizedWanted
  )?.[1] || "";
}

function isPreviouslyForwarded(message: ReceivedSupportEmail) {
  return getHeader(message.headers, "x-riyp-support-forward").trim() === "1";
}

function safeReplyRecipient(
  message: ReceivedSupportEmail,
  config: SupportReplySafetyConfig
): string | null {
  const forwardTo = normalizedMailbox(config.forwardTo);
  const forwardFrom = normalizedMailbox(config.forwardFrom);
  if (!forwardTo || !forwardFrom || forwardTo === forwardFrom) return null;

  const blocked = new Set([SUPPORT_EMAIL_ADDRESS, forwardTo, forwardFrom]);
  for (const candidate of [...message.replyTo, message.from]) {
    const mailbox = normalizedMailbox(candidate);
    if (
      mailbox &&
      !blocked.has(mailbox) &&
      !isLocalProductMailbox(mailbox)
    ) {
      return mailbox;
    }
  }
  return null;
}

function sanitizeDisplayText(value: string, maxLength: number) {
  return value
    .replace(/[\u0000-\u001F\u007F]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function messageIds(value: string) {
  return value.match(MESSAGE_ID_PATTERN) || [];
}

function currentMessageId(message: ReceivedSupportEmail) {
  return messageIds(message.messageId)[0] || null;
}

function threadReferences(message: ReceivedSupportEmail, currentId: string) {
  const previous = [
    ...messageIds(getHeader(message.headers, "references")),
    ...messageIds(getHeader(message.headers, "in-reply-to")),
  ];
  const seen = new Set<string>();
  const unique = previous.filter((id) => {
    if (id === currentId || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
  let ids = [...unique.slice(-(MAX_REFERENCE_IDS - 1)), currentId];
  while (
    ids.length > 1 &&
    Buffer.byteLength(ids.join(" "), "utf8") > MAX_REFERENCE_BYTES
  ) {
    ids = ids.slice(1);
  }
  return ids.join(" ");
}

function replySubject(subject: string) {
  const safe = sanitizeDisplayText(subject, 180)
    .replace(/^(?:re:\s*)+/i, "")
    .trim();
  return `Re: ${safe || "(no subject)"}`;
}

function normalizedReplyBody(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const body = value.trim();
  if (!body || Buffer.byteLength(body, "utf8") > MAX_SUPPORT_REPLY_BYTES) {
    return null;
  }
  return body;
}

function providerIdempotencyKey(emailId: string) {
  const digest = crypto.createHash("sha256").update(emailId).digest("hex");
  return `riyp-support-reply:${digest}`;
}

function explicitProviderRejection(error: ProviderError | null) {
  const status = Number(error?.statusCode);
  const ambiguousIdempotencyError =
    error?.name === "concurrent_idempotent_requests" ||
    error?.name === "invalid_idempotent_request";
  return (
    !ambiguousIdempotencyError &&
    Number.isInteger(status) &&
    status !== 409 &&
    status >= 400 &&
    status < 500
  );
}

export function isValidSupportEmailId(value: unknown): value is string {
  return typeof value === "string" && OPAQUE_ID_PATTERN.test(value);
}

export async function loadSupportReplyContext(
  emailId: string,
  config: SupportReplySafetyConfig,
  provider: Pick<SupportReplyProvider, "getEmail">
): Promise<SupportReplyContextResult> {
  if (!isValidSupportEmailId(emailId)) {
    return { ok: false, reason: "invalid_request" };
  }

  if (!normalizedMailbox(config.forwardTo) || !normalizedMailbox(config.forwardFrom)) {
    return { ok: false, reason: "configuration_error" };
  }

  let result: Awaited<ReturnType<SupportReplyProvider["getEmail"]>>;
  try {
    result = await provider.getEmail(emailId);
  } catch {
    return { ok: false, reason: "provider_error" };
  }
  if (result.error || !result.data) {
    return {
      ok: false,
      reason: result.error?.statusCode === 404 ? "not_found" : "provider_error",
    };
  }

  const message = result.data;
  if (
    message.id !== emailId ||
    !normalizedMailboxes(message.receivedFor).includes(SUPPORT_EMAIL_ADDRESS) ||
    isPreviouslyForwarded(message)
  ) {
    return { ok: false, reason: "not_support_message" };
  }

  const recipient = safeReplyRecipient(message, config);
  if (!recipient) return { ok: false, reason: "unsafe_recipient" };
  if (!currentMessageId(message)) return { ok: false, reason: "invalid_thread" };

  const sourceText = message.text || "";
  const textPreview = sourceText ? sourceText.slice(0, MAX_PREVIEW_CHARS) : null;
  return {
    ok: true,
    message,
    context: {
      emailId,
      from: sanitizeDisplayText(message.from, 320) || recipient,
      replyRecipient: recipient,
      subject: sanitizeDisplayText(message.subject, 180) || "(no subject)",
      textPreview,
      previewTruncated: sourceText.length > MAX_PREVIEW_CHARS,
      htmlOnly: !message.text && Boolean(message.html),
      createdAt: message.createdAt,
    },
  };
}

export async function sendSupportReply(
  input: {
    emailId: string;
    body: unknown;
    reservationId: string;
  },
  config: SupportReplySafetyConfig,
  dependencies: {
    provider: SupportReplyProvider;
    reservation: SupportReplyReservation;
  }
): Promise<SendSupportReplyResult> {
  const body = normalizedReplyBody(input.body);
  if (!body || !isValidSupportEmailId(input.reservationId)) {
    return { ok: false, reason: "invalid_body" };
  }

  const contextResult = await loadSupportReplyContext(
    input.emailId,
    config,
    dependencies.provider
  );
  if (!contextResult.ok) return contextResult;

  const messageId = currentMessageId(contextResult.message);
  if (!messageId) return { ok: false, reason: "invalid_thread" };

  let reserved: boolean;
  try {
    reserved = await dependencies.reservation.reserve({
      emailId: input.emailId,
      reservationId: input.reservationId,
    });
  } catch (error) {
    if (error instanceof SupportReplyReservationError) {
      return { ok: false, reason: "reservation_unavailable" };
    }
    return { ok: false, reason: "reservation_unavailable" };
  }
  if (!reserved) return { ok: false, reason: "already_replied" };

  let sent: Awaited<ReturnType<SupportReplyProvider["sendEmail"]>>;
  try {
    sent = await dependencies.provider.sendEmail(
      {
        from: SUPPORT_REPLY_FROM,
        to: contextResult.context.replyRecipient,
        replyTo: SUPPORT_EMAIL_ADDRESS,
        subject: replySubject(contextResult.message.subject),
        text: body,
        headers: {
          "In-Reply-To": messageId,
          References: threadReferences(contextResult.message, messageId),
          "X-RIYP-Support-Reply": "1",
        },
      },
      { idempotencyKey: providerIdempotencyKey(input.emailId) }
    );
  } catch {
    // Ambiguous transport failures keep the reservation so a retry cannot
    // send a second customer email after the provider accepted the first.
    return { ok: false, reason: "send_failed" };
  }

  if (sent.error || !sent.data?.id) {
    if (explicitProviderRejection(sent.error)) {
      try {
        await dependencies.reservation.release({
          emailId: input.emailId,
          reservationId: input.reservationId,
        });
      } catch {
        // Failing closed is safer than reopening an uncertain send.
      }
    }
    return { ok: false, reason: "send_failed" };
  }

  let receiptRecorded = false;
  try {
    receiptRecorded = await dependencies.reservation.commit({
      emailId: input.emailId,
      reservationId: input.reservationId,
      outboundId: sent.data.id,
    });
  } catch {
    // The original reservation remains and still blocks duplicate replies.
  }

  return { ok: true, outboundId: sent.data.id, receiptRecorded };
}
