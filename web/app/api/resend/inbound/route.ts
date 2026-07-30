import { Resend } from "resend";

import {
  handleSupportInboundWebhook,
  type SupportInboundResult,
} from "@/lib/support/inboundEmail";
import { logError, logInfo, logWarn } from "@/lib/observability/logger";
import { captureOperationalError } from "@/lib/observability/operations";
import { getRequestId, routeLabel } from "@/lib/observability/requestContext";
import { getConfiguredAppUrl } from "@/lib/runtime/appUrl";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const resendApiKey = process.env.RESEND_API_KEY?.trim() || "";
const resend = resendApiKey ? new Resend(resendApiKey) : null;

function enabled(value: string | undefined) {
  return /^(1|true|yes|on)$/i.test(value?.trim() || "");
}

function responseFor(result: SupportInboundResult, requestId: string) {
  return Response.json(
    {
      received: result.status === 200,
      forwarded: result.outcome === "forwarded",
    },
    {
      status: result.status,
      headers: {
        "cache-control": "no-store",
        "x-request-id": requestId,
      },
    }
  );
}

export async function POST(request: Request) {
  const requestId = getRequestId(request);
  const { method, path } = routeLabel(request);
  const route = `${method} ${path}`;
  const forwardingEnabled = enabled(process.env.RIYP_SUPPORT_FORWARDING_ENABLED);

  if (!forwardingEnabled) {
    logInfo({
      request_id: requestId,
      route,
      method,
      path,
      feature: "support_forward",
      msg: "support.inbound.disabled",
      outcome: "success",
    });
    return responseFor({ status: 200, outcome: "disabled" }, requestId);
  }

  if (!resend) {
    logError({
      msg: "support.inbound.config_missing",
      request_id: requestId,
      route,
      method,
      path,
      outcome: "internal_error",
      err: { name: "ConfigError", message: "Support email provider is not configured" },
    });
    return responseFor({ status: 503, outcome: "configuration_error" }, requestId);
  }

  const result = await handleSupportInboundWebhook(
    request,
    {
      enabled: forwardingEnabled,
      webhookSecret: process.env.RESEND_WEBHOOK_SECRET || "",
      forwardTo: process.env.RIYP_SUPPORT_FORWARD_TO || "",
      forwardFrom: process.env.RIYP_SUPPORT_FORWARD_FROM || "",
      replyBaseUrl: getConfiguredAppUrl() || "",
    },
    {
      verifyWebhook: (input) => resend.webhooks.verify(input),
      getEmail: async (emailId) => {
        const result = await resend.emails.receiving.get(emailId, { html_format: "cid" });
        return {
          data: result.data
            ? {
                from: result.data.from,
                replyTo: result.data.reply_to || [],
                subject: result.data.subject,
                html: result.data.html,
                text: result.data.text,
                to: result.data.to,
                cc: result.data.cc || [],
                bcc: result.data.bcc || [],
                receivedFor: result.data.received_for,
                headers: result.data.headers || {},
              }
            : null,
          error: result.error,
        };
      },
      listAttachments: async (emailId) => {
        const result = await resend.emails.receiving.attachments.list({ emailId, limit: 100 });
        return {
          data: result.data
            ? {
                attachments: result.data.data.map((attachment) => ({
                  id: attachment.id,
                  filename: attachment.filename,
                  size: attachment.size,
                  contentType: attachment.content_type,
                  contentId: attachment.content_id,
                  downloadUrl: attachment.download_url,
                })),
                hasMore: result.data.has_more,
              }
            : null,
          error: result.error,
        };
      },
      downloadAttachment: async (downloadUrl, maxBytes) => {
        const response = await fetch(downloadUrl, {
          redirect: "error",
          signal: AbortSignal.timeout(15_000),
        });
        if (!response.ok) throw new Error("Could not download a received email attachment");
        const declaredBytes = Number(response.headers.get("content-length"));
        if (Number.isFinite(declaredBytes) && declaredBytes > maxBytes) return null;
        if (!response.body) return new Uint8Array();

        const chunks: Uint8Array[] = [];
        const reader = response.body.getReader();
        let totalBytes = 0;
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          totalBytes += value.byteLength;
          if (totalBytes > maxBytes) {
            await reader.cancel();
            return null;
          }
          chunks.push(value);
        }

        const content = new Uint8Array(totalBytes);
        let offset = 0;
        for (const chunk of chunks) {
          content.set(chunk, offset);
          offset += chunk.byteLength;
        }
        return content;
      },
      sendEmail: (input, options) => resend.emails.send(input, options),
    }
  );

  const record = {
    request_id: requestId,
    route,
    method,
    path,
    feature: "support_forward",
  } as const;

  if (result.outcome === "forwarded") {
    logInfo({ ...record, msg: "support.inbound.forwarded", outcome: "success" });
  } else if (
    result.outcome === "disabled" ||
    result.outcome === "ignored_event" ||
    result.outcome === "ignored_recipient"
  ) {
    logInfo({ ...record, msg: `support.inbound.${result.outcome}`, outcome: "success" });
  } else if (result.outcome === "forward_failed" || result.outcome === "configuration_error") {
    const error = new Error(
      result.outcome === "forward_failed"
        ? "Support email forwarding failed"
        : "Support email forwarding is not configured"
    );
    logError({
      ...record,
      msg: `support.inbound.${result.outcome}`,
      outcome: "internal_error",
      err: { name: error.name, message: error.message },
    });
    captureOperationalError(error, {
      operation: "support.inbound.forward",
      tags: { outcome: result.outcome },
    });
  } else {
    logWarn({
      ...record,
      msg: `support.inbound.${result.outcome}`,
      outcome: "validation_error",
    });
  }

  return responseFor(result, requestId);
}
