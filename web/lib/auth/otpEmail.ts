import "server-only";

import { createHash } from "node:crypto";

const RESEND_EMAIL_ENDPOINT = "https://api.resend.com/emails";
const DEFAULT_FROM = "Recruiter in Your Pocket <noreply@recruiterinyourpocket.com>";
const SUBJECT = "Your Recruiter in Your Pocket sign-in code";

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
    <title>${SUBJECT}</title>
  </head>
  <body style="margin:0;background:#f6f3ef;color:#12191b;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f6f3ef;">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;border:1px solid #dcdedb;background:#ffffff;">
            <tr>
              <td style="height:4px;background:#12191b;"></td>
            </tr>
            <tr>
              <td style="padding:32px 32px 12px;">
                <p style="margin:0;color:#00738f;font-size:14px;font-weight:600;letter-spacing:0;">Recruiter in Your Pocket</p>
                <h1 style="margin:18px 0 10px;font-family:Georgia,'Times New Roman',serif;font-size:30px;font-weight:400;line-height:1.2;letter-spacing:-0.5px;">Your sign-in code</h1>
                <p style="margin:0;color:#5f6667;font-size:16px;line-height:1.55;">Enter this code on the sign-in screen. It expires shortly and can only be used once.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 32px 24px;">
                <div aria-label="Sign-in code ${otp}" style="display:inline-block;background:#12191b;color:#ffffff;border-radius:999px;font-family:Arial,Helvetica,sans-serif;font-size:30px;font-weight:600;letter-spacing:5px;line-height:1.2;padding:18px 24px;">${otp}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 32px;color:#5f6667;font-size:13px;line-height:1.5;">
                If you did not request this, you can safely ignore this email. Recruiter in Your Pocket will never ask you to send this code to anyone.
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
    `Your sign-in code is: ${otp}`,
    "",
    "Enter it on the sign-in screen. It expires shortly and can only be used once.",
    "If you did not request this, you can safely ignore this email.",
    "Recruiter in Your Pocket will never ask you to send this code to anyone.",
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
        subject: SUBJECT,
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
