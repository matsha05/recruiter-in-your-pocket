import { expect, test, type Page } from "@playwright/test";

// The public header loads the account menu only once the account check finds a
// signed-in visitor, so it stays out of every text page's first load. This
// signs a mocked account in on the homepage and opens the menu.
const MOCK_USER = {
  id: "33333333-3333-4333-8333-333333333333",
  aud: "authenticated",
  role: "authenticated",
  email: "header-account@example.test",
  email_confirmed_at: "2026-07-31T12:00:00.000Z",
  phone: "",
  confirmed_at: "2026-07-31T12:00:00.000Z",
  last_sign_in_at: "2026-07-31T12:00:00.000Z",
  app_metadata: { provider: "email", providers: ["email"] },
  user_metadata: { first_name: "Avery" },
  identities: [],
  created_at: "2026-07-31T12:00:00.000Z",
  updated_at: "2026-07-31T12:00:00.000Z",
  is_anonymous: false,
};

function encodeBase64Url(value: string) {
  return Buffer.from(value).toString("base64url");
}

function createMockSession() {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const accessToken = [
    encodeBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" })),
    encodeBase64Url(JSON.stringify({
      sub: MOCK_USER.id,
      aud: "authenticated",
      role: "authenticated",
      email: MOCK_USER.email,
      iat: nowSeconds,
      exp: nowSeconds + 60 * 60,
      aal: "aal1",
      session_id: "44444444-4444-4444-8444-444444444444",
    })),
    "test-signature",
  ].join(".");
  return {
    access_token: accessToken,
    refresh_token: "mock-refresh-token",
    expires_in: 60 * 60,
    expires_at: nowSeconds + 60 * 60,
    token_type: "bearer",
    user: MOCK_USER,
  };
}

async function signIn(page: Page) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) throw new Error("NEXT_PUBLIC_SUPABASE_URL is required for the public header account test");
  const session = createMockSession();
  const cookieName = `sb-${new URL(supabaseUrl).hostname.split(".")[0]}-auth-token`;
  await page.addInitScript(({ name, value }) => {
    document.cookie = `${name}=${value}; Path=/; SameSite=Lax`;
  }, { name: cookieName, value: `base64-${encodeBase64Url(JSON.stringify(session))}` });
  await page.route("**/auth/v1/user", (route) => route.fulfill({ status: 200, json: MOCK_USER }));
  await page.route("**/auth/v1/token*", (route) => route.fulfill({ status: 200, json: session }));
  await page.route("**/api/passes", (route) => route.fulfill({ status: 200, json: { ok: true, passes: [] } }));
  await page.route("**/api/free-status", (route) => route.fulfill({
    status: 200,
    json: { ok: true, free_uses_left: 1, free_uses_remaining: 1 },
  }));
}

test("a signed-in visitor gets the account menu on a public page", async ({ page }) => {
  await signIn(page);
  await page.goto("/");

  const header = page.locator("header.site-header");
  const accountMenu = header.getByRole("button", { name: "Open account menu" });
  await expect(accountMenu).toBeVisible({ timeout: 30_000 });
  await expect(accountMenu).toHaveText("A");
  await expect(header.getByRole("link", { name: "My reports" })).toBeVisible();

  await accountMenu.click();
  const menu = page.getByRole("menu");
  await expect(menu).toBeVisible();
  await expect(menu).toContainText(MOCK_USER.email);
  await expect(menu.getByRole("menuitem", { name: "Settings" })).toBeVisible();
  await expect(menu.getByRole("menuitem", { name: "Sign Out" })).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(menu).toHaveCount(0);
  await expect(accountMenu).toBeFocused();
});
