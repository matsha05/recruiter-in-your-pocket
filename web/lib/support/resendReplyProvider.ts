import "server-only";

import { Resend } from "resend";

import type { SupportReplyProvider } from "./replyEmail";

let cachedApiKey = "";
let cachedProvider: SupportReplyProvider | null = null;

export function getSupportReplyProvider(): SupportReplyProvider | null {
  const apiKey = process.env.RESEND_API_KEY?.trim() || "";
  if (!apiKey) return null;
  if (cachedProvider && cachedApiKey === apiKey) return cachedProvider;

  const resend = new Resend(apiKey);
  cachedApiKey = apiKey;
  cachedProvider = {
    async getEmail(emailId) {
      const result = await resend.emails.receiving.get(emailId, {
        html_format: "cid",
      });
      return {
        data: result.data
          ? {
              id: result.data.id,
              from: result.data.from,
              replyTo: result.data.reply_to || [],
              subject: result.data.subject,
              text: result.data.text,
              html: result.data.html,
              receivedFor: result.data.received_for,
              headers: result.data.headers || {},
              messageId: result.data.message_id,
              createdAt: result.data.created_at,
            }
          : null,
        error: result.error,
      };
    },
    sendEmail(input, options) {
      return resend.emails.send(input, options);
    },
  };

  return cachedProvider;
}
