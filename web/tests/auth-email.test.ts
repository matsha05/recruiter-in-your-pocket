import { AuthEmailDeliveryError, sendAuthOtpEmail } from "../lib/auth/otpEmail";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function adminReturning(otp: string, error: { message: string } | null = null) {
  return {
    auth: {
      admin: {
        async generateLink() {
          return { data: { properties: { email_otp: otp } }, error };
        },
      },
    },
  };
}

async function expectCode(promise: Promise<unknown>, code: AuthEmailDeliveryError["code"]) {
  try {
    await promise;
  } catch (error) {
    assert(error instanceof AuthEmailDeliveryError, "failure uses the stable auth email error type");
    assert(error.code === code, `expected ${code}, received ${error.code}`);
    return;
  }
  throw new Error(`expected ${code} failure`);
}

async function main() {
  const requests: Array<{ url: string; init?: RequestInit }> = [];
  const fetchImpl = async (url: string | URL | Request, init?: RequestInit) => {
    requests.push({ url: String(url), init });
    return new Response(JSON.stringify({ id: "email_test" }), { status: 200 });
  };

  await sendAuthOtpEmail(adminReturning("12345678"), "  Person+Test@Example.com ", {
    fetchImpl: fetchImpl as typeof fetch,
    resendApiKey: "re_test_only",
    from: "RIYP Test <test@example.com>",
  });

  assert(requests.length === 1, "one transactional email is sent");
  assert(requests[0].url === "https://api.resend.com/emails", "email is sent to Resend's HTTPS endpoint");
  const headers = new Headers(requests[0].init?.headers);
  assert(headers.get("authorization") === "Bearer re_test_only", "provider call is authenticated server-side");
  assert(Boolean(headers.get("idempotency-key")), "duplicate provider sends are idempotent");

  const body = JSON.parse(String(requests[0].init?.body));
  assert(body.to[0] === "person+test@example.com", "recipient is normalized");
  assert(body.subject === "Your Recruiter in Your Pocket sign-in code", "subject matches the product promise");
  assert(body.text.includes("12345678"), "plain text contains the code");
  assert(body.html.includes("12345678"), "HTML contains the code");
  assert(body.html.includes("#F7F5EF"), "email uses canonical chalk");
  assert(body.html.includes("#071722"), "email uses canonical ink");
  assert(body.html.includes("#C8F238"), "email uses canonical citron");
  assert(body.html.includes("#00738f"), "email uses canonical deep cyan");
  assert(!body.html.toLowerCase().includes("#c8ff2e"), "email does not drift to the old lime");
  assert(!body.text.includes("http"), "plain text does not silently fall back to a link");
  assert(!body.html.includes("ConfirmationURL"), "HTML does not rely on a hosted template token");

  await expectCode(
    sendAuthOtpEmail(adminReturning("12345678"), "person@example.com", {
      fetchImpl: fetchImpl as typeof fetch,
      resendApiKey: "",
    }),
    "email_configuration"
  );
  await expectCode(
    sendAuthOtpEmail(adminReturning("not-a-code"), "person@example.com", {
      fetchImpl: fetchImpl as typeof fetch,
      resendApiKey: "re_test_only",
    }),
    "auth_provider"
  );
  await expectCode(
    sendAuthOtpEmail(adminReturning("12345678"), "person@example.com", {
      fetchImpl: (async () => new Response("provider down", { status: 503 })) as typeof fetch,
      resendApiKey: "re_test_only",
    }),
    "email_delivery"
  );

  console.log("✅ PASS: auth email is an exact, Supabase-verifiable 8-digit code and fails closed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
