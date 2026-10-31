import "server-only";

import { createHash } from "node:crypto";
import { SUPPORT_EMAIL_ADDRESS } from "../support/inboundEmail";

const RESEND_EMAIL_ENDPOINT = "https://api.resend.com/emails";
const DEFAULT_FROM = "Recruiter in Your Pocket <noreply@recruiterinyourpocket.com>";
// The code leads the subject so it shows in phone notifications and inbox
// previews, and each send starts its own thread instead of hiding under the last.
function subjectFor(otp: string) {
  return `${otp} is your sign-in code`;
}

type GenerateLinkResult = {
  data?: {
    properties?: {
      email_otp?: string | null;
    } | null;
  } | null;
  error?: { message?: string } | null;
};

type SupabaseAuthAdmin = {
  auth: {
    admin: {
      generateLink(input: {
        type: "magiclink";
        email: string;
      }): Promise<GenerateLinkResult>;
    };
  };
};

export class AuthEmailDeliveryError extends Error {
  readonly code: "auth_provider" | "email_configuration" | "email_delivery";

  constructor(code: AuthEmailDeliveryError["code"]) {
    super(code);
    this.name = "AuthEmailDeliveryError";
    this.code = code;
  }
}

function htmlEmail(otp: string) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${subjectFor(otp)}</title>
  </head>
  <body style="margin:0;background:#f4f4f1;color:#111513;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Your sign-in code is ${otp}. It works once.</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f4f4f1;">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;border:1px solid #dfe0dc;background:#ffffff;">
            <tr>
              <td style="height:4px;background:#ffe14d;"></td>
            </tr>
            <tr>
              <td style="padding:32px 32px 12px;">
                <p style="margin:0;color:#1f5a46;font-size:14px;font-weight:600;letter-spacing:0;">Recruiter in Your Pocket</p>
                <h1 style="margin:18px 0 10px;font-family:Georgia,'Times New Roman',serif;font-size:30px;font-weight:400;line-height:1.2;letter-spacing:-0.5px;">Your code&rsquo;s here.</h1>
                <p style="margin:0;color:#5a605c;font-size:16px;line-height:1.55;">Pop it in and you&rsquo;re back on the other side of the desk.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 32px 24px;">
                <div aria-label="Sign-in code ${otp}" style="display:inline-block;background:#111513;color:#ffffff;border-radius:999px;font-family:Arial,Helvetica,sans-serif;font-size:30px;font-weight:600;letter-spacing:5px;line-height:1.2;padding:18px 24px;">${otp.slice(0, 4)}<span style="margin-left:14px;">${otp.slice(4)}</span></div>
                <p style="margin:14px 0 0;color:#5a605c;font-size:14px;line-height:1.5;">It works once and expires soon.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 32px;color:#5a605c;font-size:13px;line-height:1.5;">
                Didn&rsquo;t ask for this? Ignore it. No one gets in without the code, and we&rsquo;ll never ask you for it.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function textEmail(otp: string) {
  return [
    "Recruiter in Your Pocket",
    "",
    `Your code's here: ${otp}`,
    "",
    "Pop it in and you're back on the other side of the desk. It works once and expires soon.",
    "",
    "Didn't ask for this? Ignore it. No one gets in without the code, and we'll never ask you for it.",
  ].join("\n");
}

export async function sendAuthOtpEmail(
  admin: SupabaseAuthAdmin,
  email: string,
  options: {
    fetchImpl?: typeof fetch;
    resendApiKey?: string;
    from?: string;
  } = {}
): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  const resendApiKey = options.resendApiKey ?? process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    throw new AuthEmailDeliveryError("email_configuration");
  }

  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: normalizedEmail,
  });
  const otp = data?.properties?.email_otp || "";

  if (error || !/^\d{8}$/.test(otp)) {
    throw new AuthEmailDeliveryError("auth_provider");
  }

  const fetchImpl = options.fetchImpl ?? fetch;
  let response: Response;
  try {
    response = await fetchImpl(RESEND_EMAIL_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": createHash("sha256")
          .update(`riyp-auth:${normalizedEmail}:${otp}`)
          .digest("hex"),
      },
      body: JSON.stringify({
        from: options.from ?? process.env.RIYP_AUTH_EMAIL_FROM ?? DEFAULT_FROM,
        to: [normalizedEmail],
        // Replies reach a person instead of the no-reply sender.
        reply_to: SUPPORT_EMAIL_ADDRESS,
        subject: subjectFor(otp),
        html: htmlEmail(otp),
        text: textEmail(otp),
      }),
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new AuthEmailDeliveryError("email_delivery");
  }

  if (!response.ok) {
    throw new AuthEmailDeliveryError("email_delivery");
  }
}
