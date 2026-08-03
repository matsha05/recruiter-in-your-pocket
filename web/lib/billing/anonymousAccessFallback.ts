export type AnonymousAccessEnvironment = Record<string, string | undefined>;

export function allowsExplicitLocalAnonymousAccessFallback(
  env: AnonymousAccessEnvironment = process.env
): boolean {
  if (String(env.NODE_ENV || "").toLowerCase() === "production") return false;
  const enabled = ["1", "true"].includes(
    String(env.RIYP_ALLOW_TEST_ANONYMOUS_ACCESS_FALLBACK || "").toLowerCase()
  );
  const mockProvider = ["1", "true"].includes(
    String(env.USE_MOCK_OPENAI || "").toLowerCase()
  );
  const localUrl = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/i.test(
    String(env.NEXT_PUBLIC_APP_URL || "")
  );
  return enabled && mockProvider && localUrl;
}
