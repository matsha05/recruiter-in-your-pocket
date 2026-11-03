import type { Page } from "@playwright/test";

/**
 * A signed-in browser session for UI specs: the cookie the Supabase client reads, the user it
 * verifies, and the account endpoints the auth provider calls. No real project is reached.
 */
export const TEST_USER = {
  id: "11111111-1111-4111-8111-111111111111",
  aud: "authenticated",
  role: "authenticated",
  email: "candidate@example.test",
  email_confirmed_at: "2026-07-31T12:00:00.000Z",
  phone: "",
  confirmed_at: "2026-07-31T12:00:00.000Z",
  last_sign_in_at: "2026-07-31T12:00:00.000Z",
  app_metadata: { provider: "email", providers: ["email"] },
  user_metadata: {},
  identities: [],
  created_at: "2026-07-31T12:00:00.000Z",
  updated_at: "2026-07-31T12:00:00.000Z",
  is_anonymous: false,
};

const encode = (value: string) => Buffer.from(value).toString("base64url");

export async function installSignedInSession(page: Page, options: { freeUsesLeft?: number; passes?: unknown[] } = {}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) throw new Error("NEXT_PUBLIC_SUPABASE_URL is required for a signed-in UI spec");
  const nowSeconds = Math.floor(Date.now() / 1000);
  const session = {
    access_token: [
      encode(JSON.stringify({ alg: "HS256", typ: "JWT" })),
      encode(JSON.stringify({ sub: TEST_USER.id, aud: "authenticated", role: "authenticated", email: TEST_USER.email, iat: nowSeconds, exp: nowSeconds + 3600, aal: "aal1", session_id: "22222222-2222-4222-8222-222222222222" })),
      "test-signature",
    ].join("."),
    refresh_token: "mock-refresh-token",
    expires_in: 3600,
    expires_at: nowSeconds + 3600,
    token_type: "bearer",
    user: TEST_USER,
  };
  const cookieName = `sb-${new URL(supabaseUrl).hostname.split(".")[0]}-auth-token`;
  await page.addInitScript(({ name, value }) => { document.cookie = `${name}=${value}; Path=/; SameSite=Lax`; }, { name: cookieName, value: `base64-${encode(JSON.stringify(session))}` });
  await page.route("**/auth/v1/user", (route) => route.fulfill({ json: TEST_USER }));
  await page.route("**/auth/v1/token*", (route) => route.fulfill({ json: session }));
  await page.route("**/api/passes", (route) => route.fulfill({ json: { ok: true, passes: options.passes ?? [] } }));
  await page.route("**/api/free-status", (route) => route.fulfill({ json: { ok: true, free_uses_left: options.freeUsesLeft ?? 1, free_uses_remaining: options.freeUsesLeft ?? 1 } }));
}
