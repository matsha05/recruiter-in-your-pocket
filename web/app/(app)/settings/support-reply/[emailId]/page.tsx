import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { SupportReplySubmitButton } from "@/components/support/SupportReplySubmitButton";
import { createSupabaseServerClient } from "@/lib/supabase/serverClient";
import { canAccessSupportReply } from "@/lib/support/access";
import {
  isValidSupportEmailId,
  loadSupportReplyContext,
  MAX_SUPPORT_REPLY_BYTES,
} from "@/lib/support/replyEmail";
import { getSupportReplyProvider } from "@/lib/support/resendReplyProvider";

import { sendSupportReplyAction } from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Private support reply",
  description: "Reply to a support request from the verified support address.",
};

type SupportReplyPageProps = {
  params: Promise<{ emailId: string }>;
  searchParams: Promise<{ status?: string }>;
};

const STATUS_MESSAGES: Record<string, { tone: "success" | "warning"; message: string }> = {
  sent: {
    tone: "success",
    message: "Reply sent from support@recruiterinyourpocket.com.",
  },
  "already-replied": {
    tone: "warning",
    message: "This message already has a reply, or a reply is awaiting confirmation.",
  },
  "invalid-body": {
    tone: "warning",
    message: "Write a reply before sending and keep it under 20 KB.",
  },
  "rate-limited": {
    tone: "warning",
    message: "Too many reply attempts. Wait a few minutes and try again.",
  },
  unavailable: {
    tone: "warning",
    message: "Private replies are temporarily unavailable. Nothing was sent.",
  },
  "send-failed": {
    tone: "warning",
    message: "The send could not be confirmed. Do not retry from Gmail.",
  },
};

function unavailablePanel() {
  return (
    <section className="border-l-4 border-warning bg-warning/10 p-6">
      <h1 className="font-display text-2xl text-foreground">Private reply unavailable</h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        The original message could not be loaded safely. Nothing was sent; try again later.
      </p>
    </section>
  );
}
export default async function SupportReplyPage({
  params,
  searchParams,
}: SupportReplyPageProps) {
  const { emailId } = await params;
  if (!isValidSupportEmailId(emailId)) notFound();

  const path = `/settings/support-reply/${encodeURIComponent(emailId)}`;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user?.email) {
    redirect(`/auth?from=settings&next=${encodeURIComponent(path)}`);
  }
  if (!canAccessSupportReply(data.user.email)) notFound();

  const provider = getSupportReplyProvider();
  if (!provider) {
    return <div className="mx-auto w-full max-w-3xl px-5 py-12">{unavailablePanel()}</div>;
  }

  const result = await loadSupportReplyContext(
    emailId,
    {
      forwardTo: process.env.RIYP_SUPPORT_FORWARD_TO || "",
      forwardFrom: process.env.RIYP_SUPPORT_FORWARD_FROM || "",
    },
    provider
  );
  if (!result.ok) {
    if (
      result.reason === "invalid_request" ||
      result.reason === "not_found" ||
      result.reason === "not_support_message" ||
      result.reason === "unsafe_recipient"
    ) {
      notFound();
    }
    return <div className="mx-auto w-full max-w-3xl px-5 py-12">{unavailablePanel()}</div>;
  }

  const { status } = await searchParams;
  const statusMessage = status ? STATUS_MESSAGES[status] : null;
  const sent = status === "sent";

  return (
    <section className="flex-1 bg-paper px-5 py-10 sm:px-6 lg:py-14">
      <div className="mx-auto w-full max-w-3xl">
        <header className="border-t border-line pt-6">
          <p className="text-xs font-semibold uppercase riyp-track-010 text-brand">
            Private support reply
          </p>
          <h1 className="mt-3 font-display text-4xl riyp-weight-620 tracking-[-0.04em] text-foreground sm:text-5xl">
            Reply as support, not from Gmail.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
            The recipient, sender address, and thread headers are verified again on the server when you send.
          </p>
        </header>

        {statusMessage ? (
          <div
            role="status"
            className={`mt-7 border-l-4 p-4 text-sm ${statusMessage.tone === "success" ? "border-success bg-success/10 text-success" : "border-warning bg-warning/10 text-warning-foreground"}`}
          >
            {statusMessage.message}
          </div>
        ) : null}

        <div className="mt-8 border-y border-line bg-background">
          <dl className="divide-y divide-line">
            <div className="grid gap-1 px-5 py-4 sm:grid-cols-[8rem_1fr] sm:gap-4">
              <dt className="text-xs font-semibold uppercase riyp-track-010 text-muted-foreground">From</dt>
              <dd className="break-words text-sm text-foreground">{result.context.from}</dd>
            </div>
            <div className="grid gap-1 px-5 py-4 sm:grid-cols-[8rem_1fr] sm:gap-4">
              <dt className="text-xs font-semibold uppercase riyp-track-010 text-muted-foreground">Reply to</dt>
              <dd className="break-words text-sm font-semibold text-foreground">{result.context.replyRecipient}</dd>
            </div>
            <div className="grid gap-1 px-5 py-4 sm:grid-cols-[8rem_1fr] sm:gap-4">
              <dt className="text-xs font-semibold uppercase riyp-track-010 text-muted-foreground">Subject</dt>
              <dd className="break-words text-sm text-foreground">{result.context.subject}</dd>
            </div>
          </dl>

          <div className="border-t border-line px-5 py-5">
            <p className="text-xs font-semibold uppercase riyp-track-010 text-muted-foreground">Message</p>
            {result.context.textPreview ? (
              <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap break-words font-sans text-sm leading-6 text-foreground">
                {result.context.textPreview}
              </pre>
            ) : (
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {result.context.htmlOnly
                  ? "This is an HTML-only message. Read the original safely in the Gmail notification before replying."
                  : "This message has no text body."}
              </p>
            )}
            {result.context.previewTruncated ? (
              <p className="mt-3 text-xs text-muted-foreground">Preview truncated. The Gmail notification contains the full message.</p>
            ) : null}
          </div>
        </div>

        <form action={sendSupportReplyAction} className="mt-8 border-t border-line pt-6">
          <input type="hidden" name="emailId" value={emailId} />
          <label htmlFor="support-reply" className="text-sm font-semibold text-foreground">
            Your reply
          </label>
          <p id="support-reply-help" className="mt-1 text-sm leading-6 text-muted-foreground">
            Plain text only. One reply is allowed for each incoming message.
          </p>
          <textarea
            id="support-reply"
            name="reply"
            required
            disabled={sent}
            maxLength={MAX_SUPPORT_REPLY_BYTES}
            aria-describedby="support-reply-help"
            className="mt-3 min-h-48 w-full resize-y rounded-md border border-line bg-background px-4 py-3 text-base leading-7 text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:cursor-not-allowed disabled:bg-paper-muted"
          />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              Sends from and replies to support@recruiterinyourpocket.com.
            </p>
            <SupportReplySubmitButton disabled={sent} />
          </div>
        </form>
      </div>
    </section>
  );
}
