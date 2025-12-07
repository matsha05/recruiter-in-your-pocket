const nodemailer = require("nodemailer");

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM
} = process.env;

let transporter = null;

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
  const transport = ensureTransport();
  const from = SMTP_FROM || "no-reply@recruiterinyourpocket.com";
  const subject = "Your Recruiter in Your Pocket code";
  const text = [
    `Your code: ${code}`,
    "",
    "Enter this code to continue your upgrade or sign in from another device.",
    "The code expires in 15 minutes.",
    "",
    "If you did not request this, you can ignore this email."
  ].join("\n");

  if (!transport) {
    console.log(`[email][dev] To: ${email}\nSubject: ${subject}\n\n${text}`);
    return;
  }

  await transport.sendMail({
    from,
    to: email,
    subject,
    text
  });
}

module.exports = {
  sendLoginCode
};


