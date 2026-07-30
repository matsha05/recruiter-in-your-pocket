import assert from "node:assert/strict";
import { Resend } from "resend";
import { Webhook } from "standardwebhooks";

import {
  SUPPORT_EMAIL_ADDRESS,
  SUPPORT_FORWARD_FROM,
  handleSupportInboundWebhook,
  type SupportInboundDependencies,
} from "../lib/support/inboundEmail";

const SIGNED_HEADERS = {
  "content-type": "application/json",
  "svix-id": "msg_test",
  "svix-timestamp": "1785340800",
  "svix-signature": "v1,test",
};

function requestFor(body: unknown, headers: Record<string, string> = SIGNED_HEADERS) {
  return new Request("https://recruiterinyourpocket.com/api/resend/inbound", {
    method: "POST",
    headers,
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function requestWithRealSignature(body: unknown, secret: string, timestamp = new Date()) {
  const payload = JSON.stringify(body);
  const id = "msg_real_signature_test";
  const signature = new Webhook(secret).sign(id, timestamp, payload);
  return requestFor(payload, {
    "content-type": "application/json",
    "svix-id": id,
    "svix-timestamp": String(Math.floor(timestamp.getTime() / 1000)),
    "svix-signature": signature,
  });
}

function receivedEvent(overrides: Record<string, unknown> = {}) {
  return {
    type: "email.received",
    data: {
      email_id: "inbound_test_123",
      from: "candidate@example.com",
      to: [SUPPORT_EMAIL_ADDRESS],
      cc: [],
      bcc: [],
      received_for: [SUPPORT_EMAIL_ADDRESS],
      ...overrides,
    },
  };
}

function dependenciesFor(event: unknown) {
  const sends: Array<{ input: any; options: any }> = [];
  const verifications: any[] = [];
  const dependencies: SupportInboundDependencies = {
    verifyWebhook(input) {
      verifications.push(input);
      return event;
    },
    async getEmail() {
      return {
        data: {
          from: "candidate@example.com",
          replyTo: ["recruiter@example.com"],
          subject: "Help with my report",
          html: '<p>Can you help?</p><img src="cid:proof" />',
          text: "Can you help?",
          to: [SUPPORT_EMAIL_ADDRESS],
          cc: [],
          bcc: [],
          receivedFor: [SUPPORT_EMAIL_ADDRESS],
          headers: {},
        },
        error: null,
      };
    },
    async listAttachments() {
      return {
        data: {
          attachments: [
            {
              id: "attachment_test_123",
              filename: "proof.png",
              size: 11,
              contentType: "image/png",
              contentId: "proof",
              downloadUrl: "https://attachments.example.test/proof.png",
            },
          ],
          hasMore: false,
        },
        error: null,
      };
    },
    async downloadAttachment() {
      return new TextEncoder().encode("proof-bytes");
    },
    async sendEmail(input, options) {
      sends.push({ input, options });
      return { data: { id: "forward_test_123" }, error: null };
    },
  };
  return { dependencies, sends, verifications };
}

const config = {
  enabled: true,
  webhookSecret: "whsec_test",
  forwardTo: "  Owner@Example.test ",
  forwardFrom: SUPPORT_FORWARD_FROM,
};

async function run() {
  {
    const { dependencies, sends, verifications } = dependenciesFor(receivedEvent());
    const result = await handleSupportInboundWebhook(
      requestFor(receivedEvent()),
      { ...config, enabled: false },
      dependencies
    );
    assert.deepEqual(result, { status: 200, outcome: "disabled" });
    assert.equal(verifications.length, 0, "disabled forwarding does not verify or call providers");
    assert.equal(sends.length, 0);
  }

  {
    const { dependencies } = dependenciesFor(receivedEvent());
    const result = await handleSupportInboundWebhook(
      requestFor(receivedEvent()),
      { ...config, webhookSecret: "" },
      dependencies
    );
    assert.deepEqual(result, { status: 503, outcome: "configuration_error" });
  }

  {
    const { dependencies } = dependenciesFor(receivedEvent());
    const result = await handleSupportInboundWebhook(
      requestFor(receivedEvent()),
      { ...config, forwardTo: SUPPORT_EMAIL_ADDRESS },
      dependencies
    );
    assert.deepEqual(result, { status: 503, outcome: "configuration_error" });
  }

  {
    const { dependencies, verifications } = dependenciesFor(receivedEvent());
    const result = await handleSupportInboundWebhook(
      requestFor(receivedEvent(), { "content-type": "application/json" }),
      config,
      dependencies
    );
    assert.deepEqual(result, { status: 400, outcome: "missing_signature" });
    assert.equal(verifications.length, 0, "unsigned requests never reach the verifier");
  }

  {
    const { dependencies } = dependenciesFor(receivedEvent());
    dependencies.verifyWebhook = () => {
      throw new Error("bad signature");
    };
    const result = await handleSupportInboundWebhook(requestFor(receivedEvent()), config, dependencies);
    assert.deepEqual(result, { status: 401, outcome: "invalid_signature" });
  }

  {
    const { dependencies, sends } = dependenciesFor({ type: "email.sent", data: {} });
    const result = await handleSupportInboundWebhook(requestFor({}), config, dependencies);
    assert.deepEqual(result, { status: 200, outcome: "ignored_event" });
    assert.equal(sends.length, 0);
  }

  {
    const { dependencies, sends } = dependenciesFor(
      receivedEvent({ to: [SUPPORT_EMAIL_ADDRESS], received_for: ["sales@recruiterinyourpocket.com"] })
    );
    const result = await handleSupportInboundWebhook(requestFor({}), config, dependencies);
    assert.deepEqual(result, { status: 200, outcome: "ignored_recipient" });
    assert.equal(sends.length, 0, "catch-all mail to other local parts is not forwarded");
  }

  {
    const { dependencies, sends } = dependenciesFor(
      receivedEvent({ from: "owner@example.test" })
    );
    const result = await handleSupportInboundWebhook(requestFor({}), config, dependencies);
    assert.deepEqual(result, { status: 200, outcome: "ignored_recipient" });
    assert.equal(sends.length, 0, "mail from the forwarding destination cannot loop back");
  }

  {
    const { dependencies, sends } = dependenciesFor(receivedEvent());
    dependencies.getEmail = async () => ({
      data: {
        from: "candidate@example.com",
        replyTo: [],
        subject: "Header mismatch",
        html: null,
        text: "Should not forward",
        to: [SUPPORT_EMAIL_ADDRESS],
        cc: [],
        bcc: [],
        receivedFor: ["sales@recruiterinyourpocket.com"],
        headers: {},
      },
      error: null,
    });
    const result = await handleSupportInboundWebhook(requestFor({}), config, dependencies);
    assert.deepEqual(result, { status: 200, outcome: "ignored_recipient" });
    assert.equal(sends.length, 0, "retrieved SMTP envelope destination is rechecked");
  }

  {
    const { dependencies, sends } = dependenciesFor(receivedEvent());
    dependencies.getEmail = async () => ({
      data: {
        from: "candidate@example.com",
        replyTo: [],
        subject: "Loop marker",
        html: null,
        text: "Should not forward",
        to: [SUPPORT_EMAIL_ADDRESS],
        cc: [],
        bcc: [],
        receivedFor: [SUPPORT_EMAIL_ADDRESS],
        headers: { "X-RIYP-Support-Forward": "1" },
      },
      error: null,
    });
    const result = await handleSupportInboundWebhook(requestFor({}), config, dependencies);
    assert.deepEqual(result, { status: 200, outcome: "ignored_recipient" });
    assert.equal(sends.length, 0, "messages bearing the forwarding marker cannot loop");
  }

  {
    const { dependencies, sends, verifications } = dependenciesFor(
      receivedEvent({ to: ["Recruiter in Your Pocket <support@recruiterinyourpocket.com>"] })
    );
    const result = await handleSupportInboundWebhook(requestFor({ signed: true }), config, dependencies);
    assert.deepEqual(result, { status: 200, outcome: "forwarded" });
    assert.equal(verifications.length, 1);
    assert.equal(verifications[0].payload, JSON.stringify({ signed: true }));
    assert.deepEqual(verifications[0].headers, {
      id: "msg_test",
      timestamp: "1785340800",
      signature: "v1,test",
    });
    assert.equal(verifications[0].webhookSecret, "whsec_test");
    assert.equal(sends.length, 1);
    assert.deepEqual(sends[0], {
      input: {
        to: "owner@example.test",
        from: SUPPORT_FORWARD_FROM,
        replyTo: "recruiter@example.com",
        subject: "Help with my report",
        html: '<p>Can you help?</p><img src="cid:proof" />',
        text: "Can you help?",
        headers: { "X-RIYP-Support-Forward": "1" },
        attachments: [
          {
            filename: "proof.png",
            content: Buffer.from("proof-bytes").toString("base64"),
            contentType: "image/png",
            contentId: "proof",
          },
        ],
      },
      options: { idempotencyKey: "riyp-support-forward:inbound_test_123" },
    });
  }

  {
    const { dependencies } = dependenciesFor(receivedEvent());
    dependencies.sendEmail = async () => ({
      data: null,
      error: { message: "provider unavailable" },
    });
    const result = await handleSupportInboundWebhook(requestFor({}), config, dependencies);
    assert.deepEqual(result, { status: 502, outcome: "forward_failed" });
  }


  {
    const { dependencies, sends } = dependenciesFor(receivedEvent());
    dependencies.listAttachments = async () => ({
      data: {
        attachments: [
          {
            id: "too_large",
            filename: "huge.bin",
            size: 36 * 1024 * 1024,
            contentType: "application/octet-stream",
            downloadUrl: "https://attachments.example.test/huge.bin",
          },
        ],
        hasMore: false,
      },
      error: null,
    });
    dependencies.downloadAttachment = async () => {
      throw new Error("oversized attachments must be rejected before download");
    };
    const result = await handleSupportInboundWebhook(requestFor({}), config, dependencies);
    assert.deepEqual(result, { status: 200, outcome: "forwarded" });
    assert.equal(sends.length, 1);
    assert.equal(sends[0].input.attachments, undefined);
    assert.equal(sends[0].input.headers["X-RIYP-Support-Attachments"], "omitted");
    assert.match(sends[0].input.text, /Attachments were omitted/);
  }

  {
    const { dependencies } = dependenciesFor(receivedEvent());
    const result = await handleSupportInboundWebhook(
      new Request("https://recruiterinyourpocket.com/api/resend/inbound", {
        method: "POST",
        headers: {
          ...SIGNED_HEADERS,
          "content-length": String(256 * 1024 + 1),
        },
        body: "small",
      }),
      config,
      dependencies
    );
    assert.deepEqual(result, { status: 413, outcome: "payload_too_large" });
  }

  {
    const secret = `whsec_${Buffer.from("support-webhook-test-secret").toString("base64")}`;
    const event = receivedEvent();
    const { dependencies } = dependenciesFor(event);
    const resend = new Resend("re_test_only");
    dependencies.verifyWebhook = (input) => resend.webhooks.verify(input);

    const valid = await handleSupportInboundWebhook(
      requestWithRealSignature(event, secret),
      { ...config, webhookSecret: secret },
      dependencies
    );
    assert.deepEqual(valid, { status: 200, outcome: "forwarded" });

    const tampered = await handleSupportInboundWebhook(
      requestWithRealSignature({ ...event, type: "email.sent" }, secret),
      { ...config, webhookSecret: secret },
      {
        ...dependencies,
        verifyWebhook: (input) =>
          resend.webhooks.verify({ ...input, payload: `${input.payload}tampered` }),
      }
    );
    assert.deepEqual(tampered, { status: 401, outcome: "invalid_signature" });

    const staleTimestamp = new Date(Date.now() - 6 * 60 * 1000);
    const stale = await handleSupportInboundWebhook(
      requestWithRealSignature(event, secret, staleTimestamp),
      { ...config, webhookSecret: secret },
      dependencies
    );
    assert.deepEqual(stale, { status: 401, outcome: "invalid_signature" });
  }

  console.log("Support inbound webhook verification and forwarding tests passed");
}

void run();
