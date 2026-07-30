import "server-only";

import { readTextWithLimit } from "../security/requestBody";

export const SUPPORT_EMAIL_ADDRESS = "support@recruiterinyourpocket.com";
export const SUPPORT_FORWARD_FROM =
  "Recruiter in Your Pocket Support <noreply@recruiterinyourpocket.com>";

const MAX_WEBHOOK_BYTES = 256 * 1024;
const MAX_ATTACHMENT_BYTES = 35 * 1024 * 1024;

type WebhookHeaders = {
  id: string;
  timestamp: string;
  signature: string;
};

type ReceivedMessage = {
  from: string;
  replyTo: string[];
  subject: string;
  html: string | null;
  text: string | null;
  to: string[];
  cc: string[];
  bcc: string[];
  receivedFor: string[];
  headers: Record<string, string>;
};

type ReceivedAttachment = {
  id: string;
  filename?: string;
  size: number;
  contentType: string;
  contentId?: string;
  downloadUrl: string;
};

type SendInput = {
  to: string;
  from: string;
  replyTo: string;
  subject: string;
  html?: string;
  text: string;
  headers: Record<string, string>;
  attachments?: Array<{
    filename?: string;
    content: string;
    contentType: string;
    contentId?: string;
  }>;
};

type ForwardOptions = {
  idempotencyKey: string;
};

type ProviderResult = {
  data: { id: string } | null;
  error: { message?: string } | null;
};

export type SupportInboundDependencies = {
  verifyWebhook(input: {
    payload: string;
    headers: WebhookHeaders;
    webhookSecret: string;
  }): unknown;
  getEmail(emailId: string): Promise<{
    data: ReceivedMessage | null;
    error: { message?: string } | null;
  }>;
  listAttachments(emailId: string): Promise<{
    data: { attachments: ReceivedAttachment[]; hasMore: boolean } | null;
    error: { message?: string } | null;
  }>;
  downloadAttachment(downloadUrl: string, maxBytes: number): Promise<Uint8Array | null>;
  sendEmail(input: SendInput, options: ForwardOptions): Promise<ProviderResult>;
};

export type SupportInboundConfig = {
  enabled: boolean;
  webhookSecret: string;
  forwardTo: string;
  forwardFrom: string;
};

export type SupportInboundResult = {
  status: number;
  outcome:
    | "forwarded"
    | "disabled"
    | "ignored_event"
    | "ignored_recipient"
    | "configuration_error"
    | "payload_too_large"
    | "missing_signature"
    | "invalid_signature"
    | "forward_failed";
};

type ReceivedEmailData = {
  email_id?: unknown;
  from?: unknown;
  to?: unknown;
  cc?: unknown;
  bcc?: unknown;
  received_for?: unknown;
};

type ReceivedEmailEvent = {
  type?: unknown;
  data?: ReceivedEmailData;
};

function normalizedMailbox(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().toLowerCase();
  const bracketed = trimmed.match(/<([^<>]+)>$/)?.[1]?.trim();
  const mailbox = bracketed || trimmed;
  return /^[^\s@]+@[^\s@]+$/.test(mailbox) ? mailbox : null;
}

function mailboxes(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(normalizedMailbox).filter((mailbox): mailbox is string => Boolean(mailbox));
}

function wasSentToSupport(data: ReceivedEmailData): boolean {
  return mailboxes(data.received_for).includes(SUPPORT_EMAIL_ADDRESS);
}

function receivedMessageWasSentToSupport(message: ReceivedMessage): boolean {
  return mailboxes(message.receivedFor).includes(SUPPORT_EMAIL_ADDRESS);
}

function isPreviouslyForwarded(message: ReceivedMessage): boolean {
  return Object.entries(message.headers).some(
    ([name, value]) =>
      name.trim().toLowerCase() === "x-riyp-support-forward" && value.trim() === "1"
  );
}

function safeReplyTo(message: ReceivedMessage, blockedMailboxes: Set<string>): string | null {
  const candidates = [...message.replyTo, message.from];
  for (const candidate of candidates) {
    const mailbox = normalizedMailbox(candidate);
    if (mailbox && !blockedMailboxes.has(mailbox)) return mailbox;
  }
  return null;
}

function webhookHeaders(request: Request): WebhookHeaders | null {
  const id = request.headers.get("svix-id")?.trim() || "";
  const timestamp = request.headers.get("svix-timestamp")?.trim() || "";
  const signature = request.headers.get("svix-signature")?.trim() || "";
  return id && timestamp && signature ? { id, timestamp, signature } : null;
}

export async function handleSupportInboundWebhook(
  request: Request,
  config: SupportInboundConfig,
  dependencies: SupportInboundDependencies
): Promise<SupportInboundResult> {
  if (!config.enabled) {
    return { status: 200, outcome: "disabled" };
  }

  const webhookSecret = config.webhookSecret.trim();
  const forwardTo = normalizedMailbox(config.forwardTo);
  const forwardFrom = normalizedMailbox(config.forwardFrom);
  if (
    !webhookSecret ||
    !forwardTo ||
    !forwardFrom ||
    forwardTo === SUPPORT_EMAIL_ADDRESS ||
    forwardFrom === SUPPORT_EMAIL_ADDRESS ||
    forwardTo === forwardFrom
  ) {
    return { status: 503, outcome: "configuration_error" };
  }

  let payload: string;
  try {
    payload = await readTextWithLimit(request, MAX_WEBHOOK_BYTES);
  } catch (error: unknown) {
    const status = (error as { httpStatus?: number })?.httpStatus === 413 ? 413 : 400;
    return {
      status,
      outcome: status === 413 ? "payload_too_large" : "invalid_signature",
    };
  }

  const headers = webhookHeaders(request);
  if (!headers) {
    return { status: 400, outcome: "missing_signature" };
  }

  let event: ReceivedEmailEvent;
  try {
    event = dependencies.verifyWebhook({ payload, headers, webhookSecret }) as ReceivedEmailEvent;
  } catch {
    return { status: 401, outcome: "invalid_signature" };
  }

  if (event.type !== "email.received") {
    return { status: 200, outcome: "ignored_event" };
  }

  const data = event.data || {};
  const emailId = typeof data.email_id === "string" ? data.email_id.trim() : "";
  const sender = normalizedMailbox(data.from);
  const blockedMailboxes = new Set([SUPPORT_EMAIL_ADDRESS, forwardTo, forwardFrom]);
  if (!emailId || !wasSentToSupport(data) || !sender || blockedMailboxes.has(sender)) {
    return { status: 200, outcome: "ignored_recipient" };
  }

  try {
    const messageResult = await dependencies.getEmail(emailId);
    if (messageResult.error || !messageResult.data) {
      return { status: 502, outcome: "forward_failed" };
    }

    const message = messageResult.data;
    const replyTo = safeReplyTo(message, blockedMailboxes);
    if (!replyTo || !receivedMessageWasSentToSupport(message) || isPreviouslyForwarded(message)) {
      return { status: 200, outcome: "ignored_recipient" };
    }

    const attachmentResult = await dependencies.listAttachments(emailId);
    if (attachmentResult.error || !attachmentResult.data) {
      return { status: 502, outcome: "forward_failed" };
    }

    const attachments = [];
    const listedAttachments = [...attachmentResult.data.attachments].sort((a, b) =>
      a.id.localeCompare(b.id)
    );
    let attachmentsOmitted =
      attachmentResult.data.hasMore ||
      listedAttachments.reduce((total, attachment) => total + attachment.size, 0) >
        MAX_ATTACHMENT_BYTES;
    let totalAttachmentBytes = 0;

    if (!attachmentsOmitted) {
      for (const attachment of listedAttachments) {
        const remainingBytes = MAX_ATTACHMENT_BYTES - totalAttachmentBytes;
        const content = await dependencies.downloadAttachment(
          attachment.downloadUrl,
          remainingBytes
        );
        if (!content) {
          attachmentsOmitted = true;
          attachments.length = 0;
          break;
        }
        totalAttachmentBytes += content.byteLength;
        attachments.push({
          filename: attachment.filename,
          content: Buffer.from(content).toString("base64"),
          contentType: attachment.contentType,
          contentId: attachment.contentId,
        });
      }
    }

    const omissionNotice = attachmentsOmitted
      ? "Attachments were omitted because the message exceeded the support forwarding size limit."
      : "";
    const text = [omissionNotice, message.text || (message.html ? "This support message includes an HTML body." : "This message did not include a text or HTML body.")]
      .filter(Boolean)
      .join("\n\n");
    const html = message.html
      ? `${attachmentsOmitted ? `<p><strong>${omissionNotice}</strong></p>` : ""}${message.html}`
      : undefined;

    const result = await dependencies.sendEmail(
      {
        to: forwardTo,
        from: config.forwardFrom,
        replyTo,
        subject: message.subject || "(no subject)",
        html,
        text,
        headers: {
          "X-RIYP-Support-Forward": "1",
          ...(attachmentsOmitted ? { "X-RIYP-Support-Attachments": "omitted" } : {}),
        },
        attachments: !attachmentsOmitted && attachments.length ? attachments : undefined,
      },
      { idempotencyKey: `riyp-support-forward:${emailId}` }
    );

    if (result.error || !result.data?.id) {
      return { status: 502, outcome: "forward_failed" };
    }
  } catch {
    return { status: 502, outcome: "forward_failed" };
  }

  return { status: 200, outcome: "forwarded" };
}
