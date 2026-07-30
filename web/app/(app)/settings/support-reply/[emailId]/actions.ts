"use server";

import crypto from "crypto";
import { notFound, redirect } from "next/navigation";

import { canAccessSupportReply } from "@/lib/support/access";
import {
  isValidSupportEmailId,
  sendSupportReply,
  type SendSupportReplyResult,
} from "@/lib/support/replyEmail";
import { supportReplyReservation } from "@/lib/support/replyReservation";
import { getSupportReplyProvider } from "@/lib/support/resendReplyProvider";
import { createSupabaseServerAction } from "@/lib/supabase/serverClient";
import { hashForLogs, logError, logInfo, logWarn } from "@/lib/observability/logger";
import { rateLimitAsync } from "@/lib/security/rateLimit";

const RATE_LIMIT_COUNT = 10;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

function replyPath(emailId: string, status?: string) {
  const path = `/settings/support-reply/${encodeURIComponent(emailId)}`;
  return status ? `${path}?status=${encodeURIComponent(status)}` : path;
}

function statusForFailure(reason: Extract<SendSupportReplyResult, { ok: false }>["reason"]) {
  if (reason === "already_replied") return "already-replied";
  if (reason === "invalid_body") return "invalid-body";
  if (
    reason === "reservation_unavailable" ||
    reason === "provider_error" ||
    reason === "configuration_error"
  ) {
    return "unavailable";
  }
  if (
    reason === "invalid_request" ||
    reason === "not_found" ||
    reason === "not_support_message" ||
    reason === "unsafe_recipient" ||
    reason === "invalid_thread"
  ) {
    return "not-found";
  }
  return "send-failed";
}

export async function sendSupportReplyAction(formData: FormData) {
  const emailIdValue = formData.get("emailId");
  if (!isValidSupportEmailId(emailIdValue)) notFound();
  const emailId = emailIdValue;
  const path = replyPath(emailId);

  const supabase = await createSupabaseServerAction();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user?.id || !user.email) {
    redirect(`/auth?from=settings&next=${encodeURIComponent(path)}`);
  }
  if (!canAccessSupportReply(user.email)) notFound();

  const limit = await rateLimitAsync(
    `user:${hashForLogs(user.id)}:support-reply:${hashForLogs(emailId)}`,
    RATE_LIMIT_COUNT,
    RATE_LIMIT_WINDOW_MS
  );
  if (!limit.ok) {
    logWarn({
      msg: "support.reply.rate_limited",
      feature: "support_reply",
      user_id: hashForLogs(user.id),
      source: hashForLogs(emailId),
      outcome: "rate_limited",
    });
    redirect(replyPath(emailId, "rate-limited"));
  }

  const provider = getSupportReplyProvider();
  if (!provider) {
    logError({
      msg: "support.reply.config_missing",
      feature: "support_reply",
      user_id: hashForLogs(user.id),
      source: hashForLogs(emailId),
      outcome: "internal_error",
      err: { name: "ConfigError", message: "Support reply provider is unavailable" },
    });
    redirect(replyPath(emailId, "unavailable"));
  }

  const result = await sendSupportReply(
    {
      emailId,
      body: formData.get("reply"),
      reservationId: crypto.randomUUID(),
    },
    {
      forwardTo: process.env.RIYP_SUPPORT_FORWARD_TO || "",
      forwardFrom: process.env.RIYP_SUPPORT_FORWARD_FROM || "",
    },
    { provider, reservation: supportReplyReservation }
  );

  if (!result.ok) {
    const status = statusForFailure(result.reason);
    if (status === "not-found") notFound();
    logWarn({
      msg: `support.reply.${result.reason}`,
      feature: "support_reply",
      user_id: hashForLogs(user.id),
      source: hashForLogs(emailId),
      outcome: result.reason === "already_replied" ? "validation_error" : "provider_error",
    });
    redirect(replyPath(emailId, status));
  }

  logInfo({
    msg: result.receiptRecorded
      ? "support.reply.sent"
      : "support.reply.sent_receipt_unconfirmed",
    feature: "support_reply",
    user_id: hashForLogs(user.id),
    source: hashForLogs(emailId),
    outcome: "success",
  });
  redirect(replyPath(emailId, "sent"));
}
