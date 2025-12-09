const nodemailer = require("nodemailer");
const { Resend } = require("resend");

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM,
  RESEND_API_KEY,
  RESEND_FROM_EMAIL
} = process.env;

let transporter = null;
let resendClient = null;

function ensureResend() {
  if (!RESEND_API_KEY) return null;
  if (resendClient) return resendClient;
  console.log("[mailer] Using Resend API client");
  resendClient = new Resend(RESEND_API_KEY);
  return resendClient;
}

function ensureTransport() {
  if (transporter) return transporter;

  console.log('[mailer] Checking SMTP config:', {
    hasHost: !!SMTP_HOST,
    hasPort: !!SMTP_PORT,
    hasUser: !!SMTP_USER,
    hasPass: !!SMTP_PASS,
    host: SMTP_HOST,
    port: SMTP_PORT
  });

  if (SMTP_HOST && SMTP_PORT) {
    console.log('[mailer] Creating SMTP transport...');
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined
    });
    console.log('[mailer] SMTP transport created successfully');
  } else {
    console.log('[mailer] No SMTP config, using dev mode (console logging)');
    transporter = null;
  }
  return transporter;
}

async function sendLoginCode(email, code) {
  const from =
    RESEND_FROM_EMAIL ||
    SMTP_FROM ||
    "no-reply@recruiterinyourpocket.com";
  const subject = "Your Recruiter in Your Pocket code";
  const text = [
    `Your code: ${code}`,
    "",
    "Enter this code to continue your upgrade or sign in from another device.",
    "The code expires in 15 minutes.",
    "",
    "If you did not request this, you can ignore this email."
  ].join("\n");

  // Prefer Resend API when available (works on Vercel/serverless where SMTP egress may be blocked)
  const resend = ensureResend();
  if (resend) {
    try {
      const { error } = await resend.emails.send({
        from,
        to: email,
        subject,
        text
      });
      if (error) {
        throw new Error(error.message || "Unknown Resend error");
      }
      return;
    } catch (err) {
      console.error("[mailer] Resend send failed, falling back to SMTP/dev:", err.message);
    }
  }

  const transport = ensureTransport();
  if (!transport) {
    console.log(`[email][dev] To: ${email}\nSubject: ${subject}\n\n${text}`);
    return;
  }

  await transport.sendMail({ from, to: email, subject, text });
}

module.exports = {
  sendLoginCode
};


