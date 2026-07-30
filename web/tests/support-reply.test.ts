import assert from "node:assert/strict";

import { canAccessSupportReply } from "../lib/support/access";
import {
  loadSupportReplyContext,
  MAX_SUPPORT_REPLY_BYTES,
  sendSupportReply,
  SUPPORT_EMAIL_ADDRESS,
  SUPPORT_REPLY_FROM,
  type ReceivedSupportEmail,
  type SupportReplyProvider,
} from "../lib/support/replyEmail";
import {
  createSupportReplyReservation,
  SupportReplyReservationError,
  type SupportReplyReservation,
} from "../lib/support/replyReservation";

const EMAIL_ID = "received_email_123";
const RESERVATION_ID = "reservation_123";
const config = {
  forwardTo: "owner@example.test",
  forwardFrom: "Recruiter in Your Pocket <noreply@recruiterinyourpocket.com>",
};

function receivedEmail(overrides: Partial<ReceivedSupportEmail> = {}): ReceivedSupportEmail {
  return {
    id: EMAIL_ID,
    from: "Candidate <candidate@example.com>",
    replyTo: ["reply@example.com"],
    subject: "Question about my report",
    text: "Can you help with this report?",
    html: "<p>Can you help with this report?</p>",
    receivedFor: [SUPPORT_EMAIL_ADDRESS],
    headers: {
      References: "junk <first@example.com>\r\nBcc: victim@example.com <second@example.com>",
      "In-Reply-To": "<first@example.com>",
    },
    messageId: "<current@example.com>",
    createdAt: "2026-07-30T16:00:00.000Z",
    ...overrides,
  };
}

function dependencies(overrides: {
  email?: ReceivedSupportEmail;
  reserve?: boolean;
  sendError?: { message: string; name?: string; statusCode?: number | null } | null;
  throwOnSend?: boolean;
  commit?: boolean;
} = {}) {
  const calls = {
    sends: [] as Array<{ input: any; options: any }>,
    reserves: [] as any[],
    commits: [] as any[],
    releases: [] as any[],
  };
  const provider: SupportReplyProvider = {
    async getEmail() {
      return { data: overrides.email || receivedEmail(), error: null };
    },
    async sendEmail(input, options) {
      calls.sends.push({ input, options });
      if (overrides.throwOnSend) throw new Error("network unavailable");
      if (overrides.sendError) return { data: null, error: overrides.sendError };
      return { data: { id: "outbound_123" }, error: null };
    },
  };
  const reservation: SupportReplyReservation = {
    async reserve(input) {
      calls.reserves.push(input);
      return overrides.reserve ?? true;
    },
    async commit(input) {
      calls.commits.push(input);
      return overrides.commit ?? true;
    },
    async release(input) {
      calls.releases.push(input);
      return true;
    },
  };
  return { provider, reservation, calls };
}

async function run() {
  assert.equal(canAccessSupportReply("owner@example.test", {}), false, "missing allowlist denies all");
  assert.equal(
    canAccessSupportReply("not-an-email", { RIYP_SUPPORT_OPERATOR_EMAILS: "not-an-email" }),
    false,
    "invalid allowlist entries deny all"
  );
  assert.equal(
    canAccessSupportReply(" OWNER@example.test ", {
      RIYP_SUPPORT_OPERATOR_EMAILS: "other@example.test,owner@example.test",
    }),
    true
  );
  assert.equal(
    canAccessSupportReply("attacker@example.test", {
      RIYP_SUPPORT_OPERATOR_EMAILS: "owner@example.test",
    }),
    false
  );

  {
    const { provider } = dependencies();
    const result = await loadSupportReplyContext(EMAIL_ID, config, provider);
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.context.replyRecipient, "reply@example.com");
      assert.equal(result.context.from, "Candidate <candidate@example.com>");
      assert.equal(result.context.subject, "Question about my report");
    }
  }

  {
    const { provider } = dependencies({
      email: receivedEmail({ receivedFor: ["sales@recruiterinyourpocket.com"] }),
    });
    assert.deepEqual(await loadSupportReplyContext(EMAIL_ID, config, provider), {
      ok: false,
      reason: "not_support_message",
    });
  }

  {
    const { provider } = dependencies({
      email: receivedEmail({
        from: "support@recruiterinyourpocket.com",
        replyTo: ["billing@recruiterinyourpocket.com"],
      }),
    });
    assert.deepEqual(await loadSupportReplyContext(EMAIL_ID, config, provider), {
      ok: false,
      reason: "unsafe_recipient",
    });
  }

  {
    const { provider } = dependencies({
      email: receivedEmail({ headers: { "X-RIYP-Support-Forward": "1" } }),
    });
    assert.deepEqual(await loadSupportReplyContext(EMAIL_ID, config, provider), {
      ok: false,
      reason: "not_support_message",
    });
  }

  {
    const { provider, reservation, calls } = dependencies();
    const result = await sendSupportReply(
      { emailId: EMAIL_ID, body: "  Thanks — I can help.  ", reservationId: RESERVATION_ID },
      config,
      { provider, reservation }
    );
    assert.deepEqual(result, {
      ok: true,
      outboundId: "outbound_123",
      receiptRecorded: true,
    });
    assert.equal(calls.sends.length, 1);
    assert.deepEqual(calls.sends[0].input, {
      from: SUPPORT_REPLY_FROM,
      to: "reply@example.com",
      replyTo: SUPPORT_EMAIL_ADDRESS,
      subject: "Re: Question about my report",
      text: "Thanks — I can help.",
      headers: {
        "In-Reply-To": "<current@example.com>",
        References: "<first@example.com> <second@example.com> <current@example.com>",
        "X-RIYP-Support-Reply": "1",
      },
    });
    assert.match(calls.sends[0].options.idempotencyKey, /^riyp-support-reply:[0-9a-f]{64}$/);
    assert.equal(JSON.stringify(calls.sends[0]).includes("owner@example.test"), false);
    assert.deepEqual(calls.commits, [
      { emailId: EMAIL_ID, reservationId: RESERVATION_ID, outboundId: "outbound_123" },
    ]);
  }

  {
    const { provider, reservation, calls } = dependencies({ reserve: false });
    assert.deepEqual(
      await sendSupportReply(
        { emailId: EMAIL_ID, body: "Do not duplicate", reservationId: RESERVATION_ID },
        config,
        { provider, reservation }
      ),
      { ok: false, reason: "already_replied" }
    );
    assert.equal(calls.sends.length, 0);
  }

  {
    const { provider, reservation, calls } = dependencies({
      sendError: { message: "invalid body", name: "validation_error", statusCode: 422 },
    });
    assert.deepEqual(
      await sendSupportReply(
        { emailId: EMAIL_ID, body: "Retryable correction", reservationId: RESERVATION_ID },
        config,
        { provider, reservation }
      ),
      { ok: false, reason: "send_failed" }
    );
    assert.equal(calls.releases.length, 1, "a confirmed 4xx rejection may release the reservation");
  }

  {
    const { provider, reservation, calls } = dependencies({ throwOnSend: true });
    assert.deepEqual(
      await sendSupportReply(
        { emailId: EMAIL_ID, body: "Ambiguous transport", reservationId: RESERVATION_ID },
        config,
        { provider, reservation }
      ),
      { ok: false, reason: "send_failed" }
    );
    assert.equal(calls.releases.length, 0, "ambiguous sends must remain reserved");
  }

  {
    const { provider, reservation, calls } = dependencies({
      sendError: {
        message: "another request with this idempotency key is still processing",
        name: "concurrent_idempotent_requests",
        statusCode: 409,
      },
    });
    assert.deepEqual(
      await sendSupportReply(
        { emailId: EMAIL_ID, body: "Ambiguous provider conflict", reservationId: RESERVATION_ID },
        config,
        { provider, reservation }
      ),
      { ok: false, reason: "send_failed" }
    );
    assert.equal(calls.releases.length, 0, "provider idempotency conflicts must remain reserved");
  }

  {
    const { provider, reservation, calls } = dependencies();
    const oversized = "x".repeat(MAX_SUPPORT_REPLY_BYTES + 1);
    assert.deepEqual(
      await sendSupportReply(
        { emailId: EMAIL_ID, body: oversized, reservationId: RESERVATION_ID },
        config,
        { provider, reservation }
      ),
      { ok: false, reason: "invalid_body" }
    );
    assert.equal(calls.reserves.length, 0);
  }

  {
    const backend = createSupportReplyReservation(() => null);
    await assert.rejects(
      backend.reserve({ emailId: EMAIL_ID, reservationId: RESERVATION_ID }),
      (error: unknown) => error instanceof SupportReplyReservationError
    );
  }

  console.log("Support reply access, threading, and idempotency tests passed");
}

void run();
